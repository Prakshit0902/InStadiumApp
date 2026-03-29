import { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EditorialDivider } from '@/components/landing/EditorialDivider';
import { FeaturedStadiums } from '@/components/landing/FeaturedStadiums';
import { HeroSection } from '@/components/landing/HeroSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { NearbyStadiums } from '@/components/landing/NearbyStadiums';
import { NativeSearchStrip } from '@/components/landing/NativeSearchStrip';
import { SportsGrid } from '@/components/landing/SportsGrid';
import { landingColors } from '@/components/landing/theme';
import { useFeaturedStadiums } from '@/components/landing/useFeaturedStadiums';

type LandingSectionKey = 'sports' | 'divider' | 'featured' | 'nearby' | 'footer';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 900;
  const sidePadding = useMemo(() => (isTablet ? 44 : 20), [isTablet]);
  const { featured, nearby, sports } = useFeaturedStadiums();
  const sections = useMemo<LandingSectionKey[]>(() => ['sports', 'divider', 'featured', 'nearby', 'footer'], []);

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
            />
          );
        case 'nearby':
          return <NearbyStadiums horizontalPadding={sidePadding} nearbyData={nearby} />;
        case 'footer':
          return <LandingFooter horizontalPadding={sidePadding} />;
        default:
          return null;
      }
    },
    [featured, nearby, router, sidePadding, sports]
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.sectionsWrap}>
        <LandingNavbar horizontalPadding={sidePadding} onScanPress={() => router.push('/scan')} />
        <NativeSearchStrip horizontalPadding={sidePadding} />
        <HeroSection horizontalPadding={sidePadding} isTablet={isTablet} onExplorePress={() => router.push('/explore')} />
      </View>
    ),
    [isTablet, router, sidePadding]
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
});
