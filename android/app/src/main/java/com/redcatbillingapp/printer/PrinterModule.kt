package com.redcatbillingapp.printer

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.Build
import android.print.PrintAttributes
import android.print.PrintManager
import android.util.Base64
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.OutputStream
import java.net.Inet4Address
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.Socket
import java.util.Collections
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class PrinterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newCachedThreadPool()
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    private var activeBluetoothSocket: BluetoothSocket? = null
    private var connectedBluetoothDeviceName: String? = null
    private var connectedBluetoothAddress: String? = null

    private var activeWifiSocket: Socket? = null
    private var connectedWifiHost: String? = null
    private var connectedWifiPort: Int? = null

    override fun getName(): String = "PrinterModule"

    private fun getBluetoothAdapter(): BluetoothAdapter? {
        val bluetoothManager = reactApplicationContext.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
        return bluetoothManager?.adapter ?: BluetoothAdapter.getDefaultAdapter()
    }

    private fun hasBluetoothPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.BLUETOOTH_CONNECT
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(
                reactApplicationContext,
                Manifest.permission.BLUETOOTH
            ) == PackageManager.PERMISSION_GRANTED
        }
    }

    @ReactMethod
    fun getPairedDevices(promise: Promise) {
        try {
            val adapter = getBluetoothAdapter()
            if (adapter == null) {
                promise.reject("BLUETOOTH_NOT_SUPPORTED", "Bluetooth is not supported on this device")
                return
            }

            if (!adapter.isEnabled) {
                promise.reject("BLUETOOTH_DISABLED", "Bluetooth is turned off")
                return
            }

            if (!hasBluetoothPermission()) {
                promise.reject("PERMISSION_DENIED", "Bluetooth permission not granted")
                return
            }

            val pairedDevices: Set<BluetoothDevice>? = adapter.bondedDevices
            val deviceList: WritableArray = Arguments.createArray()

            pairedDevices?.forEach { device ->
                val map: WritableMap = Arguments.createMap()
                map.putString("name", device.name ?: "Unknown Printer")
                map.putString("address", device.address)
                deviceList.pushMap(map)
            }

            promise.resolve(deviceList)
        } catch (e: SecurityException) {
            promise.reject("SECURITY_EXCEPTION", "Bluetooth permission missing: ${e.message}")
        } catch (e: Exception) {
            promise.reject("ERROR_GET_DEVICES", e.message, e)
        }
    }

    @ReactMethod
    fun connectBluetooth(address: String, promise: Promise) {
        executor.execute {
            try {
                val adapter = getBluetoothAdapter()
                if (adapter == null || !adapter.isEnabled) {
                    promise.reject("BLUETOOTH_DISABLED", "Bluetooth is disabled or not supported")
                    return@execute
                }

                if (!hasBluetoothPermission()) {
                    promise.reject("PERMISSION_DENIED", "Bluetooth connect permission not granted")
                    return@execute
                }

                // Close existing connection
                disconnectBluetoothInternal()

                adapter.cancelDiscovery()
                val device = adapter.getRemoteDevice(address)

                var socket: BluetoothSocket? = null
                try {
                    socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
                    socket.connect()
                } catch (e: Exception) {
                    // Fallback for some POS devices
                    val fallbackMethod = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                    socket = fallbackMethod.invoke(device, 1) as BluetoothSocket
                    socket.connect()
                }

                activeBluetoothSocket = socket
                connectedBluetoothAddress = address
                connectedBluetoothDeviceName = try { device.name ?: address } catch (e: Exception) { address }

                val result = Arguments.createMap()
                result.putBoolean("success", true)
                result.putString("deviceName", connectedBluetoothDeviceName)
                result.putString("address", address)
                promise.resolve(result)
            } catch (e: Exception) {
                disconnectBluetoothInternal()
                promise.reject("CONNECT_FAILED", "Failed to connect to Bluetooth printer: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun disconnectBluetooth(promise: Promise) {
        executor.execute {
            try {
                disconnectBluetoothInternal()
                val result = Arguments.createMap()
                result.putBoolean("success", true)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("DISCONNECT_ERROR", e.message, e)
            }
        }
    }

    private fun disconnectBluetoothInternal() {
        try {
            activeBluetoothSocket?.close()
        } catch (_: Exception) {}
        activeBluetoothSocket = null
        connectedBluetoothAddress = null
        connectedBluetoothDeviceName = null
    }

    private fun getLocalDeviceIp(): String? {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces() ?: return null
            var candidateIp: String? = null
            while (interfaces.hasMoreElements()) {
                val netIf = interfaces.nextElement()
                if (netIf.isLoopback || !netIf.isUp) continue
                val name = netIf.name.lowercase()
                val isWifiOrLan = name.contains("wlan") || name.contains("eth") || name.contains("ap") || name.contains("rndis")
                val addrs = netIf.inetAddresses
                while (addrs.hasMoreElements()) {
                    val addr = addrs.nextElement()
                    if (!addr.isLoopbackAddress && addr is Inet4Address) {
                        val host = addr.hostAddress ?: continue
                        if (!host.startsWith("127.")) {
                            if (isWifiOrLan) {
                                return host
                            } else if (candidateIp == null) {
                                candidateIp = host
                            }
                        }
                    }
                }
            }
            return candidateIp
        } catch (_: Exception) {
            return null
        }
    }

    private fun getWifiNetwork(): android.net.Network? {
        val cm = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val activeNet = cm.activeNetwork
            if (activeNet != null) {
                val caps = cm.getNetworkCapabilities(activeNet)
                if (caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))) {
                    return activeNet
                }
            }
            for (network in cm.allNetworks) {
                val caps = cm.getNetworkCapabilities(network)
                if (caps != null && (caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) || caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))) {
                    return network
                }
            }
        }
        return null
    }

    private fun intToIp(ipInt: Int): String? {
        if (ipInt == 0) return null
        return String.format(
            java.util.Locale.US,
            "%d.%d.%d.%d",
            ipInt and 0xff,
            ipInt shr 8 and 0xff,
            ipInt shr 16 and 0xff,
            ipInt shr 24 and 0xff
        )
    }

    private fun getGatewayOrDhcpIp(): String? {
        try {
            val cm = reactApplicationContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            val wifiNet = getWifiNetwork()
            if (cm != null && wifiNet != null) {
                val linkProps = cm.getLinkProperties(wifiNet)
                if (linkProps != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        val dhcpServer = linkProps.dhcpServerAddress?.hostAddress
                        if (!dhcpServer.isNullOrBlank() && dhcpServer != "0.0.0.0") {
                            return dhcpServer
                        }
                    }
                    for (route in linkProps.routes) {
                        val gw = route.gateway?.hostAddress
                        if (!gw.isNullOrBlank() && gw != "0.0.0.0") {
                            return gw
                        }
                    }
                }
            }
        } catch (_: Exception) {}

        try {
            val wifiManager = reactApplicationContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            val dhcp = wifiManager?.dhcpInfo
            if (dhcp != null) {
                val gateway = intToIp(dhcp.gateway)
                if (!gateway.isNullOrBlank() && gateway != "0.0.0.0") {
                    return gateway
                }
                val server = intToIp(dhcp.serverAddress)
                if (!server.isNullOrBlank() && server != "0.0.0.0") {
                    return server
                }
            }
        } catch (_: Exception) {}

        try {
            val localIp = getLocalDeviceIp()
            if (!localIp.isNullOrBlank() && localIp.contains(".")) {
                val lastDot = localIp.lastIndexOf('.')
                return localIp.substring(0, lastDot + 1) + "1"
            }
        } catch (_: Exception) {}

        return null
    }

    private fun connectWifiInternalSync(host: String, port: Int): Boolean {
        return try {
            disconnectWifiInternal()
            val socket = Socket()
            val wifiNet = getWifiNetwork()
            if (wifiNet != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                try {
                    wifiNet.bindSocket(socket)
                } catch (_: Exception) {}
            }
            val targetPort = if (port > 0) port else 9100
            val socketAddress = InetSocketAddress(host, targetPort)
            socket.connect(socketAddress, 3000)
            socket.soTimeout = 8000

            activeWifiSocket = socket
            connectedWifiHost = host
            connectedWifiPort = targetPort
            true
        } catch (_: Exception) {
            disconnectWifiInternal()
            false
        }
    }

    @ReactMethod
    fun getWifiNetworkInfo(promise: Promise) {
        executor.execute {
            try {
                val ip = getLocalDeviceIp()
                val isConnected = ip != null
                val gateway = getGatewayOrDhcpIp()

                var ssid: String? = null
                try {
                    val wifiManager = reactApplicationContext.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
                    val info = wifiManager?.connectionInfo
                    if (info != null && info.ssid != null && info.ssid != "<unknown ssid>") {
                        ssid = info.ssid.replace("\"", "")
                    }
                } catch (_: Exception) {}

                var subnet: String? = null
                if (ip != null && ip.contains(".")) {
                    val lastDot = ip.lastIndexOf('.')
                    subnet = ip.substring(0, lastDot + 1) + "x"
                }

                val result = Arguments.createMap()
                result.putBoolean("isWifiConnected", isConnected)
                result.putString("ipAddress", ip)
                result.putString("subnet", subnet)
                result.putString("gateway", gateway)
                result.putString("ssid", ssid)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("WIFI_INFO_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun scanWifiPrinters(promise: Promise) {
        executor.execute {
            try {
                val localIp = getLocalDeviceIp()
                if (localIp == null || !localIp.contains(".")) {
                    promise.reject("NO_WIFI", "Phone is not connected to Wi-Fi. Please connect to a Wi-Fi network.")
                    return@execute
                }

                val lastDot = localIp.lastIndexOf('.')
                val subnetPrefix = localIp.substring(0, lastDot + 1)
                val myHostNum = localIp.substring(lastDot + 1).toIntOrNull() ?: -1

                val wifiNet = getWifiNetwork()
                val foundPrinters = Collections.synchronizedList(ArrayList<WritableMap>())
                val seenIps = Collections.synchronizedSet(HashSet<String>())

                // Check gateway / DHCP server IP first (direct printer AP)
                val gatewayIp = getGatewayOrDhcpIp()
                if (!gatewayIp.isNullOrBlank()) {
                    try {
                        val socket = Socket()
                        if (wifiNet != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            try { wifiNet.bindSocket(socket) } catch (_: Exception) {}
                        }
                        socket.connect(InetSocketAddress(gatewayIp, 9100), 400)
                        socket.close()

                        seenIps.add(gatewayIp)
                        val item = Arguments.createMap()
                        item.putString("ip", gatewayIp)
                        item.putInt("port", 9100)
                        item.putString("name", "Wi-Fi Printer ($gatewayIp)")
                        foundPrinters.add(item)
                    } catch (_: Exception) {}
                }

                // Order IPs to scan: common printer static IPs first, then the rest
                val priorityList = listOf(1, 100, 200, 87, 150, 254, 2, 10, 11, 20, 50, 80, 90, 101, 102)
                val allHostNums = LinkedHashSet<Int>()
                for (p in priorityList) {
                    if (p != myHostNum && p in 1..254) allHostNums.add(p)
                }
                for (i in 1..254) {
                    if (i != myHostNum) allHostNums.add(i)
                }

                val scanPool = Executors.newFixedThreadPool(45)
                val latch = CountDownLatch(allHostNums.size)

                for (num in allHostNums) {
                    val targetIp = "$subnetPrefix$num"
                    if (seenIps.contains(targetIp)) {
                        latch.countDown()
                        continue
                    }

                    scanPool.execute {
                        try {
                            val socket = Socket()
                            if (wifiNet != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                try { wifiNet.bindSocket(socket) } catch (_: Exception) {}
                            }
                            socket.connect(InetSocketAddress(targetIp, 9100), 400)
                            socket.close()

                            if (seenIps.add(targetIp)) {
                                val item = Arguments.createMap()
                                item.putString("ip", targetIp)
                                item.putInt("port", 9100)
                                item.putString("name", "Wi-Fi ESC/POS Printer ($targetIp)")
                                foundPrinters.add(item)
                            }
                        } catch (_: Exception) {
                        } finally {
                            latch.countDown()
                        }
                    }
                }

                latch.await(3800, TimeUnit.MILLISECONDS)
                scanPool.shutdownNow()

                val resultList = Arguments.createArray()
                for (p in foundPrinters) {
                    resultList.pushMap(p)
                }

                promise.resolve(resultList)
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun autoConnectWifiPrinter(savedHost: String?, promise: Promise) {
        executor.execute {
            try {
                // 1. Try saved host if given
                if (!savedHost.isNullOrBlank()) {
                    val cleanSaved = savedHost.trim()
                    if (connectWifiInternalSync(cleanSaved, 9100)) {
                        val result = Arguments.createMap()
                        result.putBoolean("success", true)
                        result.putString("host", cleanSaved)
                        result.putInt("port", 9100)
                        result.putString("name", "Wi-Fi Printer ($cleanSaved)")
                        result.putBoolean("isSaved", true)
                        promise.resolve(result)
                        return@execute
                    }
                }

                // 2. Try default gateway / DHCP server IP (direct printer Wi-Fi connection)
                val gatewayIp = getGatewayOrDhcpIp()
                if (!gatewayIp.isNullOrBlank()) {
                    if (connectWifiInternalSync(gatewayIp, 9100)) {
                        val result = Arguments.createMap()
                        result.putBoolean("success", true)
                        result.putString("host", gatewayIp)
                        result.putInt("port", 9100)
                        result.putString("name", "Wi-Fi Printer ($gatewayIp)")
                        promise.resolve(result)
                        return@execute
                    }
                }

                // 3. Discover on current Wi-Fi network subnet
                val localIp = getLocalDeviceIp()
                if (localIp == null || !localIp.contains(".")) {
                    promise.reject("NO_WIFI", "Phone is not connected to Wi-Fi. Please connect to your printer's Wi-Fi network first.")
                    return@execute
                }

                val lastDot = localIp.lastIndexOf('.')
                val subnetPrefix = localIp.substring(0, lastDot + 1)
                val myHostNum = localIp.substring(lastDot + 1).toIntOrNull() ?: -1

                val priorityList = listOf(1, 100, 200, 87, 150, 254, 2, 10, 11, 20, 50, 80, 90, 101, 102)
                val allHostNums = LinkedHashSet<Int>()
                for (p in priorityList) {
                    if (p != myHostNum && p in 1..254) allHostNums.add(p)
                }
                for (i in 1..254) {
                    if (i != myHostNum) allHostNums.add(i)
                }

                val scanPool = Executors.newFixedThreadPool(45)
                val connectedFlag = AtomicBoolean(false)
                var connectedTargetIp: String? = null
                val latch = CountDownLatch(allHostNums.size)
                val wifiNet = getWifiNetwork()

                for (num in allHostNums) {
                    val targetIp = "$subnetPrefix$num"
                    scanPool.execute {
                        try {
                            if (!connectedFlag.get()) {
                                val probeSocket = Socket()
                                if (wifiNet != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    try { wifiNet.bindSocket(probeSocket) } catch (_: Exception) {}
                                }
                                probeSocket.connect(InetSocketAddress(targetIp, 9100), 400)
                                probeSocket.close()

                                if (connectedFlag.compareAndSet(false, true)) {
                                    if (connectWifiInternalSync(targetIp, 9100)) {
                                        connectedTargetIp = targetIp
                                    } else {
                                        connectedFlag.set(false)
                                    }
                                }
                            }
                        } catch (_: Exception) {
                        } finally {
                            latch.countDown()
                        }
                    }
                }

                var waitCount = 0
                while (waitCount < 40 && !connectedFlag.get()) {
                    Thread.sleep(100)
                    waitCount++
                }
                scanPool.shutdownNow()

                if (connectedFlag.get() && connectedTargetIp != null) {
                    val result = Arguments.createMap()
                    result.putBoolean("success", true)
                    result.putString("host", connectedTargetIp)
                    result.putInt("port", 9100)
                    result.putString("name", "Wi-Fi Printer ($connectedTargetIp)")
                    promise.resolve(result)
                } else {
                    promise.reject("NO_PRINTER_FOUND", "No Wi-Fi printer found on network ($subnetPrefix*). Ensure printer is on and phone is connected to its Wi-Fi.")
                }
            } catch (e: Exception) {
                promise.reject("AUTO_CONNECT_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun connectWifi(host: String, port: Int, promise: Promise) {
        executor.execute {
            val targetPort = if (port > 0) port else 9100
            val success = connectWifiInternalSync(host.trim(), targetPort)
            if (success) {
                val result = Arguments.createMap()
                result.putBoolean("success", true)
                result.putString("host", host.trim())
                result.putInt("port", targetPort)
                result.putString("deviceName", "Wi-Fi Printer (${host.trim()})")
                promise.resolve(result)
            } else {
                promise.reject("WIFI_CONNECT_FAILED", "Failed to connect to Wi-Fi printer ($host:$targetPort)")
            }
        }
    }

    @ReactMethod
    fun disconnectWifi(promise: Promise) {
        executor.execute {
            try {
                disconnectWifiInternal()
                val result = Arguments.createMap()
                result.putBoolean("success", true)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("DISCONNECT_ERROR", e.message, e)
            }
        }
    }

    private fun disconnectWifiInternal() {
        try {
            activeWifiSocket?.close()
        } catch (_: Exception) {}
        activeWifiSocket = null
        connectedWifiHost = null
        connectedWifiPort = null
    }

    @ReactMethod
    fun printEscPos(base64Data: String, promise: Promise) {
        executor.execute {
            try {
                val bytes = Base64.decode(base64Data, Base64.DEFAULT)

                var outStream: OutputStream? = null
                var connectionType = ""

                if (activeBluetoothSocket != null && activeBluetoothSocket!!.isConnected) {
                    outStream = activeBluetoothSocket!!.outputStream
                    connectionType = "Bluetooth"
                } else {
                    // If Wi-Fi socket is not active, attempt reconnect using last host or gateway
                    val hostToConnect = connectedWifiHost ?: getGatewayOrDhcpIp()
                    if (hostToConnect != null && (activeWifiSocket == null || !activeWifiSocket!!.isConnected || activeWifiSocket!!.isClosed)) {
                        connectWifiInternalSync(hostToConnect, connectedWifiPort ?: 9100)
                    }

                    if (activeWifiSocket != null && activeWifiSocket!!.isConnected && !activeWifiSocket!!.isClosed) {
                        outStream = activeWifiSocket!!.outputStream
                        connectionType = "Wi-Fi"
                    }
                }

                if (outStream == null) {
                    promise.reject("NOT_CONNECTED", "No active Bluetooth or Wi-Fi printer connection found. Please connect to a printer first.")
                    return@execute
                }

                try {
                    outStream!!.write(bytes)
                    outStream!!.flush()
                } catch (writeErr: Exception) {
                    // If write failed over Wi-Fi (e.g. printer timed out idle socket), reconnect and retry once
                    if (connectionType == "Wi-Fi") {
                        val retryHost = connectedWifiHost ?: getGatewayOrDhcpIp()
                        if (retryHost != null) {
                            disconnectWifiInternal()
                            if (connectWifiInternalSync(retryHost, connectedWifiPort ?: 9100)) {
                                val retryStream = activeWifiSocket?.outputStream
                                if (retryStream != null) {
                                    retryStream.write(bytes)
                                    retryStream.flush()
                                } else {
                                    throw writeErr
                                }
                            } else {
                                throw writeErr
                            }
                        } else {
                            throw writeErr
                        }
                    } else {
                        throw writeErr
                    }
                }

                val result = Arguments.createMap()
                result.putBoolean("success", true)
                result.putInt("bytesSent", bytes.size)
                result.putString("connectionType", connectionType)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("PRINT_ERROR", "Error sending data to printer: ${e.message}", e)
            }
        }
    }

    @ReactMethod
    fun printSystemDocument(htmlContent: String, jobName: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val activity: Activity? = reactApplicationContext.currentActivity
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "Current activity is null")
                    return@runOnUiThread
                }

                val printManager = activity.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                if (printManager == null) {
                    promise.reject("PRINT_NOT_SUPPORTED", "Android PrintManager not available")
                    return@runOnUiThread
                }

                val webView = WebView(reactApplicationContext)
                webView.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        try {
                            val printAdapter = webView.createPrintDocumentAdapter(jobName)
                            val builder = PrintAttributes.Builder()
                            builder.setColorMode(PrintAttributes.COLOR_MODE_MONOCHROME)
                            builder.setMediaSize(PrintAttributes.MediaSize.ISO_A4)

                            val printJob = printManager.print(
                                jobName,
                                printAdapter,
                                builder.build()
                            )

                            val result = Arguments.createMap()
                            result.putBoolean("success", true)
                            result.putString("jobName", jobName)
                            result.putBoolean("isStarted", printJob != null)
                            promise.resolve(result)
                        } catch (e: Exception) {
                            promise.reject("PRINT_JOB_ERROR", e.message, e)
                        }
                    }
                }

                webView.loadDataWithBaseURL(null, htmlContent, "text/html", "UTF-8", null)
            } catch (e: Exception) {
                promise.reject("PRINT_SYSTEM_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getConnectionStatus(promise: Promise) {
        try {
            val isBtConnected = activeBluetoothSocket != null && activeBluetoothSocket!!.isConnected
            val isWifiConnected = activeWifiSocket != null && activeWifiSocket!!.isConnected && !activeWifiSocket!!.isClosed

            val result = Arguments.createMap()
            result.putBoolean("bluetoothConnected", isBtConnected)
            result.putString("bluetoothDeviceName", if (isBtConnected) connectedBluetoothDeviceName else null)
            result.putString("bluetoothAddress", if (isBtConnected) connectedBluetoothAddress else null)

            result.putBoolean("wifiConnected", isWifiConnected)
            result.putString("wifiHost", if (isWifiConnected) connectedWifiHost else null)
            result.putInt("wifiPort", if (isWifiConnected && connectedWifiPort != null) connectedWifiPort!! else 0)

            result.putBoolean("hasActiveConnection", isBtConnected || isWifiConnected)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }
}
