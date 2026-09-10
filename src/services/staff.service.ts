import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  CreateStaffPayload,
  StaffMember,
  UpdateStaffPayload,
} from '@app/types';

/**
 * Staff Members & Roles API Service
 */

export const getStaffApi = async (
  statusOrActive?: boolean | string,
): Promise<AxiosResponse<StaffMember[] | any>> => {
  let status: string | undefined = undefined;
  if (typeof statusOrActive === 'boolean') {
    status = statusOrActive ? 'active' : undefined;
  } else if (typeof statusOrActive === 'string') {
    status = statusOrActive;
  } else if (statusOrActive === undefined) {
    status = 'active';
  }
  return instance.get(API.staff.base, {
    params: status ? { status } : {},
  });
};

export const createStaffApi = async (
  payload: CreateStaffPayload,
): Promise<AxiosResponse<StaffMember>> => {
  return instance.post<StaffMember>(API.staff.base, payload);
};

export const getStaffByIdApi = async (id: string): Promise<AxiosResponse<StaffMember>> => {
  return instance.get<StaffMember>(API.staff.byId(id));
};

export const updateStaffApi = async (
  id: string,
  payload: UpdateStaffPayload,
): Promise<AxiosResponse<StaffMember>> => {
  return instance.patch<StaffMember>(API.staff.byId(id), payload);
};

export const deleteStaffApi = async (
  id: string,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.delete(API.staff.byId(id));
};

export default {
  getStaffApi,
  createStaffApi,
  getStaffByIdApi,
  updateStaffApi,
  deleteStaffApi,
};
