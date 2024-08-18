import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { GestureEvent, PanGestureHandlerEventPayload } from 'react-native-gesture-handler';
import { SlideButtonCommonProps } from './SlideButton';
export interface SlideButtonThumbProps extends SlideButtonCommonProps {
    gestureHandler?: ((event: GestureEvent<PanGestureHandlerEventPayload>) => void) | undefined;
    icon?: React.ReactNode;
    thumbStyle?: StyleProp<ViewStyle>;
    animStarted?: () => void;
    animEnded?: () => void;
    isRTL: boolean;
}
declare const _default: React.MemoExoticComponent<({ icon, gestureHandler, translateX, height, padding, endReached, borderRadius, thumbStyle, animStarted, animEnded, isRTL, animation, animationDuration, dynamicResetEnabled, dynamicResetDelaying, }: SlideButtonThumbProps) => JSX.Element>;
export default _default;
