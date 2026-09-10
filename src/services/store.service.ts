import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  CreateCustomStoreTypePayload,
  StoreProfile,
  StoreType,
  TaxSettings,
  UpdateStoreProfilePayload,
  UpdateTaxSettingsPayload,
} from '@app/types';

/**
 * Store Types & Store Profile API Service
 */

export const getStoreTypesApi = async (): Promise<AxiosResponse<StoreType[]>> => {
  console.log('[DEBUG SERVICE] getStoreTypesApi GET ->', API.storeTypes.base);
  return instance.get<StoreType[]>(API.storeTypes.base);
};

export const fetchStoreTypesApi = getStoreTypesApi;

export const createCustomStoreTypeApi = async (
  payload: CreateCustomStoreTypePayload,
): Promise<AxiosResponse<StoreType>> => {
  console.log('[DEBUG SERVICE] createCustomStoreTypeApi POST ->', API.storeTypes.base, payload);
  return instance.post<StoreType>(API.storeTypes.base, payload);
};

export const getStoreTypeByIdApi = async (id: string): Promise<AxiosResponse<StoreType>> => {
  console.log('[DEBUG SERVICE] getStoreTypeByIdApi GET ->', API.storeTypes.byId(id));
  return instance.get<StoreType>(API.storeTypes.byId(id));
};

export const getStoreProfileApi = async (): Promise<AxiosResponse<StoreProfile>> => {
  console.log('[DEBUG SERVICE] getStoreProfileApi GET ->', API.store.base);
  return instance.get<StoreProfile>(API.store.base);
};

export const updateStoreProfileApi = async (
  payload: UpdateStoreProfilePayload,
): Promise<AxiosResponse<StoreProfile>> => {
  console.log('[DEBUG SERVICE] updateStoreProfileApi PATCH ->', API.store.base, payload);
  return instance.patch<StoreProfile>(API.store.base, payload);
};

export const getTaxSettingsApi = async (): Promise<AxiosResponse<TaxSettings>> => {
  console.log('[DEBUG SERVICE] getTaxSettingsApi GET ->', API.store.taxSettings);
  return instance.get<TaxSettings>(API.store.taxSettings);
};

export const updateTaxSettingsApi = async (
  payload: UpdateTaxSettingsPayload,
): Promise<AxiosResponse<TaxSettings>> => {
  console.log('[DEBUG SERVICE] updateTaxSettingsApi PATCH ->', API.store.taxSettings, payload);
  return instance.patch<TaxSettings>(API.store.taxSettings, payload);
};

export default {
  getStoreTypesApi,
  fetchStoreTypesApi,
  createCustomStoreTypeApi,
  getStoreTypeByIdApi,
  getStoreProfileApi,
  updateStoreProfileApi,
  getTaxSettingsApi,
  updateTaxSettingsApi,
};
