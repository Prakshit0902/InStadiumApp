import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { landingColors, landingFonts } from '@/components/landing/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const androidBottomInset = Platform.OS === 'android' ? insets.bottom : 0;
  // Button navigation usually reports a much larger inset than gesture mode.
  const androidSystemNavPadding = Platform.OS === 'android' && androidBottomInset >= 24 ? androidBottomInset : 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: landingColors.blush,
        tabBarInactiveTintColor: 'rgba(238, 235, 221, 0.45)',
        animation: 'fade',
        tabBarStyle: {
          backgroundColor: landingColors.rose,
          borderTopWidth: 0,
          elevation: 12,
          height: Platform.OS === 'ios' ? 88 : 68 + androidSystemNavPadding,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12 + androidSystemNavPadding,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 15,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: {
          fontFamily: landingFonts.sansSemiBold,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stadiums',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sports"
        options={{
          title: 'Sports',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
