import {BASE_URL} from '@env';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import {API} from '../constants';
import {logoutRequest, setToken} from '@app/store/slice/auth.slice';

const getStore = () => {
  const {store} = require('@app/store');
  return store;
};

export const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  const {auth} = API;
  const store = getStore();

  const authState = store.getState().auth;
  const curRefreshToken = authState.refreshToken;
  if (!curRefreshToken) {
    return null;
  }

  try {
    console.log('[DEBUG REFRESH] Attempting refresh at:', `${BASE_URL}${auth.refreshToken}`);
    const payload = {
      refresh_token: curRefreshToken,
    };

    const response = await axios.post(`${BASE_URL}${auth.refreshToken}`, payload);
    const resData = response.data?.data || response.data;
    const newAccessToken = resData?.access_token || resData?.accessToken;
    const newRefreshToken = resData?.refresh_token || resData?.refreshToken || curRefreshToken;

    // Dispatch action to update the token in the Redux store
    store.dispatch(
      setToken({
        token: newAccessToken,
        refreshToken: newRefreshToken,
      }),
    );

    return newAccessToken;
  } catch (error: any) {
    console.log('[DEBUG REFRESH] Token refresh failed:', error?.response?.data || error?.message);
    store.dispatch(logoutRequest());
    throw error;
  }
};

instance.interceptors.request.use(async config => {
  try {
    const state = await NetInfo.fetch();
    // Only cancel if explicitly false; allow null/unresolved to proceed
    if (state.isConnected === false) {
      console.warn('[DEBUG AXIOS] Request canceled by NetInfo: offline');
      throw new axios.Cancel(
        'No internet connection. Please connect to the internet.',
      );
    }
  } catch (netErr: any) {
    if (axios.isCancel(netErr)) {
      throw netErr;
    }
    console.warn('[DEBUG AXIOS] NetInfo check bypassed:', netErr?.message || netErr);
  }

  const authState = getStore()?.getState()?.auth;
  const authToken = authState?.accessToken || authState?.token;

  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

instance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error?.config;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/verify-reset-otp') ||
      originalRequest?.url?.includes('/auth/reset-password');

    // Check if the error is due to an expired token and the request hasn't already been retried
    if (
      !isAuthEndpoint &&
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          instance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return instance(originalRequest);
        } else {
          processQueue(new Error('Failed to refresh token'), null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
