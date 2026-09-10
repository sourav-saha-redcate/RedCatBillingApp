import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { BillItem } from '@app/types';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  DEFAULT_STORE_INFO,
  formatBillForWhatsApp,
  formatWhatsAppFriendlyMessage,
  sendBillViaWhatsAppWithPdf,
  sendBillViaWhatsApp,
  shareBillGeneral,
  shareBillPdfGeneral,
} from '@app/utils/share/BillShareService';
import printerService, { ConnectionStatus } from '@app/utils/printer/PrinterService';
import { StorePrintInfo, buildBillHtml } from '@app/utils/printer/EscPosBuilder';

import { sendReceiptApi } from '@app/services/billing.service';

interface SharePrintChoiceModalProps {
  visible: boolean;
  onClose: () => void;
  bill: BillItem;
  storeInfo?: StorePrintInfo;
  onOpenPrinterSetup?: () => void;
}

export const SharePrintChoiceModal: React.FC<SharePrintChoiceModalProps> = ({
  visible,
  onClose,
  bill,
  storeInfo = DEFAULT_STORE_INFO,
  onOpenPrinterSetup,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(bill.phone || '');
  const [showPreview, setShowPreview] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    if (visible) {
      setPhoneNumber(bill.phone || '');
      checkPrinterStatus();
    }
  }, [visible, bill]);

  const checkPrinterStatus = async () => {
    try {
      const status = await printerService.getConnectionStatus();
      setPrinterStatus(status);
    } catch {
      // Ignored
    }
  };

  const friendlyMessage = formatWhatsAppFriendlyMessage(bill, storeInfo);

  const handleSendWhatsApp = async () => {
    if (!phoneNumber.trim()) {
      showMessage('Please enter a WhatsApp phone number');
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      if (bill.id && !bill.id.startsWith('item-')) {
        sendReceiptApi(bill.id, { channel: 'whatsapp', recipient: phoneNumber.trim() }).catch(() => {});
      }
      await sendBillViaWhatsAppWithPdf(bill, phoneNumber.trim(), storeInfo);
      showMessage(`Opening WhatsApp for ${phoneNumber.trim()}...`);
      onClose();
    } catch (err: any) {
      showMessage(err?.message || 'Could not launch WhatsApp');
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handlePrint = () => {
    onClose();
    if (onOpenPrinterSetup) {
      onOpenPrinterSetup();
    }
  };

  const handleSystemPrint = async () => {
    try {
      const html = buildBillHtml(bill, storeInfo);
      await printerService.printSystemDocument(html, `Bill-${bill.billNumber}`);
      onClose();
    } catch (error: any) {
      showMessage(error?.message || 'System print failed');
    }
  };

  const handleGeneralShare = async () => {
    try {
      await shareBillPdfGeneral(bill, storeInfo);
      onClose();
    } catch {
      showMessage('Could not share bill');
    }
  };

  const isDollar = bill.billNumber === '#0001';
  const currencySymbol = isDollar ? '$' : '₹';
  const hasPrinter = printerStatus?.hasActiveConnection;

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
              {/* Modal Handle */}
              <View style={styles.sheetHandle} />

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.modalTitle}>Choose Bill Action</Text>
                  <Text style={styles.modalSubtitle}>
                    {bill.billNumber} • {currencySymbol}
                    {bill.grandTotal.toFixed(2)} • {bill.customerName}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}>
                {/* 1. WHATSAPP OPTION (GREEN HIGHLIGHT) */}
                <View style={styles.optionCardWhatsApp}>
                  <View style={styles.optionHeaderRow}>
                    <View style={styles.optionIconContainerWhatsApp}>
                      <Text style={styles.whatsappIcon}>💬</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.optionTitleWhatsApp}>
                        Send Bill via WhatsApp (PDF)
                      </Text>
                      <Text style={styles.optionDesc}>
                        Attaches PDF invoice with Google review rating link
                      </Text>
                    </View>
                  </View>

                  {/* Phone Input */}
                  <View style={styles.phoneInputRow}>
                    <Text style={styles.inputPrefix}>📱 Phone:</Text>
                    <TextInput
                      style={styles.phoneInput}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="e.g. +91 98765 43210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                    />
                  </View>

                  {/* WhatsApp Action Button */}
                  <TouchableOpacity
                    style={styles.whatsAppButton}
                    activeOpacity={0.88}
                    onPress={handleSendWhatsApp}
                    disabled={isSendingWhatsApp}>
                    {isSendingWhatsApp ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.whatsAppButtonText}>
                        Attach PDF & Send via WhatsApp ➔
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Message Preview Toggle */}
                  <TouchableOpacity
                    style={styles.previewToggleBtn}
                    onPress={() => setShowPreview(!showPreview)}>
                    <Text style={styles.previewToggleText}>
                      {showPreview ? '▲ Hide Message Preview' : '▼ Preview WhatsApp Message'}
                    </Text>
                  </TouchableOpacity>

                  {showPreview && (
                    <View style={styles.previewBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, marginRight: 6 }}>📄</Text>
                        <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#16A34A' }}>
                          Bill_{bill.billNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf attached
                        </Text>
                      </View>
                      <Text style={styles.previewText}>{friendlyMessage}</Text>
                    </View>
                  )}
                </View>

                {/* 2. PRINT RECEIPT OPTION (DARK THEME) */}
                <View style={styles.optionCardPrint}>
                  <View style={styles.optionHeaderRow}>
                    <View style={styles.optionIconContainerPrint}>
                      <Text style={styles.printIcon}>🖨️</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={styles.optionTitlePrint}>
                          Print Thermal Receipt
                        </Text>
                        <TouchableOpacity onPress={onOpenPrinterSetup}>
                          <Text style={styles.setupLinkText}>⚙️ Setup</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.printerStatusNote}>
                        {hasPrinter
                          ? `● Connected: ${
                              printerStatus?.bluetoothConnected
                                ? printerStatus.bluetoothDeviceName || 'Bluetooth'
                                : printerStatus?.wifiHost || 'Wi-Fi'
                            }`
                          : '○ No printer connected • Tap to connect'}
                      </Text>
                    </View>
                  </View>

                  {/* Print Action Button */}
                  <TouchableOpacity
                    style={styles.printButton}
                    activeOpacity={0.88}
                    onPress={handlePrint}
                    disabled={isPrinting}>
                    {isPrinting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.printButtonText}>
                        {hasPrinter ? '🖨️ Print Receipt Now' : '🖨️ Connect & Print'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* 3. QUICK SECONDARY ACTIONS */}
                <View style={styles.secondaryRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.8}
                    onPress={handleSystemPrint}>
                    <Text style={styles.secondaryBtnIcon}>📄</Text>
                    <Text style={styles.secondaryBtnText}>System / PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.8}
                    onPress={handleGeneralShare}>
                    <Text style={styles.secondaryBtnIcon}>↗️</Text>
                    <Text style={styles.secondaryBtnText}>Share to Apps</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '90%',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  contentContainer: {
    paddingBottom: 8,
  },
  /* WhatsApp Card */
  optionCardWhatsApp: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionIconContainerWhatsApp: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  whatsappIcon: {
    fontSize: 22,
  },
  optionTitleWhatsApp: {
    fontSize: 15,
    fontWeight: '800',
    color: '#15803D',
  },
  optionDesc: {
    fontSize: 11.5,
    color: '#4B5563',
    marginTop: 1,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputPrefix: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    height: 42,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  whatsAppButton: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#25D366',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  whatsAppButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  previewToggleBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  previewToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginTop: 8,
    maxHeight: 130,
  },
  previewText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
    fontFamily: 'monospace',
  },
  /* Print Card */
  optionCardPrint: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  optionIconContainerPrint: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  printIcon: {
    fontSize: 22,
  },
  optionTitlePrint: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  setupLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  printerStatusNote: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  printButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  printButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  /* Secondary Row */
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 11,
  },
  secondaryBtnIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
});

export default SharePrintChoiceModal;
