import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { MatchItem } from './types';
import { formatDate } from './utils';

type Props = {
  matches: MatchItem[];
};

export function MatchesSection({ matches }: Props) {
  if (matches.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={150}>
      <View style={styles.section}>
        <SectionHeader kicker="Matches" title="Upcoming Spectacles" />
        {matches.map((match, index) => (
          <Pressable key={`${match.teams || index}-${index}`} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>{formatDate(match.date).split(' ')[0]}</Text>
              <Text style={styles.dateMonth}>{formatDate(match.date).split(' ').slice(1).join(' ')}</Text>
            </View>
            <View style={styles.contentWrap}>
              <Text style={styles.tournament}>{match.tournament || 'Featured Match'}</Text>
              <Text style={styles.teams}>{match.teams || 'Teams to be announced'}</Text>
              <View style={styles.ticketRow}>
                <Ionicons name="ticket-outline" size={13} color={landingColors.rose} />
                <Text style={styles.ticketText}>Reserve Seat</Text>
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
    paddingVertical: 10,
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
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ticketText: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
});
