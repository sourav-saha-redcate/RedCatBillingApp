import { View, Text, Image, StyleSheet, useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import { Icons, Images } from '@app/themes';

const Splash: React.FC<{ navigation: any }> = ({ navigation }) => {
  // const AuthReducer = useAppSelector(state => state.auth);
  // const dispatch = useDispatch();
  // const storeData = async () => {
  //   const data = await AsyncStorage.getItem('isInstalled');
  //   dispatch(checkInstalled(data));
  // };

  // useEffect(() => {
  //   storeData();
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('GetStarted');
    }, 2000);
  }, []);

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
