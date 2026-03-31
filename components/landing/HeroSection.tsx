import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  isTablet: boolean;
  onExplorePress: () => void;
};

function HeroSectionBase({ horizontalPadding, isTablet, onExplorePress }: Props) {
  const quickPills = ['Live Events', 'Nearby', 'Top Rated'];

  return (
    <View style={[styles.wrapper, { paddingHorizontal: horizontalPadding }]}> 
      <View style={[styles.card, isTablet ? styles.cardTablet : styles.cardPhone]}>
        <Image
          source={require('@/assets/images/landing/stadium.jpg')}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
          recyclingKey="landing-hero"
          style={styles.image}
        />
        <View style={styles.overlay} />

        <View style={styles.contentWrap}>
          <Text style={styles.overline}>Indian Stadium Guide</Text>
          <Text style={[styles.title, isTablet && styles.titleLarge]}>
            The Ultimate <Text style={styles.titleAccent}>Stadium</Text> Companion
          </Text>
          <Text style={styles.body}>
            Interactive guides for India&apos;s iconic sports venues, from legendary match history to live-day information.
          </Text>

          <View style={styles.quickPillsWrap}>
            {quickPills.map((pill) => (
              <Pressable
                key={pill}
                onPress={() => Alert.alert('Coming Soon', `${pill} module will be wired in the next phase.`)}
                android_ripple={{ color: 'rgba(238, 235, 221, 0.24)' }}
                style={({ pressed }) => [styles.quickPill, pressed && styles.ctaPressed]}>
                <Text style={styles.quickPillText}>{pill}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={onExplorePress}
              android_ripple={{ color: 'rgba(238, 235, 221, 0.22)' }}
              hitSlop={6}
              style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
              <Ionicons name="compass-outline" size={15} color={landingColors.blush} />
              <Text style={styles.ctaText}>Explore Stadiums</Text>
            </Pressable>

            <Pressable
              onPress={() => Alert.alert('Coming Soon', 'Quick tour will be connected in the next phase.')}
              android_ripple={{ color: 'rgba(238, 235, 221, 0.22)' }}
              hitSlop={6}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.ctaPressed]}>
              <Ionicons name="play-circle-outline" size={16} color={landingColors.blush} />
              <Text style={styles.secondaryText}>Quick Tour</Text>
            </Pressable>
          </View>
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
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: landingColors.plum,
  },
  cardTablet: {
    minHeight: 500,
  },
  cardPhone: {
    minHeight: 420,
  },
  contentWrap: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'flex-end',
    flex: 1,
  },
  overline: {
    color: 'rgba(238, 235, 221, 0.84)',
    fontSize: 10,
    letterSpacing: 2.7,
    textTransform: 'uppercase',
    marginBottom: 12,
    fontFamily: landingFonts.sansMedium,
  },
  title: {
    color: landingColors.blush,
    fontSize: 38,
    lineHeight: 46,
    marginBottom: 12,
    fontFamily: landingFonts.serifRegular,
    fontWeight: '300',
  },
  titleLarge: {
    fontSize: 50,
    lineHeight: 58,
  },
  titleAccent: {
    fontFamily: landingFonts.serifBoldItalic,
    fontWeight: '700',
  },
  body: {
    color: 'rgba(238, 235, 221, 0.86)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
    maxWidth: 520,
    fontFamily: landingFonts.sansRegular,
  },
  quickPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickPillText: {
    color: landingColors.blush,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansMedium,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    flexWrap: 'wrap',
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: landingColors.rose,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctaPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  ctaText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 11,
    fontFamily: landingFonts.sansSemiBold,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.32)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  secondaryText: {
    color: landingColors.blush,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.47)',
  },
});
