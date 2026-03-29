import { memo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { sports } from './data';
import { SportItem } from './types';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  sportsData?: SportItem[];
};

function SportsGridBase({ horizontalPadding, sportsData = sports }: Props) {
  const cardWidth = 132;

  const getItemLayout = (_: ArrayLike<SportItem> | null | undefined, index: number) => ({
    length: cardWidth + 10,
    offset: (cardWidth + 10) * index,
    index,
  });

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.kicker}>Quick Actions</Text>
      <Text style={styles.title}>Browse By Sport</Text>

      <FlatList
        horizontal
        data={sportsData}
        keyExtractor={(item) => item.name}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={16}
        windowSize={5}
        getItemLayout={getItemLayout}
        nestedScrollEnabled
        directionalLockEnabled
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => Alert.alert('Sport Route', `${item.name} screen will be wired in the next phase.`)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)' }}>
            <View style={styles.iconWrap}>
              <Image source={item.icon} style={styles.icon} contentFit="contain" cachePolicy="memory-disk" transition={0} />
            </View>
            <Text style={styles.meta}>Discover</Text>
            <Text style={styles.label}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

export const SportsGrid = memo(SportsGridBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 26,
    paddingBottom: 24,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2.3,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 12,
    fontFamily: landingFonts.serifMedium,
  },
  listContent: {
    gap: 10,
    paddingRight: 10,
  },
  card: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.13)',
    alignItems: 'flex-start',
    gap: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: landingColors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: landingColors.blush,
  },
  meta: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    fontSize: 9,
    letterSpacing: 1.1,
    marginBottom: 2,
    fontFamily: landingFonts.sansMedium,
  },
  label: {
    color: landingColors.plum,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1,
    fontFamily: landingFonts.sansSemiBold,
  },
});
