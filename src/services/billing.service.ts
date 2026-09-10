import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  BillHistoryQueryParams,
  BillHistoryResponseDto,
  BillRefund,
  BillResponseDto,
  CreateBillDto,
  CreateBillPayload,
  FinalizeBillDto,
  FinalizeBillPayload,
  RecordPaymentDto,
  RecordPaymentPayload,
  RefundBillDto,
  RefundBillPayload,
  SendReceiptPayload,
} from '@app/types';

/**
 * Billing, Payment, Receipt, and Refund API Service
 * Conforming strictly to OpenAPI 3.0 specification from https://ebill.rabbul.in/docs
 */

export interface GetBillHistoryParams extends BillHistoryQueryParams {
  start_date?: string;
  end_date?: string;
}

export const getBillHistoryApi = async (
  params?: GetBillHistoryParams,
): Promise<AxiosResponse<BillHistoryResponseDto | BillResponseDto[] | any>> => {
  // Map legacy start_date / end_date to OpenAPI compliant 'from' and 'to' if needed
  const queryParams: any = { ...params };
  if (queryParams.start_date && !queryParams.from) {
    queryParams.from = queryParams.start_date;
    delete queryParams.start_date;
  }
  if (queryParams.end_date && !queryParams.to) {
    queryParams.to = queryParams.end_date;
    delete queryParams.end_date;
  }

  return instance.get(API.bills.base, { params: queryParams });
};

export const createBillApi = async (
  payload: CreateBillDto | CreateBillPayload,
): Promise<AxiosResponse<BillResponseDto | any>> => {
  return instance.post(API.bills.base, payload);
};

export const recordPaymentApi = async (
  billId: string,
  payload: RecordPaymentDto | RecordPaymentPayload,
): Promise<AxiosResponse<BillResponseDto | any>> => {
  return instance.post(API.bills.payment(billId), payload);
};

export const finalizeBillApi = async (
  billId: string,
  payload?: FinalizeBillDto | FinalizeBillPayload,
): Promise<AxiosResponse<BillResponseDto | any>> => {
  return instance.post(API.bills.finalize(billId), payload || {});
};

export const getBillByIdApi = async (
  billId: string,
): Promise<AxiosResponse<BillResponseDto | any>> => {
  return instance.get(API.bills.byId(billId));
};

export const sendReceiptApi = async (
  billId: string,
  payload: SendReceiptPayload,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.post(API.bills.sendReceipt(billId), payload);
};

export const refundBillApi = async (
  billId: string,
  payload: RefundBillDto | RefundBillPayload,
): Promise<AxiosResponse<BillResponseDto | any>> => {
  return instance.post(API.bills.refund(billId), payload);
};

export const getBillRefundsApi = async (
  billId: string,
): Promise<AxiosResponse<BillRefund[]>> => {
  return instance.get<BillRefund[]>(API.bills.refunds(billId));
};

export default {
  getBillHistoryApi,
  createBillApi,
  recordPaymentApi,
  finalizeBillApi,
  getBillByIdApi,
  sendReceiptApi,
  refundBillApi,
  getBillRefundsApi,
};

