import { Colors, Fonts } from '@app/themes';
import { Snackbar } from 'react-native-snackbar';

import { Platform, ToastAndroid } from 'react-native';

export const showMessage = (message: string) => {
  if (message !== undefined && message !== '') {
    try {
      return Snackbar.show({
        text: message,
        duration: Snackbar.LENGTH_LONG,
      });
    } catch (e) {
      if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    }
  }
};

export const showMessageCustom = (message: string) => {
  if (message !== undefined && message !== '') {
    return Snackbar.show({
      text: message,
      duration: Snackbar.LENGTH_SHORT,
      backgroundColor: '#F4F7F9', // Light background like in your screenshot
      textColor: Colors.text_color,        // Subtle dark text
      fontFamily: Fonts.Figtree_Medium,        // Optional: ensure it's not bold
    });
  }
};

