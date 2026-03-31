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
import { useAuth } from '@/hooks/use-auth';

type LandingSectionKey = 'sports' | 'divider' | 'featured' | 'nearby' | 'footer';

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width >= 900;
  const sidePadding = useMemo(() => (isTablet ? 44 : 20), [isTablet]);
  const { featured, nearby, sports } = useFeaturedStadiums();
  const sections = useMemo<LandingSectionKey[]>(() => ['sports', 'divider', 'featured', 'nearby', 'footer'], []);

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
        router.push('/modal');
        return;
      }

      openExplore({ q: '', sport: 'All' });
    },
    [openExplore, router]
  );

  const handleChipPress = useCallback(
    (chip: 'Near me' | 'Live events' | 'Top rated' | 'Family friendly') => {
      if (chip === 'Near me') {
        openExplore({ q: 'Mumbai' });
        return;
      }

      if (chip === 'Top rated') {
        openExplore({ q: 'Stadium' });
        return;
      }

      if (chip === 'Live events') {
        router.push('/sports');
        return;
      }

      openExplore({ q: 'India' });
    },
    [openExplore, router]
  );

  const handleHeroPillPress = useCallback(
    (pill: 'Live Events' | 'Nearby' | 'Top Rated') => {
      if (pill === 'Live Events') {
        router.push('/sports');
        return;
      }

      if (pill === 'Nearby') {
        openExplore({ q: 'Mumbai' });
        return;
      }

      openExplore({ q: 'Stadium' });
    },
    [openExplore, router]
  );

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
          onSearchPress={() => openExplore()}
          onNotificationsPress={() => router.push('/modal')}
          onTabPress={handleNavbarTabPress}
          onProfilePress={() => router.push('/auth')}
          isAuthenticated={isAuthenticated}
        />
        <NativeSearchStrip
          horizontalPadding={sidePadding}
          onSearchPress={() => openExplore()}
          onFilterPress={() => openExplore({ sport: 'All' })}
          onChipPress={handleChipPress}
        />
        <HeroSection
          horizontalPadding={sidePadding}
          isTablet={isTablet}
          onExplorePress={() => openExplore()}
          onQuickTourPress={() => router.push('/sports')}
          onQuickPillPress={handleHeroPillPress}
        />
      </View>
    ),
    [handleChipPress, handleHeroPillPress, handleNavbarTabPress, isAuthenticated, isTablet, openExplore, router, sidePadding]
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
