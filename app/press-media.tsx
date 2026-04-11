import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { landingColors, landingFonts } from '@/components/landing/theme';

const releases = [
  {
    title: 'Instadium launches immersive venue guides',
    date: 'Jan 2026',
    outlet: 'Sports Business India',
    image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80',
  },
  {
    title: 'Digital storytelling for iconic Indian arenas',
    date: 'Feb 2026',
    outlet: 'The Matchday Review',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80',
  },
  {
    title: 'How fans discover stadium history in one tap',
    date: 'Mar 2026',
    outlet: 'Arena Tech Journal',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80',
  },
];

export default function PressMediaScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Press & Media</Text>
          <Text style={styles.title}>
            Instadium in the <Text style={styles.accent}>Newsroom</Text>
          </Text>
          <Text style={styles.subtitle}>
            Official announcements, media coverage, and editorial highlights around our work in sports storytelling.
          </Text>
        </View>

        <View style={styles.listWrap}>
          {releases.map((item) => (
            <View key={item.title} style={styles.releaseCard}>
              <Image source={item.image} style={styles.releaseImage} contentFit="cover" transition={120} />
              <Text style={styles.releaseMeta}>{item.date} • {item.outlet}</Text>
              <Text style={styles.releaseTitle}>{item.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contactPanel}>
          <Text style={styles.contactHeading}>Media Contact</Text>
          <Text style={styles.contactText}>hello@instadium.com</Text>
          <Text style={styles.contactSubtext}>For press kits, interview requests, and speaking opportunities.</Text>
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
    fontSize: 48,
    lineHeight: 50,
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
  listWrap: {
    marginTop: 10,
    paddingHorizontal: 20,
    gap: 12,
  },
  releaseCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  releaseImage: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    marginBottom: 8,
  },
  releaseMeta: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  releaseTitle: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 34,
    fontFamily: landingFonts.serifRegular,
  },
  contactPanel: {
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.14)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 14,
  },
  contactHeading: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  contactText: {
    color: landingColors.plum,
    fontSize: 30,
    lineHeight: 34,
    marginBottom: 4,
    fontFamily: landingFonts.serifMediumItalic,
  },
  contactSubtext: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 19,
    fontFamily: landingFonts.sansRegular,
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
