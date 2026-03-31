import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiBaseUrl } from '@/components/stadium/utils';
import { landingColors, landingFonts } from '@/components/landing/theme';

type ChatAction = 'answer_only' | 'show_links' | 'ask_clarification';
type EntityType = 'player' | 'stadium' | 'sport';

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
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  links?: ChatLink[];
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
  panelBackground: '#FFFDF9',
  panelBorder: 'rgba(129, 0, 0, 0.14)',
  headerBackground: 'rgba(129, 0, 0, 0.10)',
  headerBorder: 'rgba(129, 0, 0, 0.18)',
  userBubble: landingColors.rose,
  assistantBubble: '#FFFFFF',
  assistantBorder: 'rgba(129, 0, 0, 0.16)',
  iconMuted: landingColors.plum,
  inputBorder: 'rgba(129, 0, 0, 0.18)',
} as const;

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type RuntimeSpeechModule = {
  requestPermissionsAsync: () => Promise<{ granted?: boolean }>;
  start: (options?: Record<string, unknown>) => void;
  stop: () => void;
};

function getSpeechModule(): RuntimeSpeechModule | null {
  try {
    const mod = require('expo-speech-recognition') as {
      ExpoSpeechRecognitionModule?: RuntimeSpeechModule;
    };

    return mod.ExpoSpeechRecognitionModule ?? null;
  } catch {
    return null;
  }
}

export function FloatingChatbot() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const speechModule = getSpeechModule();
  const voiceAvailable = !!speechModule;

  const disabledSend = !draft.trim() || loading;

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
        const response = await fetch(`${base}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: value,
            inputMode,
            language: 'auto',
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
          action: payload.action,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        setError('Unable to reach chatbot service right now.');
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleToggleVoice = useCallback(async () => {
    if (!speechModule) {
      setError('Voice module is unavailable in this build. Rebuild dev client and relaunch app.');
      return;
    }

    if (recognizing) {
      speechModule.stop();
      setRecognizing(false);
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
    setRecognizing(true);
    setError('Listening started. If transcript does not appear, type your query and send.');
  }, [recognizing, speechModule]);

  const lastThreeMessages = useMemo(() => messages.slice(-10), [messages]);
  const shouldShowSuggestions = !loading && (messages.length <= 2 || !draft.trim());

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {open && <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />}

      {open ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.panelWrap}>
          <View style={styles.panel}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>InStadium Assistant</Text>
                <Text style={styles.headerSub}>Players, stadiums, sports</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color={landingColors.plum} />
              </Pressable>
            </View>

            <ScrollView style={styles.messagesArea} contentContainerStyle={styles.messagesContent}>
              {lastThreeMessages.map((msg) => (
                <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                  <Text style={msg.role === 'user' ? styles.userText : styles.assistantText}>{msg.text}</Text>

                  {msg.links?.length ? (
                    <View style={styles.linksWrap}>
                      {msg.links.map((link) => (
                        <Pressable
                          key={`${msg.id}-${link.entityType}-${link.id}`}
                          style={styles.linkCard}
                          onPress={() => {
                            setOpen(false);
                            router.push(link.route as never);
                          }}>
                          <Text style={styles.linkTitle}>{link.label}</Text>
                          {!!link.subtitle && <Text style={styles.linkSub}>{link.subtitle}</Text>}
                          <Text style={styles.linkPath}>Open page</Text>
                        </Pressable>
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
          </View>
        </KeyboardAvoidingView>
      ) : (
        <Pressable style={styles.fab} onPress={() => setOpen(true)}>
          <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
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
    marginBottom: 26,
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: landingColors.rose,
    shadowColor: '#4A1D1D',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
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
    backgroundColor: chatbotTheme.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: chatbotTheme.headerBorder,
  },
  headerTitle: {
    fontSize: 16,
    color: landingColors.plum,
    fontFamily: landingFonts.serifSemiBold,
  },
  headerSub: {
    marginTop: 2,
    fontSize: 12,
    color: landingColors.muted,
    letterSpacing: 0.3,
    fontFamily: landingFonts.sansRegular,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 10,
  },
  bubble: {
    maxWidth: '90%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: chatbotTheme.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: chatbotTheme.assistantBubble,
    borderWidth: 1,
    borderColor: chatbotTheme.assistantBorder,
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
  linkCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 0, 0, 0.18)',
    backgroundColor: 'rgba(129, 0, 0, 0.06)',
    padding: 10,
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
    color: landingColors.rose,
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
    borderColor: 'rgba(129, 0, 0, 0.16)',
    borderRadius: 999,
    backgroundColor: 'rgba(129, 0, 0, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
