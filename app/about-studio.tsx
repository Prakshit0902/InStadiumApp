import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { landingColors, landingFonts } from '@/components/landing/theme';

const pillars = [
  {
    num: '01',
    title: 'Heritage',
    desc: 'Preserving venue legacy through meticulous storytelling and historical detail.',
  },
  {
    num: '02',
    title: 'Atmosphere',
    desc: 'Capturing the sound, light, and pressure that define iconic matchdays.',
  },
  {
    num: '03',
    title: 'Access',
    desc: 'Delivering immersive digital entry into arenas where legends are made.',
  },
];

const keepers = [
  {
    name: 'Satyansh Singh',
    role: 'Founding Creator',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80',
  },
  {
    name: 'Prakshit Suthar',
    role: 'Founding Creator',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80',
  },
];

export default function AboutStudioScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.kicker}>Our Heritage</Text>
          <Text style={styles.heroTitle}>
            The Soul of{`\n`}
            <Text style={styles.heroAccent}>the Arena.</Text>
          </Text>
        </View>

        <View style={styles.aboutSplit}>
          <Image
            source="https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80"
            style={styles.heroImage}
            contentFit="cover"
            transition={150}
          />
          <Text style={styles.leadTitle}>
            Instadium was born from a singular obsession: to honor the monuments where legends are forged.
          </Text>
          <Text style={styles.paragraph}>
            We believe a stadium is more than steel and turf; it is a repository of collective memory, where silence before kickoff and the roar of thousands shape sporting history.
          </Text>
          <Text style={styles.paragraph}>
            Our platform blends architectural appreciation with matchday emotion, offering a premium portal into India&apos;s most iconic arenas.
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>14+</Text>
            <Text style={styles.metricLabel}>Elite Venues</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Core Sports</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>360°</Text>
            <Text style={styles.metricLabel}>Immersive Access</Text>
          </View>
        </View>

        <View style={styles.darkSection}>
          {pillars.map((pillar) => (
            <View key={pillar.title} style={styles.pillarCard}>
              <Text style={styles.pillarNum}>{pillar.num}</Text>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.pillarDesc}>{pillar.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.quoteSection}>
          <Text style={styles.quoteText}>
            “We don&apos;t just visit venues. We inhabit <Text style={styles.quoteAccent}>history</Text> where every roar, sweat, and victory pulses through the nation&apos;s heartbeat.”
          </Text>
        </View>

        <View style={styles.keepersSection}>
          <Text style={styles.kicker}>The Keepers</Text>
          <Text style={styles.sectionTitle}>
            Creators of the <Text style={styles.sectionAccent}>Arena</Text>
          </Text>
          {keepers.map((member) => (
            <View key={member.name} style={styles.keeperCard}>
              <Image source={member.image} style={styles.keeperImage} contentFit="cover" transition={120} />
              <Text style={styles.keeperRole}>{member.role}</Text>
              <Text style={styles.keeperName}>{member.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium Media</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: landingColors.blush,
  },
  content: {
    paddingBottom: 26,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  kicker: {
    color: landingColors.rose,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    marginBottom: 6,
    fontFamily: landingFonts.sansSemiBold,
  },
  heroTitle: {
    color: landingColors.plum,
    fontSize: 52,
    lineHeight: 50,
    letterSpacing: -0.8,
    fontFamily: landingFonts.serifRegular,
  },
  heroAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  aboutSplit: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroImage: {
    width: '100%',
    height: 360,
    borderRadius: 28,
    marginBottom: 14,
  },
  leadTitle: {
    color: landingColors.plum,
    fontSize: 29,
    lineHeight: 34,
    marginBottom: 12,
    fontFamily: landingFonts.serifRegular,
  },
  paragraph: {
    color: landingColors.muted,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 8,
    fontFamily: landingFonts.sansRegular,
  },
  metricsRow: {
    marginTop: 12,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricItem: {
    flex: 1,
  },
  metricValue: {
    color: landingColors.rose,
    fontSize: 36,
    lineHeight: 38,
    fontFamily: landingFonts.serifMediumItalic,
  },
  metricLabel: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
    fontFamily: landingFonts.sansSemiBold,
  },
  darkSection: {
    marginTop: 16,
    backgroundColor: landingColors.plum,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  pillarCard: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(238,235,221,0.14)',
    paddingTop: 12,
  },
  pillarNum: {
    color: 'rgba(129,0,0,0.55)',
    fontSize: 30,
    marginBottom: 6,
    fontFamily: landingFonts.serifMediumItalic,
  },
  pillarTitle: {
    color: landingColors.blush,
    fontSize: 24,
    marginBottom: 6,
    fontFamily: landingFonts.serifRegular,
  },
  pillarDesc: {
    color: 'rgba(238,235,221,0.66)',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
  },
  quoteSection: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
  },
  quoteText: {
    color: landingColors.plum,
    fontSize: 32,
    lineHeight: 38,
    fontFamily: landingFonts.serifRegular,
  },
  quoteAccent: {
    color: landingColors.rose,
    fontFamily: landingFonts.serifMediumItalic,
  },
  keepersSection: {
    marginTop: 10,
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    color: landingColors.plum,
    fontSize: 38,
    lineHeight: 42,
    fontFamily: landingFonts.serifRegular,
  },
  sectionAccent: {
    fontFamily: landingFonts.serifMediumItalic,
  },
  keeperCard: {
    marginTop: 4,
  },
  keeperImage: {
    width: '100%',
    height: 310,
    borderRadius: 22,
    marginBottom: 8,
  },
  keeperRole: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
  },
  keeperName: {
    color: landingColors.plum,
    fontSize: 32,
    lineHeight: 36,
    fontFamily: landingFonts.serifMediumItalic,
  },
  footerSection: {
    marginTop: 14,
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
