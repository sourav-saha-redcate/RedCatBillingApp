import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  AdjustStockPayload,
  InventoryItem,
  InventorySummary,
  InventoryTransaction,
  PaginatedResponse,
} from '@app/types';

/**
 * Inventory & Stock Adjustment API Service
 */

export const getInventoryItemsApi = async (params?: {
  search?: string;
  status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<PaginatedResponse<InventoryItem> | InventoryItem[]>> => {
  return instance.get(API.inventory.items, { params });
};

export const getInventorySummaryApi = async (): Promise<AxiosResponse<InventorySummary>> => {
  return instance.get<InventorySummary>(API.inventory.summary);
};

export const adjustStockApi = async (
  itemId: string,
  payload: AdjustStockPayload,
): Promise<AxiosResponse<InventoryItem>> => {
  return instance.post<InventoryItem>(API.inventory.adjust(itemId), payload);
};

export const getItemTransactionsApi = async (
  itemId: string,
): Promise<AxiosResponse<InventoryTransaction[]>> => {
  return instance.get<InventoryTransaction[]>(API.inventory.itemTransactions(itemId));
};

export const getAllTransactionsApi = async (params?: {
  start_date?: string;
  end_date?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<PaginatedResponse<InventoryTransaction> | InventoryTransaction[]>> => {
  return instance.get(API.inventory.transactions, { params });
};

export default {
  getInventoryItemsApi,
  getInventorySummaryApi,
  adjustStockApi,
  getItemTransactionsApi,
  getAllTransactionsApi,
};
