import { createAction } from '@reduxjs/toolkit';
import {
  LoginRequestPayload,
  LoginResponse,
  RefreshTokenRequestPayload,
  RefreshTokenResponse,
  RegisterStoreRequestPayload,
  RegisterStoreResponse,
  GetMeResponse,
  ForgotPasswordRequestPayload,
  ForgotPasswordResponse,
} from '@app/types';

// Action types / constants
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const REFRESH_TOKEN_REQUEST = 'REFRESH_TOKEN_REQUEST';
export const REFRESH_TOKEN_SUCCESS = 'REFRESH_TOKEN_SUCCESS';
export const REFRESH_TOKEN_FAILURE = 'REFRESH_TOKEN_FAILURE';

export const REGISTER_STORE_REQUEST = 'REGISTER_STORE_REQUEST';
export const REGISTER_STORE_SUCCESS = 'REGISTER_STORE_SUCCESS';
export const REGISTER_STORE_FAILURE = 'REGISTER_STORE_FAILURE';

export const GET_ME_REQUEST = 'GET_ME_REQUEST';
export const GET_ME_SUCCESS = 'GET_ME_SUCCESS';
export const GET_ME_FAILURE = 'GET_ME_FAILURE';

export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST';
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS';
export const FORGOT_PASSWORD_FAILURE = 'FORGOT_PASSWORD_FAILURE';

// Action creators
export const loginRequest = createAction<LoginRequestPayload>(LOGIN_REQUEST);
export const loginSuccess = createAction<LoginResponse>(LOGIN_SUCCESS);
export const loginFailure = createAction<string>(LOGIN_FAILURE);

export const refreshTokenRequest = createAction<RefreshTokenRequestPayload>(
  REFRESH_TOKEN_REQUEST,
);
export const refreshTokenSuccess = createAction<RefreshTokenResponse>(
  REFRESH_TOKEN_SUCCESS,
);
export const refreshTokenFailure = createAction<string>(
  REFRESH_TOKEN_FAILURE,
);

export const registerStoreRequest = createAction<RegisterStoreRequestPayload>(
  REGISTER_STORE_REQUEST,
);
export const registerStoreSuccess = createAction<RegisterStoreResponse>(
  REGISTER_STORE_SUCCESS,
);
export const registerStoreFailure = createAction<string>(
  REGISTER_STORE_FAILURE,
);

export const getMeRequest = createAction(GET_ME_REQUEST);
export const getMeSuccess = createAction<GetMeResponse>(GET_ME_SUCCESS);
export const getMeFailure = createAction<string>(GET_ME_FAILURE);

export const forgotPasswordRequest =
  createAction<ForgotPasswordRequestPayload>(FORGOT_PASSWORD_REQUEST);
export const forgotPasswordSuccess =
  createAction<ForgotPasswordResponse | undefined>(FORGOT_PASSWORD_SUCCESS);
export const forgotPasswordFailure =
  createAction<string>(FORGOT_PASSWORD_FAILURE);



