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
  ImageProps,
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
  leftIcon?: number;
  iconStyle?: ImageStyle;
  onLeftIconPress?: () => void;
  isCountry?: boolean;
  iconWrapperStyle?: ViewStyle;
  flag?: string;
  onflagPress?: () => void;
  countryCode?: string;
  onEndEditing?: () => void;
  borderRadius?: number;
  rightIcon?: ImageProps;
  onRightIconPress?: () => void;
  onFocus?: () => void;
  isHome?: boolean;
}

const SearchInput: FC<TextInputProps> = ({
  value,
  onChangeText = () => {},
  keyboardType = 'default',
  secureTextEntry = false,
  placeholder = '',
  placeholderColor = Colors.text_color,
  editable = true,
  width = '100%',
  height = normalize(55),
  backgroundColor = Colors.white,
  textAlign = 'left',
  fontSize = normalize(12),
  tintColor = '',
  borderRadius = moderateScale(35),
  maxLength,
  marginVertical = moderateScale(7),
  leftIcon,
  iconStyle,
  onLeftIconPress,
  iconWrapperStyle,
  onEndEditing,
  rightIcon,
  isHome,
  onRightIconPress,
  onFocus,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const containerStyle: StyleProp<ViewStyle | any> = {
    width: typeof width === 'number' ? width : `${width}`,
    height,
    backgroundColor,
    marginVertical,
    borderRadius,
    paddingHorizontal: horizontalScale(18),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: normalize(0.5),
    borderColor: Colors.border_color,
    shadowColor: 'rgba(199, 199, 199, 0.19)',
    shadowOpacity: 0.6,
    elevation: 6,
    shadowRadius: normalize(5),
    shadowOffset: { height: 1, width: 1 },
  };

  return (
    <View style={containerStyle}>
      <View style={{ width: rightIcon ? '93%' : '100%' }}>
        <View style={styles.flexView}>
          {leftIcon && (
            <View
              // onPress={onLeftIconPress}
              style={[styles.iconWrapper, iconWrapperStyle]}
            >
              <Image
                resizeMode="contain"
                source={leftIcon}
                style={[styles.icon, { tintColor }, iconStyle]}
              />
            </View>
          )}
          {isHome ? (
            <TouchableOpacity style={styles.View} onPress={onFocus}>
              <Text
                style={[
                  {
                    fontSize,
                    color: Colors.placeholder,
                    fontFamily: Fonts.Figtree_Medium,
                  },
                ]}
              >
                {placeholder}
              </Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              onEndEditing={onEndEditing}
              value={value}
              editable={editable}
              maxLength={maxLength}
              onChangeText={onChangeText}
              secureTextEntry={isSecure}
              placeholder={placeholder}
              placeholderTextColor={placeholderColor}
              keyboardType={keyboardType}
              style={[
                styles.input,
                {
                  textAlignVertical: 'center',
                  fontSize,
                  color: Colors.text_color,
                  height: '100%',
                },
              ]}
              onFocus={onFocus}
            />
          )}
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
            style={[styles.icon1, iconStyle,{ tintColor: Colors.button_color }]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchInput;

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontFamily: Fonts.Figtree_Bold,
    marginTop: Platform.OS === 'android' ? normalize(2) : normalize(0),
    marginLeft: Platform.OS === 'android' ? normalize(-3) : normalize(0),
    height: normalize(30),
  },
  View: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? normalize(2) : normalize(0),
    marginLeft: Platform.OS === 'android' ? normalize(-3) : normalize(0),
    height: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: normalize(18),
    height: normalize(18),
    marginRight: normalize(10),
  },
  icon1: {
    width: normalize(22),
    height: normalize(22),
    marginRight: normalize(10),
  },
  flexView: {
    flexDirection: 'row',
    marginTop: normalize(3),
    alignItems: 'center',
  },
  down_arrow: {
    height: normalize(15),
    width: normalize(15),
    marginHorizontal: normalize(5),
  },
});
