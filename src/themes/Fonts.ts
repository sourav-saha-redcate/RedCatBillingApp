import { Platform } from 'react-native';

const Fonts = {
  Figtree_Bold: 'Figtree-Bold',
  Figtree_ExtraBold: 'Figtree-ExtraBold',
  Figtree_Light: 'Figtree-Light',
  Figtree_Medium: 'Figtree-Medium',
  Figtree_Regular: 'Figtree-Regular',
  Figtree_SemiBold: 'Figtree-SemiBold',
  DMSans_18pt_Bold:
    Platform.OS === 'android' ? 'DMSans_18pt-Bold' : 'DMSans18pt-Bold',
  DMSans_18pt_ExtraBold:
    Platform.OS === 'android'
      ? 'DMSans_18pt-ExtraBold'
      : 'DMSans18pt-ExtraBold',
  DMSans_18pt_Medium:
    Platform.OS === 'android' ? 'DMSans_18pt-Medium' : 'DMSans18pt-Medium',
  DMSans_18pt_Regular:
    Platform.OS === 'android' ? 'DMSans_18pt-Regular' : 'DMSans18pt-Regular',
  DMSans_18pt_SemiBold:
    Platform.OS === 'android' ? 'DMSans_18pt-SemiBold' : 'DMSans18pt-SemiBold',
};

export default Fonts;
