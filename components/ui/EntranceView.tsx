import React from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeIn, AnimatedProps } from 'react-native-reanimated';

interface Props extends AnimatedProps<ViewProps> {
  delay?: number;
  duration?: number;
}

/**
 * A simplified entrance wrapper that provides a clean fade-in effect.
 * Replaces the previous staggered slide animations for a smoother, less busy UI.
 */
export function EntranceView({ 
  children, 
  delay = 0, 
  duration = 500, 
  style,
  ...rest 
}: Props) {
  return (
    <Animated.View 
      entering={FadeIn.delay(delay).duration(duration)}
      style={style}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
