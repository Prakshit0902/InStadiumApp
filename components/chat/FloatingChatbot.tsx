import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import * as Location from 'expo-location';
import { getApiBaseUrl } from '@/components/stadium/utils';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ChatAction = 'answer_only' | 'show_links' | 'ask_clarification';
type EntityType = 'player' | 'stadium' | 'sport' | 'external';

type ChatStructuredSection = {
  title: string;
  items: string[];
};

type ChatLink = {
  id: string;
  entityType: EntityType;
  label: string;
  subtitle?: string;
  route: string;
  score: number;
};

type ChatApiResponse = {
  reply: string;
  action: ChatAction;
  links: ChatLink[];
  structured?: ChatStructuredSection[];
};

type ChatLocation = {
  latitude: number;
  longitude: number;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  links?: ChatLink[];
  structured?: ChatStructuredSection[];
  action?: ChatAction;
};

type SuggestionChip = {
  id: string;
  label: string;
  query: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hi, I can help you find players, stadiums, and sports pages. Ask in text or tap mic for voice.',
};

const SUGGESTION_CHIPS: SuggestionChip[] = [
  {
    id: 'top-players',
    label: 'Top Players',
    query: 'Show top players in cricket',
  },
  {
    id: 'nearby-stadiums',
    label: 'Nearby Stadiums',
    query: 'Show nearby stadiums',
  },
  {
    id: 'sports',
    label: 'Sports',
    query: 'Show all sports available in app',
  },
];

const chatbotTheme = {
  panelBackground: landingColors.blush,
  panelBorder: 'rgba(129, 0, 0, 0.18)',
  headerBackground: 'rgba(129, 0, 0, 0.08)',
  headerBorder: 'rgba(129, 0, 0, 0.20)',
  userBubble: landingColors.rose,
  assistantBubble: '#FFFFFF',
  assistantBorder: 'rgba(129, 0, 0, 0.16)',
  iconMuted: landingColors.plum,
  inputBorder: 'rgba(129, 0, 0, 0.20)',
} as const;

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function queryNeedsLocation(query: string): boolean {
  const value = query.trim().toLowerCase();
  if (!value) {
    return false;
  }

  return /(nearest|closest|nearby|near me|around me|pass mein|nazdik|naazdik)/i.test(value);
}

type RuntimeSpeechModule = {
  requestPermissionsAsync: () => Promise<{ granted?: boolean }>;
  start: (options?: Record<string, unknown>) => void;
  stop: () => void;
  addListener: (
    eventName: 'start' | 'end' | 'result' | 'error',
    listener: (event?: {
      results?: Array<{ transcript?: string }>;
      isFinal?: boolean;
      error?: string;
      message?: string;
    }) => void
  ) => { remove: () => void };
};

function getSpeechModule(): RuntimeSpeechModule | null {
  try {
    const core = require('expo-modules-core') as {
      requireOptionalNativeModule?: (name: string) => RuntimeSpeechModule | null;
    };

    return core.requireOptionalNativeModule?.('ExpoSpeechRecognition') ?? null;
  } catch {
    return null;
  }
}

export function FloatingChatbot() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [currentLocation, setCurrentLocation] = useState<ChatLocation | null>(null);
  const [locationPrompted, setLocationPrompted] = useState(false);
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const visibility = useRef(new Animated.Value(0)).current;
  const speechModule = getSpeechModule();
  const voiceAvailable = speechModule !== null;

  const disabledSend = !draft.trim() || loading;

  useEffect(() => {
    if (!speechModule || !voiceAvailable) {
      return;
    }

    const onStart = speechModule.addListener('start', () => {
      setRecognizing(true);
      setError(null);
    });

    const onEnd = speechModule.addListener('end', () => {
      setRecognizing(false);
    });

    const onResult = speechModule.addListener('result', (event) => {
      const transcript = event?.results?.[0]?.transcript?.trim();
      if (!transcript) {
        return;
      }

      setDraft(transcript);
    });

    const onError = speechModule.addListener('error', (event) => {
      setRecognizing(false);
      const message = event?.message || event?.error || 'Voice recognition failed. Please try again.';
      setError(String(message));
    });

    return () => {
      onStart.remove();
      onEnd.remove();
      onResult.remove();
      onError.remove();
    };
  }, [speechModule, voiceAvailable]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      const target = Math.max(0, (event.endCoordinates?.height ?? 0) - 12);
      Animated.timing(keyboardOffset, {
        toValue: target,
        duration: event.duration ?? 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    const onHide = Keyboard.addListener(hideEvent, (event) => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: event.duration ?? 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardOffset]);

  const toggleChat = useCallback((show: boolean) => {
    if (show) {
      setOpen(true);
      Animated.spring(visibility, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(visibility, {
        toValue: 0,
        duration: 250,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }).start(() => setOpen(false));
    }
  }, [visibility]);

  const resolveLocation = useCallback(async (): Promise<ChatLocation | null> => {
    if (currentLocation) {
      return currentLocation;
    }

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setError('Location permission denied. Chatbot will continue without personalization.');
        return null;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setCurrentLocation(next);
      return next;
    } catch {
      setError('Unable to read your location right now. You can still ask text-based queries.');
      return null;
    }
  }, [currentLocation]);

  const handleOpenChat = useCallback(async () => {
    toggleChat(true);

    if (locationPrompted) {
      return;
    }

    setLocationPrompted(true);
    const location = await resolveLocation();

    if (location) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId('assistant'),
          role: 'assistant',
          text: 'Location access enabled. I will personalize suggestions around your nearest stadium and nearby places.',
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: generateId('assistant'),
        role: 'assistant',
        text: 'Location is not enabled, so I will continue in regular mode without personalization.',
      },
    ]);
  }, [locationPrompted, resolveLocation, toggleChat]);

  const sendMessage = useCallback(
    async (text: string, inputMode: 'text' | 'voice') => {
      const value = text.trim();
      if (!value || loading) {
        return;
      }

      const base = getApiBaseUrl();
      if (!base) {
        setError('Missing EXPO_PUBLIC_API_BASE_URL in app env.');
        return;
      }

      const userMessage: ChatMessage = {
        id: generateId('user'),
        role: 'user',
        text: value,
      };

      setMessages((prev) => [...prev, userMessage]);
      setDraft('');
      setLoading(true);
      setError(null);

      try {
        let locationPayload: ChatLocation | null = currentLocation;
        if (!locationPayload && queryNeedsLocation(value)) {
          locationPayload = await resolveLocation();
        }

        const response = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: value,
            inputMode,
            language: 'auto',
            ...(locationPayload ? { location: locationPayload } : {}),
          }),
        });

        if (!response.ok) {
          throw new Error('Chat request failed.');
        }

        const payload = (await response.json()) as ChatApiResponse;

        const assistantMessage: ChatMessage = {
          id: generateId('assistant'),
          role: 'assistant',
          text: payload.reply || 'No response available.',
          links: payload.links || [],
          structured: payload.structured || [],
          action: payload.action,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setError('Unable to reach chatbot service right now.');
      } finally {
        setLoading(false);
      }
    },
    [currentLocation, loading, resolveLocation]
  );

  const handleToggleVoice = useCallback(async () => {
    if (!speechModule) {
      setError('Voice module is unavailable in this build. Use a dev build with expo-speech-recognition configured.');
      return;
    }

    if (recognizing) {
      speechModule.stop();
      return;
    }

    const permission = await speechModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone permission is required for voice input.');
      return;
    }

    speechModule.start({
      lang: 'en-IN',
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: false,
    });
    setError('Listening... Speak now. Your transcript will appear in the input box.');
  }, [recognizing, speechModule]);

  const lastThreeMessages = useMemo(() => messages.slice(-10), [messages]);
  const shouldShowSuggestions = !loading && (messages.length <= 2 || !draft.trim());

  if (pathname === '/scan') {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {open && (
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: visibility.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleChat(false)} />
        </Animated.View>
      )}

      {open ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 8}
          style={styles.panelWrap}>
          <Animated.View
            style={[
              styles.panel,
              {
                opacity: visibility,
                transform: [
                  {
                    scale: visibility.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                  {
                    translateY: visibility.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>InStadium AI</Text>
                <Text style={styles.headerSub}>Players, stadiums, sports</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => toggleChat(false)}>
                <Ionicons name="close" size={20} color={landingColors.blush} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.messagesArea}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
              {lastThreeMessages.map((msg) => (
                <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                  <Text style={msg.role === 'user' ? styles.userText : styles.assistantText}>{msg.text}</Text>

                  {msg.links?.length ? (
                    <View style={styles.linksWrap}>
                      {msg.links.map((link) => (
                        <Pressable
                          key={`${msg.id}-${link.entityType}-${link.id}`}
                          style={styles.linkCard}
                          onPress={async () => {
                            setOpen(false);
                            if (/^https?:\/\//i.test(link.route)) {
                              await Linking.openURL(link.route);
                              return;
                            }

                            router.push(link.route as never);
                          }}>
                          <Text style={styles.linkTitle}>{link.label}</Text>
                          {!!link.subtitle && <Text style={styles.linkSub}>{link.subtitle}</Text>}
                          <Text style={styles.linkPath}>{/^https?:\/\//i.test(link.route) ? 'Open reference' : 'Open page'}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : null}

                  {msg.structured?.length ? (
                    <View style={styles.structuredWrap}>
                      {msg.structured.map((section, sectionIndex) => (
                        <View key={`${msg.id}-section-${sectionIndex}`} style={styles.structuredCard}>
                          <Text style={styles.structuredTitle}>{section.title}</Text>
                          {section.items.map((item, itemIndex) => (
                            <Text key={`${msg.id}-item-${sectionIndex}-${itemIndex}`} style={styles.structuredItem}>
                              {`- ${item}`}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}

              {loading && (
                <View style={[styles.bubble, styles.assistantBubble, styles.loadingBubble]}>
                  <ActivityIndicator size="small" color={landingColors.rose} />
                </View>
              )}
            </ScrollView>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {shouldShowSuggestions ? (
              <View style={styles.suggestionWrap}>
                {SUGGESTION_CHIPS.map((chip) => (
                  <Pressable
                    key={chip.id}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setDraft('');
                      void sendMessage(chip.query, 'text');
                    }}
                    disabled={loading}>
                    <Text style={styles.suggestionChipText}>{chip.label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <Pressable
                style={[styles.iconButton, recognizing && styles.iconButtonActive]}
                onPress={handleToggleVoice}
                disabled={loading || !voiceAvailable}>
                <Ionicons
                  name={recognizing ? 'mic' : 'mic-outline'}
                  size={18}
                  color={recognizing ? landingColors.blush : landingColors.plum}
                />
              </Pressable>

              <TextInput
                style={styles.input}
                placeholder="Ask about a player or stadium"
                placeholderTextColor="#6E7A89"
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={600}
              />

              <Pressable
                style={[styles.sendButton, disabledSend && styles.sendButtonDisabled]}
                onPress={() => sendMessage(draft, recognizing ? 'voice' : 'text')}
                disabled={disabledSend}>
                <Ionicons name="send" size={18} color={landingColors.blush} />
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      ) : (
        <Pressable style={styles.fab} onPress={() => void handleOpenChat()}>
          <Image
            source={{ uri: 'https://res.cloudinary.com/daud2uqqf/image/upload/v1775915480/logobot_k3d6xa.gif' }}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 200,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 23, 23, 0.28)',
  },
  fab: {
    marginRight: 18,
    marginBottom: 104,
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#810000',
    borderWidth: 1.2,
    borderColor: 'rgba(129, 0, 0, 0.15)',
    shadowColor: landingColors.plum,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  panelWrap: {
    width: '100%',
    alignItems: 'flex-end',
  },
  panel: {
    width: '92%',
    maxWidth: 420,
    height: 520,
    marginRight: 14,
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: chatbotTheme.panelBackground,
    borderWidth: 1,
    borderColor: chatbotTheme.panelBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#810000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    color: landingColors.blush,
    fontFamily: landingFonts.serifBold,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(238, 235, 221, 0.85)',
    letterSpacing: 0.5,
    fontFamily: landingFonts.sansSemiBold,
    textTransform: 'uppercase',
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 10,
  },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: chatbotTheme.userBubble,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: chatbotTheme.assistantBubble,
    borderWidth: 1,
    borderColor: chatbotTheme.assistantBorder,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 14,
    minWidth: 64,
    alignItems: 'center',
  },
  userText: {
    color: landingColors.blush,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
  },
  assistantText: {
    color: landingColors.plum,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: landingFonts.sansRegular,
  },
  linksWrap: {
    gap: 8,
  },
  structuredWrap: {
    gap: 8,
  },
  structuredCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.14)',
    backgroundColor: 'rgba(129, 0, 0, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
  },
  structuredTitle: {
    color: '#810000',
    fontFamily: landingFonts.serifBold,
    fontSize: 14,
    marginBottom: 4,
  },
  structuredItem: {
    color: landingColors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: landingFonts.sansRegular,
  },
  linkCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    backgroundColor: '#FFFFFF',
    padding: 12,
    shadowColor: '#810000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  linkTitle: {
    color: landingColors.plum,
    fontFamily: landingFonts.sansSemiBold,
    fontSize: 13,
  },
  linkSub: {
    marginTop: 2,
    color: landingColors.muted,
    fontSize: 12,
    fontFamily: landingFonts.sansRegular,
  },
  linkPath: {
    marginTop: 6,
    color: '#810000',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    fontFamily: landingFonts.sansSemiBold,
  },
  errorText: {
    color: '#B42318',
    fontSize: 12,
    marginHorizontal: 12,
    marginBottom: 6,
    fontFamily: landingFonts.sansMedium,
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.12)',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  suggestionChipText: {
    fontSize: 12,
    color: landingColors.muted,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
    fontFamily: landingFonts.sansSemiBold,
  },
  inputRow: {
    borderTopWidth: 1,
    borderTopColor: chatbotTheme.headerBorder,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: chatbotTheme.inputBorder,
    backgroundColor: '#FFFFFF',
  },
  iconButtonActive: {
    backgroundColor: landingColors.rose,
    borderColor: landingColors.rose,
  },
  input: {
    flex: 1,
    minHeight: 38,
    maxHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: chatbotTheme.inputBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: landingColors.plum,
    fontSize: 14,
    fontFamily: landingFonts.sansRegular,
  },
  sendButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landingColors.rose,
  },
  sendButtonDisabled: {
    backgroundColor: '#B28F8F',
  },
});
