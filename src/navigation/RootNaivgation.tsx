import {
  createNavigationContainerRef,
  StackActions,
  CommonActions,
} from '@react-navigation/native';
import {RootStackParamList} from '@app/types';

// Create navigation reference with typed RootStackParamList
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const PROTECTED_ROUTES: Array<keyof RootStackParamList> = [
  'TabNavigator',
  'SideMenu',
  'BillHistory',
  'BillPreview',
  'NewBill',
  'Settings',
  'DailySummary',
  'SearchProduct',
  'PrimerProduct',
  'CollorCatalogue',
  'Home',
  'Gallery',
];

export function isProtectedRoute(name: any): boolean {
  return PROTECTED_ROUTES.includes(name);
}

export const checkIsAuthenticated = (): boolean => {
  try {
    const { store } = require('@app/store');
    const auth = store.getState()?.auth;
    return Boolean(auth?.accessToken || auth?.token);
  } catch {
    return false;
  }
};

// Navigate function with correct typing, format, and route protection
export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    if (isProtectedRoute(name) && !checkIsAuthenticated()) {
      reset(0, 'SignIn');
      return;
    }
    navigationRef.navigate(name as any, params);
  }
}

// Replace function with correct typing, format, and route protection
export function replace<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName],
) {
  if (navigationRef.isReady()) {
    if (isProtectedRoute(name) && !checkIsAuthenticated()) {
      reset(0, 'SignIn');
      return;
    }
    navigationRef.dispatch(StackActions.replace(name as any, {params}));
  }
}

// Go back function
export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

// Reset navigation stack
export function reset(index: number, name: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: index,
      routes: [{name: name as any}], // Use 'as any' if there's a type mismatch
    });
  }
}

// Pop function for going back N screens
export function canGoBack(num: number) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.pop(num));
  }
}
