import { memo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  onScanPress?: () => void;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onTabPress?: (tab: 'Stadiums' | 'Sports' | 'About' | 'Find Stadium') => void;
  onProfilePress?: () => void;
  isAuthenticated?: boolean;
};

function LandingNavbarBase({ horizontalPadding, onScanPress, onSearchPress, onNotificationsPress, onTabPress, onProfilePress, isAuthenticated }: Props) {
  const quickTabs = ['Stadiums', 'Sports', 'About', 'Find Stadium'];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}> 
        <View style={styles.brandWrap}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>IN</Text>
            </View>
            <Text style={styles.logoWordmark}>STADIUM</Text>
          </View>

          <View style={styles.locationWrap}>
            <Ionicons name="location-outline" size={12} color={landingColors.subtle} />
            <Text style={styles.locationText}>India</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onScanPress || (() => Alert.alert('Scan', 'QR scan utility will be wired shortly.'))}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
            <Ionicons name="qr-code-outline" size={18} color={landingColors.plum} />
          </Pressable>

          <Pressable
            onPress={onSearchPress || (() => Alert.alert('Search', 'Opening explore search.'))}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
            <Ionicons name="search" size={18} color={landingColors.plum} />
          </Pressable>

          <Pressable
            onPress={onNotificationsPress || (() => Alert.alert('Notifications', 'No new notifications right now.'))}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
            <Ionicons name="notifications-outline" size={18} color={landingColors.plum} />
          </Pressable>

          <Pressable
            onPress={onProfilePress || (() => Alert.alert('Coming Soon', 'Profile screen will be wired in the next phase.'))}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.iconPressed]}>
            <Ionicons name="person-outline" size={16} color={landingColors.blush} />
            {isAuthenticated ? <View style={styles.onlineDot} /> : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.tabsScroll, { paddingHorizontal: horizontalPadding }]}
        decelerationRate="fast">
        {quickTabs.map((label, index) => (
          <Pressable
            key={label}
            onPress={() => onTabPress?.(label)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: false }}
            hitSlop={5}
            style={({ pressed }) => [styles.tabChip, index === 0 && styles.tabChipActive, pressed && styles.linkPressed]}>
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export const LandingNavbar = memo(LandingNavbarBase);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: landingColors.blush,
  },
  container: {
    minHeight: 68,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: landingColors.blush,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrap: {
    gap: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWordmark: {
    color: landingColors.plum,
    fontSize: 20,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  logoBadge: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landingColors.rose,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  logoBadgeText: {
    color: landingColors.blush,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 18,
    fontFamily: landingFonts.sansSemiBoldItalic,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: landingColors.subtle,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansMedium,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(129, 0, 0, 0.08)',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landingColors.rose,
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    top: 2,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#2FA66A',
    borderWidth: 1,
    borderColor: landingColors.blush,
  },
  iconPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  tabsScroll: {
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
  },
  tabChip: {
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.08)',
    backgroundColor: 'rgba(129, 0, 0, 0.08)',
  },
  tabChipActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  tabText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: landingColors.muted,
    fontFamily: landingFonts.sansSemiBold,
  },
  tabTextActive: {
    color: landingColors.blush,
  },
  linkPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
