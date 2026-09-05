import { API } from '@app/utils/constants';
import { instance } from '@app/utils/server/instance';
import { AxiosResponse } from 'axios';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import {
  addGoalFailure,
  addGoalRequest,
  addGoalSuccess,
  categoryOptionsFailure,
  categoryOptionsSuccess,
  changePasswordFailure,
  changePasswordSuccess,
  countryOptionsFailure,
  countryOptionsSuccess,
  editGoalFailure,
  editGoalSuccess,
  faqListFailure,
  faqListRequest,
  faqListSuccess,
  getUserInfoFailure,
  getUserInfoRequest,
  getUserInfoSuccess,
  goalDeleteFailure,
  goalDeleteSuccess,
  goalDetailsFailure,
  goalDetailsRequest,
  goalDetailsSuccess,
  goalListFailure,
  goalListRequest,
  goalListSuccess,
  notificationSatusFailure,
  notificationSatusSuccess,
  ourStoryFailure,
  ourStorySuccess,
  portalCategoryFailure,
  portalCategorySuccess,
  portalCountryFailure,
  portalCountrySuccess,
  portalDetailsFailure,
  portalDetailsSuccess,
  portalSuggestionsFailure,
  portalSuggestionsSuccess,
  portalTrendingsFailure,
  portalTrendingsSuccess,
  positionOptionsFailure,
  positionOptionsSuccess,
  progressOptionsFailure,
  progressOptionsSuccess,
  statusOptionsFailure,
  statusOptionsSuccess,
  timeFrameOptionsFailure,
  timeFrameOptionsSuccess,
  updateUserInfoFailure,
  updateUserInfoSuccess,
  userListFailure,
  userListSuccess,
  visibilityOptionsFailure,
  visibilityOptionsSuccess,
} from '../slice/user.slice';
import { createFrom } from '@app/utils/helpers/Validation';
import { showMessage } from '@app/utils/helpers/Toast';
import { goBack, navigate } from '@app/navigation/RootNaivgation';

const { user } = API;

const _header = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

function* handleUserInfo() {
  try {
    const result: AxiosResponse<any> = yield call(instance.get, user.profile);

    const { status, data } = result;
    console.log(result, 'result');

    if (status === 200) {
      yield put(getUserInfoSuccess(data?.data));
    }
  } catch (error: any) {
    console.log('Error in Profile Fetch:::', error);
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      getUserInfoFailure(error?.response?.data?.message || error.message),
    );
  }
}

function* handleUpdateUserInfo(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.editProfile,
      createFrom(action.payload),
      _header,
    );
    const { status, data } = result;

    if (status === 200) {
      yield put(updateUserInfoSuccess(data));
      showMessage(data?.message);
      yield put(getUserInfoRequest());
      goBack();
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      updateUserInfoFailure(error?.response?.data?.message || error.message),
    );
  }
}

function* handleChangePassword(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.changePassword,
      action.payload,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(changePasswordSuccess(data));
      showMessage(data?.message);
      yield put(getUserInfoRequest());
      goBack();
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      changePasswordFailure(error?.response?.data?.message || error.message),
    );
  }
}

function* faqListSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(instance.get, user.faqList);

    const { status, data } = result;

    if (status === 200) {
      yield put(faqListSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(faqListFailure(error?.response?.data?.message || error.message));
  }
}
function* ourStorySaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(instance.get, user.ourstory);

    const { status, data } = result;

    if (status === 200) {
      yield put(ourStorySuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(ourStoryFailure(error?.response?.data?.message || error.message));
  }
}

function* handleNotificatonStatus(action: any) {
  try {
    const token: string = yield select(state => state.auth.token);
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.notificationStatus,
      action.payload,
      { headers },
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(notificationSatusSuccess(data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      notificationSatusFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* countryOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.countryOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(countryOptionsSuccess(data)); //6291354408 1988
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      countryOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* categoryOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.categoryOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(categoryOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      categoryOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* visibilityOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.visibilityOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(visibilityOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      visibilityOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* progressOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.progressOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(progressOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      progressOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* statusOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.statusOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(statusOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      statusOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* timeFramesOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.timeFramesOptions,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(timeFrameOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      timeFrameOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* positionOptionsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      `${user.positionOptions}/${action.payload}`,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(positionOptionsSuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      positionOptionsFailure(error?.response?.data?.message || error.message),
    );
  }
}
//Add Goal
function* addGoalSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.createGoal,
      action?.payload,
      _header,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(addGoalSuccess(data?.message));
      showMessage(data?.message);
    } else {
      yield put(addGoalFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(addGoalFailure(error?.response?.data?.message || error.message));
  }
}

//Goal List
function* goalListSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.goalList,
      action.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(goalListSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(goalListFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(goalListFailure(error?.response?.data?.message || error.message));
  }
}

//Goal Details
function* goalDetailsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      `${user.goalDetails}/${action.payload}`,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(goalDetailsSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(goalDetailsFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      goalDetailsFailure(error?.response?.data?.message || error.message),
    );
  }
}
//edit Goal
function* editGoalSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.editGoal,
      action?.payload,
      _header,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(editGoalSuccess(data?.message));
      showMessage(data?.message);
    } else {
      yield put(editGoalFailure(result?.data?.login));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(editGoalFailure(error?.response?.data?.message || error.message));
  }
}
//Goal Delete
function* goalDeleteSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      `${user.goalDelete}/${action.payload}`,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(goalDeleteSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(goalDeleteFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      goalDeleteFailure(error?.response?.data?.message || error.message),
    );
  }
}
//Portal Trending
function* portalTrendingSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.portalTrendings,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(portalTrendingsSuccess(data));
    } else {
      yield put(portalTrendingsFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      portalTrendingsFailure(error?.response?.data?.message || error.message),
    );
  }
}
//portalDetails
function* portalDetailsSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      `${user.portalDetails}/${action.payload}`,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(portalDetailsSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(portalDetailsFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      portalDetailsFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* portalCountrySaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.portalCountryList,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(portalCountrySuccess(data)); //6291354408 1988
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      portalCountryFailure(error?.response?.data?.message || error.message),
    );
  }
}
function* portalCategorySaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.get,
      user.portalCategoryList,
    );

    const { status, data } = result;

    if (status === 200) {
      yield put(portalCategorySuccess(data));
      // showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(
      portalCategoryFailure(error?.response?.data?.message || error.message),
    );
  }
}
//portalSuggestion
function* portalSuggestionSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.portalSuggestion,
      action.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(portalSuggestionsSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(portalSuggestionsFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(portalSuggestionsFailure(error?.response?.data?.message || error.message));
  }
}
//userlist
function* userListSaga(action: any) {
  try {
    const result: AxiosResponse<any> = yield call(
      instance.post,
      user.userList,
      action.payload,
    );
    const { status, data } = result;
    if (status === 200) {
      yield put(userListSuccess(data));
      // showMessage(data?.message);
    } else {
      yield put(userListFailure(result?.data));
      showMessage(data?.message);
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || error.message);
    yield put(userListFailure(error?.response?.data?.message || error.message));
  }
}
function* userSaga() {
  yield takeLatest('user/getUserInfoRequest', handleUserInfo);
  yield takeLatest('user/updateUserInfoRequest', handleUpdateUserInfo);
  yield takeLatest('user/changePasswordRequest', handleChangePassword);
  yield takeLatest('user/faqListRequest', faqListSaga);
  yield takeLatest('user/notificationSatusRequest', handleNotificatonStatus);
  yield takeLatest('user/notificationSatusSuccess', handleUserInfo);
  yield takeLatest('user/ourStoryRequest', ourStorySaga);
  yield takeLatest('user/countryOptionsRequest', countryOptionsSaga);
  yield takeLatest('user/categoryOptionsRequest', categoryOptionsSaga);
  yield takeLatest('user/visibilityOptionsRequest', visibilityOptionsSaga);
  yield takeLatest('user/progressOptionsRequest', progressOptionsSaga);
  yield takeLatest('user/statusOptionsRequest', statusOptionsSaga);
  yield takeLatest('user/timeFrameOptionsRequest', timeFramesOptionsSaga);
  yield takeLatest('user/positionOptionsRequest', positionOptionsSaga);
  yield takeLatest('user/addGoalRequest', addGoalSaga);
  yield takeLatest('user/goalListRequest', goalListSaga);
  yield takeLatest('user/goalDetailsRequest', goalDetailsSaga);
  yield takeLatest('user/editGoalRequest', editGoalSaga);
  yield takeLatest('user/goalDeleteRequest', goalDeleteSaga);
  yield takeLatest('user/portalTrendingsRequest',portalTrendingSaga);
  yield takeLatest('user/portalDetailsRequest',portalDetailsSaga);
  yield takeLatest('user/portalCategoryRequest',portalCategorySaga);
  yield takeLatest('user/portalCountryRequest',portalCountrySaga);
  yield takeLatest('user/portalSuggestionsRequest',portalSuggestionSaga);
  yield takeLatest('user/userListRequest',userListSaga);
}

export default userSaga;
