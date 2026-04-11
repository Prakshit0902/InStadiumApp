import { useEffect } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
}

export default function SsoCallbackScreen() {
  const router = useRouter();
  const { initialized, isAuthenticated, refreshProfile, user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function completeAuthRedirect() {
      if (!initialized) {
        return;
      }

      if (isAuthenticated) {
        await refreshProfile();
        const name = user?.name?.trim() || user?.email?.split('@')[0]?.trim() || 'User';
        showToast(`Hello, ${name}`);
      }

      if (!cancelled) {
        router.replace('/');
      }
    }

    void completeAuthRedirect();

    return () => {
      cancelled = true;
    };
  }, [initialized, isAuthenticated, refreshProfile, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#810000" />
        <Text style={styles.text}>Completing sign in...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf7f2',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    color: '#5a4e4e',
    fontSize: 14,
  },
});
