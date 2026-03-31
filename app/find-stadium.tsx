import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ApiGalleryImage = { url?: string };

type ApiStadium = {
  id: string;
  name: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  galleryImages?: ApiGalleryImage[] | null;
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

function firstGalleryUrl(stadium: ApiStadium) {
  return Array.isArray(stadium.galleryImages)
    ? stadium.galleryImages.find((item) => typeof item?.url === 'string' && item.url)?.url
    : undefined;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
}

export default function FindStadiumScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stadiums, setStadiums] = useState<ApiStadium[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        if (mounted) {
          Alert.alert('Permission required', 'Location permission is required for Find Stadium.');
          setLoading(false);
        }
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      if (!mounted) {
        return;
      }

      setLocation({ lat: current.coords.latitude, lng: current.coords.longitude });

      const base = getApiBaseUrl();
      if (!base) {
        setStadiums([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${base}/api/stadiums`);
        if (!response.ok) {
          throw new Error('Failed to fetch stadiums');
        }
        const data = (await response.json()) as ApiStadium[];
        setStadiums(Array.isArray(data) ? data : []);
      } catch {
        setStadiums([]);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const ranked = useMemo(() => {
    if (!location) {
      return [] as Array<ApiStadium & { distanceKm?: number }>;
    }

    return stadiums
      .map((item) => {
        if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
          return { ...item, distanceKm: getDistanceKm(location.lat, location.lng, item.latitude, item.longitude) };
        }
        return { ...item, distanceKm: undefined };
      })
      .sort((a, b) => {
        if (typeof a.distanceKm === 'number' && typeof b.distanceKm === 'number') {
          return a.distanceKm - b.distanceKm;
        }
        if (typeof a.distanceKm === 'number') {
          return -1;
        }
        if (typeof b.distanceKm === 'number') {
          return 1;
        }
        return a.name.localeCompare(b.name);
      });
  }, [location, stadiums]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Nearby</Text>
        <Text style={styles.title}>Find Stadium</Text>
        <Text style={styles.subtitle}>Stadiums sorted by your current location with one-tap directions.</Text>

        <FlatList
          data={ranked}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={getLocalStadiumImage(firstGalleryUrl(item))} style={styles.image} contentFit="cover" />
              <View style={styles.metaWrap}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.city}</Text>
                <Text style={styles.meta}>{typeof item.distanceKm === 'number' ? `${item.distanceKm.toFixed(1)} km away` : 'Distance unavailable'}</Text>
                <View style={styles.actions}>
                  <Pressable style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]} onPress={() => router.push(`/stadium/${encodeURIComponent(item.id)}`)}>
                    <Text style={styles.actionText}>Open</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, styles.secondaryBtn, pressed && styles.actionPressed]}
                    onPress={() => {
                      if (typeof item.latitude === 'number' && typeof item.longitude === 'number') {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
                        Linking.openURL(url);
                        return;
                      }
                      Alert.alert('Directions unavailable', 'This stadium has no mapped coordinates yet.');
                    }}>
                    <Ionicons name="navigate-outline" size={13} color={landingColors.rose} />
                    <Text style={[styles.actionText, styles.secondaryActionText]}>Get Directions</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={!loading ? <Text style={styles.empty}>No stadium data available.</Text> : <Text style={styles.empty}>Loading nearby stadiums…</Text>}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: landingColors.blush },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 40,
    lineHeight: 44,
    marginTop: 2,
    fontFamily: landingFonts.serifRegular,
  },
  subtitle: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4,
    fontFamily: landingFonts.sansRegular,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 170,
  },
  metaWrap: {
    padding: 10,
    gap: 3,
  },
  name: {
    color: landingColors.plum,
    fontSize: 28,
    lineHeight: 32,
    fontFamily: landingFonts.serifRegular,
  },
  meta: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  actions: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.2)',
  },
  actionText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  secondaryActionText: {
    color: landingColors.rose,
  },
  actionPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  empty: {
    color: landingColors.muted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
    fontFamily: landingFonts.sansRegular,
  },
});
