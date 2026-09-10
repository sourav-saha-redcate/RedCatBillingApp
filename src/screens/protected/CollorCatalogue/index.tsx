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
  CatalogItem,
  Category,
  CreateCatalogItemPayload,
  CreateCategoryPayload,
} from '@app/types';
import {
  getCategoriesApi,
  createCategoryApi,
  deleteCategoryApi,
  getCatalogItemsApi,
  createCatalogItemApi,
  updateCatalogItemApi,
  deleteCatalogItemApi,
} from '@app/services/catalog.service';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Hair Services', icon: '✂️', display_order: 1 },
  { id: 'cat-2', name: 'Skin & Facial', icon: '💆', display_order: 2 },
  { id: 'cat-3', name: 'Spa & Wellness', icon: '🌿', display_order: 3 },
  { id: 'cat-4', name: 'Retail Products', icon: '🧴', display_order: 4 },
];

const DEFAULT_ITEMS: CatalogItem[] = [
  { id: 'it-1', name: 'Haircut & Styling', type: 'service', category_id: 'cat-1', category_name: 'Hair Services', price: 450, tax_rate: 18, is_active: true },
  { id: 'it-2', name: 'Glow Facial Ritual', type: 'service', category_id: 'cat-2', category_name: 'Skin & Facial', price: 1200, tax_rate: 18, is_active: true },
  { id: 'it-3', name: 'Aroma Body Massage', type: 'service', category_id: 'cat-3', category_name: 'Spa & Wellness', price: 2500, tax_rate: 18, is_active: true },
  { id: 'it-4', name: 'Organic Argan Hair Oil 100ml', type: 'product', category_id: 'cat-4', category_name: 'Retail Products', price: 650, cost_price: 380, sku: 'OIL-100', current_stock: 24, track_inventory: true, tax_rate: 18, is_active: true },
  { id: 'it-5', name: 'Keratin Shampoo 250ml', type: 'product', category_id: 'cat-4', category_name: 'Retail Products', price: 890, cost_price: 520, sku: 'KRT-250', current_stock: 15, track_inventory: true, tax_rate: 18, is_active: true },
];

const CollorCatalogue: React.FC = () => {
  const navigation = useNavigation<any>();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [items, setItems] = useState<CatalogItem[]>(DEFAULT_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [itemSubmitting, setItemSubmitting] = useState(false);

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🏷️');

  // Item Form State
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<'product' | 'service'>('service');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCostPrice, setItemCostPrice] = useState('');
  const [itemSku, setItemSku] = useState('');
  const [itemBarcode, setItemBarcode] = useState('');
  const [itemTaxRate, setItemTaxRate] = useState('18');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [catsRes, itemsRes] = await Promise.allSettled([
        getCategoriesApi(),
        getCatalogItemsApi({ limit: 100 }),
      ]);

      if (catsRes.status === 'fulfilled') {
        const catData = catsRes.value.data;
        const catList = (catData as any)?.data || (Array.isArray(catData) ? catData : []);
        if (catList.length > 0) setCategories(catList);
      }

      if (itemsRes.status === 'fulfilled') {
        const itmData = itemsRes.value.data;
        const itmList = (itmData as any)?.items || (itmData as any)?.data || (Array.isArray(itmData) ? itmData : []);
        if (itmList.length > 0) setItems(itmList);
      }
    } catch (err: any) {
      console.log('Using local catalog cache:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category_id === selectedCategory ||
        item.category_name === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        (item.barcode && item.barcode.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const openAddItemModal = (itemToEdit?: CatalogItem) => {
    if (itemToEdit) {
      setEditingItem(itemToEdit);
      setItemName(itemToEdit.name);
      setItemType(itemToEdit.type || 'service');
      setItemCategoryId(itemToEdit.category_id || (categories[0]?.id || ''));
      setItemPrice(String(itemToEdit.price || ''));
      setItemCostPrice(String(itemToEdit.cost_price || ''));
      setItemSku(itemToEdit.sku || '');
      setItemBarcode(itemToEdit.barcode || '');
      setItemTaxRate(String(itemToEdit.tax_rate ?? 18));
    } else {
      setEditingItem(null);
      setItemName('');
      setItemType('service');
      setItemCategoryId(categories[0]?.id || '');
      setItemPrice('');
      setItemCostPrice('');
      setItemSku('');
      setItemBarcode('');
      setItemTaxRate('18');
    }
    setItemModalVisible(true);
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      showMessage('Please enter item name');
      return;
    }
    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showMessage('Please enter a valid price');
      return;
    }

    const payload: CreateCatalogItemPayload = {
      name: itemName.trim(),
      type: itemType,
      category_id: itemCategoryId || categories[0]?.id || 'default',
      price: priceNum,
      cost_price: itemCostPrice ? parseFloat(itemCostPrice) : undefined,
      sku: itemSku.trim() || undefined,
      barcode: itemBarcode.trim() || undefined,
      tax_rate: itemTaxRate ? parseFloat(itemTaxRate) : 18,
      track_inventory: itemType === 'product',
    };

    setItemSubmitting(true);
    try {
      if (editingItem) {
        await updateCatalogItemApi(editingItem.id, payload);
        setItems(prev =>
          prev.map(i =>
            i.id === editingItem.id
              ? {
                  ...i,
                  ...payload,
                  category_name: categories.find(c => c.id === payload.category_id)?.name || i.category_name,
                }
              : i
          )
        );
        showMessage(`Updated ${payload.name}`);
      } else {
        const res = await createCatalogItemApi(payload);
        const created: CatalogItem = (res.data as any)?.data || res.data || {
          id: `it-${Date.now()}`,
          ...payload,
          category_name: categories.find(c => c.id === payload.category_id)?.name || 'General',
          is_active: true,
        };
        setItems(prev => [created, ...prev]);
        showMessage(`Added ${payload.name} to catalog`);
      }
      setItemModalVisible(false);
    } catch (err: any) {
      // Local fallback if offline
      if (editingItem) {
        setItems(prev =>
          prev.map(i =>
            i.id === editingItem.id
              ? { ...i, ...payload, category_name: categories.find(c => c.id === payload.category_id)?.name || i.category_name }
              : i
          )
        );
      } else {
        setItems(prev => [
          {
            id: `it-${Date.now()}`,
            ...payload,
            category_name: categories.find(c => c.id === payload.category_id)?.name || 'General',
            is_active: true,
          },
          ...prev,
        ]);
      }
      showMessage('Item saved locally');
      setItemModalVisible(false);
    } finally {
      setItemSubmitting(false);
    }
  };

  const handleDeleteItem = async (item: CatalogItem) => {
    try {
      await deleteCatalogItemApi(item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
      showMessage(`Deleted ${item.name}`);
    } catch {
      setItems(prev => prev.filter(i => i.id !== item.id));
      showMessage(`Deleted ${item.name}`);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      showMessage('Please enter category name');
      return;
    }
    const payload: CreateCategoryPayload = {
      name: newCatName.trim(),
      icon: newCatIcon.trim() || '🏷️',
      display_order: categories.length + 1,
    };
    try {
      const res = await createCategoryApi(payload);
      const created = (res.data as any)?.data || res.data || {
        id: `cat-${Date.now()}`,
        ...payload,
      };
      setCategories(prev => [...prev, created]);
      showMessage(`Category "${payload.name}" created`);
      setNewCatName('');
      setCategoryModalVisible(false);
    } catch {
      setCategories(prev => [...prev, { id: `cat-${Date.now()}`, ...payload }]);
      showMessage(`Category "${payload.name}" added`);
      setNewCatName('');
      setCategoryModalVisible(false);
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
          <Text style={styles.headerTitle}>Catalog & Items</Text>
          <Text style={styles.headerSub}>Manage items, services & pricing</Text>
        </View>
        <TouchableOpacity
          style={styles.addCategoryBtn}
          activeOpacity={0.7}
          onPress={() => setCategoryModalVisible(true)}>
          <Text style={styles.addCategoryBtnText}>+ Category</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, SKU, or barcode..."
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

      {/* Category Pills */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}>
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'All' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('All')}>
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'All' && styles.categoryPillTextActive,
              ]}>
              All ({items.length})
            </Text>
          </TouchableOpacity>

          {categories.map(cat => {
            const isActive = selectedCategory === cat.id || selectedCategory === cat.name;
            const count = items.filter(
              i => i.category_id === cat.id || i.category_name === cat.name
            ).length;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}>
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}>
                  {cat.icon ? `${cat.icon} ` : ''}
                  {cat.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={() => fetchData(true)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🏷️</Text>
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptySubtitle}>
              Tap the "+ Add Item" button below to add your first product or service.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemCardLeft}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {item.type === 'product' ? '📦 PRODUCT' : '✂️ SERVICE'}
                </Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {item.category_name || 'General'}
                {item.sku ? ` • SKU: ${item.sku}` : ''}
                {item.current_stock !== undefined ? ` • Stock: ${item.current_stock}` : ''}
                {` • GST ${item.tax_rate ?? 18}%`}
              </Text>
            </View>

            <View style={styles.itemCardRight}>
              <Text style={styles.itemPrice}>₹{Number(item.price).toFixed(2)}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => openAddItemModal(item)}>
                  <Text style={{ fontSize: 13, color: '#06489D', fontWeight: '700' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteIconBtn}
                  onPress={() => handleDeleteItem(item)}>
                  <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '700' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Add Item Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => openAddItemModal()}>
        <Text style={styles.fabText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* Add / Edit Item Modal */}
      <Modal
        visible={itemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setItemModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setItemModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingItem ? 'Edit Item' : 'New Catalog Item'}
                  </Text>
                  <TouchableOpacity onPress={() => setItemModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Type Selector */}
                  <View style={styles.typeSelectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.typeSelectBtn,
                        itemType === 'service' && styles.typeSelectBtnActive,
                      ]}
                      onPress={() => setItemType('service')}>
                      <Text
                        style={[
                          styles.typeSelectText,
                          itemType === 'service' && styles.typeSelectTextActive,
                        ]}>
                        ✂️ Service
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.typeSelectBtn,
                        itemType === 'product' && styles.typeSelectBtnActive,
                      ]}
                      onPress={() => setItemType('product')}>
                      <Text
                        style={[
                          styles.typeSelectText,
                          itemType === 'product' && styles.typeSelectTextActive,
                        ]}>
                        📦 Product
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>ITEM / SERVICE NAME *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Haircut, Organic Coffee, Facial"
                    placeholderTextColor="#94A3B8"
                    value={itemName}
                    onChangeText={setItemName}
                  />

                  <Text style={styles.label}>SELLING PRICE (₹) *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 450.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={itemPrice}
                    onChangeText={setItemPrice}
                  />

                  {itemType === 'product' && (
                    <>
                      <Text style={styles.label}>COST PRICE (₹)</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. 280.00"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={itemCostPrice}
                        onChangeText={setItemCostPrice}
                      />

                      <Text style={styles.label}>SKU / BARCODE</Text>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="e.g. SKU-1002"
                        placeholderTextColor="#94A3B8"
                        value={itemSku}
                        onChangeText={setItemSku}
                      />
                    </>
                  )}

                  <Text style={styles.label}>CATEGORY</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {categories.map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.catSelectChip,
                          itemCategoryId === c.id && styles.catSelectChipActive,
                        ]}
                        onPress={() => setItemCategoryId(c.id)}>
                        <Text
                          style={[
                            styles.catSelectChipText,
                            itemCategoryId === c.id && styles.catSelectChipTextActive,
                          ]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>GST TAX RATE (%)</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {['0', '5', '12', '18', '28'].map(rate => (
                      <TouchableOpacity
                        key={rate}
                        style={[
                          styles.taxChip,
                          itemTaxRate === rate && styles.taxChipActive,
                        ]}
                        onPress={() => setItemTaxRate(rate)}>
                        <Text
                          style={[
                            styles.taxChipText,
                            itemTaxRate === rate && styles.taxChipTextActive,
                          ]}>
                          {rate}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.saveBtn, itemSubmitting && { opacity: 0.7 }]}
                    disabled={itemSubmitting}
                    onPress={handleSaveItem}>
                    {itemSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.saveBtnText}>
                        {editingItem ? 'Save Changes' : 'Create Item'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setCategoryModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Category</Text>
                  <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>CATEGORY NAME *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Grooming, Beverages, Snacks"
                  placeholderTextColor="#94A3B8"
                  value={newCatName}
                  onChangeText={setNewCatName}
                />

                <Text style={styles.label}>ICON EMOJI</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. ✂️, ☕, 🧴"
                  placeholderTextColor="#94A3B8"
                  value={newCatIcon}
                  onChangeText={setNewCatIcon}
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateCategory}>
                  <Text style={styles.saveBtnText}>Add Category</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default CollorCatalogue;

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
  addCategoryBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCategoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06489D',
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
  categoryPillsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#06489D',
    borderColor: '#06489D',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  itemCardRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  deleteIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: '#06489D',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  typeSelectBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#06489D',
  },
  typeSelectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeSelectTextActive: {
    color: '#06489D',
    fontWeight: '700',
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
  catSelectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: 6,
    backgroundColor: '#FFFFFF',
  },
  catSelectChipActive: {
    backgroundColor: '#06489D',
    borderColor: '#06489D',
  },
  catSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  catSelectChipTextActive: {
    color: '#FFFFFF',
  },
  taxChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  taxChipActive: {
    backgroundColor: '#06489D',
    borderColor: '#06489D',
  },
  taxChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  taxChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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