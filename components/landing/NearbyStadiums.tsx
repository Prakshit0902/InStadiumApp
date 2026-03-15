import { memo } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { nearbyStadiums } from './data';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function NearbyStadiumsBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.overline}>Nearby</Text>
      <Text style={styles.title}>
        Recommended <Text style={styles.titleAccent}>Arenas</Text>
      </Text>

      <FlatList
        horizontal
        data={nearbyStadiums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => Alert.alert(item.name, 'Nearby stadium detail route will be added in next phase.')}
            android_ripple={{ color: 'rgba(238, 235, 221, 0.20)' }}>
            <Image source={item.image} style={styles.image} contentFit="cover" cachePolicy="memory-disk" transition={180} />
            <View style={styles.overlay} />
            <View style={styles.textWrap}>
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{item.distance}</Text>
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.city}>{item.city}</Text>
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: landingColors.border,
    paddingTop: 44,
    paddingBottom: 28,
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
    fontSize: 42,
    lineHeight: 48,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  titleAccent: {
    fontFamily: landingFonts.serifMedium,
    fontStyle: 'italic',
  },
  listContent: {
    paddingRight: 8,
    gap: 14,
  },
  card: {
    width: 300,
    height: 290,
    borderRadius: 28,
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
    fontSize: 32,
    lineHeight: 34,
    fontStyle: 'italic',
    fontFamily: landingFonts.serifMedium,
  },
  city: {
    color: 'rgba(238, 235, 221, 0.76)',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: landingFonts.sansSemiBold,
  },
});
