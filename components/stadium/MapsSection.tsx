import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { ApiStadiumCard } from './types';

type LocationProps = {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
};

export function LocationSection({ name, latitude, longitude }: LocationProps) {
  const openLocalMap = () => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }

    const label = encodeURIComponent(name);
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <AnimatedReveal delay={210}>
      <View style={styles.section}>
        <SectionHeader kicker="Location" title="Find your path to the Arena" />
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Ionicons name="location-outline" size={16} color={landingColors.rose} />
            <Text style={styles.mapTitle}>Stadium Coordinates</Text>
          </View>
          <Text style={styles.mapBody}>
            {typeof latitude === 'number' && typeof longitude === 'number'
              ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : 'Coordinates unavailable'}
          </Text>
          <Pressable
            onPress={openLocalMap}
            style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}
            disabled={!(typeof latitude === 'number' && typeof longitude === 'number')}>
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </Pressable>
        </View>
      </View>
    </AnimatedReveal>
  );
}

type GlobalProps = {
  currentStadiumId: string;
  stadiums: ApiStadiumCard[];
};

function normalizePoint(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

export function GlobalMapSection({ currentStadiumId, stadiums }: GlobalProps) {
  const router = useRouter();

  if (stadiums.length === 0) {
    return null;
  }

  const latMin = Math.min(...stadiums.map((x) => x.latitude as number));
  const latMax = Math.max(...stadiums.map((x) => x.latitude as number));
  const lngMin = Math.min(...stadiums.map((x) => x.longitude as number));
  const lngMax = Math.max(...stadiums.map((x) => x.longitude as number));

  return (
    <AnimatedReveal delay={230}>
      <View style={styles.section}>
        <SectionHeader kicker="Global Stadium Map" title="All Arena Coordinates" />
        <View style={styles.canvasWrap}>
          <View style={styles.canvas}>
            {stadiums.map((item) => {
              const lat = item.latitude as number;
              const lng = item.longitude as number;
              const x = normalizePoint(lng, lngMin, lngMax);
              const y = 1 - normalizePoint(lat, latMin, latMax);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push((`/stadium/${item.id}` as never))}
                  style={[
                    styles.pin,
                    {
                      left: `${Math.max(4, Math.min(92, x * 100))}%`,
                      top: `${Math.max(8, Math.min(90, y * 100))}%`,
                    },
                    item.id === currentStadiumId && styles.pinActive,
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendChip}>
              <View style={[styles.legendDot, styles.legendDotActive]} />
              <Text style={styles.legendText}>Current Stadium</Text>
            </View>
            <View style={styles.legendChip}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Other Stadiums</Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  mapCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mapTitle: {
    color: landingColors.plum,
    fontSize: 13,
    fontFamily: landingFonts.sansSemiBold,
  },
  mapBody: {
    color: landingColors.muted,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: landingFonts.sansRegular,
  },
  mapButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mapButtonPressed: {
    opacity: 0.9,
  },
  mapButtonText: {
    color: landingColors.blush,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  canvasWrap: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  canvas: {
    height: 180,
    borderRadius: 12,
    backgroundColor: 'rgba(129,0,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.08)',
    overflow: 'hidden',
  },
  pin: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 999,
    marginLeft: -5,
    marginTop: -5,
    backgroundColor: 'rgba(129, 0, 0, 0.55)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinActive: {
    width: 14,
    height: 14,
    marginLeft: -7,
    marginTop: -7,
    backgroundColor: landingColors.rose,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(129,0,0,0.55)',
  },
  legendDotActive: {
    backgroundColor: landingColors.rose,
  },
  legendText: {
    color: landingColors.subtle,
    fontSize: 10,
    fontFamily: landingFonts.sansMedium,
  },
});
