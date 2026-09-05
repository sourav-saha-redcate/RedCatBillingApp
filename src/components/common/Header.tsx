import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Colors, Fonts, Icons } from '@app/themes';
import { normalize } from '@app/utils/orientation';
import DrawerModal from './DrawerModal';
import { useAppSelector } from '@app/store';
import { IMAGES_BUCKET_URL } from '@app/utils/constants';

const dailyMessages = [
  'Traveling Today?',
  'Dream Big!',
  'Ready for Adventure?',
  'Go for it!',
  'Get Inspired!',
  'Live your Dreams!',
  'It’s Never Too Late!',
  'Dream Bigger!',
];
const getTodayMessage = () => {
  const today = new Date();
  const dayIndex =
    Math.floor(today.getTime() / (1000 * 60 * 60 * 24)) % dailyMessages.length;
  return dailyMessages[dayIndex];
};

interface HeaderProps {
  userData?: string;
}
const Header: React.FC<HeaderProps> = (): React.JSX.Element => {
  const { userInfo, status } = useAppSelector<any>(state => state.user);
  const navigation = useNavigation<NavigationProp<any>>();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const message = getTodayMessage();

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.name}>Hello, {userInfo?.first_name}</Text>
        <Text style={styles.travelling}>{message}</Text>
      </View>

      <View style={styles.leftContainer}>
        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => navigation.navigate('Notification')}
        >
          <Image
            source={Icons.bell}
            resizeMode="contain"
            style={styles.notificationIcon}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>1</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Menu', { screen: 'Profile' });
          }}
        >
          <Image
            style={styles.profileImg}
            source={
              userInfo?.image
                ? { uri: IMAGES_BUCKET_URL?.profile + userInfo?.image }
                : Icons.blank_user
            }
          />
        </TouchableOpacity>
      </View>
      <DrawerModal
        isModalVisible={openDrawer}
        onBackdropPress={() => setOpenDrawer(false)}
      />
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  bellContainer: {
    marginRight: normalize(10),
    //position: 'relative'
  },
  badge: {
    position: 'absolute',
    right: normalize(12),
    top: normalize(-4),
    backgroundColor: Colors.green46,
    borderRadius: normalize(10),
    height: normalize(16),
    width: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: normalize(7),
    fontFamily: Fonts.Figtree_SemiBold,
  },
  avatar: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
  },
  notificationIcon: {
    width: normalize(20),
    height: normalize(25),
    marginRight: normalize(10),
  },
  greenView: {
    width: normalize(7),
    height: normalize(7),
    borderRadius: normalize(8),
    top: normalize(10),
    position: 'absolute',
    right: normalize(10),
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? normalize(30) : normalize(0),
    marginHorizontal: normalize(12),
  },
  profileImg: {
    height: normalize(37),
    width: normalize(37),
    borderRadius:normalize(20)
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: Fonts.Figtree_Regular,
    color: '#282C32',
    fontSize: normalize(14),
  },
  travelling: {
    fontFamily: Fonts.Figtree_Medium,
    color: Colors.light_black,
    fontSize: normalize(21),
  },
});
