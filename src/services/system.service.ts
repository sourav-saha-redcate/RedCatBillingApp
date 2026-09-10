import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  AuditLogItem,
  BackupItem,
  PaginatedResponse,
  SyncBatchPayload,
  SyncStatus,
} from '@app/types';

/**
 * System Health, Offline Sync, Backup & Restore, and Audit Logs API Service
 */

// --- Health ---
export const checkHealthApi = async (): Promise<
  AxiosResponse<{ status: string; info: any }>
> => {
  return instance.get(API.health);
};

// --- Sync ---
export const getSyncStatusApi = async (): Promise<AxiosResponse<SyncStatus>> => {
  return instance.get<SyncStatus>(API.sync.status);
};

export const syncBatchApi = async (
  payload: SyncBatchPayload,
): Promise<AxiosResponse<{ synced_bills: number; synced_adjustments: number }>> => {
  return instance.post(API.sync.batch, payload);
};

// --- Backup & Restore ---
export const createBackupApi = async (): Promise<AxiosResponse<BackupItem>> => {
  return instance.post<BackupItem>(API.backup.create);
};

export const listBackupsApi = async (): Promise<AxiosResponse<BackupItem[]>> => {
  return instance.get<BackupItem[]>(API.backup.list);
};

export const restoreBackupApi = async (
  backupId: string,
): Promise<AxiosResponse<{ success: boolean; message?: string }>> => {
  return instance.post(API.backup.restore, { backup_id: backupId });
};

// --- Audit Logs ---
export const getAuditLogsApi = async (params?: {
  actor_id?: string;
  action?: string;
  entity?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}): Promise<AxiosResponse<PaginatedResponse<AuditLogItem> | AuditLogItem[]>> => {
  return instance.get(API.auditLogs.base, { params });
};

export const logActionApi = async (payload: {
  action: string;
  entity: string;
  entity_id?: string;
  details?: any;
}): Promise<AxiosResponse<{ success: boolean }>> => {
  return instance.post(API.auditLogs.base, payload);
};

export default {
  checkHealthApi,
  getSyncStatusApi,
  syncBatchApi,
  createBackupApi,
  listBackupsApi,
  restoreBackupApi,
  getAuditLogsApi,
  logActionApi,
};
