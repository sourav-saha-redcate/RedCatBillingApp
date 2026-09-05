import React, { useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';
import Home from '@app/screens/protected/Home';
import BillHistory from '@app/screens/protected/BillHistory';
import DailySummary from '@app/screens/protected/DailySummary';
import Settings from '@app/screens/protected/Settings';
import DrawerModal from '@app/components/common/DrawerModal';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isAndroid = Platform.OS === 'android';
  const isIos = Platform.OS === 'ios';

  // Handle safe area for mobile in-built bottom bar (Android 3-button / gesture bar & iOS Home Indicator)
  const bottomInset = insets.bottom;
  const bottomPadding = bottomInset > 0
    ? (isAndroid ? bottomInset + normalize(4) : bottomInset)
    : (isIos ? normalize(14) : normalize(8));

  const tabHeight = (isIos ? normalize(56) : normalize(58)) + (bottomInset > 0 ? bottomInset + (isAndroid ? normalize(4) : 0) : 0);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#0F172A',
          tabBarInactiveTintColor: '#64748B',
          tabBarStyle: [
            styles.tabBarStyle,
            {
              height: tabHeight,
              paddingBottom: bottomPadding,
            },
          ],
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color }) => {
            let iconText = '🧾';
            if (route.name === 'Home') {
              iconText = '🧾';
            } else if (route.name === 'History') {
              iconText = '🕒';
            } else if (route.name === 'Summary') {
              iconText = '📊';
            } else if (route.name === 'Settings') {
              iconText = '⚙️';
            }

            return (
              <Text
                style={[
                  styles.tabIconText,
                  { opacity: focused ? 1 : 0.6, fontSize: normalize(18) },
                ]}>
                {iconText}
              </Text>
            );
          },
        })}>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{ tabBarLabel: 'Billing' }}
        />
        <Tab.Screen
          name="History"
          component={BillHistory}
          options={{ tabBarLabel: 'History' }}
        />
        <Tab.Screen
          name="Summary"
          component={DailySummary}
          options={{ tabBarLabel: 'Summary' }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ tabBarLabel: 'Settings' }}
        />
      </Tab.Navigator>

      <DrawerModal
        isModalVisible={drawerVisible}
        onBackdropPress={() => setDrawerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    paddingTop: normalize(6),
  },

  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalize(4),
  },

  tabBarLabel: {
    fontSize: normalize(10.5),
    fontFamily: Fonts.Figtree_SemiBold,
    fontWeight: '700',
    marginTop: normalize(2),
  },

  tabIconImage: {
    width: normalize(20),
    height: normalize(20),
  },

  tabIconText: {
    fontSize: normalize(16),
  },

  placeholderScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(24),
  },

  placeholderIcon: {
    fontSize: normalize(42),
    marginBottom: normalize(14),
  },

  placeholderTitle: {
    fontSize: normalize(20),
    fontFamily: Fonts.DMSans_18pt_Bold,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: normalize(8),
    textAlign: 'center',
  },

  placeholderSubtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: normalize(18),
  },
});
