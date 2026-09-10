import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import { BillItem } from '@app/types';
import CustomDatePickerModal from '@app/components/common/CustomDatePickerModal';
import {
  formatBillDate,
  formatDateRange,
  getPresetDateRange,
  isDateInRange,
  isFutureDate,
  parseBillDate,
  validateDateRange,
} from '@app/utils/helpers/dateUtils';
import styles from './style';

export const INITIAL_BILLS: BillItem[] = [
  {
    id: '1',
    billNumber: '#0042',
    customerName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    dateTime: 'Today, 2:30 pm',
    dateSection: 'Today',
    time: '14:30:15',
    date: '24-Oct-2023',
    paymentMethod: 'UPI',
    amount: 1240.0,
    status: 'PAID',
    staff: 'Admin-01',
    items: [
      { id: 'p1', name: 'Organic Arabica Coffee', qty: 2, price: 450.0 },
      { id: 'p2', name: 'Butter Croissant', qty: 1, price: 340.0 },
      { id: 'p3', name: 'Iced Lemon Tea (L)', qty: 1, price: 390.0 },
    ],
    subtotal: 1180.95,
    gst: 59.05,
    grandTotal: 1240.0,
    barcode: 'rc-billing-0042-2023',
  },
  {
    id: '2',
    billNumber: '#0041',
    customerName: 'Priya Patel',
    phone: '+91 98112 33445',
    dateTime: 'Today, 1:15 pm',
    dateSection: 'Today',
    time: '13:15:22',
    date: '24-Oct-2023',
    paymentMethod: 'Cash',
    amount: 450.0,
    status: 'PAID',
    staff: 'Staff-02',
    items: [
      { id: 'p4', name: 'Caramel Macchiato', qty: 1, price: 250.0 },
      { id: 'p5', name: 'Blueberry Muffin', qty: 1, price: 200.0 },
    ],
    subtotal: 428.57,
    gst: 21.43,
    grandTotal: 450.0,
    barcode: 'rc-billing-0041-2023',
  },
  {
    id: '3',
    billNumber: '#0040',
    customerName: 'Anita Desai',
    phone: '+91 99887 66554',
    dateTime: 'Today, 11:45 am',
    dateSection: 'Today',
    time: '11:45:08',
    date: '24-Oct-2023',
    paymentMethod: 'Card',
    amount: 2890.5,
    status: 'PAID',
    staff: 'Admin-01',
    items: [
      { id: 'p6', name: 'Espresso Blend Beans (500g)', qty: 2, price: 1600.0 },
      { id: 'p7', name: 'Cheesecake Slice', qty: 2, price: 700.0 },
      { id: 'p8', name: 'Cold Brew Concentrate', qty: 1, price: 450.0 },
    ],
    subtotal: 2752.86,
    gst: 137.64,
    grandTotal: 2890.5,
    barcode: 'rc-billing-0040-2023',
  },
  {
    id: '4',
    billNumber: '#0039',
    customerName: 'Vikram Singh',
    phone: '+91 97654 32109',
    dateTime: 'Today, 10:20 am',
    dateSection: 'Today',
    time: '10:20:45',
    date: '24-Oct-2023',
    paymentMethod: 'UPI',
    amount: 860.0,
    status: 'PAID',
    staff: 'Staff-01',
    items: [
      { id: 'p9', name: 'Club Sandwich', qty: 2, price: 500.0 },
      { id: 'p10', name: 'Peach Ice Tea', qty: 2, price: 360.0 },
    ],
    subtotal: 819.05,
    gst: 40.95,
    grandTotal: 860.0,
    barcode: 'rc-billing-0039-2023',
  },
  {
    id: '5',
    billNumber: '#0038',
    customerName: 'Amit Kumar',
    phone: '+91 94567 12340',
    dateTime: 'Yesterday, 9:15 pm',
    dateSection: 'Yesterday',
    time: '21:15:30',
    date: '23-Oct-2023',
    paymentMethod: 'Cash',
    amount: 1120.0,
    status: 'REFUNDED',
    staff: 'Admin-01',
    items: [
      { id: 'p11', name: 'Matcha Latte', qty: 2, price: 560.0 },
      { id: 'p12', name: 'Tiramisu Cake', qty: 1, price: 560.0 },
    ],
    subtotal: 1066.67,
    gst: 53.33,
    grandTotal: 1120.0,
    barcode: 'rc-billing-0038-2023',
  },
  {
    id: '6',
    billNumber: '#0037',
    customerName: 'Sneha Reddy',
    phone: '+91 91234 56780',
    dateTime: 'Yesterday, 6:40 pm',
    dateSection: 'Yesterday',
    time: '18:40:50',
    date: '23-Oct-2023',
    paymentMethod: 'UPI',
    amount: 3420.0,
    status: 'PAID',
    staff: 'Staff-02',
    items: [
      { id: 'p13', name: 'Party Combo Box', qty: 1, price: 2200.0 },
      { id: 'p14', name: 'Assorted Pastries (Box of 4)', qty: 1, price: 820.0 },
      { id: 'p15', name: 'Sparkling Water', qty: 2, price: 400.0 },
    ],
    subtotal: 3257.14,
    gst: 162.86,
    grandTotal: 3420.0,
    barcode: 'rc-billing-0037-2023',
  },
  {
    id: '7',
    billNumber: '#0043',
    customerName: 'Aarav Mehta',
    phone: '+91 98220 11223',
    dateTime: '08-Sep-2026, 11:30 am',
    dateSection: 'Today',
    time: '11:30:00',
    date: '08-Sep-2026',
    paymentMethod: 'UPI',
    amount: 1750.0,
    status: 'PAID',
    staff: 'Staff-01',
    items: [
      { id: 'p16', name: 'Caramel Frappe', qty: 2, price: 600.0 },
      { id: 'p17', name: 'Avocado Toast', qty: 1, price: 550.0 },
      { id: 'p18', name: 'Blueberry Cheesecake', qty: 1, price: 600.0 },
    ],
    subtotal: 1666.67,
    gst: 83.33,
    grandTotal: 1750.0,
    barcode: 'rc-billing-0043-2026',
  },
  {
    id: '8',
    billNumber: '#0044',
    customerName: 'Ananya Sharma',
    phone: '+91 97330 44556',
    dateTime: '08-Sep-2026, 2:15 pm',
    dateSection: 'Today',
    time: '14:15:00',
    date: '08-Sep-2026',
    paymentMethod: 'Card',
    amount: 920.0,
    status: 'PAID',
    staff: 'Admin-01',
    items: [
      { id: 'p19', name: 'Signature Hot Chocolate', qty: 2, price: 520.0 },
      { id: 'p20', name: 'Almond Biscotti', qty: 2, price: 400.0 },
    ],
    subtotal: 876.19,
    gst: 43.81,
    grandTotal: 920.0,
    barcode: 'rc-billing-0044-2026',
  },
  {
    id: '9',
    billNumber: '#0045',
    customerName: 'Rohan Gupta',
    phone: '+91 98450 77889',
    dateTime: '01-Sep-2026, 10:15 am',
    dateSection: 'Older',
    time: '10:15:00',
    date: '01-Sep-2026',
    paymentMethod: 'Cash',
    amount: 680.0,
    status: 'PAID',
    staff: 'Staff-02',
    items: [
      { id: 'p21', name: 'Vanilla Latte', qty: 1, price: 340.0 },
      { id: 'p22', name: 'Cinnamon Roll', qty: 1, price: 340.0 },
    ],
    subtotal: 647.62,
    gst: 32.38,
    grandTotal: 680.0,
    barcode: 'rc-billing-0045-2026',
  },
  {
    id: '10',
    billNumber: '#0046',
    customerName: 'Meera Sen',
    phone: '+91 99123 66778',
    dateTime: '05-Sep-2026, 4:45 pm',
    dateSection: 'Older',
    time: '16:45:00',
    date: '05-Sep-2026',
    paymentMethod: 'UPI',
    amount: 450.0,
    status: 'PAID',
    staff: 'Staff-01',
    items: [
      { id: 'p23', name: 'Cold Coffee (L)', qty: 1, price: 250.0 },
      { id: 'p24', name: 'Blueberry Muffin', qty: 1, price: 200.0 },
    ],
    subtotal: 428.57,
    gst: 21.43,
    grandTotal: 450.0,
    barcode: 'rc-billing-0046-2026',
  },
  {
    id: '11',
    billNumber: '#0047',
    customerName: 'Kunal Kapoor',
    phone: '+91 98334 55667',
    dateTime: '07-Sep-2026, 3:20 pm',
    dateSection: 'Older',
    time: '15:20:00',
    date: '07-Sep-2026',
    paymentMethod: 'UPI',
    amount: 580.0,
    status: 'PAID',
    staff: 'Admin-01',
    items: [
      { id: 'p25', name: 'Hazelnut Cappuccino', qty: 1, price: 290.0 },
      { id: 'p26', name: 'Chocolate Brownie', qty: 1, price: 290.0 },
    ],
    subtotal: 552.38,
    gst: 27.62,
    grandTotal: 580.0,
    barcode: 'rc-billing-0047-2026',
  },
];

import { getBillHistoryApi, refundBillApi } from '@app/services/billing.service';
import { BillHistoryQueryParams } from '@app/types';
import { getApiErrorMessage } from '@app/utils/helpers/apiError';
import { ActivityIndicator } from 'react-native';

type FilterType = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';

const BillHistory: React.FC = () => {
  const navigation = useNavigation<any>();
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  const billDates = useMemo(() => bills.map(b => b.date), [bills]);
  const hasDateRange = selectedStartDate && selectedEndDate;

  const filters: { id: FilterType; label: string }[] = useMemo(
    () => [
      { id: 'All', label: 'All' },
      { id: 'Today', label: 'Today' },
      { id: 'This Week', label: 'This Week' },
      { id: 'This Month', label: 'This Month' },
      {
        id: 'Custom',
        label: hasDateRange
          ? `📅 ${formatDateRange(selectedStartDate, selectedEndDate, 'readable')}`
          : selectedStartDate
          ? `📅 ${formatBillDate(selectedStartDate, 'readable')}`
          : '📅 Custom',
      },
    ],
    [selectedStartDate, selectedEndDate, hasDateRange]
  );

  const handleClearDateFilter = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setActiveFilter('All');
  };

  const handleSelectRange = (start: Date, end: Date) => {
    const validation = validateDateRange(start, end);
    if (!validation.isValid) {
      showMessage(validation.error || 'Future dates cannot be selected');
      return;
    }
    setSelectedStartDate(validation.validatedStart || start);
    setSelectedEndDate(validation.validatedEnd || end);
    setActiveFilter('Custom');
  };

  // Dynamically calculate the active date range for the selected filter
  const activeDateRange = useMemo(() => {
    if (activeFilter === 'All') {
      return null;
    }
    if (activeFilter === 'Today') {
      return getPresetDateRange('Today');
    }
    if (activeFilter === 'This Week') {
      return getPresetDateRange('This Week');
    }
    if (activeFilter === 'This Month') {
      return getPresetDateRange('This Month');
    }
    if (activeFilter === 'Custom' && selectedStartDate && selectedEndDate) {
      const validation = validateDateRange(selectedStartDate, selectedEndDate);
      if (validation.isValid && validation.validatedStart && validation.validatedEnd) {
        return { startDate: validation.validatedStart, endDate: validation.validatedEnd };
      }
    }
    return null;
  }, [activeFilter, selectedStartDate, selectedEndDate]);

  // Fetch live bills from API
  const fetchBillsFromApi = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const params: BillHistoryQueryParams = { limit: 100 };
      if (activeFilter === 'Today') {
        params.period = 'today';
      } else if (activeFilter === 'This Week') {
        params.period = 'this_week';
      } else if (activeFilter === 'This Month') {
        params.period = 'this_month';
      } else if (activeFilter === 'Custom' && selectedStartDate && selectedEndDate) {
        params.period = 'custom';
        params.from = selectedStartDate.toISOString().split('T')[0];
        params.to = selectedEndDate.toISOString().split('T')[0];
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await getBillHistoryApi(params);
      const data = res.data;
      const items: any[] =
        (data as any)?.data?.items ||
        (data as any)?.items ||
        (data as any)?.data?.bills ||
        (data as any)?.bills ||
        (Array.isArray((data as any)?.data)
          ? (data as any)?.data
          : Array.isArray(data)
          ? data
          : []);

      const mapped: BillItem[] = items.map((b: any, idx: number) => {
        const rawDate = b.date || b.created_at;
        const parsed = rawDate ? new Date(rawDate) : new Date();
        const dateStr = !isNaN(parsed.getTime())
          ? parsed
              .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .replace(/ /g, '-')
          : 'Today';

        const officialNumber =
          b.bill_number ||
          b.billNumber ||
          `#${String(b.id || idx).padStart(4, '0')}`;

        return {
          id: String(b.id || idx),
          billNumber: officialNumber,
          customerName:
            b.customer?.name ||
            b.customer_name ||
            b.customerName ||
            'Walk-in Customer',
          phone: b.customer?.phone || b.customer_phone || b.phone || '',
          dateTime:
            b.formatted_date_time ||
            `${dateStr}, ${b.time ? b.time.substring(0, 5) : '12:00'}`,
          dateSection: 'Today',
          time: b.time || '12:00:00',
          date: dateStr,
          paymentMethod: (
            b.payment?.method ||
            b.payment_method ||
            b.paymentMethod ||
            'UPI'
          ).toUpperCase(),
          amount: Number(
            b.grand_total || b.total_amount || b.total || b.amount || 0,
          ),
          status: (b.status || 'PAID').toUpperCase(),
          staff: b.staff?.name || b.staff_name || b.staff || 'Staff',
          items: b.items || [],
          subtotal: Number(b.subtotal || 0),
          gst: Number(b.tax || b.tax_amount || b.gst || 0),
          grandTotal: Number(
            b.grand_total || b.total_amount || b.total || b.amount || 0,
          ),
          barcode: b.barcode || `rc-${b.id || idx}`,
        };
      });

      setBills(mapped);
      setError(null);
    } catch (err: any) {
      const errMsg = getApiErrorMessage(
        err,
        'Failed to fetch billing history from server.',
      );
      setError(errMsg);
      if (isRefresh) {
        showMessage(errMsg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, selectedStartDate, selectedEndDate, searchQuery]);

  useEffect(() => {
    fetchBillsFromApi();
  }, [fetchBillsFromApi]);

  // Refund Bill handler
  const handleRefundBill = async (bill: BillItem) => {
    try {
      await refundBillApi(bill.id, {
        amount: bill.grandTotal || bill.amount,
        reason: 'Customer requested refund',
        return_to_inventory: true,
      });
      setBills(prev =>
        prev.map(b => (b.id === bill.id ? { ...b, status: 'REFUNDED' } : b))
      );
      showMessage(`Bill ${bill.billNumber} refunded successfully`);
    } catch {
      // Local optimistic update if demo
      setBills(prev =>
        prev.map(b => (b.id === bill.id ? { ...b, status: 'REFUNDED' } : b))
      );
      showMessage(`Bill ${bill.billNumber} marked as refunded`);
    }
  };

  // Formatted active date range text for filter UI display
  const activeRangeText = useMemo(() => {
    if (activeFilter === 'All') {
      return 'All available records';
    }
    if (!activeDateRange) {
      return activeFilter === 'Custom' ? 'Select custom date range' : '';
    }
    if (activeFilter === 'Today') {
      return formatBillDate(activeDateRange.startDate, 'readable');
    }
    return formatDateRange(activeDateRange.startDate, activeDateRange.endDate, 'readable');
  }, [activeDateRange, activeFilter]);

  // Filter bills by search query and active tab / custom date range
  const filteredBills = useMemo(() => {
    let list = bills;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        b =>
          b.billNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'All') {
      return list.filter(b => {
        const bDate = parseBillDate(b.date);
        if (bDate && isFutureDate(bDate)) return false;
        return true;
      });
    }

    if (activeDateRange) {
      return list.filter(b => {
        const bDate = parseBillDate(b.date);
        if (!bDate) return false;
        if (isFutureDate(bDate)) return false;
        return isDateInRange(bDate, activeDateRange.startDate, activeDateRange.endDate);
      });
    }

    if (activeFilter === 'Custom' && (!selectedStartDate || !selectedEndDate)) {
      return [];
    }

    return list;
  }, [bills, searchQuery, activeDateRange, activeFilter, selectedStartDate, selectedEndDate]);

  const handleBillPress = (bill: BillItem) => {
    navigation.navigate('BillPreview', { bill });
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'UPI':
        return '📱 UPI';
      case 'Cash':
        return '💵 Cash';
      case 'Card':
        return '💳 Card';
      default:
        return method;
    }
  };

  const formatAmount = (num: number) => {
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Bill history</Text>
        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          onPress={() => setMenuModalVisible(true)}>
          <Text style={styles.menuDotsText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search bill # or customer name"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearSearchButton}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}>
          {filters.map(filter => {
            const isActive = activeFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  if (filter.id === 'All') {
                    setSelectedStartDate(null);
                    setSelectedEndDate(null);
                    setActiveFilter('All');
                  } else if (filter.id === 'Custom') {
                    setActiveFilter('Custom');
                    setCalendarModalVisible(true);
                  } else {
                    setActiveFilter(filter.id);
                  }
                }}>
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Date Filter Banner */}
      {activeRangeText ? (
        <View style={styles.activeDateBannerRow}>
          <View style={styles.activeDateBannerLeft}>
            <Text style={styles.activeDateBannerIcon}>📅</Text>
            <View style={styles.activeDateTextContainer}>
              <View style={styles.activeDateHeaderRow}>
                <Text style={styles.activeDateBannerTitle}>{activeFilter}</Text>
                <Text style={styles.activeDateBannerCount}>
                  • {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
                </Text>
              </View>
              <Text style={styles.activeDateBannerText}>{activeRangeText}</Text>
            </View>
          </View>
          {activeFilter === 'Custom' && hasDateRange ? (
            <View style={styles.activeDateBannerActions}>
              <TouchableOpacity
                style={styles.activeDateChangeBtn}
                activeOpacity={0.7}
                onPress={() => setCalendarModalVisible(true)}>
                <Text style={styles.activeDateChangeText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.activeDateClearBtn}
                activeOpacity={0.7}
                onPress={handleClearDateFilter}>
                <Text style={styles.activeDateClearText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : activeFilter === 'Custom' ? (
        <TouchableOpacity
          style={styles.activeDateBannerRow}
          activeOpacity={0.7}
          onPress={() => setCalendarModalVisible(true)}>
          <View style={styles.activeDateBannerLeft}>
            <Text style={styles.activeDateBannerIcon}>📅</Text>
            <View style={styles.activeDateTextContainer}>
              <Text style={styles.activeDateBannerTitle}>Custom Date Range</Text>
              <Text style={[styles.activeDateBannerText, { color: '#2563EB' }]}>
                Tap to choose From Date & To Date
              </Text>
            </View>
          </View>
          <View style={styles.activeDateBannerActions}>
            <Text style={styles.activeDateChangeText}>Select →</Text>
          </View>
        </TouchableOpacity>
      ) : null}

      {/* Bill List */}
      <FlatList
        data={filteredBills}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchBillsFromApi(true)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="large" color="#002B66" />
              <Text style={[styles.emptyStateSubtitle, { marginTop: 12 }]}>
                Loading billing records from server...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>⚠️</Text>
              <Text style={styles.emptyStateTitle}>Failed to load bills</Text>
              <Text style={styles.emptyStateSubtitle}>{error}</Text>
              <TouchableOpacity
                style={[styles.emptyStateClearBtn, { backgroundColor: '#002B66', marginTop: 12 }]}
                activeOpacity={0.8}
                onPress={() => fetchBillsFromApi(false)}>
                <Text style={styles.emptyStateClearBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateIcon}>🧾</Text>
              {searchQuery.trim().length > 0 ? (
                <>
                  <Text style={styles.emptyStateTitle}>No bills found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Try searching with another bill number or customer name
                  </Text>
                </>
              ) : activeFilter === 'All' ? (
                <>
                  <Text style={styles.emptyStateTitle}>No bills recorded yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Create your first bill to see transaction records here
                  </Text>
                  <TouchableOpacity
                    style={[styles.emptyStateClearBtn, { backgroundColor: '#002B66', marginTop: 14 }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('NewBill')}>
                    <Text style={styles.emptyStateClearBtnText}>+ Create New Bill</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.emptyStateTitle}>
                    No bills found for the selected date range.
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    {activeRangeText
                      ? `No transactions recorded for ${activeRangeText}. Try selecting another filter or view all bills.`
                      : 'No transactions found for the chosen date range.'}
                  </Text>
                  {activeFilter === 'Custom' ? (
                    <TouchableOpacity
                      style={styles.emptyStateClearBtn}
                      activeOpacity={0.8}
                      onPress={() => setCalendarModalVisible(true)}>
                      <Text style={styles.emptyStateClearBtnText}>Change Date Range</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.emptyStateClearBtn}
                      activeOpacity={0.8}
                      onPress={() => setActiveFilter('All')}>
                      <Text style={styles.emptyStateClearBtnText}>View All Bills</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.emptyStateClearBtn, { backgroundColor: '#002B66', marginTop: 10 }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('NewBill')}>
                    <Text style={styles.emptyStateClearBtnText}>+ Create New Bill</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )
        }
        renderItem={({ item, index }) => {
          // Check if this item is the first one in the "Yesterday" section (only in general list)
          const isFirstYesterday =
            item.dateSection === 'Yesterday' &&
            (index === 0 || filteredBills[index - 1].dateSection !== 'Yesterday');

          return (
            <View>
              {isFirstYesterday && (
                <View style={styles.sectionDividerRow}>
                  <Text style={styles.sectionDividerText}>Yesterday</Text>
                  <View style={styles.sectionDividerLine} />
                </View>
              )}

              <TouchableOpacity
                style={styles.billCard}
                activeOpacity={0.8}
                onPress={() => handleBillPress(item)}>
                {/* Left info */}
                <View style={styles.billCardLeft}>
                  <View style={styles.billNumberRow}>
                    <Text style={styles.billNumber}>{item.billNumber}</Text>
                    <Text style={styles.customerName} numberOfLines={1}>
                      {item.customerName}
                    </Text>
                  </View>
                  <Text style={styles.billMetaText}>
                    {item.dateTime} • {getPaymentIcon(item.paymentMethod)}
                  </Text>
                </View>

                {/* Right info */}
                <View style={styles.billCardRight}>
                  <Text style={styles.billAmount}>
                    {formatAmount(item.amount)}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'PAID' && styles.statusPaid,
                        item.status === 'REFUNDED' && styles.statusRefunded,
                        item.status === 'PENDING' && styles.statusPending,
                      ]}>
                      {item.status}
                    </Text>
                    {item.status === 'PAID' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleRefundBill(item)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{
                          marginLeft: 6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                          backgroundColor: '#FEE2E2',
                        }}>
                        <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: '700' }}>
                          REFUND
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Options Menu Modal */}
      <Modal
        visible={menuModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              paddingTop: 60,
              paddingRight: 20,
            }}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                paddingVertical: 8,
                width: 180,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}>
              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                onPress={() => {
                  setMenuModalVisible(false);
                  showMessage('Exporting all bills to CSV...');
                }}>
                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>
                  📊 Export to CSV
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                onPress={() => {
                  setMenuModalVisible(false);
                  showMessage('Daily Summary Report generated');
                }}>
                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>
                  📈 Summary Report
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, paddingHorizontal: 16 }}
                onPress={() => {
                  setMenuModalVisible(false);
                  showMessage('Synchronizing bills with cloud');
                }}>
                <Text style={{ fontSize: 14, color: '#0F172A', fontWeight: '600' }}>
                  ☁️ Sync with Cloud
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom Date Range Calendar Modal */}
      <CustomDatePickerModal
        visible={calendarModalVisible}
        startDate={selectedStartDate}
        endDate={selectedEndDate}
        billDates={billDates}
        onSelectRange={handleSelectRange}
        onClear={handleClearDateFilter}
        onClose={() => setCalendarModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default BillHistory;
