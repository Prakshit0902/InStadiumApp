import { memo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
};

function NativeSearchStripBase({ horizontalPadding }: Props) {
  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <Pressable
        onPress={() => Alert.alert('Coming Soon', 'Search flow will be connected in the next phase.')}
        android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}
        style={({ pressed }) => [styles.searchField, pressed && styles.pressed]}>
        <Ionicons name="search" size={18} color={landingColors.subtle} />
        <Text style={styles.searchText}>Search stadiums, cities, or sports</Text>
        <Ionicons name="options-outline" size={16} color={landingColors.subtle} style={styles.filterIcon} />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
        {['Near me', 'Live events', 'Top rated', 'Family friendly'].map((chip) => (
          <Pressable
            key={chip}
            onPress={() => Alert.alert('Coming Soon', `${chip} filter will be connected in the next phase.`)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.10)' }}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export const NativeSearchStrip = memo(NativeSearchStripBase);

const styles = StyleSheet.create({
  section: {
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  searchField: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  searchText: {
    color: landingColors.subtle,
    fontSize: 14,
    flex: 1,
    fontFamily: landingFonts.sansRegular,
  },
  filterIcon: {
    opacity: 0.85,
  },
  chipsWrap: {
    gap: 9,
    paddingRight: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.08)',
    backgroundColor: 'rgba(129, 0, 0, 0.08)',
  },
  chipText: {
    color: landingColors.muted,
    fontSize: 11,
    letterSpacing: 0.6,
    fontFamily: landingFonts.sansMedium,
  },
  pressed: {
    opacity: 0.75,
  },
});
