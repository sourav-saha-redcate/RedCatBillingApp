import { Platform, StyleSheet } from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Fonts } from '@app/themes';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(10),
    paddingBottom: normalize(12),
  },

  headerTitle: {
    fontSize: normalize(22),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  menuButton: {
    width: normalize(36),
    height: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(8),
  },

  menuDotsText: {
    fontSize: normalize(20),
    color: '#0F172A',
    fontWeight: '800',
    lineHeight: normalize(22),
  },

  searchContainer: {
    paddingHorizontal: normalize(18),
    marginBottom: normalize(12),
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: normalize(10),
    paddingHorizontal: normalize(12),
    height: normalize(42),
  },

  searchIcon: {
    fontSize: normalize(15),
    marginRight: normalize(8),
    opacity: 0.5,
  },

  searchInput: {
    flex: 1,
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#0F172A',
    paddingVertical: 0,
  },

  clearSearchButton: {
    padding: normalize(4),
  },

  clearSearchText: {
    fontSize: normalize(13),
    color: '#94A3B8',
    fontWeight: '700',
  },

  filterScrollView: {
    paddingHorizontal: normalize(18),
    paddingBottom: normalize(14),
    flexDirection: 'row',
    gap: normalize(8),
  },

  filterChip: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterChipActive: {
    backgroundColor: '#0F172A',
  },

  filterChipText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#475569',
  },

  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: normalize(18),
    paddingBottom: normalize(100),
  },

  sectionDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(16),
    marginBottom: normalize(10),
  },

  sectionDividerText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Medium,
    color: '#94A3B8',
  },

  sectionDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: normalize(10),
  },

  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    marginBottom: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },

  billCardLeft: {
    flex: 1,
    paddingRight: normalize(12),
  },

  billNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(4),
  },

  billNumber: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: normalize(8),
  },

  customerName: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },

  billMetaText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  billCardRight: {
    alignItems: 'flex-end',
  },

  billAmount: {
    fontSize: normalize(15),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: normalize(3),
  },

  statusBadgeText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  statusPaid: {
    color: '#10B981',
  },

  statusRefunded: {
    color: '#EF4444',
  },

  statusPending: {
    color: '#F59E0B',
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(48),
    paddingHorizontal: normalize(24),
  },

  emptyStateIcon: {
    fontSize: normalize(42),
    marginBottom: normalize(12),
  },

  emptyStateTitle: {
    fontSize: normalize(16),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: normalize(6),
  },

  emptyStateSubtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: normalize(16),
  },

  emptyStateClearBtn: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    borderRadius: normalize(8),
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStateClearBtnText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  activeDateBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(10),
    marginHorizontal: normalize(18),
    marginBottom: normalize(12),
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8),
  },

  activeDateBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  activeDateBannerIcon: {
    fontSize: normalize(16),
    marginRight: normalize(8),
  },

  activeDateTextContainer: {
    flex: 1,
  },

  activeDateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(2),
  },

  activeDateBannerTitle: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  activeDateBannerCount: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginLeft: normalize(4),
  },

  activeDateBannerText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#0F172A',
    fontWeight: '700',
  },

  activeDateBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(10),
  },

  activeDateChangeBtn: {
    paddingVertical: normalize(2),
    paddingHorizontal: normalize(4),
  },

  activeDateChangeText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#2563EB',
    fontWeight: '600',
  },

  activeDateClearBtn: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeDateClearText: {
    fontSize: normalize(11),
    color: '#475569',
    fontWeight: '800',
  },
});

export default styles;
