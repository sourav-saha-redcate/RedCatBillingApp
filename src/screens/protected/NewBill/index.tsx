import React, { useState, useMemo } from 'react';
import {
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
import { BillItem, BillItemProduct } from '@app/types';
import SharePrintChoiceModal from '@app/components/share/SharePrintChoiceModal';
import PrinterModal from '@app/components/printer/PrinterModal';
import styles from './style';

interface ServiceCatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
}

interface AddedBillItem {
  id: string;
  catalogId: string;
  name: string;
  staff: string;
  price: number;
  qty: number;
}

const CATALOG_SERVICES: ServiceCatalogItem[] = [
  { id: 's1', name: 'Haircut', category: 'Hair', price: 450, icon: '✂️' },
  { id: 's2', name: 'Facial', category: 'Skin', price: 1200, icon: '💆' },
  { id: 's3', name: 'Massage', category: 'Spa', price: 2500, icon: '🌿' },
  { id: 's4', name: 'Beard Trim', category: 'Grooming', price: 250, icon: '✂️' },
  { id: 's5', name: 'Hair Spa', category: 'Hair', price: 1500, icon: '🧴' },
  { id: 's6', name: 'Manicure', category: 'Nails', price: 800, icon: '💅' },
];

const STAFF_MEMBERS = [
  { id: 'st1', name: 'Vikram Singh', role: 'Senior Stylist' },
  { id: 'st2', name: 'Ananya Rao', role: 'Skin Specialist' },
  { id: 'st3', name: 'Rahul Sharma', role: 'Hair Specialist' },
  { id: 'st4', name: 'Priya Patel', role: 'Spa Therapist' },
  { id: 'st5', name: 'Admin-01', role: 'Manager' },
];

const INITIAL_ADDED_ITEMS: AddedBillItem[] = [
  {
    id: 'a1',
    catalogId: 's1',
    name: 'Professional Haircut',
    staff: 'Vikram Singh',
    price: 450,
    qty: 1,
  },
  {
    id: 'a2',
    catalogId: 's2',
    name: 'Glow Facial Ritual',
    staff: 'Ananya Rao',
    price: 1200,
    qty: 2,
  },
];

const NewBill: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('Select Staff');
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [choiceModalVisible, setChoiceModalVisible] = useState(false);
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [currentCreatedBill, setCurrentCreatedBill] = useState<BillItem | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [addedItems, setAddedItems] = useState<AddedBillItem[]>(INITIAL_ADDED_ITEMS);

  // Filter service catalog
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch.trim()) return CATALOG_SERVICES;
    const q = catalogSearch.trim().toLowerCase();
    return CATALOG_SERVICES.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [catalogSearch]);

  // Calculations
  const { totalItemsCount, subtotal, gst, grandTotal } = useMemo(() => {
    const totalItemsCount = addedItems.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = addedItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
    const gst = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST as per reference design
    const grandTotal = Math.round((subtotal + gst) * 100) / 100;

    return { totalItemsCount, subtotal, gst, grandTotal };
  }, [addedItems]);

  // Add item from catalog
  const handleAddCatalogItem = (service: ServiceCatalogItem) => {
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

      const activeStaff =
        assignedStaff === 'Select Staff' ? 'Vikram Singh' : assignedStaff;

      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random()}`,
          catalogId: service.id,
          name: service.name,
          staff: activeStaff,
          price: service.price,
          qty: 1,
        },
      ];
    });

    showMessage(`Added ${service.name} to bill`);
  };

  // Quantity Stepper handlers
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

  // Build Bill Helper
  const buildNewBillObject = (): BillItem | null => {
    if (addedItems.length === 0) {
      showMessage('Please add at least one item to the bill');
      return null;
    }

    const billItems: BillItemProduct[] = addedItems.map((item, index) => ({
      id: `p-${index}`,
      name: item.name,
      qty: item.qty,
      price: item.price,
    }));

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).replace(/ /g, '-');
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });

    return {
      id: Date.now().toString(),
      billNumber: '#0001',
      customerName: customerName.trim() || 'Guest User',
      phone: customerPhone.trim() || '+91 98765 43218',
      dateTime: `Today, ${now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      dateSection: 'Today',
      time: timeStr,
      date: dateStr,
      paymentMethod: 'UPI',
      amount: grandTotal,
      status: 'PAID',
      staff: assignedStaff === 'Select Staff' ? 'Vikram Singh' : assignedStaff,
      items: billItems,
      subtotal,
      gst,
      grandTotal,
      barcode: 'rc-billing-0001-2023',
    };
  };

  // Preview Bill
  const handlePreviewAndPrint = () => {
    const newBill = buildNewBillObject();
    if (newBill) {
      navigation.navigate('BillPreview', { bill: newBill });
    }
  };

  // Quick WhatsApp or Print Choice
  const handleOpenSharePrint = () => {
    const newBill = buildNewBillObject();
    if (newBill) {
      setCurrentCreatedBill(newBill);
      setChoiceModalVisible(true);
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
          <Text style={styles.headerTitle}>New Bill #0001</Text>
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          activeOpacity={0.7}
          onPress={() => showMessage('Bill options')}>
          <Text style={styles.menuDotsText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 170 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* CUSTOMER DETAILS */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderIcon}>👤</Text>
          <Text style={styles.sectionHeaderText}>CUSTOMER DETAILS</Text>
        </View>

        <Text style={styles.fieldLabel}>CUSTOMER NAME (OPTIONAL)</Text>
        <TextInput
          style={styles.inputBox}
          placeholder="e.g. John Doe"
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

        <Text style={styles.fieldLabel}>ASSIGNED STAFF</Text>
        <TouchableOpacity
          style={styles.selectorButton}
          activeOpacity={0.8}
          onPress={() => setStaffModalVisible(true)}>
          <Text
            style={
              assignedStaff === 'Select Staff'
                ? styles.selectorPlaceholder
                : styles.selectorText
            }>
            {assignedStaff}
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
            placeholder="Search services or enter code..."
            placeholderTextColor="#94A3B8"
            value={catalogSearch}
            onChangeText={setCatalogSearch}
          />
        </View>

        {/* Quick Catalog Cards Scroll */}
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

        {/* Added Items Section */}
        <Text style={styles.addedItemsTitle}>Added Items</Text>

        {addedItems.length === 0 ? (
          <View style={styles.emptyAddedItems}>
            <Text style={styles.emptyAddedText}>
              No items added yet. Tap items from catalog above.
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
                  <Text style={styles.itemStaff}>Staff: {item.staff}</Text>
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

        {/* Digital Audit Trail Watermark Card */}
        <View style={styles.auditTrailCard}>
          <Text style={styles.auditTrailIcon}>🧾</Text>
          <Text style={styles.auditTrailText}>
            DIGITAL AUDIT TRAIL GENERATED
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
          <Text style={styles.summaryLabel}>GST (18%)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(gst)}</Text>
        </View>

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        <View style={styles.checkoutButtonRow}>
          <TouchableOpacity
            style={styles.sharePrintButton}
            activeOpacity={0.88}
            onPress={handleOpenSharePrint}>
            <Text style={{ fontSize: 16 }}>💬</Text>
            <Text style={styles.sharePrintButtonText}>
              WhatsApp / Print
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewButton}
            activeOpacity={0.88}
            onPress={handlePreviewAndPrint}>
            <Text style={styles.previewButtonText}>
              Preview Bill
            </Text>
            <Text style={{ fontSize: 14 }}>➔</Text>
          </TouchableOpacity>
        </View>
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

                {STAFF_MEMBERS.map(staff => {
                  const isSelected = assignedStaff === staff.name;
                  return (
                    <TouchableOpacity
                      key={staff.id}
                      style={styles.staffItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        setAssignedStaff(staff.name);
                        setStaffModalVisible(false);
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
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* WhatsApp or Print Choice Modal */}
      {currentCreatedBill && (
        <SharePrintChoiceModal
          visible={choiceModalVisible}
          onClose={() => setChoiceModalVisible(false)}
          bill={currentCreatedBill}
          storeInfo={{
            storeName: 'RC BILLING CORP',
            storeAddress: '123 Business Avenue, Tech Park',
            storePhone: '+1 (555) 812-3456',
            gstin: '22AAAAA0000A1Z5',
          }}
          onOpenPrinterSetup={() => {
            setChoiceModalVisible(false);
            setPrinterModalVisible(true);
          }}
        />
      )}

      {/* Printer Setup Modal */}
      <PrinterModal
        visible={printerModalVisible}
        onClose={() => setPrinterModalVisible(false)}
        bill={currentCreatedBill || undefined}
        storeInfo={{
          storeName: 'RC BILLING CORP',
          storeAddress: '123 Business Avenue, Tech Park',
          storePhone: '+1 (555) 812-3456',
          gstin: '22AAAAA0000A1Z5',
        }}
      />
    </SafeAreaView>
  );
};

export default NewBill;
