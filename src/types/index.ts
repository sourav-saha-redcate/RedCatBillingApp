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
  StoreSetup: { storeType?: string } | undefined;
  TabNavigator: { screen?: string } | undefined;
  SideMenu: undefined;
  Home: undefined;
  Gallery: undefined;
  SearchProduct: undefined;
  PrimerProduct: undefined;
  CollorCatalogue: undefined;
  BillHistory: undefined;
  BillPreview: { bill: BillItem };
  NewBill: undefined;
  Settings: undefined;
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