import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import { Icons, Images } from '@app/themes';
import { useAppDispatch, useAppSelector } from '@app/store';
import { getMeRequest } from '@app/store/slice/auth.slice';

const Splash: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { accessToken, token } = useAppSelector(state => state.auth);
  const activeToken = accessToken || token;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeToken) {
        console.log('[DEBUG BOOTSTRAP] Active session detected, dispatching GET_ME_REQUEST');
        dispatch(getMeRequest());
        navigation.navigate('TabNavigator');
      } else {
        console.log('[DEBUG BOOTSTRAP] No active session, navigating to GetStarted');
        navigation.navigate('GetStarted');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeToken, dispatch, navigation]);

  return (
    <Image
      source={Images.splash}
      style={styles.image}
    />
  );
};

export default Splash;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
});
