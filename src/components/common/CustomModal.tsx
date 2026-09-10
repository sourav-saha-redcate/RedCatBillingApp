import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import Colors from '../../themes/Colors';
import { normalize } from '@app/utils/orientation';
import { Icons } from '@app/themes';

interface CustomModalProps {
  isModalVisible?: boolean;
  children: ReactNode;
  onBackdropPress?: () => void;
  width?: any;
  scrollViewRef?: React.RefObject<any>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

const CustomModal: FC<CustomModalProps> = ({
  isModalVisible = false,
  onBackdropPress = () => {},
  children,
  width = '100%',
  scrollViewRef,
  contentContainerStyle,
  testID,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const contextInsets = React.useContext(SafeAreaInsetsContext);
  const insets = contextInsets ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const isDesktop = windowWidth >= 768;

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  const fallbackScrollRef = useRef<ScrollView>(null);
  const activeScrollRef = scrollViewRef || fallbackScrollRef;

  useEffect(() => {
    if (!isModalVisible) {
      setKeyboardHeight(0);
      setVisualViewportHeight(null);
      return;
    }

    const onKeyboardShow = (e: any) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardHeight(height);
      setTimeout(() => {
        activeScrollRef.current?.scrollToEnd?.({ animated: true });
      }, 100);
    };

    const onKeyboardHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onKeyboardShow,
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onKeyboardHide,
    );

    // Support window.visualViewport in mobile web / browser environments
    let cleanupViewport: (() => void) | undefined;
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleViewportChange = () => {
        if (window.visualViewport) {
          const vpHeight = window.visualViewport.height;
          const doc = (globalThis as any).document;
          const winHeight =
            window.innerHeight || doc?.documentElement?.clientHeight || vpHeight;
          setVisualViewportHeight(vpHeight);
          const diff = Math.max(0, winHeight - vpHeight);
          if (diff > 80) {
            setKeyboardHeight(diff);
          } else {
            setKeyboardHeight(0);
          }
        }
      };

      handleViewportChange();
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);

      cleanupViewport = () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      };
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (cleanupViewport) {
        cleanupViewport();
      }
    };
  }, [isModalVisible]);

  const isKeyboardOpen = keyboardHeight > 0;
  const availableScreenHeight =
    visualViewportHeight !== null && visualViewportHeight > 0
      ? Math.min(visualViewportHeight, windowHeight)
      : windowHeight;

  const crossHeight = normalize(32);
  const crossMargin = isKeyboardOpen ? normalize(8) : normalize(16);
  const topSafePadding = Math.max(insets.top, normalize(12));

  // Dynamic max height so modal content never overflows the screen or gets pushed off top
  const maxModalHeight = isDesktop
    ? Math.min(normalize(560), windowHeight - 80)
    : Math.max(
        normalize(320),
        availableScreenHeight -
          (isKeyboardOpen ? keyboardHeight : 0) -
          topSafePadding -
          crossHeight -
          crossMargin -
          normalize(16),
      );

  const webViewportStyle =
    Platform.OS === 'web'
      ? ({
          minHeight: '100dvh',
          height: '100dvh',
        } as any)
      : undefined;

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onBackdropPress}
      statusBarTranslucent={true}
      testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <View
          style={[
            styles.overlay,
            isDesktop ? styles.overlayDesktop : styles.overlayMobile,
            webViewportStyle,
          ]}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              onBackdropPress();
            }}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.keyboardAvoidingContainer}>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                onBackdropPress();
              }}
              style={[
                styles.crossContainer,
                isDesktop && styles.desktopCrossContainer,
                isKeyboardOpen && styles.keyboardOpenCrossContainer,
              ]}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Image
                resizeMode="contain"
                source={Icons.cross}
                style={styles.crossIcon}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.customModalContainer,
                {
                  width: isDesktop
                    ? Math.min(windowWidth * 0.9, normalize(460))
                    : width,
                  maxHeight: maxModalHeight,
                },
                isDesktop && styles.desktopModalContainer,
                !isDesktop && !isKeyboardOpen && {
                  paddingBottom:
                    insets.bottom > 0 ? insets.bottom : normalize(20),
                },
              ]}>
              <ScrollView
                ref={activeScrollRef}
                style={styles.modalScrollView}
                contentContainerStyle={[
                  styles.modalScrollContent,
                  contentContainerStyle,
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                bounces={false}>
                {children}
              </ScrollView>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMobile: {
    justifyContent: 'flex-end',
  },
  overlayDesktop: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  keyboardAvoidingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  customModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(25),
    borderTopRightRadius: normalize(25),
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  desktopModalContainer: {
    borderRadius: normalize(20),
    paddingBottom: normalize(24),
    shadowOffset: { width: 0, height: 4 },
  },
  modalScrollView: {
    width: '100%',
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingTop: normalize(20),
    paddingBottom: normalize(24),
    flexGrow: 1,
  },
  crossContainer: {
    alignSelf: 'center',
    marginBottom: normalize(16),
  },
  desktopCrossContainer: {
    marginBottom: normalize(12),
  },
  keyboardOpenCrossContainer: {
    marginBottom: normalize(8),
  },
  crossIcon: {
    height: normalize(32),
    width: normalize(32),
  },
});
