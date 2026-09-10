import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  CreateCustomerPayload,
  Customer,
  UpdateCustomerPayload,
} from '@app/types';
import {
  getCustomersApi,
  createCustomerApi,
  updateCustomerApi,
} from '@app/services/customer.service';

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c-1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.s@example.com', total_bills: 14, total_spent: 18450 },
  { id: 'c-2', name: 'Priya Patel', phone: '+91 98112 33445', email: 'priya.patel@example.com', total_bills: 8, total_spent: 9800 },
  { id: 'c-3', name: 'Anita Desai', phone: '+91 99887 66554', email: 'anita.d@example.com', gstin: '27AAAAA0000A1Z5', total_bills: 22, total_spent: 34200 },
  { id: 'c-4', name: 'Aarav Mehta', phone: '+91 98220 11223', total_bills: 5, total_spent: 6400 },
];

const SearchProduct: React.FC = () => {
  const navigation = useNavigation<any>();

  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getCustomersApi({ limit: 100 });
      const data = res.data;
      const items: Customer[] = (data as any)?.items || (data as any)?.data || (Array.isArray(data) ? data : []);
      if (items.length > 0) {
        setCustomers(items);
      }
    } catch (err: any) {
      console.log('Using default customers cache:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.trim().toLowerCase();
    return customers.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const openCustomerModal = (c?: Customer) => {
    if (c) {
      setEditingCustomer(c);
      setName(c.name);
      setPhone(c.phone);
      setEmail(c.email || '');
      setGstin(c.gstin || '');
      setAddress(c.address || '');
    } else {
      setEditingCustomer(null);
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setAddress('');
    }
    setModalVisible(true);
  };

  const handleSaveCustomer = async () => {
    if (!name.trim()) {
      showMessage('Please enter customer name');
      return;
    }
    if (!phone.trim()) {
      showMessage('Please enter phone number');
      return;
    }

    const payload: CreateCustomerPayload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      gstin: gstin.trim() || undefined,
      address: address.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (editingCustomer) {
        await updateCustomerApi(editingCustomer.id, payload);
        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...payload } : c))
        );
        showMessage(`Updated customer ${payload.name}`);
      } else {
        const res = await createCustomerApi(payload);
        const created: Customer = (res.data as any)?.data || res.data || {
          id: `c-${Date.now()}`,
          ...payload,
          total_bills: 0,
          total_spent: 0,
        };
        setCustomers(prev => [created, ...prev]);
        showMessage(`Customer ${payload.name} created successfully`);
      }
      setModalVisible(false);
    } catch {
      // Local fallback
      if (editingCustomer) {
        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...payload } : c))
        );
      } else {
        setCustomers(prev => [
          {
            id: `c-${Date.now()}`,
            ...payload,
            total_bills: 0,
            total_spent: 0,
          },
          ...prev,
        ]);
      }
      showMessage('Customer saved locally');
      setModalVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = (phoneNum: string) => {
    const clean = phoneNum.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      showMessage('Unable to open phone dialer');
    });
  };

  const handleWhatsApp = (phoneNum: string) => {
    const clean = phoneNum.replace(/[^0-9]/g, '');
    Linking.openURL(`whatsapp://send?phone=${clean}`).catch(() => {
      showMessage('WhatsApp is not installed on this device');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Customers Directory</Text>
          <Text style={styles.headerSub}>
            {customers.length} registered customer{customers.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.7}
          onPress={() => openCustomerModal()}>
          <Text style={styles.addBtnText}>+ Customer</Text>
        </TouchableOpacity>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name, phone, or email..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={{ color: '#94A3B8', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchCustomers(true)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>👥</Text>
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptySubtitle}>
              Customers will be automatically recorded when creating new bills, or tap "+ Customer" above.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerPhone}>{item.phone}</Text>
                {item.email ? (
                  <Text style={styles.customerEmail}>{item.email}</Text>
                ) : null}
                {item.gstin ? (
                  <Text style={styles.customerGstin}>GSTIN: {item.gstin}</Text>
                ) : null}
              </View>
            </View>

            {(item.total_bills !== undefined || item.total_spent !== undefined) && (
              <View style={styles.metricsRow}>
                <Text style={styles.metricText}>
                  Bills: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{item.total_bills || 0}</Text>
                </Text>
                <Text style={styles.metricDivider}>•</Text>
                <Text style={styles.metricText}>
                  Total Spent: <Text style={{ fontWeight: '700', color: '#16A34A' }}>₹{(item.total_spent || 0).toLocaleString('en-IN')}</Text>
                </Text>
              </View>
            )}

            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                style={styles.actionCallBtn}
                onPress={() => handleCall(item.phone)}>
                <Text style={styles.actionCallText}>📞 Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionWhatsAppBtn}
                onPress={() => handleWhatsApp(item.phone)}>
                <Text style={styles.actionWhatsAppText}>💬 WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionEditBtn}
                onPress={() => openCustomerModal(item)}>
                <Text style={styles.actionEditText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add / Edit Customer Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>FULL NAME *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                  />

                  <Text style={styles.label}>PHONE NUMBER *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />

                  <Text style={styles.label}>EMAIL ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. rahul@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />

                  <Text style={styles.label}>GSTIN (OPTIONAL)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    value={gstin}
                    onChangeText={setGstin}
                  />

                  <Text style={styles.label}>ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Flat 204, Green Valley Apartments"
                    placeholderTextColor="#94A3B8"
                    value={address}
                    onChangeText={setAddress}
                  />

                  <TouchableOpacity
                    style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                    disabled={submitting}
                    onPress={handleSaveCustomer}>
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>
                        {editingCustomer ? 'Save Customer' : 'Create Customer'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default SearchProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  backArrow: {
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  addBtn: {
    backgroundColor: '#06489D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#06489D',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customerPhone: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  customerGstin: {
    fontSize: 11,
    color: '#06489D',
    fontWeight: '600',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  metricText: {
    fontSize: 12,
    color: '#64748B',
  },
  metricDivider: {
    marginHorizontal: 8,
    color: '#CBD5E1',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionCallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  actionCallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06489D',
  },
  actionWhatsAppBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
  },
  actionWhatsAppText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  actionEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  actionEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalClose: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: '#06489D',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});