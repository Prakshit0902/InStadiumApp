import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { MatchItem } from './types';
import { formatDate } from './utils';

type Props = {
  matches: MatchItem[];
  stadiumName: string;
  city?: string;
};

// Map our city names to BookMyShow city URL slugs
const BMS_CITY_SLUGS: Record<string, string> = {
  ahmedabad: 'ahmedabad',
  mumbai: 'mumbai',
  kolkata: 'kolkata',
  bengaluru: 'bengaluru',
  bangalore: 'bengaluru',
  delhi: 'ncr',
  hyderabad: 'hyderabad',
  chennai: 'chennai',
  pune: 'pune',
  jaipur: 'jaipur',
  lucknow: 'lucknow',
};

function buildBMSUrl(match: MatchItem, city?: string): string {
  // If a direct BMS event page URL is hardcoded, use it immediately
  if (match.bmsUrl) return match.bmsUrl;

  // Build a fallback search query from match info
  const query = [match.teams, match.tournament]
    .filter(Boolean)
    .join(' ')
    .replace(/[—–]/g, '')
    .trim();

  const encoded = encodeURIComponent(query);

  const citySlug = city
    ? BMS_CITY_SLUGS[city.toLowerCase().trim()] || null
    : null;

  if (citySlug) {
    return `https://in.bookmyshow.com/search?q=${encoded}&category=sports&city=${citySlug}`;
  }

  return `https://in.bookmyshow.com/search?q=${encoded}&category=sports`;
}

function withFallbackMatches(matches: MatchItem[], stadiumName: string, city?: string): MatchItem[] {
  if (matches.length > 0) {
    return matches;
  }

  const place = city ? `${stadiumName}, ${city}` : stadiumName;
  return [
    { teams: 'India XI vs Rest of World XI', date: '2026-06-14', tournament: `InStadium Prime Night • ${place}` },
    { teams: 'Legends All Stars vs National Select', date: '2026-07-02', tournament: `Champions Cup • ${place}` },
    { teams: 'City Rivals Derby', date: '2026-07-19', tournament: `Weekend Derby • ${place}` },
  ];
}

export function MatchesSection({ matches, stadiumName, city }: Props) {
  const materializedMatches = withFallbackMatches(matches, stadiumName, city);

  const openBMS = (match: MatchItem) => {
    const url = buildBMSUrl(match, city);
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <AnimatedReveal delay={150}>
      <View style={styles.section}>
        <SectionHeader kicker="Matches" title="Upcoming Spectacles" />
        {materializedMatches.map((match, index) => (
          <Pressable
            key={`${match.teams || index}-${index}`}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => openBMS(match)}
          >
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{formatDate(match.date).split(' ')[0]}</Text>
              <Text style={styles.dateMonth}>{formatDate(match.date).split(' ').slice(1).join(' ')}</Text>
            </View>
            <View style={styles.contentWrap}>
              <Text style={styles.tournament}>{match.tournament || 'Featured Match'}</Text>
              <Text style={styles.teams}>{match.teams || 'Teams to be announced'}</Text>
              <View style={styles.metaLine}>
                <Ionicons name="location-outline" size={13} color={landingColors.subtle} />
                <Text style={styles.metaText}>{city ? `${stadiumName}, ${city}` : stadiumName}</Text>
              </View>
              <View style={styles.metaLine}>
                <Ionicons name="time-outline" size={13} color={landingColors.subtle} />
                <Text style={styles.metaText}>Gates open 2 hours before kickoff</Text>
              </View>
              <View style={styles.ticketRow}>
                <Ionicons name="ticket-outline" size={13} color={landingColors.rose} />
                <Text style={styles.ticketText}>Book on BookMyShow</Text>
                <Ionicons name="open-outline" size={11} color={landingColors.rose} style={styles.externalIcon} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </AnimatedReveal>
  );
}


const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  dateBadge: {
    width: 66,
    borderRadius: 13,
    backgroundColor: landingColors.plum,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateDay: {
    color: landingColors.blush,
    fontSize: 22,
    lineHeight: 24,
    fontFamily: landingFonts.serifRegular,
  },
  dateMonth: {
    color: 'rgba(238, 235, 221, 0.7)',
    fontSize: 9,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: landingFonts.sansSemiBold,
  },
  contentWrap: {
    flex: 1,
  },
  tournament: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 9,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  teams: {
    color: landingColors.plum,
    fontSize: 19,
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: landingFonts.serifRegular,
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  metaText: {
    color: landingColors.muted,
    fontSize: 10,
    letterSpacing: 0.2,
    fontFamily: landingFonts.sansMedium,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  ticketText: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
    flex: 1,
  },
  externalIcon: {
    marginLeft: 2,
  },
});
