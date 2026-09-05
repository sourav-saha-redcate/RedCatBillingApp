import React, { FC, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
  ImageStyle,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import {
  horizontalScale,
  moderateScale,
  normalize,
  verticalScale,
} from '@utils/orientation';
import { Colors, Fonts, Icons } from '@app/themes';

interface TextInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  placeholder?: string;
  placeholderColor?: string;
  editable?: boolean;
  width?: string | number;
  height?: number;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  tintColor?: string;
  maxLength?: number;
  marginVertical?: number;
  rightIcon?: number;
  iconStyle?: ImageStyle;
  onRightIconPress?: () => void;
  isCountry?: boolean;
  iconWrapperStyle?: ViewStyle;
  flag?: string;
  onflagPress?: () => void;
  countryCode?: string;
  onEndEditing?: () => void;
}

const Picker: FC<TextInputProps> = ({
  value,
  onChangeText = () => {},
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder = '',
  placeholderColor = Colors.text_color,
  editable = true,
  width = '100%',
  height = normalize(52),
  backgroundColor = Colors.white,
  textAlign = 'left',
  fontSize = normalize(12),
  tintColor = Colors.sky_blue,
  maxLength,
  marginVertical = moderateScale(7),
  rightIcon,
  iconStyle,
  onRightIconPress,
  iconWrapperStyle,
  onEndEditing,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    marginVertical,
    borderRadius: moderateScale(15),
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: normalize(0.5),
    borderColor: Colors.border_color,
    shadowColor: Colors.shadow_color,
    shadowOpacity: 0.4,
    shadowRadius: normalize(10),
    elevation: 6,
  };

  return (
    <TouchableOpacity style={containerStyle}>
      <View style={{ width: secureTextEntry || rightIcon ? '90%' : '100%' }}>
        <View style={styles.flexView}>
          <TextInput
            onEndEditing={onEndEditing}
            value={value}
            editable={false}
            maxLength={maxLength}
            onChangeText={onChangeText}
            secureTextEntry={isSecure}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            keyboardType={keyboardType}
            style={[
              styles.input,
              { textAlign, fontSize, color: Colors.text_color },
            ]}
          />
        </View>
      </View>
      {rightIcon && (
        <TouchableOpacity
          onPress={onRightIconPress}
          style={[styles.iconWrapper, iconWrapperStyle]}
        >
          <Image
            resizeMode="contain"
            source={rightIcon}
            style={[styles.icon, { tintColor }, iconStyle]}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default Picker;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: Fonts.Figtree_Regular,
    marginTop: Platform.OS === 'android' ? normalize(-10) : normalize(0),
    marginLeft: Platform.OS === 'android' ? normalize(-3) : normalize(0),
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(12),
  },
  icon: {
    width: normalize(18),
    height: normalize(18),
  },
  heading: {
    fontFamily: Fonts.Figtree_Medium,
    color: Colors.light_black,
    fontSize: normalize(12),
  },
  flexView: {
    flexDirection: 'row',
    marginTop: normalize(3),
    alignItems: 'center',
  },
  flag: {
    height: normalize(15),
    width: normalize(15),
    marginRight: normalize(6),
  },
  down_arrow: {
    tintColor: Colors.tint_color,
    height: normalize(15),
    width: normalize(15),
    marginHorizontal: normalize(5),
  },
});
