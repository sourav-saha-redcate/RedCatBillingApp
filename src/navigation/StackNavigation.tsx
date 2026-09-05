import React, { useEffect, useState } from 'react';
import {
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {
  createStackNavigator,
  StackScreenProps,
} from '@react-navigation/stack';
import { navigationRef } from './RootNaivgation';
import { RootStackParamList } from '@app/types';
import Splash from '@app/screens/public/auth/Splash';
import GetStarted from '@app/screens/public/auth/GetStarted';
import SignIn from '@app/screens/public/auth/SignIn';
import SignUp from '@app/screens/public/auth/SignUp';
import ChooseStoreType from '@app/screens/public/auth/ChooseStoreType';
import StoreSetup from '@app/screens/public/auth/StoreSetup';
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

export default function StackNavigation() {
  const [isLoading, setIsLoading] = useState(true);
  // const isToken = useAppSelector(state => state.auth.token);
  // const isInstalled = useAppSelector(state => state.auth.isInstalled);
  // const { onBoardingProgress, isProfileComplete } = useAppSelector<any>(
  //   state => state.auth,
  // );
  // const dispatch = useAppDispatch();

  const AuthScreens = {
    Splash: Splash,
    GetStarted: GetStarted,
    SignIn: SignIn,
    SignUp: SignUp,
    ChooseStoreType: ChooseStoreType,
    RegisterStore: ChooseStoreType,
    StoreSetup: StoreSetup,
    TabNavigator: TabNavigator,
    SideMenu: SideMenu,
    BillHistory: BillHistory,
    BillPreview: BillPreview,
    NewBill: NewBill,
    Settings: Settings,
    DailySummary: DailySummary,
    // Home:Home,
    // Gallery:Gallery,
    // SearchProduct:SearchProduct,
    // PrimerProduct:PrimerProduct,
    // CollorCatalogue:CollorCatalogue,
  };

  const MainScreens = {};

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsLoading(false); // End splash after 1.5 seconds
  //   }, 1500);

  //   return () => clearTimeout(timer);
  // }, []);

  // if (isLoading) {
  //   return <Splash navigation={undefined} />;
  // }

  const Screens = AuthScreens;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {Object.entries(Screens).map(([name, component], index) => (
          <Stack.Screen
            key={index}
            name={name as keyof RootStackParamList} // Casting the name to RootStackParamList keys
            component={
              component as React.ComponentType<
                StackScreenProps<RootStackParamList>
              >
            }
            options={{ gestureEnabled: false }}
          />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
