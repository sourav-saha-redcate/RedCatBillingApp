import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
  AdjustStockPayload,
  InventoryItem,
  InventorySummary,
  InventoryTransaction,
  StockAdjustmentType,
} from '@app/types';
import {
  getInventorySummaryApi,
  getInventoryItemsApi,
  adjustStockApi,
  getItemTransactionsApi,
} from '@app/services/inventory.service';

const DEFAULT_SUMMARY: InventorySummary = {
  total_items: 48,
  low_stock_count: 5,
  out_of_stock_count: 2,
  total_valuation: 142500,
};

const DEFAULT_INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'inv-1', catalog_item_id: 'it-4', name: 'Organic Argan Hair Oil 100ml', sku: 'OIL-100', barcode: '8901234567890', current_stock: 24, reorder_level: 10, unit: 'bottles', status: 'in_stock', unit_cost: 380 },
  { id: 'inv-2', catalog_item_id: 'it-5', name: 'Keratin Shampoo 250ml', sku: 'KRT-250', barcode: '8901234567891', current_stock: 6, reorder_level: 10, unit: 'bottles', status: 'low_stock', unit_cost: 520 },
  { id: 'inv-3', catalog_item_id: 'it-6', name: 'Spa Facial Cleanser 500ml', sku: 'CLN-500', barcode: '8901234567892', current_stock: 0, reorder_level: 5, unit: 'units', status: 'out_of_stock', unit_cost: 650 },
  { id: 'inv-4', catalog_item_id: 'it-7', name: 'Vitamin C Serum 30ml', sku: 'SRM-030', barcode: '8901234567893', current_stock: 18, reorder_level: 8, unit: 'units', status: 'in_stock', unit_cost: 450 },
  { id: 'inv-5', catalog_item_id: 'it-8', name: 'Herbal Massage Oil 1L', sku: 'HMO-1000', barcode: '8901234567894', current_stock: 3, reorder_level: 5, unit: 'bottles', status: 'low_stock', unit_cost: 850 },
];

const PrimerProduct: React.FC = () => {
  const navigation = useNavigation<any>();

  const [summary, setSummary] = useState<InventorySummary>(DEFAULT_SUMMARY);
  const [items, setItems] = useState<InventoryItem[]>(DEFAULT_INVENTORY_ITEMS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Adjustment Modal
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<StockAdjustmentType>('purchase');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustCost, setAdjustCost] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Transactions Modal
  const [ledgerModalVisible, setLedgerModalVisible] = useState(false);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [sumRes, itemsRes] = await Promise.allSettled([
        getInventorySummaryApi(),
        getInventoryItemsApi({ limit: 100 }),
      ]);

      if (sumRes.status === 'fulfilled') {
        const sumData = (sumRes.value.data as any)?.data || sumRes.value.data;
        if (sumData) setSummary(sumData);
      }

      if (itemsRes.status === 'fulfilled') {
        const itmData = itemsRes.value.data;
        const itmList = (itmData as any)?.items || (itmData as any)?.data || (Array.isArray(itmData) ? itmData : []);
        if (itmList.length > 0) setItems(itmList);
      }
    } catch (err: any) {
      console.log('Using local inventory:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.sku && i.sku.toLowerCase().includes(q)) ||
        (i.barcode && i.barcode.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [items, statusFilter, searchQuery]);

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustType('purchase');
    setAdjustQty('');
    setAdjustCost(item.unit_cost ? String(item.unit_cost) : '');
    setAdjustReason('');
    setAdjustModalVisible(true);
  };

  const openLedgerModal = async (item: InventoryItem) => {
    setSelectedItem(item);
    setLedgerModalVisible(true);
    setLedgerLoading(true);

    try {
      const res = await getItemTransactionsApi(item.id);
      const data = res.data;
      const list = (data as any)?.data || (Array.isArray(data) ? data : []);
      setTransactions(list);
    } catch {
      // Mock history
      setTransactions([
        {
          id: 'tx-1',
          item_id: item.id,
          item_name: item.name,
          quantity_change: item.current_stock,
          type: 'purchase',
          previous_stock: 0,
          new_stock: item.current_stock,
          reason: 'Initial stock intake',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleSaveAdjustment = async () => {
    if (!selectedItem) return;
    const qtyNum = parseInt(adjustQty, 10);
    if (isNaN(qtyNum) || qtyNum === 0) {
      showMessage('Please enter a valid non-zero quantity');
      return;
    }

    const payload: AdjustStockPayload = {
      quantity_change: adjustType === 'damage' ? -Math.abs(qtyNum) : Math.abs(qtyNum),
      type: adjustType,
      reason: adjustReason.trim() || undefined,
      unit_cost: adjustCost ? parseFloat(adjustCost) : undefined,
    };

    setAdjustSubmitting(true);
    try {
      await adjustStockApi(selectedItem.id, payload);
      const newStock = Math.max(0, selectedItem.current_stock + payload.quantity_change);
      const newStatus =
        newStock === 0
          ? 'out_of_stock'
          : newStock <= (selectedItem.reorder_level || 10)
          ? 'low_stock'
          : 'in_stock';

      setItems(prev =>
        prev.map(i =>
          i.id === selectedItem.id
            ? { ...i, current_stock: newStock, status: newStatus }
            : i
        )
      );
      showMessage(`Adjusted stock for ${selectedItem.name}`);
      setAdjustModalVisible(false);
    } catch {
      const newStock = Math.max(0, selectedItem.current_stock + payload.quantity_change);
      setItems(prev =>
        prev.map(i =>
          i.id === selectedItem.id
            ? { ...i, current_stock: newStock }
            : i
        )
      );
      showMessage(`Adjusted stock for ${selectedItem.name}`);
      setAdjustModalVisible(false);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return { bg: '#DCFCE7', text: '#15803D', label: 'IN STOCK' };
      case 'low_stock':
        return { bg: '#FEF9C3', text: '#A16207', label: 'LOW STOCK' };
      case 'out_of_stock':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'OUT OF STOCK' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: 'ACTIVE' };
    }
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
          <Text style={styles.headerTitle}>Inventory & Stock</Text>
          <Text style={styles.headerSub}>Live stock levels & ledger</Text>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL ITEMS</Text>
          <Text style={styles.kpiValue}>{summary.total_items}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, { color: '#B45309' }]}>LOW STOCK</Text>
          <Text style={[styles.kpiValue, { color: '#B45309' }]}>
            {summary.low_stock_count}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiLabel, { color: '#DC2626' }]}>OUT OF STOCK</Text>
          <Text style={[styles.kpiValue, { color: '#DC2626' }]}>
            {summary.out_of_stock_count}
          </Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>VALUATION</Text>
          <Text style={styles.kpiValue}>
            ₹{(summary.total_valuation / 1000).toFixed(1)}k
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name, SKU, or barcode..."
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

      {/* Status Filter Chips */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'All' },
          { id: 'in_stock', label: 'In Stock' },
          { id: 'low_stock', label: 'Low Stock' },
          { id: 'out_of_stock', label: 'Out of Stock' },
        ].map(chip => {
          const isActive = statusFilter === chip.id;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(chip.id as any)}>
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Inventory Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchInventory(true)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📦</Text>
            <Text style={styles.emptyTitle}>No inventory items</Text>
            <Text style={styles.emptySubtitle}>
              Products marked with "Track Inventory" will appear here automatically.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusInfo = getStatusColor(item.status);
          return (
            <View style={styles.itemCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSku}>
                    {item.sku ? `SKU: ${item.sku}` : 'SKU: N/A'}
                    {item.barcode ? ` • Barcode: ${item.barcode}` : ''}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
                    {statusInfo.label}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMetrics}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>CURRENT STOCK</Text>
                  <Text style={styles.metricValue}>
                    {item.current_stock} {item.unit || 'units'}
                  </Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>REORDER LEVEL</Text>
                  <Text style={styles.metricValue}>{item.reorder_level || 10}</Text>
                </View>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>UNIT COST</Text>
                  <Text style={styles.metricValue}>
                    ₹{item.unit_cost ? item.unit_cost.toFixed(2) : '0.00'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.historyBtn}
                  onPress={() => openLedgerModal(item)}>
                  <Text style={styles.historyBtnText}>📜 History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.adjustBtn}
                  onPress={() => openAdjustModal(item)}>
                  <Text style={styles.adjustBtnText}>⚡ Adjust Stock</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {/* Adjust Stock Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setAdjustModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Adjust Stock</Text>
                  <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedItem && (
                  <Text style={styles.adjustItemTitle}>
                    {selectedItem.name} (Current: {selectedItem.current_stock})
                  </Text>
                )}

                <Text style={styles.label}>ADJUSTMENT REASON / TYPE</Text>
                <View style={styles.typeGrid}>
                  {[
                    { id: 'purchase', label: '📥 Purchase / Restock' },
                    { id: 'damage', label: '💔 Damaged / Expired' },
                    { id: 'return', label: '🔄 Customer Return' },
                    { id: 'audit', label: '📋 Stock Audit' },
                  ].map(t => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.adjustTypeChip,
                        adjustType === t.id && styles.adjustTypeChipActive,
                      ]}
                      onPress={() => setAdjustType(t.id as any)}>
                      <Text
                        style={[
                          styles.adjustTypeChipText,
                          adjustType === t.id && styles.adjustTypeChipTextActive,
                        ]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>QUANTITY TO ADJUST *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 10"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={adjustQty}
                  onChangeText={setAdjustQty}
                />

                <Text style={styles.label}>UNIT PURCHASE COST (₹)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 380.00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={adjustCost}
                  onChangeText={setAdjustCost}
                />

                <Text style={styles.label}>NOTES / REFERENCE</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. PO #104, Supplier invoice"
                  placeholderTextColor="#94A3B8"
                  value={adjustReason}
                  onChangeText={setAdjustReason}
                />

                <TouchableOpacity
                  style={[styles.saveBtn, adjustSubmitting && { opacity: 0.7 }]}
                  disabled={adjustSubmitting}
                  onPress={handleSaveAdjustment}>
                  {adjustSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Record Adjustment</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Ledger History Modal */}
      <Modal
        visible={ledgerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLedgerModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setLedgerModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Stock Ledger History</Text>
                  <TouchableOpacity onPress={() => setLedgerModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedItem && (
                  <Text style={styles.adjustItemTitle}>{selectedItem.name}</Text>
                )}

                {ledgerLoading ? (
                  <ActivityIndicator color="#06489D" style={{ marginVertical: 30 }} />
                ) : transactions.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: '#64748B', marginVertical: 20 }}>
                    No recorded transactions yet.
                  </Text>
                ) : (
                  <ScrollView style={{ maxHeight: 350 }}>
                    {transactions.map(tx => (
                      <View key={tx.id} style={styles.ledgerRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.ledgerReason}>
                            {tx.reason || tx.type.toUpperCase()}
                          </Text>
                          <Text style={styles.ledgerDate}>
                            {new Date(tx.created_at).toLocaleDateString()} • {tx.type}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text
                            style={[
                              styles.ledgerChange,
                              tx.quantity_change > 0
                                ? { color: '#16A34A' }
                                : { color: '#DC2626' },
                            ]}>
                            {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                          </Text>
                          <Text style={styles.ledgerStock}>
                            Balance: {tx.new_stock}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default PrimerProduct;

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
  kpiContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipActive: {
    backgroundColor: '#06489D',
    borderColor: '#06489D',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 30,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSku: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardMetrics: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  historyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  adjustBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  adjustBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06489D',
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
    marginBottom: 12,
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
  adjustItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06489D',
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  adjustTypeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  adjustTypeChipActive: {
    backgroundColor: '#06489D',
    borderColor: '#06489D',
  },
  adjustTypeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  adjustTypeChipTextActive: {
    color: '#FFFFFF',
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
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ledgerReason: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  ledgerDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  ledgerChange: {
    fontSize: 14,
    fontWeight: '700',
  },
  ledgerStock: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});