import { instance } from '../src/utils/server/instance';
import {
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
} from '../src/services/auth.service';
import { API } from '../src/utils/constants';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

describe('Complete Forgot Password Flow Endpoints & Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: forgotPasswordApi (POST /api/v1/auth/forgot-password)', () => {
    it('should call instance.post with API.auth.forgotPassword and identifier payload', async () => {
      const payload = {
        identifier: 'akash.shit@yopmail.com',
      };

      const mockResponse = {
        status: 200,
        data: {
          success: true,
          message: 'OTP sent to your email successfully',
        },
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await forgotPasswordApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.forgotPassword, payload);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('OTP sent to your email successfully');
    });

    it('should validate non-empty identifier', () => {
      const validateIdentifier = (id: string) => Boolean(id && id.trim().length > 0);

      expect(validateIdentifier('')).toBe(false);
      expect(validateIdentifier('   ')).toBe(false);
      expect(validateIdentifier('akash.shit@yopmail.com')).toBe(true);
      expect(validateIdentifier('+919876543210')).toBe(true);
    });
  });

  describe('Step 2: verifyResetOtpApi (POST /api/v1/auth/verify-reset-otp)', () => {
    it('should call instance.post with API.auth.verifyResetOtp and { identifier, otp }', async () => {
      const payload = {
        identifier: 'akash.shit@yopmail.com',
        otp: '834103',
      };

      const mockResponse = {
        status: 200,
        data: {
          success: true,
          message: 'OTP verified successfully',
          data: {
            token: 'reset-token-xyz-789',
          },
        },
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await verifyResetOtpApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.verifyResetOtp, payload);
      expect(response.status).toBe(200);
      expect(response.data.data?.token).toBe('reset-token-xyz-789');
    });

    it('should validate 6-digit OTP requirements', () => {
      const validateOtp = (otp: string) => /^\d{6}$/.test(otp.trim());

      expect(validateOtp('')).toBe(false);
      expect(validateOtp('12345')).toBe(false);
      expect(validateOtp('1234567')).toBe(false);
      expect(validateOtp('12a456')).toBe(false);
      expect(validateOtp('834103')).toBe(true);
    });

    it('should adaptively extract reset token or fallback to entered OTP', () => {
      const extractTokenOrOtp = (response: any, fallbackOtp: string) => {
        const resData = response?.data?.data || response?.data;
        return (
          resData?.token ||
          resData?.reset_token ||
          resData?.resetToken ||
          response?.data?.token ||
          response?.data?.reset_token ||
          fallbackOtp
        );
      };

      // Case A: token in data.token
      expect(
        extractTokenOrOtp(
          { data: { data: { token: 'tok-abc' } } },
          '834103',
        ),
      ).toBe('tok-abc');

      // Case B: reset_token in top level data
      expect(
        extractTokenOrOtp(
          { data: { reset_token: 'tok-reset-123' } },
          '834103',
        ),
      ).toBe('tok-reset-123');

      // Case C: no token returned, fallback to entered OTP
      expect(
        extractTokenOrOtp(
          { data: { success: true, message: 'Verified' } },
          '834103',
        ),
      ).toBe('834103');
    });
  });

  describe('Step 3: resetPasswordApi (POST /api/v1/auth/reset-password)', () => {
    it('should call instance.post with API.auth.resetPassword and payload containing identifier, token_or_otp, new_password', async () => {
      const payload = {
        identifier: 'akash.shit@yopmail.com',
        token_or_otp: '834103',
        new_password: 'SecurePassword123!',
      };

      const mockResponse = {
        status: 200,
        data: {
          success: true,
          message: 'Password reset successfully',
        },
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await resetPasswordApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.resetPassword, payload);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Password reset successfully');
    });

    it('should validate password matching and minimum length', () => {
      const validatePasswords = (pwd: string, confirm: string) => {
        if (!pwd || pwd.trim().length === 0) return 'New password is required';
        if (pwd.length < 6) return 'Password must be at least 6 characters long';
        if (!confirm || confirm.trim().length === 0) return 'Confirm password is required';
        if (pwd !== confirm) return 'Passwords do not match';
        return null;
      };

      expect(validatePasswords('', '')).toBe('New password is required');
      expect(validatePasswords('12345', '12345')).toBe('Password must be at least 6 characters long');
      expect(validatePasswords('123456', '')).toBe('Confirm password is required');
      expect(validatePasswords('123456', '654321')).toBe('Passwords do not match');
      expect(validatePasswords('SecurePass123!', 'SecurePass123!')).toBeNull();
    });
  });
});
