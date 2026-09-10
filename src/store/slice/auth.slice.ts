import {
  AuthStore,
  AuthUser,
  FORGOT_PASS_TYPE,
  LoginRequestPayload,
  LoginResponse,
  OTP_RESEND_TYPE,
  OTP_VERIFY_TYPE,
  QUESTION_SUBMIT_TYPE,
  RESET_PASSWORD,
  SIGN_IN_TYPE,
  SIGN_UP_TYPE,
} from '@app/types';
import {
  otpResendResponse,
  otpVErifyResponse,
  signInResponse,
  signUpResponse,
} from '@app/types/ApiResponse';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  REGISTER_STORE_REQUEST,
  REGISTER_STORE_SUCCESS,
  REGISTER_STORE_FAILURE,
  GET_ME_REQUEST,
  GET_ME_SUCCESS,
  GET_ME_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  registerStoreRequest,
  registerStoreSuccess,
  registerStoreFailure,
  getMeRequest,
  getMeSuccess,
  getMeFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from '../actions/auth.actions';

export interface AuthState {
  loading: boolean;
  refreshing: boolean;
  registering: boolean;
  registrationError: string | null;
  user: AuthUser | null;
  store: AuthStore | null;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number | null;
  error: string | null;

  // Forgot password flow state
  forgotPasswordLoading: boolean;
  forgotPasswordSuccess: boolean;
  forgotPasswordError: string | null;

  // Preserved for backward compatibility
  token: string;
  status: string | null;
  otpVerifyRes: otpVErifyResponse | null;
  isInstalled: string;
  signInRes: any;
  forgotPassRes: any;
  onBoardingProgress: any | null;
  isProfileComplete: boolean;
  questionSubmit: any;
  selectedStoreType: { id: string; name: string } | null;
}

const initialState: AuthState = {
  loading: false,
  refreshing: false,
  registering: false,
  registrationError: null,
  user: null,
  store: null,
  permissions: [],
  accessToken: '',
  refreshToken: '',
  expiresIn: null,
  error: null,

  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,

  token: '',
  status: null,
  otpVerifyRes: null,
  isInstalled: 'true',
  signInRes: null,
  forgotPassRes: null,
  onBoardingProgress: null,
  isProfileComplete: false,
  questionSubmit: null,
  selectedStoreType: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    //CHECK IF APP IS INSTALLED
    checkInstalled(state, action) {
      if (action.payload == null) {
        state.isInstalled = 'false';
      } else {
        state.isInstalled = action.payload;
      }
    },

    // Sign-in
    signInRequest(state, action: PayloadAction<SIGN_IN_TYPE>) {
      state.status = action.type;
    },
    signInSuccess(state, action: PayloadAction<signInResponse>) {
      state.token = action.payload.token;
      state.status = action.type;
      state.signInRes = action.payload;
      state.onBoardingProgress =
        action.payload.userData.progressQuestionnaire;
      state.isProfileComplete = action.payload.userData.isProfileCompleted;
    },
    signInFailure(state, action: PayloadAction<signInResponse>) {
      state.status = action.type;
      state.signInRes = action.payload;
    },

    // Sign-up
    signUpRequest(state, action: PayloadAction<SIGN_UP_TYPE>) {
      state.loading = true;
      state.status = action.type;
    },
    signUpSuccess(state, action: PayloadAction<signUpResponse>) {
      state.loading = false;
      state.error = null;
      state.status = action.type;
    },
    signUpFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.status = action.type;
    },

    // logout
    logoutRequest(state) {
      state.loading = true;
      state.error = null;
    },
    logoutSuccess(state, action: PayloadAction<string | undefined>) {
      state.refreshToken = '';
      state.token = '';
      state.accessToken = '';
      state.user = null;
      state.store = null;
      state.permissions = [];
      state.expiresIn = null;
      state.loading = false;
      state.refreshing = false;
      state.registering = false;
      state.registrationError = null;
      state.error = null;
      state.status = action?.type || null;
      state.signInRes = null;
      state.otpVerifyRes = null;
      state.forgotPassRes = null;
      state.questionSubmit = null;
      state.onBoardingProgress = null;
      state.isProfileComplete = false;
      state.selectedStoreType = null;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.status = action.type;
    },

    setSelectedStoreType(
      state,
      action: PayloadAction<{ id: string; name: string } | null>,
    ) {
      state.selectedStoreType = action.payload;
    },
    setToken(
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>,
    ) {
      state.loading = false;
      state.token = action.payload.token;
      state.accessToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },
    // forgot password
    forgotPassRequest(state, action: PayloadAction<FORGOT_PASS_TYPE>) {
      state.status = action.type;
    },
    forgotPassSuccess(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.forgotPassRes = action.payload;
    },
    forgotPassFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },
    resetForgotPasswordFlow(state) {
      state.forgotPasswordLoading = false;
      state.forgotPasswordSuccess = false;
      state.forgotPasswordError = null;
    },

    // otp verify
    otpVerifyRequest(state, action: PayloadAction<OTP_VERIFY_TYPE>) {
      state.status = action.type;
    },
    otpVerifySuccess(state, action: PayloadAction<otpVErifyResponse>) {
      state.status = action.type;
      state.otpVerifyRes = action.payload.data.user;
      state.onBoardingProgress = action.payload.data.user.progressQuestionnaire;
      state.token = action.payload.data.token;
      state.isProfileComplete = action.payload.data.user.isProfileCompleted;
    },
    otpVerifyFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    //forgot otp verify
    forgotOtpVerifyRequest(state, action: PayloadAction<OTP_VERIFY_TYPE>) {
      state.status = action.type;
    },
    forgotOtpVerifySuccess(state, action: PayloadAction<otpVErifyResponse>) {
      state.status = action.type;
      state.otpVerifyRes = action.payload;
    },
    forgotOtpVerifyFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    // resend otp
    resendOtpRequest(state, action: PayloadAction<OTP_RESEND_TYPE>) {
      state.status = action.type;
    },
    resendOtpSuccess(state, action: PayloadAction<otpResendResponse>) {
      state.status = action.type;
    },
    resendOtpFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    // forgot resend otp
    resendForgotOtpRequest(state, action: PayloadAction<OTP_RESEND_TYPE>) {
      state.status = action.type;
    },
    resendForgotOtpSuccess(state, action: PayloadAction<otpResendResponse>) {
      state.status = action.type;
    },
    resendForgotOtpFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    // reset password
    resetPasswordRequest(state, action: PayloadAction<RESET_PASSWORD>) {
      state.status = action.type;
    },
    resetPasswordSuccess(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    // question submit
    questionSubmitRequest(state, action: PayloadAction<QUESTION_SUBMIT_TYPE>) {
      state.status = action.type;
    },
    questionSubmitSuccess(state, action: PayloadAction<any>) {
      state.status = action.type;
      state.questionSubmit=action.payload;
      state.onBoardingProgress = action.payload.data.progressQuestionnaire;
      state.isProfileComplete = action.payload.data.isProfileCompleted;
    },
    questionSubmitFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = action.type;
    },

    //deactivate
    deactivateRequest(state) {
      state.loading = true;
      state.error = null;
    },
    deactivateSuccess(state, action: PayloadAction<string | undefined>) {
      state.token = '';
      state.loading = false;
      state.status = action.type;
    },
    deactivateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.status = action.type;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginRequest, state => {
        state.loading = true;
        state.error = null;
        state.status = LOGIN_REQUEST;
      })
      .addCase(loginSuccess, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.store = action.payload.store;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.expiresIn = action.payload.expires_in;
        state.token = action.payload.access_token; // keep legacy token in sync
        state.error = null;
        state.status = LOGIN_SUCCESS;
      })
      .addCase(loginFailure, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.status = LOGIN_FAILURE;
      })
      .addCase(refreshTokenRequest, state => {
        state.refreshing = true;
        state.error = null;
        state.status = REFRESH_TOKEN_REQUEST;
      })
      .addCase(refreshTokenSuccess, (state, action) => {
        state.refreshing = false;
        const newAccessToken =
          action.payload?.accessToken ||
          action.payload?.access_token ||
          action.payload?.token;
        if (newAccessToken) {
          state.accessToken = newAccessToken;
          state.token = newAccessToken;
        }
        const newRefreshToken =
          action.payload?.refreshToken || action.payload?.refresh_token;
        if (newRefreshToken) {
          state.refreshToken = newRefreshToken;
        }
        const newExpiresIn =
          action.payload?.expiresIn ?? action.payload?.expires_in;
        if (newExpiresIn !== undefined && newExpiresIn !== null) {
          state.expiresIn = newExpiresIn;
        }
        state.error = null;
        state.status = REFRESH_TOKEN_SUCCESS;
      })
      .addCase(refreshTokenFailure, (state, action) => {
        state.refreshing = false;
        state.error = action.payload;
        state.status = REFRESH_TOKEN_FAILURE;
      })
      .addCase(registerStoreRequest, state => {
        state.registering = true;
        state.registrationError = null;
        state.status = REGISTER_STORE_REQUEST;
      })
      .addCase(registerStoreSuccess, (state, action) => {
        state.registering = false;
        state.registrationError = null;
        state.user = action.payload.user;
        state.store = action.payload.store;
        const newAccessToken =
          action.payload.access_token ||
          (action.payload as any).accessToken ||
          (action.payload as any).token;
        if (newAccessToken) {
          state.accessToken = newAccessToken;
          state.token = newAccessToken;
        }
        const newRefreshToken =
          action.payload.refresh_token ||
          (action.payload as any).refreshToken;
        if (newRefreshToken) {
          state.refreshToken = newRefreshToken;
        }
        const newExpiresIn =
          action.payload.expires_in ??
          (action.payload as any).expiresIn ??
          null;
        if (newExpiresIn !== undefined && newExpiresIn !== null) {
          state.expiresIn = newExpiresIn;
        }
        state.error = null;
        state.status = REGISTER_STORE_SUCCESS;
      })
      .addCase(registerStoreFailure, (state, action) => {
        state.registering = false;
        state.registrationError = action.payload;
        state.error = action.payload;
        state.status = REGISTER_STORE_FAILURE;
      })
      .addCase(getMeRequest, state => {
        state.loading = true;
        state.error = null;
        state.status = GET_ME_REQUEST;
      })
      .addCase(getMeSuccess, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.store = action.payload.store;
        state.permissions = action.payload.permissions || [];
        state.error = null;
        state.status = GET_ME_SUCCESS;
      })
      .addCase(getMeFailure, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.status = GET_ME_FAILURE;
      })
      .addCase(forgotPasswordRequest, state => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordError = null;
        state.status = FORGOT_PASSWORD_REQUEST;
      })
      .addCase(forgotPasswordSuccess, state => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
        state.status = FORGOT_PASSWORD_SUCCESS;
      })
      .addCase(forgotPasswordFailure, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = false;
        state.forgotPasswordError = action.payload;
        state.status = FORGOT_PASSWORD_FAILURE;
      });
  },
});

export const {
  checkInstalled,
  // Sign-in
  signInRequest,
  signInSuccess,
  signInFailure,
  // Sign-up
  signUpRequest,
  signUpSuccess,
  signUpFailure,
  //logout
  logoutRequest,
  logoutSuccess,
  logoutFailure,

  // set token
  setToken,
  //forgot password
  forgotPassRequest,
  forgotPassSuccess,
  forgotPassFailure,

  //otp verify
  otpVerifyRequest,
  otpVerifySuccess,
  otpVerifyFailure,

  //resend otp
  resendOtpRequest,
  resendOtpSuccess,
  resendOtpFailure,

  forgotOtpVerifyRequest,
  forgotOtpVerifySuccess,
  forgotOtpVerifyFailure,

  resendForgotOtpRequest,
  resendForgotOtpSuccess,
  resendForgotOtpFailure,

  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,

  //question submit
  questionSubmitRequest,
  questionSubmitSuccess,
  questionSubmitFailure,

  deactivateRequest,
  deactivateSuccess,
  deactivateFailure,

  // Reset forgot password flow
  resetForgotPasswordFlow,

  // Selected store type
  setSelectedStoreType,
} = authSlice.actions;

export {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  REFRESH_TOKEN_REQUEST,
  REFRESH_TOKEN_SUCCESS,
  REFRESH_TOKEN_FAILURE,
  REGISTER_STORE_REQUEST,
  REGISTER_STORE_SUCCESS,
  REGISTER_STORE_FAILURE,
  GET_ME_REQUEST,
  GET_ME_SUCCESS,
  GET_ME_FAILURE,
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAILURE,
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  registerStoreRequest,
  registerStoreSuccess,
  registerStoreFailure,
  getMeRequest,
  getMeSuccess,
  getMeFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
};

export default authSlice.reducer;
