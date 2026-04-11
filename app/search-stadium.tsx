import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ApiStadium = {
  id: string;
  name: string;
  city: string;
  players?: Array<{ id: string; name: string }>;
  sportsPlayed?: Array<{ id: string; name: string }>;
};

type SearchResult = {
  id: string;
  name: string;
  subtitle: string;
  type: 'stadium' | 'player' | 'sport';
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

export default function SearchStadiumScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [stadiums, setStadiums] = useState<ApiStadium[]>([]);

  useEffect(() => {
    const base = getApiBaseUrl();
    if (!base) {
      return;
    }

    fetch(`${base}/api/stadiums`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load stadiums');
        }
        return response.json() as Promise<ApiStadium[]>;
      })
      .then((data) => setStadiums(Array.isArray(data) ? data : []))
      .catch(() => setStadiums([]));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [] as SearchResult[];
    }

    const finalResults: SearchResult[] = [];

    // 1. Stadiums
    stadiums.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)) {
        finalResults.push({
          id: s.id,
          name: s.name,
          subtitle: s.city,
          type: 'stadium'
        });
      }
    });

    // 2. Players
    const playerMap = new Map<string, any>();
    stadiums.forEach(s => {
      (s.players || []).forEach(p => {
        if (p.name.toLowerCase().includes(q)) {
          playerMap.set(p.id, p);
        }
      });
    });
    playerMap.forEach(p => {
      finalResults.push({
        id: p.id,
        name: p.name,
        subtitle: 'Player',
        type: 'player'
      });
    });

    // 3. Sports
    const sportMap = new Map<string, any>();
    stadiums.forEach(s => {
      (s.sportsPlayed || []).forEach(sp => {
        if (sp.name.toLowerCase().includes(q)) {
          sportMap.set(sp.id, sp);
        }
      });
    });
    sportMap.forEach(sp => {
      finalResults.push({
        id: sp.id,
        name: sp.name,
        subtitle: 'Sport',
        type: 'sport'
      });
    });

    // Sorting: Exact matches first
    return finalResults.sort((a, b) => {
      const aLower = a.name.toLowerCase();
      const bLower = b.name.toLowerCase();
      if (aLower === q) return -1;
      if (bLower === q) return 1;
      return 0;
    });
  }, [query, stadiums]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={landingColors.subtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search stadiums, players, or sports"
            placeholderTextColor={landingColors.subtle}
            autoFocus
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          contentContainerStyle={styles.resultsWrap}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.resultItem, pressed && styles.resultPressed]}
              onPress={() => {
                if (item.type === 'player') {
                  router.push(`/player/${encodeURIComponent(item.id)}`);
                } else if (item.type === 'sport') {
                  router.push(`/sport/${encodeURIComponent(item.id)}`);
                } else {
                  router.push(`/stadium/${encodeURIComponent(item.id)}`);
                }
              }}>
              <View style={styles.resultTextContainer}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  {item.type !== 'stadium' && (
                    <View style={[
                      styles.badge, 
                      item.type === 'player' ? styles.playerBadge : styles.sportBadge
                    ]}>
                      <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.resultCity}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={landingColors.subtle} />
            </Pressable>
          )}
          ListEmptyComponent={
            query.trim().length > 0 ? <Text style={styles.empty}>No matching results found.</Text> : <Text style={styles.empty}>Start typing to search.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  searchWrap: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.16)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: landingColors.plum,
    fontSize: 15,
    fontFamily: landingFonts.sansRegular,
  },
  resultsWrap: {
    paddingTop: 10,
    paddingBottom: 20,
    gap: 8,
  },
  resultItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  resultTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  resultName: {
    color: landingColors.plum,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: landingFonts.serifRegular,
  },
  resultCity: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    marginTop: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  playerBadge: {
    backgroundColor: 'rgba(0,129,64,0.1)',
  },
  sportBadge: {
    backgroundColor: 'rgba(0,64,129,0.1)',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: landingFonts.sansBold,
    color: landingColors.plum,
  },
  empty: {
    color: landingColors.muted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    fontFamily: landingFonts.sansRegular,
  },
});
