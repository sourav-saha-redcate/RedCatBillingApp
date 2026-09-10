package com.redcatbillingapp.printer

import android.Manifest
import android.app.Activity
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
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
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.File
import java.io.FileOutputStream
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

    private fun getStringSafe(map: ReadableMap?, key: String, defaultVal: String = ""): String {
        return if (map != null && map.hasKey(key) && !map.isNull(key)) {
            map.getString(key) ?: defaultVal
        } else {
            defaultVal
        }
    }

    private fun getDoubleSafe(map: ReadableMap?, key: String, defaultVal: Double = 0.0): Double {
        return if (map != null && map.hasKey(key) && !map.isNull(key)) {
            try {
                map.getDouble(key)
            } catch (e: Exception) {
                try {
                    map.getInt(key).toDouble()
                } catch (e2: Exception) {
                    defaultVal
                }
            }
        } else {
            defaultVal
        }
    }

    @ReactMethod
    fun generateBillPdf(bill: ReadableMap, store: ReadableMap, promise: Promise) {
        executor.execute {
            try {
                val billNumber = getStringSafe(bill, "billNumber", "BILL-001")
                val customerName = getStringSafe(bill, "customerName", "Valued Customer")
                val customerPhone = getStringSafe(bill, "phone", "")
                val date = getStringSafe(bill, "date", "")
                val time = getStringSafe(bill, "time", "")
                val paymentMethod = getStringSafe(bill, "paymentMethod", "Cash")
                val status = getStringSafe(bill, "status", "PAID")
                val staff = getStringSafe(bill, "staff", "Cashier")
                val subtotal = getDoubleSafe(bill, "subtotal", 0.0)
                val gst = getDoubleSafe(bill, "gst", 0.0)
                val grandTotal = getDoubleSafe(bill, "grandTotal", 0.0)

                val storeName = getStringSafe(store, "storeName", "REDCAT BILLING")
                val storeAddress = getStringSafe(store, "storeAddress", "")
                val storePhone = getStringSafe(store, "storePhone", "")
                val gstin = getStringSafe(store, "gstin", "")
                val googleReviewLink = getStringSafe(store, "googleReviewLink", "")

                val itemsArray = if (bill.hasKey("items") && !bill.isNull("items")) bill.getArray("items") else null
                val itemCount = itemsArray?.size() ?: 0

                val pageWidth = 595
                val estimatedHeight = 360 + (itemCount * 22) + (if (googleReviewLink.trim().isNotEmpty()) 60 else 0)
                val pageHeight = if (estimatedHeight > 842) estimatedHeight else 842

                val document = PdfDocument()
                val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
                val page = document.startPage(pageInfo)
                val canvas = page.canvas

                // Background
                val paint = Paint()
                paint.color = Color.WHITE
                canvas.drawRect(0f, 0f, pageWidth.toFloat(), pageHeight.toFloat(), paint)

                // Top Accent Bar
                paint.color = Color.rgb(37, 99, 235) // Blue 600
                canvas.drawRect(0f, 0f, pageWidth.toFloat(), 6f, paint)

                val textPaint = Paint().apply {
                    isAntiAlias = true
                    color = Color.rgb(15, 23, 42) // Slate 900
                }

                var currentY = 38f

                // Store Name (Header)
                textPaint.textSize = 20f
                textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textPaint.textAlign = Paint.Align.CENTER
                canvas.drawText(storeName, pageWidth / 2f, currentY, textPaint)
                currentY += 18f

                // Store address & phone
                textPaint.textSize = 10f
                textPaint.typeface = Typeface.DEFAULT
                textPaint.color = Color.rgb(100, 116, 139) // Slate 500
                if (storeAddress.isNotEmpty()) {
                    canvas.drawText(storeAddress, pageWidth / 2f, currentY, textPaint)
                    currentY += 14f
                }
                val contactLine = StringBuilder()
                if (storePhone.isNotEmpty()) contactLine.append("Tel: ").append(storePhone)
                if (gstin.isNotEmpty()) {
                    if (contactLine.isNotEmpty()) contactLine.append("  |  ")
                    contactLine.append("GSTIN: ").append(gstin)
                }
                if (contactLine.isNotEmpty()) {
                    canvas.drawText(contactLine.toString(), pageWidth / 2f, currentY, textPaint)
                    currentY += 16f
                }

                // Divider
                paint.color = Color.rgb(226, 232, 240) // Slate 200
                paint.strokeWidth = 1.2f
                canvas.drawLine(40f, currentY, pageWidth - 40f, currentY, paint)
                currentY += 20f

                // Metadata Section (Left & Right)
                // Left Column
                textPaint.textAlign = Paint.Align.LEFT
                textPaint.textSize = 11f
                textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textPaint.color = Color.rgb(15, 23, 42)
                canvas.drawText("TAX INVOICE: $billNumber", 45f, currentY, textPaint)

                // Right Column
                val rightColX = 340f
                canvas.drawText("BILLED TO", rightColX, currentY, textPaint)
                currentY += 15f

                textPaint.textSize = 10f
                textPaint.typeface = Typeface.DEFAULT
                textPaint.color = Color.rgb(71, 85, 105)

                canvas.drawText("Date: $date $time", 45f, currentY, textPaint)
                canvas.drawText("Customer: $customerName", rightColX, currentY, textPaint)
                currentY += 14f

                canvas.drawText("Payment: $paymentMethod ($status)", 45f, currentY, textPaint)
                if (customerPhone.isNotEmpty()) {
                    canvas.drawText("Phone: $customerPhone", rightColX, currentY, textPaint)
                }
                currentY += 14f

                if (staff.isNotEmpty()) {
                    canvas.drawText("Cashier / Staff: $staff", 45f, currentY, textPaint)
                }
                currentY += 18f

                // Table Header
                paint.color = Color.rgb(241, 245, 249) // Slate 100
                val headerBox = RectF(40f, currentY - 12f, pageWidth - 40f, currentY + 14f)
                canvas.drawRoundRect(headerBox, 4f, 4f, paint)

                textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textPaint.textSize = 10f
                textPaint.color = Color.rgb(71, 85, 105)
                textPaint.textAlign = Paint.Align.LEFT
                canvas.drawText("ITEM DESCRIPTION", 55f, currentY + 4f, textPaint)

                textPaint.textAlign = Paint.Align.CENTER
                canvas.drawText("QTY", 340f, currentY + 4f, textPaint)

                textPaint.textAlign = Paint.Align.RIGHT
                canvas.drawText("RATE", 430f, currentY + 4f, textPaint)
                canvas.drawText("AMOUNT", pageWidth - 55f, currentY + 4f, textPaint)

                currentY += 26f

                // Table Rows
                textPaint.typeface = Typeface.DEFAULT
                textPaint.textSize = 10f
                textPaint.color = Color.rgb(15, 23, 42)

                for (i in 0 until itemCount) {
                    val item = itemsArray?.getMap(i) ?: continue
                    val itemName = getStringSafe(item, "name", "Item")
                    val itemQty = getDoubleSafe(item, "qty", 1.0)
                    val itemPrice = getDoubleSafe(item, "price", 0.0)
                    val itemTotal = itemQty * itemPrice

                    textPaint.textAlign = Paint.Align.LEFT
                    val maxNameLen = 36
                    val displayName = if (itemName.length > maxNameLen) itemName.substring(0, maxNameLen) + "..." else itemName
                    canvas.drawText(displayName, 55f, currentY, textPaint)

                    textPaint.textAlign = Paint.Align.CENTER
                    val qtyStr = if (itemQty % 1.0 == 0.0) "${itemQty.toInt()}" else String.format(java.util.Locale.US, "%.1f", itemQty)
                    canvas.drawText(qtyStr, 340f, currentY, textPaint)

                    textPaint.textAlign = Paint.Align.RIGHT
                    canvas.drawText(String.format(java.util.Locale.US, "₹%.2f", itemPrice), 430f, currentY, textPaint)
                    canvas.drawText(String.format(java.util.Locale.US, "₹%.2f", itemTotal), pageWidth - 55f, currentY, textPaint)

                    paint.color = Color.rgb(241, 245, 249)
                    paint.strokeWidth = 1f
                    canvas.drawLine(45f, currentY + 6f, pageWidth - 45f, currentY + 6f, paint)

                    currentY += 20f
                }

                currentY += 12f

                // Summary Totals
                val summaryLabelX = 380f
                val summaryValX = pageWidth - 55f

                textPaint.textAlign = Paint.Align.RIGHT
                textPaint.textSize = 10f
                textPaint.color = Color.rgb(100, 116, 139)

                canvas.drawText("Subtotal:", summaryLabelX, currentY, textPaint)
                textPaint.color = Color.rgb(15, 23, 42)
                canvas.drawText(String.format(java.util.Locale.US, "₹%.2f", subtotal), summaryValX, currentY, textPaint)
                currentY += 16f

                textPaint.color = Color.rgb(100, 116, 139)
                canvas.drawText("GST (Tax):", summaryLabelX, currentY, textPaint)
                textPaint.color = Color.rgb(15, 23, 42)
                canvas.drawText(String.format(java.util.Locale.US, "₹%.2f", gst), summaryValX, currentY, textPaint)
                currentY += 16f

                // Grand Total Highlight
                val grandTotalBox = RectF(summaryLabelX - 50f, currentY - 14f, pageWidth - 45f, currentY + 16f)
                paint.color = Color.rgb(241, 245, 249)
                canvas.drawRoundRect(grandTotalBox, 4f, 4f, paint)

                textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textPaint.textSize = 13f
                textPaint.color = Color.rgb(15, 23, 42)
                canvas.drawText("Grand Total:", summaryLabelX, currentY + 5f, textPaint)
                textPaint.color = Color.rgb(37, 99, 235)
                canvas.drawText(String.format(java.util.Locale.US, "₹%.2f", grandTotal), summaryValX, currentY + 5f, textPaint)
                currentY += 34f

                // Footer
                paint.color = Color.rgb(226, 232, 240)
                paint.strokeWidth = 1.2f
                canvas.drawLine(40f, currentY, pageWidth - 40f, currentY, paint)
                currentY += 20f

                textPaint.textAlign = Paint.Align.CENTER
                textPaint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                textPaint.textSize = 11f
                textPaint.color = Color.rgb(15, 23, 42)
                canvas.drawText("Thank you for visiting $storeName! 🙏", pageWidth / 2f, currentY, textPaint)
                currentY += 15f

                if (googleReviewLink.trim().isNotEmpty()) {
                    textPaint.typeface = Typeface.DEFAULT
                    textPaint.textSize = 9f
                    textPaint.color = Color.rgb(100, 116, 139)
                    canvas.drawText("We'd love to hear your feedback. Please rate us on Google:", pageWidth / 2f, currentY, textPaint)
                    currentY += 13f

                    textPaint.color = Color.rgb(37, 99, 235)
                    canvas.drawText(googleReviewLink.trim(), pageWidth / 2f, currentY, textPaint)
                    currentY += 15f
                }

                textPaint.typeface = Typeface.DEFAULT
                textPaint.textSize = 9f
                textPaint.color = Color.rgb(148, 163, 184)
                canvas.drawText("Thank you for your support!", pageWidth / 2f, currentY, textPaint)

                document.finishPage(page)

                // Save PDF to cache
                val cleanBillNo = billNumber.replace(Regex("[^a-zA-Z0-9_-]"), "_")
                val file = File(reactApplicationContext.cacheDir, "Bill_${cleanBillNo}.pdf")
                val outputStream = FileOutputStream(file)
                document.writeTo(outputStream)
                document.close()
                outputStream.flush()
                outputStream.close()

                val authority = "${reactApplicationContext.packageName}.fileprovider"
                val contentUri = FileProvider.getUriForFile(reactApplicationContext, authority, file)

                val result = Arguments.createMap()
                result.putBoolean("success", true)
                result.putString("filePath", file.absolutePath)
                result.putString("uri", contentUri.toString())
                result.putString("fileName", file.name)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("PDF_GENERATE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun sharePdfToWhatsApp(filePath: String, phone: String, message: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val file = File(filePath)
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "PDF file not found at: $filePath")
                    return@runOnUiThread
                }

                val authority = "${reactApplicationContext.packageName}.fileprovider"
                val contentUri = FileProvider.getUriForFile(reactApplicationContext, authority, file)

                val cleanPhone = phone.replace(Regex("[^0-9]"), "")
                val formattedPhone = if (cleanPhone.length == 10) "91$cleanPhone" else cleanPhone

                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, contentUri)
                    if (message.isNotEmpty()) {
                        putExtra(Intent.EXTRA_TEXT, message)
                    }
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }

                // Grant URI permissions explicitly to potential WhatsApp packages
                reactApplicationContext.grantUriPermission("com.whatsapp", contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
                reactApplicationContext.grantUriPermission("com.whatsapp.w4b", contentUri, Intent.FLAG_GRANT_READ_URI_PERMISSION)

                val pm = reactApplicationContext.packageManager
                val isStandardInstalled = try {
                    pm.getPackageInfo("com.whatsapp", 0)
                    true
                } catch (e: Exception) {
                    false
                }

                val isBusinessInstalled = try {
                    pm.getPackageInfo("com.whatsapp.w4b", 0)
                    true
                } catch (e: Exception) {
                    false
                }

                val targetPkg = when {
                    isStandardInstalled -> "com.whatsapp"
                    isBusinessInstalled -> "com.whatsapp.w4b"
                    else -> null
                }

                if (targetPkg != null) {
                    intent.setPackage(targetPkg)
                    if (formattedPhone.isNotEmpty()) {
                        intent.putExtra("jid", "${formattedPhone}@s.whatsapp.net")
                    }
                    val currentAct = reactApplicationContext.currentActivity
                    if (currentAct != null) {
                        currentAct.startActivity(intent)
                    } else {
                        reactApplicationContext.startActivity(intent)
                    }
                    promise.resolve(true)
                } else {
                    val chooser = Intent.createChooser(intent, "Share Bill via WhatsApp").apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    val currentAct = reactApplicationContext.currentActivity
                    if (currentAct != null) {
                        currentAct.startActivity(chooser)
                    } else {
                        reactApplicationContext.startActivity(chooser)
                    }
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                promise.reject("WHATSAPP_SHARE_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun sharePdfGeneral(filePath: String, title: String, message: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val file = File(filePath)
                if (!file.exists()) {
                    promise.reject("FILE_NOT_FOUND", "PDF file not found at: $filePath")
                    return@runOnUiThread
                }

                val authority = "${reactApplicationContext.packageName}.fileprovider"
                val contentUri = FileProvider.getUriForFile(reactApplicationContext, authority, file)

                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, contentUri)
                    if (message.isNotEmpty()) {
                        putExtra(Intent.EXTRA_TEXT, message)
                    }
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }

                val chooser = Intent.createChooser(intent, if (title.isNotEmpty()) title else "Share Bill").apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }

                val currentAct = reactApplicationContext.currentActivity
                if (currentAct != null) {
                    currentAct.startActivity(chooser)
                } else {
                    reactApplicationContext.startActivity(chooser)
                }
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("GENERAL_SHARE_ERROR", e.message, e)
            }
        }
    }
}
