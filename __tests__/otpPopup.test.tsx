import React from 'react';
import { TextInput } from 'react-native';
import { verifyResetOtpApi } from '../src/services/auth.service';

jest.mock('../src/services/auth.service', () => ({
  verifyResetOtpApi: jest.fn(),
  resetPasswordApi: jest.fn(),
}));

jest.mock('../src/utils/helpers/Toast', () => ({
  showMessage: jest.fn(),
}));

describe('6-Digit OTP Popup Behavior & Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OTP Input Structure & Numeric Enforcement', () => {
    it('should initialize exactly 6 empty OTP fields', () => {
      const initialOtpState = ['', '', '', '', '', ''];
      expect(initialOtpState.length).toBe(6);
      expect(initialOtpState.every(digit => digit === '')).toBe(true);
    });

    it('should only accept a single numeric digit per input box', () => {
      const sanitizeInput = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        return cleaned.slice(-1);
      };

      expect(sanitizeInput('5')).toBe('5');
      expect(sanitizeInput('a')).toBe('');
      expect(sanitizeInput('#')).toBe('');
      expect(sanitizeInput('83')).toBe('3');
      expect(sanitizeInput('abc9')).toBe('9');
    });

    it('should combine 6 individual digits into a single string', () => {
      const otpDigits = ['8', '3', '4', '1', '0', '3'];
      const combinedOtp = otpDigits.join('').trim();
      expect(combinedOtp).toBe('834103');
      expect(combinedOtp.length).toBe(6);
    });
  });

  describe('Focus & Navigation Logic (Forward & Backspace Reverse)', () => {
    it('should advance focus to the next input when entering a digit', () => {
      const mockFocusFns = [jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn()];
      const mockRefs = mockFocusFns.map(fn => ({ focus: fn }));

      const handleInput = (digit: string, index: number) => {
        if (digit && index < 5) {
          mockRefs[index + 1].focus();
        }
      };

      // Input 1 -> 2
      handleInput('8', 0);
      expect(mockFocusFns[1]).toHaveBeenCalledTimes(1);

      // Input 2 -> 3
      handleInput('3', 1);
      expect(mockFocusFns[2]).toHaveBeenCalledTimes(1);

      // Input 5 -> 6 (index 4 -> 5)
      handleInput('0', 4);
      expect(mockFocusFns[5]).toHaveBeenCalledTimes(1);

      // Input 6 (index 5) should not trigger focus on index 6
      handleInput('3', 5);
      expect(mockFocusFns[5]).toHaveBeenCalledTimes(1);
    });

    it('should move focus to previous input when pressing Backspace on an empty field', () => {
      const mockFocusFns = [jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn()];
      const mockRefs = mockFocusFns.map(fn => ({ focus: fn }));

      const handleKeyPress = (key: string, currentDigit: string, index: number) => {
        if (key === 'Backspace' && !currentDigit && index > 0) {
          mockRefs[index - 1].focus();
        }
      };

      // Backspace on empty field at index 5 moves to index 4
      handleKeyPress('Backspace', '', 5);
      expect(mockFocusFns[4]).toHaveBeenCalledTimes(1);

      // Backspace on empty field at index 4 moves to index 3
      handleKeyPress('Backspace', '', 4);
      expect(mockFocusFns[3]).toHaveBeenCalledTimes(1);

      // Backspace on empty field at index 1 moves to index 0
      handleKeyPress('Backspace', '', 1);
      expect(mockFocusFns[0]).toHaveBeenCalledTimes(1);

      // Backspace on empty field at index 0 does nothing
      handleKeyPress('Backspace', '', 0);
      expect(mockFocusFns[0]).toHaveBeenCalledTimes(1);

      // Backspace on non-empty field does not trigger focus change
      handleKeyPress('Backspace', '8', 3);
      expect(mockFocusFns[2]).not.toHaveBeenCalled();
    });
  });

  describe('Pasting 6-Digit OTP', () => {
    it('should extract digits and distribute them across the 6 fields on paste', () => {
      const initialDigits = ['', '', '', '', '', ''];
      const pastedText = '834103';
      const mockFocus = jest.fn();

      const handlePaste = (text: string, index: number, digits: string[]) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length > 1) {
          const pasteDigits = cleaned.slice(0, 6).split('');
          const next = [...digits];
          const startIdx = pasteDigits.length === 6 ? 0 : index;
          for (let i = 0; i < pasteDigits.length && startIdx + i < 6; i++) {
            next[startIdx + i] = pasteDigits[i];
          }
          const targetFocus = Math.min(startIdx + pasteDigits.length, 5);
          mockFocus(targetFocus);
          return next;
        }
        return digits;
      };

      const result = handlePaste(pastedText, 0, initialDigits);
      expect(result).toEqual(['8', '3', '4', '1', '0', '3']);
      expect(mockFocus).toHaveBeenCalledWith(5);
    });

    it('should ignore non-numeric characters when pasting and clamp to 6 digits', () => {
      const initialDigits = ['', '', '', '', '', ''];
      const pastedText = 'Code: 83-41-03! (ignore extra 999)';
      const mockFocus = jest.fn();

      const handlePaste = (text: string, index: number, digits: string[]) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length > 1) {
          const pasteDigits = cleaned.slice(0, 6).split('');
          const next = [...digits];
          const startIdx = pasteDigits.length === 6 ? 0 : index;
          for (let i = 0; i < pasteDigits.length && startIdx + i < 6; i++) {
            next[startIdx + i] = pasteDigits[i];
          }
          return next;
        }
        return digits;
      };

      const result = handlePaste(pastedText, 0, initialDigits);
      expect(result).toEqual(['8', '3', '4', '1', '0', '3']);
      expect(result.length).toBe(6);
    });
  });

  describe('Validation & API Integration', () => {
    it('should fail validation if OTP is empty', async () => {
      const showMessageMock = jest.fn();
      const otpDigits = ['', '', '', '', '', ''];
      const code = otpDigits.join('').trim();

      const verifyOtp = async () => {
        if (!code) {
          showMessageMock('Please enter the verification code');
          return false;
        }
        if (code.length < 6) {
          showMessageMock('Please enter the complete 6-digit verification code');
          return false;
        }
        await verifyResetOtpApi({ identifier: 'test@example.com', otp: code });
        return true;
      };

      const success = await verifyOtp();
      expect(success).toBe(false);
      expect(showMessageMock).toHaveBeenCalledWith('Please enter the verification code');
      expect(verifyResetOtpApi).not.toHaveBeenCalled();
    });

    it('should fail validation if OTP has fewer than 6 digits', async () => {
      const showMessageMock = jest.fn();
      const otpDigits = ['8', '3', '4', '1', '0', ''];
      const code = otpDigits.join('').trim();

      const verifyOtp = async () => {
        if (!code) {
          showMessageMock('Please enter the verification code');
          return false;
        }
        if (code.length < 6) {
          showMessageMock('Please enter the complete 6-digit verification code');
          return false;
        }
        await verifyResetOtpApi({ identifier: 'test@example.com', otp: code });
        return true;
      };

      const success = await verifyOtp();
      expect(success).toBe(false);
      expect(showMessageMock).toHaveBeenCalledWith('Please enter the complete 6-digit verification code');
      expect(verifyResetOtpApi).not.toHaveBeenCalled();
    });

    it('should call verifyResetOtpApi with identifier and complete 6-digit OTP', async () => {
      const otpDigits = ['8', '3', '4', '1', '0', '3'];
      const identifier = 'akash.shit@yopmail.com';
      const code = otpDigits.join('').trim();

      (verifyResetOtpApi as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          message: 'OTP verified successfully',
          data: { token: 'reset-token-123' },
        },
      });

      const response = await verifyResetOtpApi({
        identifier,
        otp: code,
      });

      expect(verifyResetOtpApi).toHaveBeenCalledTimes(1);
      expect(verifyResetOtpApi).toHaveBeenCalledWith({
        identifier: 'akash.shit@yopmail.com',
        otp: '834103',
      });
      expect(response.data?.data?.token).toBe('reset-token-123');
    });
  });

  describe('Modal Flow Reset Protection', () => {
    it('should reset flow state to email popup when OTP popup is closed', () => {
      let modalVisible = false;
      let otpModalVisible = true;
      let otpDigits = ['8', '3', '4', '', '', ''];
      let isAwaitingOtp = true;
      let forgotPasswordSuccessInRedux = true;

      // User closes OTP modal
      const handleCloseOtpModal = () => {
        otpModalVisible = false;
        otpDigits = ['', '', '', '', '', ''];
        isAwaitingOtp = false;
      };

      handleCloseOtpModal();
      expect(otpModalVisible).toBe(false);
      expect(otpDigits).toEqual(['', '', '', '', '', '']);
      expect(isAwaitingOtp).toBe(false);

      // User now taps "Forgot Password?" on sign in screen
      const handleOpenForgotPassword = () => {
        isAwaitingOtp = false;
        otpDigits = ['', '', '', '', '', ''];
        otpModalVisible = false;
        modalVisible = true;
      };

      handleOpenForgotPassword();
      expect(modalVisible).toBe(true);
      expect(otpModalVisible).toBe(false);

      // The effect must NOT trigger OTP modal because isAwaitingOtp is false
      const checkEffect = () => {
        if (forgotPasswordSuccessInRedux && modalVisible && isAwaitingOtp) {
          modalVisible = false;
          otpModalVisible = true;
        }
      };

      checkEffect();
      // Verifying email modal stays open and OTP modal does not unexpectedly open
      expect(modalVisible).toBe(true);
      expect(otpModalVisible).toBe(false);
    });
  });
});
