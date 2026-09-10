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
import { resetPasswordApi } from '@app/services/auth.service';
import { useAppDispatch } from '@app/store';
import { resetForgotPasswordFlow } from '@app/store/slice/auth.slice';

interface ResetPasswordProps {
  navigation: any;
  route: {
    params?: {
      identifier?: string;
      token_or_otp?: string;
      tokenOrOtp?: string;
      otp?: string;
    };
  };
}

const ResetPassword: React.FC<ResetPasswordProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const identifier = route?.params?.identifier || '';
  const tokenOrOtp =
    route?.params?.token_or_otp ||
    route?.params?.tokenOrOtp ||
    route?.params?.otp ||
    '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!identifier) {
      showMessage('Identifier is required. Please restart the password reset flow.');
      return;
    }

    if (!tokenOrOtp) {
      showMessage('Verification token is required. Please verify your OTP again.');
      return;
    }

    if (!newPassword.trim()) {
      showMessage('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long');
      return;
    }

    if (!confirmPassword.trim()) {
      showMessage('Confirm password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      Keyboard.dismiss();

      console.log(
        '[DEBUG RESET PASSWORD] Calling resetPasswordApi with identifier:',
        identifier,
      );
      const response = await resetPasswordApi({
        identifier: identifier.trim(),
        token_or_otp: tokenOrOtp.trim(),
        new_password: newPassword,
      });

      const message =
        response.data?.message || 'Password reset successfully.';
      showMessage(message);

      // Reset Redux Forgot Password Flow so reopening Forgot Password starts from Email Popup
      dispatch(resetForgotPasswordFlow());

      // Navigate back to Login screen and reset navigation stack
      if (navigation?.reset) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
      } else {
        navigation.navigate('SignIn');
      }
    } catch (error: any) {
      console.log(
        '[DEBUG RESET PASSWORD] Error resetting password:',
        error?.response?.data || error?.message,
      );
      let errorMessage = 'Invalid token or user not found';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (Array.isArray(error?.response?.data?.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }

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
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              dispatch(resetForgotPasswordFlow());
              navigation.goBack();
            }}
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
              <Text style={styles.heading}>Change Password</Text>
              <Text style={styles.description}>
                Create a strong and secure new password for your account.
              </Text>
            </View>

            {/* New Password Field */}
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.inputBox}>
              <View style={styles.lockBadge}>
                <View style={styles.lockShackle} />
                <View style={styles.lockBody} />
              </View>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.textInput}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowNewPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeButton}>
                <Image
                  source={showNewPassword ? Icons.eye : Icons.eye_hide}
                  resizeMode="contain"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Field */}
            <Text style={[styles.fieldLabel, styles.confirmLabel]}>
              Confirm Password
            </Text>
            <View style={styles.inputBox}>
              <View style={styles.lockBadge}>
                <View style={styles.lockShackle} />
                <View style={styles.lockBody} />
              </View>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                style={styles.textInput}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowConfirmPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeButton}>
                <Image
                  source={showConfirmPassword ? Icons.eye : Icons.eye_hide}
                  resizeMode="contain"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Password Hint */}
            <View style={styles.hintRow}>
              <Text style={styles.hintBullet}>•</Text>
              <Text style={styles.hintText}>
                Password must be at least 6 characters long
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={handleResetPassword}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text style={styles.submitButtonText}>Change Password</Text>
                  <Text style={styles.submitButtonArrow}>→</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.loginRow}>
              <TouchableOpacity
                onPress={() => {
                  dispatch(resetForgotPasswordFlow());
                  navigation.navigate('SignIn');
                }}
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

export default ResetPassword;

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
  confirmLabel: {
    marginTop: normalize(14),
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
  lockBadge: {
    width: normalize(16),
    height: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(10),
  },
  lockShackle: {
    width: normalize(10),
    height: normalize(6),
    borderTopLeftRadius: normalize(5),
    borderTopRightRadius: normalize(5),
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: '#64748B',
  },
  lockBody: {
    width: normalize(12),
    height: normalize(9),
    borderRadius: normalize(2),
    backgroundColor: '#64748B',
  },
  textInput: {
    flex: 1,
    height: normalize(46),
    paddingVertical: 0,
    fontSize: normalize(13.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#1E293B',
  },
  eyeButton: {
    padding: normalize(4),
    marginLeft: normalize(6),
  },
  eyeIcon: {
    width: normalize(18),
    height: normalize(18),
    tintColor: '#64748B',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(10),
    paddingHorizontal: normalize(2),
  },
  hintBullet: {
    fontSize: normalize(14),
    color: '#94A3B8',
    marginRight: normalize(5),
  },
  hintText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
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
    marginTop: normalize(20),
  },
  loginLink: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#06489D',
    fontWeight: '700',
  },
});
