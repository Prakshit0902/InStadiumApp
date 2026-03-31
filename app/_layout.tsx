import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_600SemiBold_Italic,
} from '@expo-google-fonts/montserrat';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_500Medium_Italic,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';
import { AuthProvider } from '@/providers/auth-provider';
import { FloatingChatbot } from '@/components/chat/FloatingChatbot';
import { landingColors, landingFonts } from '@/components/landing/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function InStadiumHeader({ navigation, options, route, back }: NativeStackHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.headerRoot}>
      <View style={[styles.strip, { paddingTop: insets.top }]}> 
        <View style={styles.sideSlot}>
          {back ? (
            <Pressable
              onPress={navigation.goBack}
              hitSlop={8}
              android_ripple={{ color: 'rgba(238, 235, 221, 0.18)', borderless: true }}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
              <Ionicons name="chevron-back" size={20} color={landingColors.blush} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>IN</Text>
          </View>
          <Text style={styles.logoWordmark}>STADIUM</Text>
        </View>

        <View style={styles.sideSlot} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() || '';
  const [loaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_600SemiBold_Italic,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_500Medium_Italic,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
  });

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
          <Stack
            screenOptions={{
              headerBackTitleVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              header: (props) => <InStadiumHeader {...props} />,
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="scan" options={{ title: 'Scan Stadium QR' }} />
            <Stack.Screen name="auth" options={{ title: 'Account' }} />
            <Stack.Screen name="sports" options={{ headerShown: true, title: 'Sports' }} />
            <Stack.Screen name="sport/[id]" options={{ headerShown: true, title: 'Sport' }} />
            <Stack.Screen name="stadium/[id]" options={{ headerShown: true, title: 'Stadium' }} />
            <Stack.Screen name="player/[id]" options={{ headerShown: true, title: 'Player' }} />
            <Stack.Screen name="portfolio" options={{ headerShown: true, title: 'Portfolio' }} />
            <Stack.Screen name="about-studio" options={{ headerShown: true, title: 'About the Studio' }} />
            <Stack.Screen name="press-media" options={{ headerShown: true, title: 'Press and Media' }} />
            <Stack.Screen name="inquiries" options={{ headerShown: true, title: 'Inquiries' }} />
            <Stack.Screen name="search-stadium" options={{ headerShown: true, title: 'Search Stadium' }} />
            <Stack.Screen name="find-stadium" options={{ headerShown: true, title: 'Find Stadium' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <FloatingChatbot />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  headerRoot: {
    backgroundColor: landingColors.rose,
  },
  strip: {
    minHeight: 84,
    backgroundColor: landingColors.rose,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideSlot: {
    width: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(238, 235, 221, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#630000',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  logoBadgeText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 16,
    fontFamily: landingFonts.sansSemiBoldItalic,
  },
  logoWordmark: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 1.7,
    fontSize: 18,
    fontFamily: landingFonts.sansSemiBold,
  },
});
