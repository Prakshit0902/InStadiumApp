import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { landingColors, landingFonts } from '@/components/landing/theme';

const showcases = [
  {
    title: 'International Finals Coverage',
    type: 'Editorial Series',
    image: 'https://images.unsplash.com/photo-1540744158800-4785387f481c?q=80',
  },
  {
    title: 'Legendary Venues Documentary',
    type: 'Video Project',
    image: 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80',
  },
  {
    title: 'Matchday Experience Archive',
    type: 'Immersive Guide',
    image: 'https://images.unsplash.com/photo-1570498839593-e565b39455fc?q=80',
  },
];

export default function PortfolioScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Portfolio</Text>
          <Text style={styles.title}>
            Signature <Text style={styles.accent}>Works</Text>
          </Text>
          <Text style={styles.subtitle}>
            A curated archive of Instadium projects spanning live coverage, editorial storytelling, and immersive venue guides.
          </Text>
        </View>

        <View style={styles.gridWrap}>
          {showcases.map((item) => (
            <View key={item.title} style={styles.card}>
              <Image source={item.image} style={styles.cardImage} contentFit="cover" transition={120} />
              <Text style={styles.cardType}>{item.type}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statementWrap}>
          <Text style={styles.statement}>
            Every project balances <Text style={styles.statementAccent}>heritage</Text>, atmosphere, and access, designed to bring fans closer to iconic sporting moments.
          </Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: landingColors.blush },
  content: { paddingBottom: 26 },
  hero: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: 6,
    fontFamily: landingFonts.sansSemiBold,
  },
  title: {
    color: landingColors.plum,
    fontSize: 50,
    lineHeight: 52,
    marginBottom: 8,
    fontFamily: landingFonts.serifRegular,
  },
  accent: { fontFamily: landingFonts.serifMediumItalic },
  subtitle: {
    color: landingColors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: landingFonts.sansRegular,
  },
  gridWrap: {
    marginTop: 8,
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.10)',
    padding: 10,
  },
  cardImage: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    marginBottom: 8,
  },
  cardType: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  cardTitle: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 33,
    fontFamily: landingFonts.serifRegular,
  },
  statementWrap: {
    marginTop: 14,
    paddingHorizontal: 20,
  },
  statement: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 36,
    fontFamily: landingFonts.serifRegular,
  },
  statementAccent: {
    color: landingColors.rose,
    fontFamily: landingFonts.serifMediumItalic,
  },
  footerSection: {
    marginTop: 16,
    marginHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(129, 0, 0, 0.22)',
    alignItems: 'center',
  },
  footerMeta: {
    color: landingColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 9,
    fontFamily: landingFonts.sansMedium,
  },
});
