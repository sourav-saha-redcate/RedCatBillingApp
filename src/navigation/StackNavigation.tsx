import React, { useEffect } from 'react';
import {
  NavigationContainer,
  useNavigation,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import {
  navigationRef,
  reset,
  isProtectedRoute,
  checkIsAuthenticated,
} from './RootNaivgation';
import { RootStackParamList } from '@app/types';
import { useAppSelector } from '@app/store';

// Public Screens
import Splash from '@app/screens/public/auth/Splash';
import GetStarted from '@app/screens/public/auth/GetStarted';
import SignIn from '@app/screens/public/auth/SignIn';
import SignUp from '@app/screens/public/auth/SignUp';
import ChooseStoreType from '@app/screens/public/auth/ChooseStoreType';
import StoreSetup from '@app/screens/public/auth/StoreSetup';
import ForgotPassword from '@app/screens/public/auth/ForgotPassword';
import OtpVerification from '@app/screens/public/auth/OtpVerification';
import ResetPassword from '@app/screens/public/auth/ResetPassword';

// Protected Screens
import TabNavigator from './TabNavigation';
import Home from '@app/screens/protected/Home';
import Gallery from '@app/screens/protected/Gallery';
import SearchProduct from '@app/screens/protected/SearchProduct';
import PrimerProduct from '@app/screens/protected/PrimerProduct';
import CollorCatalogue from '@app/screens/protected/CollorCatalogue';
import SideMenu from '@app/screens/protected/SideMenu';
import BillHistory from '@app/screens/protected/BillHistory';
import BillPreview from '@app/screens/protected/BillPreview';
import NewBill from '@app/screens/protected/NewBill';
import Settings from '@app/screens/protected/Settings';
import DailySummary from '@app/screens/protected/DailySummary';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Route guard Higher-Order Component.
 * Ensures that even if a protected screen is directly mounted or accessed,
 * unauthenticated users are immediately blocked and redirected to the Login page.
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
  return function GuardedComponent(props: P) {
    const token = useAppSelector(
      state => state.auth.accessToken || state.auth.token,
    );
    const navigation = useNavigation<any>();

    useEffect(() => {
      if (!token) {
        if (navigation?.reset) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
          });
        } else {
          reset(0, 'SignIn');
        }
      }
    }, [token, navigation]);

    if (!token) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export default function StackNavigation() {
  const token = useAppSelector(
    state => state.auth.accessToken || state.auth.token,
  );
  const isAuthenticated = Boolean(token);

  const ProtectedScreens: Record<string, React.ComponentType<any>> = {
    TabNavigator: withAuthGuard(TabNavigator),
    SideMenu: withAuthGuard(SideMenu),
    BillHistory: withAuthGuard(BillHistory),
    BillPreview: withAuthGuard(BillPreview),
    NewBill: withAuthGuard(NewBill),
    Settings: withAuthGuard(Settings),
    DailySummary: withAuthGuard(DailySummary),
    SearchProduct: withAuthGuard(SearchProduct),
    PrimerProduct: withAuthGuard(PrimerProduct),
    CollorCatalogue: withAuthGuard(CollorCatalogue),
    Home: withAuthGuard(Home),
    Gallery: withAuthGuard(Gallery),
  };

  const PublicScreens: Record<string, React.ComponentType<any>> = {
    SignIn: SignIn,
    Splash: Splash,
    GetStarted: GetStarted,
    SignUp: SignUp,
    ChooseStoreType: ChooseStoreType,
    RegisterStore: ChooseStoreType,
    StoreSetup: StoreSetup,
    ForgotPassword: ForgotPassword,
    OtpVerification: OtpVerification,
    ResetPassword: ResetPassword,
    ChangePassword: ResetPassword,
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        if (!navigationRef.isReady()) return;
        const currentRoute = navigationRef.getCurrentRoute();
        if (
          currentRoute &&
          isProtectedRoute(currentRoute.name) &&
          !checkIsAuthenticated()
        ) {
          reset(0, 'SignIn');
        }
      }}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'TabNavigator' : 'SignIn'}
        screenOptions={{ headerShown: false, gestureEnabled: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            {Object.entries(ProtectedScreens).map(([name, component]) => (
              <Stack.Screen
                key={name}
                name={name as keyof RootStackParamList}
                component={
                  component as React.ComponentType<
                    StackScreenProps<RootStackParamList>
                  >
                }
                options={{ gestureEnabled: false }}
              />
            ))}
          </Stack.Group>
        ) : (
          <Stack.Group>
            {Object.entries(PublicScreens).map(([name, component]) => (
              <Stack.Screen
                key={name}
                name={name as keyof RootStackParamList}
                component={
                  component as React.ComponentType<
                    StackScreenProps<RootStackParamList>
                  >
                }
                options={{ gestureEnabled: false }}
              />
            ))}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
