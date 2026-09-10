import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  DailySummaryReport,
  DashboardData,
  DashboardResponseDto,
  GstReport,
  PeriodSalesReport,
  StaffPerformanceReport,
} from '@app/types';

/**
 * Dashboard & Reports Analytics API Service
 * OpenAPI 3.0 specification from https://ebill.rabbul.in/docs
 */

export const getDashboardApi = async (
  date?: string,
): Promise<AxiosResponse<DashboardResponseDto | any>> => {
  return instance.get(API.dashboard, {
    params: date ? { date } : {},
  });
};

export const getDailySummaryApi = async (
  date?: string,
): Promise<AxiosResponse<DailySummaryReport>> => {
  return instance.get<DailySummaryReport>(API.reports.dailySummary, {
    params: date ? { date } : {},
  });
};

export const getPeriodSalesReportApi = async (
  startDate: string,
  endDate: string,
): Promise<AxiosResponse<PeriodSalesReport>> => {
  return instance.get<PeriodSalesReport>(API.reports.sales, {
    params: { start_date: startDate, end_date: endDate },
  });
};

export const getGstReportApi = async (
  startDate: string,
  endDate: string,
): Promise<AxiosResponse<GstReport>> => {
  return instance.get<GstReport>(API.reports.gst, {
    params: { start_date: startDate, end_date: endDate },
  });
};

export const getStaffPerformanceApi = async (
  startDate: string,
  endDate: string,
): Promise<AxiosResponse<StaffPerformanceReport>> => {
  return instance.get<StaffPerformanceReport>(API.reports.staffPerformance, {
    params: { start_date: startDate, end_date: endDate },
  });
};

export default {
  getDashboardApi,
  getDailySummaryApi,
  getPeriodSalesReportApi,
  getGstReportApi,
  getStaffPerformanceApi,
};
