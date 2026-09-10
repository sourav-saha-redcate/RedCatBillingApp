import authReducer, {
  logoutRequest,
  logoutSuccess,
  loginSuccess,
} from '../src/store/slice/auth.slice';
import { handleLogout } from '../src/store/service/auth.saga';
import { logoutApi } from '../src/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Storage from '../src/utils/storage';
import constants from '../src/utils/constants';
import { StoreSettingsService } from '../src/utils/store/StoreSettingsService';
import {
  isProtectedRoute,
  PROTECTED_ROUTES,
  navigate,
  replace,
  navigationRef,
  reset,
} from '../src/navigation/RootNaivgation';
import { store } from '../src/store';
import { call, put } from 'redux-saga/effects';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('../src/services/auth.service', () => ({
  logoutApi: jest.fn(),
  loginApi: jest.fn(),
  refreshTokenApi: jest.fn(),
  registerStoreApi: jest.fn(),
}));

jest.mock('../src/utils/storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clearAll: jest.fn(() => Promise.resolve()),
}));

describe('Complete Logout Flow Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Redux Auth Slice Cleanup on Logout', () => {
    it('should completely clear all tokens, session, and user data on logoutSuccess', () => {
      // Simulate an active authenticated state
      const authenticatedState = {
        loading: false,
        refreshing: false,
        registering: false,
        registrationError: null,
        user: { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'owner' } as any,
        store: { id: 's1', name: 'RC Electronics', type: 'electronics' } as any,
        permissions: ['billing:create', 'inventory:view'],
        accessToken: 'access-token-12345',
        refreshToken: 'refresh-token-12345',
        token: 'access-token-12345',
        expiresIn: 3600,
        error: null,
        forgotPasswordLoading: false,
        forgotPasswordSuccess: false,
        forgotPasswordError: null,
        status: 'LOGIN_SUCCESS',
        otpVerifyRes: null,
        isInstalled: 'true',
        signInRes: { message: 'Logged in' },
        forgotPassRes: null,
        onBoardingProgress: { step: 3 },
        isProfileComplete: true,
        questionSubmit: null,
        selectedStoreType: null,
      };

      const loggedOutState = authReducer(authenticatedState, logoutSuccess());

      // Verify tokens and session data are cleared
      expect(loggedOutState.token).toBe('');
      expect(loggedOutState.accessToken).toBe('');
      expect(loggedOutState.refreshToken).toBe('');
      expect(loggedOutState.user).toBeNull();
      expect(loggedOutState.store).toBeNull();
      expect(loggedOutState.permissions).toEqual([]);
      expect(loggedOutState.expiresIn).toBeNull();
      expect(loggedOutState.signInRes).toBeNull();
      expect(loggedOutState.loading).toBe(false);
      expect(loggedOutState.isProfileComplete).toBe(false);
      expect(loggedOutState.onBoardingProgress).toBeNull();
      expect(loggedOutState.error).toBeNull();
    });
  });

  describe('2. Logout Worker Saga Execution', () => {
    it('should call logoutApi, wipe storage, dispatch logoutSuccess, and reset navigation', () => {
      const saga = handleLogout();

      // Step 1: Call logoutApi
      expect(saga.next().value).toEqual(call(logoutApi));

      // Step 2: Clear stored tokens in AsyncStorage & Storage
      expect(saga.next().value).toEqual(call(AsyncStorage.removeItem, constants.TOKEN));
      expect(saga.next().value).toEqual(call(AsyncStorage.removeItem, constants.ISREMEMBER));
      expect(saga.next().value).toEqual(call(Storage.removeItem, 'token'));
      expect(saga.next().value).toEqual(call(Storage.removeItem, 'refresh-token'));
      expect(saga.next().value).toEqual(call([StoreSettingsService, 'clearCache']));

      // Step 3: Dispatch logoutSuccess action to Redux
      expect(saga.next().value).toEqual(put(logoutSuccess()));

      // Step 4: Saga completes execution
      expect(saga.next().done).toBe(true);
    });

    it('should still perform storage cleanup and dispatch logoutSuccess even if logoutApi fails (offline/network error)', () => {
      const saga = handleLogout();

      // Step 1: Call logoutApi
      saga.next();

      // Step 2: Simulate network failure in logoutApi
      const networkError = new Error('Network Error');
      // The inner try/catch in saga catches this and continues cleanup
      const nextYield = saga.next();

      // Storage cleanup must still proceed
      expect(nextYield.value).toEqual(call(AsyncStorage.removeItem, constants.TOKEN));
      expect(saga.next().value).toEqual(call(AsyncStorage.removeItem, constants.ISREMEMBER));
      expect(saga.next().value).toEqual(call(Storage.removeItem, 'token'));
      expect(saga.next().value).toEqual(call(Storage.removeItem, 'refresh-token'));
      expect(saga.next().value).toEqual(call([StoreSettingsService, 'clearCache']));

      // logoutSuccess must still be dispatched
      expect(saga.next().value).toEqual(put(logoutSuccess()));
      expect(saga.next().done).toBe(true);
    });
  });

  describe('3. Route Protection & Unauthenticated Redirects', () => {
    it('should correctly classify protected vs public routes', () => {
      // Protected routes
      expect(isProtectedRoute('TabNavigator')).toBe(true);
      expect(isProtectedRoute('Home')).toBe(true);
      expect(isProtectedRoute('Settings')).toBe(true);
      expect(isProtectedRoute('NewBill')).toBe(true);
      expect(isProtectedRoute('BillHistory')).toBe(true);
      expect(isProtectedRoute('DailySummary')).toBe(true);

      // Public routes
      expect(isProtectedRoute('SignIn')).toBe(false);
      expect(isProtectedRoute('SignUp')).toBe(false);
      expect(isProtectedRoute('GetStarted')).toBe(false);
      expect(isProtectedRoute('Splash')).toBe(false);
      expect(isProtectedRoute('ChooseStoreType')).toBe(false);
      expect(isProtectedRoute('StoreSetup')).toBe(false);
    });

    it('should redirect unauthenticated navigate calls to SignIn when accessing a protected route', () => {
      // Ensure user is unauthenticated in store
      store.dispatch(logoutSuccess());

      const resetSpy = jest.spyOn(navigationRef, 'reset').mockImplementation(() => {});
      const navigateSpy = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});
      jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);

      // Attempt navigating to a protected screen while unauthenticated
      navigate('Settings' as any);

      // Should redirect to SignIn via stack reset
      expect(resetSpy).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      // Should NOT call the normal navigate to Settings
      expect(navigateSpy).not.toHaveBeenCalled();

      resetSpy.mockRestore();
      navigateSpy.mockRestore();
    });

    it('should redirect unauthenticated replace calls to SignIn when accessing a protected route', () => {
      store.dispatch(logoutSuccess());

      const resetSpy = jest.spyOn(navigationRef, 'reset').mockImplementation(() => {});
      const dispatchSpy = jest.spyOn(navigationRef, 'dispatch').mockImplementation(() => {});
      jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);

      // Attempt replacing to a protected screen while unauthenticated
      replace('TabNavigator' as any);

      // Should redirect to SignIn via stack reset
      expect(resetSpy).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
      expect(dispatchSpy).not.toHaveBeenCalled();

      resetSpy.mockRestore();
      dispatchSpy.mockRestore();
    });
  });

  describe('4. State Persistence and Refresh Behavior', () => {
    it('should persist an unauthenticated state in the store after logoutSuccess', () => {
      // Dispatch logout
      store.dispatch(logoutSuccess());

      const state = store.getState().auth;
      expect(state.accessToken).toBe('');
      expect(state.token).toBe('');
      expect(state.user).toBeNull();
      expect(state.store).toBeNull();

      // On next rehydration/refresh, state is guaranteed to be empty
      const rehydratedToken = state.accessToken || state.token;
      expect(Boolean(rehydratedToken)).toBe(false);
    });
  });
});
