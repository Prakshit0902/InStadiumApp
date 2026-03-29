import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { getLocalStadiumImage } from '@/components/landing/data';

type ApiGalleryImage = {
  url?: string;
};

type ApiSport = {
  id: string;
  name: string;
};

type ApiStadium = {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  capacity?: number;
  description?: string;
  builtYear?: number;
  galleryImages?: ApiGalleryImage[] | null;
  sportsPlayed?: ApiSport[];
};

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : '';
}

function normalizeImageUrl(stadium: ApiStadium) {
  const fromGallery = Array.isArray(stadium.galleryImages)
    ? stadium.galleryImages.find((item) => typeof item?.url === 'string' && item.url)?.url
    : undefined;

  return fromGallery || getLocalStadiumImage('');
}

export default function StadiumScreen() {
  const { id, welcome } = useLocalSearchParams<{ id: string; welcome?: string }>();
  const [stadium, setStadium] = useState<ApiStadium | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  useEffect(() => {
    if (!id || !apiBaseUrl) {
      setLoading(false);
      if (!apiBaseUrl) {
        setError('Missing EXPO_PUBLIC_API_BASE_URL.');
      }
      return;
    }

    let mounted = true;

    fetch(`${apiBaseUrl}/api/stadiums/${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch stadium (${response.status})`);
        }

        return (await response.json()) as ApiStadium;
      })
      .then((data) => {
        if (!mounted) {
          return;
        }

        setStadium(data);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setError('Unable to load stadium details.');
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#810000" />
        <Text style={styles.info}>Loading stadium details...</Text>
      </View>
    );
  }

  if (error || !stadium) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Stadium Unavailable</Text>
        <Text style={styles.info}>{error || 'Could not find this stadium.'}</Text>
      </View>
    );
  }

  const imageSource = normalizeImageUrl(stadium);
  const showWelcome = welcome === '1' || welcome === 'true';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome && (
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeLabel}>Welcome</Text>
          <Text style={styles.welcomeText}>Welcome to {stadium.name}! Enjoy your visit.</Text>
        </View>
      )}

      <Image source={imageSource} style={styles.hero} contentFit="cover" />

      <View style={styles.content}>
        <Text style={styles.city}>{stadium.city}</Text>
        <Text style={styles.name}>{stadium.name}</Text>

        <View style={styles.metaWrap}>
          <Text style={styles.meta}>Capacity: {(stadium.capacity || 0).toLocaleString()}</Text>
          <Text style={styles.meta}>Built: {stadium.builtYear || 'N/A'}</Text>
          <Text style={styles.meta}>Country: {stadium.country || 'N/A'}</Text>
        </View>

        {!!stadium.description && <Text style={styles.description}>{stadium.description}</Text>}

        {!!stadium.sportsPlayed?.length && (
          <View style={styles.sportsWrap}>
            <Text style={styles.sportsTitle}>Sports Played</Text>
            <Text style={styles.sportsText}>{stadium.sportsPlayed.map((item) => item.name).join(', ')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 28,
    backgroundColor: '#faf7f2',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    backgroundColor: '#faf7f2',
  },
  errorTitle: {
    color: '#2d1e1e',
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    color: '#5b4d4d',
    fontSize: 14,
    textAlign: 'center',
  },
  welcomeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#ffe8dd',
    borderWidth: 1,
    borderColor: '#f4c6aa',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  welcomeLabel: {
    color: '#810000',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  welcomeText: {
    color: '#3b2a2a',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  hero: {
    height: 260,
    width: '100%',
    backgroundColor: '#ded6d1',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  city: {
    color: '#6a5757',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 11,
    fontWeight: '700',
  },
  name: {
    color: '#2d1e1e',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  metaWrap: {
    gap: 4,
  },
  meta: {
    color: '#5f4f4f',
    fontSize: 14,
  },
  description: {
    color: '#3e3030',
    fontSize: 15,
    lineHeight: 23,
  },
  sportsWrap: {
    marginTop: 2,
    backgroundColor: '#f4ece8',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  sportsTitle: {
    color: '#5d4646',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  sportsText: {
    color: '#2e2222',
    fontSize: 15,
    lineHeight: 21,
  },
});
