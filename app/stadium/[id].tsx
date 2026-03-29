import { useState } from 'react';
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
import { GlobalMapSection, LocationSection } from '@/components/stadium/MapsSection';
import { NearbyStadiumsSection } from '@/components/stadium/NearbyStadiumsSection';
import { RulebookSection } from '@/components/stadium/RulebookSection';
import { NearbyPlacesSection } from '@/components/stadium/NearbyPlacesSection';
import { useStadiumDetail } from '@/components/stadium/use-stadium-detail';
import { firstGalleryUrl } from '@/components/stadium/utils';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors } from '@/components/landing/theme';
import { stadiumDetailStyles as styles } from '@/components/stadium/StadiumDetailStyles';

export default function StadiumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeRuleIndex, setActiveRuleIndex] = useState(0);

  const {
    loading,
    error,
    stadium,
    players,
    gallery,
    timeline,
    matches,
    nearbyPlaces,
    stadiumSports,
    primarySport,
    nearbyStadiums,
    globalMapList,
    ruleSections,
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
          sportsLabel={stadiumSports.map((x) => x.name).join(', ')}
        />

        {!!stadium.description && (
          <View style={styles.overviewSection}>
            <SectionHeader kicker="Overview" title="About this Arena" />
            <Text style={styles.overviewText}>{stadium.description}</Text>
          </View>
        )}

        <GallerySection gallery={gallery} />
        <TimelineSection timeline={timeline} />
        <MatchesSection matches={matches} />
        <PlayersSection players={players} fallbackSport={primarySport?.name} />
        <LocationSection name={stadium.name} latitude={stadium.latitude} longitude={stadium.longitude} />
        <GlobalMapSection currentStadiumId={stadium.id} stadiums={globalMapList} />
        <NearbyStadiumsSection stadiums={nearbyStadiums} />

        {primarySport && (
          <RulebookSection
            sportName={primarySport.name}
            sections={ruleSections}
            activeIndex={activeRuleIndex}
            onSelect={setActiveRuleIndex}
          />
        )}

        <NearbyPlacesSection places={nearbyPlaces} />
      </ScrollView>
    </SafeAreaView>
  );
}
