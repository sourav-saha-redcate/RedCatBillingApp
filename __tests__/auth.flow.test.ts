import { instance } from '../src/utils/server/instance';
import {
  loginApi,
  refreshTokenApi,
  registerStoreApi,
} from '../src/services/auth.service';
import {
  loginRequest,
  registerStoreRequest,
  refreshTokenRequest,
} from '../src/store/actions/auth.actions';
import { API } from '../src/utils/constants';

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

describe('Auth API Services & DevTools Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginApi Flow', () => {
    it('should call instance.post with /api/v1/auth/login and payload', async () => {
      const payload = {
        username: '+919876543210',
        password: 'SecurePass123!',
        remember_me: true,
      };

      const mockResponse = {
        data: {
          store: { id: 's1', name: 'Store', type: 'retail' },
          user: { id: 'u1', name: 'User', phone: '+919876543210', email: 'u@test.com', role: 'owner' },
          access_token: 'tok-123',
          refresh_token: 'ref-123',
          expires_in: 900,
        },
        status: 200,
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await loginApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.login, payload);
      expect(response.status).toBe(200);
      expect(response.data.access_token).toBe('tok-123');
    });
  });

  describe('refreshTokenApi Flow', () => {
    it('should call instance.post with /api/v1/auth/refresh and refresh_token', async () => {
      const payload = { refresh_token: 'ref-token-xyz' };
      const mockResponse = {
        data: { access_token: 'new-tok-456', refresh_token: 'new-ref-456', expires_in: 900 },
        status: 200,
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await refreshTokenApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.refreshToken, payload);
      expect(response.status).toBe(200);
      expect(response.data.access_token).toBe('new-tok-456');
    });
  });

  describe('registerStoreApi Flow', () => {
    it('should call instance.post with /api/v1/auth/register-store and payload', async () => {
      const payload = {
        store_type_id: 'salon',
        store_name: 'Royal Salon',
        owner_name: 'John Doe',
        phone: '+919876543210',
        email: 'john@example.com',
        password: 'SecurePass123!',
        address: '123 Main St',
        gst_number: '22AAAAA0000A1Z5',
      };

      const mockResponse = {
        data: {
          store: { id: 's2', name: 'Royal Salon', type: 'salon' },
          user: { id: 'u2', name: 'John Doe', phone: '+919876543210', email: 'john@example.com', role: 'owner' },
          access_token: 'tok-reg-123',
          refresh_token: 'ref-reg-123',
          expires_in: 900,
        },
        status: 201,
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await registerStoreApi(payload);

      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.registerStore, payload);
      expect(response.status).toBe(201);
      expect(response.data.store.name).toBe('Royal Salon');
    });
  });

  describe('Action Dispatch Verification', () => {
    it('should create valid login action ready for saga interception', () => {
      const action = loginRequest({
        username: '+919876543210',
        password: 'SecurePass123!',
        remember_me: true,
      });

      expect(action.type).toBe('LOGIN_REQUEST');
      expect(action.payload.username).toBe('+919876543210');
      expect(action.payload.remember_me).toBe(true);
    });

    it('should create valid register store action ready for saga interception', () => {
      const action = registerStoreRequest({
        store_type_id: 'salon',
        store_name: 'Royal Salon',
        owner_name: 'John Doe',
        phone: '+919876543210',
        email: 'john@example.com',
        password: 'SecurePass123!',
      });

      expect(action.type).toBe('REGISTER_STORE_REQUEST');
      expect(action.payload.store_type_id).toBe('salon');
    });
  });
});
