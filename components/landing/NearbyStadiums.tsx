import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { nearbyStadiums } from './data';
import { NearbyStadium } from './types';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  nearbyData?: NearbyStadium[];
  onStadiumPress: (stadiumId: string) => void;
};

function NearbyStadiumsBase({ horizontalPadding, nearbyData = nearbyStadiums, onStadiumPress }: Props) {
  const cardWidth = 286;

  const getItemLayout = (_: ArrayLike<NearbyStadium> | null | undefined, index: number) => ({
    length: cardWidth + 14,
    offset: (cardWidth + 14) * index,
    index,
  });

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.overline}>Nearby</Text>
      <Text style={styles.title}>
        Recommended <Text style={styles.titleAccent}>Arenas</Text>
      </Text>

      <FlatList
        horizontal
        data={nearbyData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={16}
        windowSize={4}
        getItemLayout={getItemLayout}
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onStadiumPress(item.id)}
            android_ripple={{ color: 'rgba(238, 235, 221, 0.20)' }}>
            <Image
              source={item.image}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
              recyclingKey={item.id}
            />
            <View style={styles.overlay} />
            <View style={styles.textWrap}>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{item.distance}</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.cityRow}>
                <Ionicons name="location-outline" size={12} color="rgba(238, 235, 221, 0.86)" />
                <Text style={styles.city}>{item.city}</Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

export const NearbyStadiums = memo(NearbyStadiumsBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 24,
    paddingBottom: 22,
    gap: 12,
  },
  overline: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 34,
    lineHeight: 40,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
    fontWeight: '400',
  },
  titleAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  listContent: {
    paddingRight: 10,
    gap: 14,
  },
  card: {
    width: 286,
    height: 268,
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ scale: 0.988 }],
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.35)',
  },
  textWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 6,
  },
  distanceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(129, 0, 0, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 3,
  },
  distanceText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    fontSize: 9,
    letterSpacing: 1.3,
    fontFamily: landingFonts.sansSemiBold,
  },
  name: {
    color: landingColors.blush,
    fontSize: 29,
    lineHeight: 32,
    fontStyle: 'italic',
    fontFamily: landingFonts.serifMedium,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  city: {
    color: 'rgba(238, 235, 221, 0.76)',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: landingFonts.sansSemiBold,
  },
});
