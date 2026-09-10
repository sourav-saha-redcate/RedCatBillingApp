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
    fontSize: normalize(17.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    padding: normalize(6),
    marginLeft: normalize(8),
  },

  headerIconText: {
    fontSize: normalize(18),
  },

  scrollContent: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(10),
    paddingBottom: normalize(100),
  },

  // Date Navigation Bar
  dateNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(6),
    marginBottom: normalize(10),
  },

  dateNavArrowBtn: {
    padding: normalize(8),
  },

  dateNavArrowText: {
    fontSize: normalize(20),
    color: '#475569',
    fontWeight: '700',
  },

  dateCenterCol: {
    alignItems: 'center',
  },

  dateSubLabel: {
    fontSize: normalize(9.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: normalize(2),
  },

  dateMainText: {
    fontSize: normalize(14),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Hero Total Revenue Card
  heroCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(14),
    paddingVertical: normalize(20),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: normalize(12),
  },

  heroLabel: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: normalize(6),
  },

  heroAmount: {
    fontSize: normalize(28),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: normalize(10),
  },

  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(4),
    borderRadius: normalize(14),
  },

  trendPillText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#16A34A',
  },

  // Stacked Metric Cards
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(14),
    marginBottom: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  metricIconBox: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(8),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(14),
  },

  metricIcon: {
    fontSize: normalize(18),
  },

  metricTextCol: {
    flex: 1,
  },

  metricLabel: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: normalize(2),
  },

  metricValue: {
    fontSize: normalize(17),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Hourly Revenue Chart Card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: normalize(16),
    marginTop: normalize(4),
    marginBottom: normalize(18),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(16),
  },

  chartTitle: {
    fontSize: normalize(15.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  peakBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    borderRadius: normalize(6),
  },

  peakBadgeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#64748B',
  },

  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: normalize(110),
    paddingHorizontal: normalize(8),
    paddingBottom: normalize(6),
  },

  barCol: {
    alignItems: 'center',
    width: normalize(36),
  },

  barTrack: {
    width: normalize(22),
    backgroundColor: '#F1F5F9',
    borderRadius: normalize(4),
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  barFill: {
    width: '100%',
    borderRadius: normalize(4),
  },

  barLabel: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
    marginTop: normalize(6),
  },

  barLabelActive: {
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Top Services Section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },

  sectionHeading: {
    fontSize: normalize(16),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  viewAllText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },

  serviceItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: normalize(12),
    marginBottom: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  serviceLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rankBox: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },

  rankBoxFirst: {
    backgroundColor: '#082154',
  },

  rankBoxOther: {
    backgroundColor: '#F1F5F9',
  },

  rankText: {
    fontSize: normalize(13),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
  },

  rankTextFirst: {
    color: '#FFFFFF',
  },

  rankTextOther: {
    color: '#0F172A',
  },

  serviceInfoCol: {
    flex: 1,
    paddingRight: normalize(10),
  },

  serviceName: {
    fontSize: normalize(13),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: normalize(2),
  },

  serviceSessions: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  serviceRevenue: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Staff Performance Section
  staffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(10),
    marginTop: normalize(4),
  },

  staffCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: normalize(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },

  staffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(10),
  },

  staffAvatar: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(8),
  },

  staffAvatarText: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  staffName: {
    fontSize: normalize(12),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },

  staffServedLabel: {
    fontSize: normalize(9),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: normalize(2),
  },

  staffClientsCount: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Dark Efficiency Card
  efficiencyCard: {
    width: '48%',
    backgroundColor: '#082154',
    borderRadius: normalize(10),
    padding: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },

  efficiencyIcon: {
    fontSize: normalize(20),
    marginBottom: normalize(4),
  },

  efficiencyLabel: {
    fontSize: normalize(9),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: normalize(4),
  },

  efficiencyValue: {
    fontSize: normalize(17),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  // Modal
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

  dateOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(14),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  dateOptionText: {
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#0F172A',
  },

  dateOptionSubtext: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  // Report Type Tabs
  reportTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: normalize(8),
  },

  reportTabBtn: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(6),
    borderRadius: normalize(20),
    backgroundColor: '#F1F5F9',
  },

  reportTabBtnActive: {
    backgroundColor: '#06489D',
  },

  reportTabText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#64748B',
    fontWeight: '600',
  },

  reportTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // GST / Sales / Staff Styles
  gstCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: normalize(16),
    marginBottom: normalize(14),
  },

  gstHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },

  gstTitle: {
    fontSize: normalize(15),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  gstBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
  },

  gstBadgeText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    color: '#0284C7',
    fontWeight: '700',
  },

  gstStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalize(6),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  gstStatLabel: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  gstStatValue: {
    fontSize: normalize(13),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  gstTableContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    padding: normalize(10),
    marginTop: normalize(10),
  },

  gstTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: normalize(6),
    marginBottom: normalize(6),
  },

  gstTableColHeader: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Bold,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'right',
  },

  gstTableRow: {
    flexDirection: 'row',
    paddingVertical: normalize(4),
  },

  gstTableCell: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#334155',
    textAlign: 'right',
  },
});

export default styles;
