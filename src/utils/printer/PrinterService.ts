import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperSize, StorePrintInfo, buildBillEscPos, buildBillHtml, buildTestSlipEscPos } from './EscPosBuilder';
import { BillItem } from '@app/types';

const { PrinterModule } = NativeModules;

export interface BluetoothDevice {
  name: string;
  address: string;
}

export interface WifiPrinterDevice {
  ip: string;
  port: number;
  name: string;
}

export interface WifiNetworkInfo {
  isWifiConnected: boolean;
  ipAddress?: string | null;
  subnet?: string | null;
  gateway?: string | null;
  ssid?: string | null;
}

export interface PrinterConfig {
  type: 'bluetooth' | 'wifi' | 'none';
  bluetoothDevice?: BluetoothDevice | null;
  wifiHost?: string;
  wifiPort?: number;
  paperSize: PaperSize;
  autoConnectWifi?: boolean;
}

export interface ConnectionStatus {
  bluetoothConnected: boolean;
  bluetoothDeviceName?: string | null;
  bluetoothAddress?: string | null;
  wifiConnected: boolean;
  wifiHost?: string | null;
  wifiPort?: number;
  hasActiveConnection: boolean;
}

const STORAGE_KEY_PRINTER_CONFIG = '@redcat_printer_config';

class PrinterService {
  private config: PrinterConfig = {
    type: 'none',
    bluetoothDevice: null,
    wifiHost: '192.168.1.100',
    wifiPort: 9100,
    paperSize: '58mm',
    autoConnectWifi: true,
  };

  constructor() {
    this.loadSavedConfig();
  }

  async loadSavedConfig(): Promise<PrinterConfig> {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_PRINTER_CONFIG);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load saved printer configuration', e);
    }
    return this.config;
  }

  async saveConfig(newConfig: Partial<PrinterConfig>): Promise<PrinterConfig> {
    this.config = { ...this.config, ...newConfig };
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PRINTER_CONFIG, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save printer configuration', e);
    }
    return this.config;
  }

  getConfig(): PrinterConfig {
    return this.config;
  }

  /**
   * Request Bluetooth permissions for Android 12+ and older Android versions
   */
  async requestBluetoothPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        ]);

        return (
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Bluetooth Location Permission',
            message: 'Redcat Billing requires location permission to discover nearby Bluetooth printers.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }

  /**
   * Get list of paired Bluetooth devices
   */
  async getPairedBluetoothDevices(): Promise<BluetoothDevice[]> {
    if (!PrinterModule) {
      throw new Error('PrinterModule is not available on this device');
    }

    const hasPermission = await this.requestBluetoothPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions are required to view paired devices.');
    }

    return await PrinterModule.getPairedDevices();
  }

  /**
   * Connect to a Bluetooth printer by MAC address
   */
  async connectBluetooth(address: string, name?: string): Promise<any> {
    if (!PrinterModule) {
      throw new Error('PrinterModule is not available');
    }

    const hasPermission = await this.requestBluetoothPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions are required to connect.');
    }

    const result = await PrinterModule.connectBluetooth(address);
    await this.saveConfig({
      type: 'bluetooth',
      bluetoothDevice: {
        name: name || result.deviceName || 'Bluetooth Printer',
        address,
      },
    });

    return result;
  }

  /**
   * Disconnect Bluetooth printer
   */
  async disconnectBluetooth(): Promise<any> {
    if (!PrinterModule) return;
    return await PrinterModule.disconnectBluetooth();
  }

  /**
   * Get current Wi-Fi network information (IP, Subnet, SSID)
   */
  async getWifiNetworkInfo(): Promise<WifiNetworkInfo> {
    if (!PrinterModule?.getWifiNetworkInfo) {
      return { isWifiConnected: false };
    }
    return await PrinterModule.getWifiNetworkInfo();
  }

  /**
   * Automatically scan the local Wi-Fi subnet for ESC/POS printers on port 9100
   */
  async scanWifiPrinters(): Promise<WifiPrinterDevice[]> {
    if (!PrinterModule?.scanWifiPrinters) {
      throw new Error('Wi-Fi printer scanning is not available on this device');
    }
    return await PrinterModule.scanWifiPrinters();
  }

  /**
   * Automatically discover and connect to a Wi-Fi printer without typing IP/port
   */
  async autoConnectWifiPrinter(): Promise<any> {
    if (!PrinterModule?.autoConnectWifiPrinter) {
      throw new Error('Wi-Fi printer auto-connect is not available');
    }
    const savedHost = this.config.wifiHost || '';
    const result = await PrinterModule.autoConnectWifiPrinter(savedHost);
    if (result?.host) {
      await this.saveConfig({
        type: 'wifi',
        wifiHost: result.host,
        wifiPort: result.port || 9100,
      });
    }
    return result;
  }

  /**
   * Connect to a Wi-Fi / Network ESC/POS printer via TCP Socket
   */
  async connectWifi(host: string, port: number = 9100): Promise<any> {
    if (!PrinterModule) {
      throw new Error('PrinterModule is not available');
    }

    const cleanHost = host.trim();
    if (!cleanHost) {
      throw new Error('Wi-Fi printer IP address cannot be empty');
    }

    const result = await PrinterModule.connectWifi(cleanHost, port || 9100);
    await this.saveConfig({
      type: 'wifi',
      wifiHost: cleanHost,
      wifiPort: port || 9100,
    });

    return result;
  }

  /**
   * Disconnect Wi-Fi printer
   */
  async disconnectWifi(): Promise<any> {
    if (!PrinterModule) return;
    return await PrinterModule.disconnectWifi();
  }

  /**
   * Get active connection status
   */
  async getConnectionStatus(): Promise<ConnectionStatus> {
    if (!PrinterModule) {
      return {
        bluetoothConnected: false,
        wifiConnected: false,
        hasActiveConnection: false,
      };
    }
    return await PrinterModule.getConnectionStatus();
  }

  /**
   * Print raw ESC/POS Base64 command stream
   */
  async printEscPos(base64Data: string): Promise<any> {
    if (!PrinterModule) {
      throw new Error('PrinterModule is not available');
    }
    return await PrinterModule.printEscPos(base64Data);
  }

  /**
   * Print using Android System Print Manager (for Wi-Fi / Mopria / Cloud printers or PDF export)
   */
  async printSystemDocument(html: string, jobName: string = 'Bill Receipt'): Promise<any> {
    if (!PrinterModule) {
      throw new Error('PrinterModule is not available');
    }
    return await PrinterModule.printSystemDocument(html, jobName);
  }

  /**
   * Print a BillItem to the connected Bluetooth or Wi-Fi printer.
   * If not connected, automatically connects to printer via Wi-Fi network and prints directly!
   */
  async printBill(
    bill: BillItem,
    storeInfo: StorePrintInfo,
    paperSizeOverride?: PaperSize
  ): Promise<any> {
    const status = await this.getConnectionStatus();
    const paperSize = paperSizeOverride || this.config.paperSize || '58mm';

    if (!status.hasActiveConnection) {
      if (this.config.type === 'bluetooth' && this.config.bluetoothDevice?.address) {
        try {
          await this.connectBluetooth(
            this.config.bluetoothDevice.address,
            this.config.bluetoothDevice.name
          );
        } catch (_btErr) {
          throw new Error('NO_PRINTER_CONNECTED');
        }
      } else if (this.config.wifiHost) {
        try {
          await this.connectWifi(this.config.wifiHost, this.config.wifiPort || 9100);
        } catch {
          throw new Error('NO_PRINTER_CONNECTED');
        }
      } else {
        throw new Error('NO_PRINTER_CONNECTED');
      }
    }

    const base64Data = buildBillEscPos(bill, storeInfo, paperSize);
    return await this.printEscPos(base64Data);
  }

  /**
   * Print a sample hardware test receipt
   */
  async printTestSlip(paperSizeOverride?: PaperSize): Promise<any> {
    const status = await this.getConnectionStatus();
    const paperSize = paperSizeOverride || this.config.paperSize || '58mm';

    if (!status.hasActiveConnection) {
      throw new Error('Please connect to a Bluetooth or Wi-Fi printer first.');
    }

    const base64Data = buildTestSlipEscPos(paperSize);
    return await this.printEscPos(base64Data);
  }
}

export const printerService = new PrinterService();
export default printerService;
