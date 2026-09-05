import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  FlatList,
  ListRenderItem,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
  ImageProps,
  useColorScheme,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts, Icons, Images } from '@app/themes';
import KeyboardAvoidingTemplate from '@app/components/template/KeyboardAvoidingTemplate';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@app/components/common/Button';

type Item = {
  id: number;
  heading: string;
  description: string;
  image: ImageProps;
};

const GetStarted: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { width, height } = Dimensions.get('window');
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const [data, setData] = useState<Array<Item>>([
    {
      id: 1,
      heading: 'Bill Anywhere, Anytime',
      description:
        'Experience the freedom of 100% offline billing.Create receipts and manage transactions without needing an internet connection.',
      image: Images.onboarding1,
    },
    {
      id: 2,
      heading:
        'Manage Stock with Ease',
      description:
        'Keep track of your items, monitor low stock levels,and organize your catalog effortlessly to never miss a sale.',
      image: Images.onboarding2,
    },
    {
      id: 3,
      heading:
        'Grow Your Business',
      description:
        'Get powerful insights into your daily sales, staff performance, and customer trends with our comprehensive analytics dashboard.',
      image: Images.onboarding3,
    },
  ]);

  const handleContiPress = () => {
    if (activeIndex < data.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      // storeData();
      // dispatch(checkInstalled('true'));
      navigation.navigate('SignIn');
    }
  };

  useEffect(() => {
    scrollX.setValue(0);
    Animated.timing(scrollX, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  const handleBackPress = () => {
    if (activeIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex - 1,
        animated: true,
      });
    }
  };

  const renderItem: ListRenderItem<Item> = ({ item, index }) => {
    return (
      <View>
        <ImageBackground source={item?.image} style={styles.background}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SignIn');
            }}
            style={[styles.skipView]}
          >
            <Text style={[styles.skip]}>Skip</Text>
          </TouchableOpacity>
        </ImageBackground>

        <View style={[styles.bottomView]}>
          <Text style={[styles.textStyle, { width: index === 2 ? normalize(300) : normalize(285) }]}>{item?.heading}</Text>
          <Text style={[styles.description]}>{item?.description}</Text>
          <View style={styles.spaceView}>
            {/* Pagination Dots */}
            <View>
              <View style={styles.flexView}>
                {data.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          activeIndex == index
                            ? Colors.button_color
                            : Colors.orange,
                        width:
                          activeIndex == index ? normalize(32) : normalize(6),
                        height:
                          activeIndex == index ? normalize(5.5) : normalize(6),
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
            <Button
              width={'50%'}
              marginTop={normalize(0)}
              title={index === 2 ? 'Get Started' : 'Next'}
              onPress={() => {
                handleContiPress();
              }}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingTemplate>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString()}
        horizontal
        bounces={false}
        pagingEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={event => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        showsHorizontalScrollIndicator={false}
        style={styles.mainView}
      />
    </KeyboardAvoidingTemplate>
  );
};

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  background: {
    height: normalize(420),
    width: '100%',
    backgroundColor: Colors.white,
  },
  bottomView: {
    width: normalize(320),
  },
  textStyle: {
    fontSize: normalize(24),
    fontFamily: Fonts.DMSans_18pt_SemiBold,
    textAlign: 'center',
    marginTop: normalize(28),
    color: Colors.text_color,
    alignSelf: 'center',
    textTransform: 'capitalize',
    lineHeight: normalize(30),
  },
  description: {
    fontSize: normalize(13),
    fontFamily: Fonts.Figtree_Regular,
    marginTop: normalize(12),
    textAlign: 'center',
    width: normalize(260),
    lineHeight: normalize(18),
    color: Colors.light_black,
    alignSelf: 'center',
  },
  dot: {
    borderRadius: normalize(10),
    marginHorizontal: normalize(2),
  },
  flexView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: normalize(15),
    marginTop: normalize(25),
  },
  skipView: {
    top: normalize(50),
    right: normalize(12),
    flexDirection: 'row',
    columnGap: normalize(5),
    borderRadius: normalize(20),
    paddingHorizontal: normalize(17),
    paddingVertical: normalize(6),
    alignItems: 'center',
    alignSelf: 'flex-end',
    zIndex: 99,
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  skip: {
    fontFamily: Fonts.Figtree_Medium,
    fontSize: normalize(13),
    color: Colors.white,
  },
});

export default GetStarted;
