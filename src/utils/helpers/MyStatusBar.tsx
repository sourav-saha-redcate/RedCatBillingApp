import Colors from '@app/themes/Colors';
import React from 'react';
import {
  StatusBar,
  SafeAreaView,
  View,
  StatusBarProps,
  ViewStyle,
} from 'react-native';

const STATUSBAR_HEIGHT = StatusBar.currentHeight;

interface MyStatusBarProps extends StatusBarProps {
  backgroundColor?: string;
  height?: number;
}

const MyStatusBar: React.FC<MyStatusBarProps> = ({
  backgroundColor = Colors.white,
  height,
  ...props
}) => (
  <View
    style={[
      {
        height: height ?? STATUSBAR_HEIGHT,
        backgroundColor,
      } as ViewStyle,
    ]}>
    <SafeAreaView>
      <StatusBar
        barStyle={props?.barStyle ? props?.barStyle : 'dark-content'}
        {...(props as any)}
      />
    </SafeAreaView>
  </View>
);

export default MyStatusBar;

