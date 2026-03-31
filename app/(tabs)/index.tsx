import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ListRenderItemInfo, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
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
import { getLocalStadiumImage } from '@/components/landing/data';
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
  upcomingMatches?: unknown;
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
  const [quickResults, setQuickResults] = useState<NearbyStadium[]>([]);
  const [quickResultsTitle, setQuickResultsTitle] = useState('');

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
    if (!q) {
      return [] as Array<{ id: string; name: string; city: string }>;
    }

    return allStadiums
      .filter((item) => item.name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q))
      .map((item) => ({ id: item.id, name: item.name, city: item.city }));
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

  const applyFilterResults = useCallback(
    (query: string, filter: string) => {
      const q = query.trim().toLowerCase();
      const filtered = allStadiums.filter((item) => {
        const queryOk = !q || item.name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q);
        const sportOk =
          filter === 'All' || (item.sportsPlayed || []).some((sport) => sport.name.toLowerCase() === filter.toLowerCase());
        return queryOk && sportOk;
      });

      setQuickResultsTitle(q || filter !== 'All' ? 'Search Results' : '');
      setQuickResults(
        filtered.slice(0, 6).map((item, idx) => ({
          id: item.id,
          name: item.name,
          city: item.city,
          distance: item.capacity ? `${Intl.NumberFormat('en-IN').format(item.capacity)} seats` : `${idx + 1} of ${filtered.length}`,
          image: firstGalleryUrl(item) || '',
        }))
      );
    },
    [allStadiums]
  );

  const requestAndScheduleNotifications = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow notifications to get upcoming match alerts.');
      return;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'InStadium Reminder',
        body: 'Plan your next visit and check upcoming matches near you.',
      },
      trigger:
        Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 5,
              repeats: false,
              channelId: 'default',
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 5,
              repeats: false,
            },
    });

    Alert.alert('Notifications enabled', 'You will now receive match and visit reminders.');
  }, []);

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
    router.push('/find-stadium');
  }, [router]);

  const openExplore = useCallback((params?: Record<string, string>) => {
    router.push({ pathname: '/explore', params: params || {} });
  }, [router]);

  const handleNavbarTabPress = useCallback(
    (tab: 'Stadiums' | 'Sports' | 'About' | 'Find Stadium') => {
      if (tab === 'Stadiums') {
        openExplore();
        return;
      }

      if (tab === 'Sports') {
        router.push('/sports');
        return;
      }

      if (tab === 'About') {
        router.push('/about-studio');
        return;
      }

      openFindStadiumPage();
    },
    [openExplore, openFindStadiumPage, router]
  );

  const handleChipPress = useCallback(
    async (chip: 'Near me' | 'Live events' | 'Top rated') => {
      if (chip === 'Near me') {
        await requestLocationAndShowNearby();
        return;
      }

      if (chip === 'Top rated') {
        const ranked = [...allStadiums]
          .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
          .slice(0, 6)
          .map((item) => ({
            id: item.id,
            name: item.name,
            city: item.city,
            distance: item.capacity ? `${Intl.NumberFormat('en-IN').format(item.capacity)} seats` : 'Top rated',
            image: firstGalleryUrl(item) || '',
          }));
        setQuickResultsTitle('Top Rated Stadiums');
        setQuickResults(ranked);
        return;
      }

      const liveEventStadiums = allStadiums
        .filter((item) => parseMatches(item.upcomingMatches).length > 0)
        .slice(0, 6)
        .map((item) => ({
          id: item.id,
          name: item.name,
          city: item.city,
          distance: 'Upcoming match',
          image: firstGalleryUrl(item) || '',
        }));
      setQuickResultsTitle('Live Events');
      setQuickResults(liveEventStadiums);
    },
    [allStadiums, requestLocationAndShowNearby]
  );

  const handleHeroPillPress = useCallback(async (pill: 'Live Events' | 'Nearby' | 'Top Rated') => {
    if (pill === 'Nearby') {
      await requestLocationAndShowNearby();
      return;
    }

    if (pill === 'Live Events') {
      await handleChipPress('Live events');
      return;
    }

    await handleChipPress('Top rated');
  }, [handleChipPress, requestLocationAndShowNearby]);

  const handleFooterLinkPress = useCallback(
    (link: 'Stadiums' | 'Our Story' | 'Sports Directory' | 'Find Stadium') => {
      if (link === 'Stadiums') {
        router.push('/explore');
        return;
      }

      if (link === 'Our Story') {
        router.push('/about-studio');
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
          return <SportsGrid horizontalPadding={sidePadding} sportsData={sports} />;
        case 'divider':
          return <EditorialDivider horizontalPadding={sidePadding} />;
        case 'featured':
          return (
            <FeaturedStadiums
              horizontalPadding={sidePadding}
              featured={featured}
              onViewAllPress={() => router.push('/explore')}
              onStadiumPress={(stadiumId) => router.push(`/stadium/${encodeURIComponent(stadiumId)}`)}
            />
          );
        case 'nearby':
          return (
            <NearbyStadiums
              horizontalPadding={sidePadding}
              nearbyData={nearby}
              onStadiumPress={(stadiumId) => router.push(`/stadium/${encodeURIComponent(stadiumId)}`)}
            />
          );
        case 'footer':
          return (
            <LandingFooter
              horizontalPadding={sidePadding}
              onPrimaryActionPress={() => router.push('/inquiries')}
              onLinkPress={handleFooterLinkPress}
            />
          );
        default:
          return null;
      }
    },
    [featured, handleFooterLinkPress, nearby, router, sidePadding, sports]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.sectionsWrap}>
        <LandingNavbar
          horizontalPadding={sidePadding}
          onScanPress={() => router.push('/scan')}
          onSearchPress={() => router.push('/search-stadium')}
          onNotificationsPress={requestAndScheduleNotifications}
          onTabPress={handleNavbarTabPress}
          onProfilePress={() => router.push('/auth')}
          isAuthenticated={isAuthenticated}
        />
        <NativeSearchStrip
          horizontalPadding={sidePadding}
          searchQuery={searchQuery}
          onSearchQueryChange={(value) => {
            setSearchQuery(value);
            applyFilterResults(value, selectedFilter);
          }}
          searchResults={searchSuggestions}
          onSelectSearchResult={(result) => {
            setSearchQuery(result.name);
            router.push(`/stadium/${encodeURIComponent(result.id)}`);
          }}
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterSelect={(filter) => {
            setSelectedFilter(filter);
            applyFilterResults(searchQuery, filter);
          }}
          onChipPress={handleChipPress}
        />
        <HeroSection
          horizontalPadding={sidePadding}
          isTablet={isTablet}
          onExplorePress={() => openExplore()}
          onQuickTourPress={() => router.push('/sports')}
          onQuickPillPress={handleHeroPillPress}
        />

        {quickResultsTitle ? (
          <View style={[styles.quickResultSection, { paddingHorizontal: sidePadding }]}> 
            <Text style={styles.quickResultKicker}>Smart Results</Text>
            <Text style={styles.quickResultTitle}>{quickResultsTitle}</Text>
            {quickResults.length > 0 ? (
              quickResults.map((item) => (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [styles.quickResultCard, pressed && styles.quickResultCardPressed]}
                  onPress={() => router.push(`/stadium/${encodeURIComponent(item.id)}`)}>
                  <Image source={getLocalStadiumImage(typeof item.image === 'string' ? item.image : undefined)} style={styles.quickResultImage} contentFit="cover" />
                  <View style={styles.quickResultMeta}>
                    <Text style={styles.quickResultName}>{item.name}</Text>
                    <Text style={styles.quickResultSub}>{item.city} • {item.distance}</Text>
                  </View>
                </Pressable>
              ))
            ) : (
              <Text style={styles.quickResultEmpty}>No matching stadiums found.</Text>
            )}
          </View>
        ) : null}
      </View>
    ),
    [
      applyFilterResults,
      filterOptions,
      handleChipPress,
      handleHeroPillPress,
      handleNavbarTabPress,
      isAuthenticated,
      isTablet,
      quickResults,
      quickResultsTitle,
      requestAndScheduleNotifications,
      router,
      searchQuery,
      searchSuggestions,
      selectedFilter,
      sidePadding,
    ]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.container}
        data={sections}
        keyExtractor={(item) => item}
        renderItem={renderSection}
        ListHeaderComponent={renderHeader}
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
    paddingBottom: 30,
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
});
