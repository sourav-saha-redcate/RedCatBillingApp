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
    paddingHorizontal: normalize(16),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(8),
    paddingBottom: normalize(12),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  backButton: {
    padding: normalize(6),
    marginRight: normalize(12),
  },

  backArrowText: {
    fontSize: normalize(20),
    color: '#0F172A',
    fontWeight: '700',
  },

  headerTitle: {
    fontSize: normalize(18),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  scrollContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(16),
    paddingBottom: normalize(100),
  },

  sectionHeader: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: normalize(8),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: normalize(16),
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  // Store Profile Card
  storeProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: normalize(14),
  },

  storeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: normalize(10),
  },

  storeLogoBox: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(10),
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },

  storeLogoIcon: {
    fontSize: normalize(20),
  },

  storeInfoText: {
    flex: 1,
  },

  storeName: {
    fontSize: normalize(14.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: normalize(2),
  },

  storeGstin: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  editButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(7),
    borderRadius: normalize(8),
  },

  editButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    fontSize: normalize(12),
  },

  // Menu Rows
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(14),
  },

  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIconBox: {
    width: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(10),
  },

  menuIcon: {
    fontSize: normalize(17),
  },

  menuTitle: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#0F172A',
  },

  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuRightText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginRight: normalize(4),
  },

  menuChevron: {
    fontSize: normalize(18),
    color: '#94A3B8',
    fontWeight: '600',
  },

  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: normalize(52),
  },

  // Hardware Status
  hardwareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(14),
  },

  pillBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(14),
  },

  pillBadgeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#0284C7',
  },

  dualStatusContainer: {
    flexDirection: 'row',
    paddingHorizontal: normalize(14),
    paddingBottom: normalize(14),
    paddingTop: normalize(2),
    gap: normalize(10),
  },

  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    padding: normalize(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  statusIconBox: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(8),
  },

  bluetoothIcon: {
    fontSize: normalize(16),
    color: '#10B981',
  },

  wifiIcon: {
    fontSize: normalize(16),
    color: '#EF4444',
  },

  statusCardTextCol: {
    flex: 1,
  },

  statusCardTitle: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  statusConnected: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#10B981',
    marginTop: normalize(1),
  },

  statusDisconnected: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: normalize(1),
  },

  // Logout Button
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: normalize(10),
    backgroundColor: '#FFFFFF',
    height: normalize(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(4),
    marginBottom: normalize(12),
  },

  logoutIcon: {
    fontSize: normalize(16),
    color: '#EF4444',
    marginRight: normalize(6),
    fontWeight: '700',
  },

  logoutText: {
    fontSize: normalize(14.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#EF4444',
  },

  appVersionText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: normalize(20),
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
    marginBottom: normalize(16),
  },

  modalTitle: {
    fontSize: normalize(16.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  modalCloseText: {
    fontSize: normalize(16),
    color: '#64748B',
    fontWeight: '700',
  },

  modalFieldLabel: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#475569',
    marginBottom: normalize(6),
  },

  modalInput: {
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

  modalPrimaryButton: {
    backgroundColor: '#0F172A',
    height: normalize(46),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(8),
  },

  modalPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
  },

  dialogActionRow: {
    flexDirection: 'row',
    gap: normalize(12),
    marginTop: normalize(16),
  },

  cancelDialogBtn: {
    flex: 1,
    height: normalize(44),
    borderRadius: normalize(8),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelDialogText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#475569',
  },

  confirmLogoutBtn: {
    flex: 1,
    height: normalize(44),
    borderRadius: normalize(8),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmLogoutText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Bold,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Audit Logs & Backup Styles
  auditLogCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(4),
  },

  auditActionBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(4),
  },

  auditActionText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Bold,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  auditTimeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  auditEntityText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: normalize(2),
  },

  auditActorText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#475569',
    marginTop: normalize(2),
  },

  backupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  backupInfoCol: {
    flex: 1,
    paddingRight: normalize(10),
  },

  backupFileName: {
    fontSize: normalize(13),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  backupSubtext: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(2),
  },

  restoreActionBtn: {
    backgroundColor: '#06489D',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(6),
  },

  restoreActionText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default styles;
