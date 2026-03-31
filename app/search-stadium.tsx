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
      return [] as ApiStadium[];
    }

    return stadiums.filter((item) => item.name.toLowerCase().includes(q) || item.city.toLowerCase().includes(q));
  }, [query, stadiums]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={landingColors.subtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Type stadium or city"
            placeholderTextColor={landingColors.subtle}
            autoFocus
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsWrap}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.resultItem, pressed && styles.resultPressed]}
              onPress={() => router.push(`/stadium/${encodeURIComponent(item.id)}`)}>
              <View>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={styles.resultCity}>{item.city}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={landingColors.subtle} />
            </Pressable>
          )}
          ListEmptyComponent={
            query.trim().length > 0 ? <Text style={styles.empty}>No matching stadiums found.</Text> : <Text style={styles.empty}>Start typing to search stadiums.</Text>
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
  empty: {
    color: landingColors.muted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    fontFamily: landingFonts.sansRegular,
  },
});
