import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from 'react-native-reanimated';
const DEFAULT_TEXT_COLOR = '#FAFAFA';

const SlideButtonText = ({
  title,
  titleStyle,
  titleContainerStyle,
  height,
  borderRadius,
  padding,
  translateX,
  scrollDistance
}) => {
  const textAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [0, scrollDistance], [0.99, 0], Extrapolate.CLAMP)
    };
  });
  return /*#__PURE__*/React.createElement(View, {
    testID: "TitleContainer",
    style: [styles.titleContainer, {
      height,
      margin: padding,
      borderRadius
    }, titleContainerStyle]
  }, /*#__PURE__*/React.createElement(Animated.Text, {
    testID: "Title",
    numberOfLines: 2,
    allowFontScaling: false,
    style: [styles.title, titleStyle, textAnimStyle]
  }, title));
};

export default /*#__PURE__*/React.memo(SlideButtonText);
const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    maxWidth: '50%',
    textAlign: 'center',
    color: DEFAULT_TEXT_COLOR
  }
});
//# sourceMappingURL=SlideButtonText.js.map