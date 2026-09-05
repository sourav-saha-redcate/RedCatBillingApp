import { FlatList, Image, ImageBackground, ImageSourcePropType, ListRenderItem, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Icons } from '@app/themes';
import { useAppDispatch, useAppSelector } from '@app/store';
import { normalize } from '@app/utils/orientation';
import styles from './style';

type Item1 = {
  id: string;
  title: string;
  image: ImageSourcePropType;
 // onPress: () => void;
};
const SideMenu : React.FC<{ navigation: any }> = ({ navigation }) =>  {


  const dummyData1: Item1[] = [
    {
      id: '1',
      title: 'Change password',
      image: Icons.mail,
      // onPress: () => {
      //  // navigation.navigate('ChangePassword');
      // },
    },
    {
      id: '2',
      title: 'Notification settings',
      image: Icons.mail,
      // onPress: () => {
      //  // navigation.navigate('NotoficationSetting');
      // },
    },
    {
      id: '3',
      title: 'Invite Friends',
    image: Icons.mail,
      // onPress: () => {
      //   //navigation.navigate('InviteFriends');
      // },
    },
    {
      id: '4',
      title: 'Terms & conditions',
     image: Icons.mail,
      // onPress: () => {
      //  // navigation.navigate('TermsAndConditions');
      // },
    },

  ];

  const myCompleterenderItem: ListRenderItem<Item1> = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        //item?.onPress();
      }}
    >
      <ImageBackground
        imageStyle={{ borderRadius: normalize(10) }}
        style={[styles.renderContainer]}
        resizeMode="cover"
        source={Icons.rectangle}
      >
        <View style={styles.flexView}>
          <Image
            resizeMode="contain"
            source={item?.image}
            style={styles.imahe}
          />
          <Text style={styles.title}>{item?.title}</Text>
        </View>
        {/* <Image
          resizeMode="contain"
          source={Icons.arrow_down}
          style={styles.arrow}
        /> */}
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
    
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileView}>
          <TouchableOpacity
            //onPress={() => navigation.navigate('EditProfile')}
            style={styles.editView}
          >
            <Image
              resizeMode="contain"
              source={Icons.mail}
              style={styles.editIcon}
            />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <Image
            source={
                Icons.profile
            //   userInfo?.image
            //     ? { uri: IMAGES_BUCKET_URL.profile + userInfo?.image }
            //     : Icons.blank_user
            }
            style={styles.userIcon}
          />
          <Text style={styles.name}>sourav</Text>
          <View style={[styles.flexView, styles.emailView]}>
            <Image
              resizeMode="contain"
              source={Icons.mail}
              style={styles.smsIcon}
            />
            <Text style={styles.email}>souravsaha</Text>
          </View>
     
          </View>
         
      
        <View style={styles.mainView}>
          <FlatList
            data={dummyData1}
            renderItem={myCompleterenderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
   
   
    </View>
  );
}

export default SideMenu

