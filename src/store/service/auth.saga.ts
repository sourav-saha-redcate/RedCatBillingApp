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

const { auth } = API;

const _header = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

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
function* handleLogout() {
  try {
    // Dispatch the logout action to reset the state
    yield put(logoutSuccess());
    showMessage('Logout Successful, You have been logged out successfully!');
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(logoutFailure(error?.response?.data?.message || error.message));
  }
}

// Worker Saga: Handles the forgot password API call
function* forgotPasswordSaga(action: any) {
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
  yield takeLatest('auth/forgotPassRequest', forgotPasswordSaga);
  yield takeLatest('auth/forgotOtpVerifyRequest', forgotOtpVerifySaga);
  yield takeLatest('auth/resendForgotOtpRequest', resendForgotOtpSaga);
  yield takeLatest('auth/resetPasswordRequest', resetPasswordSaga);
  yield takeLatest('auth/questionSubmitRequest', questionSubmitSaga);
  yield takeLatest('auth/deactivateRequest', handleDeactivate);
}

export default authSaga;
