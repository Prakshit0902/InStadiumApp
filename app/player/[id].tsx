import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { resolveStadiumImage } from '@/components/landing/data';
import { ApiPlayer, ApiStadiumCard } from '@/components/stadium/types';
import { getApiBaseUrl, parseArray } from '@/components/stadium/utils';
import { GridLoader } from '@/components/ui/GridLoader';

type PlayerStat = {
  label?: string;
  value?: string | number;
};

type CareerMilestone = {
  year?: string | number;
  event?: string;
  description?: string;
};

function decodeParam(value: string | undefined) {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toFirstName(name: string) {
  return (name || 'Player').trim().split(/\s+/)[0] || 'Player';
}

function fallbackPlayer(params: {
  id: string;
  name?: string;
  image?: string;
  sport?: string;
  country?: string;
}): ApiPlayer {
  return {
    id: params.id,
    name: params.name || 'Legendary Player',
    image: params.image || null,
    country: params.country || 'India',
    sport: params.sport
      ? {
          id: params.sport.toLowerCase(),
          name: params.sport,
        }
      : undefined,
    bio: 'A celebrated athlete whose performances inspired a generation of fans across India.',
    stats: [
      { label: 'Caps', value: '120+' },
      { label: 'Awards', value: '18' },
      { label: 'Years', value: '15' },
    ],
    careerTimeline: [
      { year: '2008', event: 'Breakthrough debut at national level.' },
      { year: '2014', event: 'Led the side in a memorable title-winning campaign.' },
      { year: '2022', event: 'Honored as a modern icon of the sport.' },
    ],
    achievements: ['National Champion', 'Player of the Season', 'Fan Favorite Award'],
    stadiumsPlayed: [],
  };
}

export default function PlayerDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    image?: string;
    sport?: string;
    country?: string;
  }>();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const playerId = decodeParam(params.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<ApiPlayer | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPlayer() {
      if (!playerId) {
        if (mounted) {
          setError('Missing player id.');
          setLoading(false);
        }
        return;
      }

      const base = getApiBaseUrl();
      if (!base) {
        if (mounted) {
          setPlayer(
            fallbackPlayer({
              id: playerId,
              name: params.name,
              image: params.image,
              sport: params.sport,
              country: params.country,
            })
          );
          setError(null);
          setLoading(false);
        }
        return;
      }

      try {
        setError(null);
        const res = await fetch(`${base}/api/players/${encodeURIComponent(playerId)}`);

        if (!res.ok) {
          throw new Error('Unable to load player details.');
        }

        const data = (await res.json()) as ApiPlayer;
        if (!mounted) {
          return;
        }

        setPlayer(data);
      } catch {
        if (mounted) {
          setPlayer(
            fallbackPlayer({
              id: playerId,
              name: params.name,
              image: params.image,
              sport: params.sport,
              country: params.country,
            })
          );
          setError(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadPlayer();

    return () => {
      mounted = false;
    };
  }, [playerId, params.country, params.image, params.name, params.sport]);

  const stats = useMemo(() => parseArray<PlayerStat>(player?.stats), [player?.stats]);
  const timeline = useMemo(() => parseArray<CareerMilestone>(player?.careerTimeline), [player?.careerTimeline]);
  const achievements = useMemo(() => parseArray<string>(player?.achievements), [player?.achievements]);
  const stadiums = useMemo(() => parseArray<ApiStadiumCard>(player?.stadiumsPlayed), [player?.stadiumsPlayed]);
  const heroImageHeight = useMemo(() => {
    const usableWidth = Math.max(width - 40, 280);
    const scaledHeight = usableWidth * 1.18;
    return Math.min(Math.max(scaledHeight, 360), 620);
  }, [width]);


  if (!loading && (error || !player)) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Player', headerShown: true }} />
        <View style={styles.centerState}>
          <Ionicons name="alert-circle-outline" size={26} color={landingColors.rose} />
          <Text style={styles.stateTitle}>Unable to open player page</Text>
          <Text style={styles.stateText}>{error || 'Player not found.'}</Text>
          <Pressable onPress={() => router.back()} style={styles.retryButton}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!player) return null;

  const sportName = player.sport?.name || params.sport || 'Sport';
  const playerImage = player.image || params.image;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: player?.name || 'Player', headerShown: true, headerTintColor: landingColors.blush, headerStyle: { backgroundColor: landingColors.plum } }} />
      <ScrollView 
        contentContainerStyle={loading ? { flex: 1 } : styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: landingColors.blush }}>
            <GridLoader size={100} color={landingColors.rose} speed={1.5} />
          </View>
        ) : (
          <>
            <View style={styles.heroSection}>
          <View style={[styles.heroImageWrap, { height: heroImageHeight }]}>
            <Image source={playerImage ? { uri: playerImage } : require('@/assets/images/landing/stadiums/narendramodistadium.jpg')} style={styles.heroImage} contentFit="contain" />
            <View style={styles.heroOverlay} />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroKicker}>The Legend of {sportName}</Text>
            <Text style={styles.heroName}>{player.name}</Text>
            {!!player.bio && <Text style={styles.heroQuote}>{`"${player.bio.split('\n')[0] || player.bio}"`}</Text>}

            {stats.length > 0 && (
              <View style={styles.statsRow}>
                {stats.slice(0, 3).map((stat, index) => (
                  <View key={`${stat.label || index}-${index}`} style={styles.statBlock}>
                    <Text style={styles.statValue}>{String(stat.value || '--')}</Text>
                    <Text style={styles.statLabel}>{stat.label || 'Stat'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {!!player.bio && (
          <View style={styles.storySection}>
            <Text style={styles.sectionKicker}>Story</Text>
            <Text style={styles.sectionTitle}>
              The Legend&apos;s <Text style={styles.sectionTitleAccent}>Legacy</Text>
            </Text>
            {player.bio
              .split(/\n+/)
              .filter((p) => p.trim())
              .map((paragraph, idx) => (
                <Text key={`${idx}-${paragraph.slice(0, 12)}`} style={styles.storyParagraph}>
                  {paragraph}
                </Text>
              ))}
            <Text style={styles.storyFooter}>Story narrated by Instadium Editorial</Text>
          </View>
        )}

        {timeline.length > 0 && (
          <View style={styles.timelineSection}>
            <Text style={styles.sectionKicker}>The Journey</Text>
            <Text style={styles.sectionTitle}>
              Career <Text style={styles.sectionTitleAccent}>Milestones</Text>
            </Text>
            {timeline.map((item, index) => (
              <View key={`${item.year || index}-${index}`} style={styles.milestoneCard}>
                <Text style={styles.milestoneYear}>{item.year || 'Era'}</Text>
                <Text style={styles.milestoneText}>{item.event || item.description || 'Milestone recorded.'}</Text>
              </View>
            ))}
          </View>
        )}

        {stadiums.length > 0 && (
          <View style={styles.arenasSection}>
            <Text style={styles.sectionKicker}>Arenas of Glory</Text>
            <Text style={styles.sectionTitle}>
              Where {toFirstName(player.name)} <Text style={styles.sectionTitleAccent}>Conquered</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arenasList}>
              {stadiums.map((stadium) => (
                <Pressable
                  key={stadium.id}
                  style={({ pressed }) => [styles.arenaCard, pressed && styles.arenaCardPressed]}
                  onPress={() => router.push(`/stadium/${encodeURIComponent(stadium.id)}` as never)}>
                  <Image source={resolveStadiumImage(stadium)} style={styles.arenaImage} contentFit="cover" />
                  <View style={styles.arenaOverlay} />
                  <View style={styles.arenaContent}>
                    <Text style={styles.arenaName}>{stadium.name}</Text>
                    <Text style={styles.arenaCity}>{stadium.city}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {achievements.length > 0 && (
          <View style={styles.honorsSection}>
            <Text style={[styles.sectionKicker, styles.sectionKickerLight]}>Hall of Fame</Text>
            <Text style={[styles.sectionTitle, styles.sectionTitleLight]}>
              Honors & <Text style={styles.honorsAccent}>Awards</Text>
            </Text>
            <View style={styles.honorsGrid}>
              {achievements.slice(0, 8).map((achievement, index) => (
                <View key={`${achievement}-${index}`} style={styles.honorCard}>
                  <Text style={styles.honorIndex}>{index + 1}</Text>
                  <Text style={styles.honorText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium</Text>
        </View>
          </>
        )}
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
    paddingBottom: 24,
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
  heroSection: {
    backgroundColor: landingColors.plum,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  heroImageWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#0E0D10',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.28)',
  },
  heroContent: {
    gap: 8,
  },
  heroKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.9,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroName: {
    color: landingColors.blush,
    fontSize: 44,
    lineHeight: 48,
    fontFamily: landingFonts.serifRegular,
  },
  heroQuote: {
    color: 'rgba(238, 235, 221, 0.7)',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    fontFamily: landingFonts.sansRegular,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(129, 0, 0, 0.35)',
    paddingTop: 12,
    marginTop: 4,
    gap: 8,
  },
  statBlock: {
    flex: 1,
  },
  statValue: {
    color: landingColors.blush,
    fontSize: 25,
    lineHeight: 30,
    fontFamily: landingFonts.serifRegular,
  },
  statLabel: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  storySection: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.7,
    fontSize: 10,
    marginBottom: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  sectionKickerLight: {
    color: 'rgba(238, 235, 221, 0.8)',
  },
  sectionTitle: {
    color: landingColors.plum,
    fontSize: 34,
    lineHeight: 38,
    marginBottom: 10,
    fontFamily: landingFonts.serifRegular,
  },
  sectionTitleAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  sectionTitleLight: {
    color: landingColors.blush,
  },
  storyParagraph: {
    color: landingColors.muted,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 10,
    fontFamily: landingFonts.sansRegular,
  },
  storyFooter: {
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(129, 0, 0, 0.25)',
    paddingTop: 8,
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    fontFamily: landingFonts.sansMedium,
  },
  timelineSection: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  milestoneCard: {
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  milestoneYear: {
    color: landingColors.rose,
    fontSize: 20,
    marginBottom: 2,
    fontFamily: landingFonts.serifMediumItalic,
  },
  milestoneText: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  arenasSection: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  arenasList: {
    gap: 12,
    paddingTop: 4,
    paddingRight: 10,
  },
  arenaCard: {
    width: 260,
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
  },
  arenaCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.94,
  },
  arenaImage: {
    ...StyleSheet.absoluteFillObject,
  },
  arenaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.33)',
  },
  arenaContent: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
  },
  arenaName: {
    color: landingColors.blush,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: landingFonts.serifMediumItalic,
  },
  arenaCity: {
    color: 'rgba(238, 235, 221, 0.72)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    marginTop: 2,
    fontFamily: landingFonts.sansSemiBold,
  },
  honorsSection: {
    marginTop: 12,
    backgroundColor: landingColors.plum,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  honorsAccent: {
    color: landingColors.rose,
    fontFamily: landingFonts.serifMediumItalic,
  },
  honorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  honorCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.14)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
  },
  honorIndex: {
    color: landingColors.rose,
    fontSize: 16,
    marginBottom: 6,
    fontFamily: landingFonts.serifRegular,
  },
  honorText: {
    color: 'rgba(238, 235, 221, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontSize: 9,
    lineHeight: 14,
    fontFamily: landingFonts.sansSemiBold,
  },
  footerSection: {
    marginTop: 14,
    marginHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(129, 0, 0, 0.22)',
    alignItems: 'center',
  },
  footerMeta: {
    color: landingColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 9,
    fontFamily: landingFonts.sansMedium,
  },
});
