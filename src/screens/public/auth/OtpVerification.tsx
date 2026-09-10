import React, { useEffect, useRef, useState } from 'react';
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
import { Fonts, Images } from '@app/themes';
import { showMessage } from '@app/utils/helpers/Toast';
import {
  verifyResetOtpApi,
  forgotPasswordApi,
} from '@app/services/auth.service';

interface OtpVerificationProps {
  navigation: any;
  route: {
    params?: {
      identifier?: string;
    };
  };
}

const OtpVerification: React.FC<OtpVerificationProps> = ({
  navigation,
  route,
}) => {
  const identifier = route?.params?.identifier || '';

  const [otpDigits, setOtpDigits] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<Array<any>>([]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    // In case user pastes multiple digits
    const cleaned = text.replace(/[^0-9]/g, '');

    if (cleaned.length > 1) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < cleaned.length && index + i < 6; i++) {
        newDigits[index + i] = cleaned[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + cleaned.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const value = cleaned.slice(-1);
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const next = [...otpDigits];
        next[index - 1] = '';
        setOtpDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('').trim();

    if (!identifier) {
      showMessage('Missing identifier. Please go back and request a new code.');
      return;
    }

    if (otp.length !== 6) {
      showMessage('Please enter the complete 6-digit verification code');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      Keyboard.dismiss();

      console.log('[DEBUG OTP VERIFY] Calling verifyResetOtpApi with identifier:', identifier, 'and otp:', otp);
      const response = await verifyResetOtpApi({
        identifier,
        otp,
      });

      // Adaptive token extraction: check response.data for token or reset_token
      const resData = (response.data as any)?.data || response.data;
      const returnedToken =
        resData?.token ||
        resData?.reset_token ||
        resData?.resetToken ||
        (response.data as any)?.token ||
        (response.data as any)?.reset_token ||
        (response.data as any)?.resetToken;

      const tokenOrOtp = returnedToken || otp;

      console.log('[DEBUG OTP VERIFY] OTP verified successfully. token_or_otp:', tokenOrOtp);

      const msg =
        response.data?.message ||
        'OTP verified successfully. Please enter your new password.';
      showMessage(msg);

      navigation.navigate('ResetPassword', {
        identifier,
        token_or_otp: tokenOrOtp,
      });
    } catch (error: any) {
      console.log('[DEBUG OTP VERIFY] Error verifying OTP:', error?.response?.data || error?.message);
      const errorMessage =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.errors)
          ? error.response.data.errors.join(', ')
          : error?.message || 'Invalid or expired OTP. Please try again.');
      showMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resending || !identifier) return;

    try {
      setResending(true);
      console.log('[DEBUG OTP RESEND] Calling forgotPasswordApi to resend OTP for:', identifier);
      const response = await forgotPasswordApi({
        identifier,
      });

      const message =
        response.data?.message ||
        'A fresh verification code has been dispatched.';
      showMessage(message);
      setTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.log('[DEBUG OTP RESEND] Error resending OTP:', error?.response?.data || error?.message);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to resend verification code. Please try again.';
      showMessage(errorMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flexOne}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Navigation */}
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
          {/* Brand Row */}
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
              <Text style={styles.heading}>Verify OTP</Text>
              <Text style={styles.description}>
                Please enter the 6-digit verification code sent to:
              </Text>
              <View style={styles.identifierBadge}>
                <Text style={styles.identifierText} numberOfLines={1}>
                  {identifier || 'Your registered identifier'}
                </Text>
              </View>
            </View>

            {/* 6-Digit OTP Inputs */}
            <Text style={styles.fieldLabel}>6-Digit Verification Code</Text>
            <View style={styles.otpRow}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => {
                    inputRefs.current[index] = el;
                  }}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={handleVerifyOtp}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContentRow}>
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                  <Text style={styles.verifyButtonArrow}>→</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Resend Option */}
            <View style={styles.resendRow}>
              <Text style={styles.resendPromptText}>
                Didn't receive the code?
              </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Resend in {timer < 10 ? `0${timer}` : timer}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resending}
                  activeOpacity={0.7}>
                  {resending ? (
                    <ActivityIndicator
                      size="small"
                      color="#06489D"
                      style={styles.resendLoader}
                    />
                  ) : (
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpVerification;

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
    marginBottom: normalize(18),
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
  identifierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: normalize(6),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(4),
    marginTop: normalize(8),
  },
  identifierText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#06489D',
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    fontWeight: '600',
    color: '#374151',
    marginBottom: normalize(10),
    marginTop: normalize(6),
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(18),
  },
  otpBox: {
    width: normalize(44),
    height: normalize(48),
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: normalize(8),
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: normalize(19),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '700',
    color: '#1E293B',
    padding: 0,
  },
  otpBoxFilled: {
    borderColor: '#06489D',
    backgroundColor: '#F0F7FF',
  },
  verifyButton: {
    height: normalize(46),
    backgroundColor: '#06489D',
    borderRadius: normalize(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: normalize(10),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: normalize(14),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
  },
  verifyButtonArrow: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontFamily: Fonts.Figtree_Bold,
    marginLeft: normalize(6),
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: normalize(20),
  },
  resendPromptText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
  },
  timerText: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_Medium,
    color: '#94A3B8',
    marginLeft: normalize(6),
    fontWeight: '600',
  },
  resendLink: {
    fontSize: normalize(12.5),
    fontFamily: Fonts.Figtree_SemiBold,
    color: '#06489D',
    fontWeight: '700',
    marginLeft: normalize(6),
  },
  resendLoader: {
    marginLeft: normalize(6),
  },
});
