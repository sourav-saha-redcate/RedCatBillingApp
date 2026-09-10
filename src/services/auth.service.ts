import { AxiosResponse } from 'axios';
import { instance } from '@app/utils/server/instance';
import { API } from '@app/utils/constants';
import {
  LoginRequestPayload,
  LoginResponse,
  RefreshTokenResponse,
  RegisterStoreRequestPayload,
  RegisterStoreResponse,
  GetMeResponse,
  ForgotPasswordRequestPayload,
  ForgotPasswordResponse,
  VerifyResetOtpRequestPayload,
  VerifyResetOtpResponse,
  ResetPasswordRequestPayload,
  ResetPasswordResponse,
} from '@app/types';

/**
 * Login API Service
 * POST /api/v1/auth/login
 *
 * @param payload - { username, password, remember_me }
 * @returns AxiosResponse containing { store, user, access_token, refresh_token, expires_in }
 */
export const loginApi = async (
  payload: LoginRequestPayload,
): Promise<AxiosResponse<LoginResponse>> => {
  console.log('[DEBUG SERVICE] loginApi executing POST ->', API.auth.login, {
    username: payload.username,
    remember_me: payload.remember_me,
  });
  return instance.post<LoginResponse>(API.auth.login, payload);
};

/**
 * Refresh Token API Service
 * POST /api/v1/auth/refresh
 *
 * @param payload - { refresh_token }
 * @returns AxiosResponse containing fresh token response
 */
export const refreshTokenApi = async (payload: {
  refresh_token: string;
}): Promise<AxiosResponse<RefreshTokenResponse>> => {
  console.log('[DEBUG SERVICE] refreshTokenApi executing POST ->', API.auth.refreshToken);
  return instance.post<RefreshTokenResponse>(API.auth.refreshToken, payload);
};

/**
 * Register Store API Service
 * POST /api/v1/auth/register-store
 *
 * @param payload - RegisterStoreRequestPayload
 * @returns AxiosResponse containing { store, user, access_token, refresh_token, expires_in }
 */
export const registerStoreApi = async (
  payload: RegisterStoreRequestPayload,
): Promise<AxiosResponse<RegisterStoreResponse>> => {
  console.log('[DEBUG SERVICE] registerStoreApi executing POST ->', API.auth.registerStore, {
    store_type_id: payload.store_type_id,
    store_name: payload.store_name,
    owner_name: payload.owner_name,
    phone: payload.phone,
    email: payload.email,
  });
  return instance.post<RegisterStoreResponse>(
    API.auth.registerStore,
    payload,
  );
};

/**
 * Authenticated User Context API Service
 * GET /api/v1/auth/me
 *
 * Uses existing Axios instance which automatically attaches Authorization: Bearer ${accessToken}
 *
 * @returns AxiosResponse containing { user, store, permissions }
 */
export const getMeApi = async (): Promise<AxiosResponse<GetMeResponse>> => {
  console.log('[DEBUG SERVICE] getMeApi executing GET ->', API.auth.me);
  return instance.get<GetMeResponse>(API.auth.me);
};

/**
 * Forgot Password API Service
 * POST /api/v1/auth/forgot-password
 *
 * @param payload - { identifier }
 * @returns AxiosResponse containing ForgotPasswordResponse
 */
export const forgotPasswordApi = async (
  payload: ForgotPasswordRequestPayload,
): Promise<AxiosResponse<ForgotPasswordResponse>> => {
  console.log(
    '[DEBUG SERVICE] forgotPasswordApi executing POST ->',
    API.auth.forgotPassword,
  );
  return instance.post<ForgotPasswordResponse>(API.auth.forgotPassword, payload);
};

/**
 * Verify Reset OTP API Service
 * POST /api/v1/auth/verify-reset-otp
 *
 * @param payload - { identifier, otp }
 * @returns AxiosResponse containing VerifyResetOtpResponse
 */
export const verifyResetOtpApi = async (
  payload: VerifyResetOtpRequestPayload,
): Promise<AxiosResponse<VerifyResetOtpResponse>> => {
  console.log(
    '[DEBUG SERVICE] verifyResetOtpApi executing POST ->',
    API.auth.verifyResetOtp,
    { identifier: payload.identifier, otp: payload.otp },
  );
  return instance.post<VerifyResetOtpResponse>(API.auth.verifyResetOtp, payload);
};

/**
 * Reset Password API Service
 * POST /api/v1/auth/reset-password
 *
 * @param payload - { identifier, token_or_otp, new_password }
 * @returns AxiosResponse containing ResetPasswordResponse
 */
export const resetPasswordApi = async (
  payload: ResetPasswordRequestPayload,
): Promise<AxiosResponse<ResetPasswordResponse>> => {
  const tokenOrOtp = payload.token_or_otp || payload.otp || payload.code || '';
  const body: ResetPasswordRequestPayload = {
    identifier: payload.identifier,
    token_or_otp: tokenOrOtp,
    new_password: payload.new_password,
  };
  console.log(
    '[DEBUG SERVICE] resetPasswordApi executing POST ->',
    API.auth.resetPassword,
  );
  return instance.post<ResetPasswordResponse>(API.auth.resetPassword, body);
};

/**
 * Logout API Service
 * POST /api/v1/auth/logout
 *
 * @returns AxiosResponse containing LogoutResponse
 */
export const logoutApi = async (): Promise<
  AxiosResponse<{ success: boolean; message?: string }>
> => {
  console.log('[DEBUG SERVICE] logoutApi executing POST ->', API.auth.logout);
  return instance.post(API.auth.logout);
};

export default {
  loginApi,
  refreshTokenApi,
  registerStoreApi,
  getMeApi,
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
  logoutApi,
};

