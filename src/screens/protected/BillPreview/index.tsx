import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { BillItem, BillResponseDto } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';
import { getApiErrorMessage } from '@app/utils/helpers/apiError';
import { getBillByIdApi } from '@app/services/billing.service';
import printerService from '@app/utils/printer/PrinterService';
import PrinterModal from '@app/components/printer/PrinterModal';
import { buildBillHtml } from '@app/utils/printer/EscPosBuilder';
import { sanitizePhoneNumber } from '@app/utils/share/BillShareService';
import {
  DEFAULT_STORE_CONFIG,
  StoreProfileConfig,
  StoreSettingsService,
} from '@app/utils/store/StoreSettingsService';
import styles from './style';

type BillPreviewRouteProp = RouteProp<{
  BillPreview: {
    billId?: string;
    bill?: BillItem;
    apiBill?: BillResponseDto | any;
  };
}, 'BillPreview'>;

const DEFAULT_RECEIPT_BILL: BillItem = {
  id: '0',
  billNumber: '#0001',
  customerName: 'Walk-in Customer',
  phone: '',
  dateTime: 'Today, 12:00 pm',
  dateSection: 'Today',
  time: '12:00:00',
  date: 'Today',
  paymentMethod: 'UPI',
  amount: 0,
  status: 'PAID',
  staff: 'Staff',
  items: [],
  subtotal: 0,
  gst: 0,
  grandTotal: 0,
  barcode: 'rc-billing-0001',
};

// Barcode simulated bar widths pattern
const BARCODE_WIDTHS = [
  2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 4, 2, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2,
];

const BillPreview: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<BillPreviewRouteProp>();
  const insets = useSafeAreaInsets();

  const initialBill: BillItem = route.params?.bill || DEFAULT_RECEIPT_BILL;
  const initialApiBill: BillResponseDto | any = route.params?.apiBill || null;
  const billId: string | undefined = route.params?.billId || initialApiBill?.id || initialBill?.id;

  const [activeApiBill, setActiveApiBill] = useState<BillResponseDto | any>(initialApiBill);
  const [bill, setBill] = useState<BillItem>(initialBill);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreProfileConfig>(DEFAULT_STORE_CONFIG);

  // Sync bill from route if updated
  useEffect(() => {
    if (route.params?.bill) {
      setBill(route.params.bill);
    }
    if (route.params?.apiBill) {
      setActiveApiBill(route.params.apiBill);
    }
  }, [route.params?.bill, route.params?.apiBill]);

  // Load store config
  useEffect(() => {
    StoreSettingsService.getStoreConfig().then(cfg => {
      if (cfg) setStoreInfo(cfg);
    });
  }, []);

  // Authoritative API Bill Details Fetch (handles direct navigation & refresh)
  const loadBillDetails = useCallback(async (isRefresh = false) => {
    if (!billId || billId === '0') return;
    if (isRefresh) setRefreshing(true);
    else if (!activeApiBill) setLoading(true);
    setFetchError(null);

    try {
      const res = await getBillByIdApi(billId);
      const data = (res.data as any)?.data || res.data;
      if (data) {
        setActiveApiBill(data);
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(err, 'Could not refresh bill details from server.');
      setFetchError(msg);
      if (isRefresh) {
        showMessage(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [billId, activeApiBill]);

  useEffect(() => {
    if (billId && billId !== '0' && !activeApiBill) {
      loadBillDetails();
    }
  }, [billId, activeApiBill, loadBillDetails]);

  // WhatsApp Share Handler
  const handleWhatsAppShare = async () => {
    const targetPhone = activeApiBill?.customer?.phone || bill.phone || '';
    const cleanPhone = sanitizePhoneNumber(targetPhone);

    let messageText = '';
    if (activeApiBill?.formatted_receipt_text) {
      messageText = activeApiBill.formatted_receipt_text;
    } else {
      const storeName = (activeApiBill?.store?.name || storeInfo.storeName || 'RC BILLING CORP').toUpperCase();
      const billNo = activeApiBill?.bill_number || bill.billNumber;
      const dateVal = activeApiBill?.date || bill.date;
      const grandTotalFormatted = `₹${Number(activeApiBill?.grand_total !== undefined ? activeApiBill.grand_total : bill.grandTotal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      const paymentStatus = (activeApiBill?.payment?.status || activeApiBill?.status || bill.status || 'Paid');
      const thankYouMsg = activeApiBill?.invoice_footer_note || 'Thank you for your visit!';

      messageText = `${storeName}\n\nBill: ${billNo}\nDate: ${dateVal}\nTotal: ${grandTotalFormatted}\nPayment: ${paymentStatus}\n\n${thankYouMsg}`;
    }

    try {
      const encoded = encodeURIComponent(messageText);
      const appUrl = cleanPhone
        ? `whatsapp://send?phone=${cleanPhone}&text=${encoded}`
        : `whatsapp://send?text=${encoded}`;
      const webUrl = cleanPhone
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
        : `https://api.whatsapp.com/send?text=${encoded}`;

      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch {
      await Share.share({
        message: messageText,
        title: `Bill ${activeApiBill?.bill_number || bill.billNumber}`,
      });
    }
  };

  // Print Bill Handler (Opens system print dialog with clean receipt content)
  const handlePrint = async () => {
    const htmlReceipt = buildBillHtml(bill, storeInfo, activeApiBill);

    // 1. Browser/Web environment: window.print()
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return;
    }

    // 2. Android / System Print Dialog via Native Module
    try {
      const jobName = `Bill_${activeApiBill?.bill_number || bill.billNumber || 'Receipt'}`;
      await printerService.printSystemDocument(htmlReceipt, jobName);
      showMessage('Opening system print dialog...');
    } catch {
      // 3. Fallback: thermal ESC/POS printer or connection modal
      try {
        const status = await printerService.getConnectionStatus();
        if (status.hasActiveConnection) {
          await printerService.printBill(bill, storeInfo);
          showMessage('Bill printed successfully!');
        } else {
          setPrinterModalVisible(true);
        }
      } catch (printErr: any) {
        showMessage('Unable to open print dialog: ' + (printErr?.message || 'Printer error'));
      }
    }
  };

  // Authoritative Derived Values
  const storeName = activeApiBill?.store?.name || storeInfo.storeName || 'RC BILLING CORP';
  const storeAddress = activeApiBill?.store?.address || storeInfo.storeAddress || '';
  const storePhone = activeApiBill?.store?.phone || storeInfo.storePhone || '';
  const gstin = activeApiBill?.store?.gstin || storeInfo.gstin || '';

  const receiptTitle = activeApiBill?.receipt_title || 'TAX INVOICE / RECEIPT';
  const billNo = activeApiBill?.bill_number || bill.billNumber;
  const clientBillId = activeApiBill?.client_bill_id || '';
  const dateStr = activeApiBill?.date || bill.date;
  const timeStr = activeApiBill?.time || bill.time;
  const statusStr = (activeApiBill?.status || bill.status || 'PAID').toUpperCase();

  const customerName = activeApiBill?.customer?.name || bill.customerName || 'Walk-in Customer';
  const customerPhone = activeApiBill?.customer?.phone || bill.phone || '';
  const staffName = activeApiBill?.staff?.name || bill.staff || 'Staff';

  const subtotal = activeApiBill?.subtotal !== undefined ? Number(activeApiBill.subtotal) : bill.subtotal;
  const discountVal = activeApiBill?.discount !== undefined ? Number(activeApiBill.discount) : 0;
  const taxableAmount = activeApiBill?.taxable_amount !== undefined ? Number(activeApiBill.taxable_amount) : 0;
  const taxTotal = activeApiBill?.tax !== undefined ? Number(activeApiBill.tax) : bill.gst;
  const cgstVal = activeApiBill?.cgst !== undefined ? Number(activeApiBill.cgst) : 0;
  const sgstVal = activeApiBill?.sgst !== undefined ? Number(activeApiBill.sgst) : 0;
  const igstVal = activeApiBill?.igst !== undefined ? Number(activeApiBill.igst) : 0;
  const roundingVal = activeApiBill?.rounding !== undefined ? Number(activeApiBill.rounding) : 0;
  const grandTotal = activeApiBill?.grand_total !== undefined ? Number(activeApiBill.grand_total) : bill.grandTotal;

  const paymentMethod = (activeApiBill?.payment?.method || bill.paymentMethod || 'UPI').toUpperCase();
  const paymentStatus = (activeApiBill?.payment?.status || statusStr).toUpperCase();
  const paymentRef = activeApiBill?.payment?.reference || '';
  const paymentAmount = activeApiBill?.payment?.amount !== undefined ? Number(activeApiBill.payment.amount) : grandTotal;

  const footerSubnote = activeApiBill?.receipt_footer_subnote || 'Please retain this receipt for your records.';
  const invoiceFooterNote = activeApiBill?.invoice_footer_note || '🙏 Thank you for your visit!';
  const barcodeValue = activeApiBill?.barcode || bill.barcode || `rc-${billNo.replace(/[^a-zA-Z0-9]/g, '')}`;

  const isPaid = statusStr === 'PAID';
  const displayItems: any[] = (activeApiBill?.items && activeApiBill.items.length > 0) ? activeApiBill.items : bill.items;

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
          <Text style={styles.headerTitle}>Bill Preview {billNo}</Text>
        </View>
      </View>

      {/* Loading state indicator */}
      {loading && !activeApiBill ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A1E4A" />
          <Text style={styles.loadingText}>Fetching authoritative receipt...</Text>
        </View>
      ) : (
        /* Scrollable Receipt Area */
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadBillDetails(true)}
              tintColor="#0A1E4A"
              colors={['#0A1E4A']}
            />
          }
          showsVerticalScrollIndicator={false}>
          {/* Error Banner with Retry */}
          {fetchError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{fetchError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => loadBillDetails(false)}>
                <Text style={styles.retryButtonText}>Retry Fetch</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Thermal Paper Receipt Card */}
          <View style={styles.receiptCard}>
            {/* Status Badge */}
            <View
              style={[
                styles.receiptBadge,
                { backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7' },
              ]}>
              <Text
                style={[
                  styles.receiptBadgeText,
                  { color: isPaid ? '#15803D' : '#B45309' },
                ]}>
                {receiptTitle} • {statusStr}
              </Text>
            </View>

            {/* Store Info Header */}
            <View style={styles.storeHeaderContainer}>
              <Text style={styles.storeName}>{storeName}</Text>
              {storeAddress ? <Text style={styles.storeSubText}>{storeAddress}</Text> : null}
              {storePhone ? <Text style={styles.storeSubText}>Phone: {storePhone}</Text> : null}
              {gstin ? <Text style={styles.storeSubText}>GSTIN: {gstin}</Text> : null}
            </View>

            {/* Divider */}
            <View style={styles.dashedLine} />

            {/* Metadata Grid */}
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Bill No:</Text>
                <Text style={styles.metaValue}>{billNo}</Text>
              </View>
              {clientBillId ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Ref ID:</Text>
                  <Text style={styles.metaValue}>{clientBillId}</Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>{dateStr}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Time:</Text>
                <Text style={styles.metaValue}>{timeStr}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Customer:</Text>
                <Text style={styles.metaValue}>{customerName}</Text>
              </View>
              {customerPhone ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Phone:</Text>
                  <Text style={styles.metaValue}>{customerPhone}</Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Staff:</Text>
                <Text style={styles.metaValue}>{staffName}</Text>
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

            {displayItems.map((item: any, idx: number) => {
              const name = item.name || 'Item';
              const qty = item.quantity !== undefined ? item.quantity : item.qty;
              const unitPrice = item.unit_price !== undefined ? Number(item.unit_price) : item.price;
              const lineTotal = item.total !== undefined ? Number(item.total) : qty * unitPrice;
              const itemType = item.item_type || item.type;
              const itemDisc = Number(item.discount || 0);
              const taxRate = item.tax_rate !== undefined ? `${item.tax_rate}%` : '';

              return (
                <View key={item.id || `item-${idx}`} style={styles.tableItemRow}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.tableItemName} numberOfLines={2}>
                      {name}
                    </Text>
                    {itemType || taxRate ? (
                      <Text style={styles.itemDetailText}>
                        {[itemType, taxRate ? `GST ${taxRate}` : ''].filter(Boolean).join(' • ')}
                      </Text>
                    ) : null}
                    {itemDisc > 0 ? (
                      <Text style={styles.itemDiscountText}>
                        -₹{itemDisc.toFixed(2)} off
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.tableItemQty}>
                    {qty < 10 ? `0${qty}` : qty}
                  </Text>
                  <Text style={styles.tableItemPrice}>
                    ₹{lineTotal.toFixed(2)}
                  </Text>
                </View>
              );
            })}

            {/* Divider */}
            <View style={styles.dashedLine} />

            {/* Authoritative Totals & Tax Calculations */}
            <View style={styles.totalsContainer}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal:</Text>
                <Text style={styles.totalsValue}>₹{subtotal.toFixed(2)}</Text>
              </View>

              {discountVal > 0 ? (
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: '#16A34A' }]}>Discount Applied:</Text>
                  <Text style={[styles.totalsValue, { color: '#16A34A' }]}>-₹{discountVal.toFixed(2)}</Text>
                </View>
              ) : null}

              {taxableAmount > 0 && taxableAmount !== subtotal ? (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Taxable Amount:</Text>
                  <Text style={styles.totalsValue}>₹{taxableAmount.toFixed(2)}</Text>
                </View>
              ) : null}

              {cgstVal > 0 ? (
                <View style={styles.taxRow}>
                  <Text style={styles.taxRowLabel}>CGST:</Text>
                  <Text style={styles.taxRowValue}>₹{cgstVal.toFixed(2)}</Text>
                </View>
              ) : null}

              {sgstVal > 0 ? (
                <View style={styles.taxRow}>
                  <Text style={styles.taxRowLabel}>SGST:</Text>
                  <Text style={styles.taxRowValue}>₹{sgstVal.toFixed(2)}</Text>
                </View>
              ) : null}

              {igstVal > 0 ? (
                <View style={styles.taxRow}>
                  <Text style={styles.taxRowLabel}>IGST:</Text>
                  <Text style={styles.taxRowValue}>₹{igstVal.toFixed(2)}</Text>
                </View>
              ) : null}

              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Total Tax:</Text>
                <Text style={styles.totalsValue}>₹{taxTotal.toFixed(2)}</Text>
              </View>

              {roundingVal !== 0 ? (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Rounding:</Text>
                  <Text style={styles.totalsValue}>₹{roundingVal.toFixed(2)}</Text>
                </View>
              ) : null}

              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Payment Details Box */}
            <View style={styles.paymentBox}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Mode:</Text>
                <Text style={styles.paymentVal}>{paymentMethod}</Text>
              </View>
              <View style={[styles.paymentRow, { marginTop: 4 }]}>
                <Text style={styles.paymentLabel}>Payment Status:</Text>
                <Text style={[styles.paymentVal, { color: isPaid ? '#15803D' : '#B45309' }]}>
                  {paymentStatus} (₹{paymentAmount.toFixed(2)})
                </Text>
              </View>
              {paymentRef ? (
                <View style={[styles.paymentRow, { marginTop: 4 }]}>
                  <Text style={styles.paymentLabel}>Reference:</Text>
                  <Text style={styles.paymentVal}>{paymentRef}</Text>
                </View>
              ) : null}
            </View>

            {/* Footer Note & Barcode */}
            <View style={styles.footerContainer}>
              <Text style={styles.thankYouText}>{invoiceFooterNote}</Text>
              {footerSubnote ? (
                <Text style={[styles.storeSubText, { marginBottom: 10 }]}>{footerSubnote}</Text>
              ) : null}

              {/* Barcode Graphic */}
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
                  {barcodeValue}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Fixed Sticky Dual Action Buttons: ONLY WhatsApp Share & Print Bill */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 },
        ]}>
        <View style={styles.dualButtonRow}>
          {/* 1. WhatsApp Share Button */}
          <TouchableOpacity
            style={styles.whatsAppButton}
            activeOpacity={0.88}
            onPress={handleWhatsAppShare}>
            <Text style={styles.whatsAppIcon}>💬</Text>
            <Text style={styles.whatsAppButtonText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          {/* 2. Print Bill Button */}
          <TouchableOpacity
            style={styles.printButtonFlex}
            activeOpacity={0.88}
            onPress={handlePrint}>
            <Text style={styles.printIcon}>🖨️</Text>
            <Text style={styles.printButtonText} numberOfLines={1}>
              Print Bill
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Printer Setup Modal for fallback ESC/POS hardware setup if needed */}
      <PrinterModal
        visible={printerModalVisible}
        onClose={() => setPrinterModalVisible(false)}
        bill={bill}
        storeInfo={storeInfo}
      />
    </SafeAreaView>
  );
};

export default BillPreview;

