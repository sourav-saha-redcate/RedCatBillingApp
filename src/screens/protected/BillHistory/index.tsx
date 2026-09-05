import React, { useState, useMemo } from 'react';
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
];

type FilterType = 'Today' | 'This week' | 'This month' | 'Custom';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'Today', label: 'Today' },
  { id: 'This week', label: 'This week' },
  { id: 'This month', label: 'This month' },
  { id: 'Custom', label: '📅 Custom' },
];

const BillHistory: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('Today');
  const [menuModalVisible, setMenuModalVisible] = useState(false);

  // Filter bills by search query and active tab
  const filteredBills = useMemo(() => {
    let list = INITIAL_BILLS;

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        b =>
          b.billNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.phone.toLowerCase().includes(q)
      );
    }

    if (activeFilter === 'Today') {
      // In 'Today' tab, show all demo bills with Yesterday section
      return list;
    } else if (activeFilter === 'This week') {
      return list;
    } else if (activeFilter === 'This month') {
      return list;
    }

    return list;
  }, [searchQuery, activeFilter]);

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
          {FILTERS.map(filter => {
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
                  setActiveFilter(filter.id);
                  if (filter.id === 'Custom') {
                    showMessage('Select custom date range');
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

      {/* Bill List */}
      <FlatList
        data={filteredBills}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>🧾</Text>
            <Text style={styles.emptyStateTitle}>No bills found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try searching with another bill number or customer name
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          // Check if this item is the first one in the "Yesterday" section
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
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'PAID' && styles.statusPaid,
                      item.status === 'REFUNDED' && styles.statusRefunded,
                      item.status === 'PENDING' && styles.statusPending,
                    ]}>
                    {item.status}
                  </Text>
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
    </SafeAreaView>
  );
};

export default BillHistory;
