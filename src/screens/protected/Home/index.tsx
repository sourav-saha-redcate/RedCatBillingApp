import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalize } from '@app/utils/orientation';
import { Fonts, Icons } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import { getDashboardApi } from '@app/services/reports.service';
import { DashboardRecentActivityDto, DashboardResponseDto } from '@app/types';
import { getApiErrorMessage } from '@app/utils/helpers/apiError';

interface HomeProps {
  navigation: any;
}

const getActivityIcon = (iconType?: string, paymentMethod?: string | null): string => {
  if (iconType === 'service') return '✂️';
  if (iconType === 'medical') return '💊';
  if (iconType === 'retail') return '🛒';
  const method = (paymentMethod || '').toLowerCase();
  if (method === 'upi') return '📱';
  if (method === 'cash') return '💵';
  if (method === 'card') return '💳';
  return '🧾';
};

const formatINR = (val?: number | string): string => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [dashboard, setDashboard] = useState<DashboardResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await getDashboardApi();
      const resData = (response.data as any)?.data || response.data;
      if (resData && typeof resData === 'object') {
        setDashboard(resData);
      } else {
        throw new Error('Invalid dashboard payload received from server');
      }
    } catch (err: any) {
      const errMsg = getApiErrorMessage(err, 'Failed to fetch dashboard data.');
      setError(errMsg);
      if (isRefresh) {
        showMessage(errMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  const storeName = dashboard?.store?.name || 'RC Billing';
  const kpis = dashboard?.kpis;
  const systemStatus = dashboard?.system_status;
  const quickStats = dashboard?.quick_stats;
  const recentActivities: DashboardRecentActivityDto[] = dashboard?.recent_activities || [];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#002B66']}
            tintColor="#002B66"
          />
        }>
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SideMenu')}
              style={styles.menuButton}>
              <View style={styles.menuIconBox}>
                <View style={styles.menuBar} />
                <View style={[styles.menuBar, { width: normalize(14) }]} />
                <View style={styles.menuBar} />
              </View>
            </TouchableOpacity> */}
            <View>
              <Text style={styles.brandTitle}>{storeName}</Text>
              {dashboard?.store?.store_type ? (
                <Text style={styles.storeTypeBadge}>
                  {dashboard.store.store_type.toUpperCase()} STORE
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
              onPress={() => showMessage('No new notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SideMenu')}
              style={styles.avatarWrapper}>
              <Image
                source={Icons.profile}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Banner with Retry */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <View style={styles.errorTextRow}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.retryButton}
              onPress={() => fetchDashboardData(false)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Initial Loading Skeleton State */}
        {loading && !dashboard ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonCard}>
              <ActivityIndicator size="large" color="#002B66" />
              <Text style={styles.skeletonLoadingText}>Loading live dashboard...</Text>
            </View>
          </View>
        ) : (
          <>
            {/* SUMMARY TODAY */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderNoMargin}>SUMMARY TODAY</Text>
              {dashboard?.date ? (
                <Text style={styles.dateBadgeText}>{dashboard.date}</Text>
              ) : null}
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
                <Text style={styles.summaryValueRevenue}>
                  {formatINR(kpis?.today_sales)}
                </Text>
                {typeof kpis?.sales_growth_percentage === 'number' && (
                  <Text
                    style={[
                      styles.growthText,
                      {
                        color:
                          kpis.sales_growth_percentage >= 0 ? '#10B981' : '#EF4444',
                      },
                    ]}>
                    {kpis.sales_growth_percentage >= 0 ? '↑ +' : '↓ '}
                    {kpis.sales_growth_percentage.toFixed(1)}% vs yesterday
                  </Text>
                )}
              </View>

              <View style={[styles.summaryCol, styles.summaryColRight]}>
                <Text style={[styles.summaryLabel, styles.alignRight]}>Total Bills</Text>
                <Text style={[styles.summaryValueBills, styles.alignRight]}>
                  {kpis?.today_bills_count ?? 0}
                </Text>
                {kpis?.average_bill_value ? (
                  <Text style={[styles.avgTicketText, styles.alignRight]}>
                    Avg: {formatINR(kpis.average_bill_value)}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Quick KPI Chips: Cash vs UPI vs Card */}
            {kpis && (
              <View style={styles.paymentChipsRow}>
                <View style={styles.kpiChip}>
                  <Text style={styles.kpiChipLabel}>Cash</Text>
                  <Text style={styles.kpiChipValue}>{formatINR(kpis.today_cash_sales)}</Text>
                </View>
                <View style={styles.kpiChip}>
                  <Text style={styles.kpiChipLabel}>UPI</Text>
                  <Text style={styles.kpiChipValue}>{formatINR(kpis.today_upi_sales)}</Text>
                </View>
                <View style={styles.kpiChip}>
                  <Text style={styles.kpiChipLabel}>Card</Text>
                  <Text style={styles.kpiChipValue}>{formatINR(kpis.today_card_sales)}</Text>
                </View>
              </View>
            )}

            {/* QUICK ACTIONS */}
            <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>

            {/* Featured Action: New Bill */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.newBillButton}
              onPress={() => navigation.navigate('NewBill')}>
              <View style={styles.plusCircle}>
                <Text style={styles.plusSign}>+</Text>
              </View>
              <Text style={styles.newBillText}>New Bill</Text>
              <Text style={styles.newBillArrow}>›</Text>
            </TouchableOpacity>

            {/* 2-Column Action Cards */}
            <View style={styles.twoColRow}>
              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('History')}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>🕒</Text>
                </View>
                <Text style={styles.actionTitle}>Bill History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Summary')}>
                <View style={styles.actionIconContainer}>
                  <Text style={styles.actionIcon}>📊</Text>
                </View>
                <Text style={styles.actionTitle}>Daily Summary</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Row Card */}
            <TouchableOpacity
              style={styles.settingsRowCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.settingsIcon}>⚙️</Text>
              <Text style={styles.settingsText}>Settings</Text>
              <Text style={styles.settingsArrow}>›</Text>
            </TouchableOpacity>

            {/* Staff Performance Card */}
            <TouchableOpacity
              style={[styles.actionCard, styles.staffCard]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Summary')}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>👥</Text>
              </View>
              <Text style={styles.actionTitle}>Staff Performance</Text>
            </TouchableOpacity>

            {/* RECENT ACTIVITY */}
            <View style={styles.recentActivityHeader}>
              <Text style={styles.sectionHeaderNoMargin}>RECENT ACTIVITY</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('History')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Activity Items List or Empty State */}
            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivityCard}>
                <Text style={styles.emptyActivityIcon}>📝</Text>
                <Text style={styles.emptyActivityTitle}>No recent activity yet</Text>
                <Text style={styles.emptyActivitySubtitle}>
                  Bills generated today will appear here in real time.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.emptyCreateButton}
                  onPress={() => navigation.navigate('NewBill')}>
                  <Text style={styles.emptyCreateButtonText}>Create First Bill</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.activityList}>
                {recentActivities.map((item, index) => {
                  const itemIcon = getActivityIcon(item.icon_type, item.payment_method);
                  const displayMethod = item.payment_method
                    ? item.payment_method.toUpperCase()
                    : 'PAID';
                  const timeMethod = `${item.time || ''} • ${displayMethod}`;

                  return (
                    <TouchableOpacity
                      key={item.id || `act-${index}`}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('History')}
                      style={styles.activityItem}>
                      <View style={styles.activityIconBox}>
                        <Text style={styles.activityItemIcon}>{itemIcon}</Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityInvNumber}>
                          {item.bill_number || `Bill #${item.id}`}
                        </Text>
                        <Text style={styles.activityTimeMethod}>
                          {item.customer_name ? `${item.customer_name} • ` : ''}
                          {timeMethod}
                        </Text>
                      </View>
                      <View style={styles.activityAmountContainer}>
                        <Text style={styles.activityAmount}>
                          {formatINR(item.amount)}
                        </Text>
                        <Text
                          style={[
                            styles.activityStatusTag,
                            item.status === 'paid'
                              ? styles.statusPaid
                              : styles.statusOther,
                          ]}>
                          {item.status ? item.status.toUpperCase() : 'PAID'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* SYSTEM STATUS */}
            <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
            <View style={styles.statusCard}>
              <View style={styles.cloudRow}>
                <View style={styles.statusIndicatorGreen} />
                <Text style={styles.cloudIcon}>☁️</Text>
                <Text style={styles.cloudText}>
                  {systemStatus?.cloud_sync?.label || 'Cloud Sync Active'}
                </Text>
              </View>

              <Text style={styles.printersText}>
                Printers online: {quickStats?.printers_count ?? 1}
                {quickStats?.default_printer ? ` (${quickStats.default_printer})` : ''}
              </Text>

              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(
                        100,
                        Math.max(5, systemStatus?.memory?.percentage ?? 50),
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.memoryText}>
                Memory:{' '}
                {systemStatus?.memory
                  ? `${systemStatus.memory.used} / ${systemStatus.memory.total} (${systemStatus.memory.percentage}%)`
                  : 'Operating normally'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView >
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(8),
    paddingBottom: normalize(80),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(14),
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuButton: {
    padding: normalize(4),
    marginRight: normalize(10),
  },

  menuIconBox: {
    width: normalize(20),
    height: normalize(16),
    justifyContent: 'space-between',
  },

  menuBar: {
    width: normalize(18),
    height: normalize(2.5),
    borderRadius: 1,
    backgroundColor: '#1E293B',
  },

  brandTitle: {
    fontSize: normalize(18),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  storeTypeBadge: {
    fontSize: normalize(9.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
    color: '#002B66',
    letterSpacing: 0.5,
    marginTop: normalize(1),
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bellButton: {
    padding: normalize(6),
    marginRight: normalize(8),
  },

  bellIcon: {
    fontSize: normalize(17),
  },

  avatarWrapper: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },

  sectionHeader: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
    marginTop: normalize(16),
    marginBottom: normalize(8),
  },

  sectionHeaderNoMargin: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748B',
  },

  dateBadgeText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryCol: {
    flex: 1,
  },

  summaryColRight: {
    alignItems: 'flex-end',
  },

  summaryLabel: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Medium,
    color: '#64748B',
  },

  alignRight: {
    textAlign: 'right',
  },

  summaryValueRevenue: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: normalize(4),
  },

  growthText: {
    fontSize: normalize(10),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    marginTop: normalize(3),
  },

  summaryValueBills: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: normalize(4),
  },

  avgTicketText: {
    fontSize: normalize(10),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(3),
  },

  paymentChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(8),
  },

  kpiChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(8),
    marginHorizontal: normalize(2),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },

  kpiChipLabel: {
    fontSize: normalize(9.5),
    fontFamily: Fonts.Figtree_Medium,
    color: '#64748B',
  },

  kpiChipValue: {
    fontSize: normalize(11),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: normalize(2),
  },

  newBillButton: {
    height: normalize(52),
    borderRadius: normalize(10),
    backgroundColor: '#002B66',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    marginTop: normalize(2),
    shadowColor: '#002B66',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  plusCircle: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  plusSign: {
    color: '#002B66',
    fontSize: normalize(16),
    fontWeight: '900',
    lineHeight: normalize(18),
  },

  newBillText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: normalize(17),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    marginLeft: normalize(12),
  },

  newBillArrow: {
    color: '#FFFFFF',
    fontSize: normalize(20),
    fontWeight: '700',
  },

  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
  },

  actionCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(12),
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  actionIconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIcon: {
    fontSize: normalize(20),
  },

  actionTitle: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: normalize(6),
    textAlign: 'center',
  },

  settingsRowCard: {
    height: normalize(44),
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(14),
    marginTop: normalize(10),
  },

  settingsIcon: {
    fontSize: normalize(16),
  },

  settingsText: {
    flex: 1,
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: normalize(10),
  },

  settingsArrow: {
    fontSize: normalize(16),
    color: '#94A3B8',
    fontWeight: '600',
  },

  staffCard: {
    marginTop: normalize(10),
    width: '100%',
  },

  recentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(20),
    marginBottom: normalize(10),
  },

  viewAllText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#0F172A',
  },

  activityList: {
    backgroundColor: '#FFFFFF',
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },

  activityIconBox: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(8),
    backgroundColor: '#F0F6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },

  activityItemIcon: {
    fontSize: normalize(16),
  },

  activityInfo: {
    flex: 1,
  },

  activityInvNumber: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#1E293B',
  },

  activityTimeMethod: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(2),
  },

  activityAmountContainer: {
    alignItems: 'flex-end',
  },

  activityAmount: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
  },

  activityStatusTag: {
    fontSize: normalize(9),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    marginTop: normalize(2),
  },

  statusPaid: {
    color: '#10B981',
  },

  statusOther: {
    color: '#F59E0B',
  },

  emptyActivityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(12),
    padding: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: normalize(4),
  },

  emptyActivityIcon: {
    fontSize: normalize(28),
    marginBottom: normalize(8),
  },

  emptyActivityTitle: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#1E293B',
  },

  emptyActivitySubtitle: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: normalize(4),
    lineHeight: normalize(16),
  },

  emptyCreateButton: {
    marginTop: normalize(12),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    backgroundColor: '#002B66',
    borderRadius: normalize(8),
  },

  emptyCreateButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
  },

  statusCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(12),
    padding: normalize(14),
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  cloudRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIndicatorGreen: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(4),
    backgroundColor: '#10B981',
    marginRight: normalize(8),
  },

  cloudIcon: {
    fontSize: normalize(14),
    marginRight: normalize(6),
  },

  cloudText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#334155',
  },

  printersText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#475569',
    marginTop: normalize(5),
  },

  progressBarTrack: {
    height: normalize(4),
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: normalize(10),
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#043377',
    borderRadius: 2,
  },

  memoryText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(6),
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: normalize(10),
    padding: normalize(12),
    marginBottom: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  errorTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: normalize(8),
  },

  errorIcon: {
    fontSize: normalize(16),
    marginRight: normalize(6),
  },

  errorText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Medium,
    color: '#B91C1C',
    flex: 1,
  },

  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(6),
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
  },

  skeletonContainer: {
    paddingVertical: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },

  skeletonCard: {
    padding: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  skeletonLoadingText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    color: '#64748B',
    marginTop: normalize(12),
  },
});
