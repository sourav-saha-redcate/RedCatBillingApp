/* eslint-disable no-undef */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js')
);

jest.mock('react-native-snackbar', () => ({
  Snackbar: {
    show: jest.fn(),
    dismiss: jest.fn(),
    LENGTH_SHORT: -1,
    LENGTH_LONG: 0,
    LENGTH_INDEFINITE: -2,
  },
  default: {
    show: jest.fn(),
    dismiss: jest.fn(),
    LENGTH_SHORT: -1,
    LENGTH_LONG: 0,
    LENGTH_INDEFINITE: -2,
  },
}));

// Mock NativeModules
import { NativeModules } from 'react-native';
NativeModules.PrinterModule = {
  getPairedDevices: jest.fn().mockResolvedValue([]),
  connectBluetooth: jest.fn().mockResolvedValue(true),
  disconnectBluetooth: jest.fn().mockResolvedValue(true),
  printEscPosBase64: jest.fn().mockResolvedValue(true),
  printRawBase64: jest.fn().mockResolvedValue(true),
  printSystemDocument: jest.fn().mockResolvedValue({ success: true, jobName: 'test', isStarted: true }),
  getConnectionStatus: jest.fn().mockResolvedValue({
    bluetoothConnected: false,
    wifiConnected: false,
    hasActiveConnection: false,
  }),
  generateBillPdf: jest.fn().mockImplementation((bill, store) =>
    Promise.resolve({
      success: true,
      filePath: `/data/user/0/com.redcatbillingapp/cache/Bill_${bill.billNumber || 'test'}.pdf`,
      uri: `content://com.redcatbillingapp.fileprovider/bill_cache/Bill_${bill.billNumber || 'test'}.pdf`,
      fileName: `Bill_${bill.billNumber || 'test'}.pdf`,
    })
  ),
  sharePdfToWhatsApp: jest.fn().mockResolvedValue(true),
  sharePdfGeneral: jest.fn().mockResolvedValue(true),
};
