import { memo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { sports } from './data';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function SportsGridBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Text style={styles.title}>
        Browse by <Text style={styles.titleAccent}>Sport</Text>
      </Text>
      <View style={styles.bar} />

      <View style={styles.grid}>
        {sports.map((sport) => (
          <Pressable
            key={sport.name}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => Alert.alert('Sport Route', `${sport.name} screen will be wired in the next phase.`)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}>
            <View style={styles.iconWrap}>
              <Image source={sport.icon} style={styles.icon} contentFit="contain" cachePolicy="memory-disk" />
            </View>
            <Text style={styles.label}>{sport.name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export const SportsGrid = memo(SportsGridBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 42,
    paddingBottom: 40,
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
  bar: {
    width: 66,
    height: 4,
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '31%',
    minWidth: 96,
    backgroundColor: landingColors.blush,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.15)',
    alignItems: 'center',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 13,
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
  label: {
    color: landingColors.muted,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1.4,
    textAlign: 'center',
    fontFamily: landingFonts.sansSemiBold,
  },
});
