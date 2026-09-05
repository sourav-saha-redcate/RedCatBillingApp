import React from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';

interface HomeProps {
  navigation: any;
}

const RECENT_ACTIVITIES = [
  {
    id: '1',
    invNumber: 'INV-98234',
    timeMethod: '10:45 AM • Cash',
    amount: '₹1,250.00',
    icon: '🛒',
  },
  {
    id: '2',
    invNumber: 'INV-98233',
    timeMethod: '09:15 AM • UPI',
    amount: '₹450.50',
    icon: '🛍️',
  },
  {
    id: '3',
    invNumber: 'INV-98232',
    timeMethod: 'Yesterday • Card',
    amount: '₹3,900.00',
    icon: '📦',
  },
];

const Home: React.FC<HomeProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SideMenu')}
              style={styles.menuButton}>
              <View style={styles.menuIconBox}>
                <View style={styles.menuBar} />
                <View style={[styles.menuBar, { width: normalize(14) }]} />
                <View style={styles.menuBar} />
              </View>
            </TouchableOpacity>
            <Text style={styles.brandTitle}>RC Billing</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
              onPress={() => showMessage('No new notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => showMessage('Account profile')}
              style={styles.avatarWrapper}>
              <Image
                source={Icons.profile}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUMMARY TODAY */}
        <Text style={styles.sectionHeader}>SUMMARY TODAY</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValueRevenue}>₹42,850.00</Text>
          </View>
          <View style={[styles.summaryCol, styles.summaryColRight]}>
            <Text style={[styles.summaryLabel, styles.alignRight]}>Total Bills</Text>
            <Text style={[styles.summaryValueBills, styles.alignRight]}>124</Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>

        {/* Featured Button: New Bill */}
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

        {/* Settings Card */}
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

        {/* Activity Items */}
        <View style={styles.activityList}>
          {RECENT_ACTIVITIES.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('History')}
              style={styles.activityItem}>
              <View style={styles.activityIconBox}>
                <Text style={styles.activityItemIcon}>{item.icon}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityInvNumber}>{item.invNumber}</Text>
                <Text style={styles.activityTimeMethod}>{item.timeMethod}</Text>
              </View>
              <Text style={styles.activityAmount}>{item.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SYSTEM STATUS */}
        <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
        <View style={styles.statusCard}>
          <View style={styles.cloudRow}>
            <Text style={styles.cloudIcon}>☁️</Text>
            <Text style={styles.cloudText}>Cloud Sync Active</Text>
          </View>
          <Text style={styles.printersText}>
            Printers online: 2 (Thermal Main, Office)
          </Text>
          <View style={styles.progressBarTrack}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.memoryText}>Memory: 2.4GB / 4GB</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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

  summaryValueBills: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: normalize(4),
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

  activityAmount: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
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
    width: '60%',
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
});
