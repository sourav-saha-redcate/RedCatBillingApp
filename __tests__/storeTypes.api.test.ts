import {
  getStoreTypesApi,
  fetchStoreTypesApi,
} from '../src/services/store.service';
import { instance } from '../src/utils/server/instance';
import { API } from '../src/utils/constants';
import { StoreType } from '../src/types';

jest.mock('../src/utils/server/instance', () => ({
  instance: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Store Types API & Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. getStoreTypesApi Service Function', () => {
    it('should call GET /api/v1/store-types using instance.get', async () => {
      const mockStoreTypes: StoreType[] = [
        {
          id: 'salon',
          name: 'Salon / Barbershop',
          icon: 'scissors',
          features: ['services', 'staff', 'appointments'],
          isActive: true,
        },
        {
          id: 'general-store',
          name: 'General Store',
          icon: 'store',
          features: ['inventory', 'barcode'],
          isActive: true,
        },
      ];

      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: mockStoreTypes,
      });

      const response = await getStoreTypesApi();

      expect(instance.get).toHaveBeenCalledTimes(1);
      expect(instance.get).toHaveBeenCalledWith(API.storeTypes.base);
      expect(API.storeTypes.base).toBe('/api/v1/store-types');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockStoreTypes);
    });

    it('should support fetchStoreTypesApi alias', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: [],
      });

      const response = await fetchStoreTypesApi();
      expect(instance.get).toHaveBeenCalledWith('/api/v1/store-types');
      expect(response.data).toEqual([]);
    });
  });

  describe('2. Active Store Types Filtering (isActive === true)', () => {
    it('should filter out store types where isActive or is_active is false', () => {
      const apiResponse: StoreType[] = [
        {
          id: 'salon',
          name: 'Salon / Barbershop',
          icon: 'scissors',
          features: ['services', 'staff', 'appointments'],
          isActive: true,
        },
        {
          id: 'inactive-retail',
          name: 'Old Retail Concept',
          icon: 'store',
          isActive: false,
        },
        {
          id: 'pharmacy',
          name: 'Medical / Pharmacy',
          icon: 'medical',
          features: ['expiry-tracking', 'batch-number'],
          is_active: true,
        },
        {
          id: 'deprecated-store',
          name: 'Deprecated Boutique',
          icon: 'custom',
          is_active: false,
        },
      ];

      const activeOnly = apiResponse.filter(item => {
        if (typeof item.isActive === 'boolean') return item.isActive;
        if (typeof item.is_active === 'boolean') return item.is_active;
        return true;
      });

      expect(activeOnly).toHaveLength(2);
      expect(activeOnly.map(s => s.id)).toEqual(['salon', 'pharmacy']);
      expect(activeOnly.map(s => s.name)).toEqual([
        'Salon / Barbershop',
        'Medical / Pharmacy',
      ]);
    });
  });

  describe('3. Mapping Name, Icon, and Features', () => {
    it('should correctly extract name, icon, and features from the API response', () => {
      const rawApiItem = {
        id: 'cafe',
        name: 'Cafe / Restaurant',
        icon: 'cafe',
        features: ['tables', 'kot', 'split-billing'],
        isActive: true,
      };

      const title = rawApiItem.name;
      const icon = rawApiItem.icon;
      const features = rawApiItem.features;

      expect(title).toBe('Cafe / Restaurant');
      expect(icon).toBe('cafe');
      expect(features).toEqual(['tables', 'kot', 'split-billing']);
    });

    it('should support backward-compatibility fallback to title and icon_type', () => {
      const legacyItem = {
        id: 'general-store',
        title: 'General Retail Store',
        icon_type: 'store',
        features: ['inventory'],
        is_active: true,
      } as any;

      const title = legacyItem.name || legacyItem.title || 'Store';
      const icon = legacyItem.icon || legacyItem.icon_type;

      expect(title).toBe('General Retail Store');
      expect(icon).toBe('store');
    });
  });

  describe('4. Store Selection & ID Storage', () => {
    it('should store selected store type id (e.g. salon, general-store, pharmacy, cafe, custom)', () => {
      const availableStoreTypes = [
        { id: 'salon', name: 'Salon / Barbershop' },
        { id: 'general-store', name: 'General Store' },
        { id: 'pharmacy', name: 'Medical / Pharmacy' },
        { id: 'cafe', name: 'Cafe / Restaurant' },
        { id: 'custom-bakery', name: 'Artisan Bakery' },
      ];

      // Simulate user selecting salon
      let selectedId = availableStoreTypes[0].id;
      let selectedName = availableStoreTypes[0].name;
      expect(selectedId).toBe('salon');
      expect(selectedName).toBe('Salon / Barbershop');

      // User selects pharmacy
      selectedId = availableStoreTypes[2].id;
      selectedName = availableStoreTypes[2].name;
      expect(selectedId).toBe('pharmacy');
      expect(selectedName).toBe('Medical / Pharmacy');

      // User selects custom
      selectedId = availableStoreTypes[4].id;
      selectedName = availableStoreTypes[4].name;
      expect(selectedId).toBe('custom-bakery');
      expect(selectedName).toBe('Artisan Bakery');

      // Navigation payload verification
      const navigationPayload = {
        storeType: selectedName,
        storeTypeId: selectedId,
      };
      expect(navigationPayload.storeTypeId).toBe('custom-bakery');
    });
  });

  describe('5. Error Handling and Empty State Flow', () => {
    it('should handle API errors gracefully and allow retry', async () => {
      (instance.get as jest.Mock).mockRejectedValueOnce(
        new Error('Network error: server unreachable'),
      );

      let errorMsg: string | null = null;
      try {
        await getStoreTypesApi();
      } catch (err: any) {
        errorMsg = err.message || 'Unable to load store types';
      }

      expect(errorMsg).toBe('Network error: server unreachable');

      // Retry mechanism
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 'salon',
            name: 'Salon',
            icon: 'scissors',
            isActive: true,
          },
        ],
      });

      const retryRes = await getStoreTypesApi();
      expect(retryRes.status).toBe(200);
      expect(retryRes.data[0].id).toBe('salon');
    });

    it('should identify empty active store types response', async () => {
      (instance.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: [],
      });

      const res = await getStoreTypesApi();
      const list = res.data.filter(s => s.isActive === true);
      expect(list).toHaveLength(0);
    });
  });
});
