import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { SlideButtonCommonProps } from './SlideButton';
export interface SlideButtonTextProps extends Omit<SlideButtonCommonProps, 'autoReset' | 'autoResetDelay' | 'animation' | 'animationDuration' | 'endReached'> {
    title: string;
    titleStyle?: StyleProp<TextStyle>;
    titleContainerStyle?: StyleProp<ViewStyle>;
}
declare const _default: React.MemoExoticComponent<({ title, titleStyle, titleContainerStyle, height, borderRadius, padding, translateX, scrollDistance }: SlideButtonTextProps) => JSX.Element>;
export default _default;
