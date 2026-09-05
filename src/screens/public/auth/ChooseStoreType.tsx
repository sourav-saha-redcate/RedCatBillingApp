import React, { useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import CustomModal from '@app/components/common/CustomModal';
import { showMessage } from '@app/utils/helpers/Toast';

interface StoreTypeItem {
  id: string;
  title: string;
  iconType: 'scissors' | 'store' | 'medical' | 'cafe' | 'custom';
}

const DEFAULT_STORE_TYPES: StoreTypeItem[] = [
  { id: '1', title: 'Saloon / Barbershop', iconType: 'scissors' },
  { id: '2', title: 'General Store', iconType: 'store' },
  { id: '3', title: 'Medical / Pharmacy', iconType: 'medical' },
  { id: '4', title: 'Cafe / Restaurant', iconType: 'cafe' },
];

const ChooseStoreType: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [storeTypes, setStoreTypes] = useState<StoreTypeItem[]>(DEFAULT_STORE_TYPES);
  const [selectedType, setSelectedType] = useState<string>('General Store');
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleSelect = (title: string) => {
    setSelectedType(title);
  };

  const handleAddCustomType = () => {
    if (!customInput.trim()) {
      showMessage('Please enter a store type name');
      return;
    }
    const newType: StoreTypeItem = {
      id: Date.now().toString(),
      title: customInput.trim(),
      iconType: 'custom',
    };
    setStoreTypes(prev => [...prev, newType]);
    setSelectedType(newType.title);
    setCustomInput('');
    setCustomModalVisible(false);
    showMessage(`Added "${newType.title}"`);
  };

  const handleContinue = () => {
    if (!selectedType) {
      showMessage('Please select a store type to continue');
      return;
    }
    // Navigate to next registration step (StoreSetup) passing selected store type
    navigation.navigate('StoreSetup', { storeType: selectedType });
  };

  const renderIcon = (type: StoreTypeItem['iconType'], isSelected: boolean) => {
    const iconColor = isSelected ? '#06489D' : '#475569';

    switch (type) {
      case 'scissors':
        return (
          <View style={styles.iconContainer}>
            <Text style={[styles.unicodeIcon, { color: iconColor }]}>✂</Text>
          </View>
        );
      case 'store':
        return (
          <View style={styles.iconContainer}>
            <View style={styles.storeRoof}>
              <View style={[styles.roofStripe, { backgroundColor: iconColor }]} />
              <View style={[styles.roofStripe, { backgroundColor: '#CBD5E1' }]} />
              <View style={[styles.roofStripe, { backgroundColor: iconColor }]} />
              <View style={[styles.roofStripe, { backgroundColor: '#CBD5E1' }]} />
            </View>
            <View style={[styles.storeBase, { borderColor: iconColor }]}>
              <View style={[styles.storeDoor, { backgroundColor: iconColor }]} />
            </View>
          </View>
        );
      case 'medical':
        return (
          <View style={styles.iconContainer}>
            <View style={[styles.pillOuter, { borderColor: iconColor }]}>
              <View style={[styles.crossVertical, { backgroundColor: iconColor }]} />
              <View style={[styles.crossHorizontal, { backgroundColor: iconColor }]} />
            </View>
          </View>
        );
      case 'cafe':
        return (
          <View style={styles.iconContainer}>
            <Text style={[styles.unicodeIcon, { color: iconColor }]}>☕</Text>
          </View>
        );
      case 'custom':
      default:
        return (
          <View style={styles.iconContainer}>
            <Text style={[styles.unicodeIcon, { color: iconColor }]}>🏪</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Top Brand Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.brandRow}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            activeOpacity={0.8}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkInner} />
            </View>
            <Text style={styles.brandText}>RC Billing</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {/* Blue Wallet/Badge Icon */}
          <View style={styles.walletBadge}>
            <View style={styles.walletShape}>
              <View style={styles.walletFlap}>
                <View style={styles.walletCircle} />
              </View>
            </View>
          </View>

          <Text style={styles.welcomeText}>WELCOME TO RC BILLING</Text>
          <Text style={styles.taglineText}>Smart billing for every shop</Text>
          <Text style={styles.headingText}>Choose store type</Text>
        </View>

        {/* 2x2 Store Types Grid */}
        <View style={styles.gridContainer}>
          {storeTypes.map(item => {
            const isSelected = selectedType === item.title;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelect(item.title)}>
                {/* Active checkmark indicator */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}

                <View
                  style={[
                    styles.iconBox,
                    isSelected && styles.iconBoxSelected,
                  ]}>
                  {renderIcon(item.iconType, isSelected)}
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    isSelected && styles.cardTitleSelected,
                  ]}
                  numberOfLines={2}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Custom Store Type Button */}
        <TouchableOpacity
          style={styles.addCustomButton}
          activeOpacity={0.8}
          onPress={() => setCustomModalVisible(true)}>
          <Text style={styles.plusIcon}>+</Text>
          <Text style={styles.addCustomText}>Add custom store type</Text>
        </TouchableOpacity>

        {/* Tablet Mockup Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={Images.store_tablet_banner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue with selection</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Store Type Modal */}
      <CustomModal
        isModalVisible={customModalVisible}
        onBackdropPress={() => setCustomModalVisible(false)}>
        <Text style={styles.modalHeading}>Custom Store Type</Text>
        <Text style={styles.modalDescription}>
          Enter the name of your business or retail store type.
        </Text>

        <View style={styles.modalContent}>
          <View style={styles.modalInputBox}>
            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="e.g. Clothing Boutique, Electronics, Grocery..."
              placeholderTextColor="#9CA3AF"
              style={styles.modalInput}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            activeOpacity={0.85}
            onPress={handleAddCustomType}>
            <Text style={styles.modalButtonText}>Add Store Type</Text>
          </TouchableOpacity>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default ChooseStoreType;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(14) : normalize(8),
    paddingBottom: normalize(24),
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandMark: {
    width: normalize(20),
    height: normalize(16),
    borderRadius: normalize(3),
    borderWidth: 2,
    borderColor: '#111827',
    marginRight: normalize(6),
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkInner: {
    width: normalize(5),
    height: normalize(5),
    borderRadius: normalize(2.5),
    backgroundColor: '#111827',
  },

  brandText: {
    fontSize: normalize(16),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },

  heroSection: {
    alignItems: 'center',
    marginBottom: normalize(6),
  },

  walletBadge: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(16),
    backgroundColor: '#043477',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#043477',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  walletShape: {
    width: normalize(34),
    height: normalize(26),
    borderRadius: normalize(6),
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: normalize(2),
  },

  walletFlap: {
    width: normalize(14),
    height: normalize(13),
    borderRadius: normalize(4),
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletCircle: {
    width: normalize(4),
    height: normalize(4),
    borderRadius: normalize(2),
    backgroundColor: '#FFFFFF',
  },

  welcomeText: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1.2,
    marginTop: normalize(14),
    textAlign: 'center',
  },

  taglineText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Medium,
    color: '#475569',
    marginTop: normalize(4),
    textAlign: 'center',
  },

  headingText: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#111827',
    marginTop: normalize(16),
    marginBottom: normalize(14),
    textAlign: 'center',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: normalize(12),
  },

  card: {
    width: '48%',
    backgroundColor: '#F3F4F8',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: normalize(100),
    position: 'relative',
  },

  cardSelected: {
    borderColor: '#06489D',
    backgroundColor: '#EFF6FF',
    shadowColor: '#06489D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },

  checkBadge: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(6),
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    backgroundColor: '#06489D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    color: '#FFFFFF',
    fontSize: normalize(10),
    fontWeight: '800',
  },

  iconBox: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(10),
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(8),
  },

  iconBoxSelected: {
    backgroundColor: '#DBEAFE',
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  unicodeIcon: {
    fontSize: normalize(19),
    fontWeight: '700',
  },

  // Store roof / awning
  storeRoof: {
    flexDirection: 'row',
    width: normalize(20),
    height: normalize(6),
    borderTopLeftRadius: normalize(2),
    borderTopRightRadius: normalize(2),
    overflow: 'hidden',
  },

  roofStripe: {
    flex: 1,
    height: '100%',
  },

  storeBase: {
    width: normalize(18),
    height: normalize(11),
    borderWidth: 1.5,
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  storeDoor: {
    width: normalize(6),
    height: normalize(7),
    borderTopLeftRadius: normalize(2),
    borderTopRightRadius: normalize(2),
  },

  // Pharmacy / Medical pill
  pillOuter: {
    width: normalize(17),
    height: normalize(19),
    borderRadius: normalize(4),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  crossVertical: {
    width: normalize(3),
    height: normalize(9),
    borderRadius: normalize(1),
    position: 'absolute',
  },

  crossHorizontal: {
    width: normalize(9),
    height: normalize(3),
    borderRadius: normalize(1),
    position: 'absolute',
  },

  cardTitle: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  cardTitleSelected: {
    color: '#06489D',
    fontWeight: '700',
  },

  addCustomButton: {
    height: normalize(40),
    backgroundColor: '#E5E7EB',
    borderRadius: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(14),
    marginBottom: normalize(16),
  },

  plusIcon: {
    fontSize: normalize(16),
    color: '#374151',
    fontWeight: '700',
    marginRight: normalize(6),
  },

  addCustomText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '600',
    color: '#374151',
  },

  bannerContainer: {
    width: '100%',
    height: normalize(138),
    borderRadius: normalize(12),
    overflow: 'hidden',
    marginBottom: normalize(16),
    backgroundColor: '#E2E8F0',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  continueButton: {
    height: normalize(46),
    borderRadius: normalize(8),
    backgroundColor: '#002B66',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(10),
  },

  continueButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },

  modalHeading: {
    fontSize: normalize(18),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#172033',
    textAlign: 'center',
  },

  modalDescription: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    lineHeight: normalize(18),
    textAlign: 'center',
    marginTop: normalize(8),
    marginBottom: normalize(20),
    paddingHorizontal: normalize(16),
  },

  modalContent: {
    paddingHorizontal: normalize(16),
    width: '100%',
  },

  modalInputBox: {
    minHeight: normalize(44),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    borderRadius: normalize(8),
    marginBottom: normalize(12),
    paddingHorizontal: normalize(12),
    justifyContent: 'center',
  },

  modalInput: {
    height: normalize(42),
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#1E293B',
    paddingVertical: 0,
  },

  modalButton: {
    height: normalize(44),
    borderRadius: normalize(8),
    backgroundColor: '#002B66',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(6),
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },
});
