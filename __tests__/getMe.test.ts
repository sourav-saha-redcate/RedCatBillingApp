import {
  GET_ME_REQUEST,
  GET_ME_SUCCESS,
  GET_ME_FAILURE,
  getMeRequest,
  getMeSuccess,
  getMeFailure,
} from '../src/store/actions/auth.actions';
import authReducer from '../src/store/slice/auth.slice';
import { getMeSaga, watchGetMe } from '../src/store/service/auth.saga';
import { getMeApi } from '../src/services/auth.service';
import { instance } from '../src/utils/server/instance';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API } from '../src/utils/constants';

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

describe('Authenticated User Context (GET /api/v1/auth/me)', () => {
  const mockContextResponse = {
    user: {
      id: 'e721a97c-3f23-4556-a957-c81ec352a912',
      name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com',
      role: 'owner',
    },
    store: {
      id: 'b18b6255-a226-4fa2-b283-a75782a98f12',
      name: 'Royal Salon & Spa',
      type: 'salon',
    },
    permissions: [
      'billing.create',
      'billing.view',
      'inventory.manage',
      'staff.manage',
      'reports.view',
      'settings.manage',
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Action Constants and Creators', () => {
    it('should have correct action constants', () => {
      expect(GET_ME_REQUEST).toBe('GET_ME_REQUEST');
      expect(GET_ME_SUCCESS).toBe('GET_ME_SUCCESS');
      expect(GET_ME_FAILURE).toBe('GET_ME_FAILURE');
    });

    it('should create getMeRequest action with no payload', () => {
      const action = getMeRequest();
      expect(action).toEqual({
        type: 'GET_ME_REQUEST',
        payload: undefined,
      });
    });

    it('should create getMeSuccess action with response payload', () => {
      const action = getMeSuccess(mockContextResponse);
      expect(action).toEqual({
        type: 'GET_ME_SUCCESS',
        payload: mockContextResponse,
      });
    });

    it('should create getMeFailure action with error payload', () => {
      const action = getMeFailure('Unauthorized session');
      expect(action).toEqual({
        type: 'GET_ME_FAILURE',
        payload: 'Unauthorized session',
      });
    });
  });

  describe('Auth Reducer & State', () => {
    const initialState = authReducer(undefined, { type: '@@INIT' });

    it('should have permissions initialized as an empty array', () => {
      expect(initialState.permissions).toEqual([]);
      expect(initialState.loading).toBe(false);
      expect(initialState.user).toBeNull();
      expect(initialState.store).toBeNull();
    });

    it('should handle GET_ME_REQUEST', () => {
      const state = authReducer(initialState, getMeRequest());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.status).toBe(GET_ME_REQUEST);
    });

    it('should handle GET_ME_SUCCESS and store user, store, and exact permissions', () => {
      const loadingState = { ...initialState, loading: true };
      const state = authReducer(loadingState, getMeSuccess(mockContextResponse));

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockContextResponse.user);
      expect(state.store).toEqual(mockContextResponse.store);
      expect(state.permissions).toEqual([
        'billing.create',
        'billing.view',
        'inventory.manage',
        'staff.manage',
        'reports.view',
        'settings.manage',
      ]);
      expect(state.error).toBeNull();
      expect(state.status).toBe(GET_ME_SUCCESS);
    });

    it('should handle GET_ME_FAILURE', () => {
      const loadingState = { ...initialState, loading: true };
      const state = authReducer(loadingState, getMeFailure('Invalid token'));

      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid token');
      expect(state.status).toBe(GET_ME_FAILURE);
    });
  });

  describe('Worker Saga: getMeSaga', () => {
    it('should handle successful 200 response from GET /api/v1/auth/me', () => {
      const saga = getMeSaga();

      // Step 1: Call getMeApi
      expect(saga.next().value).toEqual(call(getMeApi));

      // Step 2: Receive 200 response and dispatch getMeSuccess
      const mockAxiosResponse = {
        data: {
          statusCode: 200,
          success: true,
          data: mockContextResponse,
        },
        status: 200,
      };

      expect(saga.next(mockAxiosResponse as any).value).toEqual(
        put(getMeSuccess(mockContextResponse)),
      );

      expect(saga.next().done).toBe(true);
    });

    it('should handle 401 unauthorized error', () => {
      const saga = getMeSaga();

      saga.next(); // call getMeApi

      const mock401Error = {
        response: {
          status: 401,
          data: { message: 'Invalid or expired authentication token' },
        },
      };

      expect(saga.throw(mock401Error).value).toEqual(
        put(getMeFailure('Invalid or expired authentication token')),
      );

      expect(saga.next().done).toBe(true);
    });

    it('should handle unexpected network errors', () => {
      const saga = getMeSaga();

      saga.next(); // call getMeApi

      const mockNetworkError = {
        message: 'Network Error',
      };

      expect(saga.throw(mockNetworkError).value).toEqual(
        put(getMeFailure('Network Error')),
      );

      expect(saga.next().done).toBe(true);
    });
  });

  describe('Watcher Saga: watchGetMe', () => {
    it('should watch GET_ME_REQUEST with takeLatest', () => {
      const saga = watchGetMe();
      expect(saga.next().value).toEqual(takeLatest(GET_ME_REQUEST, getMeSaga));
      expect(saga.next().done).toBe(true);
    });
  });

  describe('API Service: getMeApi', () => {
    it('should call instance.get with /api/v1/auth/me', async () => {
      const mockResponse = {
        data: mockContextResponse,
        status: 200,
      };

      (instance.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await getMeApi();

      expect(instance.get).toHaveBeenCalledTimes(1);
      expect(instance.get).toHaveBeenCalledWith(API.auth.me);
      expect(response.status).toBe(200);
      expect(response.data.user.name).toBe('John Doe');
      expect(response.data.permissions).toContain('billing.create');
    });
  });
});
