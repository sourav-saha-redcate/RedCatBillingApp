import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import printerService, {
  BluetoothDevice,
  ConnectionStatus,
  WifiNetworkInfo,
  WifiPrinterDevice,
} from '@app/utils/printer/PrinterService';
import {
  PaperSize,
  StorePrintInfo,
  buildBillHtml,
} from '@app/utils/printer/EscPosBuilder';
import { BillItem } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';

interface PrinterModalProps {
  visible: boolean;
  onClose: () => void;
  bill?: BillItem;
  storeInfo?: StorePrintInfo;
  onPrintSuccess?: () => void;
}

type TabMode = 'bluetooth' | 'wifi' | 'system';

export const PrinterModal: React.FC<PrinterModalProps> = ({
  visible,
  onClose,
  bill,
  storeInfo = {
    storeName: 'RC BILLING CORP',
    storeAddress: '123 Business Avenue, Tech Park',
    storePhone: '+1 (555) 812-3456',
    gstin: '29AAAAA0000A1Z5',
  },
  onPrintSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('bluetooth');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    bluetoothConnected: false,
    wifiConnected: false,
    hasActiveConnection: false,
  });

  // Bluetooth state
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectingDevice, setConnectingDevice] = useState<string | null>(null);

  // Wi-Fi Auto-Discovery state
  const [wifiNetwork, setWifiNetwork] = useState<WifiNetworkInfo | null>(null);
  const [wifiPrinters, setWifiPrinters] = useState<WifiPrinterDevice[]>([]);
  const [scanningWifi, setScanningWifi] = useState(false);
  const [connectingWifiHost, setConnectingWifiHost] = useState<string | null>(null);
  const [showManualIp, setShowManualIp] = useState(false);
  const [wifiIp, setWifiIp] = useState('192.168.1.100');
  const [wifiPort, setWifiPort] = useState('9100');

  // Paper Size state
  const [paperSize, setPaperSize] = useState<PaperSize>('58mm');

  useEffect(() => {
    if (visible) {
      loadInitialState();
    }
  }, [visible]);

  const loadInitialState = async () => {
    try {
      const config = await printerService.loadSavedConfig();
      if (config.wifiHost) setWifiIp(config.wifiHost);
      if (config.wifiPort) setWifiPort(config.wifiPort.toString());
      setPaperSize(config.paperSize || '58mm');

      const netInfo: WifiNetworkInfo = await printerService.getWifiNetworkInfo().catch(() => ({ isWifiConnected: false }));
      setWifiNetwork(netInfo);
      if (!config.wifiHost && netInfo.gateway) {
        setWifiIp(netInfo.gateway);
      }

      const status = await checkStatus();

      // If connected via Wi-Fi or phone is on Wi-Fi without active Bluetooth, open Wi-Fi tab
      if (config.type === 'wifi' || (netInfo.isWifiConnected && !status?.bluetoothConnected)) {
        setActiveTab('wifi');
      } else if (activeTab === 'bluetooth') {
        scanBluetooth();
      }
    } catch (e) {
      console.warn('Init error', e);
    }
  };

  const checkStatus = async (): Promise<ConnectionStatus> => {
    try {
      const status = await printerService.getConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (e) {
      console.warn('Status check failed', e);
      return {
        bluetoothConnected: false,
        wifiConnected: false,
        hasActiveConnection: false,
      };
    }
  };

  const scanBluetooth = async () => {
    setLoading(true);
    try {
      const paired = await printerService.getPairedBluetoothDevices();
      setDevices(paired);
      await checkStatus();
      if (paired.length === 0) {
        showMessage('No paired Bluetooth printers found. Pair in Android Settings first.');
      }
    } catch (error: any) {
      showMessage(error?.message || 'Failed to scan Bluetooth devices');
    } finally {
      setLoading(false);
    }
  };

  const scanWifi = async () => {
    setScanningWifi(true);
    try {
      const net = await printerService.getWifiNetworkInfo().catch(() => ({ isWifiConnected: false }));
      setWifiNetwork(net);
      if (!net.isWifiConnected) {
        showMessage('Phone is not connected to Wi-Fi. Turn on Wi-Fi to detect printers.');
        return;
      }
      const list = await printerService.scanWifiPrinters();
      setWifiPrinters(list);
      await checkStatus();
      if (list.length === 0) {
        showMessage('No ESC/POS printers found on Wi-Fi subnet. Check printer power & network.');
      } else {
        showMessage(`Found ${list.length} Wi-Fi printer(s) on your network!`);
      }
    } catch (e: any) {
      showMessage(e?.message || 'Failed to scan Wi-Fi network');
    } finally {
      setScanningWifi(false);
    }
  };

  const handleAutoConnectWifi = async () => {
    setLoading(true);
    try {
      const result = await printerService.autoConnectWifiPrinter();
      if (result?.host) {
        setWifiIp(result.host);
      }
      showMessage(`Connected to ${result.name || result.host}! 🎉`);
      await checkStatus();
    } catch (e: any) {
      showMessage(e?.message || 'Could not auto-connect to Wi-Fi printer');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDiscoveredWifi = async (printer: WifiPrinterDevice) => {
    setConnectingWifiHost(printer.ip);
    try {
      await printerService.connectWifi(printer.ip, printer.port || 9100);
      showMessage(`Connected to ${printer.name}`);
      await checkStatus();
    } catch (e: any) {
      showMessage(e?.message || 'Failed to connect to printer');
    } finally {
      setConnectingWifiHost(null);
    }
  };

  const handleConnectBluetooth = async (device: BluetoothDevice) => {
    setConnectingDevice(device.address);
    try {
      await printerService.connectBluetooth(device.address, device.name);
      showMessage(`Connected to ${device.name || 'Bluetooth Printer'}`);
      await checkStatus();
    } catch (error: any) {
      showMessage(error?.message || 'Bluetooth connection failed');
    } finally {
      setConnectingDevice(null);
    }
  };

  const handleDisconnectBluetooth = async () => {
    setLoading(true);
    try {
      await printerService.disconnectBluetooth();
      showMessage('Bluetooth printer disconnected');
      await checkStatus();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWifi = async () => {
    const port = parseInt(wifiPort.trim(), 10) || 9100;
    if (!wifiIp.trim()) {
      showMessage('Please enter a valid IP address');
      return;
    }

    setLoading(true);
    try {
      await printerService.connectWifi(wifiIp.trim(), port);
      showMessage(`Connected to Wi-Fi printer at ${wifiIp}:${port}`);
      await checkStatus();
    } catch (error: any) {
      showMessage(error?.message || 'Wi-Fi connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWifi = async () => {
    setLoading(true);
    try {
      await printerService.disconnectWifi();
      showMessage('Wi-Fi printer disconnected');
      await checkStatus();
    } catch (error: any) {
      showMessage(error?.message || 'Failed to disconnect');
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSizeChange = async (size: PaperSize) => {
    setPaperSize(size);
    await printerService.saveConfig({ paperSize: size });
    showMessage(`Paper size set to ${size}`);
  };

  const handleTestPrint = async () => {
    setLoading(true);
    try {
      await printerService.printTestSlip(paperSize);
      showMessage('Test slip printed successfully!');
    } catch (error: any) {
      showMessage(error?.message || 'Test print failed. Check printer connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = async () => {
    if (!bill) {
      showMessage('No bill available to print');
      return;
    }

    setLoading(true);
    try {
      await printerService.printBill(bill, storeInfo, paperSize);
      showMessage(`Bill ${bill.billNumber} printed successfully! 🎉`);
      onPrintSuccess?.();
      onClose();
    } catch (error: any) {
      if (error?.message === 'NO_PRINTER_CONNECTED') {
        showMessage('Please connect to a Bluetooth or Wi-Fi printer first.');
      } else {
        showMessage(error?.message || 'Printing failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSystemPrint = async () => {
    if (!bill) {
      showMessage('No bill available to print');
      return;
    }

    try {
      const html = buildBillHtml(bill, storeInfo);
      await printerService.printSystemDocument(html, `Bill-${bill.billNumber}`);
      onPrintSuccess?.();
      onClose();
    } catch (error: any) {
      showMessage(error?.message || 'System print failed');
    }
  };

  const isConnected =
    connectionStatus.bluetoothConnected || connectionStatus.wifiConnected;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <Text style={styles.titleIcon}>🖨️</Text>
                  <View>
                    <Text style={styles.title}>Printer Connection</Text>
                    <Text style={styles.subtitle}>
                      {connectionStatus.bluetoothConnected
                        ? `Connected: ${connectionStatus.bluetoothDeviceName || 'Bluetooth'}`
                        : connectionStatus.wifiConnected
                        ? `Connected: ${connectionStatus.wifiHost}:${connectionStatus.wifiPort}`
                        : 'No printer connected'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Status Banner */}
              <View
                style={[
                  styles.statusBar,
                  isConnected ? styles.statusConnected : styles.statusDisconnected,
                ]}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isConnected ? '#10B981' : '#EF4444' },
                  ]}
                />
                <Text style={styles.statusText}>
                  {connectionStatus.bluetoothConnected
                    ? `Bluetooth Active (${connectionStatus.bluetoothDeviceName})`
                    : connectionStatus.wifiConnected
                    ? `Wi-Fi Active (${connectionStatus.wifiHost})`
                    : 'Offline • Select a printer below to connect'}
                </Text>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'bluetooth' && styles.activeTabButton,
                  ]}
                  onPress={() => {
                    setActiveTab('bluetooth');
                    scanBluetooth();
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'bluetooth' && styles.activeTabText,
                    ]}>
                    ᛒ Bluetooth
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'wifi' && styles.activeTabButton,
                  ]}
                  onPress={() => {
                    setActiveTab('wifi');
                    scanWifi();
                  }}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'wifi' && styles.activeTabText,
                    ]}>
                    🛜 Wi-Fi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === 'system' && styles.activeTabButton,
                  ]}
                  onPress={() => setActiveTab('system')}>
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'system' && styles.activeTabText,
                    ]}>
                    📄 System / PDF
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB 1: BLUETOOTH */}
              {activeTab === 'bluetooth' && (
                <View style={styles.tabBody}>
                  <View style={styles.bluetoothActionRow}>
                    <Text style={styles.sectionLabel}>PAIRED PRINTERS</Text>
                    <TouchableOpacity
                      style={styles.refreshBtn}
                      onPress={scanBluetooth}
                      disabled={loading}>
                      <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>

                  {loading && devices.length === 0 ? (
                    <View style={styles.centerBox}>
                      <ActivityIndicator size="small" color="#0F172A" />
                      <Text style={styles.emptyText}>Scanning paired devices...</Text>
                    </View>
                  ) : devices.length === 0 ? (
                    <View style={styles.centerBox}>
                      <Text style={styles.emptyText}>
                        No paired Bluetooth printers found.{'\n'}Please pair your printer in Android Settings first.
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={devices}
                      keyExtractor={item => item.address}
                      style={{ maxHeight: 180 }}
                      renderItem={({ item }) => {
                        const isThisConnected =
                          connectionStatus.bluetoothConnected &&
                          connectionStatus.bluetoothAddress === item.address;
                        const isThisConnecting = connectingDevice === item.address;

                        return (
                          <View style={styles.deviceItem}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.deviceName} numberOfLines={1}>
                                {item.name || 'Unknown Printer'}
                              </Text>
                              <Text style={styles.deviceAddress}>{item.address}</Text>
                            </View>

                            {isThisConnected ? (
                              <TouchableOpacity
                                style={styles.disconnectItemBtn}
                                onPress={handleDisconnectBluetooth}>
                                <Text style={styles.disconnectItemText}>Disconnect</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.connectItemBtn}
                                onPress={() => handleConnectBluetooth(item)}
                                disabled={isThisConnecting}>
                                {isThisConnecting ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Text style={styles.connectItemText}>Connect</Text>
                                )}
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      }}
                    />
                  )}
                </View>
              )}

              {/* TAB 2: WI-FI AUTO-CONNECT */}
              {activeTab === 'wifi' && (
                <View style={styles.tabBody}>
                  {/* Wi-Fi Status Bar */}
                  <View style={styles.wifiStatusCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wifiStatusTitle} numberOfLines={1}>
                        {wifiNetwork?.isWifiConnected
                          ? `📶 ${wifiNetwork.ssid ? wifiNetwork.ssid : 'Connected to Wi-Fi'}`
                          : '⚠️ Wi-Fi Offline'}
                      </Text>
                      <Text style={styles.wifiStatusSubtitle} numberOfLines={1}>
                        {wifiNetwork?.isWifiConnected
                          ? `Subnet: ${wifiNetwork.subnet || 'Local'} • Phone IP: ${wifiNetwork.ipAddress || 'Ready'}`
                          : 'Connect phone to your Wi-Fi network'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.wifiScanBtn}
                      onPress={scanWifi}
                      disabled={scanningWifi}>
                      {scanningWifi ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                      ) : (
                        <Text style={styles.wifiScanBtnText}>🔄 Scan</Text>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Manual IP & Port Inputs */}
                  <View style={styles.manualBox}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Printer IP Address</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 192.168.223.1"
                        placeholderTextColor="#94A3B8"
                        value={wifiIp}
                        onChangeText={setWifiIp}
                        autoCapitalize="none"
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Port (Default: 9100)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="9100"
                        placeholderTextColor="#94A3B8"
                        value={wifiPort}
                        onChangeText={setWifiPort}
                        keyboardType="numeric"
                      />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      <TouchableOpacity
                        style={[styles.manualConnectBtn, { flex: 1 }]}
                        onPress={handleConnectWifi}
                        disabled={loading}>
                        <Text style={styles.manualConnectBtnText}>
                          {connectionStatus.wifiConnected ? '✓ Connected (Tap to Reconnect)' : 'Connect Wi-Fi Printer'}
                        </Text>
                      </TouchableOpacity>

                      {connectionStatus.wifiConnected ? (
                        <TouchableOpacity
                          style={[styles.disconnectItemBtn, { paddingHorizontal: 16, height: 46 }]}
                          onPress={handleDisconnectWifi}
                          disabled={loading}>
                          <Text style={styles.disconnectItemText}>Disconnect</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.wifiScanBtn, { height: 46, paddingHorizontal: 14, justifyContent: 'center' }]}
                          onPress={handleAutoConnectWifi}
                          disabled={loading || scanningWifi}>
                          <Text style={styles.wifiScanBtnText}>⚡ Auto-Find</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Discovered Wi-Fi Printers List (Optional) */}
                  {wifiPrinters.length > 0 && (
                    <View style={styles.discoveredSection}>
                      <Text style={styles.sectionLabel}>
                        DISCOVERED PRINTERS ({wifiPrinters.length})
                      </Text>
                      <FlatList
                        data={wifiPrinters}
                        keyExtractor={item => item.ip}
                        style={{ maxHeight: 120 }}
                        renderItem={({ item }) => {
                          const isThisConnected =
                            connectionStatus.wifiConnected &&
                            connectionStatus.wifiHost === item.ip;
                          const isConnecting = connectingWifiHost === item.ip;

                          return (
                            <View style={styles.deviceItem}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.deviceName} numberOfLines={1}>
                                  🖨️ {item.name || 'Wi-Fi Thermal Printer'}
                                </Text>
                                <Text style={styles.deviceAddress}>
                                  {item.ip}:{item.port || 9100} • Status: Ready
                                </Text>
                              </View>

                              {isThisConnected ? (
                                <TouchableOpacity
                                  style={styles.disconnectItemBtn}
                                  onPress={handleDisconnectWifi}>
                                  <Text style={styles.disconnectItemText}>Disconnect</Text>
                                </TouchableOpacity>
                              ) : (
                                <TouchableOpacity
                                  style={styles.connectItemBtn}
                                  onPress={() => handleConnectDiscoveredWifi(item)}
                                  disabled={isConnecting}>
                                  {isConnecting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <Text style={styles.connectItemText}>Connect</Text>
                                  )}
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        }}
                      />
                    </View>
                  )}
                </View>
              )}

              {/* TAB 3: SYSTEM PRINT / PDF */}
              {activeTab === 'system' && (
                <View style={styles.tabBody}>
                  <Text style={styles.sectionLabel}>ANDROID PRINT SERVICE</Text>
                  <Text style={styles.systemDesc}>
                    Print using Android's native print manager. Supports office Wi-Fi printers (Mopria, HP, Epson, Canon) or saving as PDF.
                  </Text>
                  <TouchableOpacity
                    style={styles.systemPrintBtn}
                    onPress={handleSystemPrint}>
                    <Text style={styles.systemPrintIcon}>🖨️</Text>
                    <Text style={styles.systemPrintText}>
                      Open System Print Dialog
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Paper Width Selector */}
              <View style={styles.paperWidthContainer}>
                <Text style={styles.paperWidthLabel}>Paper Width:</Text>
                <View style={styles.paperWidthOptions}>
                  <TouchableOpacity
                    style={[
                      styles.paperOption,
                      paperSize === '58mm' && styles.paperOptionActive,
                    ]}
                    onPress={() => handlePaperSizeChange('58mm')}>
                    <Text
                      style={[
                        styles.paperOptionText,
                        paperSize === '58mm' && styles.paperOptionTextActive,
                      ]}>
                      58mm (2-inch)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paperOption,
                      paperSize === '80mm' && styles.paperOptionActive,
                    ]}
                    onPress={() => handlePaperSizeChange('80mm')}>
                    <Text
                      style={[
                        styles.paperOptionText,
                        paperSize === '80mm' && styles.paperOptionTextActive,
                      ]}>
                      80mm (3-inch)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.bottomRow}>
                <TouchableOpacity
                  style={styles.testPrintBtn}
                  onPress={handleTestPrint}
                  disabled={loading || !isConnected}>
                  <Text
                    style={[
                      styles.testPrintText,
                      !isConnected && { color: '#94A3B8' },
                    ]}>
                    Test Slip
                  </Text>
                </TouchableOpacity>

                {bill && (
                  <TouchableOpacity
                    style={[
                      styles.printBillBtn,
                      (!isConnected && activeTab !== 'system') && {
                        backgroundColor: '#64748B',
                      },
                    ]}
                    onPress={
                      activeTab === 'system' ? handleSystemPrint : handlePrintBill
                    }
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.printBillBtnText}>
                        🖨️ Print Bill Now
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statusConnected: {
    backgroundColor: '#ECFDF5',
  },
  statusDisconnected: {
    backgroundColor: '#FEF2F2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  tabBody: {
    minHeight: 160,
    marginBottom: 14,
  },
  bluetoothActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
  },
  refreshBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  refreshBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  centerBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  deviceAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  connectItemBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  connectItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  disconnectItemBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  disconnectItemText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
  },
  wifiActionRow: {
    marginTop: 6,
  },
  connectFullBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  connectFullText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  disconnectFullBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  disconnectFullText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '700',
  },
  helpNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    lineHeight: 16,
  },
  systemDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  systemPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 12,
  },
  systemPrintIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  systemPrintText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  paperWidthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  paperWidthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  paperWidthOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  paperOption: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  paperOptionActive: {
    backgroundColor: '#0F172A',
  },
  paperOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  paperOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testPrintBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testPrintText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  printBillBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  printBillBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wifiStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  wifiStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  wifiStatusSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  wifiScanBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  wifiScanBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  autoConnectBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  autoConnectContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoConnectIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginRight: 10,
  },
  autoConnectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  autoConnectSubtitle: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 1,
  },
  autoConnectArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  discoveredSection: {
    marginBottom: 10,
  },
  manualToggleRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  manualToggleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  manualBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  manualConnectBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  manualConnectBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});

export default PrinterModal;
