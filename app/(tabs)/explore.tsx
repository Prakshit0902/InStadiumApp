import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getLocalStadiumImage } from '@/components/landing/data';
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
  capacity?: number | null;
  sportsPlayed?: ApiSport[];
  galleryImages?: ApiGalleryImage[];
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

function getPrimaryImage(stadium: ApiStadium) {
  const firstGalleryUrl = Array.isArray(stadium.galleryImages)
    ? stadium.galleryImages.find((item) => {
        if (typeof item === 'string') {
          return item.trim().length > 0;
        }

        if (item && typeof item === 'object' && 'url' in item) {
          const url = (item as { url?: unknown }).url;
          return typeof url === 'string' && url.trim().length > 0;
        }

        return false;
      })
    : undefined;

  const resolvedUrl =
    typeof firstGalleryUrl === 'string'
      ? firstGalleryUrl
      : firstGalleryUrl && typeof firstGalleryUrl === 'object' && 'url' in firstGalleryUrl
        ? ((firstGalleryUrl as { url?: unknown }).url as string | undefined)
        : undefined;

  return getLocalStadiumImage(resolvedUrl);
}

function formatCapacity(value?: number | null) {
  if (!value || Number.isNaN(value)) {
    return 'N/A';
  }

  return Intl.NumberFormat('en-IN').format(value);
}

function LoadingGrid() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={styles.loadingCard}>
          <View style={styles.loadingImage} />
          <View style={styles.loadingLineLong} />
          <View style={styles.loadingLineShort} />
        </View>
      ))}
    </View>
  );
}

const MemoLoadingGrid = memo(LoadingGrid);

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; sport?: string }>();
  const [stadiums, setStadiums] = useState<ApiStadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  useEffect(() => {
    if (typeof params.q === 'string') {
      setQuery(params.q);
    }

    if (typeof params.sport === 'string' && params.sport.trim().length > 0) {
      setSelectedSport(params.sport);
    }
  }, [params.q, params.sport]);

  const fetchStadiums = useCallback(async () => {
    const baseUrl = getApiBaseUrl();

    if (!baseUrl) {
      setError('Missing EXPO_PUBLIC_API_BASE_URL in .env');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${baseUrl}/api/stadiums`);

      if (!response.ok) {
        throw new Error(`Failed to fetch stadiums (${response.status})`);
      }

      const data = (await response.json()) as ApiStadium[];
      setStadiums(Array.isArray(data) ? data : []);
    } catch {
      setError('Unable to load stadiums. Please check backend and retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStadiums();
  }, [fetchStadiums]);

  const sportFilters = useMemo(() => {
    const fromApi = new Set<string>();
    stadiums.forEach((stadium) => {
      (stadium.sportsPlayed || []).forEach((sport) => {
        const name = (sport?.name || '').trim();
        if (name) {
          fromApi.add(name);
        }
      });
    });

    return ['All', ...Array.from(fromApi).sort((a, b) => a.localeCompare(b))];
  }, [stadiums]);

  const filteredStadiums = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return stadiums.filter((stadium) => {
      const matchesQuery =
        !normalizedQuery ||
        stadium.name.toLowerCase().includes(normalizedQuery) ||
        stadium.city.toLowerCase().includes(normalizedQuery);

      const sports = stadium.sportsPlayed || [];
      const matchesSport =
        selectedSport === 'All' || sports.some((sport) => sport.name.toLowerCase() === selectedSport.toLowerCase());

      return matchesQuery && matchesSport;
    });
  }, [query, selectedSport, stadiums]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStadiums();
  }, [fetchStadiums]);

  const renderSportFilter = useCallback(
    (sport: string) => (
      <Pressable
        key={sport}
        onPress={() => setSelectedSport(sport)}
        style={({ pressed }) => [
          styles.filterChip,
          selectedSport === sport && styles.filterChipActive,
          pressed && styles.filterChipPressed,
        ]}>
        <Text style={[styles.filterChipText, selectedSport === sport && styles.filterChipTextActive]}>{sport}</Text>
      </Pressable>
    ),
    [selectedSport]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredStadiums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.kicker}>Explore</Text>
            <Text style={styles.title}>
              All <Text style={styles.titleAccent}>Stadiums</Text>
            </Text>
            <Text style={styles.subtitle}>Search, filter, and discover iconic arenas from live backend data.</Text>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={landingColors.subtle} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by stadium or city"
                placeholderTextColor="rgba(27, 23, 23, 0.40)"
                style={styles.searchInput}
              />
            </View>

            <FlatList
              horizontal
              data={sportFilters}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderSportFilter(item)}
              contentContainerStyle={styles.filterList}
              showsHorizontalScrollIndicator={false}
            />

            {error ? (
              <View style={styles.errorWrap}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={fetchStadiums}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            {loading ? <MemoLoadingGrid /> : null}
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={landingColors.rose} />}
        renderItem={({ item }) => {
          const primarySport = item.sportsPlayed?.[0]?.name || 'Sports';

          return (
            <Pressable
              onPress={() => router.push(`/stadium/${encodeURIComponent(String(item.id))}`)}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <Image source={getPrimaryImage(item)} style={styles.cardImage} contentFit="cover" transition={100} />

              <View style={styles.metaRow}>
                <Text style={styles.city}>{item.city}</Text>
                <View style={styles.sportPill}>
                  <Text style={styles.sportPillText}>{primarySport}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.name}</Text>

              <View style={styles.capacityRow}>
                <Ionicons name="people-outline" size={14} color={landingColors.subtle} />
                <Text style={styles.capacityText}>Capacity {formatCapacity(item.capacity)}</Text>
              </View>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="search" size={24} color={landingColors.subtle} />
              <Text style={styles.emptyTitle}>No stadiums found</Text>
              <Text style={styles.emptyText}>Try a different search term or sport filter.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !loading && filteredStadiums.length > 0 ? (
            <View style={styles.footerInfo}>
              <Text style={styles.footerInfoText}>{filteredStadiums.length} venues shown</Text>
            </View>
          ) : null
        }
      />

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="small" color={landingColors.rose} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: landingColors.blush,
  },
  headerWrap: {
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 37,
    lineHeight: 42,
    fontFamily: landingFonts.serifRegular,
  },
  titleAccent: {
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
  },
  subtitle: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.15)',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 4,
  },
  searchInput: {
    flex: 1,
    color: landingColors.plum,
    fontSize: 13,
    fontFamily: landingFonts.sansMedium,
  },
  filterList: {
    gap: 10,
    paddingVertical: 8,
    paddingRight: 10,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.18)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  filterChipPressed: {
    opacity: 0.85,
  },
  filterChipText: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: landingColors.muted,
    fontFamily: landingFonts.sansMedium,
  },
  filterChipTextActive: {
    color: landingColors.blush,
  },
  errorWrap: {
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.22)',
    backgroundColor: 'rgba(255, 255, 255, 0.70)',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: landingColors.roseSoft,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansMedium,
  },
  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    color: landingColors.rose,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  loadingOverlay: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
  grid: {
    gap: 14,
    marginTop: 6,
  },
  loadingCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.1)',
    padding: 10,
  },
  loadingImage: {
    height: 170,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 0, 0, 0.06)',
    marginBottom: 10,
  },
  loadingLineLong: {
    height: 12,
    borderRadius: 99,
    backgroundColor: 'rgba(129, 0, 0, 0.07)',
    marginBottom: 8,
    width: '72%',
  },
  loadingLineShort: {
    height: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(129, 0, 0, 0.07)',
    width: '40%',
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.14)',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  cardImage: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  city: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  sportPill: {
    backgroundColor: 'rgba(129, 0, 0, 0.09)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sportPillText: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  cardTitle: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 10,
    fontFamily: landingFonts.serifRegular,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capacityText: {
    color: landingColors.muted,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansMedium,
  },
  separator: {
    height: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    gap: 8,
  },
  emptyTitle: {
    color: landingColors.plum,
    fontSize: 22,
    fontFamily: landingFonts.serifRegular,
  },
  emptyText: {
    color: landingColors.muted,
    fontSize: 12,
    fontFamily: landingFonts.sansRegular,
  },
  footerInfo: {
    paddingTop: 8,
    paddingBottom: 18,
    alignItems: 'center',
  },
  footerInfoText: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
});
