import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EditorialDivider } from '@/components/landing/EditorialDivider';
import { FeaturedStadiums } from '@/components/landing/FeaturedStadiums';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { NearbyStadiums } from '@/components/landing/NearbyStadiums';
import { SportsGrid } from '@/components/landing/SportsGrid';
import { landingColors } from '@/components/landing/theme';
import { useFeaturedStadiums } from '@/components/landing/useFeaturedStadiums';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 900;
  const sidePadding = useMemo(() => (isTablet ? 44 : 20), [isTablet]);
  const featured = useFeaturedStadiums();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[0]}
        removeClippedSubviews>
        <LandingNavbar horizontalPadding={sidePadding} />

        <View style={styles.sectionsWrap}>
          <HeroSection horizontalPadding={sidePadding} isTablet={isTablet} onExplorePress={() => router.push('/explore')} />
          <SportsGrid horizontalPadding={sidePadding} />
          <EditorialDivider horizontalPadding={sidePadding} />
          <FeaturedStadiums
            horizontalPadding={sidePadding}
            featured={featured}
            onViewAllPress={() => router.push('/explore')}
          />
          <NearbyStadiums horizontalPadding={sidePadding} />
          <LandingFooter horizontalPadding={sidePadding} />
        </View>
      </ScrollView>
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
    paddingBottom: 24,
  },
  sectionsWrap: {
    backgroundColor: landingColors.blush,
  },
});
