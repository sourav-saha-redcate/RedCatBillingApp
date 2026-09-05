import {
  GOAL_LIST_TYPE,
  NOTIFICATION_STATUS,
  SUGGESTION_LIST_TYPE,
  UPDATE_USER_INFORMATION,
  USER_LIST_TYPE,
  type CHANGE_PASSWORD,
} from '@app/types';
import {
  categoryOptionsResponse,
  countryOptionsResponse,
  FaqResponse,
  goalDeleteResponse,
  goalDetailsResponse,
  goalListResponse,
  OurStoryResponse,
  PortalCategoryResponse,
  PortalCountryResponse,
  PortalResponse,
  PortalSuggestionsResponse,
  PortalTrendingResponse,
  positionOptionsResponse,
  Profileresponse,
  progressOptionsResponse,
  statusOptionsResponse,
  timeFrameOptionsItem,
  timeFrameOptionsResponse,
  UserListResponse,
  visibilityOptionsResponse,
} from '@app/types/ApiResponse';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  loading: boolean;
  error: string | null;
  status: string | null;
  userInfo: Profileresponse | null;
  faqListRes: FaqResponse | null;
  ourStoryRes: OurStoryResponse | null;
  countryOptionsRes: countryOptionsResponse | null;
  categoryOptionsRes: categoryOptionsResponse | null;
  visibilityOptionsRes: visibilityOptionsResponse | null;
  goalListRes: goalListResponse | null;
  goalDetailsRes: goalDetailsResponse | null;
  progressOptionsRes: progressOptionsResponse | null;
  statusOptionsRes: statusOptionsResponse | null;
  timeFrameOptionsRes: timeFrameOptionsResponse | null;
  positionOptionsRes: positionOptionsResponse | null;
  goalDeleteRes: goalDeleteResponse | null;
  portalTrendingRes: PortalTrendingResponse | null;
  portalRes: PortalResponse | null;
  portalCategoryRes: PortalCategoryResponse | null;
  portalCountryRes: PortalCountryResponse | null;
  portalSuggestionsRes: PortalSuggestionsResponse | null;
  userListRes: UserListResponse | null;
}
const initialState: UserState = {
  userInfo: null,
  loading: true,
  error: null,
  status: null,
  faqListRes: null,
  ourStoryRes: null,
  countryOptionsRes: null,
  categoryOptionsRes: null,
  visibilityOptionsRes: null,
  goalListRes: null,
  goalDetailsRes: null,
  progressOptionsRes: null,
  statusOptionsRes: null,
  timeFrameOptionsRes: null,
  positionOptionsRes: null,
  goalDeleteRes: null,
  portalTrendingRes: null,
  portalRes: null,
  portalCategoryRes: null,
  portalCountryRes: null,
  portalSuggestionsRes: null,
  userListRes: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // fetch user information
    getUserInfoRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getUserInfoSuccess(state, action: PayloadAction<Profileresponse>) {
      state.loading = false;
      state.userInfo = action.payload;
      state.error = null;
    },
    getUserInfoFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // update user information
    updateUserInfoRequest(
      state,
      action: PayloadAction<UPDATE_USER_INFORMATION>,
    ) {
      state.status = action.type;
      state.error = null;
    },
    updateUserInfoSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.status = action.type;
    },
    updateUserInfoFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    // change Password
    changePasswordRequest(state, action: PayloadAction<CHANGE_PASSWORD>) {
      state.status = action.type;
    },
    changePasswordSuccess(state, action: PayloadAction<boolean>) {
      state.status = action.type;
    },
    changePasswordFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    // Faq List
    faqListRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    faqListSuccess(state, action: PayloadAction<FaqResponse>) {
      state.status = action.type;
      state.faqListRes = action.payload;
    },
    faqListFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    // our store
    ourStoryRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    ourStorySuccess(state, action: PayloadAction<OurStoryResponse>) {
      state.status = action.type;
      state.ourStoryRes = action.payload;
    },
    ourStoryFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    //countryOptions
    countryOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    countryOptionsSuccess(
      state,
      action: PayloadAction<countryOptionsResponse>,
    ) {
      state.status = action.type;
      state.countryOptionsRes = action.payload;
    },
    countryOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //notification status

    notificationSatusRequest(
      state,
      action: PayloadAction<NOTIFICATION_STATUS>,
    ) {
      state.loading = true;
      state.error = null;
    },
    notificationSatusSuccess(state, action: PayloadAction<boolean>) {
      state.loading = false;
      state.error = null;
      state.status = action.type;
    },
    notificationSatusFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    //categoryOptions
    categoryOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    categoryOptionsSuccess(
      state,
      action: PayloadAction<categoryOptionsResponse>,
    ) {
      state.status = action.type;
      state.categoryOptionsRes = action.payload;
    },
    categoryOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    //visibilityOptions
    visibilityOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    visibilityOptionsSuccess(
      state,
      action: PayloadAction<visibilityOptionsResponse>,
    ) {
      state.status = action.type;
      state.visibilityOptionsRes = action.payload;
    },
    visibilityOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    // progressOptionsOptions

    progressOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    progressOptionsSuccess(
      state,
      action: PayloadAction<progressOptionsResponse>,
    ) {
      state.status = action.type;
      state.progressOptionsRes = action.payload;
    },
    progressOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    // statusOptionsOptions

    statusOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    statusOptionsSuccess(state, action: PayloadAction<statusOptionsResponse>) {
      state.status = action.type;
      state.statusOptionsRes = action.payload;
    },
    statusOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //timeframe
    timeFrameOptionsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    timeFrameOptionsSuccess(
      state,
      action: PayloadAction<timeFrameOptionsResponse>,
    ) {
      state.status = action.type;
      state.timeFrameOptionsRes = action.payload;
    },
    timeFrameOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //posisionframe
    positionOptionsRequest(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    positionOptionsSuccess(
      state,
      action: PayloadAction<positionOptionsResponse>,
    ) {
      state.status = action.type;
      state.positionOptionsRes = action.payload;
    },
    positionOptionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //Add goal
    addGoalRequest(state, action: PayloadAction<FormData>) {
      state.status = action.type;
    },
    addGoalSuccess(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    addGoalFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    //Goal List
    goalListRequest(state, action: PayloadAction<GOAL_LIST_TYPE | undefined>) {
      state.status = action.type;
    },
    goalListSuccess(state, action: PayloadAction<goalListResponse>) {
      state.status = action.type;
      state.goalListRes = action.payload;
    },
    goalListFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    //Goal Details
    goalDetailsRequest(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    goalDetailsSuccess(state, action: PayloadAction<goalDetailsResponse>) {
      state.status = action.type;
      state.goalDetailsRes = action.payload;
    },
    goalDetailsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //edit goal
    editGoalRequest(state, action: PayloadAction<FormData>) {
      state.status = action.type;
    },
    editGoalSuccess(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    editGoalFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //Goal Delete
    goalDeleteRequest(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    goalDeleteSuccess(state, action: PayloadAction<goalDeleteResponse>) {
      state.status = action.type;
      state.goalDeleteRes = action.payload;
    },
    goalDeleteFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //portalTrendings
    portalTrendingsRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    portalTrendingsSuccess(
      state,
      action: PayloadAction<PortalTrendingResponse>,
    ) {
      state.status = action.type;
      state.portalTrendingRes = action.payload;
    },
    portalTrendingsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //portalDetails
    portalDetailsRequest(state, action: PayloadAction<string>) {
      state.status = action.type;
    },
    portalDetailsSuccess(state, action: PayloadAction<PortalResponse>) {
      state.status = action.type;
      state.portalRes = action.payload;
    },
    portalDetailsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },

    //portalCategory
    portalCategoryRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    portalCategorySuccess(
      state,
      action: PayloadAction<PortalCategoryResponse>,
    ) {
      state.status = action.type;
      state.portalCategoryRes = action.payload;
    },
    portalCategoryFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //portalCountry
    portalCountryRequest(state, action: PayloadAction<undefined>) {
      state.status = action.type;
    },
    portalCountrySuccess(state, action: PayloadAction<PortalCountryResponse>) {
      state.status = action.type;
      state.portalCountryRes = action.payload;
    },
    portalCountryFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //Portal suggestions
    portalSuggestionsRequest(
      state,
      action: PayloadAction<SUGGESTION_LIST_TYPE | undefined>,
    ) {
      state.status = action.type;
    },
    portalSuggestionsSuccess(
      state,
      action: PayloadAction<PortalSuggestionsResponse>,
    ) {
      state.status = action.type;
      state.portalSuggestionsRes = action.payload;
    },
    portalSuggestionsFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
    //userList
    userListRequest(state, action: PayloadAction<USER_LIST_TYPE | undefined>) {
      state.status = action.type;
    },
    userListSuccess(state, action: PayloadAction<UserListResponse>) {
      state.status = action.type;
      state.userListRes = action.payload;
    },
    userListFailure(state, action: PayloadAction<string>) {
      state.status = action.type;
      state.error = action.payload;
    },
  },
});

export const {
  // fetch user information
  getUserInfoRequest,
  getUserInfoSuccess,
  getUserInfoFailure,

  // update user information
  updateUserInfoRequest,
  updateUserInfoSuccess,
  updateUserInfoFailure,

  // change password
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,

  //faqList
  faqListRequest,
  faqListSuccess,
  faqListFailure,
  //notification status
  notificationSatusRequest,
  notificationSatusSuccess,
  notificationSatusFailure,
  // our store
  ourStoryRequest,
  ourStorySuccess,
  ourStoryFailure,
  //countryOptions
  countryOptionsRequest,
  countryOptionsSuccess,
  countryOptionsFailure,
  //categoryOptions
  categoryOptionsRequest,
  categoryOptionsSuccess,
  categoryOptionsFailure,

  //visibilityOptions
  visibilityOptionsRequest,
  visibilityOptionsSuccess,
  visibilityOptionsFailure,

  // progressOptions
  progressOptionsRequest,
  progressOptionsSuccess,
  progressOptionsFailure,

  // statusOptionsOptions
  statusOptionsRequest,
  statusOptionsSuccess,
  statusOptionsFailure,

  // timeFrameOptionsOptions
  timeFrameOptionsRequest,
  timeFrameOptionsSuccess,
  timeFrameOptionsFailure,
  //add Goal
  addGoalRequest,
  addGoalSuccess,
  addGoalFailure,

  //goal List
  goalListRequest,
  goalListSuccess,
  goalListFailure,

  //goal details
  goalDetailsRequest,
  goalDetailsSuccess,
  goalDetailsFailure,
  //edit Goal
  editGoalRequest,
  editGoalSuccess,
  editGoalFailure,
  //position
  positionOptionsRequest,
  positionOptionsSuccess,
  positionOptionsFailure,
  //goalDelete
  goalDeleteRequest,
  goalDeleteSuccess,
  goalDeleteFailure,
  //portalTrending
  portalTrendingsRequest,
  portalTrendingsSuccess,
  portalTrendingsFailure,
  //portalDetail
  portalDetailsRequest,
  portalDetailsSuccess,
  portalDetailsFailure,
  //portalCategory
  portalCategoryRequest,
  portalCategorySuccess,
  portalCategoryFailure,
  //portalCountry
  portalCountryRequest,
  portalCountrySuccess,
  portalCountryFailure,
  //ortalSuggestions
  portalSuggestionsRequest,
  portalSuggestionsSuccess,
  portalSuggestionsFailure,
  //userList
  userListRequest,
  userListSuccess,
  userListFailure,
} = userSlice.actions;

export default userSlice.reducer;
