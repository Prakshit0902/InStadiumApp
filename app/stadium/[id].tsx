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
import { resolveStadiumImage } from '@/components/landing/data';
import { landingColors } from '@/components/landing/theme';
import { stadiumDetailStyles as styles } from '@/components/stadium/StadiumDetailStyles';
import { GridLoader } from '@/components/ui/GridLoader';
import { EntranceView } from '@/components/ui/EntranceView';

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


  if (!loading && (error || !stadium)) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
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

  const heroImage = stadium ? resolveStadiumImage(stadium) : null;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Stack.Screen options={{ title: stadium?.name || 'Stadium', headerShown: true, headerTintColor: landingColors.plum }} />
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
            <EntranceView delay={0}>
          <StadiumHeroSection
            imageSource={heroImage}
            name={stadium.name}
            city={stadium.city}
            state={stadium.state}
            capacity={stadium.capacity}
            builtYear={stadium.builtYear}
            sportsLabel={stadium.sportsPlayed?.map((x) => x.name).join(', ') || ''}
          />
        </EntranceView>

        {!!stadium.description && (
          <EntranceView delay={0}>
            <View style={styles.overviewSection}>
              <SectionHeader kicker="Overview" title="About this Arena" />
              <Text style={styles.overviewText}>{stadium.description}</Text>
            </View>
          </EntranceView>
        )}

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <GallerySection gallery={gallery} />
          </View>
        </EntranceView>

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <TimelineSection timeline={timeline} />
          </View>
        </EntranceView>

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <MatchesSection matches={matches} stadiumName={stadium.name} city={stadium.city} />
          </View>
        </EntranceView>

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <PlayersSection players={players} fallbackSport={primarySport?.name} />
          </View>
        </EntranceView>

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <LocationSection name={stadium.name} latitude={stadium.latitude} longitude={stadium.longitude} />
          </View>
        </EntranceView>

        <EntranceView delay={0}>
          <View style={styles.sectionGap}>
            <NearbyStadiumsSection stadiums={nearbyStadiums} />
          </View>
        </EntranceView>

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium</Text>
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
