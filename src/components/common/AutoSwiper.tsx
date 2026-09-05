import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  Platform,
  ImageBackground,
  Text,
} from 'react-native';
import { normalize } from '@app/utils/orientation'; // keep your normalize util
import Colors from '@app/themes/Colors'; // adjust import as necessary
import { Fonts } from '@app/themes';
import Button from './Button';

type ViewToken = {
  item: any;
  key: string;
  index: number | null;
  isViewable: boolean;
  section?: any;
};

 
const { width: SCREEN_WIDTH } = Dimensions.get('window');
 
type Props = {
  data: string[]; // array of image file names (e.g. ["a.png","b.png"])
  imageBaseUrl: string; // e.g. IMAGE_URL + '/page-banner/'
  autoPlay?: boolean;
  interval?: number; // seconds
  height?: number;
  showPagination?: boolean;
  paginationActiveColor?: string;
  paginationDefaultColor?: string;
  bannerTitle?: string;
  bannerBtnTitle?: string;
};
 
const AutoSwiper: React.FC<Props> = ({
  data = [],
  imageBaseUrl,
  autoPlay = true,
  interval = 3,
  height = normalize(180),
  showPagination = true,
  paginationActiveColor = Colors.orange,
  paginationDefaultColor = Colors.white,
  bannerTitle,
  bannerBtnTitle,
}) => {
  const flatListRef = useRef<FlatList<any> | null>(null);
  //const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentIndexRef = useRef<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
 
  // Safety: don't run autoplay for <=1 item
  const canAutoPlay = autoPlay && Array.isArray(data) && data.length > 1;
 
  const advance = useCallback(() => {
    if (!flatListRef.current || data.length === 0) return;
    const next = (currentIndexRef.current + 1) % data.length;
    currentIndexRef.current = next;
    flatListRef.current.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  }, [data.length]);
 
  useEffect(() => {
    if (!canAutoPlay || isPaused) return;
 
    // set interval in ms
    timerRef.current = setInterval(() => {
      advance();
    }, interval * 1000);
 
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [advance, canAutoPlay, interval, isPaused]);
 
  useEffect(() => {
    // clear on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
 
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const first = viewableItems[0];
        const idx = first.index ?? 0;
        currentIndexRef.current = idx;
        setCurrentIndex(idx);
      }
    },
  ).current;

 
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;
 
  const handleTouchStart = () => {
    // pause autoplay while user is touching/dragging
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
 
  const handleTouchEnd = () => {
    // resume autoplay after a short delay so user interactions finish
    setTimeout(() => setIsPaused(false), 600);
  };
 
  const keyExtractor = (item: string, index: number) => `${index}-${item}`;
 
  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });
 
  const renderPagination = () => {
    if (!showPagination || data.length <= 1) return null;
    return (
      <View style={styles.paginationContainer}>
        {data.map((_, i) => (
          <View
            key={`dot-${i}`}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentIndex
                    ? paginationActiveColor
                    : paginationDefaultColor,
              },
            ]}
          />
        ))}
      </View>
    );
  };
 
  const renderItem = ({ item }: { item: string }) => {
    const uri = `${imageBaseUrl}${item}`;
    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ImageBackground
          imageStyle={{ borderRadius: normalize(10) }}
          source={{
            uri,
            cache: 'force-cache',
          }}
          resizeMode="cover"
          style={[
            {
              height,
              width: SCREEN_WIDTH - normalize(30),
            },
          ]}
        >
          {bannerTitle ? <Text style={styles.bannerText}>{bannerTitle}</Text> : null}
          {bannerBtnTitle ? (
            <Button
              onPress={() => {}}
              title={bannerBtnTitle}
              width="32%"
              marginTop={normalize(10)}
              activeBackgroundColor={Colors.orange}
              style={{ marginLeft: normalize(30) }}
              height={normalize(35)}
            />
          ) : null}
        </ImageBackground>
      </View>
    );
  };
 
  return (
    <TouchableWithoutFeedback
      onPressIn={handleTouchStart}
      onPressOut={handleTouchEnd}
    >
      <View style={[styles.wrapper, { height }]}>
        <FlatList
          ref={flatListRef}
          data={data}
          horizontal
          pagingEnabled
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsHorizontalScrollIndicator={false}
          getItemLayout={getItemLayout}
          initialScrollIndex={0}
          onScrollToIndexFailed={() => {}}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMomentumScrollEnd={() => {
            // ensure viewableItems logic will update index
          }}
          removeClippedSubviews={false} // sometimes helps with flicker
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        {renderPagination()}
      </View>
    </TouchableWithoutFeedback>
  );
};
 
const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: normalize(10),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: normalize(6),
  },
  dot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(8),
    marginHorizontal: normalize(4),
    opacity: 0.95,
  },
  bannerText: {
    fontSize: normalize(16),
    color: Colors.white,
    fontFamily: Fonts.Figtree_Light,
    textAlign: 'left',
    width: '45%',
    marginLeft: normalize(30),
    marginTop: normalize(20),
    lineHeight: normalize(20),
  },
});
 
export default AutoSwiper;