import { StyleSheet, Text, View } from 'react-native';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { NearbyPlace } from './types';

type Props = {
  places: NearbyPlace[];
};

export function NearbyPlacesSection({ places }: Props) {
  if (places.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={300}>
      <View style={styles.section}>
        <SectionHeader kicker="Around the Arena" title="Nearby Places" />
        {places.map((place, index) => (
          <View key={`${place.name || index}-${index}`} style={styles.row}>
            <Text style={styles.name}>{place.name || 'Landmark'}</Text>
            <Text style={styles.meta}>{[place.type, place.distance].filter(Boolean).join(' • ') || 'Nearby'}</Text>
          </View>
        ))}
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 11,
    marginBottom: 8,
  },
  name: {
    color: landingColors.plum,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: landingFonts.serifRegular,
  },
  meta: {
    color: landingColors.subtle,
    fontSize: 11,
    marginTop: 4,
    fontFamily: landingFonts.sansRegular,
  },
});
