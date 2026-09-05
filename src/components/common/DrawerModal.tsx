import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React from 'react';
import Icons from '../../themes/Icons';
import { useNavigation } from '@react-navigation/native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Images } from '@app/themes';

export type DrawerItem = {
  id: string;
  title: String;
  onpress: () => void;
  name?: string;
};

const DrawerModal = (props: any) => {
  const { isModalVisible = false, onBackdropPress } = props;
  const navigation = useNavigation<any>();

  const timer: number = 300;

  const menu: DrawerItem[] = [
    {
      id: '1',
      title: 'Our Story',
      onpress: () => {
        onBackdropPress();
        setTimeout(() => {
          navigation.navigate('TabNavigator', {
            screen: 'Menu',
            params: {
              screen: 'OurStory',
            },
          });
        }, timer);
      },
    },
    {
      id: '2',
      title: 'Contact Us',
      onpress: () => {
        onBackdropPress();
        setTimeout(() => {
          navigation.navigate('TabNavigator', {
            screen: 'Menu',
            params: {
              screen: 'ContactUs',
            },
          });
        }, timer);
      },
    },
  ];

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onBackdropPress}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.drawerContainer]}>
          <SafeAreaView style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={onBackdropPress}
              style={styles.crossContainer}
              activeOpacity={0.7}
            >
              <Image
                resizeMode="contain"
                source={Icons.cross_green}
                style={styles.crossIcon}
              />
            </TouchableOpacity>
            <Image
              source={Images.logo}
              resizeMode="contain"
              style={styles.logoIcon}
            />
            <View style={[styles.drawerInsideView]}>
              <FlatList
                data={menu}
                keyExtractor={item => item.id}
                style={[styles.drawerScrollView]}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <>
                    {index === 0 && <View style={styles.horiBar} />}
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() => item.onpress()}
                    >
                      <Text style={[styles.drawerItemText]}>{item.title}</Text>
                      <View style={styles.horiBar} />
                    </TouchableOpacity>
                  </>
                )}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default DrawerModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawerContainer: {
    backgroundColor: Colors.white,
    width: '70%',
    height: '100%',
    borderTopRightRadius: normalize(20),
    borderBottomRightRadius: normalize(20),
    paddingTop: normalize(10),
  },
  drawerInsideView: {
    flex: 1,
    marginHorizontal: normalize(15),
  },
  drawerScrollView: {
    marginTop: normalize(10),
    marginBottom: normalize(15),
  },
  drawerItemText: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Medium,
    color: Colors.light_black,
  },
  flexView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossContainer: {
    alignItems: 'flex-end',
    marginRight: normalize(15),
  },
  crossIcon: {
    height: normalize(23),
    width: normalize(23),
  },
  logoIcon: {
    height: normalize(40),
    width: normalize(140),
    alignSelf: 'center',
    marginTop: normalize(10),
  },
  horiBar: {
    height: normalize(0.5),
    width: '100%',
    backgroundColor: Colors.f4,
    marginVertical: normalize(15),
  },
});
