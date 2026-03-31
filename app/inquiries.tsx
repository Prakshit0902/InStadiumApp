import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { landingColors, landingFonts } from '@/components/landing/theme';

export default function InquiriesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Inquiries</Text>
          <Text style={styles.title}>
            Let&apos;s Build an <Text style={styles.accent}>Extraordinary</Text> Experience
          </Text>
          <Text style={styles.subtitle}>
            Share your requirements for partnerships, media activations, stadium features, and branded experiences.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput placeholder="Your name" placeholderTextColor="rgba(27,23,23,0.35)" style={styles.input} />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            placeholder="you@company.com"
            placeholderTextColor="rgba(27,23,23,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Organization</Text>
          <TextInput placeholder="Company or publication" placeholderTextColor="rgba(27,23,23,0.35)" style={styles.input} />

          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput
            placeholder="Tell us about your inquiry"
            placeholderTextColor="rgba(27,23,23,0.35)"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              This mobile form is now live in UI and mirrors the web structure. Submission API hookup can be wired to /api/inquiries in the next step.
            </Text>
          </View>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerMeta}>© 2026 Instadium Media</Text>
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
    fontSize: 46,
    lineHeight: 48,
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
  formCard: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.14)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fieldLabel: {
    color: landingColors.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontSize: 9,
    marginTop: 8,
    marginBottom: 4,
    fontFamily: landingFonts.sansSemiBold,
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129,0,0,0.12)',
    backgroundColor: 'rgba(238,235,221,0.45)',
    paddingHorizontal: 12,
    color: landingColors.plum,
    fontSize: 14,
    fontFamily: landingFonts.sansRegular,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  noteBox: {
    marginTop: 12,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(129,0,0,0.05)',
  },
  noteText: {
    color: landingColors.muted,
    fontSize: 11,
    lineHeight: 18,
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
