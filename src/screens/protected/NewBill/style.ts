import { Platform, StyleSheet } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Fonts } from '@app/themes';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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

  menuButton: {
    padding: normalize(6),
  },

  menuDotsText: {
    fontSize: normalize(20),
    color: '#0F172A',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(14),
  },

  // Section Headers
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(10),
  },

  sectionHeaderIcon: {
    fontSize: normalize(13),
    marginRight: normalize(6),
    color: '#475569',
  },

  sectionHeaderText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },

  // Form Fields
  fieldLabel: {
    fontSize: normalize(10),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: normalize(6),
    letterSpacing: 0.3,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    height: normalize(42),
    backgroundColor: '#FFFFFF',
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#0F172A',
    marginBottom: normalize(14),
  },

  selectorButton: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    height: normalize(42),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(18),
  },

  selectorText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#0F172A',
  },

  selectorPlaceholder: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
  },

  chevronIcon: {
    fontSize: normalize(14),
    color: '#64748B',
  },

  // Search in Service Catalog
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    height: normalize(38),
    marginBottom: normalize(12),
  },

  searchIcon: {
    fontSize: normalize(14),
    marginRight: normalize(8),
    opacity: 0.5,
  },

  searchInput: {
    flex: 1,
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#0F172A',
    paddingVertical: 0,
  },

  // Catalog Scroll Row
  catalogScrollView: {
    flexDirection: 'row',
    paddingBottom: normalize(16),
  },

  catalogCard: {
    width: normalize(102),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(10),
    padding: normalize(10),
    marginRight: normalize(10),
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },

  catalogIcon: {
    fontSize: normalize(18),
    marginBottom: normalize(8),
  },

  catalogName: {
    fontSize: normalize(12),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: normalize(6),
  },

  catalogBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  catalogPrice: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#475569',
  },

  catalogAddBtn: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  catalogAddPlus: {
    fontSize: normalize(12),
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: normalize(14),
  },

  // Added Items Section
  addedItemsTitle: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: normalize(10),
    marginTop: normalize(4),
  },

  addedItemCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(10),
    padding: normalize(12),
    paddingLeft: normalize(16),
    marginBottom: normalize(10),
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: normalize(4),
    backgroundColor: '#0F172A',
  },

  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(10),
  },

  itemLeftCol: {
    flex: 1,
    paddingRight: normalize(10),
  },

  itemName: {
    fontSize: normalize(13),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: normalize(2),
  },

  itemStaff: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  itemPrice: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(6),
    height: normalize(28),
    backgroundColor: '#FAFAFA',
  },

  stepperBtn: {
    paddingHorizontal: normalize(10),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepperBtnText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#0F172A',
  },

  stepperQty: {
    paddingHorizontal: normalize(8),
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: normalize(24),
    textAlign: 'center',
  },

  deleteBtn: {
    padding: normalize(6),
  },

  deleteIcon: {
    fontSize: normalize(15),
    color: '#EF4444',
  },

  emptyAddedItems: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(24),
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: normalize(14),
  },

  emptyAddedText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
  },

  // Digital Audit Trail
  auditTrailCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: normalize(10),
    paddingVertical: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: normalize(12),
  },

  auditTrailIcon: {
    fontSize: normalize(20),
    opacity: 0.4,
    marginBottom: normalize(4),
  },

  auditTrailText: {
    fontSize: normalize(9.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },

  // Sticky Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: normalize(18),
    paddingTop: normalize(12),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },

  summaryLabel: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  summaryValue: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#475569',
  },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(4),
    marginBottom: normalize(10),
  },

  grandTotalLabel: {
    fontSize: normalize(14),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  grandTotalValue: {
    fontSize: normalize(15),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '900',
    color: '#0F172A',
  },

  checkoutButton: {
    backgroundColor: '#082154',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkoutButtonText: {
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: normalize(6),
  },

  checkoutButtonRow: {
    flexDirection: 'row',
    gap: normalize(8),
  },

  sharePrintButton: {
    flex: 1,
    backgroundColor: '#15803D',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sharePrintButtonText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: normalize(4),
  },

  previewButton: {
    flex: 1,
    backgroundColor: '#082154',
    borderRadius: normalize(8),
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewButtonText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: normalize(4),
  },

  // Staff Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: normalize(20),
    borderTopRightRadius: normalize(20),
    paddingHorizontal: normalize(20),
    paddingTop: normalize(18),
    paddingBottom: normalize(32),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(14),
  },

  modalTitle: {
    fontSize: normalize(16),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  modalCloseText: {
    fontSize: normalize(16),
    color: '#64748B',
    fontWeight: '700',
  },

  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  staffItemName: {
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#0F172A',
  },

  staffItemRole: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(2),
  },

  staffSelectedCheck: {
    fontSize: normalize(16),
    color: '#10B981',
    fontWeight: '700',
  },
});

export default styles;
