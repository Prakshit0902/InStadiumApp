import { memo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';

type SearchSuggestion = {
  id: string;
  name: string;
  city: string;
  type?: 'stadium' | 'sport' | 'player';
  matchTerm?: string;
};

type Props = {
  horizontalPadding: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: SearchSuggestion[];
  onSelectSearchResult: (result: SearchSuggestion) => void;
  filterOptions: string[];
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
};

function NativeSearchStripBase({
  horizontalPadding,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  onSelectSearchResult,
  filterOptions,
  selectedFilter,
  onFilterSelect,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View style={[styles.section, { paddingHorizontal: horizontalPadding }]}> 
      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color={landingColors.subtle} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          placeholder="Search stadiums, cities, or sports"
          placeholderTextColor={landingColors.subtle}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="words"
        />
        <Pressable hitSlop={8} onPress={() => setShowFilters((prev) => !prev)}>
          <Ionicons name="options-outline" size={16} color={landingColors.subtle} style={styles.filterIcon} />
        </Pressable>
      </View>

      {showFilters ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterWrap}>
          {filterOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onFilterSelect(option);
                setShowFilters(false);
              }}
              style={({ pressed }) => [styles.filterChip, selectedFilter === option && styles.filterChipActive, pressed && styles.pressed]}>
              <Text style={[styles.filterChipText, selectedFilter === option && styles.filterChipTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {searchQuery.trim().length > 0 && searchResults.length > 0 ? (
        <View style={styles.dropdownWrap}>
          {searchResults.slice(0, 6).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onSelectSearchResult(item)}
              style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
              <View style={styles.dropdownTextWrap}>
                <View style={styles.dropdownTitleBar}>
                  <Text style={styles.dropdownName} numberOfLines={1}>{item.name}</Text>
                  {item.type && item.type !== 'stadium' && (
                    <View style={[styles.typeBadge, item.type === 'player' ? styles.playerBadge : styles.sportBadge]}>
                      <Text style={styles.typeBadgeText}>{item.type}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dropdownCity}>
                  {item.matchTerm ? `Matches: ${item.matchTerm}` : item.city}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={landingColors.subtle} style={{ opacity: 0.5 }} />
            </Pressable>
          ))}
        </View>
      ) : null}
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
  searchInput: {
    color: landingColors.subtle,
    fontSize: 14,
    flex: 1,
    fontFamily: landingFonts.sansRegular,
  },
  filterWrap: {
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.14)',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    borderColor: landingColors.rose,
    backgroundColor: landingColors.rose,
  },
  filterChipText: {
    color: landingColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  filterChipTextActive: {
    color: landingColors.blush,
  },
  dropdownWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(129,0,0,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownTextWrap: {
    flex: 1,
    gap: 2,
  },
  dropdownTitleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dropdownName: {
    color: landingColors.plum,
    fontSize: 15,
    fontFamily: landingFonts.serifRegular,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(129,0,0,0.05)',
  },
  playerBadge: {
    backgroundColor: 'rgba(0,129,64,0.08)',
  },
  sportBadge: {
    backgroundColor: 'rgba(0,64,129,0.08)',
  },
  typeBadgeText: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: landingColors.rose,
    fontFamily: landingFonts.sansSemiBold,
    letterSpacing: 0.5,
  },
  dropdownCity: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 8,
    fontFamily: landingFonts.sansSemiBold,
  },
  filterIcon: {
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.75,
  },
});
