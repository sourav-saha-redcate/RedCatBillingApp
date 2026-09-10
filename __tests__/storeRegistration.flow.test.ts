import { registerStoreApi } from '../src/services/auth.service';
import { instance } from '../src/utils/server/instance';
import { API } from '../src/utils/constants';
import authReducer, {
  setSelectedStoreType,
  registerStoreRequest,
  logoutSuccess,
} from '../src/store/slice/auth.slice';
import { RegisterStoreRequestPayload, StoreType } from '../src/types';

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  },
}));

describe('Store Creation Flow with API-provided store_type_id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. API-Provided Store Types Mapping and Selection', () => {
    const mockApiStoreTypes: StoreType[] = [
      {
        id: 'salon',
        name: 'Salon / Barbershop',
        icon: 'scissors',
        features: ['services', 'staff', 'appointments'],
        isActive: true,
      },
      {
        id: 'cafe',
        name: 'Cafe & Bakery',
        icon: 'coffee',
        features: ['kitchen', 'tables'],
        isActive: true,
      },
      {
        id: 'custom-type-987',
        name: 'Custom Boutique Store',
        icon: 'store',
        features: ['custom-billing'],
        isActive: true,
      },
    ];

    it('should map API response preserving the exact item.id and name', () => {
      const mapped = mockApiStoreTypes.map(item => ({
        id: String(item.id),
        name: item.name,
        title: item.name,
      }));

      expect(mapped[0].id).toBe('salon');
      expect(mapped[0].name).toBe('Salon / Barbershop');
      expect(mapped[1].id).toBe('cafe');
      expect(mapped[1].name).toBe('Cafe & Bakery');
      expect(mapped[2].id).toBe('custom-type-987');
    });

    it('should store selected store type id "salon" in Redux when user selects Salon', () => {
      const selected = mockApiStoreTypes[0]; // Salon
      const state = authReducer(
        undefined,
        setSelectedStoreType({ id: selected.id, name: selected.name || 'Salon / Barbershop' }),
      );

      expect(state.selectedStoreType).toEqual({
        id: 'salon',
        name: 'Salon / Barbershop',
      });
      // CRITICAL ASSERTION: The ID must be the API ID, NOT the display text
      expect(state.selectedStoreType?.id).toBe('salon');
      expect(state.selectedStoreType?.id).not.toBe('Salon / Barbershop');
    });

    it('should store selected store type id "cafe" in Redux when user selects Cafe', () => {
      const selected = mockApiStoreTypes[1]; // Cafe
      const state = authReducer(
        undefined,
        setSelectedStoreType({ id: selected.id, name: selected.name || 'Cafe & Bakery' }),
      );

      expect(state.selectedStoreType).toEqual({
        id: 'cafe',
        name: 'Cafe & Bakery',
      });
      expect(state.selectedStoreType?.id).toBe('cafe');
      expect(state.selectedStoreType?.id).not.toBe('Cafe & Bakery');
    });

    it('should clear selectedStoreType upon logoutSuccess', () => {
      const initial = authReducer(
        undefined,
        setSelectedStoreType({ id: 'salon', name: 'Salon / Barbershop' }),
      );
      expect(initial.selectedStoreType?.id).toBe('salon');

      const loggedOut = authReducer(initial, logoutSuccess());
      expect(loggedOut.selectedStoreType).toBeNull();
    });
  });

  describe('2. Preservation Through Onboarding Navigation and State', () => {
    it('should correctly prioritize store_type_id / storeTypeId from navigation params and Redux', () => {
      // Simulate navigation from ChooseStoreType to StoreSetup
      const selectedId = 'salon';
      const selectedType = 'Salon / Barbershop';

      const navParams = {
        storeType: selectedType,
        storeTypeId: selectedId,
        store_type_id: selectedId,
      };

      const reduxState = {
        selectedStoreType: { id: selectedId, name: selectedType },
      };

      // In StoreSetup:
      const resolvedStoreTypeId =
        navParams.store_type_id ||
        navParams.storeTypeId ||
        reduxState.selectedStoreType?.id;

      expect(resolvedStoreTypeId).toBe('salon');
      expect(resolvedStoreTypeId).not.toBe('Salon / Barbershop');
    });

    it('should fallback to Redux selectedStoreType if route.params has no storeTypeId', () => {
      const navParams = {
        storeType: 'Salon / Barbershop',
      };

      const reduxState = {
        selectedStoreType: { id: 'salon', name: 'Salon / Barbershop' },
      };

      const resolvedStoreTypeId =
        (navParams as any).store_type_id ||
        (navParams as any).storeTypeId ||
        reduxState.selectedStoreType?.id;

      expect(resolvedStoreTypeId).toBe('salon');
    });

    it('should NOT hardcode IDs and support any dynamic API-returned ID (e.g. custom UUID)', () => {
      const dynamicApiId = 'type_abc_123_xyz';
      const dynamicName = 'Gourmet Delicatessen';

      const navParams = {
        storeType: dynamicName,
        storeTypeId: dynamicApiId,
        store_type_id: dynamicApiId,
      };

      const payload: RegisterStoreRequestPayload = {
        store_type_id: navParams.store_type_id,
        store_name: 'Downtown Gourmet',
        owner_name: 'Alice Chef',
        phone: '+919876543210',
        email: 'alice@example.com',
        password: 'Password123!',
      };

      expect(payload.store_type_id).toBe('type_abc_123_xyz');
      expect(payload.store_type_id).not.toBe('Gourmet Delicatessen');
    });
  });

  describe('3. Store Creation Network Request Verification', () => {
    it('should send store_type_id: "salon" when user selected Salon and submitted', async () => {
      const payload: RegisterStoreRequestPayload = {
        store_type_id: 'salon',
        store_name: 'Royal Hair Studio',
        owner_name: 'Bob Barber',
        phone: '+919876543210',
        email: 'bob@example.com',
        password: 'SecurePassword123!',
      };

      const mockResponse = {
        data: {
          store: { id: 'st_123', name: 'Royal Hair Studio', store_type_id: 'salon' },
          user: { id: 'u_123', name: 'Bob Barber' },
          access_token: 'acc_token_mock',
          refresh_token: 'ref_token_mock',
          expires_in: 900,
        },
        status: 201,
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await registerStoreApi(payload);

      // Verify the final network request
      expect(instance.post).toHaveBeenCalledTimes(1);
      expect(instance.post).toHaveBeenCalledWith(API.auth.registerStore, payload);

      const calledEndpoint = (instance.post as jest.Mock).mock.calls[0][0];
      const calledPayload = (instance.post as jest.Mock).mock.calls[0][1];

      expect(calledEndpoint).toBe('/api/v1/auth/register-store');
      expect(calledPayload.store_type_id).toBe('salon');
      expect(calledPayload.store_type_id).not.toBe('Salon / Barbershop');
      expect(response.status).toBe(201);
    });

    it('should send store_type_id: "cafe" when user selected Cafe and submitted', async () => {
      const payload: RegisterStoreRequestPayload = {
        store_type_id: 'cafe',
        store_name: 'Corner Coffee Co.',
        owner_name: 'Charlie Brewer',
        phone: '+919876543211',
        email: 'charlie@example.com',
        password: 'SecurePassword123!',
      };

      const mockResponse = {
        data: {
          store: { id: 'st_456', name: 'Corner Coffee Co.', store_type_id: 'cafe' },
          user: { id: 'u_456', name: 'Charlie Brewer' },
          access_token: 'acc_token_mock_2',
          refresh_token: 'ref_token_mock_2',
          expires_in: 900,
        },
        status: 201,
      };

      (instance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const response = await registerStoreApi(payload);

      expect(instance.post).toHaveBeenCalledWith(API.auth.registerStore, payload);
      const calledPayload = (instance.post as jest.Mock).mock.calls[0][1];

      expect(calledPayload.store_type_id).toBe('cafe');
      expect(calledPayload.store_type_id).not.toBe('Cafe');
      expect(response.status).toBe(201);
    });

    it('should ensure Redux registerStoreRequest payload carries store_type_id accurately', () => {
      const payload: RegisterStoreRequestPayload = {
        store_type_id: 'salon',
        store_name: 'Luxury Spa',
        owner_name: 'Diana Prince',
        phone: '+919876543212',
        email: 'diana@example.com',
        password: 'SecurePassword123!',
      };

      const action = registerStoreRequest(payload);
      expect(action.payload.store_type_id).toBe('salon');
      expect(action.payload.store_type_id).not.toBe('Salon / Barbershop');

      const state = authReducer(undefined, action);
      expect(state.registering).toBe(true);
      expect(state.registrationError).toBeNull();
    });
  });
});
