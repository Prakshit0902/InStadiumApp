import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeIn } from 'react-native-reanimated';
import { landingColors, landingFonts } from '@/components/landing/theme';

const AnimatedImage = Animated.createAnimatedComponent(Image);

type Props = {
  imageSource: string | number;
  name: string;
  city: string;
  state?: string;
  capacity?: number;
  builtYear?: number;
  sportsLabel: string;
};

export function StadiumHeroSection({ imageSource, name, city, state, capacity, builtYear, sportsLabel }: Props) {
  return (
    <View style={styles.wrap}>
      <AnimatedImage source={imageSource} style={styles.image} contentFit="cover" entering={FadeIn.duration(500)} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.kicker}>{city}{state ? `, ${state}` : ''}</Text>
        <Text style={styles.title}>{name}</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Capacity</Text>
            <Text style={styles.statValue}>{capacity ? capacity.toLocaleString('en-IN') : 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Built</Text>
            <Text style={styles.statValue}>{builtYear || 'N/A'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Sports</Text>
            <Text style={styles.statValue}>{sportsLabel || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 420,
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.45)',
  },
  content: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  kicker: {
    color: 'rgba(238, 235, 221, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 6,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.blush,
    fontSize: 42,
    lineHeight: 46,
    marginBottom: 12,
    fontFamily: landingFonts.serifRegular,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statItem: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(27, 23, 23, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.2)',
  },
  statLabel: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 8,
    fontFamily: landingFonts.sansSemiBold,
  },
  statValue: {
    color: landingColors.blush,
    fontSize: 12,
    marginTop: 2,
    fontFamily: landingFonts.sansMedium,
  },
});
