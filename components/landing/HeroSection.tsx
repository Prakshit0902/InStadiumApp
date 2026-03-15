import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  isTablet: boolean;
  onExplorePress: () => void;
};

function HeroSectionBase({ horizontalPadding, isTablet, onExplorePress }: Props) {
  return (
    <View style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}> 
      <View style={[styles.left, isTablet ? styles.leftDesktop : styles.leftMobile]}>
        <Text style={styles.overline}>Indian Stadium Guide - Discover the Roar</Text>
        <Text style={[styles.title, isTablet && styles.titleLarge]}>
          The Ultimate <Text style={styles.titleAccent}>Stadium</Text> Companion
        </Text>
        <Text style={styles.body}>
          Interactive guides for India&apos;s most iconic sports venues. From historical matches back to the latest live scores,
          we&apos;ve got you covered.
        </Text>

        <Pressable
          onPress={onExplorePress}
          android_ripple={{ color: 'rgba(238, 235, 221, 0.22)' }}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
          <Text style={styles.ctaText}>Explore Stadiums</Text>
        </Pressable>
      </View>

      <View style={[styles.right, isTablet ? styles.rightDesktop : styles.rightMobile]}>
        <View style={styles.imageFrame}>
          <Image
            source={require('@/assets/images/landing/stadium.jpg')}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={220}
            style={styles.image}
          />
          <View style={styles.overlay} />
        </View>
      </View>
    </View>
  );
}

export const HeroSection = memo(HeroSectionBase);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: landingColors.blush,
    paddingTop: 8,
  },
  left: {
    justifyContent: 'center',
  },
  leftDesktop: {
    paddingTop: 80,
    paddingBottom: 56,
  },
  leftMobile: {
    paddingTop: 34,
    paddingBottom: 28,
  },
  overline: {
    color: landingColors.subtle,
    fontSize: 10,
    letterSpacing: 2.7,
    textTransform: 'uppercase',
    marginBottom: 20,
    fontFamily: landingFonts.sansMedium,
  },
  title: {
    color: landingColors.plum,
    fontSize: 44,
    lineHeight: 52,
    marginBottom: 24,
    fontFamily: landingFonts.serifRegular,
  },
  titleLarge: {
    fontSize: 56,
    lineHeight: 64,
  },
  titleAccent: {
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
  },
  body: {
    color: landingColors.muted,
    fontSize: 16,
    lineHeight: 27,
    marginBottom: 24,
    maxWidth: 620,
    fontFamily: landingFonts.sansRegular,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: landingColors.rose,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 11,
    fontFamily: landingFonts.sansSemiBold,
  },
  right: {
    backgroundColor: landingColors.plum,
    padding: 14,
    borderRadius: 26,
    marginBottom: 8,
  },
  rightDesktop: {
    minHeight: 520,
  },
  rightMobile: {
    minHeight: 350,
  },
  imageFrame: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.22)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.18)',
  },
});
