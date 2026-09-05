import React from 'react';
import {
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
  DimensionValue,
  TouchableOpacity,
} from 'react-native';
import { normalize } from '@app/utils/orientation';
import { Colors, Fonts } from '@app/themes';

interface ButtonProps {
  height?: number;
  width?: string | number;
  activeBackgroundColor?: string;
  inactiveBackgroundColor?: string;
  borderRadius?: number;
  marginRight?: number;
  textColor?: string;
  fontSize?: number;
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  fontFamily?: string;
  marginTop?: number;
  leftIcon?: number;
  rightIcon?: number;
  iconStyle?: StyleProp<ImageStyle>;
  disabled?: boolean;
  backgroundColor?: string;
  justifyContent?: 'center' | 'space-between' | 'space-around' | 'space-evenly';
  borderColor?: string;
}

const Button: React.FC<ButtonProps> = props => {
  const {
    height = normalize(45),
    width = '95%',
    borderRadius = normalize(10),
    textColor = Colors.white,
    fontSize = normalize(13),
    marginRight = normalize(0),
    title,
    onPress = () => {},
    isLoading = false,
    style,
    fontFamily = Fonts.Figtree_Medium,
    marginTop = normalize(14),
    leftIcon,
    rightIcon,
    iconStyle,
    disabled = false,
    backgroundColor = Colors.button_color,
    justifyContent = 'center',
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          width: (typeof width === 'number'
            ? width
            : `${width}`) as DimensionValue,
          height,
          borderRadius,
          marginTop,
          justifyContent: justifyContent ?? 'center',
          backgroundColor,
        },
        style,
        styles.buttonContainer,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <>
          {leftIcon && (
            <Image
              resizeMode="contain"
              source={leftIcon}
              style={[styles.iconStyle, iconStyle]}
            />
          )}
          <Text
            style={[
              {
                fontFamily,
                color: textColor,
                fontSize,
                marginRight: marginRight,
              },
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <Image
              resizeMode="contain"
              source={rightIcon}
              style={[styles.iconStyle, iconStyle]}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    height: normalize(42),
    width: normalize(42),
    resizeMode: 'contain',
    right: normalize(6),
    position: 'absolute',
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default Button;
