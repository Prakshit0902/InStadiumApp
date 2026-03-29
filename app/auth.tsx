import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

type Mode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const router = useRouter();
  const { initialized, isAuthenticated, user, signIn, signOut, signUp, refreshProfile, updateProfile } = useAuth();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => (mode === 'sign-in' ? 'Sign In' : 'Create Account'), [mode]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    setProfileName(user?.name || '');
    setProfileEmail(user?.email || '');
    setProfileImageUrl(user?.imageUrl || '');
  }, [isAuthenticated, user?.email, user?.imageUrl, user?.name]);

  async function onSubmit() {
    if (!email.trim() || !password.trim() || (mode === 'sign-up' && !name.trim())) {
      setMessage('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const result =
      mode === 'sign-in'
        ? await signIn(email.trim(), password)
        : await signUp(name.trim(), email.trim(), password);

    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.message || 'Authentication failed.');
      return;
    }

    if (result.message) {
      setMessage(result.message);
    } else {
      setMessage(mode === 'sign-in' ? 'Signed in successfully.' : 'Account created successfully.');
    }

    if (mode === 'sign-in') {
      router.replace('/');
    }
  }

  async function onRefreshProfile() {
    setSubmitting(true);
    setMessage(null);
    const result = await refreshProfile();
    setSubmitting(false);

    if (!result.ok) {
      setMessage(result.message || 'Failed to refresh profile.');
      return;
    }

    setMessage('Profile refreshed from backend.');
  }

  async function onSignOut() {
    setSubmitting(true);
    setMessage(null);
    await signOut();
    setSubmitting(false);
    setMessage('Signed out.');
  }

  async function onSaveProfile() {
    setSubmitting(true);
    setMessage(null);

    const result = await updateProfile({
      name: profileName,
      email: profileEmail,
      imageUrl: profileImageUrl,
    });

    setSubmitting(false);
    setMessage(result.message || (result.ok ? 'Profile updated.' : 'Failed to update profile.'));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.kicker}>Neon Auth</Text>
          <Text style={styles.title}>{isAuthenticated ? 'Account' : title}</Text>
          <Text style={styles.subtitle}>
            {isAuthenticated
              ? 'Your token is active for protected backend routes.'
              : 'Sign in with Neon Auth to access protected routes.'}
          </Text>
        </View>

        {!initialized ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#810000" />
            <Text style={styles.infoText}>Loading session...</Text>
          </View>
        ) : null}

        {isAuthenticated ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Signed in</Text>
            {profileImageUrl ? <Image source={{ uri: profileImageUrl }} style={styles.avatar} /> : null}

            <TextInput
              value={profileName}
              onChangeText={setProfileName}
              style={styles.input}
              autoCapitalize="words"
              placeholder="Full name"
              placeholderTextColor="rgba(27, 23, 23, 0.45)"
            />

            <TextInput
              value={profileEmail}
              onChangeText={setProfileEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="rgba(27, 23, 23, 0.45)"
            />

            <TextInput
              value={profileImageUrl}
              onChangeText={setProfileImageUrl}
              style={styles.input}
              autoCapitalize="none"
              placeholder="Profile photo URL"
              placeholderTextColor="rgba(27, 23, 23, 0.45)"
            />

            <Text style={styles.infoText}>User ID: {user?.sub || 'Not available'}</Text>

            <Pressable style={styles.button} onPress={onSaveProfile} disabled={submitting}>
              <Text style={styles.buttonText}>Save Profile</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.secondaryButton]} onPress={onRefreshProfile} disabled={submitting}>
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Refresh Profile</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={onSignOut} disabled={submitting}>
              <Text style={styles.buttonText}>Sign Out</Text>
            </Pressable>

            <Pressable style={styles.linkButton} onPress={() => router.back()}>
              <Text style={styles.linkText}>Back</Text>
            </Pressable>

            <Pressable style={styles.linkButton} onPress={() => router.replace('/')}>
              <Text style={styles.linkText}>Go To Home</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setMode('sign-in')}
                style={[styles.modeButton, mode === 'sign-in' && styles.modeButtonActive]}>
                <Text style={[styles.modeText, mode === 'sign-in' && styles.modeTextActive]}>Sign In</Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('sign-up')}
                style={[styles.modeButton, mode === 'sign-up' && styles.modeButtonActive]}>
                <Text style={[styles.modeText, mode === 'sign-up' && styles.modeTextActive]}>Sign Up</Text>
              </Pressable>
            </View>

            {mode === 'sign-up' ? (
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
                placeholder="Full name"
                placeholderTextColor="rgba(27, 23, 23, 0.45)"
              />
            ) : null}

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="rgba(27, 23, 23, 0.45)"
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor="rgba(27, 23, 23, 0.45)"
            />

            <Pressable style={styles.button} onPress={onSubmit} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Please wait...' : title}</Text>
            </Pressable>
          </View>
        )}

        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf7f2',
  },
  container: {
    padding: 20,
    gap: 14,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: '#810000',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#281f1f',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '600',
  },
  subtitle: {
    color: '#5a4e4e',
    fontSize: 13,
    lineHeight: 19,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    color: '#281f1f',
    fontSize: 18,
    fontWeight: '700',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.25)',
    alignSelf: 'center',
    backgroundColor: '#f7efef',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.18)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#810000',
    borderColor: '#810000',
  },
  modeText: {
    color: '#810000',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modeTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(40, 31, 31, 0.16)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#281f1f',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 2,
    backgroundColor: '#810000',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#810000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  secondaryButtonText: {
    color: '#810000',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  linkText: {
    color: '#810000',
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    color: '#5a4e4e',
    fontSize: 13,
    lineHeight: 18,
  },
  message: {
    color: '#5a4e4e',
    fontSize: 13,
  },
});
