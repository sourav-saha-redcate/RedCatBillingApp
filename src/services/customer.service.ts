import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  CreateCustomerPayload,
  Customer,
  PaginatedResponse,
  UpdateCustomerPayload,
} from '@app/types';

/**
 * Customers Directory API Service
 */

export const getCustomersApi = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<PaginatedResponse<Customer> | Customer[]>> => {
  return instance.get(API.customers.base, { params });
};

export const createCustomerApi = async (
  payload: CreateCustomerPayload,
): Promise<AxiosResponse<Customer>> => {
  return instance.post<Customer>(API.customers.base, payload);
};

export const getCustomerByIdApi = async (id: string): Promise<AxiosResponse<Customer>> => {
  return instance.get<Customer>(API.customers.byId(id));
};

export const updateCustomerApi = async (
  id: string,
  payload: UpdateCustomerPayload,
): Promise<AxiosResponse<Customer>> => {
  return instance.patch<Customer>(API.customers.byId(id), payload);
};

export default {
  getCustomersApi,
  createCustomerApi,
  getCustomerByIdApi,
  updateCustomerApi,
};
