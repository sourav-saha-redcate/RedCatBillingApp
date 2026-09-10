import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import ResetPassword from '../src/screens/public/auth/ResetPassword';
import { resetPasswordApi } from '../src/services/auth.service';
import { showMessage } from '../src/utils/helpers/Toast';

const mockDispatch = jest.fn();

jest.mock('../src/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(selector => selector({ auth: {} })),
}));

jest.mock('../src/services/auth.service', () => ({
  resetPasswordApi: jest.fn(),
  verifyResetOtpApi: jest.fn(),
  forgotPasswordApi: jest.fn(),
}));

jest.mock('../src/utils/helpers/Toast', () => ({
  showMessage: jest.fn(),
}));

describe('Change Password / Reset Password Screen & Integration', () => {
  const mockNavigate = jest.fn();
  const mockReset = jest.fn();
  const mockNavigation = {
    navigate: mockNavigate,
    reset: mockReset,
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UI Layout & Show/Hide Password Toggle', () => {
    it('renders New Password input, Confirm Password input, and Change Password button', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const textInputs = root.findAllByType(TextInput);
      expect(textInputs.length).toBe(2);
      expect(textInputs[0].props.placeholder).toBe('New Password');
      expect(textInputs[1].props.placeholder).toBe('Confirm Password');

      // Both initially secureTextEntry = true
      expect(textInputs[0].props.secureTextEntry).toBe(true);
      expect(textInputs[1].props.secureTextEntry).toBe(true);

      const buttons = root.findAllByType(TouchableOpacity);
      const submitBtn = buttons.find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );
      expect(submitBtn).toBeTruthy();
    });

    it('toggles show/hide password for New Password and Confirm Password', () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      const buttons = root.findAllByType(TouchableOpacity);

      // Eye buttons contain the eye icon Image
      const eyeButtons = buttons.filter(b => b.findAllByType(Image).length > 0);
      expect(eyeButtons.length).toBe(2);

      // Toggle new password visibility
      act(() => {
        eyeButtons[0].props.onPress();
      });
      expect(inputs[0].props.secureTextEntry).toBe(false);

      // Toggle confirm password visibility
      act(() => {
        eyeButtons[1].props.onPress();
      });
      expect(inputs[1].props.secureTextEntry).toBe(false);

      // Toggle back to hidden
      act(() => {
        eyeButtons[0].props.onPress();
      });
      expect(inputs[0].props.secureTextEntry).toBe(true);
    });
  });

  describe('Validation Rules', () => {
    it('validates missing identifier and blocks API call', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{ params: { token_or_otp: '123456' } }}
          />,
        );
      });

      const root = renderer!.root;
      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith(
        'Identifier is required. Please restart the password reset flow.',
      );
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });

    it('validates missing token_or_otp and blocks API call', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{ params: { identifier: 'john@example.com' } }}
          />,
        );
      });

      const root = renderer!.root;
      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith(
        'Verification token is required. Please verify your OTP again.',
      );
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });

    it('validates empty new password', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('New password is required');
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });

    it('validates new password minimum length (< 6 characters)', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('12345');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('Password must be at least 6 characters long');
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });

    it('validates empty confirm password', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('NewSecurePass123!');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('Confirm password is required');
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });

    it('validates password mismatch', async () => {
      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('NewSecurePass123!');
        inputs[1].props.onChangeText('DifferentPass123!');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('Passwords do not match');
      expect(resetPasswordApi).not.toHaveBeenCalled();
    });
  });

  describe('API Integration & Flow Reset', () => {
    it('calls resetPasswordApi with exact payload and navigates to SignIn on 200', async () => {
      (resetPasswordApi as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          message: 'Password reset successfully.',
        },
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('NewSecurePass123!');
        inputs[1].props.onChangeText('NewSecurePass123!');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(resetPasswordApi).toHaveBeenCalledTimes(1);
      expect(resetPasswordApi).toHaveBeenCalledWith({
        identifier: 'john@example.com',
        token_or_otp: '123456',
        new_password: 'NewSecurePass123!',
      });

      expect(showMessage).toHaveBeenCalledWith('Password reset successfully.');
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    });

    it('handles HTTP 400 error gracefully without crashing', async () => {
      (resetPasswordApi as jest.Mock).mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Invalid token or user not found',
          },
        },
      });

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: 'invalid-token',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('NewSecurePass123!');
        inputs[1].props.onChangeText('NewSecurePass123!');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('Invalid token or user not found');
      expect(mockReset).not.toHaveBeenCalled();
    });

    it('handles network error without crashing', async () => {
      (resetPasswordApi as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      let renderer: ReactTestRenderer.ReactTestRenderer;
      act(() => {
        renderer = ReactTestRenderer.create(
          <ResetPassword
            navigation={mockNavigation}
            route={{
              params: {
                identifier: 'john@example.com',
                token_or_otp: '123456',
              },
            }}
          />,
        );
      });

      const root = renderer!.root;
      const inputs = root.findAllByType(TextInput);
      act(() => {
        inputs[0].props.onChangeText('NewSecurePass123!');
        inputs[1].props.onChangeText('NewSecurePass123!');
      });

      const submitBtn = root.findAllByType(TouchableOpacity).find(
        b => b.findAll(n => n.props.children === 'Change Password').length > 0,
      );

      await act(async () => {
        await submitBtn!.props.onPress();
      });

      expect(showMessage).toHaveBeenCalledWith('Network Error');
      expect(mockReset).not.toHaveBeenCalled();
    });
  });
});
