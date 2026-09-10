import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import CustomModal from '@app/components/common/CustomModal';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import { useAppDispatch, useAppSelector } from '@app/store';
import {
  loginRequest,
  forgotPasswordRequest,
  resetForgotPasswordFlow,
} from '@app/store/slice/auth.slice';
import {
  verifyResetOtpApi,
  resetPasswordApi,
} from '@app/services/auth.service';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SignInProps {
  email: string;
  password: string;
}

interface ChangeProps {
  password: string;
  conPass: string;
}

interface SignInComponentProps {
  navigation: any;
}

const SignIn: React.FC<SignInComponentProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const {
    loading,
    accessToken,
    forgotPasswordLoading,
    forgotPasswordSuccess,
  } = useAppSelector(state => state.auth);

  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [otpmodalVisible, setOtpModalVisible] = useState(false);
  const [resetmodalVisible, setResetModalVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');

  const [info, setInfo] = useState<SignInProps>({
    email: '+919876543210',
    password: 'SecurePass123!',
  });

  const [forgot, setForgot] = useState('');
  const [change, setChange] = useState<ChangeProps>({
    password: '',
    conPass: '',
  });

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<any>>([]);
  const isAwaitingOtp = useRef(false);
  const forgotScrollRef = useRef<any>(null);
  const otpScrollRef = useRef<any>(null);
  const resetScrollRef = useRef<any>(null);

  // Trap back navigation so user cannot access protected pages using Back button
  useEffect(() => {
    const onBackPress = () => {
      if (!navigation.canGoBack()) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [navigation]);

  // Trap browser Back button in web environments
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.pushState(null, '', window.location?.href || '/');
        const onPopState = () => {
          window.history.pushState(null, '', window.location?.href || '/');
        };
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
      } catch {
        // Ignore errors in non-browser environments
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      if (navigation?.reset) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
      } else {
        navigation.navigate('TabNavigator');
      }
    }
  }, [accessToken, navigation]);

  useEffect(() => {
    if (forgotPasswordSuccess && modalVisible && isAwaitingOtp.current) {
      isAwaitingOtp.current = false;
      Keyboard.dismiss();
      setModalVisible(false);
      setTimeout(() => {
        setOtpModalVisible(true);
      }, 350);
    }
  }, [forgotPasswordSuccess, modalVisible]);

  const updateValue = (field: keyof SignInProps, value: string) => {
    setInfo(prev => ({ ...prev, [field]: value }));
  };

  const updateChangeValue = (field: keyof ChangeProps, value: string) => {
    setChange(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = () => {
    if (!info.email.trim()) {
      showMessage('Please enter your username');
      return;
    }
    if (!info.password.trim()) {
      showMessage('Please enter your password');
      return;
    }

    console.log('[DEBUG UI] Action dispatch -> LOGIN_REQUEST', {
      username: info.email.trim(),
      remember_me: remember,
    });

    dispatch(
      loginRequest({
        username: info.email.trim(),
        password: info.password,
        remember_me: remember,
      }),
    );
  };

  const handleForgotNext = () => {
    if (!forgot.trim()) {
      showMessage('Please enter your email or phone number');
      return;
    }
    isAwaitingOtp.current = true;
    Keyboard.dismiss();
    console.log('[DEBUG UI] Action dispatch -> FORGOT_PASSWORD_REQUEST', {
      identifier: forgot.trim(),
    });
    dispatch(forgotPasswordRequest({ identifier: forgot.trim() }));
  };

  const handleOtpNext = async () => {
    const code = otpDigits.join('').trim();
    if (!code) {
      showMessage('Please enter the verification code');
      return;
    }
    if (code.length < 6) {
      showMessage('Please enter the complete 6-digit verification code');
      return;
    }
    if (otpLoading) return;

    try {
      setOtpLoading(true);
      Keyboard.dismiss();
      const res = await verifyResetOtpApi({
        identifier: forgot.trim(),
        otp: code,
      });

      const resData = (res.data as any)?.data || res.data;
      const tokenOrOtp =
        resData?.token ||
        resData?.reset_token ||
        resData?.resetToken ||
        (res.data as any)?.token ||
        (res.data as any)?.reset_token ||
        code;

      setEnteredOtp(tokenOrOtp);
      const msg = res.data?.message || 'OTP verified successfully';
      showMessage(msg);
      Keyboard.dismiss();
      setOtpModalVisible(false);
      resetOtpDigits();

      if (navigation?.navigate) {
        navigation.navigate('ResetPassword', {
          identifier: forgot.trim(),
          token_or_otp: tokenOrOtp,
          tokenOrOtp: tokenOrOtp,
        });
      } else {
        setTimeout(() => {
          setResetModalVisible(true);
        }, 350);
      }
    } catch (error: any) {
      console.log(
        '[DEBUG OTP VERIFY] Error:',
        error?.response?.data || error?.message,
      );
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : error?.message ||
            'Verification failed. Please check the code and try again.');
      showMessage(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetSubmit = async () => {
    if (!change.password) {
      showMessage('New password is required');
      return;
    }
    if (change.password.length < 6) {
      showMessage('Password must be at least 6 characters long');
      return;
    }
    if (!change.conPass) {
      showMessage('Confirm password is required');
      return;
    }
    if (change.password !== change.conPass) {
      showMessage('Passwords do not match');
      return;
    }
    try {
      setResetLoading(true);
      const res = await resetPasswordApi({
        identifier: forgot.trim(),
        token_or_otp: enteredOtp,
        new_password: change.password,
      });
      const msg = res.data?.message || 'Password reset successfully.';
      showMessage(msg);
      dispatch(resetForgotPasswordFlow());
      Keyboard.dismiss();
      setResetModalVisible(false);
      setChange({ password: '', conPass: '' });
      setForgot('');
      setEnteredOtp('');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to reset password. Please check your verification code.';
      showMessage(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const handleOtpInputChange = (text: string, index: number) => {
    // Strip non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');

    // Support pasting up to 6 digits
    if (cleaned.length > 1) {
      const pasteDigits = cleaned.slice(0, 6).split('');
      const next = [...otpDigits];
      const startIdx = pasteDigits.length === 6 ? 0 : index;
      for (let i = 0; i < pasteDigits.length && startIdx + i < 6; i++) {
        next[startIdx + i] = pasteDigits[i];
      }
      setOtpDigits(next);
      const targetFocus = Math.min(startIdx + pasteDigits.length, 5);
      otpRefs.current[targetFocus]?.focus();
      return;
    }

    // Single digit input
    const value = cleaned.slice(-1);
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);

    // Automatically focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const resetOtpDigits = () => setOtpDigits(['', '', '', '', '', '']);

  const renderOtpInputs = () =>
    otpDigits.map((digit, index) => (
      <TextInput
        key={index}
        ref={el => {
          otpRefs.current[index] = el;
        }}
        value={digit}
        onChangeText={text => handleOtpInputChange(text, index)}
        onKeyPress={e => handleOtpKeyPress(e, index)}
        onFocus={() => {
          setTimeout(() => {
            otpScrollRef.current?.scrollToEnd?.({ animated: true });
          }, 100);
        }}
        keyboardType="number-pad"
        maxLength={1}
        selectTextOnFocus
        editable={!otpLoading}
        style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
        selectionColor="#06489D"
      />
    ));

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Brand Row */}
          <View style={styles.brandRow}>
            <Image
              source={Images.logo}
              resizeMode="contain"
              style={styles.brandLogo}
            />
            <Text style={styles.brandText}>RC Billing</Text>
          </View>

          {/* Login card */}
          <View style={styles.loginCard}>
            <View style={styles.titleRow}>
              <View style={styles.titleArea}>
                <Text style={styles.heading}>Welcome Back</Text>
                <Text style={styles.description}>
                  Login to manage your business
                </Text>
              </View>

              {/* Card / Wallet Illustration */}
              <View style={styles.walletIllustration}>
                <View style={styles.walletBack} />
                <View style={styles.walletFront}>
                  <View style={styles.walletCircle} />
                  <View style={styles.walletLine} />
                </View>
              </View>
            </View>

            {/* Username Field */}
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputBox}>
              <Image
                source={Icons.mail}
                resizeMode="contain"
                style={styles.inputFieldIcon}
              />
              <TextInput
                value={info.email}
                onChangeText={value => updateValue('email', value)}
                placeholder="Enter your username"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>

            {/* Password Field */}
            <Text style={[styles.fieldLabel, styles.passwordLabel]}>
              Password
            </Text>
            <View style={styles.inputBox}>
              <View style={styles.lockIconBadge}>
                <View style={styles.lockShackle} />
                <View style={styles.lockBody} />
              </View>
              <TextInput
                value={info.password}
                onChangeText={value => updateValue('password', value)}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                style={styles.textInput}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.eyeButton}>
                <Image
                  source={showPassword ? Icons.eye : Icons.eye_hide}
                  resizeMode="contain"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Remember + Forgot */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.rememberRow}
                onPress={() => setRemember(prev => !prev)}>
                <View
                  style={[
                    styles.switchTrack,
                    remember && styles.switchTrackActive,
                  ]}>
                  <View
                    style={[
                      styles.switchThumb,
                      remember && styles.switchThumbActive,
                    ]}
                  />
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  isAwaitingOtp.current = false;
                  resetOtpDigits();
                  dispatch(resetForgotPasswordFlow());
                  setOtpModalVisible(false);
                  setResetModalVisible(false);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              disabled={loading}
              onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <Text style={styles.loginArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account yet?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ChooseStoreType')}
              activeOpacity={0.7}>
              <Text style={styles.registerLink}>Register Store</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>|</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot password Modal */}
      <CustomModal
        isModalVisible={modalVisible}
        scrollViewRef={forgotScrollRef}
        onBackdropPress={() => {
          Keyboard.dismiss();
          setModalVisible(false);
          isAwaitingOtp.current = false;
          dispatch(resetForgotPasswordFlow());
        }}>
        <Text style={styles.modalHeading}>Forgot Password</Text>
        <Text style={styles.modalDescription}>
          Enter your registered email address or phone number to receive a verification code.
        </Text>

        <View style={styles.modalContent}>
          <View style={styles.modalInputBox}>
            <TextInput
              value={forgot}
              onChangeText={setForgot}
              placeholder="Email or Phone Number"
              placeholderTextColor="#9CA3AF"
              keyboardType="default"
              autoCapitalize="none"
              style={styles.modalInput}
              onFocus={() => {
                setTimeout(() => {
                  forgotScrollRef.current?.scrollToEnd?.({ animated: true });
                }, 100);
              }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.modalButton,
              forgotPasswordLoading && { opacity: 0.7 },
            ]}
            disabled={forgotPasswordLoading}
            activeOpacity={0.85}
            onPress={handleForgotNext}>
            {forgotPasswordLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.modalButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </CustomModal>

      {/* OTP Modal */}
      <CustomModal
        isModalVisible={otpmodalVisible}
        scrollViewRef={otpScrollRef}
        onBackdropPress={() => {
          Keyboard.dismiss();
          setOtpModalVisible(false);
          resetOtpDigits();
          isAwaitingOtp.current = false;
          dispatch(resetForgotPasswordFlow());
        }}>
        <Text style={styles.modalHeading}>OTP Verification</Text>
        <Text style={styles.modalDescription}>
          Enter the 6-digit verification code.
        </Text>

        <View style={styles.otpContainer}>{renderOtpInputs()}</View>

        <View style={styles.modalContent}>
          <TouchableOpacity
            style={[
              styles.modalButton,
              otpLoading && { opacity: 0.7 },
            ]}
            disabled={otpLoading}
            activeOpacity={0.85}
            onPress={handleOtpNext}>
            {otpLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.modalButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive a code? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={otpLoading}
              onPress={() => {
                resetOtpDigits();
                if (forgot.trim()) {
                  dispatch(forgotPasswordRequest({ identifier: forgot.trim() }));
                } else {
                  showMessage('Verification code resent');
                }
              }}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomModal>

      {/* Change password Modal */}
      <CustomModal
        isModalVisible={resetmodalVisible}
        scrollViewRef={resetScrollRef}
        onBackdropPress={() => {
          Keyboard.dismiss();
          setResetModalVisible(false);
          isAwaitingOtp.current = false;
          dispatch(resetForgotPasswordFlow());
        }}>
        <Text style={styles.modalHeading}>Change Password</Text>
        <Text style={styles.modalDescription}>
          Create a new password for your account.
        </Text>

        <View style={styles.modalContent}>
          <View style={styles.modalInputBox}>
            <TextInput
              value={change.password}
              onChangeText={value => updateChangeValue('password', value)}
              placeholder="New Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.modalInput}
              onFocus={() => {
                setTimeout(() => {
                  resetScrollRef.current?.scrollToEnd?.({ animated: true });
                }, 100);
              }}
            />
          </View>

          <View style={styles.modalInputBox}>
            <TextInput
              value={change.conPass}
              onChangeText={value => updateChangeValue('conPass', value)}
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.modalInput}
              onFocus={() => {
                setTimeout(() => {
                  resetScrollRef.current?.scrollToEnd?.({ animated: true });
                }, 100);
              }}
            />
          </View>

          <TouchableOpacity
            style={[styles.modalButton, resetLoading && { opacity: 0.7 }]}
            activeOpacity={0.85}
            disabled={resetLoading}
            onPress={handleResetSubmit}>
            {resetLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.modalButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: normalize(18),
    paddingTop: Platform.OS === 'android' ? normalize(16) : normalize(8),
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

  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(14),
    paddingHorizontal: normalize(18),
    paddingTop: normalize(22),
    paddingBottom: normalize(22),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(18),
  },

  titleArea: {
    flex: 1,
    paddingRight: normalize(10),
  },

  heading: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#172033',
  },

  description: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    marginTop: normalize(5),
    lineHeight: normalize(17),
  },

  walletIllustration: {
    width: normalize(52),
    height: normalize(38),
  },

  walletBack: {
    position: 'absolute',
    right: 0,
    top: normalize(3),
    width: normalize(44),
    height: normalize(28),
    borderRadius: normalize(6),
    borderWidth: 2,
    borderColor: '#D8DEEC',
    backgroundColor: '#F1F4F9',
  },

  walletFront: {
    position: 'absolute',
    right: normalize(4),
    top: normalize(8),
    width: normalize(40),
    height: normalize(26),
    borderRadius: normalize(6),
    backgroundColor: '#06489D',
    borderWidth: 1,
    borderColor: '#0B5AC2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  walletCircle: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    opacity: 0.8,
  },

  walletLine: {
    position: 'absolute',
    bottom: normalize(5),
    width: normalize(20),
    height: 1.5,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
  },

  fieldLabel: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    fontWeight: '600',
    color: '#374151',
    marginBottom: normalize(6),
  },

  passwordLabel: {
    marginTop: normalize(14),
  },

  inputBox: {
    height: normalize(44),
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(12),
  },

  inputFieldIcon: {
    width: normalize(16),
    height: normalize(16),
    tintColor: '#64748B',
    marginRight: normalize(10),
  },

  lockIconBadge: {
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
    height: normalize(44),
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

  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(14),
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  switchTrack: {
    width: normalize(34),
    height: normalize(19),
    borderRadius: normalize(10),
    backgroundColor: '#CBD5E1',
    padding: normalize(2),
    justifyContent: 'center',
  },

  switchTrackActive: {
    backgroundColor: '#06489D',
  },

  switchThumb: {
    width: normalize(15),
    height: normalize(15),
    borderRadius: normalize(8),
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },

  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  rememberText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#475569',
    marginLeft: normalize(8),
  },

  forgotText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
    color: '#06489D',
  },

  loginButton: {
    height: normalize(44),
    borderRadius: normalize(8),
    backgroundColor: '#06489D',
    marginTop: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },

  loginArrow: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    marginLeft: normalize(6),
    marginTop: Platform.OS === 'android' ? -2 : 0,
  },

  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(20),
  },

  registerText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  registerLink: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '800',
    color: '#06489D',
    marginLeft: normalize(5),
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(20),
  },

  footerText: {
    fontSize: normalize(11.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#94A3B8',
  },

  footerDivider: {
    fontSize: normalize(11.5),
    color: '#CBD5E1',
    marginHorizontal: normalize(10),
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
    backgroundColor: '#06489D',
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

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: normalize(8),
    marginHorizontal: normalize(8),
    marginBottom: normalize(16),
  },

  otpInput: {
    width: normalize(40),
    height: normalize(46),
    borderRadius: normalize(8),
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: normalize(18),
    fontFamily: Fonts.DMSans_18pt_Bold,
    color: '#172033',
    padding: 0,
  },

  otpInputFilled: {
    borderColor: '#06489D',
    backgroundColor: '#F0F7FF',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(16),
  },

  resendText: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },

  resendLink: {
    fontSize: normalize(12),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#06489D',
    fontWeight: '700',
  },
});

export default SignIn;
