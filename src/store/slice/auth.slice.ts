import {
  FORGOT_PASS_TYPE,
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

interface AuthState {
  token: string;
  refreshToken: string;
  loading: boolean;
  error: string | null;
  status: string | null;
  otpVerifyRes: otpVErifyResponse | null;
  isInstalled: string;
  signInRes: any;
  forgotPassRes: any;
  onBoardingProgress: any | null;
  isProfileComplete: boolean;
  questionSubmit:any;
}

const initialState: AuthState = {
  refreshToken: '',
  token: '',
  loading: false,
  error: null,
  status: null,
  otpVerifyRes: null,
  isInstalled: 'true',
  signInRes: null,
  forgotPassRes: null,
  onBoardingProgress: null,
  isProfileComplete: false,
  questionSubmit:null,
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
      state.loading = false;
      state.status = action.type;
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.status = action.type;
    },

    setToken(
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>,
    ) {
      state.loading = false;
      state.token = action.payload.token;
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
} = authSlice.actions;

export default authSlice.reducer;
