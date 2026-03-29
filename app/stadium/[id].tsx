import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
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
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ApiSport = {
  id: string;
  name: string;
  description?: string;
  rulebookVideos?: unknown;
};

type ApiPlayer = {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  sport?: ApiSport;
};

type TimelineItem = {
  year?: string | number;
  title?: string;
  event?: string;
  description?: string;
  videoUrl?: string;
  thumbnail?: string;
};

type MatchItem = {
  teams?: string;
  date?: string;
  tournament?: string;
};

type NearbyPlace = {
  name?: string;
  distance?: string;
  type?: string;
};

type GalleryImage = {
  url?: string;
  caption?: string;
};

type ApiStadiumDetail = {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  capacity?: number;
  builtYear?: number;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  sportsPlayed?: ApiSport[];
  players?: ApiPlayer[];
  galleryImages?: unknown;
  historyTimeline?: unknown;
  upcomingMatches?: unknown;
  nearbyPlaces?: unknown;
};

type ApiStadiumCard = {
  id: string;
  name: string;
  city: string;
  state?: string;
  latitude?: number | null;
  longitude?: number | null;
  galleryImages?: unknown;
  sportsPlayed?: ApiSport[];
};

type RuleSection = {
  title: string;
  content: string;
};

const fallbackRulebook: Record<string, RuleSection[]> = {
  cricket: [
    { title: 'Playing Field', content: 'Cricket is played on an oval field with a 22-yard pitch at the center. Boundaries decide fours and sixes.' },
    { title: 'Scoring', content: 'Runs come from running between wickets, boundaries, and extras. Wickets are key to limiting opposition totals.' },
    { title: 'Overs & Innings', content: 'Formats differ by overs. Teams alternate innings and the higher total wins the match.' },
  ],
  football: [
    { title: 'Match Format', content: 'Two halves of 45 minutes each. Added injury time is controlled by the referee.' },
    { title: 'Core Objective', content: 'A goal counts when the whole ball crosses the line between posts and under the crossbar.' },
    { title: 'Discipline', content: 'Fouls lead to free kicks and cards. Red card means dismissal and the team plays short.' },
  ],
  badminton: [
    { title: 'Scoring', content: 'Best of three games to 21 points, rally point scoring. Players must lead by two points.' },
    { title: 'Service', content: 'Serve diagonally and below waist height. Service order rotates by score parity.' },
    { title: 'Faults', content: 'Common faults include shuttle out, net touch, and double hit.' },
  ],
  tennis: [
    { title: 'Game Flow', content: 'Points progress as 15, 30, 40, game. At deuce, win two consecutive points.' },
    { title: 'Sets', content: 'Most matches are best of three sets; each set is generally won at six games with margin.' },
    { title: 'Tie-break', content: 'At 6-6, tie-break applies in most formats to decide the set.' },
  ],
  hockey: [
    { title: 'Basic Rules', content: 'Only the flat side of stick can be used. Ball contact with feet is generally penalized.' },
    { title: 'Penalty Corner', content: 'Major attacking chance awarded for specific defensive infringements in the shooting circle.' },
    { title: 'Cards', content: 'Green, yellow, and red cards enforce discipline with timed suspensions or dismissals.' },
  ],
  kabaddi: [
    { title: 'Raid', content: 'A raider enters opposition half, scores by tags, and must return safely before being tackled.' },
    { title: 'Defense', content: 'Defenders work in coordinated tackles to stop the raider and claim points.' },
    { title: 'Revival', content: 'Scoring points revives teammates in order; all-out situations award additional points.' },
  ],
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

function parseArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function firstGalleryUrl(galleryValue: unknown) {
  const gallery = parseArray<GalleryImage | string>(galleryValue);
  const first = gallery[0];

  if (!first) {
    return undefined;
  }

  if (typeof first === 'string') {
    return first;
  }

  return first.url;
}

function getDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
}

function formatDate(value?: string) {
  if (!value) {
    return 'TBA';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function sportKey(name: string) {
  return name.trim().toLowerCase();
}

function buildRuleSections(sport: ApiSport | undefined) {
  if (!sport) {
    return [];
  }

  const key = sportKey(sport.name);
  const fallback = fallbackRulebook[key] || [];
  const videoArray = parseArray<{ title?: string; url?: string; description?: string }>(sport.rulebookVideos);

  if (videoArray.length === 0) {
    return fallback;
  }

  const fromVideos = videoArray.slice(0, 4).map((item, index) => ({
    title: item.title || `Guide ${index + 1}`,
    content: item.description || 'Open the linked video guide to learn this section in detail.',
  }));

  return [...fromVideos, ...fallback].slice(0, 6);
}

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stadium, setStadium] = useState<ApiStadiumDetail | null>(null);
  const [allStadiums, setAllStadiums] = useState<ApiStadiumCard[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [sports, setSports] = useState<ApiSport[]>([]);
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const base = getApiBaseUrl();
      if (!base || !id) {
        setError('Missing API configuration.');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const [detailRes, listRes, sportsRes, playersRes] = await Promise.all([
          fetch(`${base}/api/stadiums/${id}`),
          fetch(`${base}/api/stadiums`),
          fetch(`${base}/api/sports`),
          fetch(`${base}/api/players?stadiumId=${id}`),
        ]);

        if (!detailRes.ok) {
          throw new Error('Unable to load stadium details.');
        }

        const detailData = (await detailRes.json()) as ApiStadiumDetail;
        const listData = listRes.ok ? ((await listRes.json()) as ApiStadiumCard[]) : [];
        const sportsData = sportsRes.ok ? ((await sportsRes.json()) as ApiSport[]) : [];
        const playersData = playersRes.ok ? ((await playersRes.json()) as ApiPlayer[]) : [];

        if (!mounted) {
          return;
        }

        setStadium(detailData);
        setAllStadiums(Array.isArray(listData) ? listData : []);
        setSports(Array.isArray(sportsData) ? sportsData : []);
        setPlayers(Array.isArray(playersData) && playersData.length > 0 ? playersData : detailData.players || []);
        setActiveRuleIndex(0);
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load stadium details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const gallery = useMemo(() => parseArray<GalleryImage | string>(stadium?.galleryImages), [stadium]);
  const timeline = useMemo(() => parseArray<TimelineItem>(stadium?.historyTimeline), [stadium]);
  const matches = useMemo(() => parseArray<MatchItem>(stadium?.upcomingMatches), [stadium]);
  const nearbyPlaces = useMemo(() => parseArray<NearbyPlace>(stadium?.nearbyPlaces), [stadium]);

  const stadiumSports = useMemo(() => {
    if (!stadium?.sportsPlayed || stadium.sportsPlayed.length === 0) {
      return [] as ApiSport[];
    }

    return stadium.sportsPlayed
      .map((item) => sports.find((sport) => sport.id === item.id) || item)
      .filter(Boolean);
  }, [sports, stadium]);

  const primarySport = stadiumSports[0];
  const ruleSections = useMemo(() => buildRuleSections(primarySport), [primarySport]);

  const nearbyStadiums = useMemo(() => {
    if (!stadium) {
      return [] as (ApiStadiumCard & { distanceKm?: number })[];
    }

    return allStadiums
      .filter((item) => item.id !== stadium.id)
      .map((item) => {
        const canMeasure =
          typeof stadium.latitude === 'number' &&
          typeof stadium.longitude === 'number' &&
          typeof item.latitude === 'number' &&
          typeof item.longitude === 'number';

        return {
          ...item,
          distanceKm: canMeasure ? getDistanceKm(stadium.latitude!, stadium.longitude!, item.latitude!, item.longitude!) : undefined,
        };
      })
      .sort((a, b) => {
        if (typeof a.distanceKm === 'number' && typeof b.distanceKm === 'number') {
          return a.distanceKm - b.distanceKm;
        }

        if (a.city === stadium.city && b.city !== stadium.city) {
          return -1;
        }

        if (a.city !== stadium.city && b.city === stadium.city) {
          return 1;
        }

        return a.name.localeCompare(b.name);
      })
      .slice(0, 4);
  }, [allStadiums, stadium]);

  const globalMapList = useMemo(
    () => allStadiums.filter((item) => typeof item.latitude === 'number' && typeof item.longitude === 'number'),
    [allStadiums]
  );

  const openLocalMap = () => {
    if (!stadium || typeof stadium.latitude !== 'number' || typeof stadium.longitude !== 'number') {
      return;
    }

    const label = encodeURIComponent(stadium.name);
    const lat = stadium.latitude;
    const lng = stadium.longitude;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
    Linking.openURL(url).catch(() => undefined);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={landingColors.rose} />
          <Text style={styles.stateText}>Loading stadium details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !stadium) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Stadium', headerShown: true }} />
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={26} color={landingColors.rose} />
          <Text style={styles.stateTitle}>Unable to open stadium page</Text>
          <Text style={styles.stateText}>{error || 'Stadium not found.'}</Text>
          <Pressable onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const heroImage = getLocalStadiumImage(firstGalleryUrl(stadium.galleryImages));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: stadium.name, headerShown: true, headerTintColor: landingColors.plum }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={heroImage} style={styles.heroImage} contentFit="cover" transition={120} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.heroKicker}>{stadium.city}{stadium.state ? `, ${stadium.state}` : ''}</Text>
            <Text style={styles.heroTitle}>{stadium.name}</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Capacity</Text>
                <Text style={styles.heroStatValue}>{stadium.capacity ? stadium.capacity.toLocaleString('en-IN') : 'N/A'}</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Built</Text>
                <Text style={styles.heroStatValue}>{stadium.builtYear || 'N/A'}</Text>
              </View>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Sports</Text>
                <Text style={styles.heroStatValue}>{stadiumSports.map((sport) => sport.name).join(', ') || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {stadium.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Overview</Text>
            <Text style={styles.sectionTitle}>About this Arena</Text>
            <Text style={styles.bodyText}>{stadium.description}</Text>
          </View>
        ) : null}

        {gallery.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Gallery</Text>
            <Text style={styles.sectionTitle}>Visual Perspective</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryList}>
              {gallery.map((item, index) => {
                const source = getLocalStadiumImage(typeof item === 'string' ? item : item.url);
                const caption = typeof item === 'string' ? `Frame ${index + 1}` : item.caption || `Frame ${index + 1}`;
                return (
                  <View key={`${caption}-${index}`} style={styles.galleryCard}>
                    <Image source={source} style={styles.galleryImage} contentFit="cover" transition={120} />
                    <Text style={styles.galleryCaption}>{caption}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {timeline.length > 0 ? (
          <View style={[styles.section, styles.timelineSection]}>
            <Text style={styles.sectionKicker}>History</Text>
            <Text style={[styles.sectionTitle, styles.lightText]}>Heritage & Legacy</Text>
            {timeline.map((item, index) => (
              <View key={`${item.year || index}-${index}`} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineYear}>{item.year || 'Era'}</Text>
                  <Text style={styles.timelineTitle}>{item.title || item.event || 'Milestone'}</Text>
                  {!!(item.description || item.event) && (
                    <Text style={styles.timelineBody}>{item.description || item.event}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {matches.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Matches</Text>
            <Text style={styles.sectionTitle}>Upcoming Spectacles</Text>
            {matches.map((match, index) => (
              <View key={`${match.teams || index}-${index}`} style={styles.matchCard}>
                <View>
                  <Text style={styles.matchTournament}>{match.tournament || 'Featured Match'}</Text>
                  <Text style={styles.matchTeams}>{match.teams || 'Teams to be announced'}</Text>
                </View>
                <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {players.length > 0 ? (
          <View style={[styles.section, styles.playersSection]}>
            <Text style={styles.sectionKicker}>Players</Text>
            <Text style={[styles.sectionTitle, styles.lightText]}>Iconic Figures</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playerList}>
              {players.map((player) => (
                <View key={player.id} style={styles.playerCard}>
                  <Image
                    source={player.image ? getLocalStadiumImage(player.image) : getLocalStadiumImage(undefined)}
                    style={styles.playerImage}
                    contentFit="cover"
                  />
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.sport?.name || primarySport?.name || 'Player'}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionKicker}>Location</Text>
          <Text style={styles.sectionTitle}>Find your path to the Arena</Text>

          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <Ionicons name="location-outline" size={16} color={landingColors.rose} />
              <Text style={styles.mapTitle}>Stadium Coordinates</Text>
            </View>

            <Text style={styles.mapBody}>
              {typeof stadium.latitude === 'number' && typeof stadium.longitude === 'number'
                ? `${stadium.latitude.toFixed(4)}, ${stadium.longitude.toFixed(4)}`
                : 'Coordinates unavailable'}
            </Text>

            <Pressable
              onPress={openLocalMap}
              style={({ pressed }) => [styles.mapButton, pressed && styles.mapButtonPressed]}
              disabled={!(typeof stadium.latitude === 'number' && typeof stadium.longitude === 'number')}>
              <Text style={styles.mapButtonText}>Open in Maps</Text>
            </Pressable>
          </View>
        </View>

        {globalMapList.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Global Stadium Map</Text>
            <Text style={styles.sectionTitle}>All Arena Coordinates</Text>
            <View style={styles.globalMapWrap}>
              {globalMapList.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.globalMapRow}
                  onPress={() => router.push((`/stadium/${item.id}` as never))}>
                  <View style={styles.globalMapLeft}>
                    <Ionicons name="location-sharp" size={13} color={landingColors.rose} />
                    <View>
                      <Text style={styles.globalMapName}>{item.name}</Text>
                      <Text style={styles.globalMapCity}>{item.city}</Text>
                    </View>
                  </View>
                  <Text style={styles.globalMapCoords}>
                    {typeof item.latitude === 'number' && typeof item.longitude === 'number'
                      ? `${item.latitude.toFixed(2)}, ${item.longitude.toFixed(2)}`
                      : '--'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {nearbyStadiums.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Nearby</Text>
            <Text style={styles.sectionTitle}>Recommended Arenas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nearbyList}>
              {nearbyStadiums.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.nearbyCard}
                  onPress={() => router.push((`/stadium/${item.id}` as never))}>
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
        ) : null}

        {primarySport ? (
          <View style={[styles.section, styles.rulebookSection]}>
            <Text style={styles.sectionKicker}>Rulebook</Text>
            <Text style={[styles.sectionTitle, styles.lightText]}>{primarySport.name} Essentials</Text>

            {ruleSections.length > 0 ? (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ruleNav}>
                  {ruleSections.map((rule, index) => (
                    <Pressable
                      key={`${rule.title}-${index}`}
                      onPress={() => setActiveRuleIndex(index)}
                      style={({ pressed }) => [
                        styles.ruleNavButton,
                        activeRuleIndex === index && styles.ruleNavButtonActive,
                        pressed && styles.ruleNavButtonPressed,
                      ]}>
                      <Text style={[styles.ruleNavText, activeRuleIndex === index && styles.ruleNavTextActive]}>{rule.title}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.ruleContentBox}>
                  <Text style={styles.ruleContentTitle}>{ruleSections[activeRuleIndex]?.title}</Text>
                  <Text style={styles.ruleContentBody}>{ruleSections[activeRuleIndex]?.content}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.bodyText}>Rulebook content is currently unavailable for this sport.</Text>
            )}
          </View>
        ) : null}

        {nearbyPlaces.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionKicker}>Around the Arena</Text>
            <Text style={styles.sectionTitle}>Nearby Places</Text>
            {nearbyPlaces.map((place, index) => (
              <View key={`${place.name || index}-${index}`} style={styles.placeRow}>
                <Text style={styles.placeName}>{place.name || 'Landmark'}</Text>
                <Text style={styles.placeMeta}>{[place.type, place.distance].filter(Boolean).join(' • ') || 'Nearby'}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    paddingBottom: 32,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    color: landingColors.plum,
    fontSize: 24,
    fontFamily: landingFonts.serifRegular,
  },
  stateText: {
    color: landingColors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  retryButton: {
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: landingColors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: landingColors.rose,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroWrap: {
    height: 420,
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.45)',
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  heroKicker: {
    color: 'rgba(238, 235, 221, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 6,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroTitle: {
    color: landingColors.blush,
    fontSize: 42,
    lineHeight: 46,
    marginBottom: 12,
    fontFamily: landingFonts.serifRegular,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroStatItem: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(27, 23, 23, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.2)',
  },
  heroStatLabel: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 8,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroStatValue: {
    color: landingColors.blush,
    fontSize: 12,
    marginTop: 2,
    fontFamily: landingFonts.sansMedium,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  sectionKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  sectionTitle: {
    color: landingColors.plum,
    fontSize: 33,
    lineHeight: 37,
    marginBottom: 10,
    fontFamily: landingFonts.serifRegular,
  },
  lightText: {
    color: landingColors.blush,
  },
  bodyText: {
    color: landingColors.muted,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: landingFonts.sansRegular,
  },
  galleryList: {
    gap: 12,
    paddingRight: 10,
    paddingTop: 4,
  },
  galleryCard: {
    width: 272,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  galleryImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
  },
  galleryCaption: {
    marginTop: 8,
    color: landingColors.muted,
    fontSize: 11,
    fontFamily: landingFonts.sansMedium,
  },
  timelineSection: {
    backgroundColor: landingColors.plum,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingTop: 18,
    paddingBottom: 16,
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginTop: 6,
    backgroundColor: landingColors.rose,
  },
  timelineContent: {
    flex: 1,
  },
  timelineYear: {
    color: landingColors.rose,
    fontSize: 12,
    fontFamily: landingFonts.serifMedium,
  },
  timelineTitle: {
    color: landingColors.blush,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 2,
    fontFamily: landingFonts.serifRegular,
  },
  timelineBody: {
    color: 'rgba(238, 235, 221, 0.76)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    fontFamily: landingFonts.sansRegular,
  },
  matchCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  matchTournament: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  matchTeams: {
    color: landingColors.plum,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: landingFonts.serifRegular,
  },
  matchDate: {
    color: landingColors.subtle,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: landingFonts.sansSemiBold,
    alignSelf: 'center',
  },
  playersSection: {
    backgroundColor: landingColors.plum,
    paddingTop: 18,
    paddingBottom: 16,
  },
  playerList: {
    gap: 12,
    paddingRight: 12,
    paddingTop: 4,
  },
  playerCard: {
    width: 182,
  },
  playerImage: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    marginBottom: 8,
  },
  playerName: {
    color: landingColors.blush,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: landingFonts.serifRegular,
  },
  playerRole: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    marginTop: 3,
    fontFamily: landingFonts.sansSemiBold,
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
  globalMapWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  globalMapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129,0,0,0.08)',
    gap: 8,
  },
  globalMapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  globalMapName: {
    color: landingColors.plum,
    fontSize: 12,
    fontFamily: landingFonts.sansSemiBold,
  },
  globalMapCity: {
    color: landingColors.subtle,
    fontSize: 10,
    fontFamily: landingFonts.sansRegular,
  },
  globalMapCoords: {
    color: landingColors.subtle,
    fontSize: 10,
    fontFamily: landingFonts.sansMedium,
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
  rulebookSection: {
    backgroundColor: landingColors.plum,
    marginTop: 8,
    paddingTop: 18,
    paddingBottom: 16,
  },
  ruleNav: {
    gap: 8,
    paddingRight: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  ruleNavButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(238,235,221,0.25)',
    backgroundColor: 'rgba(238,235,221,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ruleNavButtonActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  ruleNavButtonPressed: {
    opacity: 0.86,
  },
  ruleNavText: {
    color: 'rgba(238,235,221,0.80)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  ruleNavTextActive: {
    color: landingColors.blush,
  },
  ruleContentBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(238,235,221,0.16)',
    backgroundColor: 'rgba(238,235,221,0.06)',
    padding: 12,
  },
  ruleContentTitle: {
    color: landingColors.rose,
    fontSize: 18,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  ruleContentBody: {
    color: 'rgba(238,235,221,0.83)',
    fontSize: 12,
    lineHeight: 19,
    fontFamily: landingFonts.sansRegular,
  },
  placeRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    padding: 11,
    marginBottom: 8,
  },
  placeName: {
    color: landingColors.plum,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: landingFonts.serifRegular,
  },
  placeMeta: {
    color: landingColors.subtle,
    fontSize: 11,
    marginTop: 4,
    fontFamily: landingFonts.sansRegular,
  },
});
