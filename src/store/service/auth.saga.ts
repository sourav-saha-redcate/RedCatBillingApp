import constants, { API } from '@app/utils/constants';
import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  deactivateFailure,
  deactivateSuccess,
  forgotOtpVerifyFailure,
  forgotOtpVerifySuccess,
  forgotPassFailure,
  forgotPassSuccess,
  // login
  LOGIN_REQUEST,
  loginFailure,
  loginSuccess,
  // refresh token
  REFRESH_TOKEN_REQUEST,
  refreshTokenFailure,
  refreshTokenSuccess,
  // register store
  REGISTER_STORE_REQUEST,
  registerStoreFailure,
  registerStoreSuccess,
  // get me
  GET_ME_REQUEST,
  getMeFailure,
  getMeSuccess,
  // forgot password
  FORGOT_PASSWORD_REQUEST,
  forgotPasswordFailure,
  forgotPasswordSuccess,
  // logout
  logoutFailure,
  logoutSuccess,
  otpVerifyFailure,
  otpVerifySuccess,
  questionSubmitFailure,
  questionSubmitRequest,
  questionSubmitSuccess,
  resendForgotOtpFailure,
  resendForgotOtpSuccess,
  resendOtpFailure,
  resendOtpSuccess,
  resetPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  // Sign-in
  signInFailure,
  signInSuccess,
  // Sign-up
  signUpFailure,
  signUpSuccess,
} from '../slice/auth.slice';
import Storage from '@app/utils/storage';
import { persistor } from '..';
import { showMessage } from '@app/utils/helpers/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginApi,
  refreshTokenApi,
  registerStoreApi,
  getMeApi,
  forgotPasswordApi,
  logoutApi,
  resetPasswordApi,
} from '@app/services/auth.service';
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
import { PayloadAction } from '@reduxjs/toolkit';
import { reset } from '@app/navigation/RootNaivgation';
import { StoreSettingsService } from '@app/utils/store/StoreSettingsService';

const { auth } = API;

const _header = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

/**
 * Worker Saga: Handles the login API call
 * Listens for LOGIN_REQUEST, calls loginApi, dispatches LOGIN_SUCCESS or LOGIN_FAILURE
 * Properly handles HTTP 401 and other API errors
 */
export function* loginSaga(
  action: PayloadAction<LoginRequestPayload>,
): Generator<any, void, any> {
  console.log('[DEBUG SAGA] Saga entry -> loginSaga triggered with action:', action.type, {
    username: action.payload?.username,
    remember_me: action.payload?.remember_me,
  });
  try {
    const payload: LoginRequestPayload = {
      username: action.payload?.username,
      password: action.payload?.password,
      remember_me: action.payload?.remember_me,
    };

    console.log('[DEBUG SAGA] Immediately before API call -> calling loginApi with endpoint:', API.auth.login);
    const result: AxiosResponse<LoginResponse> = yield call(loginApi, payload);
    const data: LoginResponse = (result?.data as any)?.data || result?.data;

    console.log('[DEBUG SAGA] API response received in loginSaga -> status:', result?.status, {
      store: data?.store?.name,
      user: data?.user?.name,
      hasAccessToken: !!data?.access_token,
      expires_in: data?.expires_in,
    });

    yield put(loginSuccess(data));

    if (action?.payload?.remember_me === true) {
      yield call(
        AsyncStorage.setItem,
        constants.ISREMEMBER,
        JSON.stringify(action?.payload),
      );
    } else {
      yield call(AsyncStorage.removeItem, constants.ISREMEMBER);
    }

    showMessage('Login successful');
  } catch (error: any) {
    console.log('[DEBUG SAGA] Saga error handler in loginSaga ->', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    let errorMessage = 'An error occurred during login. Please try again.';

    if (error?.response) {
      if (error.response.status === 401) {
        errorMessage =
          error.response.data?.message || 'Invalid username or password';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Login failed (${error.response.status}). Please try again.`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showMessage(errorMessage);
    yield put(loginFailure(errorMessage));
  }
}

/**
 * Watcher Saga: Watches for LOGIN_REQUEST and triggers loginSaga
 */
export function* watchLogin(): Generator<any, void, any> {
  yield takeLatest(LOGIN_REQUEST, loginSaga);
}

export const loginWatcher = watchLogin;

/**
 * Worker Saga: Handles the refresh token API call
 * Exchanges a valid refresh token for a fresh access token
 * On 200: updates the access token (and replacement refresh token if returned)
 * On 401: clears session state via logoutSuccess and dispatches REFRESH_TOKEN_FAILURE
 */
export function* refreshTokenSaga(
  action: PayloadAction<RefreshTokenRequestPayload>,
): Generator<any, void, any> {
  try {
    const rawRefreshToken =
      action.payload?.refreshToken || action.payload?.refresh_token;

    if (!rawRefreshToken) {
      const missingMsg = 'Refresh token is required';
      yield put(refreshTokenFailure(missingMsg));
      showMessage(missingMsg);
      return;
    }

    const payload = {
      refresh_token: rawRefreshToken,
    };

    const result: AxiosResponse<RefreshTokenResponse> = yield call(
      refreshTokenApi,
      payload,
    );

    const resData: any = (result?.data as any)?.data || result?.data;

    let newAccessToken: string | null = null;
    let newRefreshToken: string | undefined = undefined;
    let newExpiresIn: number | null = null;

    if (typeof resData === 'string') {
      newAccessToken = resData;
    } else if (resData) {
      newAccessToken =
        resData.access_token ||
        resData.accessToken ||
        resData.token ||
        null;
      newRefreshToken = resData.refresh_token || resData.refreshToken;
      newExpiresIn = resData.expires_in ?? resData.expiresIn ?? null;
    }

    if (!newAccessToken) {
      throw new Error('Access token not received from refresh endpoint');
    }

    yield put(
      refreshTokenSuccess({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: newExpiresIn,
      }),
    );
  } catch (error: any) {
    let errorMessage = 'An error occurred while refreshing session.';

    if (error?.response) {
      if (error.response.status === 401) {
        errorMessage =
          error.response.data?.message ||
          'Session expired. Please log in again.';
        yield put(refreshTokenFailure(errorMessage));
        // Clear invalid authentication / session state
        yield put(logoutSuccess());
        // Clean up stored remember credentials if any
        try {
          yield call(AsyncStorage.removeItem, constants.ISREMEMBER);
        } catch (_) {}
        // Redirect to login screen if navigation is available
        try {
          reset(0, 'SignIn');
        } catch (_) {}
        showMessage(errorMessage);
        return;
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Refresh failed (${error.response.status}). Please try again.`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showMessage(errorMessage);
    yield put(refreshTokenFailure(errorMessage));
  }
}

/**
 * Watcher Saga: Watches for REFRESH_TOKEN_REQUEST and triggers refreshTokenSaga
 */
export function* watchRefreshToken(): Generator<any, void, any> {
  yield takeLatest(REFRESH_TOKEN_REQUEST, refreshTokenSaga);
}

export const refreshTokenWatcher = watchRefreshToken;

/**
 * Worker Saga: Handles store registration API call
 * POST /api/v1/auth/register-store
 * Dispatches REGISTER_STORE_SUCCESS on HTTP 201/200 and treats as authenticated session
 * Dispatches REGISTER_STORE_FAILURE on error (specifically handles 409 conflict: Phone number or email already registered)
 */
export function* registerStoreSaga(
  action: PayloadAction<RegisterStoreRequestPayload>,
): Generator<any, void, any> {
  console.log('[DEBUG SAGA] Saga entry -> registerStoreSaga triggered with action:', action.type, {
    store_type_id: action.payload?.store_type_id,
    store_name: action.payload?.store_name,
    owner_name: action.payload?.owner_name,
    phone: action.payload?.phone,
    email: action.payload?.email,
  });
  try {
    console.log('[DEBUG SAGA] Immediately before API call -> calling registerStoreApi with endpoint:', API.auth.registerStore);
    const result: AxiosResponse<RegisterStoreResponse> = yield call(
      registerStoreApi,
      action.payload,
    );

    const data: RegisterStoreResponse =
      (result?.data as any)?.data || result?.data;

    console.log('[DEBUG SAGA] API response received in registerStoreSaga -> status:', result?.status, {
      store: data?.store?.name,
      user: data?.user?.name,
      hasAccessToken: !!data?.access_token,
    });

    yield put(registerStoreSuccess(data));

    showMessage(data?.message || 'Store registered successfully!');
  } catch (error: any) {
    console.log('[DEBUG SAGA] Saga error handler in registerStoreSaga ->', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    let errorMessage = 'An error occurred during registration. Please try again.';

    if (error?.response) {
      if (error.response.status === 409) {
        errorMessage =
          error.response.data?.message ||
          'Phone number or email already registered';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.errors) {
        const errObj = error.response.data.errors;
        if (typeof errObj === 'string') {
          errorMessage = errObj;
        } else if (Array.isArray(errObj)) {
          errorMessage = errObj.join(', ');
        } else if (typeof errObj === 'object') {
          errorMessage = Object.values(errObj).flat().join(', ');
        }
      } else {
        errorMessage = `Registration failed (${error.response.status}). Please try again.`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    showMessage(errorMessage);
    yield put(registerStoreFailure(errorMessage));
  }
}

/**
 * Watcher Saga: Watches for REGISTER_STORE_REQUEST and triggers registerStoreSaga
 */
export function* watchRegisterStore(): Generator<any, void, any> {
  yield takeLatest(REGISTER_STORE_REQUEST, registerStoreSaga);
}

export const registerStoreWatcher = watchRegisterStore;

/**
 * Worker Saga: Handles the authenticated user context call
 * Listens for GET_ME_REQUEST, calls getMeApi, dispatches GET_ME_SUCCESS or GET_ME_FAILURE
 */
export function* getMeSaga(): Generator<any, void, any> {
  console.log('[DEBUG SAGA] Saga entry -> getMeSaga triggered');
  try {
    console.log(
      '[DEBUG SAGA] Immediately before API call -> calling getMeApi with endpoint:',
      API.auth.me,
    );
    const result: AxiosResponse<GetMeResponse> = yield call(getMeApi);
    const data: GetMeResponse = (result?.data as any)?.data || result?.data;

    console.log('[DEBUG SAGA] API response received in getMeSaga -> status:', result?.status, {
      user: data?.user?.name,
      store: data?.store?.name,
      permissions: data?.permissions,
    });

    yield put(getMeSuccess(data));
  } catch (error: any) {
    console.log('[DEBUG SAGA] Saga error handler in getMeSaga ->', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    let errorMessage = 'Failed to fetch user context.';

    if (error?.response) {
      if (error.response.status === 401) {
        errorMessage =
          error.response.data?.message || 'Invalid or expired authentication token';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Failed to fetch profile (${error.response.status}).`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    yield put(getMeFailure(errorMessage));
  }
}

/**
 * Watcher Saga: Watches for GET_ME_REQUEST and triggers getMeSaga
 */
export function* watchGetMe(): Generator<any, void, any> {
  yield takeLatest(GET_ME_REQUEST, getMeSaga);
}

export const getMeWatcher = watchGetMe;

/**
 * Worker Saga: Handles the forgot password API call
 * Listens for FORGOT_PASSWORD_REQUEST, calls forgotPasswordApi, dispatches FORGOT_PASSWORD_SUCCESS or FORGOT_PASSWORD_FAILURE
 */
export function* forgotPasswordSaga(
  action: PayloadAction<ForgotPasswordRequestPayload>,
): Generator<any, void, any> {
  console.log('[DEBUG SAGA] Saga entry -> forgotPasswordSaga triggered');
  try {
    console.log(
      '[DEBUG SAGA] Immediately before API call -> calling forgotPasswordApi with endpoint:',
      API.auth.forgotPassword,
    );
    const result: AxiosResponse<ForgotPasswordResponse> = yield call(
      forgotPasswordApi,
      { identifier: action.payload.identifier },
    );
    const data: ForgotPasswordResponse =
      (result?.data as any)?.data || result?.data;

    console.log(
      '[DEBUG SAGA] API response received in forgotPasswordSaga -> status:',
      result?.status,
    );

    yield put(forgotPasswordSuccess(data));
    showMessage(
      data?.message ||
        'If an account exists with this identifier, password reset instructions have been dispatched.',
    );
  } catch (error: any) {
    console.log('[DEBUG SAGA] Saga error handler in forgotPasswordSaga ->', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
    let errorMessage =
      'Failed to process password reset request. Please try again.';

    if (error?.response) {
      if (error.response.status === 400 || error.response.status === 422) {
        errorMessage =
          error.response.data?.message ||
          (Array.isArray(error.response.data?.errors)
            ? error.response.data.errors.join(', ')
            : 'Invalid phone number or email format');
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = `Request failed (${error.response.status}). Please try again.`;
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    yield put(forgotPasswordFailure(errorMessage));
    showMessage(errorMessage);
  }
}

/**
 * Watcher Saga: Watches for FORGOT_PASSWORD_REQUEST and triggers forgotPasswordSaga
 */
export function* watchForgotPassword(): Generator<any, void, any> {
  yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPasswordSaga);
}

export const forgotPasswordWatcher = watchForgotPassword;



// Worker Saga: Handles the sign-in API call
function* handleSignIn(action: any) {
  let payload = {
    username: action.payload?.username,
    password: action.payload?.password,
  };
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.login,
      payload,
    );
    const { status, data } = result;

    if (status === 200 && data?.data?.userData?.isRegistrationOtpVerified) {
      yield put(signInSuccess(data.data));
      if (action?.payload?.remember === true) {
        yield call(
          AsyncStorage.setItem,
          constants.ISREMEMBER,
          JSON.stringify(action?.payload),
        );
      } else {
        yield call(AsyncStorage.removeItem, constants.ISREMEMBER);
      }
      showMessage(data?.message);
    } else {
      yield put(signInFailure(data));
      if (action?.payload?.remember === true) {
        yield call(
          AsyncStorage.setItem,
          constants.ISREMEMBER,
          JSON.stringify(action?.payload),
        );
      } else {
        yield call(AsyncStorage.removeItem, constants.ISREMEMBER);
      }
      showMessage(data?.message);
    }
  } catch (error: any) {
    console.log(error, 'error');

    showMessage(error?.response?.data?.message || error.message);
    yield put(signInFailure(error?.response?.data?.message || error.message));
  }
}

// Worker Saga: Handles the sign-up API call
function* handleSignUp(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.signup,
      action.payload,
    );

    console.log(result, 'result');

    const { status, data } = result;
    // console.log('status', status);
    console.log('Sign up Data:::::', data);
    if (status === 200) {
      yield put(signUpSuccess(data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(signUpFailure(error?.response?.data?.message || error.message));
  }
}

// Worker Saga: Handles the logout process
export function* handleLogout(): Generator<any, void, any> {
  try {
    try {
      yield call(logoutApi);
    } catch {
      // Continue client cleanup even if network/server is unreachable
    }

    // 1. Clear stored authentication tokens, session, and remembered login data
    try {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
    } catch (_) {}
    try {
      yield call(AsyncStorage.removeItem, constants.ISREMEMBER);
    } catch (_) {}
    try {
      yield call(Storage.removeItem, 'token');
      yield call(Storage.removeItem, 'refresh-token');
    } catch (_) {}
    try {
      yield call([StoreSettingsService, 'clearCache']);
    } catch (_) {}
    try {
      if (instance.defaults?.headers?.common) {
        delete instance.defaults.headers.common.Authorization;
      }
    } catch (_) {}

    // 2. Clear Redux session state
    yield put(logoutSuccess());
    showMessage('Logout Successful, You have been logged out successfully!');

    // 3. Immediately redirect user to Login page
    try {
      reset(0, 'SignIn');
    } catch (_) {}

    // 4. Prevent accessing protected pages using browser Back button (web environment)
    if (typeof window !== 'undefined' && window.history) {
      try {
        window.history.replaceState(null, '', '/');
      } catch (_) {}
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(logoutFailure(error?.response?.data?.message || error.message));
  }
}

// Worker Saga: Handles the legacy forgot password API call
function* legacyForgotPasswordSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.forgotpassword,
      action?.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(forgotPassSuccess(data));
      showMessage(data?.message);
    } else {
      yield put(forgotPassFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      forgotPassFailure(error?.response?.data?.message || error.message),
    );
  }
}

// Worker Saga: Handles the otp verify API call
function* otpVerifySaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.otpVerify,
      action?.payload,
    );

    const { status, data } = result;
    console.log('OTP data:::::', data);
    if (status === 200) {
      yield put(otpVerifySuccess(data));
      showMessage(data?.message);
    } else {
      yield put(otpVerifyFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      otpVerifyFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* forgotOtpVerifySaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.forgotpasswordOtpVerify,
      action?.payload,
    );

    const { status, data } = result;
    console.log('OTP data:::::', data);
    if (status === 200) {
      yield put(forgotOtpVerifySuccess(data));
      showMessage(data?.message);
    } else {
      yield put(forgotOtpVerifyFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      forgotOtpVerifyFailure(error?.response?.data?.message || error.message),
    );
  }
}
// Worker Saga: Handles the resend otp API call
function* resendOtpSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.resendOtp,
      action?.payload,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(resendOtpSuccess(data));
      showMessage(data?.message);
    } else {
      yield put(resendOtpFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      resendOtpFailure(error?.response?.data?.message || error.message),
    );
  }
}

// Worker Saga: Handles the resend otp API call
function* resendForgotOtpSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.forgotpasswordresend,
      action?.payload,
    );
    const { status, data } = result;

    if (status === 200) {
      yield put(resendForgotOtpSuccess(data));
      showMessage(data?.message);
    } else {
      yield put(resendForgotOtpFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      resendForgotOtpFailure(error?.response?.data?.message || error.message),
    );
  }
}

// Worker Saga: Handles the reset password API call
function* resetPasswordSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.changepassword,
      action?.payload,
      {
        headers: {
          Authorization: `Bearer ${action?.payload?.token}`,
        },
      },
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(resetPasswordSuccess(data));
      showMessage(data?.message);
    } else {
      yield put(resetPasswordFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      resetPasswordFailure(error?.response?.data?.message || error.message),
    );
  }
}

// question submit
function* questionSubmitSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      auth.questionSubmit,
      action?.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(questionSubmitSuccess(data));
      showMessage(data?.message);
    } else {
      yield put(questionSubmitFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      questionSubmitFailure(error?.response?.data?.message || error.message),
    );
  }
}

function* handleDeactivate(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance?.get,
      auth?.deactiveUser,
      action?.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(deactivateSuccess(data?.message));
      showMessage(data?.message);
    } else {
      yield put(deactivateFailure(result?.data?.login));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      deactivateFailure(error?.response?.data?.message || error.message),
    );
  }
}

function* authSaga() {
  yield takeLatest('auth/signInRequest', handleSignIn);
  yield takeLatest('auth/signUpRequest', handleSignUp);
  yield takeLatest('auth/logoutRequest', handleLogout);
  yield takeLatest('auth/otpVerifyRequest', otpVerifySaga);
  yield takeLatest('auth/resendOtpRequest', resendOtpSaga);
  yield takeLatest('auth/forgotPassRequest', legacyForgotPasswordSaga);
  yield takeLatest('auth/forgotOtpVerifyRequest', forgotOtpVerifySaga);
  yield takeLatest('auth/resendForgotOtpRequest', resendForgotOtpSaga);
  yield takeLatest('auth/resetPasswordRequest', resetPasswordSaga);
  yield takeLatest('auth/questionSubmitRequest', questionSubmitSaga);
  yield takeLatest('auth/deactivateRequest', handleDeactivate);
}

export default authSaga;
