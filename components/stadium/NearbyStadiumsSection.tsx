import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { NearbyStadium } from './types';
import { firstGalleryUrl } from './utils';

type Props = {
  stadiums: NearbyStadium[];
};

export function NearbyStadiumsSection({ stadiums }: Props) {
  const router = useRouter();

  if (stadiums.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={250}>
      <View style={styles.section}>
        <SectionHeader kicker="Nearby" title="Recommended Arenas" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyList}>
          {stadiums.map((item) => (
            <Pressable key={item.id} style={styles.nearbyCard} onPress={() => router.push((`/stadium/${item.id}` as never))}>
              <Image source={getLocalStadiumImage(firstGalleryUrl(item.galleryImages))} style={styles.nearbyImage} />
              <View style={styles.nearbyOverlay} />
              <View style={styles.nearbyContent}>
                <Text style={styles.nearbyDistance}>
                  {typeof item.distanceKm === 'number' ? `${item.distanceKm.toFixed(1)} km` : item.city}
                </Text>
                <Text style={styles.nearbyName}>{item.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nearbyList: {
    gap: 12,
    paddingRight: 10,
    paddingTop: 4,
  },
  nearbyCard: {
    width: 262,
    height: 186,
    borderRadius: 18,
    overflow: 'hidden',
  },
  nearbyImage: {
    ...StyleSheet.absoluteFillObject,
  },
  nearbyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.35)',
  },
  nearbyContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },
  nearbyDistance: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(129, 0, 0, 0.45)',
    color: landingColors.blush,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  nearbyName: {
    color: landingColors.blush,
    fontSize: 26,
    lineHeight: 30,
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
  },
});
