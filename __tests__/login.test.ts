import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  REGISTER_STORE_REQUEST,
  REGISTER_STORE_SUCCESS,
  REGISTER_STORE_FAILURE,
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  registerStoreRequest,
  registerStoreSuccess,
  registerStoreFailure,
} from '../src/store/actions/auth.actions';
import authReducer, { logoutSuccess } from '../src/store/slice/auth.slice';
import {
  loginSaga,
  watchLogin,
  refreshTokenSaga,
  watchRefreshToken,
  registerStoreSaga,
  watchRegisterStore,
} from '../src/store/service/auth.saga';
import {
  loginApi,
  refreshTokenApi,
  registerStoreApi,
} from '../src/services/auth.service';
import { call, put, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '../src/utils/constants';

// Mock dependencies
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

describe('Login Redux & Saga Setup', () => {
  const mockPayload = {
    username: '+919876543210',
    password: 'SecurePass123!',
    remember_me: true,
  };

  const mockResponse = {
    store: {
      id: 'b18b6255-a226-4fa2-b283-a75782a98f12',
      name: 'Royal Salon & Spa',
      type: 'salon',
    },
    user: {
      id: 'e721a97c-3f23-4556-a957-c81ec352a912',
      name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      role: 'owner',
    },
    access_token: 'eyJhbGciOiJIUzI1Ni...',
    refresh_token: 'eyJhbGciOiJIUzI1Ni...',
    expires_in: 900,
  };

  describe('Action Constants and Creators', () => {
    it('should have correct action constants', () => {
      expect(LOGIN_REQUEST).toBe('LOGIN_REQUEST');
      expect(LOGIN_SUCCESS).toBe('LOGIN_SUCCESS');
      expect(LOGIN_FAILURE).toBe('LOGIN_FAILURE');
    });

    it('should create loginRequest action with payload', () => {
      const action = loginRequest(mockPayload);
      expect(action.type).toBe(LOGIN_REQUEST);
      expect(action.payload).toEqual(mockPayload);
    });

    it('should create loginSuccess action with response payload', () => {
      const action = loginSuccess(mockResponse);
      expect(action.type).toBe(LOGIN_SUCCESS);
      expect(action.payload).toEqual(mockResponse);
    });

    it('should create loginFailure action with error payload', () => {
      const errorMsg = 'Invalid username or password';
      const action = loginFailure(errorMsg);
      expect(action.type).toBe(LOGIN_FAILURE);
      expect(action.payload).toBe(errorMsg);
    });
  });

  describe('Auth Reducer & State', () => {
    it('should have initial state with all required fields', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.loading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.store).toBeNull();
      expect(state.accessToken).toBe('');
      expect(state.refreshToken).toBe('');
      expect(state.expiresIn).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should handle LOGIN_REQUEST', () => {
      const state = authReducer(undefined, loginRequest(mockPayload));
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle LOGIN_SUCCESS', () => {
      const pendingState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        loading: true,
      };
      const state = authReducer(pendingState, loginSuccess(mockResponse));
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.store).toEqual(mockResponse.store);
      expect(state.accessToken).toBe(mockResponse.access_token);
      expect(state.refreshToken).toBe(mockResponse.refresh_token);
      expect(state.expiresIn).toBe(mockResponse.expires_in);
      expect(state.token).toBe(mockResponse.access_token); // legacy support
      expect(state.error).toBeNull();
    });

    it('should handle LOGIN_FAILURE', () => {
      const pendingState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        loading: true,
      };
      const errorMsg = 'Invalid username or password';
      const state = authReducer(pendingState, loginFailure(errorMsg));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMsg);
    });
  });

  describe('Login Worker Saga', () => {
    it('should handle successful login flow', () => {
      const action = loginRequest(mockPayload);
      const saga = loginSaga(action);

      // Step 1: call loginApi
      expect(saga.next().value).toEqual(
        call(loginApi, {
          username: mockPayload.username,
          password: mockPayload.password,
          remember_me: mockPayload.remember_me,
        }),
      );

      // Step 2: dispatch loginSuccess
      const mockAxiosResult = { data: mockResponse, status: 200 };
      expect(saga.next(mockAxiosResult as any).value).toEqual(
        put(loginSuccess(mockResponse)),
      );

      // Step 3: save to AsyncStorage because remember_me is true
      expect(saga.next().value).toEqual(
        call(
          AsyncStorage.setItem,
          constants.ISREMEMBER,
          JSON.stringify(mockPayload),
        ),
      );

      // Step 4: done
      expect(saga.next().done).toBe(true);
    });

    it('should handle 401 error flow', () => {
      const action = loginRequest(mockPayload);
      const saga = loginSaga(action);

      saga.next(); // call loginApi

      const mockError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
        },
      };

      // Throw 401 error into generator
      expect(saga.throw(mockError).value).toEqual(
        put(loginFailure('Invalid credentials')),
      );

      expect(saga.next().done).toBe(true);
    });
  });

  describe('Watcher Saga', () => {
    it('should watch LOGIN_REQUEST with takeLatest', () => {
      const saga = watchLogin();
      expect(saga.next().value).toEqual(
        takeLatest(LOGIN_REQUEST, loginSaga),
      );
      expect(saga.next().done).toBe(true);
    });
  });

  describe('Refresh Token Action Constants and Creators', () => {
    it('should have correct action constants', () => {
      expect(REFRESH_TOKEN_REQUEST).toBe('REFRESH_TOKEN_REQUEST');
      expect(REFRESH_TOKEN_SUCCESS).toBe('REFRESH_TOKEN_SUCCESS');
      expect(REFRESH_TOKEN_FAILURE).toBe('REFRESH_TOKEN_FAILURE');
    });

    it('should create refreshTokenRequest action with payload', () => {
      const action = refreshTokenRequest({ refreshToken: 'mock_refresh_token' });
      expect(action.type).toBe(REFRESH_TOKEN_REQUEST);
      expect(action.payload).toEqual({ refreshToken: 'mock_refresh_token' });
    });

    it('should create refreshTokenSuccess action with payload', () => {
      const action = refreshTokenSuccess({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
      expect(action.type).toBe(REFRESH_TOKEN_SUCCESS);
      expect(action.payload).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });
    });

    it('should create refreshTokenFailure action with error payload', () => {
      const errorMsg = 'Session expired';
      const action = refreshTokenFailure(errorMsg);
      expect(action.type).toBe(REFRESH_TOKEN_FAILURE);
      expect(action.payload).toBe(errorMsg);
    });
  });

  describe('Refresh Token Reducer & State', () => {
    it('should have refreshing initial value as false', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.refreshing).toBe(false);
    });

    it('should handle REFRESH_TOKEN_REQUEST', () => {
      const state = authReducer(
        undefined,
        refreshTokenRequest({ refreshToken: 'mock_token' }),
      );
      expect(state.refreshing).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle REFRESH_TOKEN_SUCCESS and update access token while keeping existing refresh token', () => {
      const initialState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        accessToken: 'old_access_token',
        refreshToken: 'existing_refresh_token',
        refreshing: true,
      };

      const state = authReducer(
        initialState,
        refreshTokenSuccess({ access_token: 'brand_new_access_token' }),
      );

      expect(state.refreshing).toBe(false);
      expect(state.accessToken).toBe('brand_new_access_token');
      expect(state.token).toBe('brand_new_access_token');
      expect(state.refreshToken).toBe('existing_refresh_token');
      expect(state.error).toBeNull();
    });

    it('should handle REFRESH_TOKEN_SUCCESS with replaced refresh token', () => {
      const initialState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        accessToken: 'old_access_token',
        refreshToken: 'old_refresh_token',
        refreshing: true,
      };

      const state = authReducer(
        initialState,
        refreshTokenSuccess({
          accessToken: 'brand_new_access_token',
          refreshToken: 'brand_new_refresh_token',
        }),
      );

      expect(state.refreshing).toBe(false);
      expect(state.accessToken).toBe('brand_new_access_token');
      expect(state.refreshToken).toBe('brand_new_refresh_token');
    });

    it('should handle REFRESH_TOKEN_FAILURE', () => {
      const initialState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        refreshing: true,
      };

      const errorMsg = 'Session expired. Please log in again.';
      const state = authReducer(initialState, refreshTokenFailure(errorMsg));

      expect(state.refreshing).toBe(false);
      expect(state.error).toBe(errorMsg);
    });
  });

  describe('Refresh Token Worker Saga', () => {
    it('should handle successful refresh flow', () => {
      const action = refreshTokenRequest({ refreshToken: 'valid_refresh_token' });
      const saga = refreshTokenSaga(action);

      // Step 1: call refreshTokenApi
      expect(saga.next().value).toEqual(
        call(refreshTokenApi, {
          refresh_token: 'valid_refresh_token',
        }),
      );

      // Step 2: dispatch refreshTokenSuccess
      const mockResult = {
        data: {
          access_token: 'refreshed_access_token',
          expires_in: 900,
        },
        status: 200,
      };

      expect(saga.next(mockResult as any).value).toEqual(
        put(
          refreshTokenSuccess({
            accessToken: 'refreshed_access_token',
            refreshToken: undefined,
            expiresIn: 900,
          }),
        ),
      );

      // Step 3: done
      expect(saga.next().done).toBe(true);
    });

    it('should handle 401 error and clear session state', () => {
      const action = refreshTokenRequest({ refreshToken: 'expired_refresh_token' });
      const saga = refreshTokenSaga(action);

      saga.next(); // call refreshTokenApi

      const mockError = {
        response: {
          status: 401,
          data: { message: 'Refresh token expired' },
        },
      };

      // Step 1: dispatch refreshTokenFailure
      expect(saga.throw(mockError).value).toEqual(
        put(refreshTokenFailure('Refresh token expired')),
      );

      // Step 2: clear session state via logoutSuccess
      expect(saga.next().value).toEqual(put(logoutSuccess()));

      // Step 3: remove remember credentials
      expect(saga.next().value).toEqual(
        call(AsyncStorage.removeItem, constants.ISREMEMBER),
      );

      expect(saga.next().done).toBe(true);
    });
  });

  describe('Refresh Token Watcher Saga', () => {
    it('should watch REFRESH_TOKEN_REQUEST with takeLatest', () => {
      const saga = watchRefreshToken();
      expect(saga.next().value).toEqual(
        takeLatest(REFRESH_TOKEN_REQUEST, refreshTokenSaga),
      );
      expect(saga.next().done).toBe(true);
    });
  });

  describe('Register Store Action Constants and Creators', () => {
    const mockRegisterPayload = {
      store_type_id: 'salon',
      store_name: 'Royal Salon & Spa',
      owner_name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      password: 'SecurePass123!',
      address: { city: 'Bangalore' },
      gst_number: '22AAAAA0000A1Z5',
    };

    it('should have correct action constants', () => {
      expect(REGISTER_STORE_REQUEST).toBe('REGISTER_STORE_REQUEST');
      expect(REGISTER_STORE_SUCCESS).toBe('REGISTER_STORE_SUCCESS');
      expect(REGISTER_STORE_FAILURE).toBe('REGISTER_STORE_FAILURE');
    });

    it('should create registerStoreRequest action with complete payload', () => {
      const action = registerStoreRequest(mockRegisterPayload);
      expect(action.type).toBe(REGISTER_STORE_REQUEST);
      expect(action.payload).toEqual(mockRegisterPayload);
    });

    it('should create registerStoreSuccess action with response payload', () => {
      const action = registerStoreSuccess(mockResponse);
      expect(action.type).toBe(REGISTER_STORE_SUCCESS);
      expect(action.payload).toEqual(mockResponse);
    });

    it('should create registerStoreFailure action with error payload', () => {
      const errorMsg = 'Phone number or email already registered';
      const action = registerStoreFailure(errorMsg);
      expect(action.type).toBe(REGISTER_STORE_FAILURE);
      expect(action.payload).toBe(errorMsg);
    });
  });

  describe('Register Store Reducer & State', () => {
    const mockRegisterPayload = {
      store_type_id: 'salon',
      store_name: 'Royal Salon & Spa',
      owner_name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      password: 'SecurePass123!',
      address: {},
      gst_number: '22AAAAA0000A1Z5',
    };

    it('should have registering initial value as false and registrationError as null', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state.registering).toBe(false);
      expect(state.registrationError).toBeNull();
    });

    it('should handle REGISTER_STORE_REQUEST', () => {
      const state = authReducer(
        undefined,
        registerStoreRequest(mockRegisterPayload),
      );
      expect(state.registering).toBe(true);
      expect(state.registrationError).toBeNull();
    });

    it('should handle REGISTER_STORE_SUCCESS and store authentication session', () => {
      const pendingState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        registering: true,
      };

      const state = authReducer(
        pendingState,
        registerStoreSuccess(mockResponse),
      );

      expect(state.registering).toBe(false);
      expect(state.registrationError).toBeNull();
      expect(state.user).toEqual(mockResponse.user);
      expect(state.store).toEqual(mockResponse.store);
      expect(state.accessToken).toBe(mockResponse.access_token);
      expect(state.refreshToken).toBe(mockResponse.refresh_token);
      expect(state.expiresIn).toBe(mockResponse.expires_in);
      expect(state.token).toBe(mockResponse.access_token);
      expect(state.error).toBeNull();
    });

    it('should handle REGISTER_STORE_FAILURE', () => {
      const pendingState = {
        ...authReducer(undefined, { type: '@@INIT' }),
        registering: true,
      };

      const errorMsg = 'Phone number or email already registered';
      const state = authReducer(pendingState, registerStoreFailure(errorMsg));

      expect(state.registering).toBe(false);
      expect(state.registrationError).toBe(errorMsg);
      expect(state.error).toBe(errorMsg);
    });
  });

  describe('Register Store Worker Saga', () => {
    const mockRegisterPayload = {
      store_type_id: 'salon',
      store_name: 'Royal Salon & Spa',
      owner_name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      password: 'SecurePass123!',
      address: {},
      gst_number: '22AAAAA0000A1Z5',
    };

    it('should handle successful 201 store registration flow', () => {
      const action = registerStoreRequest(mockRegisterPayload);
      const saga = registerStoreSaga(action);

      // Step 1: call registerStoreApi
      expect(saga.next().value).toEqual(
        call(registerStoreApi, mockRegisterPayload),
      );

      // Step 2: dispatch registerStoreSuccess
      const mockResult = { data: mockResponse, status: 201 };
      expect(saga.next(mockResult as any).value).toEqual(
        put(registerStoreSuccess(mockResponse)),
      );

      // Step 3: done
      expect(saga.next().done).toBe(true);
    });

    it('should specifically handle 409 conflict error (phone or email already registered)', () => {
      const action = registerStoreRequest(mockRegisterPayload);
      const saga = registerStoreSaga(action);

      saga.next(); // call registerStoreApi

      const mockConflictError = {
        response: {
          status: 409,
          data: { message: 'Phone number or email already registered' },
        },
      };

      expect(saga.throw(mockConflictError).value).toEqual(
        put(registerStoreFailure('Phone number or email already registered')),
      );

      expect(saga.next().done).toBe(true);
    });

    it('should handle validation errors', () => {
      const action = registerStoreRequest(mockRegisterPayload);
      const saga = registerStoreSaga(action);

      saga.next(); // call registerStoreApi

      const mockValidationError = {
        response: {
          status: 422,
          data: { errors: ['Invalid phone number format', 'Email already used'] },
        },
      };

      expect(saga.throw(mockValidationError).value).toEqual(
        put(registerStoreFailure('Invalid phone number format, Email already used')),
      );

      expect(saga.next().done).toBe(true);
    });
  });

  describe('Register Store Watcher Saga', () => {
    it('should watch REGISTER_STORE_REQUEST with takeLatest', () => {
      const saga = watchRegisterStore();
      expect(saga.next().value).toEqual(
        takeLatest(REGISTER_STORE_REQUEST, registerStoreSaga),
      );
      expect(saga.next().done).toBe(true);
    });
  });
});


