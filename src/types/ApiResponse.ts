export interface Profileresponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  isSuperUser: boolean;
  affiliateId: number | null;
  email: string;
  displayName: string;
  updatePassword: boolean;
  lastIPAddress: string;
  isDeleted: boolean;
  createdByUserID: number | null;
  createdOnDate: string;
  lastModifiedByUserID: number | null;
  lastModifiedOnDate: string;
  passwordResetToken: string | null;
  passwordResetExpiration: string | null;
  lowerEmail: string | null;
  userId: number;
  country: string;
  description: string;
  phone: string;
  accountCreationExpiration: string | null;
  otp: string | null;
  password: string;
  image: string;
  isDailyReminderActive: boolean;
  isNotificationActive: boolean;
  isProfileDeactivated: boolean;
  isProfileCompleted: boolean;
  isRegistrationOtpVerified: boolean;
  progressQuestionnaire: {
    bringsYouHere: string;
    yourPreference: string[];
  };
}

export interface UserData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  isSuperUser: boolean;
  affiliateId: number | null;
  email: string;
  displayName: string;
  updatePassword: boolean;
  lastIPAddress: string;
  isDeleted: boolean;
  createdByUserID: number | null;
  createdOnDate: string;
  lastModifiedByUserID: number | null;
  lastModifiedOnDate: string;
  passwordResetToken: string | null;
  passwordResetExpiration: string | null;
  lowerEmail: string | null;
  userId: number;
  country: string;
  description: string;
  phone: string;
  accountCreationExpiration: string | null;
  otp: string | null;
  password: string;
  image: string;
  isDailyReminderActive: boolean;
  isNotificationActive: boolean;
  isProfileDeactivated: boolean;
  isProfileCompleted: boolean;
  isRegistrationOtpVerified: boolean;
  progressQuestionnaire: {
    bringsYouHere: string;
    yourPreference: string[];
  };
}
export interface signInResponse {
  userData: UserData;
  message: string;
  status: number;
  token: string;
}
export interface signUpResponse {
  data: {
    token: string;
  };
  message: string;
  statusCode: number;
}
export interface otpVErifyResponse {
  data: {
    token: string;
    user: any;
  };
  message: string;
  statusCode: number;
}
export interface otpResendResponse {
  success: any;
  message: string;
  statusCode: number;
  data: {};
}
export interface FaqItem {
  id: number;
  moduleId: number;
  name: string;
  description: string;
  position: number;
  isActive: boolean;
}

// API Response
export interface FaqResponse {
  success: boolean;
  status: number;
  message: string;
  data: FaqItem[];
}

export interface OurStoryItem {
  content:{
    baseSection:string;
    midSection:string;
    topSection:string;
  };
  backGroundImage: number;
}
export interface OurStoryResponse {
  success: boolean;
  status: number;
  message: string;
  data: OurStoryItem;
}
export interface countryOptionsItem {
  id: number;
  userId: number;
  position: string | number | null;
  categoryName: string;
  parentCategoryId: number;
  level: number;
  categoryUrl: string | number | null;
  categoryImage: string | number | null;
  categoryText: string | number | null;
  color: string;
}
export interface countryOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: countryOptionsItem[];
}

export interface categoryOptionsItem {
  id: number;
  userId: number;
  position: string | number | null;
  categoryName: string;
  parentCategoryId: number;
  level: number;
  categoryUrl: string | number | null;
  categoryImage: string | number | null;
  categoryText: string | number | null;
  color: string;
}
export interface categoryOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: categoryOptionsItem[];
}

export interface visibilityOptionsItem {
  id: number;
  visibility: string;
}
export interface visibilityOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: visibilityOptionsItem[];
}

export interface goalItem {
  GoalID: number;
  UserID: number;
  GoalName: string;
  Description: string;
  Position:number;
  CategoryID: null;
  RegionID: number;
  GoalURL: string;
  GoalImage: string;
  DateAdded:string;
  LastModified: string;
  DateCompleted: null;
  Continent:string;
  Country: string;
  LastStatusModified: string;
  timeframeName: string;
  progressName: string;
  statusName:string;
  visibilityName:string;
  categories: string;
}

export interface goalListResponse {
  data: Array<goalItem>;
}

export interface goalDetailsResponse {
  data: goalItem;
}

export interface goalItem {
  GoalID: number;
  UserID: number;
  GoalName: string;
  Description: string;
  Position:number;
  CategoryID: null;
  RegionID: number;
  GoalURL: string;
  GoalImage: string;
  DateAdded:string;
  LastModified: string;
  DateCompleted: null;
  Continent:string;
  Country: string;
  LastStatusModified: string;
  timeframeName: string;
  progressName: string;
  statusName:string;
  visibilityName:string;
  categories: string;
}

export interface goalListResponse {
  data: Array<goalItem>;
}

export interface goalDetailsResponse {
  data: goalItem;
}

 export interface  progressOptionsItem {
  id: number;
  progress: string;
}
export interface  progressOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data:  progressOptionsItem[];
}

export interface  statusOptionsItem {
  id: number;
 status: string;
}
export interface  statusOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data:  statusOptionsItem[];
}
export interface  timeFrameOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data:  timeFrameOptionsItem[];
}
export interface timeFrameOptionsItem {
  id: number;
  timeframe: string;
}

export interface posisionOptionsItem{
goalName: string;
position: Number;
}
export interface positionOptionsResponse {
  success: boolean;
  status: number;
  message: string;
  data:  {
    positionOptions: posisionOptionsItem[];
  };
}
export interface goalDeleteResponse {
  success: boolean;
  status: number;
  message: string;
  data:  {};
}

export interface PortalTrendingResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    trending: TrendingItem[];
  };
}

export interface TrendingItem {
  id: number;
  portalID: number;
  userID: number;
  title: string;
  subTitle: string;
  summary: string;
  article: string;
  articleImage: string;
  dateAdded: string;
  lastModified: string;
  publishDate: string;
  expireDate: string;
  numberOfViews: number;
  ratingValue: number;
  ratingCount: number;
  titleLink: string;
  detailType: string;
  detailTypeData: string;
  detailsTemplate: string;
  detailsTheme: string;
  galleryPosition: string;
  galleryDisplayType: string;
  commentsTheme: string;
  articleImageFolder: string;
  numberOfComments: number;
  metaDecription: string;
  metaKeywords: string;
  displayStyle: string;
  detailTarget: string;
  cleanArticleData: string;
  articleFromRSS: boolean;
  hasPermissions: boolean;
  eventArticle: boolean;
  detailMediaType: string;
  detailMediaData: string;
  authorAliasName: string;
  showGallery: boolean;
  articleGalleryID: number;
  mainImageTitle: string;
  mainImageDescription: string;
  hideDefaultLocale: boolean;
  featured: boolean;
  approved: boolean;
  allowComments: boolean;
  active: boolean;
  showMainImage: boolean;
  showMainImageFront: boolean;
  articleImageSet: boolean;
  cfGroupeID: number | null;
  detailsDocumentsTemplate: string | null;
  detailsLinksTemplate: string | null;
  detailsRelatedArticlesTemplate: string | null;
  contactEmail: string | null;
  titleTag: string | null;
  openGraphMetaTags: string;
  twitterCardMetaTags: string;
  structuredDataJSON: string;
  goodVotesCount: number;
  badVotesCount: number;
  published: boolean;
  workflowId: number;
  revisionHistoryEntryID: number;
}
export interface PortalResponse {
  success: boolean;
  status: number;
  message: string;
  data: PortalData;
}

export interface PortalData {
  id: number;
  portalID: number;
  userID: number;
  title: string;
  subTitle: string;
  summary: string;
  article: string;
  articleImage: string;
  dateAdded: string;
  lastModified: string;
  publishDate: string;
  expireDate: string;
  numberOfViews: number;
  ratingValue: number;
  ratingCount: number;
  titleLink: string;
  detailType: string;
  detailTypeData: string;
  detailsTemplate: string;
  detailsTheme: string;
  galleryPosition: string;
  galleryDisplayType: string;
  commentsTheme: string;
  articleImageFolder: string;
  numberOfComments: number;
  metaDecription: string;
  metaKeywords: string;
  displayStyle: string;
  detailTarget: string;
  cleanArticleData: string;
  articleFromRSS: boolean;
  hasPermissions: boolean;
  eventArticle: boolean;
  detailMediaType: string;
  detailMediaData: string;
  authorAliasName: string;
  showGallery: boolean;
  articleGalleryID: number;
  mainImageTitle: string;
  mainImageDescription: string;
  hideDefaultLocale: boolean;
  featured: boolean;
  approved: boolean;
  allowComments: boolean;
  active: boolean;
  showMainImage: boolean;
  showMainImageFront: boolean;
  articleImageSet: boolean;
  cfGroupeID: number | null;
  detailsDocumentsTemplate: string | null;
  detailsLinksTemplate: string | null;
  detailsRelatedArticlesTemplate: string | null;
  contactEmail: string | null;
  titleTag: string | null;
  openGraphMetaTags: string;
  twitterCardMetaTags: string;
  structuredDataJSON: string;
  goodVotesCount: number;
  badVotesCount: number;
  published: boolean;
  workflowId: number;
  revisionHistoryEntryID: number;
  categoryNames: string;
  categoryIds: string;
  countryNames: string;
  countryIds: string;
}
export interface PortalCategoryResponse {
  success: boolean;
  status: number;
  message: string;
  data: PortalCategory[];
}

export interface PortalCategory {
  id: number;
  portalID: number;
  categoryName: string;
  position: number;
  parentCategory: number | null;
  level: number;
  categoryURL: string | null;
  categoryImage: string | null;
  categoryText: string | null;
  color: string;
  searchableText: string;
}
export interface PortalCountryResponse {
  success: boolean;
  status: number;
  message: string;
  data: PortalCountry[];
}

export interface PortalCountry {
  id: number;
  portalID: number;
  categoryName: string;
  position: number;
  parentCategory: number | null;
  level: number;
  categoryURL: string | null;
  categoryImage: string | null;
  categoryText: string | null;
  color: string;
  searchableText: string;
}
export interface PortalSuggestionsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    suggestions: Suggestion[];
  };
}

export interface Suggestion {
  id: number;
  portalID: number;
  userID: number;
  title: string;
  subTitle: string;
  summary: string;
  article: string;
  articleImage: string | null;
  dateAdded: string;
  lastModified: string;
  publishDate: string;
  expireDate: string;
  numberOfViews: number;
  ratingValue: number;
  ratingCount: number;
  titleLink: string;
  detailType: string;
  detailTypeData: string;
  detailsTemplate: string;
  detailsTheme: string;
  galleryPosition: string;
  galleryDisplayType: string;
  commentsTheme: string;
  articleImageFolder: string;
  numberOfComments: number;
  metaDecription: string;
  metaKeywords: string;
  displayStyle: string;
  detailTarget: string;
  cleanArticleData: string;
  articleFromRSS: boolean;
  hasPermissions: boolean;
  eventArticle: boolean;
  detailMediaType: string;
  detailMediaData: string;
  authorAliasName: string;
  showGallery: boolean;
  articleGalleryID: number;
  mainImageTitle: string;
  mainImageDescription: string;
  hideDefaultLocale: boolean;
  featured: boolean;
  approved: boolean;
  allowComments: boolean;
  active: boolean;
  showMainImage: boolean;
  showMainImageFront: boolean;
  articleImageSet: boolean;
  cfGroupeID: number | null;
  detailsDocumentsTemplate: string | null;
  detailsLinksTemplate: string | null;
  detailsRelatedArticlesTemplate: string | null;
  contactEmail: string | null;
  titleTag: string | null;
  openGraphMetaTags: string;
  twitterCardMetaTags: string;
  structuredDataJSON: string;
  goodVotesCount: number;
  badVotesCount: number;
  published: boolean;
  workflowId: number;
  revisionHistoryEntryID: number;
  categoryNames: string;
  categoryIds: string;
}
export interface UserListResponse {
  success: boolean;
  status: number;
  message: string;
  data: UserListData;
}

export interface UserListData {
  users: User[];
}

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  isSuperUser: boolean;
  affiliateId: number | null;
  email: string;
  displayName: string;
  updatePassword: boolean;
  lastIPAddress: string;
  isDeleted: boolean;
  createdByUserID: number;
  createdOnDate: string; // ISO timestamp
  lastModifiedByUserID: number;
  lastModifiedOnDate: string; // ISO timestamp
  passwordResetToken: string | null;
  passwordResetExpiration: string | null; // may be null
  lowerEmail: string | null;
}

export interface AuthStore {
  id: string;
  name: string;
  type: string;
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

export interface LoginRequestPayload {
  username: string;
  password: string;
  remember_me?: boolean;
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



