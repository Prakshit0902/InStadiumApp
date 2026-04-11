import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ListRenderItemInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { EditorialDivider } from '@/components/landing/EditorialDivider';
import { FeaturedStadiums } from '@/components/landing/FeaturedStadiums';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { NearbyStadiums } from '@/components/landing/NearbyStadiums';
import { NativeSearchStrip } from '@/components/landing/NativeSearchStrip';
import { SportsGrid } from '@/components/landing/SportsGrid';
import { EntranceView } from '@/components/ui/EntranceView';
import { resolveStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { useFeaturedStadiums } from '@/components/landing/useFeaturedStadiums';
import { useAuth } from '@/hooks/use-auth';
import { NearbyStadium } from '@/components/landing/types';

type LandingSectionKey = 'sports' | 'divider' | 'featured' | 'nearby' | 'footer';

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
  capacity?: number;
  latitude?: number | null;
  longitude?: number | null;
  galleryImages?: ApiGalleryImage[] | null;
  sportsPlayed?: ApiSport[];
  players?: Array<{ id: string; name: string }>;
  upcomingMatches?: unknown;
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
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

function parseMatches(value: unknown) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 900;
  const sidePadding = useMemo(() => (isTablet ? 44 : 20), [isTablet]);
  const { featured, nearby, sports } = useFeaturedStadiums();
  const sections = useMemo<LandingSectionKey[]>(() => ['sports', 'divider', 'featured', 'nearby', 'footer'], []);
  const [allStadiums, setAllStadiums] = useState<ApiStadium[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    const base = getApiBaseUrl();
    if (!base) {
      return;
    }

    fetch(`${base}/api/stadiums`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load stadiums (${response.status})`);
        }
        return response.json() as Promise<ApiStadium[]>;
      })
      .then((data) => {
        setAllStadiums(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setAllStadiums([]);
      });
  }, []);

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) {
      return [];
    }

    const results: Array<{ id: string; name: string; city: string; type?: 'stadium' | 'sport' | 'player'; matchTerm?: string }> = [];

    // 1. Stadium Name or City Match
    allStadiums.forEach((stadium) => {
      if (stadium.name.toLowerCase().includes(q) || stadium.city.toLowerCase().includes(q)) {
        results.push({
          id: stadium.id,
          name: stadium.name,
          city: stadium.city,
          type: 'stadium',
        });
      }
    });

    // 2. Unique Sports Match (only if the query matches the sport name)
    const sportMap = new Map<string, any>();
    allStadiums.forEach(s => {
      (s.sportsPlayed || []).forEach(sport => {
        if (sport.name.toLowerCase().includes(q)) {
          sportMap.set(sport.id, sport);
        }
      });
    });
    sportMap.forEach((sport, id) => {
      results.push({
        id: id,
        name: sport.name,
        city: 'Sport',
        type: 'sport',
        matchTerm: sport.name,
      });
    });

    // 3. Unique Players Match (only if the query matches the player name)
    const playerMap = new Map<string, any>();
    allStadiums.forEach(s => {
      (s.players || []).forEach(player => {
        if (player.name.toLowerCase().includes(q)) {
          playerMap.set(player.id, player);
        }
      });
    });
    playerMap.forEach((player, id) => {
      results.push({
        id: id,
        name: player.name,
        city: 'Player',
        type: 'player',
        matchTerm: player.name,
      });
    });

    // Sort: Exact match first, then Stadiums first, then alphabetical
    return results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      if (a.type === 'stadium' && b.type !== 'stadium') return -1;
      if (a.type !== 'stadium' && b.type === 'stadium') return 1;

      return a.name.localeCompare(b.name);
    }).slice(0, 10);
  }, [allStadiums, searchQuery]);

  const filterOptions = useMemo(() => {
    const fromSports = new Set<string>();
    allStadiums.forEach((stadium) => {
      (stadium.sportsPlayed || []).forEach((sport) => {
        if (sport.name?.trim()) {
          fromSports.add(sport.name);
        }
      });
    });
    return ['All', ...Array.from(fromSports).sort((a, b) => a.localeCompare(b))];
  }, [allStadiums]);



  const requestLocationAndShowNearby = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed to show nearby stadiums.');
      return;
    }

    const current = await Location.getCurrentPositionAsync({});
    const lat = current.coords.latitude;
    const lng = current.coords.longitude;

    const nearbySorted = allStadiums
      .filter((item) => typeof item.latitude === 'number' && typeof item.longitude === 'number')
      .map((item) => ({
        item,
        distanceKm: getDistanceKm(lat, lng, item.latitude as number, item.longitude as number),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6)
      .map(({ item, distanceKm }) => ({
        id: item.id,
        name: item.name,
        city: item.city,
        distance: `${distanceKm.toFixed(1)} km away`,
        image: firstGalleryUrl(item) || '',
      }));

    setQuickResultsTitle('Near You');
    setQuickResults(nearbySorted);
  }, [allStadiums]);

  const openFindStadiumPage = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Location permission is needed to find nearby stadiums.');
      return;
    }
    router.push('/find');
  }, [router]);

  const openExplore = useCallback((params?: Record<string, string>) => {
    router.push({ pathname: '/explore', params: params || {} });
  }, [router]);

  // Removed handleNavbarTabPress as it is now in the bottom tab bar.

  const handleFooterLinkPress = useCallback(
    (link: 'Stadiums' | 'Our Story' | 'Sports Directory' | 'Find Stadium') => {
      if (link === 'Stadiums') {
        router.push('/explore');
        return;
      }

      if (link === 'Our Story') {
        router.push('/about');
        return;
      }

      if (link === 'Sports Directory') {
        router.push('/sports');
        return;
      }

      router.push('/explore');
    },
    [router]
  );

  const renderSection = useCallback(
    ({ item }: ListRenderItemInfo<LandingSectionKey>) => {
      switch (item) {
        case 'sports':
          return (
            <EntranceView delay={0}>
              <SportsGrid horizontalPadding={sidePadding} sportsData={sports} />
            </EntranceView>
          );
        case 'divider':
          return (
            <EntranceView delay={0}>
              <EditorialDivider horizontalPadding={sidePadding} />
            </EntranceView>
          );
        case 'featured':
          return (
            <EntranceView delay={0}>
              <FeaturedStadiums
                horizontalPadding={sidePadding}
                featured={featured}
                onViewAllPress={() => router.push('/explore')}
                onStadiumPress={(stadiumId) => router.push(`/stadium/${encodeURIComponent(stadiumId)}`)}
              />
            </EntranceView>
          );
        case 'nearby':
          return (
            <EntranceView delay={0}>
              <NearbyStadiums
                horizontalPadding={sidePadding}
                nearbyData={nearby}
                onStadiumPress={(stadiumId) => router.push(`/stadium/${encodeURIComponent(stadiumId)}`)}
              />
            </EntranceView>
          );
        case 'footer':
          return (
            <EntranceView delay={0}>
              <LandingFooter
                horizontalPadding={sidePadding}
                onPrimaryActionPress={() => router.push('/inquiries')}
                onLinkPress={handleFooterLinkPress}
              />
            </EntranceView>
          );
        default:
          return null;
      }
    },
    [featured, handleFooterLinkPress, nearby, router, sidePadding, sports]
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <FlatList
        style={styles.container}
        data={sections}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        ListHeaderComponent={
          <View style={styles.sectionsWrap}>
            <EntranceView delay={0}>
              <LandingNavbar
                horizontalPadding={sidePadding}
                onScanPress={() => router.push('/scan')}
                onProfilePress={() => router.push('/auth')}
                isAuthenticated={isAuthenticated}
              />
            </EntranceView>
            <EntranceView delay={0}>
              <NativeSearchStrip
                horizontalPadding={sidePadding}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                searchResults={searchSuggestions}
                onSelectSearchResult={(result) => {
                  setSearchQuery(result.name);
                  if (result.type === 'player') {
                    router.push(`/player/${encodeURIComponent(result.id)}`);
                  } else if (result.type === 'sport') {
                    router.push(`/sport/${encodeURIComponent(result.id)}`);
                  } else {
                    router.push(`/stadium/${encodeURIComponent(result.id)}`);
                  }
                }}
                filterOptions={filterOptions}
                selectedFilter={selectedFilter}
                onFilterSelect={setSelectedFilter}
              />
            </EntranceView>
            <EntranceView delay={0}>
              <HeroSection
                horizontalPadding={sidePadding}
                isTablet={isTablet}
                onExplorePress={() => openExplore()}
                onQuickTourPress={() => router.push('/sports')}
              />
            </EntranceView>
          </View>
        }
        contentContainerStyle={styles.content}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={16}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      />
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
    paddingBottom: 10,
  },
  sectionsWrap: {
    backgroundColor: landingColors.blush,
  },
  quickResultSection: {
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  quickResultKicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  quickResultTitle: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 4,
    fontFamily: landingFonts.serifRegular,
  },
  quickResultCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.14)',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  quickResultCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  quickResultImage: {
    width: 90,
    height: 90,
  },
  quickResultMeta: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quickResultName: {
    color: landingColors.plum,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: landingFonts.serifRegular,
  },
  quickResultSub: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 9,
    marginTop: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  quickResultEmpty: {
    color: landingColors.muted,
    fontSize: 12,
    fontFamily: landingFonts.sansRegular,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(129,0,0,0.05)',
  },
  miniBadgeText: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: landingColors.rose,
    fontFamily: landingFonts.sansSemiBold,
    letterSpacing: 0.5,
  },
});
