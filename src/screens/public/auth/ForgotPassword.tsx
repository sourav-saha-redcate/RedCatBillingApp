import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { normalize } from '@app/utils/orientation';
import { Fonts, Icons, Images } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import { forgotPasswordApi } from '@app/services/auth.service';

interface ForgotPasswordProps {
  navigation: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      showMessage('Please enter your email or phone number');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      Keyboard.dismiss();

      console.log('[DEBUG FORGOT PASSWORD] Calling forgotPasswordApi with identifier:', trimmedIdentifier);
      const response = await forgotPasswordApi({
        identifier: trimmedIdentifier,
      });

      const message =
        response.data?.message ||
        'Verification code has been sent successfully.';
      showMessage(message);

      navigation.navigate('OtpVerification', {
        identifier: trimmedIdentifier,
      });
    } catch (error: any) {
      console.log('[DEBUG FORGOT PASSWORD] Error sending OTP:', error?.response?.data || error?.message);
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : error?.message || 'Failed to send OTP. Please check your details and try again.');
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backButtonArrow}>←</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Brand Logo */}
          <View style={styles.brandRow}>
            <Image
              source={Images.logo}
              resizeMode="contain"
              style={styles.brandLogo}
            />
            <Text style={styles.brandText}>RedCat Billing</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.titleArea}>
              <Text style={styles.heading}>Forgot Password</Text>
              <Text style={styles.description}>
                Enter the email address or phone number associated with your account.
                We'll send you a 6-digit OTP to reset your password.
              </Text>
            </View>

            {/* Identifier Field */}
            <Text style={styles.fieldLabel}>Email or Phone Number</Text>
            <View style={styles.inputBox}>
              <Image
                source={Icons.mail}
                resizeMode="contain"
                style={styles.inputIcon}
              />
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="name@example.com or phone number"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
                style={styles.textInput}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={handleSendOtp}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text style={styles.submitButtonText}>Send OTP</Text>
                  <Text style={styles.submitButtonArrow}>→</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPromptText}>Remember your password?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignIn')}
                activeOpacity={0.7}>
                <Text style={styles.loginLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(10) : normalize(4),
    paddingBottom: normalize(6),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(6),
    alignSelf: 'flex-start',
  },
  backButtonArrow: {
    fontSize: normalize(18),
    color: '#06489D',
    fontFamily: Fonts.Figtree_SemiBold,
    marginRight: normalize(6),
  },
  backButtonText: {
    fontSize: normalize(13.5),
    color: '#06489D',
    fontFamily: Fonts.Figtree_Medium,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: normalize(18),
    paddingTop: normalize(8),
    paddingBottom: normalize(32),
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(20),
  },
  brandLogo: {
    width: normalize(34),
    height: normalize(34),
    marginRight: normalize(8),
  },
  brandText: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(14),
    paddingHorizontal: normalize(18),
    paddingTop: normalize(24),
    paddingBottom: normalize(24),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  titleArea: {
    marginBottom: normalize(20),
  },
  heading: {
    fontSize: normalize(21),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#172033',
  },
  description: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(6),
    lineHeight: normalize(18),
  },
  fieldLabel: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    fontWeight: '600',
    color: '#374151',
    marginBottom: normalize(6),
  },
  inputBox: {
    height: normalize(46),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
  },
  inputIcon: {
    width: normalize(17),
    height: normalize(17),
    tintColor: '#64748B',
    marginRight: normalize(10),
  },
  textInput: {
    flex: 1,
    height: normalize(46),
    paddingVertical: 0,
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#1E293B',
  },
  submitButton: {
    height: normalize(46),
    backgroundColor: '#06489D',
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(20),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },
  submitButtonArrow: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontFamily: Fonts.Figtree_Bold,
    marginLeft: normalize(6),
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(22),
  },
  loginPromptText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },
  loginLink: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#06489D',
    fontWeight: '700',
    marginLeft: normalize(5),
  },
});
