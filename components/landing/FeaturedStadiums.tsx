import { memo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { getLocalStadiumImage } from './data';
import { landingColors, landingFonts } from './theme';
import { Stadium } from './types';

type Props = {
  horizontalPadding: number;
  featured: Stadium[];
  onViewAllPress: () => void;
};

function FeaturedStadiumsBase({ horizontalPadding, featured, onViewAllPress }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.title}>
        Explore <Text style={styles.titleAccent}>Iconic</Text> Venues
      </Text>

      <Pressable onPress={onViewAllPress} hitSlop={8}>
        <Text style={styles.viewAll}>View All Stadiums</Text>
      </Pressable>

      <FlatList
        horizontal
        data={featured}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable
            onPress={() => Alert.alert(item.name, 'Stadium detail route will be wired in the next phase.')}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}>
            <Image
              source={getLocalStadiumImage(item.image)}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />

            <View style={styles.metaRow}>
              <Text style={styles.meta}>{item.city}</Text>
              <Text style={styles.meta}>{item.sport ?? 'Sport'}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.capacity}>Capacity: {(item.capacity ?? 0).toLocaleString()}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

export const FeaturedStadiums = memo(FeaturedStadiumsBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 50,
    paddingBottom: 34,
  },
  title: {
    color: landingColors.plum,
    fontSize: 34,
    lineHeight: 42,
    textAlign: 'center',
    fontFamily: landingFonts.serifRegular,
  },
  titleAccent: {
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
  },
  viewAll: {
    textTransform: 'uppercase',
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 1.9,
    color: landingColors.muted,
    marginTop: 10,
    marginBottom: 18,
    fontFamily: landingFonts.sansMedium,
  },
  listContent: {
    paddingRight: 10,
    gap: 14,
  },
  card: {
    width: 285,
    backgroundColor: landingColors.blush,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
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
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 7,
    fontFamily: landingFonts.serifRegular,
  },
  capacity: {
    color: landingColors.subtle,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: landingFonts.sansMedium,
  },
});
