import { Router } from 'express';
import { createHash } from 'node:crypto';
import { prisma } from '../lib/prisma.js';

const router = Router();

type ChatAction = 'answer_only' | 'show_links' | 'ask_clarification';
type EntityType = 'player' | 'stadium' | 'sport' | 'external';
type ChatLanguage = 'en' | 'hi' | 'auto';
type InputMode = 'text' | 'voice';

type ChatRequestBody = {
  message?: unknown;
  transcript?: unknown;
  language?: unknown;
  inputMode?: unknown;
  location?: unknown;
};

type ChatLocation = {
  latitude: number;
  longitude: number;
};

type ChatLink = {
  id: string;
  entityType: EntityType;
  label: string;
  subtitle?: string;
  route: string;
  score: number;
};

type ChatStructuredSection = {
  title: string;
  items: string[];
};

type ChatResponse = {
  reply: string;
  action: ChatAction;
  links: ChatLink[];
  clarifications: string[];
  structured: ChatStructuredSection[];
  meta: {
    query: string;
    language: Exclude<ChatLanguage, 'auto'>;
    inputMode: InputMode;
    relevant: boolean;
    source: 'sarvam+db' | 'db-fallback';
  };
};

type SarvamExtraction = {
  intent: 'player_info' | 'stadium_info' | 'sport_info' | 'general_query' | 'navigation';
  entityType: EntityType | null;
  entityName: string | null;
  entityNameEnglish: string | null;
  isDomainRelevant: boolean;
  answerLanguage: 'en' | 'hi';
};

type SearchCandidate = {
  id: string;
  name: string;
  entityType: EntityType;
  subtitle?: string;
};

type ListIntent = 'top_players' | 'nearby_stadiums' | 'sports_list' | null;

type NearbyPlaceKind = 'heritage' | 'hotels' | 'restaurants' | 'religious' | 'all';

type NearbyPlaceIntent = {
  kind: NearbyPlaceKind;
  categories: string[];
  label: string;
} | null;

const DOMAIN_KEYWORDS = [
  'stadium',
  'player',
  'sport',
  'team',
  'match',
  'ground',
  'legend',
  'cricket',
  'football',
  'hockey',
  'kabaddi',
  'badminton',
  'ipl',
  'olympic',
  'sachin',
  'virat',
  'dhoni',
  'rohit',
  'kohli',
  'khiladi',
  'stadium kaun sa',
  'khel',
  'kriket',
  'futbol',
  'kahan hai',
  'jaankari',
  'jankari',
  'jaankar',
  'khabar',
  'khiladi ka profile',
];

const HIGH_CONFIDENCE_SCORE = 0.86;
const MIN_NAVIGATION_SCORE = 0.64;
const MIN_CANDIDATE_SCORE = 0.4;
const CLARIFY_SCORE_GAP = 0.16;
const GEOAPIFY_PLACES_ENDPOINT = 'https://api.geoapify.com/v2/places';
const GEOAPIFY_RADIUS_METERS = 5000;

function telemetryEnabled(): boolean {
  return process.env.CHAT_TELEMETRY_ENABLED?.trim().toLowerCase() === 'true';
}

function queryHash(query: string): string {
  return createHash('sha256').update(query).digest('hex').slice(0, 12);
}

function logChatTelemetry(event: {
  stage: string;
  reason: string;
  query: string;
  action: ChatAction;
  language: 'en' | 'hi';
  inputMode: InputMode;
  source: 'sarvam+db' | 'db-fallback';
  relevant: boolean;
  candidates: number;
  topScore: number;
  secondScore: number;
  entityType: EntityType | null;
}) {
  if (!telemetryEnabled()) {
    return;
  }

  console.info(
    '[chat-telemetry]',
    JSON.stringify({
      ts: new Date().toISOString(),
      ...event,
      queryHash: queryHash(event.query),
      queryLength: event.query.length,
    })
  );
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sanitizeModelOutput(value: string): string {
  const cleaned = value
    .replace(/<think>[\s\S]*?<\/think>/gi, ' ')
    .replace(/<think>|<\/think>/gi, ' ')
    .replace(/^(okay|alright|sure)[^\n]*\n?/i, '')
    .replace(/^(the user is asking[^\n]*\n?)/i, '')
    .replace(/^(in the context of[^\n]*\n?)/i, '')
    .replace(/^(reasoning|analysis)\s*:\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned;
}

function extractFirstJsonObject(value: string): string | null {
  const first = value.indexOf('{');
  const last = value.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    return null;
  }

  return value.slice(first, last + 1);
}

function containsDevanagari(value: string): boolean {
  return /[\u0900-\u097F]/.test(value);
}

function detectListIntent(query: string): ListIntent {
  const normalized = normalizeText(query);
  if (!normalized) {
    return null;
  }

  const topPlayersPattern = /(top|best|popular|show|list).{0,24}(play|player|players|playerr|playerrs|khiladi|khiladiyon)/i;
  if (topPlayersPattern.test(normalized)) {
    return 'top_players';
  }

  const nearbyStadiumsPattern = /(nearby|near by|near me|around me|closest|show).{0,24}(stadium|stadiums|ground|grounds)/i;
  if (nearbyStadiumsPattern.test(normalized)) {
    return 'nearby_stadiums';
  }

  const sportsListPattern = /(show|list|all|available|which).{0,24}(sport|sports|khel)/i;
  if (sportsListPattern.test(normalized)) {
    return 'sports_list';
  }

  return null;
}

function detectSportKeyword(query: string): string | null {
  const normalized = normalizeText(query);
  const aliases: Record<string, string[]> = {
    cricket: ['cricket', 'cricker', 'kriket'],
    football: ['football', 'soccer', 'futbol'],
    hockey: ['hockey'],
    badminton: ['badminton'],
    kabaddi: ['kabaddi'],
    tennis: ['tennis'],
    basketball: ['basketball'],
    volleyball: ['volleyball'],
  };

  for (const [canonical, terms] of Object.entries(aliases)) {
    if (terms.some((term) => normalized.includes(term))) {
      return canonical;
    }
  }

  return null;
}

function detectNearbyPlaceIntent(query: string): NearbyPlaceIntent {
  const normalized = normalizeText(query);
  if (!normalized) {
    return null;
  }

  const isNearby = /(near|nearest|closest|around|nearby|near me|around me|pass mein|nazdik|najdik)/i.test(normalized);
  if (!isNearby) {
    return null;
  }

  if (/(hotel|stay|accommodation|lodge)/i.test(normalized)) {
    return {
      kind: 'hotels',
      categories: ['accommodation.hotel', 'accommodation.guest_house', 'accommodation.hostel'],
      label: 'hotels',
    };
  }

  if (/(restaurant|food|eat|cafe|dining)/i.test(normalized)) {
    return {
      kind: 'restaurants',
      categories: ['catering.restaurant', 'catering.cafe'],
      label: 'restaurants',
    };
  }

  if (/(heritage|monument|museum|sightseeing|tourist|historical)/i.test(normalized)) {
    return {
      kind: 'heritage',
      categories: ['tourism.sights', 'entertainment.museum'],
      label: 'heritage and monuments',
    };
  }

  if (/(religious|temple|mosque|church|gurudwara|shrine|dargah)/i.test(normalized)) {
    return {
      kind: 'religious',
      categories: ['religion'],
      label: 'religious places',
    };
  }

  if (/(place|places|attraction|visit)/i.test(normalized)) {
    return {
      kind: 'all',
      categories: ['tourism.sights', 'accommodation.hotel', 'catering.restaurant', 'religion'],
      label: 'nearby places',
    };
  }

  return null;
}

function parseLanguage(value: unknown): ChatLanguage {
  if (value === 'en' || value === 'hi' || value === 'auto') {
    return value;
  }

  return 'auto';
}

function parseInputMode(value: unknown): InputMode {
  return value === 'voice' ? 'voice' : 'text';
}

function parseLocation(value: unknown): ChatLocation | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const rawLat = (value as { latitude?: unknown }).latitude;
  const rawLng = (value as { longitude?: unknown }).longitude;
  const latitude = typeof rawLat === 'number' ? rawLat : Number.NaN;
  const longitude = typeof rawLng === 'number' ? rawLng : Number.NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return null;
  }

  return { latitude, longitude };
}

function isDomainRelevantQuery(query: string): boolean {
  const normalized = normalizeText(query);
  if (!normalized) {
    return false;
  }

  return DOMAIN_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function inferEntityNameFromQuery(query: string): string | null {
  const patterns = [
    /(?:about|know about|who is|tell me about|details of|profile of)\s+(.+)/i,
    /(?:stadium|player|sport)\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function isEntityProfileQuery(query: string): boolean {
  const normalized = normalizeText(query);
  if (!normalized) {
    return false;
  }

  return /(who is|tell me about|about|profile|career|achievements|details of|information about)/i.test(normalized);
}

function scoreCandidate(query: string, candidateName: string): number {
  const q = normalizeText(query);
  const c = normalizeText(candidateName);

  if (!q || !c) {
    return 0;
  }

  if (q === c) {
    return 1;
  }

  if (c.startsWith(q) || q.startsWith(c)) {
    return 0.9;
  }

  if (c.includes(q) || q.includes(c)) {
    return 0.8;
  }

  const qTokens = new Set(q.split(' ').filter(Boolean));
  const cTokens = new Set(c.split(' ').filter(Boolean));
  const common = [...qTokens].filter((token) => cTokens.has(token)).length;
  const coverage = common / Math.max(1, qTokens.size);

  const qChars = new Set(q.replace(/\s/g, ''));
  const cChars = new Set(c.replace(/\s/g, ''));
  const charCommon = [...qChars].filter((token) => cChars.has(token)).length;
  const charScore = charCommon / Math.max(1, qChars.size);

  const blended = coverage * 0.7 + charScore * 0.3;
  return Number(blended.toFixed(2));
}

function buildRoute(entityType: EntityType, id: string): string {
  if (entityType === 'player') {
    return `/player/${encodeURIComponent(id)}`;
  }

  if (entityType === 'stadium') {
    return `/stadium/${encodeURIComponent(id)}`;
  }

  return `/sport/${encodeURIComponent(id)}`;
}

function buildMapUrl(name: string, latitude?: number, longitude?: number): string {
  const q = typeof latitude === 'number' && typeof longitude === 'number' ? `${name} ${latitude},${longitude}` : name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function toWikiSlug(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_-]/gu, '');
}

function buildWikipediaLink(entityName: string, language: 'en' | 'hi', entityTypeHint?: EntityType | null): ChatLink | null {
  const cleanName = entityName.trim();
  if (!cleanName) {
    return null;
  }

  const slug = toWikiSlug(cleanName);
  if (!slug) {
    return null;
  }

  const langCode = language === 'hi' ? 'hi' : 'en';
  const wikiUrl = `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;

  return {
    id: `wiki:${slug.toLowerCase()}`,
    entityType: 'external',
    label: language === 'hi' ? `${cleanName} (Wikipedia)` : `${cleanName} (Wikipedia)`,
    subtitle:
      language === 'hi'
        ? 'Open external reference page'
        : 'Open external reference page',
    route: wikiUrl,
    score: entityTypeHint === 'external' ? 0.55 : 0.78,
  };
}

function buildStructuredSections(params: {
  language: 'en' | 'hi';
  query: string;
  links: ChatLink[];
  reason: 'nearest_missing_location' | 'relevant_no_match' | 'low_confidence' | 'out_of_scope' | 'with_links';
}): ChatStructuredSection[] {
  const { language, query, links, reason } = params;

  if (reason === 'out_of_scope') {
    return [
      {
        title: language === 'hi' ? 'Main Kya Help Kar Sakta Hoon' : 'What I Can Help With',
        items:
          language === 'hi'
            ? ['Player profiles', 'Stadium details', 'Sports pages', 'Nearby stadium suggestions']
            : ['Player profiles', 'Stadium details', 'Sports pages', 'Nearby stadium suggestions'],
      },
    ];
  }

  if (reason === 'nearest_missing_location') {
    return [
      {
        title: language === 'hi' ? 'Nearest Stadium Ke Liye' : 'To Find Nearest Stadium',
        items:
          language === 'hi'
            ? ['Location permission allow karein', 'Dobara query bhejein', 'Main closest stadium links dikhata hoon']
            : ['Allow location permission', 'Send the query again', 'I will return closest stadium links'],
      },
    ];
  }

  const sections: ChatStructuredSection[] = [];

  if (links.length > 0) {
    sections.push({
      title: language === 'hi' ? 'Relevant Pages' : 'Relevant Pages',
      items: links.slice(0, 4).map((item) => item.label),
    });
  }

  if (reason === 'relevant_no_match' || reason === 'low_confidence') {
    sections.push({
      title: language === 'hi' ? 'Recommended Next Steps' : 'Recommended Next Steps',
      items:
        language === 'hi'
          ? [`Query refine karein: "${query}"`, 'Player, stadium, ya sport ka exact naam de', 'Link cards se page open karein']
          : [`Refine the query: "${query}"`, 'Provide an exact player, stadium, or sport name', 'Use link cards to open pages'],
    });
  }

  if (sections.length === 0) {
    sections.push({
      title: language === 'hi' ? 'Query Summary' : 'Query Summary',
      items: [query],
    });
  }

  return sections;
}

function toBulletItems(value: unknown, max = 5): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
      .filter(Boolean)
      .slice(0, max);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .slice(0, max)
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function buildFallbackReply(language: 'en' | 'hi', query: string): string {
  if (language === 'hi') {
    return `Mujhe "${query}" ke liye app mein direct page nahin mila, lekin main InStadium context mein madad kar sakta hoon. Aap player, stadium ya sport ka naam pooch sakte hain.`;
  }

  return `I could not find a direct page for "${query}", but I can still help within InStadium context. Ask about a player, stadium, or sport and I will guide you.`;
}

function buildGeneralContextReply(language: 'en' | 'hi', query: string): string {
  if (language === 'hi') {
    return `"${query}" ke liye exact page nahi mila. Main aapko related players, stadiums aur sports dhoondhne mein madad kar sakta hoon.`;
  }

  return `I couldn't find an exact page for "${query}". I can still help with related players, stadiums, and sports.`;
}

function isNearestIntent(query: string): boolean {
  const normalized = normalizeText(query);
  if (!normalized) {
    return false;
  }

  return /(nearest|closest|nearby|near me|around me|pass mein|sabse nazdik|nazdik)/i.test(normalized);
}

function getDistanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return earth * c;
}

async function callSarvamContextAnswer(
  query: string,
  language: 'en' | 'hi',
  contextLinks: ChatLink[],
  locationContext?: string
): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const endpoint = process.env.SARVAM_CHAT_URL?.trim() || 'https://api.sarvam.ai/v1/chat/completions';
  const model = process.env.SARVAM_MODEL?.trim() || 'sarvam-m';
  const contextSummary = contextLinks
    .slice(0, 3)
    .map((item) => `${item.entityType}: ${item.label}${item.subtitle ? ` (${item.subtitle})` : ''}`)
    .join('; ');

  const instruction = [
    'You are InStadium assistant for sports app context only.',
    `Reply language: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    'Give a concise and practical answer in 2-4 sentences.',
    'If exact page is unavailable, still provide helpful app-context guidance.',
    'Do not hallucinate IDs, routes, or unavailable facts.',
    locationContext
      ? `Strict personalization mode: keep guidance centered around this local context only: ${locationContext}.`
      : 'Personalization mode: disabled or unavailable.',
    `Known app context: ${contextSummary || 'No direct entities matched.'}`,
    `User query: ${query}`,
  ].join('\n');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 280,
        messages: [{ role: 'user', content: instruction }],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawContent = payload.choices?.[0]?.message?.content?.trim() ?? '';
    const content = sanitizeModelOutput(rawContent);
    return content || null;
  } catch {
    return null;
  }
}

async function callSarvamEntityProfileSections(query: string, language: 'en' | 'hi'): Promise<ChatStructuredSection[] | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const endpoint = process.env.SARVAM_CHAT_URL?.trim() || 'https://api.sarvam.ai/v1/chat/completions';
  const model = process.env.SARVAM_MODEL?.trim() || 'sarvam-m';
  const prompt = [
    'You are a sports profile formatter for InStadium app.',
    `Answer language: ${language === 'hi' ? 'Hindi' : 'English'}.`,
    'Return STRICT JSON only with this schema:',
    '{"reply":"string","sections":[{"title":"string","items":["string"]}]}',
    'Include 2-4 sections with concise bullet points.',
    'No chain-of-thought. No reasoning preface. No markdown fences.',
    'Focus only on sports context.',
    `User query: ${query}`,
  ].join('\n');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 380,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? '';
    const cleaned = sanitizeModelOutput(raw);
    const jsonPayload = extractFirstJsonObject(cleaned);
    if (!jsonPayload) {
      return null;
    }

    const parsed = JSON.parse(jsonPayload) as {
      sections?: Array<{ title?: string; items?: string[] }>;
    };

    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
          .map((section) => ({
            title: typeof section.title === 'string' && section.title.trim() ? section.title.trim() : 'Details',
            items: Array.isArray(section.items) ? section.items.filter((item) => typeof item === 'string' && item.trim()) : [],
          }))
          .filter((section) => section.items.length > 0)
          .slice(0, 4)
      : [];

    return sections.length > 0 ? sections : null;
  } catch {
    return null;
  }
}

async function callSarvamExtraction(query: string, language: ChatLanguage): Promise<SarvamExtraction | null> {
  const apiKey = process.env.SARVAM_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const endpoint = process.env.SARVAM_CHAT_URL?.trim() || 'https://api.sarvam.ai/v1/chat/completions';
  const model = process.env.SARVAM_MODEL?.trim() || 'sarvam-m';

  const prompt = [
    'You are an intent and entity extractor for a sports app called InStadium.',
    'Return only strict JSON with keys: intent, entityType, entityName, entityNameEnglish, isDomainRelevant, answerLanguage.',
    'intent must be one of: player_info, stadium_info, sport_info, general_query, navigation.',
    'entityType must be one of: player, stadium, sport, or null.',
    'entityName must be a string or null.',
    'entityNameEnglish must be a canonical English name/transliteration (for DB lookup) or null.',
    'answerLanguage must be en or hi. Use the same language as user unless unknown.',
    `User language preference: ${language}.`,
    `User query: ${query}`,
  ].join('\n');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const rawError = await response.text();
      console.error('Sarvam extraction failed:', response.status, rawError);
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = payload.choices?.[0]?.message?.content;
    if (!rawContent) {
      return null;
    }

    const cleaned = sanitizeModelOutput(rawContent);
    const jsonPayload = extractFirstJsonObject(cleaned);
    if (!jsonPayload) {
      return null;
    }

    const parsed = JSON.parse(jsonPayload) as Partial<SarvamExtraction>;
    const answerLanguage = parsed.answerLanguage === 'hi' ? 'hi' : 'en';
    const intentValues = new Set(['player_info', 'stadium_info', 'sport_info', 'general_query', 'navigation']);
    const intent = intentValues.has(String(parsed.intent))
      ? (parsed.intent as SarvamExtraction['intent'])
      : 'general_query';
    const entityType = parsed.entityType === 'player' || parsed.entityType === 'stadium' || parsed.entityType === 'sport' ? parsed.entityType : null;
    const entityName = typeof parsed.entityName === 'string' && parsed.entityName.trim() ? parsed.entityName.trim() : null;
    const entityNameEnglish =
      typeof parsed.entityNameEnglish === 'string' && parsed.entityNameEnglish.trim() ? parsed.entityNameEnglish.trim() : null;

    return {
      intent,
      entityType,
      entityName,
      entityNameEnglish,
      isDomainRelevant: Boolean(parsed.isDomainRelevant),
      answerLanguage,
    };
  } catch (error) {
    console.error('Sarvam extraction exception:', error);
    return null;
  }
}

async function searchPlayers(query: string): Promise<SearchCandidate[]> {
  const rows = await prisma.player.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: { sport: true },
    take: 5,
  });

  return rows.map((row) => ({
    id: row.id,
    entityType: 'player',
    name: row.name,
    subtitle: `${row.country} • ${row.sport.name}`,
  }));
}

async function searchStadiums(query: string): Promise<SearchCandidate[]> {
  const rows = await prisma.stadium.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          city: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    take: 5,
  });

  return rows.map((row) => ({
    id: row.id,
    entityType: 'stadium',
    name: row.name,
    subtitle: `${row.city}, ${row.country}`,
  }));
}

async function searchSports(query: string): Promise<SearchCandidate[]> {
  const rows = await prisma.sport.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    take: 5,
  });

  return rows.map((row) => ({
    id: row.id,
    entityType: 'sport',
    name: row.name,
    subtitle: 'Sport profile',
  }));
}

async function resolveTopPlayersLinks(query: string): Promise<ChatLink[]> {
  const sportKeyword = detectSportKeyword(query);
  let sportId: string | null = null;
  let sportName: string | null = null;

  if (sportKeyword) {
    const sport = await prisma.sport.findFirst({
      where: {
        name: {
          contains: sportKeyword,
          mode: 'insensitive',
        },
      },
      select: { id: true, name: true },
    });

    sportId = sport?.id ?? null;
    sportName = sport?.name ?? sportKeyword;
  }

  const players = await prisma.player.findMany({
    where: sportId ? { sportId } : undefined,
    include: { sport: true },
    orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }],
    take: 5,
  });

  return players.map((player, idx) => ({
    id: player.id,
    entityType: 'player',
    label: player.name,
    subtitle: `${player.country} • ${player.sport.name}${sportName ? '' : ''}`,
    route: buildRoute('player', player.id),
    score: Number((0.96 - idx * 0.03).toFixed(2)),
  }));
}

async function resolveNearbyStadiumLinks(): Promise<ChatLink[]> {
  const stadiums = await prisma.stadium.findMany({
    orderBy: { capacity: 'desc' },
    take: 5,
  });

  return stadiums.map((stadium, idx) => ({
    id: stadium.id,
    entityType: 'stadium',
    label: stadium.name,
    subtitle: `${stadium.city}, ${stadium.country}`,
    route: buildRoute('stadium', stadium.id),
    score: Number((0.95 - idx * 0.03).toFixed(2)),
  }));
}

async function resolveNearestStadiumLinks(query: string, location: ChatLocation): Promise<ChatLink[]> {
  const sportKeyword = detectSportKeyword(query);
  const rows = await prisma.stadium.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      ...(sportKeyword
        ? {
            sportsPlayed: {
              some: {
                name: {
                  contains: sportKeyword,
                  mode: 'insensitive',
                },
              },
            },
          }
        : {}),
    },
    include: {
      sportsPlayed: {
        select: { name: true },
        take: 3,
      },
    },
    take: 80,
  });

  const nearest = rows
    .map((row) => ({
      row,
      distanceKm: getDistanceKm(location.latitude, location.longitude, row.latitude as number, row.longitude as number),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);

  return nearest.map((item, idx) => ({
    id: item.row.id,
    entityType: 'stadium',
    label: item.row.name,
    subtitle: `${item.row.city}, ${item.row.country} • ${item.distanceKm.toFixed(1)} km away`,
    route: buildRoute('stadium', item.row.id),
    score: Number((0.97 - idx * 0.03).toFixed(2)),
  }));
}

async function resolveSportsLinks(): Promise<ChatLink[]> {
  const sports = await prisma.sport.findMany({
    orderBy: { name: 'asc' },
    take: 6,
  });

  return sports.map((sport, idx) => ({
    id: sport.id,
    entityType: 'sport',
    label: sport.name,
    subtitle: 'Sport profile',
    route: buildRoute('sport', sport.id),
    score: Number((0.94 - idx * 0.02).toFixed(2)),
  }));
}

async function buildEntityProfileSectionsFromDb(entityType: EntityType, id: string): Promise<ChatStructuredSection[]> {
  if (entityType === 'player') {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        sport: true,
        stadiumsPlayed: {
          select: { name: true, city: true },
          take: 5,
        },
      },
    });

    if (!player) {
      return [];
    }

    const achievements = toBulletItems(player.achievements, 5);
    const stadiums = player.stadiumsPlayed.map((s) => `${s.name} (${s.city})`).slice(0, 5);

    return [
      {
        title: 'Player Snapshot',
        items: [`Name: ${player.name}`, `Sport: ${player.sport.name}`, `Country: ${player.country}`],
      },
      {
        title: 'Achievements',
        items: achievements.length > 0 ? achievements : ['Achievements data is limited in current dataset.'],
      },
      {
        title: 'Stadiums Played',
        items: stadiums.length > 0 ? stadiums : ['No stadium mapping available in current dataset.'],
      },
    ];
  }

  if (entityType === 'stadium') {
    const stadium = await prisma.stadium.findUnique({
      where: { id },
      include: {
        sportsPlayed: { select: { name: true }, take: 6 },
        players: { select: { name: true }, take: 6 },
      },
    });

    if (!stadium) {
      return [];
    }

    return [
      {
        title: 'Stadium Snapshot',
        items: [
          `Name: ${stadium.name}`,
          `Location: ${stadium.city}, ${stadium.state}, ${stadium.country}`,
          `Capacity: ${stadium.capacity}`,
          `Built: ${stadium.builtYear}`,
        ],
      },
      {
        title: 'Sports Hosted',
        items:
          stadium.sportsPlayed.length > 0
            ? stadium.sportsPlayed.map((sport) => sport.name).slice(0, 6)
            : ['Sports mapping is limited in current dataset.'],
      },
      {
        title: 'Notable Players Linked',
        items:
          stadium.players.length > 0
            ? stadium.players.map((player) => player.name).slice(0, 6)
            : ['Player mapping is limited in current dataset.'],
      },
    ];
  }

  if (entityType === 'sport') {
    const sport = await prisma.sport.findUnique({
      where: { id },
      include: {
        players: { select: { name: true, country: true }, take: 8 },
        stadiums: { select: { name: true, city: true }, take: 8 },
      },
    });

    if (!sport) {
      return [];
    }

    return [
      {
        title: 'Sport Snapshot',
        items: [`Name: ${sport.name}`, `Description: ${sport.description}`],
      },
      {
        title: 'Top Players',
        items:
          sport.players.length > 0
            ? sport.players.map((player) => `${player.name} (${player.country})`).slice(0, 6)
            : ['Player mapping is limited in current dataset.'],
      },
      {
        title: 'Associated Stadiums',
        items:
          sport.stadiums.length > 0
            ? sport.stadiums.map((stadium) => `${stadium.name} (${stadium.city})`).slice(0, 6)
            : ['Stadium mapping is limited in current dataset.'],
      },
    ];
  }

  return [];
}

async function resolveLocationContextLinks(query: string, location: ChatLocation): Promise<ChatLink[]> {
  try {
    const links = await resolveNearestStadiumLinks(query, location);
    return links.slice(0, 2);
  } catch {
    return [];
  }
}

type GeoapifyPlaceFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    formatted?: string;
    lat?: number;
    lon?: number;
  };
};

async function fetchNearbyPlaces(location: ChatLocation, categories: string[], limit = 5): Promise<ChatLink[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY?.trim();
  if (!apiKey) {
    return [];
  }

  const endpoint = process.env.GEOAPIFY_PLACES_URL?.trim() || GEOAPIFY_PLACES_ENDPOINT;
  const filter = `circle:${location.longitude},${location.latitude},${GEOAPIFY_RADIUS_METERS}`;
  const bias = `proximity:${location.longitude},${location.latitude}`;

  const params = new URLSearchParams({
    categories: categories.join(','),
    filter,
    bias,
    limit: String(limit),
    apiKey,
  });

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, { method: 'GET' });
    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { features?: GeoapifyPlaceFeature[] };
    const features = Array.isArray(payload.features) ? payload.features : [];

    const links: ChatLink[] = [];
    for (const [idx, feature] of features.entries()) {
      const props = feature.properties ?? {};
      const name = (props.name || props.formatted || '').trim();
      if (!name) {
        continue;
      }

      const lat = typeof props.lat === 'number' ? props.lat : undefined;
      const lon = typeof props.lon === 'number' ? props.lon : undefined;

      links.push({
        id: String(props.place_id || `${name}-${idx}`),
        entityType: 'external',
        label: name,
        subtitle: props.formatted || 'Nearby place',
        route: buildMapUrl(name, lat, lon),
        score: Number((0.92 - idx * 0.03).toFixed(2)),
      });
    }

    return links.slice(0, limit);
  } catch {
    return [];
  }
}

router.post('/', async (req, res) => {
  try {
    const body = (req.body ?? {}) as ChatRequestBody;
    const message = asString(body.message).trim();
    const transcript = asString(body.transcript).trim();
    const query = message || transcript;
    const languagePreference = parseLanguage(body.language);
    const inputMode = parseInputMode(body.inputMode);
    const location = parseLocation(body.location);

    if (!query) {
      return res.status(400).json({ error: 'message or transcript is required' });
    }

    const listIntent = detectListIntent(query);
    const nearbyPlaceIntent = detectNearbyPlaceIntent(query);
    const nearestIntent = isNearestIntent(query) && /stadium|ground|cricket|football|hockey|kabaddi|sport/i.test(normalizeText(query));
    if (nearbyPlaceIntent) {
      const answerLanguage: 'en' | 'hi' = containsDevanagari(query) ? 'hi' : 'en';
      if (!location) {
        const response: ChatResponse = {
          reply:
            answerLanguage === 'hi'
              ? 'Nearby places dhoondhne ke liye location access chahiye. Permission allow karein, phir main aapko nearest suggestions dikhata hoon.'
              : 'To find nearby places, I need location access. Please allow location and I will show nearest suggestions.',
          action: 'answer_only',
          links: [],
          clarifications: [],
          structured: buildStructuredSections({
            language: answerLanguage,
            query,
            links: [],
            reason: 'nearest_missing_location',
          }),
          meta: {
            query,
            language: answerLanguage,
            inputMode,
            relevant: true,
            source: 'db-fallback',
          },
        };

        return res.json(response);
      }

      const placeLinks = await fetchNearbyPlaces(location, nearbyPlaceIntent.categories, 6);
      const locationContextLinks = await resolveLocationContextLinks(query, location);
      const links = [...locationContextLinks.slice(0, 1), ...placeLinks].slice(0, 7);

      const response: ChatResponse = {
        reply:
          answerLanguage === 'hi'
            ? `Yeh aapki current location ke paas ke ${nearbyPlaceIntent.label} hain. Main context ko nearest stadium area tak hi limited rakh raha hoon.`
            : `These are ${nearbyPlaceIntent.label} near your current location. I have kept the context restricted to your nearest stadium area.`,
        action: links.length > 0 ? 'show_links' : 'answer_only',
        links,
        clarifications: [],
        structured: buildStructuredSections({
          language: answerLanguage,
          query,
          links,
          reason: 'with_links',
        }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: true,
          source: 'db-fallback',
        },
      };

      return res.json(response);
    }

    if (listIntent || nearestIntent) {
      const answerLanguage: 'en' | 'hi' = containsDevanagari(query) ? 'hi' : 'en';
      let links: ChatLink[] = [];
      let reply = '';

      if (nearestIntent) {
        if (!location) {
          reply =
            answerLanguage === 'hi'
              ? 'Nearest stadium batane ke liye mujhe aapki location chahiye. Location permission allow karke phir se try karein.'
              : 'To find the nearest stadium, I need your location. Please allow location access and try again.';
        } else {
          links = await resolveNearestStadiumLinks(query, location);
          reply =
            answerLanguage === 'hi'
              ? 'Aapki location ke hisaab se yeh nearest stadium pages mile hain.'
              : 'Based on your location, these are the nearest stadium pages.';
        }
      } else if (listIntent === 'top_players') {
        links = await resolveTopPlayersLinks(query);
        reply =
          answerLanguage === 'hi'
            ? 'Maine top player pages dhoondh liye hain. Neeche links se open karein.'
            : 'I found top player pages for you. Open them from the links below.';
      } else if (listIntent === 'nearby_stadiums') {
        links = await resolveNearbyStadiumLinks();
        reply =
          answerLanguage === 'hi'
            ? 'Yeh popular stadium pages hain. Inmein se koi bhi open kar sakte hain.'
            : 'Here are popular stadium pages you can open.';
      } else {
        links = await resolveSportsLinks();
        reply =
          answerLanguage === 'hi'
            ? 'Yeh app mein available sports pages hain.'
            : 'These are sports pages available in the app.';
      }

      const inferredEntity = inferEntityNameFromQuery(query);
      if (inferredEntity) {
        const wiki = buildWikipediaLink(inferredEntity, answerLanguage, null);
        if (wiki) {
          links = [...links, wiki];
        }
      }

      const response: ChatResponse = {
        reply,
        action: links.length > 0 ? 'show_links' : 'answer_only',
        links,
        clarifications: [],
        structured: buildStructuredSections({
          language: answerLanguage,
          query,
          links,
          reason: nearestIntent && !location ? 'nearest_missing_location' : 'with_links',
        }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: true,
          source: 'db-fallback',
        },
      };

      logChatTelemetry({
        stage: 'final',
        reason: nearestIntent ? 'nearest_stadium_intent' : `list_intent_${listIntent}`,
        query,
        action: response.action,
        language: answerLanguage,
        inputMode,
        source: 'db-fallback',
        relevant: true,
        candidates: links.length,
        topScore: links[0]?.score ?? 0,
        secondScore: links[1]?.score ?? 0,
        entityType: links[0]?.entityType ?? null,
      });

      return res.json(response);
    }

    const extracted = await callSarvamExtraction(query, languagePreference);
    const inferredName = inferEntityNameFromQuery(query);
    const searchTerms = [
      extracted?.entityNameEnglish,
      extracted?.entityName,
      inferredName,
      query,
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .slice(0, 3);

    const primaryTerm = searchTerms[0] || query;
    const answerLanguage = extracted?.answerLanguage || (languagePreference === 'hi' ? 'hi' : 'en');

    const dbSource: SearchCandidate[] = [];

    if (searchTerms.length > 0) {
      for (const term of searchTerms) {
        if (extracted?.entityType === 'player') {
          dbSource.push(...(await searchPlayers(term)));
        } else if (extracted?.entityType === 'stadium') {
          dbSource.push(...(await searchStadiums(term)));
        } else if (extracted?.entityType === 'sport') {
          dbSource.push(...(await searchSports(term)));
        } else {
          const [players, stadiums, sports] = await Promise.all([
            searchPlayers(term),
            searchStadiums(term),
            searchSports(term),
          ]);
          dbSource.push(...players, ...stadiums, ...sports);
        }
      }
    }

    const deduped = new Map<string, SearchCandidate>();
    for (const item of dbSource) {
      const key = `${item.entityType}:${item.id}`;
      if (!deduped.has(key)) {
        deduped.set(key, item);
      }
    }

    const rankedLinks = [...deduped.values()]
      .map((item) => {
        const score = Math.max(...searchTerms.map((term) => scoreCandidate(term, item.name)), scoreCandidate(query, item.name));

        return {
          id: item.id,
          entityType: item.entityType,
          label: item.name,
          subtitle: item.subtitle,
          score,
          route: buildRoute(item.entityType, item.id),
        };
      })
      .filter((item) => item.score >= MIN_CANDIDATE_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const relevant =
      extracted?.isDomainRelevant ||
      rankedLinks.length > 0 ||
      isDomainRelevantQuery(query) ||
      containsDevanagari(query);

    const telemetrySource = extracted ? 'sarvam+db' : 'db-fallback';
    const top = rankedLinks[0];
    const second = rankedLinks[1];
    const topScore = top?.score ?? 0;
    const secondScore = second?.score ?? 0;

    if (!relevant) {
      const outOfScopeReply =
        answerLanguage === 'hi'
          ? 'Main InStadium app ke sports context ke queries handle karta hoon. Aap player, stadium, ya sport ke bare mein pooch sakte hain.'
          : 'I currently handle InStadium sports context queries. Ask me about players, stadiums, or sports.';

      const response: ChatResponse = {
        reply: outOfScopeReply,
        action: 'answer_only',
        links: [],
        clarifications: [],
        structured: buildStructuredSections({
          language: answerLanguage,
          query,
          links: [],
          reason: 'out_of_scope',
        }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: false,
          source: telemetrySource,
        },
      };

      logChatTelemetry({
        stage: 'final',
        reason: 'out_of_scope',
        query,
        action: response.action,
        language: answerLanguage,
        inputMode,
        source: telemetrySource,
        relevant: false,
        candidates: rankedLinks.length,
        topScore,
        secondScore,
        entityType: extracted?.entityType ?? null,
      });

      return res.json(response);
    }

    if (rankedLinks.length === 0) {
      const profileQuery = isEntityProfileQuery(query) || Boolean(extracted?.entityType);
      const locationContextLinks = location ? await resolveLocationContextLinks(query, location) : [];
      const llmReply = profileQuery
        ? null
        : await callSarvamContextAnswer(
            query,
            answerLanguage,
            [...locationContextLinks, ...rankedLinks].slice(0, 3),
            locationContextLinks[0]?.label
          );
      const llmSections = profileQuery ? await callSarvamEntityProfileSections(query, answerLanguage) : null;
      const wikiName = extracted?.entityNameEnglish || extracted?.entityName || inferredName;
      const wikiLink = wikiName ? buildWikipediaLink(wikiName, answerLanguage, extracted?.entityType ?? null) : null;
      const linksBase = [...locationContextLinks.slice(0, 1), ...(wikiLink ? [wikiLink] : [])];
      const links = linksBase;
      const response: ChatResponse = {
        reply: sanitizeModelOutput(
          llmReply ||
            (profileQuery
              ? answerLanguage === 'hi'
                ? `Maine ${wikiName || 'is query'} ke liye sports context summary tayyar ki hai. Details neeche bullet points mein hain.`
                : `I prepared a sports-context summary for ${wikiName || 'this query'}. Details are listed in bullet points below.`
              : buildFallbackReply(answerLanguage, query))
        ),
        action: links.length > 0 ? 'show_links' : 'answer_only',
        links,
        clarifications: [],
        structured:
          llmSections && llmSections.length > 0
            ? llmSections
            : buildStructuredSections({
                language: answerLanguage,
                query,
                links,
                reason: 'relevant_no_match',
              }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: true,
          source: telemetrySource,
        },
      };

      logChatTelemetry({
        stage: 'final',
        reason: 'relevant_no_match',
        query,
        action: response.action,
        language: answerLanguage,
        inputMode,
        source: telemetrySource,
        relevant: true,
        candidates: 0,
        topScore,
        secondScore,
        entityType: extracted?.entityType ?? null,
      });

      return res.json(response);
    }

    const shouldClarify =
      Boolean(second) && (topScore < HIGH_CONFIDENCE_SCORE || topScore - secondScore < CLARIFY_SCORE_GAP);

    if (topScore < MIN_NAVIGATION_SCORE) {
      const locationContextLinks = location ? await resolveLocationContextLinks(query, location) : [];
      const llmReply = await callSarvamContextAnswer(
        query,
        answerLanguage,
        [...locationContextLinks, ...rankedLinks].slice(0, 4),
        locationContextLinks[0]?.label
      );
      const wikiName = extracted?.entityNameEnglish || extracted?.entityName || inferredName;
      const wikiLink = wikiName ? buildWikipediaLink(wikiName, answerLanguage, extracted?.entityType ?? null) : null;
      const links = wikiLink
        ? [...locationContextLinks.slice(0, 1), wikiLink, ...rankedLinks.slice(0, 2)]
        : [...locationContextLinks.slice(0, 1), ...rankedLinks.slice(0, 2)];
      const response: ChatResponse = {
        reply: sanitizeModelOutput(llmReply || buildGeneralContextReply(answerLanguage, query)),
        action: links.length > 0 ? 'show_links' : 'answer_only',
        links,
        clarifications: [],
        structured: buildStructuredSections({
          language: answerLanguage,
          query,
          links,
          reason: 'low_confidence',
        }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: true,
          source: telemetrySource,
        },
      };

      logChatTelemetry({
        stage: 'final',
        reason: 'low_confidence_top_score',
        query,
        action: response.action,
        language: answerLanguage,
        inputMode,
        source: telemetrySource,
        relevant: true,
        candidates: rankedLinks.length,
        topScore,
        secondScore,
        entityType: extracted?.entityType ?? null,
      });

      return res.json(response);
    }

    if (shouldClarify) {
      const wikiName = extracted?.entityNameEnglish || extracted?.entityName || inferredName;
      const wikiLink = wikiName ? buildWikipediaLink(wikiName, answerLanguage, extracted?.entityType ?? null) : null;
      const clarifyLinks = wikiLink ? [...rankedLinks.slice(0, 3), wikiLink] : rankedLinks.slice(0, 3);
      const response: ChatResponse = {
        reply:
          answerLanguage === 'hi'
            ? 'Mujhe kuch matching options mile hain. Aap inmein se kis ke baare mein dekhna chahte hain?'
            : 'I found a few close matches. Which one would you like to open?',
        action: 'ask_clarification',
        links: clarifyLinks,
        clarifications: clarifyLinks.map((item) => item.label),
        structured: buildStructuredSections({
          language: answerLanguage,
          query,
          links: clarifyLinks,
          reason: 'with_links',
        }),
        meta: {
          query,
          language: answerLanguage,
          inputMode,
          relevant: true,
          source: telemetrySource,
        },
      };

      logChatTelemetry({
        stage: 'final',
        reason: 'ambiguous_matches',
        query,
        action: response.action,
        language: answerLanguage,
        inputMode,
        source: telemetrySource,
        relevant: true,
        candidates: rankedLinks.length,
        topScore,
        secondScore,
        entityType: extracted?.entityType ?? null,
      });

      return res.json(response);
    }

    const links = rankedLinks.slice(0, 3);
    const wikiName = extracted?.entityNameEnglish || extracted?.entityName || inferredName || links[0]?.label;
    const wikiLink = wikiName ? buildWikipediaLink(wikiName, answerLanguage, extracted?.entityType ?? null) : null;
    const finalLinks = wikiLink ? [...links, wikiLink] : links;
    const primaryEntityType = links[0]?.entityType;
    const primaryEntityId = links[0]?.id;
    const profileSections =
      primaryEntityType && primaryEntityType !== 'external' && primaryEntityId
        ? await buildEntityProfileSectionsFromDb(primaryEntityType, primaryEntityId)
        : [];
    const response: ChatResponse = {
      reply:
        answerLanguage === 'hi'
          ? `Maine ${links[0].label} ke liye page find kar liya hai. Neeche links mein app page aur Wikipedia reference dono milenge.`
          : `I found a page for ${links[0].label}. You can open both the app page and Wikipedia reference below.`,
      action: 'show_links',
      links: finalLinks,
      clarifications: [],
      structured:
        profileSections.length > 0
          ? profileSections
          : buildStructuredSections({
              language: answerLanguage,
              query,
              links: finalLinks,
              reason: 'with_links',
            }),
      meta: {
        query,
        language: answerLanguage,
        inputMode,
        relevant: true,
        source: telemetrySource,
      },
    };

    logChatTelemetry({
      stage: 'final',
      reason: 'high_confidence_navigation',
      query,
      action: response.action,
      language: answerLanguage,
      inputMode,
      source: telemetrySource,
      relevant: true,
      candidates: rankedLinks.length,
      topScore,
      secondScore,
      entityType: extracted?.entityType ?? null,
    });

    return res.json(response);
  } catch (error) {
    console.error('POST /api/chat failed:', error);
    return res.status(500).json({ error: 'Failed to process chat' });
  }
});

export default router;
