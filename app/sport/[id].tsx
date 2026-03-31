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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getLocalStadiumImage, getSportIconByName } from '@/components/landing/data';
import { SportsInteractiveRulebook } from '@/components/landing/SportsInteractiveRulebook';
import { ADDITIONAL_SPORTS_DATA, SportMetadata, toSportLabel, toSportSlug } from '@/components/landing/sports-page-data';
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

type ApiPlayer = {
  id: string;
  name: string;
  country?: string;
  image?: string | null;
  sport?: ApiSport;
  achievements?: unknown;
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

function parseAchievements(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry;
      }
      if (entry && typeof entry === 'object' && 'title' in entry && typeof entry.title === 'string') {
        return entry.title;
      }
      if (entry && typeof entry === 'object' && 'name' in entry && typeof entry.name === 'string') {
        return entry.name;
      }
      return null;
    })
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, 3);
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

export default function SportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sportSlug = toSportSlug(id || 'cricket');

  const metadata: SportMetadata =
    ADDITIONAL_SPORTS_DATA[sportSlug] || ADDITIONAL_SPORTS_DATA.cricket;

  const [stadiums, setStadiums] = useState<ApiStadium[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBaseUrl();
    if (!base) {
      setLoading(false);
      return;
    }

    Promise.all([fetch(`${base}/api/stadiums`), fetch(`${base}/api/players`)])
      .then(async ([stadiumsRes, playersRes]) => {
        if (!stadiumsRes.ok) {
          throw new Error(`Failed to fetch stadiums (${stadiumsRes.status})`);
        }

        if (!playersRes.ok) {
          throw new Error(`Failed to fetch players (${playersRes.status})`);
        }

        const stadiumsData = (await stadiumsRes.json()) as ApiStadium[];
        const playersData = (await playersRes.json()) as ApiPlayer[];

        setStadiums(Array.isArray(stadiumsData) ? stadiumsData : []);
        setPlayers(Array.isArray(playersData) ? playersData : []);
      })
      .catch(() => {
        setStadiums([]);
        setPlayers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const affiliatedStadiums = useMemo(() => {
    const targetSport = normalize(metadata.name);
    const sportMatched = stadiums.filter((stadium) =>
      (stadium.sportsPlayed || []).some((sport) => normalize(sport.name) === targetSport)
    );

    const indianOnly = sportMatched.filter((stadium) => {
      const country = normalize(stadium.country);
      return !country || country === 'india';
    });

    return indianOnly.length > 0 ? indianOnly : sportMatched;
  }, [metadata.name, stadiums]);

  const iconicPlayers = useMemo(() => {
    const targetSport = normalize(metadata.name);

    const sportMatched = players.filter((player) => normalize(player.sport?.name) === targetSport);

    const indianOnly = sportMatched.filter((player) => {
      const country = normalize(player.country);
      return country === 'india' || country === 'indian';
    });

    return indianOnly.length > 0 ? indianOnly : sportMatched;
  }, [metadata.name, players]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: metadata.name, headerTintColor: landingColors.plum }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroGlow} />
          <View style={styles.tagRow}>
            {metadata.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.heroTitle}>
            The Art of{`\n`}
            <Text style={styles.heroSportName}>{metadata.name}</Text>
          </Text>
          <Text style={styles.heroDescription}>{metadata.longDescription}</Text>
        </View>

        {metadata.history.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Chronicles</Text>
            <Text style={styles.sectionTitle}>
              A Journey Through <Text style={styles.sectionTitleItalic}>Time</Text>
            </Text>

            <View style={styles.timelineTrack} />
            <View style={styles.timelineWrap}>
              {metadata.history.map((event) => (
                <View key={`${event.year}-${event.event}`} style={styles.timelineRow}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineCard}>
                    <Text style={styles.timelineYear}>{event.year}</Text>
                    <Text style={styles.timelineEvent}>{event.event}</Text>
                    {!!event.description && <Text style={styles.timelineDesc}>{event.description}</Text>}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.rulebookSection}>
          <Text style={styles.rulebookKicker}>Regulations</Text>
          <Text style={styles.rulebookTitle}>
            The Interactive <Text style={styles.rulebookTitleItalic}>Rulebook</Text>
          </Text>
          <SportsInteractiveRulebook sportName={metadata.name} rules={metadata.rulebook} />
        </View>

        <View style={styles.venuesSection}>
          <View style={styles.venuesHeadingRow}>
            <View>
              <Text style={styles.venuesKicker}>Venues</Text>
              <Text style={styles.venuesTitle}>
                Associated <Text style={styles.venuesTitleItalic}>Arenas</Text>
              </Text>
            </View>
            <Pressable onPress={() => router.push('/explore')}>
              <Text style={styles.venuesAction}>All Indian Venues</Text>
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
                <Image source={getStadiumImage(stadium)} style={styles.venueImage} contentFit="cover" transition={100} />
                <View style={styles.venueOverlay}>
                  <Text style={styles.venueCity}>{stadium.city}</Text>
                  <Text style={styles.venueName}>{stadium.name}</Text>
                  <View style={styles.venueCapacityRow}>
                    <Ionicons name="people-outline" size={13} color="rgba(238, 235, 221, 0.85)" />
                    <Text style={styles.venueCapacity}>{formatCapacity(stadium.capacity)} Capacity</Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No dedicated Indian venues listed for {metadata.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.playersKicker}>Legends</Text>
          <Text style={styles.playersTitle}>
            Iconic <Text style={styles.playersTitleItalic}>Indian</Text> Athletes
          </Text>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={landingColors.rose} />
            </View>
          ) : iconicPlayers.length > 0 ? (
            iconicPlayers.map((player) => {
              const achievements = parseAchievements(player.achievements);
              const imageSource = player.image ? player.image : getLocalStadiumImage(undefined);

              return (
                <View key={player.id} style={styles.playerCard}>
                  <Image source={imageSource} style={styles.playerImage} contentFit="cover" transition={100} />

                  <View style={styles.playerBadge}>
                    <Ionicons name="star" size={14} color={landingColors.blush} />
                  </View>

                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerSport}>{`India • ${metadata.name}`}</Text>

                  <View style={styles.achievementList}>
                    {(achievements.length > 0 ? achievements : ['National Icon']).map((achievement) => (
                      <View key={achievement} style={styles.achievementPill}>
                        <Ionicons name="trophy-outline" size={11} color={landingColors.rose} />
                        <Text style={styles.achievementText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyStateLight}>
              <Text style={styles.emptyStateLightText}>Showcasing the next generation of {metadata.name} stars...</Text>
            </View>
          )}
        </View>

        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            Witness the <Text style={styles.ctaTitleItalic}>passion</Text> on India&apos;s grandest stages.
          </Text>
          <Pressable style={({ pressed }) => [styles.ctaPrimary, pressed && styles.ctaPressed]} onPress={() => router.push('/explore')}>
            <Text style={styles.ctaPrimaryText}>Book Stadium Tour</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.ctaSecondary, pressed && styles.ctaPressed]}
            onPress={() => router.push(`/sports`)}>
            <Text style={styles.ctaSecondaryText}>Contact Federation</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backToSports} onPress={() => router.push(`/sports`)}>
          <Image source={getSportIconByName(toSportLabel(sportSlug))} style={styles.backIcon} contentFit="contain" />
          <Text style={styles.backText}>Back To Sports Hub</Text>
        </Pressable>
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
    paddingBottom: 42,
  },
  heroSection: {
    backgroundColor: landingColors.plum,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '56%',
    height: '100%',
    backgroundColor: 'rgba(129, 0, 0, 0.15)',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagPill: {
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(129, 0, 0, 0.10)',
  },
  tagText: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontSize: 8,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroTitle: {
    color: landingColors.blush,
    fontSize: 56,
    lineHeight: 58,
    fontFamily: landingFonts.garamondItalic,
  },
  heroSportName: {
    color: landingColors.rose,
    fontFamily: landingFonts.garamondRegular,
  },
  heroDescription: {
    color: 'rgba(238, 235, 221, 0.72)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
    marginTop: 14,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
    marginBottom: 4,
  },
  sectionTitle: {
    color: landingColors.plum,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.garamondRegular,
  },
  sectionTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  timelineWrap: {
    gap: 10,
    marginTop: 12,
  },
  timelineTrack: {
    position: 'absolute',
    left: 30,
    top: 104,
    bottom: 10,
    width: 1,
    backgroundColor: 'rgba(129, 0, 0, 0.2)',
  },
  timelineRow: {
    paddingLeft: 20,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: 4,
    top: 16,
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    borderWidth: 2,
    borderColor: landingColors.blush,
  },
  timelineCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  timelineYear: {
    color: landingColors.rose,
    fontSize: 11,
    fontFamily: landingFonts.sansSemiBold,
    marginBottom: 4,
  },
  timelineEvent: {
    color: landingColors.plum,
    fontSize: 28,
    lineHeight: 31,
    fontFamily: landingFonts.garamondRegular,
  },
  timelineDesc: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
    marginTop: 6,
  },
  rulebookSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#E8DFC9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.08)',
  },
  rulebookKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.1,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  rulebookTitle: {
    color: landingColors.plum,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.garamondRegular,
    marginBottom: 10,
  },
  rulebookTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  ruleCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
  },
  ruleCardTitle: {
    color: landingColors.plum,
    fontSize: 19,
    lineHeight: 22,
    fontFamily: landingFonts.serifRegular,
    marginBottom: 6,
  },
  ruleCardBody: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: landingFonts.sansRegular,
  },
  venuesSection: {
    marginTop: 4,
    backgroundColor: landingColors.plum,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  venuesHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  venuesKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  venuesTitle: {
    color: landingColors.blush,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.garamondItalic,
  },
  venuesTitleItalic: {
    fontFamily: landingFonts.garamondRegular,
  },
  venuesAction: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    paddingBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  loadingWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  venueCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 10,
  },
  venueCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  venueImage: {
    width: '100%',
    height: 210,
  },
  venueOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: 'rgba(27, 23, 23, 0.36)',
  },
  venueCity: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  venueName: {
    color: landingColors.blush,
    fontSize: 28,
    lineHeight: 31,
    marginTop: 4,
    fontFamily: landingFonts.garamondRegular,
  },
  venueCapacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  venueCapacity: {
    color: 'rgba(238, 235, 221, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  playersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  playersKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.1,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  playersTitle: {
    color: landingColors.plum,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.garamondRegular,
    marginBottom: 12,
  },
  playersTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  playerCard: {
    marginBottom: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.14)',
    padding: 12,
    position: 'relative',
  },
  playerImage: {
    width: '100%',
    height: 290,
    borderRadius: 18,
    backgroundColor: 'rgba(27, 23, 23, 0.07)',
  },
  playerBadge: {
    position: 'absolute',
    right: 18,
    top: 18,
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: 'rgba(129, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    color: landingColors.plum,
    fontSize: 36,
    lineHeight: 39,
    marginTop: 10,
    fontFamily: landingFonts.garamondItalic,
  },
  playerSport: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 10,
    marginTop: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  achievementList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  achievementPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: 'rgba(129, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  achievementText: {
    color: landingColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 9,
    fontFamily: landingFonts.sansMedium,
  },
  ctaSection: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingTop: 18,
    alignItems: 'center',
    gap: 10,
  },
  ctaTitle: {
    textAlign: 'center',
    color: landingColors.plum,
    fontSize: 42,
    lineHeight: 46,
    fontFamily: landingFonts.garamondRegular,
    marginBottom: 6,
  },
  ctaTitleItalic: {
    fontFamily: landingFonts.garamondItalic,
  },
  ctaPrimary: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaPrimaryText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  ctaSecondary: {
    width: '100%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(27, 23, 23, 0.2)',
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  ctaSecondaryText: {
    color: landingColors.plum,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  backToSports: {
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: landingColors.rose,
  },
  backText: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  emptyState: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(238, 235, 221, 0.28)',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  emptyStateText: {
    color: 'rgba(238, 235, 221, 0.7)',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  emptyStateLight: {
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.13)',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  emptyStateLightText: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: landingFonts.sansRegular,
    fontStyle: 'italic',
  },
});
