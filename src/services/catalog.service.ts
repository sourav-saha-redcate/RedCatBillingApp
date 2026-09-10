import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  CatalogItem,
  Category,
  CreateCatalogItemPayload,
  CreateCategoryPayload,
  PaginatedResponse,
  UpdateCatalogItemPayload,
  UpdateCategoryPayload,
} from '@app/types';

/**
 * Categories & Product/Service Catalog API Service
 */

// --- Categories ---
export const getCategoriesApi = async (
  isActive: boolean = true,
): Promise<AxiosResponse<Category[]>> => {
  return instance.get<Category[]>(API.categories.base, {
    params: { is_active: isActive },
  });
};

export const createCategoryApi = async (
  payload: CreateCategoryPayload,
): Promise<AxiosResponse<Category>> => {
  return instance.post<Category>(API.categories.base, payload);
};

export const getCategoryByIdApi = async (id: string): Promise<AxiosResponse<Category>> => {
  return instance.get<Category>(API.categories.byId(id));
};

export const updateCategoryApi = async (
  id: string,
  payload: UpdateCategoryPayload,
): Promise<AxiosResponse<Category>> => {
  return instance.patch<Category>(API.categories.byId(id), payload);
};

export const deleteCategoryApi = async (
  id: string,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.delete(API.categories.byId(id));
};

// --- Catalog Items ---
export const getCatalogItemsApi = async (params?: {
  category_id?: string;
  type?: 'product' | 'service';
  active_only?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<PaginatedResponse<CatalogItem> | CatalogItem[] | any>> => {
  const queryParams: any = { ...params };
  if (queryParams.is_active !== undefined && queryParams.active_only === undefined) {
    queryParams.active_only = queryParams.is_active;
    delete queryParams.is_active;
  }
  return instance.get(API.catalog.base, { params: queryParams });
};

export const searchCatalogApi = async (
  query: string,
): Promise<AxiosResponse<CatalogItem[]>> => {
  return instance.get<CatalogItem[]>(API.catalog.search, {
    params: { q: query },
  });
};

export const createCatalogItemApi = async (
  payload: CreateCatalogItemPayload,
): Promise<AxiosResponse<CatalogItem>> => {
  return instance.post<CatalogItem>(API.catalog.items, payload);
};

export const getCatalogItemByIdApi = async (
  id: string,
): Promise<AxiosResponse<CatalogItem>> => {
  return instance.get<CatalogItem>(API.catalog.itemById(id));
};

export const updateCatalogItemApi = async (
  id: string,
  payload: UpdateCatalogItemPayload,
): Promise<AxiosResponse<CatalogItem>> => {
  return instance.patch<CatalogItem>(API.catalog.itemById(id), payload);
};

export const deleteCatalogItemApi = async (
  id: string,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.delete(API.catalog.itemById(id));
};

export const uploadCatalogItemImageApi = async (
  id: string,
  formData: FormData,
): Promise<AxiosResponse<{ image_url: string }>> => {
  return instance.post(API.catalog.itemImage(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const removeCatalogItemImageApi = async (
  id: string,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.delete(API.catalog.itemImage(id));
};

export default {
  getCategoriesApi,
  createCategoryApi,
  getCategoryByIdApi,
  updateCategoryApi,
  deleteCategoryApi,
  getCatalogItemsApi,
  searchCatalogApi,
  createCatalogItemApi,
  getCatalogItemByIdApi,
  updateCatalogItemApi,
  deleteCatalogItemApi,
  uploadCatalogItemImageApi,
  removeCatalogItemImageApi,
};
