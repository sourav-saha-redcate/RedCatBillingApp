import React, { FC, ReactNode } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Colors from '../../themes/Colors';
import { normalize } from '@app/utils/orientation';
import { Icons } from '@app/themes';

interface CustomModalProps {
  isModalVisible?: boolean;
  children: ReactNode;
  onBackdropPress?: () => void;
  width?: any;
}

const CustomModal: FC<CustomModalProps> = ({
  isModalVisible = false,
  onBackdropPress = () => {},
  children,
  width = '100%',
}) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onBackdropPress}
      statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingContainer}>
          <TouchableOpacity
            onPress={onBackdropPress}
            style={styles.crossContainer}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Image
              resizeMode="contain"
              source={Icons.cross}
              style={styles.crossIcon}
            />
          </TouchableOpacity>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.customModalContainer, { width }]}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  keyboardAvoidingContainer: {
    width: '100%',
  },
  customModalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: normalize(25),
    borderTopRightRadius: normalize(25),
    overflow: 'hidden',
    alignSelf: 'center',
    paddingVertical: normalize(24),
    maxHeight: normalize(520),
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  crossContainer: {
    alignSelf: 'center',
    marginBottom: normalize(16),
  },
  crossIcon: {
    height: normalize(32),
    width: normalize(32),
  },
});
