import { Platform, StyleSheet } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Fonts } from '@app/themes';

const monoFont = Platform.OS === 'ios' ? 'Courier' : 'monospace';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(8),
    paddingBottom: normalize(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    padding: normalize(6),
    marginRight: normalize(10),
  },

  backArrowText: {
    fontSize: normalize(20),
    color: '#0F172A',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: normalize(17),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },

  headerIconButton: {
    padding: normalize(6),
  },

  headerIconText: {
    fontSize: normalize(18),
    color: '#0F172A',
  },

  scrollContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(100),
  },

  // Thermal Paper Receipt Card
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(22),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Store Info
  storeHeaderContainer: {
    alignItems: 'center',
    marginBottom: normalize(12),
  },

  storeName: {
    fontFamily: monoFont,
    fontWeight: '900',
    fontSize: normalize(15.5),
    letterSpacing: 1.5,
    color: '#0F172A',
    marginBottom: normalize(6),
    textAlign: 'center',
  },

  storeSubText: {
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#334155',
    lineHeight: normalize(16),
    textAlign: 'center',
  },

  // Dashed Line Divider
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    marginVertical: normalize(12),
  },

  // Metadata Grid
  metaGrid: {
    gap: normalize(4),
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metaLabel: {
    fontFamily: monoFont,
    fontSize: normalize(11.5),
    color: '#475569',
  },

  metaValue: {
    fontFamily: monoFont,
    fontSize: normalize(11.5),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  // Items Table
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: normalize(4),
  },

  tableColName: {
    flex: 1,
    fontFamily: monoFont,
    fontSize: normalize(11.5),
    fontWeight: '700',
    color: '#0F172A',
  },

  tableColQty: {
    width: normalize(45),
    fontFamily: monoFont,
    fontSize: normalize(11.5),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },

  tableColPrice: {
    width: normalize(70),
    fontFamily: monoFont,
    fontSize: normalize(11.5),
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },

  tableItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: normalize(4),
  },

  tableItemName: {
    flex: 1,
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#1E293B',
    paddingRight: normalize(8),
    lineHeight: normalize(15),
  },

  tableItemQty: {
    width: normalize(45),
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#1E293B',
    textAlign: 'center',
  },

  tableItemPrice: {
    width: normalize(70),
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#1E293B',
    textAlign: 'right',
    fontWeight: '600',
  },

  // Totals Section
  totalsContainer: {
    gap: normalize(4),
  },

  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalsLabel: {
    fontFamily: monoFont,
    fontSize: normalize(12),
    color: '#334155',
  },

  totalsValue: {
    fontFamily: monoFont,
    fontSize: normalize(12),
    fontWeight: '600',
    color: '#0F172A',
  },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(8),
    paddingTop: normalize(6),
  },

  grandTotalLabel: {
    fontFamily: monoFont,
    fontSize: normalize(16),
    fontWeight: '900',
    color: '#0F172A',
  },

  grandTotalValue: {
    fontFamily: monoFont,
    fontSize: normalize(18),
    fontWeight: '900',
    color: '#0F172A',
  },

  // Footer Section
  footerContainer: {
    alignItems: 'center',
    marginTop: normalize(16),
  },

  thankYouText: {
    fontFamily: monoFont,
    fontSize: normalize(12),
    color: '#475569',
    marginBottom: normalize(12),
    textAlign: 'center',
  },

  // Barcode Graphic
  barcodeWrapper: {
    alignItems: 'center',
    marginBottom: normalize(4),
  },

  barcodeBars: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalize(32),
    justifyContent: 'center',
  },

  barcodeBar: {
    backgroundColor: '#0F172A',
    height: '100%',
    marginHorizontal: 0.8,
  },

  barcodeText: {
    fontFamily: monoFont,
    fontSize: normalize(9.5),
    color: '#64748B',
    letterSpacing: 1.5,
    marginTop: normalize(4),
  },

  // Fixed Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: normalize(18),
    paddingTop: normalize(12),
    paddingBottom: Platform.OS === 'ios' ? normalize(30) : normalize(18),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  printButton: {
    backgroundColor: '#0A1E4A',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  printIcon: {
    fontSize: normalize(17),
    marginRight: normalize(10),
  },

  printButtonText: {
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  dualButtonRow: {
    flexDirection: 'row',
    gap: normalize(10),
  },

  whatsAppButton: {
    flex: 1,
    backgroundColor: '#25D366',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  whatsAppIcon: {
    fontSize: normalize(17),
    marginRight: normalize(6),
  },

  whatsAppButtonText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  printButtonFlex: {
    flex: 1,
    backgroundColor: '#0A1E4A',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // State Handling Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(24),
  },

  loadingText: {
    marginTop: normalize(12),
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_Medium,
    color: '#64748B',
  },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: normalize(8),
    padding: normalize(14),
    marginHorizontal: normalize(16),
    marginTop: normalize(16),
    alignItems: 'center',
  },

  errorText: {
    fontSize: normalize(13),
    color: '#B91C1C',
    fontFamily: Fonts.Figtree_Medium,
    textAlign: 'center',
    marginBottom: normalize(10),
  },

  retryButton: {
    backgroundColor: '#0A1E4A',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
  },

  // Detailed Receipt Breakdown Styles
  receiptBadge: {
    alignSelf: 'center',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
    marginBottom: normalize(6),
  },

  receiptBadgeText: {
    fontFamily: monoFont,
    fontSize: normalize(10),
    fontWeight: '800',
    letterSpacing: 1,
  },

  itemDetailText: {
    fontFamily: monoFont,
    fontSize: normalize(9.5),
    color: '#64748B',
    marginTop: normalize(1),
  },

  itemDiscountText: {
    fontFamily: monoFont,
    fontSize: normalize(9.5),
    color: '#16A34A',
    fontWeight: '600',
  },

  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: normalize(8),
  },

  taxRowLabel: {
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#64748B',
  },

  taxRowValue: {
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#475569',
  },

  paymentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(6),
    padding: normalize(8),
    marginTop: normalize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    fontFamily: monoFont,
    fontSize: normalize(11),
    color: '#475569',
  },

  paymentVal: {
    fontFamily: monoFont,
    fontSize: normalize(11),
    fontWeight: '700',
    color: '#0F172A',
  },
});

export default styles;
