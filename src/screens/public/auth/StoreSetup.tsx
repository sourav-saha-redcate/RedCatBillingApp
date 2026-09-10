import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import { registerStoreRequest } from '@app/store/slice/auth.slice';
import { RegisterStoreRequestPayload } from '@app/types';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StoreSetupProps {
  navigation: any;
  route: {
    params?: {
      storeType?: string;
      storeTypeId?: string;
      store_type_id?: string;
    };
  };
}

const StoreSetup: React.FC<StoreSetupProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { registering, accessToken, selectedStoreType } = useAppSelector(state => state.auth);

  const storeType = route?.params?.storeType || selectedStoreType?.name || 'Retail Store';
  const storeTypeId =
    route?.params?.store_type_id ||
    route?.params?.storeTypeId ||
    selectedStoreType?.id;

  const [form, setForm] = useState({
    storeName: 'Royal Salon & Spa',
    ownerName: 'John Doe',
    phone: '9876543210',
    address: '123 High Street, Suite 4',
    gstNumber: '22AAAAA0000A1Z5',
  });

  useEffect(() => {
    if (accessToken) {
      navigation.navigate('TabNavigator');
    }
  }, [accessToken, navigation]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    if (!storeTypeId) {
      showMessage('Please select a store type to continue');
      navigation.navigate('ChooseStoreType');
      return;
    }
    if (!form.storeName.trim()) {
      showMessage('Please enter your store name');
      return;
    }
    if (!form.ownerName.trim()) {
      showMessage('Please enter the owner name');
      return;
    }
    if (!form.phone.trim()) {
      showMessage('Please enter your phone number');
      return;
    }
    if (form.phone.trim().replace(/[^0-9]/g, '').length < 10) {
      showMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    console.log('[DEBUG UI] Action dispatch -> REGISTER_STORE_REQUEST with API store_type_id:', {
      store_type_id: storeTypeId,
      store_name: form.storeName.trim(),
      owner_name: form.ownerName.trim(),
      phone: form.phone.trim(),
    });

    const cleanPhone = form.phone.trim().replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12
      ? `+${cleanPhone}`
      : `+91${cleanPhone.slice(-10)}`;

    const ownerSlug = form.ownerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'owner';
    const email = `${ownerSlug}@example.com`;

    const payload: RegisterStoreRequestPayload = {
      store_type_id: String(storeTypeId),
      store_name: form.storeName.trim(),
      owner_name: form.ownerName.trim(),
      phone: formattedPhone,
      email: email,
      password: 'SecurePass123!',
      address: form.address.trim() ? { address: form.address.trim() } : undefined,
      gst_number: form.gstNumber.trim() || undefined,
    };

    dispatch(registerStoreRequest(payload));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Top Bar with Step Indicator */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.backButton}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={styles.topTitle}>Store Setup</Text>

            <View style={styles.stepContainer}>
              <Text style={styles.stepText}>STEP 2 OF 2</Text>
              <View style={styles.stepBars}>
                <View style={styles.stepBarInactive} />
                <View style={styles.stepBarActive} />
              </View>
            </View>
          </View>

          {/* Header Title & Subtitle */}
          <Text style={styles.heading}>Almost there</Text>
          <Text style={styles.subheading}>
            Please provide your business details to complete the setup and start billing.
          </Text>

          {/* Field 1: Store name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Store name</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                value={form.storeName}
                onChangeText={val => updateField('storeName', val)}
                placeholder="e.g. Metro Electronics"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Field 2: Owner name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Owner name</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                value={form.ownerName}
                onChangeText={val => updateField('ownerName', val)}
                placeholder="Full name of the owner"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>
          </View>

          {/* Field 3: Phone number */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <View style={[styles.inputBox, styles.phoneInputBox]}>
                <TextInput
                  value={form.phone}
                  onChangeText={val => updateField('phone', val)}
                  placeholder="10-digit mobile"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.textInput}
                />
              </View>
            </View>
          </View>

          {/* Field 4: Address */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Address</Text>
              <Text style={styles.requiredStar}> *</Text>
            </View>
            <View style={[styles.inputBox, styles.addressBox]}>
              <TextInput
                value={form.address}
                onChangeText={val => updateField('address', val)}
                placeholder="Shop No, Street, Landmark, City, State, PIN"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.textInput, styles.addressInput]}
              />
            </View>
          </View>

          {/* Field 5: GST number (Optional) */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelBetweenRow}>
              <Text style={styles.fieldLabel}>GST number</Text>
              <Text style={styles.optionalText}>(Optional)</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                value={form.gstNumber}
                onChangeText={val => updateField('gstNumber', val.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                style={styles.textInput}
              />
            </View>
            <Text style={styles.gstHelpText}>
              Providing GST helps in accurate tax reporting.
            </Text>
          </View>

          {/* Info Card 1: Secure Data */}
          <View style={styles.infoCard}>
            <View style={styles.shieldBadge}>
              <View style={styles.shieldOuter}>
                <Text style={styles.shieldIcon}>🛡️</Text>
              </View>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Secure Data</Text>
              <Text style={styles.infoDescription}>
                Your business information is encrypted and stored securely following RC Billing standards.
              </Text>
            </View>
          </View>

          {/* Info Card 2: Receipt Customization */}
          <View style={styles.infoCard}>
            <View style={styles.printerBadge}>
              <Text style={styles.printerIcon}>🖨️</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Receipt Customization</Text>
              <Text style={styles.infoDescription}>
                These details will appear exactly as typed on your customers' digital and physical receipts.
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, registering && { opacity: 0.7 }]}
            disabled={registering}
            activeOpacity={0.85}
            onPress={handleContinue}>
            {registering ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.continueButtonText}>Continue  ›</Text>
            )}
          </TouchableOpacity>

          {/* Terms disclaimer */}
          <Text style={styles.disclaimerText}>
            By clicking Continue, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StoreSetup;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(8),
    paddingBottom: normalize(28),
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },

  backButton: {
    padding: normalize(4),
    marginRight: normalize(6),
  },

  backArrow: {
    fontSize: normalize(20),
    color: '#1E293B',
    fontWeight: '700',
  },

  topTitle: {
    flex: 1,
    fontSize: normalize(17),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#111827',
    marginLeft: normalize(4),
  },

  stepContainer: {
    alignItems: 'flex-end',
  },

  stepText: {
    fontSize: normalize(10),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  stepBars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(4),
  },

  stepBarInactive: {
    width: normalize(16),
    height: normalize(3),
    borderRadius: 1.5,
    backgroundColor: '#111827',
    marginRight: normalize(4),
  },

  stepBarActive: {
    width: normalize(24),
    height: normalize(3),
    borderRadius: 1.5,
    backgroundColor: '#111827',
  },

  heading: {
    fontSize: normalize(22),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#111827',
    marginTop: normalize(4),
  },

  subheading: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    lineHeight: normalize(18),
    marginTop: normalize(6),
    marginBottom: normalize(16),
  },

  fieldGroup: {
    marginBottom: normalize(14),
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(6),
  },

  labelBetweenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(6),
  },

  fieldLabel: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    fontWeight: '600',
    color: '#374151',
  },

  requiredStar: {
    fontSize: normalize(12.5),
    color: '#DC2626',
    fontWeight: '700',
  },

  optionalText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  inputBox: {
    height: normalize(44),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    justifyContent: 'center',
  },

  textInput: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#1E293B',
    paddingVertical: 0,
  },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  countryCodeBox: {
    width: normalize(64),
    height: normalize(44),
    backgroundColor: '#E2E8F0',
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(8),
  },

  countryCodeText: {
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#1E293B',
  },

  phoneInputBox: {
    flex: 1,
  },

  addressBox: {
    height: normalize(84),
    paddingTop: normalize(10),
    paddingBottom: normalize(10),
    justifyContent: 'flex-start',
  },

  addressInput: {
    height: '100%',
    textAlignVertical: 'top',
  },

  gstHelpText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    fontStyle: 'italic',
    color: '#64748B',
    marginTop: normalize(4),
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: normalize(12),
    marginTop: normalize(12),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },

  shieldBadge: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },

  shieldOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  shieldIcon: {
    fontSize: normalize(18),
  },

  printerBadge: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(10),
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },

  printerIcon: {
    fontSize: normalize(18),
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Bold,
    fontWeight: '700',
    color: '#1E293B',
  },

  infoDescription: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    lineHeight: normalize(15),
    marginTop: normalize(2),
  },

  continueButton: {
    height: normalize(46),
    borderRadius: normalize(8),
    backgroundColor: '#002B66',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(22),
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },

  disclaimerText: {
    fontSize: normalize(11),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: normalize(12),
  },

  termsLink: {
    color: '#111827',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
