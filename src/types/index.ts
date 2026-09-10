export interface BillItemProduct {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export interface BillItem {
  id: string;
  billNumber: string;
  customerName: string;
  phone: string;
  dateTime: string;
  dateSection: 'Today' | 'Yesterday' | 'Older';
  time: string;
  date: string;
  paymentMethod: 'UPI' | 'Cash' | 'Card';
  amount: number;
  status: 'PAID' | 'REFUNDED' | 'PENDING';
  staff: string;
  items: BillItemProduct[];
  subtotal: number;
  gst: number;
  grandTotal: number;
  barcode?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  SignIn: undefined;
  SignUp: { storeType?: string } | undefined;
  ChooseStoreType: undefined;
  RegisterStore: undefined;
  StoreSetup: { storeType?: string; storeTypeId?: string; store_type_id?: string } | undefined;
  TabNavigator: { screen?: string } | undefined;
  SideMenu: undefined;
  Home: undefined;
  Gallery: undefined;
  SearchProduct: undefined;
  PrimerProduct: undefined;
  CollorCatalogue: undefined;
  BillHistory: undefined;
  BillPreview: { billId?: string; bill?: BillItem; apiBill?: any } | undefined;
  NewBill: undefined;
  Settings: undefined;
  ForgotPassword: undefined;
  OtpVerification: { identifier: string };
  ResetPassword: {
    identifier?: string;
    token_or_otp?: string;
    tokenOrOtp?: string;
    otp?: string;
  };
  ChangePassword: {
    identifier?: string;
    token_or_otp?: string;
    tokenOrOtp?: string;
    otp?: string;
  };
  DailySummary: undefined;
};


// -------------------------- API PROPS ----------------------------------
export interface SIGN_UP_TYPE {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

// export interface SIGN_IN_TYPE {
//   username: string;
//   password: string;
// //  expiresInMins: number;
// }

export interface UPDATE_USER_INFORMATION {
  displayName: string;
  username: string;
  email: string;
  phone?: string;
  description?: string;
  image?: {
    name: string;
    type: string;
    uri: string;
  };
}

export interface CHANGE_PASSWORD {
  old_password: string;
  new_password: string;
}

export interface SIGN_IN_TYPE {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginRequestPayload {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface StoreSettings {
  googleReviewLink?: string;
  [key: string]: any;
}

export interface AuthStore {
  id: string;
  name: string;
  type: string;
  settings?: StoreSettings;
  googleReviewLink?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  store: AuthStore;
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RefreshTokenRequestPayload {
  refreshToken?: string;
  refresh_token?: string;
}

export interface RefreshTokenResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
  expires_in?: number | null;
  expiresIn?: number | null;
  [key: string]: any;
}

export interface StoreAddress {
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  coordinates?: number[];
  [key: string]: any;
}

export interface RegisterStoreRequestPayload {
  store_type_id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  email: string;
  password: string;
  address?: StoreAddress | Record<string, any> | string;
  gst_number?: string;
  [key: string]: any;
}

export interface RegisterStoreResponse extends LoginResponse {
  message?: string;
  [key: string]: any;
}

export interface GetMeResponse {
  user: AuthUser;
  store: AuthStore;
  permissions: string[];
  [key: string]: any;
}

export interface ForgotPasswordRequestPayload {
  identifier: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

export interface ACC_OTP_VERIFY {
  otp: string;
  email: string;
}

export interface FORGOT_PASS_TYPE {
  email: string;
}

export interface RESET_PASSWORD {
  token: string;
  password: string;
}

export interface OTP_VERIFY_TYPE {
  email: string;
  otp: string;
}
export interface OTP_RESEND_TYPE {
  email: string;
}

export interface QUESTION_SUBMIT_TYPE {
  bringsYouHere?: Array<string>;
  yourPreference?: Array<string>;
  country?: string;
}
export interface USER_DEACTIVATE {
  token: string;
}

export interface NOTIFICATION_STATUS {
  notificationActive?: string;
  dailyReminderActive?: string;
}

export interface GOAL_LIST_TYPE {
  timeframe?: string;
  country?: string;
  category?: string;
  status?: string;
  search?: string;
}
export interface SUGGESTION_LIST_TYPE {
  sortBy?: string;
  country?: string[];
  category?: string[];
  search?: string;
}
export interface USER_LIST_TYPE {
  search?: string;
}

export * from './api';