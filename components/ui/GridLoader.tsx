import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import { landingColors } from '../landing/theme';

interface GridLoaderProps {
  size?: number;
  color?: string;
  speed?: number;
}

const DOTS_DATA = [
  { bottom: '24%', right: '-35%', delay: -0.48, scale: 0.94 },
  { bottom: '16%', right: '-6%', delay: -0.4, scale: 0.96 },
  { bottom: '8%', right: '23%', delay: -0.32, scale: 0.98 },
  { bottom: '-1%', right: '51%', delay: -0.24, scale: 1.0 },
  { bottom: '38%', right: '-17.5%', delay: -0.4, scale: 0.9 },
  { bottom: '30%', right: '10%', delay: -0.32, scale: 0.92 },
  { bottom: '22%', right: '39%', delay: -0.24, scale: 0.94 },
  { bottom: '14%', right: '67%', delay: -0.16, scale: 0.96 },
  { bottom: '53%', right: '-0.8%', delay: -0.32, scale: 0.86 },
  { bottom: '44.5%', right: '27%', delay: -0.24, scale: 0.88 },
  { bottom: '36%', right: '55.7%', delay: -0.16, scale: 0.9 },
  { bottom: '28.7%', right: '84.3%', delay: -0.08, scale: 0.92 },
  { bottom: '66.8%', right: '15%', delay: -0.24, scale: 0.82 },
  { bottom: '58.8%', right: '43%', delay: -0.16, scale: 0.84 },
  { bottom: '50%', right: '72%', delay: -0.08, scale: 0.86 },
  { bottom: '42%', right: '100%', delay: 0, scale: 0.88 },
];

/**
 * Enhanced 16-dot 'Jump' Loader (Synchronized)
 * Optimized for React Native performance with global animation sync.
 */
export function GridLoader({ 
  size = 100, 
  color = landingColors.rose, 
  speed = 1.5 
}: GridLoaderProps) {
  const containerSize = size * 0.64;
  const dotSize = size * 0.12; // Slightly larger dots for better visibility
  const masterProgress = useSharedValue(0);

  useEffect(() => {
    masterProgress.value = withRepeat(
      withTiming(1, {
        duration: 1000 / (speed / 1.5), // Normalized speed
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [speed]);

  return (
    <View style={[styles.outerContainer, { width: size, height: size }]}>
      <View style={[styles.innerContainer, { width: containerSize, height: containerSize }]}>
        {DOTS_DATA.map((dot, index) => (
          <GridDot 
            key={`dot-${index}`}
            bottom={dot.bottom}
            right={dot.right}
            offset={Math.abs(dot.delay)} // Delay offset in normalized 0-1 range
            scale={dot.scale}
            dotSize={dotSize}
            color={color}
            progress={masterProgress}
          />
        ))}
      </View>
    </View>
  );
}

interface GridDotProps {
  bottom: string;
  right: string;
  offset: number;
  scale: number;
  dotSize: number;
  color: string;
  progress: Animated.SharedValue<number>;
}

function GridDot({ bottom, right, offset, scale, dotSize, color, progress }: GridDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate the normalized time for this specific dot
    const t = (progress.value + offset) % 1;
    
    // Jump animation logic: 0% at bottom, 50% at top, 100% at bottom
    // We use a sine-like interpolation for that smooth ease-in-out feel
    const jumpProgress = Math.sin(t * 2 * Math.PI);
    const translation = jumpProgress * (dotSize * 1.5);

    return {
      transform: [
        { translateY: translation },
        { scale: scale }
      ],
    };
  });

  return (
    <Animated.View 
      style={[
        styles.dot, 
        { 
          bottom, 
          right, 
          width: dotSize, 
          height: dotSize, 
          backgroundColor: color,
          borderRadius: dotSize / 2,
        }, 
        animatedStyle
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  innerContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  dot: {
    position: 'absolute',
  },
});
