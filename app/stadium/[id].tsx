import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SectionHeader } from '@/components/stadium/SectionHeader';
import { StadiumHeroSection } from '@/components/stadium/StadiumHeroSection';
import { GallerySection } from '@/components/stadium/GallerySection';
import { TimelineSection } from '@/components/stadium/TimelineSection';
import { MatchesSection } from '@/components/stadium/MatchesSection';
import { PlayersSection } from '@/components/stadium/PlayersSection';
import { LocationSection } from '@/components/stadium/MapsSection';
import { NearbyStadiumsSection } from '@/components/stadium/NearbyStadiumsSection';
import { useStadiumDetail } from '@/components/stadium/use-stadium-detail';
import { firstGalleryUrl } from '@/components/stadium/utils';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors } from '@/components/landing/theme';
import { stadiumDetailStyles as styles } from '@/components/stadium/StadiumDetailStyles';

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    loading,
    error,
    stadium,
    players,
    gallery,
    timeline,
    matches,
    primarySport,
    nearbyStadiums,
  } = useStadiumDetail(id);

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
        <StadiumHeroSection
          imageSource={heroImage}
          name={stadium.name}
          city={stadium.city}
          state={stadium.state}
          capacity={stadium.capacity}
          builtYear={stadium.builtYear}
          sportsLabel={stadium.sportsPlayed?.map((x) => x.name).join(', ') || ''}
        />

        {!!stadium.description && (
          <View style={styles.overviewSection}>
            <SectionHeader kicker="Overview" title="About this Arena" />
            <Text style={styles.overviewText}>{stadium.description}</Text>
          </View>
        )}

        <View style={styles.sectionGap}>
          <GallerySection gallery={gallery} />
        </View>

        <View style={styles.sectionGap}>
          <TimelineSection timeline={timeline} />
        </View>

        <View style={styles.sectionGap}>
          <MatchesSection matches={matches} stadiumName={stadium.name} city={stadium.city} />
        </View>

        <View style={styles.sectionGap}>
          <PlayersSection players={players} fallbackSport={primarySport?.name} />
        </View>

        <View style={styles.sectionGap}>
          <LocationSection name={stadium.name} latitude={stadium.latitude} longitude={stadium.longitude} />
        </View>

        <View style={styles.sectionGap}>
          <NearbyStadiumsSection stadiums={nearbyStadiums} />
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
