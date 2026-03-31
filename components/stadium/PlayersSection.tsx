import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { getLocalStadiumImage } from '@/components/landing/data';
import { landingColors, landingFonts } from '@/components/landing/theme';
import { AnimatedReveal } from './AnimatedReveal';
import { SectionHeader } from './SectionHeader';
import { ApiPlayer } from './types';

type Props = {
  players: ApiPlayer[];
  fallbackSport?: string;
};

export function PlayersSection({ players, fallbackSport }: Props) {
  const router = useRouter();

  if (players.length === 0) {
    return null;
  }

  return (
    <AnimatedReveal delay={180}>
      <View style={[styles.section, styles.darkSection]}>
        <SectionHeader kicker="Players" title="Iconic Figures" light />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playerList}>
          {players.map((player) => (
            <Pressable
              key={player.id}
              style={({ pressed }) => [styles.playerCard, pressed && styles.playerCardPressed]}
              onPress={() =>
                router.push({
                  pathname: '/player/[id]',
                  params: {
                    id: player.id,
                    name: player.name,
                    image: player.image || '',
                    sport: player.sport?.name || fallbackSport || '',
                    country: player.country || '',
                  },
                })
              }>
              <Image
                source={player.image ? getLocalStadiumImage(player.image) : getLocalStadiumImage(undefined)}
                style={styles.playerImage}
                contentFit="cover"
              />
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerRole}>{player.sport?.name || fallbackSport || 'Player'}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </AnimatedReveal>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 10,
  },
  darkSection: {
    backgroundColor: landingColors.plum,
    marginHorizontal: 20,
    borderRadius: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  playerList: {
    gap: 14,
    paddingRight: 12,
    paddingTop: 4,
  },
  playerCard: {
    width: 182,
  },
  playerCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  playerImage: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    marginBottom: 8,
  },
  playerName: {
    color: landingColors.blush,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: landingFonts.serifRegular,
  },
  playerRole: {
    color: 'rgba(238, 235, 221, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    marginTop: 3,
    fontFamily: landingFonts.sansSemiBold,
  },
});
