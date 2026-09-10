import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from '../src/store/actions/auth.actions';
import authReducer from '../src/store/slice/auth.slice';
import {
  forgotPasswordSaga,
  watchForgotPassword,
} from '../src/store/service/auth.saga';
import { forgotPasswordApi } from '../src/services/auth.service';
import { instance } from '../src/utils/server/instance';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '../src/utils/constants';
import { showMessage } from '@app/utils/helpers/Toast';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

jest.mock('@app/utils/helpers/Toast', () => ({
  showMessage: jest.fn(),
}));

jest.mock('@app/utils/storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('@app/navigation/RootNaivgation', () => ({
  reset: jest.fn(),
  navigate: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

describe('Forgot Password Flow (POST /api/v1/auth/forgot-password)', () => {
  const mockPayload = {
    identifier: '+919876543210',
  };

  const mockSuccessResponse = {
    success: true,
    message:
      'If an account exists with this identifier, password reset instructions have been dispatched.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Action Constants and Creators', () => {
    it('should have correct action constants', () => {
      expect(FORGOT_PASSWORD_REQUEST).toBe('FORGOT_PASSWORD_REQUEST');
      expect(FORGOT_PASSWORD_SUCCESS).toBe('FORGOT_PASSWORD_SUCCESS');
      expect(FORGOT_PASSWORD_FAILURE).toBe('FORGOT_PASSWORD_FAILURE');
    });

    it('should create forgotPasswordRequest action with identifier payload', () => {
      const action = forgotPasswordRequest(mockPayload);
      expect(action).toEqual({
        type: FORGOT_PASSWORD_REQUEST,
        payload: mockPayload,
      });
    });

    it('should create forgotPasswordSuccess action with response payload', () => {
      const action = forgotPasswordSuccess(mockSuccessResponse);
      expect(action).toEqual({
        type: FORGOT_PASSWORD_SUCCESS,
        payload: mockSuccessResponse,
      });
    });

    it('should create forgotPasswordFailure action with error message payload', () => {
      const action = forgotPasswordFailure('Invalid phone number or email format');
      expect(action).toEqual({
        type: FORGOT_PASSWORD_FAILURE,
        payload: 'Invalid phone number or email format',
      });
    });
  });

  describe('Auth Reducer & State', () => {
    it('should have initial forgot password state correctly configured', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.forgotPasswordLoading).toBe(false);
      expect(state.forgotPasswordSuccess).toBe(false);
      expect(state.forgotPasswordError).toBeNull();
    });

    it('should handle FORGOT_PASSWORD_REQUEST', () => {
      const prevState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        forgotPasswordLoading: false,
        forgotPasswordSuccess: true,
        forgotPasswordError: 'Previous error',
      };

      const nextState = authReducer(prevState, forgotPasswordRequest(mockPayload));
      expect(nextState.forgotPasswordLoading).toBe(true);
      expect(nextState.forgotPasswordSuccess).toBe(false);
      expect(nextState.forgotPasswordError).toBeNull();
    });

    it('should handle FORGOT_PASSWORD_SUCCESS', () => {
      const prevState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        forgotPasswordLoading: true,
        forgotPasswordSuccess: false,
        forgotPasswordError: 'Some error',
      };

      const nextState = authReducer(
        prevState,
        forgotPasswordSuccess(mockSuccessResponse),
      );
      expect(nextState.forgotPasswordLoading).toBe(false);
      expect(nextState.forgotPasswordSuccess).toBe(true);
      expect(nextState.forgotPasswordError).toBeNull();
    });

    it('should handle FORGOT_PASSWORD_FAILURE', () => {
      const prevState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        forgotPasswordLoading: true,
        forgotPasswordSuccess: true,
        forgotPasswordError: null,
      };

      const nextState = authReducer(
        prevState,
        forgotPasswordFailure('Invalid phone number format'),
      );
      expect(nextState.forgotPasswordLoading).toBe(false);
      expect(nextState.forgotPasswordSuccess).toBe(false);
      expect(nextState.forgotPasswordError).toBe('Invalid phone number format');
    });

    it('should preserve existing auth tokens and session during forgot password state changes', () => {
      const prevState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        accessToken: 'existing-token-abc',
        refreshToken: 'existing-refresh-xyz',
        user: { id: 'u1', name: 'Existing User' } as any,
      };

      const nextState = authReducer(
        prevState,
        forgotPasswordSuccess(mockSuccessResponse),
      );
      expect(nextState.accessToken).toBe('existing-token-abc');
      expect(nextState.refreshToken).toBe('existing-refresh-xyz');
      expect(nextState.user).toEqual({ id: 'u1', name: 'Existing User' });
    });
  });

  describe('Worker Saga: forgotPasswordSaga', () => {
    it('should handle successful 200 response from POST /api/v1/auth/forgot-password', () => {
      const action = forgotPasswordRequest(mockPayload);
      const generator = forgotPasswordSaga(action);

      // 1. Call forgotPasswordApi with identifier
      expect(generator.next().value).toEqual(
        call(forgotPasswordApi, { identifier: mockPayload.identifier }),
      );

      // 2. Put forgotPasswordSuccess on 200 response
      const apiResponse = {
        status: 200,
        data: {
          statusCode: 200,
          success: true,
          data: mockSuccessResponse,
        },
      };

      expect(generator.next(apiResponse as any).value).toEqual(
        put(forgotPasswordSuccess(mockSuccessResponse)),
      );

      // 3. Complete generator execution
      const done = generator.next();
      expect(done.done).toBe(true);
      expect(showMessage).toHaveBeenCalledWith(mockSuccessResponse.message);
    });

    it('should handle 400 validation error', () => {
      const action = forgotPasswordRequest({ identifier: 'invalid-identifier' });
      const generator = forgotPasswordSaga(action);

      generator.next(); // call API

      const error = {
        response: {
          status: 400,
          data: {
            statusCode: 400,
            success: false,
            message:
              "Phone number 'invalid-identifier' is invalid. Please provide a valid phone number in universal format",
            error: 'Bad Request',
          },
        },
      };

      expect(generator.throw(error).value).toEqual(
        put(
          forgotPasswordFailure(
            "Phone number 'invalid-identifier' is invalid. Please provide a valid phone number in universal format",
          ),
        ),
      );

      expect(generator.next().done).toBe(true);
      expect(showMessage).toHaveBeenCalledWith(
        "Phone number 'invalid-identifier' is invalid. Please provide a valid phone number in universal format",
      );
    });

    it('should handle 422 error with multiple validation errors', () => {
      const action = forgotPasswordRequest({ identifier: '' });
      const generator = forgotPasswordSaga(action);

      generator.next();

      const error = {
        response: {
          status: 422,
          data: {
            errors: ['Identifier is required', 'Must be valid format'],
          },
        },
      };

      expect(generator.throw(error).value).toEqual(
        put(
          forgotPasswordFailure('Identifier is required, Must be valid format'),
        ),
      );

      expect(generator.next().done).toBe(true);
    });

    it('should handle unexpected network errors gracefully', () => {
      const action = forgotPasswordRequest(mockPayload);
      const generator = forgotPasswordSaga(action);

      generator.next();

      const networkError = new Error('Network Error');
      expect(generator.throw(networkError).value).toEqual(
        put(forgotPasswordFailure('Network Error')),
      );

      expect(generator.next().done).toBe(true);
      expect(showMessage).toHaveBeenCalledWith('Network Error');
    });
  });

  describe('Watcher Saga: watchForgotPassword', () => {
    it('should watch FORGOT_PASSWORD_REQUEST with takeLatest', () => {
      const generator = watchForgotPassword();
      expect(generator.next().value).toEqual(
        takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga),
      );
      expect(generator.next().done).toBe(true);
    });
  });

  describe('API Service: forgotPasswordApi', () => {
    it('should call instance.post with /api/v1/auth/forgot-password and identifier payload', async () => {
      (instance.post as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { success: true, message: 'Dispatched' },
      });

      const res = await forgotPasswordApi(mockPayload);
      expect(instance.post).toHaveBeenCalledWith(
        API.auth.forgotPassword,
        mockPayload,
      );
      expect(res.status).toBe(200);
    });
  });
});
