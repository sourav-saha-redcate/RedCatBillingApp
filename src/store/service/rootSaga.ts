import { all } from 'redux-saga/effects';
import authSaga, {
  watchLogin,
  watchRefreshToken,
  watchRegisterStore,
  watchGetMe,
  watchForgotPassword,
} from './auth.saga';
import userSaga from './user.saga';

export default function* rootSaga() {
  yield all([
    authSaga(),
    userSaga(),
    watchLogin(),
    watchRefreshToken(),
    watchRegisterStore(),
    watchGetMe(),
    watchForgotPassword(),
  ]);
}