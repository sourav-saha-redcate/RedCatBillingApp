import React, { useRef, useState } from 'react';
import {
  Image,
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icons from '../../themes/Icons';
import Fonts from '../../themes/Fonts';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { normalize } from '@app/utils/orientation';
//import { bothColors, LightColors, useColors } from '@app/themes';
import { useAppSelector } from '@app/store';
import { Colors } from '@app/themes';

interface CustomDropdownInterface {
  label?: string;
  optionList: any[];
  placeholder: string;
  value: any;
  setValue: Function;
  labelField?: string;
  valueField?: string;
  containerStyle?: ViewStyle;
  dropDownContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  disable?: boolean;
  isContainerPressable?: boolean;
  onPress?: Function;
  enableSearch?: boolean;
  dropdownPosition?: any;
  restrictionsData?: any[];
  dropDownIconStyle?: ImageStyle;
  multi?: boolean;
}

const CustomDropdown = ({
  label = '',
  optionList = [],
  placeholder = 'Select',
  value,
  setValue,
  labelField = 'label',
  valueField = 'value',
  containerStyle = {},
  dropDownContainerStyle = {},
  disable = false,
  isContainerPressable = false,
  onPress = () => {},
  enableSearch = false,
  dropdownPosition = 'bottom',
  dropDownIconStyle,
  multi = false,
}: CustomDropdownInterface) => {
  //const Colors = useColors();

  const ref = useRef<any>(null);
  const [isDropDown, setIsDropDown] = useState(false);
  const ContainerTag = isContainerPressable ? TouchableOpacity : View;
  const AuthReducer = useAppSelector(state => state.auth);

  return (
    <ContainerTag
      style={[
        styles.container,
        containerStyle,
        { backgroundColor: Colors.white },
      ]}
      onPress={() => onPress()}
      activeOpacity={1}
    >
      <View style={[styles.midContainer]}>
        {multi ? (
          <MultiSelect
            key={label}
            ref={ref}
            data={optionList || []}
            value={value}
            labelField={labelField}
            valueField={valueField}
            renderItem={item => {
              const isSelected = value?.includes(item[valueField]);
              return (
                <View
                  key={item?.[valueField]}
                  style={[
                    styles.dropDownTextContainer,
                    {
                      backgroundColor: isSelected
                        ? Colors.e8_color
                        : Colors.white,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropDownText,
                      { color: isSelected ? Colors.light_black : Colors.grey },
                    ]}
                  >
                    {item?.[labelField]}
                  </Text>
                </View>
              );
            }}
            onChange={(e: any) => {
              // setValue(e);
              setValue(e);
              setIsDropDown(false);
            }}
            selectedTextStyle={[
              styles.dropDownSelectedText,
              { color: Colors.text_color },
            ]}
            placeholder={placeholder}
            placeholderStyle={[styles.dropDownPlaceholderText]}
            containerStyle={[styles.dropDownContainer, dropDownContainerStyle]}
            showsVerticalScrollIndicator={false}
            onFocus={() => {
              setIsDropDown(true);
            }}
            onBlur={() => {
              setIsDropDown(false);
            }}
            disable={disable}
            search={enableSearch}
            searchPlaceholder='search'
            renderRightIcon={() => {
              return null;
            }}
            renderSelectedItem={(item, unSelect) => {
              return(
              
              <View style={[styles.chipContainer]}>
                <Text style={[styles.chipText]}>{item?.[labelField]}</Text>
                <TouchableOpacity onPress={() => unSelect?.(item)}>
                  <Image
                    source={Icons.x}
                    resizeMode="contain"
                    style={styles.chipClose}
                  />
                </TouchableOpacity>
              </View>
            )}}
          />
        ) : (
          <Dropdown
            key={label}
            ref={ref}
            data={optionList || []}
            value={value}
            labelField={labelField}
            valueField={valueField}
            renderItem={item => {
              return (
                <View
                  key={item?.[valueField]}
                  style={[styles.dropDownTextContainer]}
                >
                  <Text style={[styles.dropDownText]}>
                    {item?.[labelField]}
                  </Text>
                </View>
              );
            }}
            onChange={(e: any) => {
              // setValue(e);
              setValue(e[valueField]);
              setIsDropDown(false);
            }}
            selectedTextStyle={[
              styles.dropDownSelectedText,
              { color: Colors.text_color },
            ]}
            placeholder={placeholder}
            placeholderStyle={[styles.dropDownPlaceholderText]}
            containerStyle={[styles.dropDownContainer, dropDownContainerStyle]}
            showsVerticalScrollIndicator={false}
            onFocus={() => {
              setIsDropDown(true);
            }}
            onBlur={() => {
              setIsDropDown(false);
            }}
            disable={disable}
            search={enableSearch}
            autoScroll={false}
            renderRightIcon={() => {
              return null;
            }}
            searchPlaceholder="search"
            searchPlaceholderTextColor={Colors.grey}
            inputSearchStyle={styles.input}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.dropDownIconContainer}
        onPress={() => {
          ref?.current?.open();
        }}
        disabled={disable}
      >
        <Image
          resizeMode="contain"
          source={Icons.arrow_down}
          style={[
            styles.dropDownIcon,
            dropDownIconStyle,
            {
              tintColor: Colors.light_black,
              transform: [{ rotate: isDropDown ? '180deg' : '0deg' }],
            },
          ]}
        />
      </TouchableOpacity>
    </ContainerTag>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  container: {
    minHeight: normalize(50),
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: normalize(12),
    borderRadius: normalize(15),
    paddingVertical: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: normalize(10),
    fontFamily: Fonts.Figtree_Regular,
    marginBottom: normalize(3),
  },
  phoneCode: {
    fontSize: normalize(10),
    fontFamily: Fonts.Figtree_Regular,
  },
  textInput: {
    width: '100%',
    height: normalize(16),
    lineHeight: normalize(16),
    fontSize: normalize(11),
    textAlignVertical: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  rightIcon: {
    height: normalize(10),
    width: normalize(10),
    resizeMode: 'contain',
  },
  passwordIcon: {
    height: normalize(15),
    width: normalize(15),
    resizeMode: 'contain',
  },
  leftIcon: {
    height: normalize(20),
    width: normalize(20),
    resizeMode: 'contain',
  },
  midContainer: { flex: 1, justifyContent: 'center' },
  dropDownContainer: {
    width: '92%',
    marginLeft: normalize(-11),
    borderWidth: 1,
    borderColor: '#F6F8FB',
    maxHeight: normalize(120),
    marginTop: normalize(15),
    borderRadius: normalize(16),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(8),
    backgroundColor: '#FFFFFF',
  },
  dropDownSelectedText: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(11),
  },
  dropDownTextContainer: {
    paddingHorizontal: normalize(10),
    width: '100%',
    paddingVertical: normalize(8),
    backgroundColor: Colors.white,
    borderRadius: normalize(10),
  },
  dropDownText: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(11),
  },
  dropDownPlaceholderText: {
    fontFamily: Fonts.Figtree_Regular,
    fontSize: normalize(11),
    color: Colors.text_color,
  },
  dropDownIconContainer: {
    height: normalize(24),
    width: normalize(24),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropDownIcon: {
    height: normalize(16),
    width: normalize(16),
    resizeMode: 'contain',
  },
  line: {
    height: 1,
    width: '100%',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(4),
    height: normalize(27),
    backgroundColor: Colors.light_black,
    marginTop:normalize(5),
    marginRight:normalize(5)
  },
  chipText: {
    fontFamily: Fonts.Figtree_SemiBold,
    fontSize: normalize(10),
    marginRight: normalize(6),
    color: '#EDEDED',
  },
  chipClose: {
    width: normalize(7),
    height: normalize(7),
  },
  input: {
    borderRadius: normalize(8),
  },
});
