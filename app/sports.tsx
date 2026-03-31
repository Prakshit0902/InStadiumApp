import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { getLocalStadiumImage } from '@/components/landing/data';
import { SportsInteractiveRulebook } from '@/components/landing/SportsInteractiveRulebook';
import { SPORTS_HUB_DATA, toSportSlug } from '@/components/landing/sports-page-data';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ApiSport = {
  id: string;
  name: string;
};

type ApiGalleryImage = {
  url?: string;
};

type ApiStadium = {
  id: string;
  name: string;
  city: string;
  country?: string;
  capacity?: number;
  galleryImages?: ApiGalleryImage[] | null;
  sportsPlayed?: ApiSport[];
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

function formatCapacity(value?: number) {
  if (!value || Number.isNaN(value)) {
    return 'N/A';
  }
  return Intl.NumberFormat('en-IN').format(value);
}

function getStadiumImage(stadium: ApiStadium) {
  const firstGalleryUrl = Array.isArray(stadium.galleryImages)
    ? stadium.galleryImages.find((item) => typeof item?.url === 'string' && item.url)?.url
    : undefined;

  return getLocalStadiumImage(firstGalleryUrl);
}

function normalize(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

const SPORT_NAMES = Object.keys(SPORTS_HUB_DATA);

export default function SportsScreen() {
  const router = useRouter();
  const [selectedSportName, setSelectedSportName] = useState('Cricket');
  const [stadiums, setStadiums] = useState<ApiStadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBaseUrl();
    if (!base) {
      setLoading(false);
      return;
    }

    fetch(`${base}/api/stadiums`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch stadiums (${response.status})`);
        }
        return response.json() as Promise<ApiStadium[]>;
      })
      .then((data) => {
        setStadiums(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setStadiums([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const activeSportData = useMemo(() => {
    return SPORTS_HUB_DATA[selectedSportName] || SPORTS_HUB_DATA.Cricket;
  }, [selectedSportName]);

  const affiliatedStadiums = useMemo(() => {
    const selected = normalize(selectedSportName);
    const sportMatched = stadiums.filter((stadium) =>
      (stadium.sportsPlayed || []).some((sport) => normalize(sport.name) === selected)
    );

    const indianOnly = sportMatched.filter((stadium) => {
      const country = normalize(stadium.country);
      return !country || country === 'india';
    });

    return indianOnly.length > 0 ? indianOnly : sportMatched;
  }, [selectedSportName, stadiums]);

  const selectedSportRank = SPORT_NAMES.indexOf(selectedSportName) + 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Sports', headerTintColor: landingColors.plum }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay} />
          <Text style={styles.heroTitle}>
            The <Text style={styles.heroTitleAccent}>Sporting</Text> Spirit
          </Text>
          <Text style={styles.heroSubtitle}>
            Interactive rulebooks and curated guides to India&apos;s most loved disciplines.
          </Text>
          <Text style={styles.heroCount}>{String(selectedSportRank).padStart(2, '0')}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorRow}>
          {SPORT_NAMES.map((sport) => {
            const active = selectedSportName === sport;
            return (
              <Pressable key={sport} onPress={() => setSelectedSportName(sport)} style={styles.selectorItem}>
                <Text style={[styles.selectorText, active && styles.selectorTextActive]}>{sport}</Text>
                <View style={[styles.selectorUnderline, active && styles.selectorUnderlineActive]} />
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.mainSection}>
          <Text style={styles.introKicker}>Introduction</Text>
          <Text style={styles.introTitle}>
            Mastering the game of <Text style={styles.introTitleItalic}>{selectedSportName}</Text>
          </Text>
          <Text style={styles.description}>{activeSportData.description}</Text>

          <View style={styles.tagRow}>
            {['Pro League', 'Championship', 'Interactive Guide'].map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.rulebookKicker}>Rulebook</Text>
          <SportsInteractiveRulebook sportName={selectedSportName} rules={activeSportData.rulebook} />

          <View style={styles.venuesHeader}>
            <View>
              <Text style={styles.venuesKicker}>Affiliated</Text>
              <Text style={styles.venuesTitle}>
                Iconic <Text style={styles.venuesTitleItalic}>Venues</Text>
              </Text>
            </View>
            <Pressable onPress={() => router.push('/explore')}>
              <Text style={styles.venuesAction}>Explore All Venues</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={landingColors.rose} />
            </View>
          ) : affiliatedStadiums.length > 0 ? (
            affiliatedStadiums.map((stadium) => (
              <Pressable
                key={stadium.id}
                style={({ pressed }) => [styles.venueCard, pressed && styles.venueCardPressed]}
                onPress={() => router.push(`/stadium/${stadium.id}`)}>
                <Image source={getStadiumImage(stadium)} style={styles.venueImage} contentFit="cover" transition={120} />
                <View style={styles.venueOverlay}>
                  <Text style={styles.venueCity}>{stadium.city}</Text>
                  <Text style={styles.venueName}>{stadium.name}</Text>
                  <View style={styles.capacityRow}>
                    <Ionicons name="people-outline" size={13} color="rgba(238, 235, 221, 0.82)" />
                    <Text style={styles.capacityText}>{formatCapacity(stadium.capacity)} Capacity</Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No dedicated venues currently listed for {selectedSportName}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [styles.detailButton, pressed && styles.detailButtonPressed]}
            onPress={() =>
              router.push({
                pathname: '/sport/[id]',
                params: { id: toSportSlug(selectedSportName) },
              })
            }>
            <Text style={styles.detailButtonText}>Open {selectedSportName} Sport Page</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  container: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: landingColors.plum,
    paddingTop: 34,
    paddingBottom: 28,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#7C5E4A',
  },
  heroTitle: {
    color: landingColors.blush,
    fontSize: 52,
    lineHeight: 55,
    fontFamily: landingFonts.garamondItalic,
    marginBottom: 10,
  },
  heroTitleAccent: {
    fontFamily: landingFonts.garamondRegular,
    fontStyle: 'normal',
  },
  heroSubtitle: {
    color: 'rgba(238, 235, 221, 0.72)',
    fontSize: 11,
    letterSpacing: 2.1,
    textTransform: 'uppercase',
    lineHeight: 20,
    fontFamily: landingFonts.sansMedium,
    maxWidth: '86%',
  },
  heroCount: {
    color: 'rgba(129, 0, 0, 0.5)',
    fontSize: 74,
    lineHeight: 76,
    fontFamily: landingFonts.serifRegular,
    textAlign: 'right',
    marginTop: 8,
  },
  selectorRow: {
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: 'rgba(238, 235, 221, 0.92)',
  },
  selectorItem: {
    alignItems: 'center',
    gap: 4,
  },
  selectorText: {
    color: 'rgba(27, 23, 23, 0.45)',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  selectorTextActive: {
    color: landingColors.rose,
  },
  selectorUnderline: {
    width: 0,
    height: 3,
    borderRadius: 999,
    backgroundColor: landingColors.rose,
  },
  selectorUnderlineActive: {
    width: 26,
  },
  mainSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  introKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  introTitle: {
    color: landingColors.plum,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.garamondRegular,
  },
  introTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  description: {
    color: landingColors.muted,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: landingColors.subtle,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansMedium,
  },
  rulebookKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    marginTop: 6,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.13)',
    padding: 14,
    marginBottom: 8,
  },
  ruleTitle: {
    color: landingColors.plum,
    fontSize: 19,
    fontFamily: landingFonts.serifRegular,
    marginBottom: 6,
  },
  ruleBody: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  venuesHeader: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  venuesKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.1,
    fontSize: 10,
    marginBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  venuesTitle: {
    color: landingColors.plum,
    fontSize: 34,
    lineHeight: 37,
    fontFamily: landingFonts.garamondRegular,
  },
  venuesTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  venuesAction: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
    paddingBottom: 4,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  venueCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: landingColors.plum,
    marginBottom: 12,
    minHeight: 214,
  },
  venueCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  venueImage: {
    width: '100%',
    height: 214,
  },
  venueOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: 'rgba(27, 23, 23, 0.35)',
  },
  venueCity: {
    color: 'rgba(238, 235, 221, 0.72)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  venueName: {
    color: landingColors.blush,
    fontSize: 28,
    lineHeight: 31,
    marginTop: 3,
    fontFamily: landingFonts.garamondRegular,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  capacityText: {
    color: 'rgba(238, 235, 221, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(129, 0, 0, 0.2)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  emptyStateText: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: landingFonts.sansRegular,
  },
  detailButton: {
    marginTop: 8,
    backgroundColor: landingColors.rose,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  detailButtonPressed: {
    opacity: 0.88,
  },
  detailButtonText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
});
