import { Router } from 'express';
import { createHash } from 'node:crypto';
import { prisma } from '../lib/prisma.js';

const router = Router();

type ChatAction = 'answer_only' | 'show_links' | 'ask_clarification';
type EntityType = 'player' | 'stadium' | 'sport';
type ChatLanguage = 'en' | 'hi' | 'auto';
type InputMode = 'text' | 'voice';

type ChatRequestBody = {
  message?: unknown;
  transcript?: unknown;
  language?: unknown;
  inputMode?: unknown;
};

type ChatLink = {
  id: string;
  entityType: EntityType;
  label: string;
  subtitle?: string;
  route: string;
  score: number;
};

type ChatResponse = {
  reply: string;
  action: ChatAction;
  links: ChatLink[];
  clarifications: string[];
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

function parseLanguage(value: unknown): ChatLanguage {
  if (value === 'en' || value === 'hi' || value === 'auto') {
    return value;
  }

  return 'auto';
}

function parseInputMode(value: unknown): InputMode {
  return value === 'voice' ? 'voice' : 'text';
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

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = JSON.parse(content) as Partial<SarvamExtraction>;
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

router.post('/', async (req, res) => {
  try {
    const body = (req.body ?? {}) as ChatRequestBody;
    const message = asString(body.message).trim();
    const transcript = asString(body.transcript).trim();
    const query = message || transcript;
    const languagePreference = parseLanguage(body.language);
    const inputMode = parseInputMode(body.inputMode);

    if (!query) {
      return res.status(400).json({ error: 'message or transcript is required' });
    }

    const listIntent = detectListIntent(query);
    if (listIntent) {
      const answerLanguage: 'en' | 'hi' = containsDevanagari(query) ? 'hi' : 'en';
      let links: ChatLink[] = [];
      let reply = '';

      if (listIntent === 'top_players') {
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

      const response: ChatResponse = {
        reply,
        action: links.length > 0 ? 'show_links' : 'answer_only',
        links,
        clarifications: [],
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
        reason: `list_intent_${listIntent}`,
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
      const response: ChatResponse = {
        reply: buildFallbackReply(answerLanguage, query),
        action: 'answer_only',
        links: [],
        clarifications: [],
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
      const response: ChatResponse = {
        reply: buildGeneralContextReply(answerLanguage, query),
        action: 'answer_only',
        links: [],
        clarifications: [],
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
      const response: ChatResponse = {
        reply:
          answerLanguage === 'hi'
            ? 'Mujhe kuch matching options mile hain. Aap inmein se kis ke baare mein dekhna chahte hain?'
            : 'I found a few close matches. Which one would you like to open?',
        action: 'ask_clarification',
        links: rankedLinks.slice(0, 3),
        clarifications: rankedLinks.slice(0, 3).map((item) => item.label),
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
    const response: ChatResponse = {
      reply:
        answerLanguage === 'hi'
          ? `Maine ${links[0].label} ke liye page find kar liya hai. Neeche se open kar sakte hain.`
          : `I found a page for ${links[0].label}. You can open it from the links below.`,
      action: 'show_links',
      links,
      clarifications: [],
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
