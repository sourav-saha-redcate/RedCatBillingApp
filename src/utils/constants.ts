import { BASE_URL, BUCKET_URL } from '@env';

export default {
  TOKEN: 'TOKEN',
  ISREMEMBER: 'ISREMEMBER',
  ISINSTALLED: 'ISINSTALLED',
};

export const API = {
  auth: {
    login: '/auth/login',
    signup: 'auth/register',
    otpVerify: 'auth/otp-verify',
    resendOtp: 'auth/otp-resend',
    forgotpassword: '/auth/forget-password',
    forgotpasswordOtpVerify: '/auth/forget-password/otp-verify',
    forgotpasswordresend: '/auth/forget-password/otp-resend',
    changepassword: '/auth/change-password',
    logout: '',
    deactiveUser: '/user/deactivate',
    refreshToken: 'auth/refresh',
    questionSubmit: '/user/register/progress/questionnaire-submission',
  },
  user: {
    profile: '/user/profile',
    editProfile: '/user/profile/update',
    changePassword: '/user/password/update',
    deleteAccount: '',
    faqList:'/faq/list',
    notificationStatus:'/user/notification-status/update',
    ourstory:'/our-story/details',
    countryOptions:'/user/country-options',
    categoryOptions:'/user/category-options',
    visibilityOptions:'/user/visibility-options',
    progressOptions:'/user/progress-options',
    statusOptions:'/user/status-options',
    timeFramesOptions:'/user/time-frame-options',
    createGoal: '/user/goal/create',
    goalList:'/user/goals',
    goalDetails:`/user/goal`,
    editGoal:'/user/goal/edit',
    goalDelete:'/user/goal-delete',
    positionOptions:'/user/position-options',
    portalSuggestion:'/portal/suggestion',
    portalTrendings:'/portal/trendings',
    portalDetails:'/portal',
    portalCategoryList:'/portal/category-list',
    portalCountryList:'/portal/country-list',
    userList:'/user/list',
  },
};

export const IMAGES_BUCKET_URL = {
  profile: `${BUCKET_URL}/uploads/user/`,
  goal:`${BUCKET_URL}/uploads/goal/`,
};
