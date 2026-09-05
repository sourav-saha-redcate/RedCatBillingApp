import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import styles from './style';

interface DailyReportData {
  dateLabel: string;
  subLabel: string;
  totalRevenue: string;
  trendText: string;
  billsCount: number;
  customers: number;
  avgBill: string;
  peakHour: string;
  hourlyBars: { hour: string; percentage: number; amount: string; isPeak?: boolean }[];
  topServices: { rank: number; name: string; sessions: number; revenue: string }[];
  staff: { name: string; avatarColor: string; clients: number }[];
  efficiency: string;
}

const REPORT_DAYS: DailyReportData[] = [
  {
    dateLabel: 'Oct 24, 2023 (Today)',
    subLabel: 'VIEWING REPORT FOR',
    totalRevenue: '₹ 84,250.00',
    trendText: '📈 12% vs Yesterday',
    billsCount: 142,
    customers: 118,
    avgBill: '₹593',
    peakHour: 'Peak: 12:00 PM',
    hourlyBars: [
      { hour: '09h', percentage: 35, amount: '₹8,500' },
      { hour: '11h', percentage: 65, amount: '₹18,200' },
      { hour: '13h', percentage: 100, amount: '₹26,400', isPeak: true },
      { hour: '15h', percentage: 50, amount: '₹12,800' },
      { hour: '17h', percentage: 75, amount: '₹21,150' },
      { hour: '19h', percentage: 40, amount: '₹9,200' },
    ],
    topServices: [
      { rank: 1, name: 'Standard Checkup', sessions: 42, revenue: '₹21,000' },
      { rank: 2, name: 'Lab Tests - Panel A', sessions: 31, revenue: '₹38,750' },
      { rank: 3, name: 'Emergency Consult', sessions: 18, revenue: '₹9,000' },
    ],
    staff: [
      { name: 'Dr. Arnab S.', avatarColor: '#0284C7', clients: 45 },
      { name: 'Rohan Mehra', avatarColor: '#D97706', clients: 38 },
      { name: 'Priya Verma', avatarColor: '#0D9488', clients: 35 },
    ],
    efficiency: '+14%',
  },
  {
    dateLabel: 'Oct 23, 2023 (Yesterday)',
    subLabel: 'VIEWING REPORT FOR',
    totalRevenue: '₹ 75,200.00',
    trendText: '📈 5% vs Sunday',
    billsCount: 128,
    customers: 105,
    avgBill: '₹587',
    peakHour: 'Peak: 01:00 PM',
    hourlyBars: [
      { hour: '09h', percentage: 30, amount: '₹6,900' },
      { hour: '11h', percentage: 55, amount: '₹14,500' },
      { hour: '13h', percentage: 95, amount: '₹24,100', isPeak: true },
      { hour: '15h', percentage: 45, amount: '₹10,800' },
      { hour: '17h', percentage: 70, amount: '₹18,500' },
      { hour: '19h', percentage: 35, amount: '₹7,400' },
    ],
    topServices: [
      { rank: 1, name: 'Standard Checkup', sessions: 38, revenue: '₹19,000' },
      { rank: 2, name: 'Lab Tests - Panel A', sessions: 28, revenue: '₹35,000' },
      { rank: 3, name: 'Emergency Consult', sessions: 15, revenue: '₹7,500' },
    ],
    staff: [
      { name: 'Dr. Arnab S.', avatarColor: '#0284C7', clients: 40 },
      { name: 'Rohan Mehra', avatarColor: '#D97706', clients: 34 },
      { name: 'Priya Verma', avatarColor: '#0D9488', clients: 31 },
    ],
    efficiency: '+11%',
  },
  {
    dateLabel: 'Oct 22, 2023 (Sunday)',
    subLabel: 'VIEWING REPORT FOR',
    totalRevenue: '₹ 71,500.00',
    trendText: '📉 2% vs Saturday',
    billsCount: 119,
    customers: 98,
    avgBill: '₹600',
    peakHour: 'Peak: 11:30 AM',
    hourlyBars: [
      { hour: '09h', percentage: 25, amount: '₹5,200' },
      { hour: '11h', percentage: 85, amount: '₹22,400', isPeak: true },
      { hour: '13h', percentage: 70, amount: '₹17,800' },
      { hour: '15h', percentage: 40, amount: '₹9,600' },
      { hour: '17h', percentage: 60, amount: '₹15,000' },
      { hour: '19h', percentage: 30, amount: '₹6,500' },
    ],
    topServices: [
      { rank: 1, name: 'Standard Checkup', sessions: 35, revenue: '₹17,500' },
      { rank: 2, name: 'Lab Tests - Panel A', sessions: 25, revenue: '₹31,250' },
      { rank: 3, name: 'Emergency Consult', sessions: 12, revenue: '₹6,000' },
    ],
    staff: [
      { name: 'Dr. Arnab S.', avatarColor: '#0284C7', clients: 36 },
      { name: 'Rohan Mehra', avatarColor: '#D97706', clients: 32 },
      { name: 'Priya Verma', avatarColor: '#0D9488', clients: 30 },
    ],
    efficiency: '+9%',
  },
];

const DailySummary: React.FC = () => {
  const navigation = useNavigation<any>();
  const [dayIndex, setDayIndex] = useState(0);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);

  const currentReport = REPORT_DAYS[dayIndex];

  const handlePrevDay = () => {
    if (dayIndex < REPORT_DAYS.length - 1) {
      setDayIndex(prev => prev + 1);
    } else {
      showMessage('No older report data available');
    }
  };

  const handleNextDay = () => {
    if (dayIndex > 0) {
      setDayIndex(prev => prev - 1);
    } else {
      showMessage('Viewing latest available report');
    }
  };

  const handleShareReport = async () => {
    try {
      const servicesText = currentReport.topServices
        .map(s => `${s.rank}. ${s.name}: ${s.revenue} (${s.sessions} sessions)`)
        .join('\n');

      const message = `*DAILY REVENUE SUMMARY*\nDate: ${currentReport.dateLabel}\nTotal Revenue: ${currentReport.totalRevenue} (${currentReport.trendText})\nBills Count: ${currentReport.billsCount}\nCustomers: ${currentReport.customers}\nAverage Bill: ${currentReport.avgBill}\n\n*Top Services:*\n${servicesText}\n\nStaff Efficiency: ${currentReport.efficiency}`;

      await Share.share({
        title: `Daily Summary - ${currentReport.dateLabel}`,
        message,
      });
    } catch (e) {
      showMessage('Could not share report');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backArrowText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Summary</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => setCalendarModalVisible(true)}>
            <Text style={styles.headerIconText}>📅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={handleShareReport}>
            <Text style={styles.headerIconText}>↗️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Date Navigation Bar */}
        <View style={styles.dateNavBar}>
          <TouchableOpacity
            style={styles.dateNavArrowBtn}
            activeOpacity={0.7}
            onPress={handlePrevDay}>
            <Text style={styles.dateNavArrowText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateCenterCol}
            activeOpacity={0.8}
            onPress={() => setCalendarModalVisible(true)}>
            <Text style={styles.dateSubLabel}>{currentReport.subLabel}</Text>
            <Text style={styles.dateMainText}>{currentReport.dateLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateNavArrowBtn}
            activeOpacity={0.7}
            onPress={handleNextDay}>
            <Text style={styles.dateNavArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Hero KPI Card: Total Revenue */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL REVENUE</Text>
          <Text style={styles.heroAmount}>{currentReport.totalRevenue}</Text>
          <View style={styles.trendPill}>
            <Text style={styles.trendPillText}>{currentReport.trendText}</Text>
          </View>
        </View>

        {/* Stacked Compact Metric Cards */}
        {/* Bills Count */}
        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Text style={styles.metricIcon}>📄</Text>
          </View>
          <View style={styles.metricTextCol}>
            <Text style={styles.metricLabel}>Bills Count</Text>
            <Text style={styles.metricValue}>{currentReport.billsCount}</Text>
          </View>
        </View>

        {/* Customers */}
        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Text style={styles.metricIcon}>👥</Text>
          </View>
          <View style={styles.metricTextCol}>
            <Text style={styles.metricLabel}>Customers</Text>
            <Text style={styles.metricValue}>{currentReport.customers}</Text>
          </View>
        </View>

        {/* Avg/Bill */}
        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Text style={styles.metricIcon}>⏱️</Text>
          </View>
          <View style={styles.metricTextCol}>
            <Text style={styles.metricLabel}>Avg/Bill</Text>
            <Text style={styles.metricValue}>{currentReport.avgBill}</Text>
          </View>
        </View>

        {/* Hourly Revenue Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Hourly Revenue</Text>
            <View style={styles.peakBadge}>
              <Text style={styles.peakBadgeText}>{currentReport.peakHour}</Text>
            </View>
          </View>

          <View style={styles.barsContainer}>
            {currentReport.hourlyBars.map((bar, idx) => {
              const barHeight = Math.max(16, (bar.percentage / 100) * 80);
              const isPeak = bar.isPeak;

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.barCol}
                  activeOpacity={0.7}
                  onPress={() =>
                    showMessage(`${bar.hour}: Revenue ${bar.amount}`)
                  }>
                  <View style={[styles.barTrack, { height: 80 }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: isPeak ? '#082154' : '#E2E8F0',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      isPeak && styles.barLabelActive,
                    ]}>
                    {bar.hour}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Top Services Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Top Services</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => showMessage('Viewing full services catalog breakdown')}>
            <Text style={styles.viewAllText}>VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {currentReport.topServices.map(service => (
          <View key={service.rank} style={styles.serviceItemCard}>
            <View style={styles.serviceLeftRow}>
              <View
                style={[
                  styles.rankBox,
                  service.rank === 1
                    ? styles.rankBoxFirst
                    : styles.rankBoxOther,
                ]}>
                <Text
                  style={[
                    styles.rankText,
                    service.rank === 1
                      ? styles.rankTextFirst
                      : styles.rankTextOther,
                  ]}>
                  {service.rank}
                </Text>
              </View>

              <View style={styles.serviceInfoCol}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceSessions}>
                  {service.sessions} sessions
                </Text>
              </View>
            </View>

            <Text style={styles.serviceRevenue}>{service.revenue}</Text>
          </View>
        ))}

        {/* Staff Performance Section */}
        <Text style={[styles.sectionHeading, { marginTop: 14, marginBottom: 10 }]}>
          Staff Performance
        </Text>

        <View style={styles.staffGrid}>
          {currentReport.staff.map((member, idx) => (
            <View key={idx} style={styles.staffCard}>
              <View style={styles.staffHeaderRow}>
                <View
                  style={[
                    styles.staffAvatar,
                    { backgroundColor: member.avatarColor },
                  ]}>
                  <Text style={styles.staffAvatarText}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.staffName} numberOfLines={1}>
                  {member.name}
                </Text>
              </View>

              <Text style={styles.staffServedLabel}>SERVED</Text>
              <Text style={styles.staffClientsCount}>
                {member.clients} Clients
              </Text>
            </View>
          ))}

          {/* Efficiency Card */}
          <View style={styles.efficiencyCard}>
            <Text style={styles.efficiencyIcon}>📈</Text>
            <Text style={styles.efficiencyLabel}>EFFICIENCY</Text>
            <Text style={styles.efficiencyValue}>
              {currentReport.efficiency}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={calendarModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setCalendarModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Report Date</Text>
                  <TouchableOpacity
                    onPress={() => setCalendarModalVisible(false)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {REPORT_DAYS.map((report, idx) => {
                  const isSelected = dayIndex === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dateOptionItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        setDayIndex(idx);
                        setCalendarModalVisible(false);
                      }}>
                      <View>
                        <Text style={styles.dateOptionText}>
                          {report.dateLabel}
                        </Text>
                        <Text style={styles.dateOptionSubtext}>
                          Revenue: {report.totalRevenue} • {report.billsCount} bills
                        </Text>
                      </View>
                      {isSelected && (
                        <Text
                          style={{
                            fontSize: 16,
                            color: '#10B981',
                            fontWeight: '700',
                          }}>
                          ✓
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default DailySummary;
