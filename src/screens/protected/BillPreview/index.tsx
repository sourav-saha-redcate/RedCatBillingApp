import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList, BillItem } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';
import printerService, { ConnectionStatus } from '@app/utils/printer/PrinterService';
import PrinterModal from '@app/components/printer/PrinterModal';
import SharePrintChoiceModal from '@app/components/share/SharePrintChoiceModal';
import styles from './style';

type BillPreviewRouteProp = RouteProp<RootStackParamList, 'BillPreview'>;

const DEFAULT_RECEIPT_BILL: BillItem = {
  id: '0',
  billNumber: '#0001',
  customerName: 'Guest User',
  phone: '+91 98765 43218',
  dateTime: '24-Oct-2023, 2:35 pm',
  dateSection: 'Today',
  time: '14:35:12',
  date: '24-Oct-2023',
  paymentMethod: 'Cash',
  amount: 46.73,
  status: 'PAID',
  staff: 'Admin-01',
  items: [
    { id: 'i1', name: 'Organic Arabica Coffee', qty: 2, price: 24.0 },
    { id: 'i2', name: 'Butter Croissant', qty: 1, price: 8.5 },
    { id: 'i3', name: 'Iced Lemon Tea (L)', qty: 1, price: 12.0 },
  ],
  subtotal: 44.5,
  gst: 2.23,
  grandTotal: 46.73,
  barcode: 'rc-billing-0001-2023',
};

// Barcode simulated bar widths pattern
const BARCODE_WIDTHS = [
  2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 4, 2, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2,
];

const BillPreview: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<BillPreviewRouteProp>();
  const insets = useSafeAreaInsets();

  const bill: BillItem = route.params?.bill || DEFAULT_RECEIPT_BILL;

  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    refreshPrinterStatus();
  }, []);

  const refreshPrinterStatus = async () => {
    try {
      const status = await printerService.getConnectionStatus();
      setPrinterStatus(status);
    } catch {
      // Ignored
    }
  };

  const handleShare = () => {
    setChoiceModalVisible(true);
  };

  const handlePrint = () => {
    setPrinterModalVisible(true);
  };

  const handleSettings = () => {
    setPrinterModalVisible(true);
  };

  // Determine currency symbol
  const isDemoDollar = bill.billNumber === '#0001';
  const currencySymbol = isDemoDollar ? '$' : '₹';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill Preview {bill.billNumber}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={handleShare}>
            <Text style={styles.headerIconText}>↗️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={handleSettings}>
            <Text style={styles.headerIconText}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Receipt Area */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Thermal Paper Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Store Info Header */}
          <View style={styles.storeHeaderContainer}>
            <Text style={styles.storeName}>RC BILLING CORP</Text>
            <Text style={styles.storeSubText}>123 Business Avenue, Tech Park</Text>
            <Text style={styles.storeSubText}>Phone: +1 (555) 812-3456</Text>
            <Text style={styles.storeSubText}>GSTIN: 22AAAAA0000A1Z5</Text>
          </View>

          {/* Divider */}
          <View style={styles.dashedLine} />

          {/* Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Bill No:</Text>
              <Text style={styles.metaValue}>{bill.billNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{bill.date}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Time:</Text>
              <Text style={styles.metaValue}>{bill.time}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Customer:</Text>
              <Text style={styles.metaValue}>{bill.customerName}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Phone:</Text>
              <Text style={styles.metaValue}>{bill.phone}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Staff:</Text>
              <Text style={styles.metaValue}>{bill.staff}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dashedLine} />

          {/* Items Table */}
          <View style={styles.tableHeaderRow}>
            <Text style={styles.tableColName}>Item Name</Text>
            <Text style={styles.tableColQty}>Qty</Text>
            <Text style={styles.tableColPrice}>Price</Text>
          </View>

          {bill.items.map(item => (
            <View key={item.id} style={styles.tableItemRow}>
              <Text style={styles.tableItemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.tableItemQty}>
                {item.qty < 10 ? `0${item.qty}` : item.qty}
              </Text>
              <Text style={styles.tableItemPrice}>
                {item.price.toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Divider */}
          <View style={styles.dashedLine} />

          {/* Calculations */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{bill.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST (5%):</Text>
              <Text style={styles.totalsValue}>{bill.gst.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>
                {currencySymbol}
                {bill.grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Footer Note & Barcode */}
          <View style={styles.footerContainer}>
            <Text style={styles.thankYouText}>Thank you! Visit again.</Text>

            {/* Barcode graphic */}
            <View style={styles.barcodeWrapper}>
              <View style={styles.barcodeBars}>
                {BARCODE_WIDTHS.map((width, idx) => (
                  <View
                    key={idx}
                    style={[styles.barcodeBar, { width }]}
                  />
                ))}
              </View>
              <Text style={styles.barcodeText}>
                {bill.barcode || `rc-billing-${bill.billNumber.replace('#', '')}-2023`}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Sticky Dual Action Buttons: WhatsApp & Print */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 },
        ]}>
        <View style={styles.dualButtonRow}>
          {/* WhatsApp Action */}
          <TouchableOpacity
            style={styles.whatsAppButton}
            activeOpacity={0.88}
            onPress={() => setChoiceModalVisible(true)}>
            <Text style={styles.whatsAppIcon}>💬</Text>
            <Text style={styles.whatsAppButtonText}>WhatsApp</Text>
          </TouchableOpacity>

          {/* Print Action */}
          <TouchableOpacity
            style={styles.printButtonFlex}
            activeOpacity={0.88}
            onPress={handlePrint}>
            <Text style={styles.printIcon}>🖨️</Text>
            <Text style={styles.printButtonText} numberOfLines={1}>
              {printerStatus?.bluetoothConnected
                ? `Print (${printerStatus.bluetoothDeviceName || 'BT'})`
                : printerStatus?.wifiConnected
                ? `Print (Wi-Fi)`
                : 'Print Bill'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Printer Connection & Settings Modal */}
      <PrinterModal
        visible={printerModalVisible}
        onClose={() => {
          setPrinterModalVisible(false);
          refreshPrinterStatus();
        }}
        bill={bill}
        storeInfo={{
          storeName: 'RC BILLING CORP',
          storeAddress: '123 Business Avenue, Tech Park',
          storePhone: '+1 (555) 812-3456',
          gstin: '22AAAAA0000A1Z5',
        }}
        onPrintSuccess={refreshPrinterStatus}
      />

      {/* WhatsApp or Print Choice Modal */}
      <SharePrintChoiceModal
        visible={choiceModalVisible}
        onClose={() => setChoiceModalVisible(false)}
        bill={bill}
        storeInfo={{
          storeName: 'RC BILLING CORP',
          storeAddress: '123 Business Avenue, Tech Park',
          storePhone: '+1 (555) 812-3456',
          gstin: '22AAAAA0000A1Z5',
        }}
        onOpenPrinterSetup={() => {
          setChoiceModalVisible(false);
          setPrinterModalVisible(true);
        }}
      />
    </SafeAreaView>
  );
};

export default BillPreview;
