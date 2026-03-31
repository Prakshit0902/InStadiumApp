import { memo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { getLocalStadiumImage } from './data';
import { landingColors, landingFonts } from './theme';
import { Stadium } from './types';

type Props = {
  horizontalPadding: number;
  featured: Stadium[];
  onViewAllPress: () => void;
  onStadiumPress: (stadiumId: string) => void;
};

function FeaturedStadiumsBase({ horizontalPadding, featured, onViewAllPress, onStadiumPress }: Props) {
  const cardWidth = 286;

  const getItemLayout = (_: ArrayLike<Stadium> | null | undefined, index: number) => ({
    length: cardWidth + 14,
    offset: (cardWidth + 14) * index,
    index,
  });

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.kicker}>Featured</Text>
          <Text style={styles.title}>
            Explore <Text style={styles.titleAccent}>Iconic</Text> Venues
          </Text>
        </View>

        <Pressable
          onPress={onViewAllPress}
          hitSlop={8}
          android_ripple={{ color: 'rgba(129, 0, 0, 0.10)', borderless: true }}
          style={({ pressed }) => [styles.viewAllButton, pressed && styles.viewAllPressed]}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={featured}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={16}
        windowSize={3}
        getItemLayout={getItemLayout}
        nestedScrollEnabled
        directionalLockEnabled
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onStadiumPress(item.id)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}>
            <Image
              source={getLocalStadiumImage(item.image)}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
              recyclingKey={item.id}
            />

            <View style={styles.metaRow}>
              <Text style={styles.meta}>{item.city}</Text>
              <Text style={styles.meta}>{item.sport ?? 'Sport'}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.capacityChip}>
              <Text style={styles.capacity}>Capacity: {(item.capacity ?? 0).toLocaleString()}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

export const FeaturedStadiums = memo(FeaturedStadiumsBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 26,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: landingFonts.serifRegular,
    fontWeight: '400',
  },
  titleAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  viewAllButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  viewAll: {
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.2,
    color: landingColors.muted,
    fontFamily: landingFonts.sansMedium,
  },
  viewAllPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  listContent: {
    paddingRight: 12,
    gap: 14,
  },
  card: {
    width: 286,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.14)',
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  image: {
    width: '100%',
    height: 290,
    borderRadius: 12,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  meta: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  name: {
    color: landingColors.plum,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  capacityChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(129, 0, 0, 0.09)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  capacity: {
    color: landingColors.subtle,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansMedium,
  },
});
