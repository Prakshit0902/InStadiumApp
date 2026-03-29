import { memo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { landingColors, landingFonts } from './theme';

type Props = {
  horizontalPadding: number;
  onScanPress?: () => void;
};

function LandingNavbarBase({ horizontalPadding, onScanPress }: Props) {
  const quickTabs = ['Stadiums', 'Sports', 'About', 'Find Stadium'];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}> 
        <View style={styles.brandWrap}>
          <Text style={styles.logoText}>
            <Text style={styles.logoBadge}>In</Text>stadium
          </Text>
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
            onPress={() => Alert.alert('Coming Soon', 'Search screen is in the next migration phase.')}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
            <Ionicons name="search" size={18} color={landingColors.plum} />
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Coming Soon', 'Notifications will be wired in the next phase.')}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}>
            <Ionicons name="notifications-outline" size={18} color={landingColors.plum} />
          </Pressable>

          <Pressable
            onPress={() => Alert.alert('Coming Soon', 'Profile screen will be wired in the next phase.')}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: true }}
            hitSlop={8}
            style={({ pressed }) => [styles.avatarButton, pressed && styles.iconPressed]}>
            <Ionicons name="person-outline" size={16} color={landingColors.blush} />
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
            onPress={() => Alert.alert('Coming Soon', `${label} screen is next migration phase.`)}
            android_ripple={{ color: 'rgba(129, 0, 0, 0.12)', borderless: false }}
            hitSlop={5}
            style={({ pressed }) => [styles.tabChip, index === 0 && styles.tabChipActive, pressed && styles.linkPressed]}>
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.bottomBorder}>
        <View style={styles.bottomAccent} />
      </View>
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
  logoText: {
    color: landingColors.plum,
    fontSize: 20,
    letterSpacing: 0.8,
    fontFamily: landingFonts.sansSemiBold,
  },
  logoBadge: {
    backgroundColor: landingColors.rose,
    color: landingColors.blush,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontStyle: 'italic',
    fontFamily: landingFonts.sansSemiBold,
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
  bottomBorder: {
    height: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: landingColors.border,
    justifyContent: 'flex-end',
  },
  bottomAccent: {
    width: 64,
    height: 2,
    borderRadius: 999,
    backgroundColor: landingColors.rose,
    marginLeft: 20,
    marginBottom: -1,
  },
});
