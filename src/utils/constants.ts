import { BASE_URL, BUCKET_URL } from '@env';

export default {
  TOKEN: 'TOKEN',
  ISREMEMBER: 'ISREMEMBER',
  ISINSTALLED: 'ISINSTALLED',
};

export const API = {
  health: '/api/v1/health',
  auth: {

    login: '/api/v1/auth/login',
    registerStore: '/api/v1/auth/register-store',
    refreshToken: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    forgotPassword: '/api/v1/auth/forgot-password',
    verifyResetOtp: '/api/v1/auth/verify-reset-otp',
    resetPassword: '/api/v1/auth/reset-password',
    logout: '/api/v1/auth/logout',
    // Legacy compatibility aliases
    signup: '/api/v1/auth/register-store',
    forgotpassword: '/api/v1/auth/forgot-password',
    otpVerify: '/api/v1/auth/reset-password',
    forgotpasswordOtpVerify: '/api/v1/auth/reset-password',
    resendOtp: '/api/v1/auth/forgot-password',
    forgotpasswordresend: '/api/v1/auth/forgot-password',
    changepassword: '/api/v1/auth/reset-password',
    questionSubmit: '/api/v1/auth/me',
    deactiveUser: '/api/v1/auth/logout',
  },
  user: {
    profile: '/api/v1/auth/me',
    updateProfile: '/api/v1/store',
    editProfile: '/user/profile/update',
    changePassword: '/user/password/update',
    deleteAccount: '',
    faqList: '/faq/list',
    notificationStatus: '/user/notification-status/update',
    ourstory: '/our-story/details',
    countryOptions: '/user/country-options',
    categoryOptions: '/user/category-options',
    visibilityOptions: '/user/visibility-options',
    progressOptions: '/user/progress-options',
    statusOptions: '/user/status-options',
    timeFramesOptions: '/user/time-frame-options',
    createGoal: '/user/goal/create',
    goalList: '/user/goals',
    goalDetails: '/user/goal',
    editGoal: '/user/goal/edit',
    goalDelete: '/user/goal-delete',
    positionOptions: '/user/position-options',
    portalSuggestion: '/portal/suggestion',
    portalTrendings: '/portal/trendings',
    portalDetails: '/portal',
    portalCategoryList: '/portal/category-list',
    portalCountryList: '/portal/country-list',
    userList: '/user/list',
  },
  storeTypes: {
    base: '/api/v1/store-types',
    byId: (id: string) => `/api/v1/store-types/${id}`,
  },
  store: {
    base: '/api/v1/store',
    taxSettings: '/api/v1/store/tax-settings',
  },
  staff: {
    base: '/api/v1/staff',
    byId: (id: string) => `/api/v1/staff/${id}`,
  },
  customers: {
    base: '/api/v1/customers',
    byId: (id: string) => `/api/v1/customers/${id}`,
  },
  categories: {
    base: '/api/v1/categories',
    byId: (id: string) => `/api/v1/categories/${id}`,
  },
  catalog: {
    base: '/api/v1/catalog',
    search: '/api/v1/catalog/search',
    items: '/api/v1/catalog/items',
    itemById: (id: string) => `/api/v1/catalog/items/${id}`,
    itemImage: (id: string) => `/api/v1/catalog/items/${id}/image`,
  },
  inventory: {
    items: '/api/v1/inventory/items',
    summary: '/api/v1/inventory/summary',
    adjust: (id: string) => `/api/v1/inventory/items/${id}/adjust`,
    itemTransactions: (id: string) => `/api/v1/inventory/items/${id}/transactions`,
    transactions: '/api/v1/inventory/transactions',
  },
  bills: {
    base: '/api/v1/bills',
    byId: (id: string) => `/api/v1/bills/${id}`,
    payment: (id: string) => `/api/v1/bills/${id}/payment`,
    finalize: (id: string) => `/api/v1/bills/${id}/finalize`,
    sendReceipt: (id: string) => `/api/v1/bills/${id}/receipt/send`,
    refund: (id: string) => `/api/v1/bills/${id}/refund`,
    refunds: (id: string) => `/api/v1/bills/${id}/refunds`,
  },
  dashboard: '/api/v1/dashboard',
  reports: {
    dailySummary: '/api/v1/reports/daily-summary',
    sales: '/api/v1/reports/sales',
    gst: '/api/v1/reports/gst',
    staffPerformance: '/api/v1/reports/staff-performance',
  },
  auditLogs: {
    base: '/api/v1/audit-logs',
  },
  sync: {
    status: '/api/v1/sync/status',
    batch: '/api/v1/sync',
  },
  backup: {
    create: '/api/v1/backup',
    list: '/api/v1/backup/list',
    restore: '/api/v1/backup/restore',
  },
};

export const IMAGES_BUCKET_URL = {
  profile: `${BUCKET_URL}/uploads/user/`,
  catalog: `${BUCKET_URL}/uploads/catalog/`,
  store: `${BUCKET_URL}/uploads/store/`,
};
