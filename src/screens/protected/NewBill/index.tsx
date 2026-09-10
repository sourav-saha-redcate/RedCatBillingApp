import React, { useState, useMemo, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  BillItem,
  BillItemProduct,
  CreateBillDto,
  CreateBillItemDto,
} from '@app/types';
import {
  getCatalogItemsApi,
  searchCatalogApi,
} from '@app/services/catalog.service';
import { getStaffApi } from '@app/services/staff.service';
import {
  createBillApi,
  recordPaymentApi,
  finalizeBillApi,
} from '@app/services/billing.service';
import { getApiErrorMessage } from '@app/utils/helpers/apiError';
import styles from './style';

interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  taxRate: number;
  type: 'product' | 'service';
  icon: string;
}

interface AddedBillItem {
  id: string;
  catalogId?: string;
  name: string;
  type: 'product' | 'service' | 'manual';
  price: number;
  qty: number;
  taxRate: number;
  discount: number;
}

interface StaffOption {
  id: string;
  name: string;
  role: string;
}

const NewBill: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  // Form State strictly adhering to CreateBillDto
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');
  const [discountInput, setDiscountInput] = useState('');

  // Catalog & Staff data states
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Line items
  const [addedItems, setAddedItems] = useState<AddedBillItem[]>([]);

  // Staff modal & Submission states
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
    fetchStaff();
  }, []);

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      const res = await getCatalogItemsApi({ active_only: true, limit: 50 });
      const data = res.data;
      const items: any[] = (data as any)?.data || (data as any)?.items || (Array.isArray(data) ? data : []);
      if (Array.isArray(items) && items.length > 0) {
        const mapped: ServiceCatalogItem[] = items.map((ci: any) => ({
          id: String(ci.id),
          name: ci.name,
          category: ci.category_name || (ci.type === 'product' ? 'Products' : 'Services'),
          price: Number(ci.selling_price || ci.price || 0),
          taxRate: Number(ci.tax_rate || 18),
          type: ci.type === 'product' ? 'product' : 'service',
          icon: ci.type === 'product' ? '📦' : '✂️',
        }));
        setCatalogItems(mapped);
      }
    } catch (err: any) {
      console.warn('Could not load catalog from API:', err?.message);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await getStaffApi('active');
      const data = res.data;
      const list: any[] = (data as any)?.data || (Array.isArray(data) ? data : []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped: StaffOption[] = list.map((st: any) => ({
          id: String(st.id),
          name: st.name,
          role: st.role || 'Staff',
        }));
        setStaffList(mapped);
        if (mapped.length > 0) {
          setSelectedStaff(mapped[0]);
        }
      }
    } catch (err: any) {
      console.warn('Could not load staff from API:', err?.message);
    } finally {
      setStaffLoading(false);
    }
  };

  // Live Catalog Search (Server search with local fallback)
  useEffect(() => {
    if (!catalogSearch.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchCatalogApi(catalogSearch.trim());
        const data = res.data;
        const items: any[] = (data as any)?.data || (Array.isArray(data) ? data : []);
        if (Array.isArray(items) && items.length > 0) {
          const mapped: ServiceCatalogItem[] = items.map((ci: any) => ({
            id: String(ci.id),
            name: ci.name,
            category: ci.category_name || (ci.type === 'product' ? 'Products' : 'Services'),
            price: Number(ci.selling_price || ci.price || 0),
            taxRate: Number(ci.tax_rate || 18),
            type: ci.type === 'product' ? 'product' : 'service',
            icon: ci.type === 'product' ? '📦' : '✂️',
          }));
          setCatalogItems(prev => {
            const combined = [...mapped];
            prev.forEach(p => {
              if (!combined.some(c => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      } catch {
        // Fall back to client filtering
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [catalogSearch]);

  // Filter service catalog items
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return catalogItems;
    const q = catalogSearch.trim().toLowerCase();
    return catalogItems.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [catalogSearch, catalogItems]);

  // Calculations
  const overallDiscount = useMemo(() => {
    const d = parseFloat(discountInput);
    return isNaN(d) || d < 0 ? 0 : d;
  }, [discountInput]);

  const { totalItemsCount, subtotal, gst, grandTotal } = useMemo(() => {
    const count = addedItems.reduce((acc, item) => acc + item.qty, 0);
    const calculatedSubtotal = addedItems.reduce(
      (acc, item) => acc + (item.price * item.qty - (item.discount || 0)),
      0
    );
    const rawGst = addedItems.reduce((acc, item) => {
      const lineSubtotal = item.price * item.qty - (item.discount || 0);
      const rate = (item.taxRate || 18) / 100;
      return acc + lineSubtotal * rate;
    }, 0);

    const calculatedGst = Math.round(rawGst * 100) / 100;
    const computedGrandTotal = Math.max(0, Math.round((calculatedSubtotal + calculatedGst - overallDiscount) * 100) / 100);

    return { totalItemsCount: count, subtotal: calculatedSubtotal, gst: calculatedGst, grandTotal: computedGrandTotal };
  }, [addedItems, overallDiscount]);

  // Add item from catalog
  const handleAddCatalogItem = (service: ServiceCatalogItem) => {
    setSubmissionError(null);
    setAddedItems(prev => {
      const existingIndex = prev.findIndex(item => item.catalogId === service.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          catalogId: service.id,
          name: service.name,
          type: service.type,
          price: service.price,
          taxRate: service.taxRate,
          discount: 0,
          qty: 1,
        },
      ];
    });

    showMessage(`Added ${service.name} to bill`);
  };

  // Stepper handlers
  const handleIncrement = (id: string) => {
    setAddedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrement = (id: string) => {
    setAddedItems(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            return { ...item, qty: Math.max(1, item.qty - 1) };
          }
          return item;
        })
        .filter(item => item.qty > 0)
    );
  };

  const handleDeleteItem = (id: string) => {
    setAddedItems(prev => prev.filter(item => item.id !== id));
    showMessage('Item removed from bill');
  };

  // Build client BillItem presentation object for BillPreview / ShareModal
  // Build client BillItem presentation object from authoritative API bill
  const buildBillPresentationObject = (apiBill: any): BillItem => {
    const rawItems: any[] = apiBill?.items || [];
    const billItems: BillItemProduct[] = rawItems.length > 0
      ? rawItems.map((item: any, index: number) => ({
          id: String(item.id || `p-${index}`),
          name: item.name || 'Item',
          qty: item.quantity !== undefined ? Number(item.quantity) : 1,
          price: item.unit_price !== undefined ? Number(item.unit_price) : Number(item.total || 0),
        }))
      : addedItems.map((item, index) => ({
          id: `p-${index}`,
          name: item.name,
          qty: item.qty,
          price: item.price,
        }));

    const dateStr = apiBill?.date || new Date().toISOString().split('T')[0];
    const timeStr = apiBill?.time || '12:00:00';
    const officialNumber =
      apiBill?.bill_number ||
      apiBill?.billNumber ||
      `#${String(apiBill?.id || '0001')}`;

    return {
      id: String(apiBill?.id || Date.now()),
      billNumber: officialNumber,
      customerName: apiBill?.customer?.name || customerName.trim() || 'Walk-in Customer',
      phone: apiBill?.customer?.phone || customerPhone.trim() || '',
      dateTime: apiBill?.formatted_date_time || `${dateStr}, ${timeStr.substring(0, 5)}`,
      dateSection: 'Today',
      time: timeStr,
      date: dateStr,
      paymentMethod: (apiBill?.payment?.method || paymentMethod || 'UPI').toUpperCase(),
      amount: Number(apiBill?.grand_total || grandTotal),
      status: (apiBill?.status || 'PAID').toUpperCase(),
      staff: apiBill?.staff?.name || selectedStaff?.name || 'Staff',
      items: billItems,
      subtotal: Number(apiBill?.subtotal || subtotal),
      gst: Number(apiBill?.tax || gst),
      grandTotal: Number(apiBill?.grand_total || grandTotal),
      barcode: apiBill?.barcode || `rc-${officialNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
    };
  };

  // Complete Billing Checkout Workflow: POST /api/v1/bills -> 201 -> Navigate to Bill Preview
  const handleCreateBill = async () => {
    setSubmissionError(null);

    // Validation 1: At least one item
    if (addedItems.length === 0) {
      showMessage('Please add at least one line item to the bill');
      setSubmissionError('Please select or add at least one item from the catalog.');
      return;
    }

    // Validation 2: Staff required by OpenAPI contract
    if (!selectedStaff?.id) {
      showMessage('Please assign a staff member to generate this bill');
      setSubmissionError('Staff member assignment is required.');
      setStaffModalVisible(true);
      return;
    }

    // Validation 3: Customer phone format if provided
    if (customerPhone.trim().length > 0 && customerPhone.trim().length < 8) {
      showMessage('Please enter a valid phone number or leave it blank for walk-in');
      setSubmissionError('Phone number should be at least 8 digits.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare strict OpenAPI CreateBillDto payload
      const lineItems: CreateBillItemDto[] = addedItems.map(item => ({
        catalog_item_id: item.catalogId || undefined,
        type: item.type || 'service',
        name: item.name,
        quantity: item.qty,
        unit_price: item.price,
        discount: item.discount || 0,
        tax_rate: item.taxRate || 18,
      }));

      const createPayload: CreateBillDto = {
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        staff_id: selectedStaff.id,
        items: lineItems,
        discount: overallDiscount > 0 ? overallDiscount : undefined,
        client_bill_id: `DEV01-${new Date().toISOString().replace(/\D/g, '').substring(0, 14)}`,
        notes: notes.trim() || undefined,
      };

      // 2. Submit Bill to Backend API: POST /api/v1/bills
      const createRes = await createBillApi(createPayload);
      const createdData = (createRes.data as any)?.data || createRes.data;

      if (!createdData || !createdData.id) {
        throw new Error('Server created bill but did not return a valid bill ID');
      }

      const billId = String(createdData.id);
      let finalizedBillData = createdData;

      // 3. Record Payment tender if bill created
      try {
        const payRes = await recordPaymentApi(billId, {
          method: paymentMethod.toLowerCase(),
          amount: Number(createdData.grand_total || grandTotal),
          status: 'paid',
        });
        const payData = (payRes.data as any)?.data || payRes.data;
        if (payData) {
          finalizedBillData = payData;
        }
      } catch (payErr: any) {
        console.warn('Payment recording response note:', payErr?.message);
      }

      // 4. Finalize bill on backend
      try {
        const finRes = await finalizeBillApi(billId, {
          notes: notes.trim() || undefined,
        });
        const finData = (finRes.data as any)?.data || finRes.data;
        if (finData) {
          finalizedBillData = finData;
        }
      } catch (finErr: any) {
        console.warn('Finalize bill response note:', finErr?.message);
      }

      showMessage('Bill created successfully!');

      const presentationBill = buildBillPresentationObject(finalizedBillData);

      // 5. Automatically navigate directly to Bill Preview page
      navigation.navigate('BillPreview', {
        billId,
        apiBill: finalizedBillData,
        bill: presentationBill,
      });
    } catch (err: any) {
      // API error: do NOT navigate to preview, keep user on form with preserved data
      const errMsg = getApiErrorMessage(err, 'Failed to create bill. Please check inputs and try again.');
      setSubmissionError(errMsg);
      showMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₹${val.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
          <Text style={styles.headerTitle}>Create Billing</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          onPress={() => showMessage('New bill draft')}>
          <Text style={styles.menuDotsText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 190 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Error Banner */}
        {submissionError && (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FCA5A5',
              borderRadius: 8,
              padding: 10,
              marginBottom: 14,
            }}>
            <Text style={{ color: '#B91C1C', fontSize: 12, fontWeight: '600' }}>
              ⚠️ {submissionError}
            </Text>
          </View>
        )}

        {/* CUSTOMER DETAILS */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderIcon}>👤</Text>
          <Text style={styles.sectionHeaderText}>CUSTOMER DETAILS</Text>
        </View>

        <Text style={styles.fieldLabel}>CUSTOMER NAME (OPTIONAL)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. Rahul Sharma"
          placeholderTextColor="#94A3B8"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Text style={styles.fieldLabel}>CUSTOMER PHONE / WHATSAPP NUMBER</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. +91 98765 43210"
          placeholderTextColor="#94A3B8"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />

        {/* ASSIGNED STAFF */}
        <Text style={styles.fieldLabel}>ASSIGNED STAFF *</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          activeOpacity={0.8}
          onPress={() => setStaffModalVisible(true)}>
          <Text
            style={
              selectedStaff
                ? styles.selectorText
                : styles.selectorPlaceholder
            }>
            {selectedStaff ? `${selectedStaff.name} (${selectedStaff.role})` : 'Select Staff Member'}
          </Text>
          <Text style={styles.chevronIcon}>⌄</Text>
        </TouchableOpacity>

        {/* SERVICE CATALOG */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderIcon}>🛒</Text>
          <Text style={styles.sectionHeaderText}>SERVICE CATALOG</Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items by keyword, code, or SKU..."
            placeholderTextColor="#94A3B8"
            value={catalogSearch}
            onChangeText={setCatalogSearch}
          />
        </View>

        {/* Quick Catalog Cards Scroll */}
        {catalogLoading ? (
          <View style={{ paddingVertical: 14, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#002B66" />
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 6 }}>
              Loading catalog items...
            </Text>
          </View>
        ) : filteredCatalog.length === 0 ? (
          <View
            style={{
              paddingVertical: 14,
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ fontSize: 11.5, color: '#64748B' }}>
              No catalog items match your search
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catalogScrollView}>
            {filteredCatalog.map(service => (
              <TouchableOpacity
                key={service.id}
                style={styles.catalogCard}
                activeOpacity={0.85}
                onPress={() => handleAddCatalogItem(service)}>
                <Text style={styles.catalogIcon}>{service.icon}</Text>
                <Text style={styles.catalogName} numberOfLines={1}>
                  {service.name}
                </Text>
                <View style={styles.catalogBottomRow}>
                  <Text style={styles.catalogPrice}>₹{service.price}</Text>
                  <View style={styles.catalogAddBtn}>
                    <Text style={styles.catalogAddPlus}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Added Items Section */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            marginBottom: 8,
          }}>
          <Text style={styles.addedItemsTitle}>Added Items ({addedItems.length})</Text>
          {addedItems.length > 0 && (
            <TouchableOpacity onPress={() => setAddedItems([])}>
              <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600' }}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {addedItems.length === 0 ? (
          <View style={styles.emptyAddedItems}>
            <Text style={styles.emptyAddedText}>
              No items added to bill yet.
            </Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              Tap items from the catalog above to add them to this bill.
            </Text>
          </View>
        ) : (
          addedItems.map(item => (
            <View key={item.id} style={styles.addedItemCard}>
              <View style={styles.cardAccentBar} />

              <View style={styles.itemTopRow}>
                <View style={styles.itemLeftCol}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemStaff}>
                    Unit Price: {formatCurrency(item.price)} • Tax: {item.taxRate || 18}%
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.price * item.qty)}
                </Text>
              </View>

              <View style={styles.itemBottomRow}>
                {/* Stepper */}
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    activeOpacity={0.7}
                    onPress={() => handleDecrement(item.id)}>
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperQty}>{item.qty}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    activeOpacity={0.7}
                    onPress={() => handleIncrement(item.id)}>
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                {/* Delete Button */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                  onPress={() => handleDeleteItem(item.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Payment & Invoice Notes */}
        <View style={[styles.sectionHeaderContainer, { marginTop: 18 }]}>
          <Text style={styles.sectionHeaderIcon}>💳</Text>
          <Text style={styles.sectionHeaderText}>PAYMENT & NOTES</Text>
        </View>

        {/* Payment Tender Selection */}
        <Text style={styles.fieldLabel}>PAYMENT METHOD</Text>
        <View style={{ flexDirection: 'row', marginBottom: 14 }}>
          {(['UPI', 'Cash', 'Card'] as const).map(method => {
            const isSelected = paymentMethod === method;
            return (
              <TouchableOpacity
                key={method}
                activeOpacity={0.8}
                onPress={() => setPaymentMethod(method)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: isSelected ? '#002B66' : '#F8FAFC',
                  borderRadius: 8,
                  marginHorizontal: 3,
                  borderWidth: 1,
                  borderColor: isSelected ? '#002B66' : '#E2E8F0',
                }}>
                <Text
                  style={{
                    color: isSelected ? '#FFFFFF' : '#475569',
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: 12,
                  }}>
                  {method === 'UPI' ? '📱 UPI' : method === 'Cash' ? '💵 Cash' : '💳 Card'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bill-level Discount */}
        <Text style={styles.fieldLabel}>BILL DISCOUNT (₹, OPTIONAL)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="0.00"
          placeholderTextColor="#94A3B8"
          value={discountInput}
          onChangeText={setDiscountInput}
          keyboardType="numeric"
        />

        {/* Invoice Notes */}
        <Text style={styles.fieldLabel}>INTERNAL NOTES (OPTIONAL)</Text>
        <TextInput
          style={[styles.inputBox, { height: 48 }]}
          placeholder="e.g. VIP Customer / Express Service"
          placeholderTextColor="#94A3B8"
          value={notes}
          onChangeText={setNotes}
        />

        {/* Digital Audit Trail Watermark Card */}
        <View style={styles.auditTrailCard}>
          <Text style={styles.auditTrailIcon}>🧾</Text>
          <Text style={styles.auditTrailText}>
            OFFICIAL DIGITAL AUDIT TRAIL
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16,
          },
        ]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Subtotal ({totalItemsCount} item{totalItemsCount !== 1 ? 's' : ''})
          </Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST (18% approx)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(gst)}</Text>
        </View>

        {overallDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#10B981' }]}>
              Discount Applied
            </Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              -{formatCurrency(overallDiscount)}
            </Text>
          </View>
        )}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutButton, isSubmitting && { opacity: 0.7 }]}
          activeOpacity={0.88}
          disabled={isSubmitting}
          onPress={handleCreateBill}>
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
              <Text style={styles.checkoutButtonText}>Creating bill...</Text>
            </>
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Create Bill</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>➔</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Staff Selection Modal */}
      <Modal
        visible={staffModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStaffModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setStaffModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Assigned Staff</Text>
                  <TouchableOpacity
                    onPress={() => setStaffModalVisible(false)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {staffLoading ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#002B66" />
                  </View>
                ) : staffList.length === 0 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ color: '#64748B', fontSize: 12 }}>
                      No active staff found in directory.
                    </Text>
                  </View>
                ) : (
                  staffList.map(staff => {
                    const isSelected = selectedStaff?.id === staff.id;
                    return (
                      <TouchableOpacity
                        key={staff.id}
                        style={styles.staffItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedStaff(staff);
                          setStaffModalVisible(false);
                          setSubmissionError(null);
                        }}>
                        <View>
                          <Text style={styles.staffItemName}>{staff.name}</Text>
                          <Text style={styles.staffItemRole}>{staff.role}</Text>
                        </View>
                        {isSelected && (
                          <Text style={styles.staffSelectedCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default NewBill;
