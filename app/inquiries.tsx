import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { landingColors, landingFonts } from '@/components/landing/theme';

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : null;
}

export default function InquiriesScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredStadium, setPreferredStadium] = useState('');
  const [visitType, setVisitType] = useState('Matchday Visit');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return name.trim().length > 1 && email.trim().length > 4 && message.trim().length > 8;
  }, [email, message, name]);

  const submitInquiry = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    const base = getApiBaseUrl();
    if (!base) {
      Alert.alert('Missing API URL', 'Please set EXPO_PUBLIC_API_BASE_URL to submit inquiries.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${base}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: null,
          event_type: visitType,
          event_date: null,
          guest_count: null,
          budget_range: null,
          message,
          location: preferredStadium || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setName('');
      setEmail('');
      setPreferredStadium('');
      setVisitType('Matchday Visit');
      setMessage('');
      Alert.alert('Inquiry sent', 'Our team will help you plan your stadium experience shortly.');
    } catch {
      Alert.alert('Submission failed', 'Unable to submit inquiry right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Inquiries</Text>
          <Text style={styles.title}>
            Plan your next <Text style={styles.accent}>Stadium</Text> Experience
          </Text>
          <Text style={styles.subtitle}>
            Share your visit goals and we will help you discover venues, upcoming matches, and the best fan-day plan.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="rgba(27,23,23,0.35)" style={styles.input} />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            placeholderTextColor="rgba(27,23,23,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Preferred Stadium</Text>
          <TextInput
            value={preferredStadium}
            onChangeText={setPreferredStadium}
            placeholder="e.g., Wankhede Stadium"
            placeholderTextColor="rgba(27,23,23,0.35)"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Visit Type</Text>
          <TextInput
            value={visitType}
            onChangeText={setVisitType}
            placeholder="Matchday Visit / Group Tour / Media Visit"
            placeholderTextColor="rgba(27,23,23,0.35)"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us your preferred date, city, and what kind of stadium experience you want."
            placeholderTextColor="rgba(27,23,23,0.35)"
            multiline
            textAlignVertical="top"
            style={[styles.input, styles.textArea]}
          />

          <Pressable
            style={({ pressed }) => [styles.submitButton, (!canSubmit || submitting) && styles.submitButtonDisabled, pressed && styles.submitButtonPressed]}
            onPress={submitInquiry}
            disabled={!canSubmit || submitting}>
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Send Inquiry'}</Text>
          </Pressable>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Instadium inquiries are reviewed for venue fit, match schedules, and location convenience before we contact you.
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
  submitButton: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: landingColors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  submitText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontSize: 10,
    fontFamily: landingFonts.sansSemiBold,
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
