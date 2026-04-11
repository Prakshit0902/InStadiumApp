import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { landingColors, landingFonts } from '../landing/theme';
import { GridLoader } from './GridLoader';

interface Props {
  message?: string;
}

export function BrandedLoadingScreen({ message }: Props) {
  return (
    <View style={styles.container}>
      <Animated.View exiting={FadeIn.duration(400)} style={styles.inner}>
        <GridLoader size={70} color={landingColors.blush} speed={1.5} />
        
        {message && (
          <Animated.Text 
            entering={FadeIn.delay(300).duration(600)}
            style={styles.loadingText}
          >
            {message}
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: landingColors.plum,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    minWidth: 54,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#630000',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoBadgeText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 22,
    fontFamily: landingFonts.sansSemiBoldItalic,
  },
  logoWordmark: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    fontSize: 24,
    fontFamily: landingFonts.sansSemiBold,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 10,
    color: 'rgba(238, 235, 221, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: landingFonts.sansMedium,
  },
});
