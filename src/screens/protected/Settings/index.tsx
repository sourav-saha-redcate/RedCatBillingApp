import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { showMessage } from '@app/utils/helpers/Toast';
import { logoutRequest } from '@app/store/slice/auth.slice';
import printerService, { ConnectionStatus } from '@app/utils/printer/PrinterService';
import PrinterModal from '@app/components/printer/PrinterModal';
import styles from './style';

const LANGUAGES = [
  { id: 'en', label: 'English (US)' },
  { id: 'hi', label: 'Hindi (हिंदी)' },
  { id: 'es', label: 'Spanish (Español)' },
  { id: 'fr', label: 'French (Français)' },
];

const PRINTER_MODES = ['Thermal 80mm', 'Thermal 58mm', 'Standard A4'];

const Settings: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  // Store Profile State
  const [storeName, setStoreName] = useState('RC Electronics Hub');
  const [gstin, setGstin] = useState('29AAAAA0000A1Z5');
  const [storePhone, setStorePhone] = useState('+1 (555) 812-3456');
  const [storeAddress, setStoreAddress] = useState('123 Business Avenue, Tech Park');

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempStoreName, setTempStoreName] = useState(storeName);
  const [tempGstin, setTempGstin] = useState(gstin);

  // App Settings State
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Hardware State
  const [printerMode, setPrinterMode] = useState('Thermal 58mm');
  const [printerModalVisible, setPrinterModalVisible] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<ConnectionStatus>({
    bluetoothConnected: false,
    wifiConnected: false,
    hasActiveConnection: false,
  });

  const refreshPrinter = async () => {
    try {
      let status = await printerService.getConnectionStatus();
      if (!status.hasActiveConnection) {
        const netInfo = await printerService.getWifiNetworkInfo().catch(() => null);
        if (netInfo?.isWifiConnected) {
          try {
            await printerService.autoConnectWifiPrinter();
            status = await printerService.getConnectionStatus();
          } catch {
            // Keep current status
          }
        }
      }
      setPrinterStatus(status);
      const cfg = await printerService.loadSavedConfig();
      if (cfg.paperSize) {
        setPrinterMode(`Thermal ${cfg.paperSize}`);
      } else {
        setPrinterMode('Thermal 58mm');
      }
    } catch {
      // Ignored
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshPrinter();
    }, [])
  );

  // Logout Confirmation Modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleSaveStoreProfile = () => {
    if (!tempStoreName.trim()) {
      showMessage('Store name cannot be empty');
      return;
    }
    setStoreName(tempStoreName.trim());
    setGstin(tempGstin.trim());
    setEditModalVisible(false);
    showMessage('Store profile updated successfully');
  };

  const handleOpenPrinterSettings = () => {
    setPrinterModalVisible(true);
  };

  const handleBackup = () => {
    showMessage('Backing up store data to cloud...');
    setTimeout(() => {
      showMessage('Cloud backup completed successfully!');
    }, 1200);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false);
    dispatch(logoutRequest());
    showMessage('Logged out successfully');
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backArrowText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 1. STORE PROFILE */}
        <Text style={styles.sectionHeader}>STORE PROFILE</Text>
        <View style={styles.card}>
          <View style={styles.storeProfileRow}>
            <View style={styles.storeLeft}>
              <View style={styles.storeLogoBox}>
                <Text style={styles.storeLogoIcon}>🏪</Text>
              </View>
              <View style={styles.storeInfoText}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {storeName}
                </Text>
                <Text style={styles.storeGstin}>GSTIN: {gstin}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.8}
              onPress={() => {
                setTempStoreName(storeName);
                setTempGstin(gstin);
                setEditModalVisible(true);
              }}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. BUSINESS CONFIGURATION */}
        <Text style={styles.sectionHeader}>BUSINESS CONFIGURATION</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => showMessage('Manage Items / Services catalog')}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>📦</Text>
              </View>
              <Text style={styles.menuTitle}>Manage Items/Services</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => showMessage('Manage staff profiles and roles')}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>🪪</Text>
              </View>
              <Text style={styles.menuTitle}>Manage Staff</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 3. HARDWARE */}
        <Text style={styles.sectionHeader}>HARDWARE</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.hardwareRow}
            activeOpacity={0.7}
            onPress={handleOpenPrinterSettings}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>🖨️</Text>
              </View>
              <Text style={styles.menuTitle}>Printer Settings</Text>
            </View>

            <View style={styles.pillBadge}>
              <Text style={styles.pillBadgeText}>{printerMode}</Text>
            </View>
          </TouchableOpacity>

          {/* Dual Hardware Connection Cards */}
          <View style={styles.dualStatusContainer}>
            <TouchableOpacity
              style={styles.statusCard}
              activeOpacity={0.7}
              onPress={handleOpenPrinterSettings}>
              <View
                style={[
                  styles.statusIconBox,
                  {
                    backgroundColor: printerStatus.bluetoothConnected
                      ? '#E6FBF2'
                      : '#FEE2E2',
                  },
                ]}>
                <Text style={styles.bluetoothIcon}>ᛒ</Text>
              </View>
              <View style={styles.statusCardTextCol}>
                <Text style={styles.statusCardTitle}>Bluetooth</Text>
                <Text
                  style={
                    printerStatus.bluetoothConnected
                      ? styles.statusConnected
                      : styles.statusDisconnected
                  }
                  numberOfLines={1}>
                  ●{' '}
                  {printerStatus.bluetoothConnected
                    ? printerStatus.bluetoothDeviceName || 'Connected'
                    : 'Disconnected'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusCard}
              activeOpacity={0.7}
              onPress={handleOpenPrinterSettings}>
              <View
                style={[
                  styles.statusIconBox,
                  {
                    backgroundColor: printerStatus.wifiConnected
                      ? '#E6FBF2'
                      : '#FEE2E2',
                  },
                ]}>
                <Text style={styles.wifiIcon}>🛜</Text>
              </View>
              <View style={styles.statusCardTextCol}>
                <Text style={styles.statusCardTitle}>Wi-Fi</Text>
                <Text
                  style={
                    printerStatus.wifiConnected
                      ? styles.statusConnected
                      : styles.statusDisconnected
                  }
                  numberOfLines={1}>
                  ●{' '}
                  {printerStatus.wifiConnected
                    ? printerStatus.wifiHost || 'Connected'
                    : 'Disconnected'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. APP SETTINGS */}
        <Text style={styles.sectionHeader}>APP SETTINGS</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={handleBackup}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>☁️</Text>
              </View>
              <Text style={styles.menuTitle}>Backup & Restore</Text>
            </View>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={0.7}
            onPress={() => setLangModalVisible(true)}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>🌐</Text>
              </View>
              <Text style={styles.menuTitle}>Language</Text>
            </View>
            <View style={styles.menuRowRight}>
              <Text style={styles.menuRightText}>{selectedLanguage}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <View style={styles.menuRow}>
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>🌙</Text>
              </View>
              <Text style={styles.menuTitle}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={val => {
                setDarkMode(val);
                showMessage(val ? 'Dark mode enabled' : 'Dark mode disabled');
              }}
              trackColor={{ false: '#CBD5E1', true: '#0F172A' }}
              thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* 5. LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => setLogoutModalVisible(true)}>
          <Text style={styles.logoutIcon}>➜]</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersionText}>
          App Version 2.4.0 (Build 108)
        </Text>
      </ScrollView>

      {/* Edit Store Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Store Profile</Text>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalFieldLabel}>STORE NAME</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempStoreName}
                  onChangeText={setTempStoreName}
                  placeholder="Enter store name"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={styles.modalFieldLabel}>GSTIN / TAX ID</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempGstin}
                  onChangeText={setTempGstin}
                  placeholder="e.g. 29AAAAA0000A1Z5"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />

                <TouchableOpacity
                  style={styles.modalPrimaryButton}
                  activeOpacity={0.85}
                  onPress={handleSaveStoreProfile}>
                  <Text style={styles.modalPrimaryButtonText}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setLangModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Language</Text>
                  <TouchableOpacity
                    onPress={() => setLangModalVisible(false)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {LANGUAGES.map(lang => {
                  const isSelected = selectedLanguage === lang.label;
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      style={styles.menuRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedLanguage(lang.label);
                        setLangModalVisible(false);
                        showMessage(`Language set to ${lang.label}`);
                      }}>
                      <Text style={styles.menuTitle}>{lang.label}</Text>
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

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setLogoutModalVisible(false)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 24,
            }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 22,
                  width: '100%',
                  elevation: 6,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#0F172A',
                    marginBottom: 8,
                  }}>
                  Log out?
                </Text>
                <Text
                  style={{
                    fontSize: 13.5,
                    color: '#64748B',
                    lineHeight: 20,
                  }}>
                  Are you sure you want to log out of RC Electronics Hub? You will need to sign in again to access billing.
                </Text>

                <View style={styles.dialogActionRow}>
                  <TouchableOpacity
                    style={styles.cancelDialogBtn}
                    activeOpacity={0.7}
                    onPress={() => setLogoutModalVisible(false)}>
                    <Text style={styles.cancelDialogText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmLogoutBtn}
                    activeOpacity={0.85}
                    onPress={handleConfirmLogout}>
                    <Text style={styles.confirmLogoutText}>Log out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Printer Modal */}
      <PrinterModal
        visible={printerModalVisible}
        onClose={() => {
          setPrinterModalVisible(false);
          refreshPrinter();
        }}
        storeInfo={{
          storeName,
          storeAddress,
          storePhone,
          gstin,
        }}
        onPrintSuccess={refreshPrinter}
      />
    </SafeAreaView>
  );
};

export default Settings;
