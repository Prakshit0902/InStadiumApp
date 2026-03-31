import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
const router = Router();
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
];
function asString(value) {
    return typeof value === 'string' ? value : '';
}
function normalizeText(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function parseLanguage(value) {
    if (value === 'en' || value === 'hi' || value === 'auto') {
        return value;
    }
    return 'auto';
}
function parseInputMode(value) {
    return value === 'voice' ? 'voice' : 'text';
}
function isDomainRelevantQuery(query) {
    const normalized = normalizeText(query);
    if (!normalized) {
        return false;
    }
    return DOMAIN_KEYWORDS.some((keyword) => normalized.includes(keyword));
}
function inferEntityNameFromQuery(query) {
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
function scoreCandidate(query, candidateName) {
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
    return Number((coverage * 0.75).toFixed(2));
}
function buildRoute(entityType, id) {
    if (entityType === 'player') {
        return `/player/${encodeURIComponent(id)}`;
    }
    if (entityType === 'stadium') {
        return `/stadium/${encodeURIComponent(id)}`;
    }
    return `/sport/${encodeURIComponent(id)}`;
}
function buildFallbackReply(language, query) {
    if (language === 'hi') {
        return `Mujhe "${query}" ke liye app mein direct page nahin mila, lekin main InStadium context mein madad kar sakta hoon. Aap player, stadium ya sport ka naam pooch sakte hain.`;
    }
    return `I could not find a direct page for "${query}", but I can still help within InStadium context. Ask about a player, stadium, or sport and I will guide you.`;
}
async function callSarvamExtraction(query, language) {
    const apiKey = process.env.SARVAM_API_KEY?.trim();
    if (!apiKey) {
        return null;
    }
    const endpoint = process.env.SARVAM_CHAT_URL?.trim() || 'https://api.sarvam.ai/v1/chat/completions';
    const model = process.env.SARVAM_MODEL?.trim() || 'sarvam-m';
    const prompt = [
        'You are an intent and entity extractor for a sports app called InStadium.',
        'Return only strict JSON with keys: intent, entityType, entityName, isDomainRelevant, answerLanguage.',
        'intent must be one of: player_info, stadium_info, sport_info, general_query, navigation.',
        'entityType must be one of: player, stadium, sport, or null.',
        'entityName must be a string or null.',
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
        const payload = (await response.json());
        const content = payload.choices?.[0]?.message?.content;
        if (!content) {
            return null;
        }
        const parsed = JSON.parse(content);
        const answerLanguage = parsed.answerLanguage === 'hi' ? 'hi' : 'en';
        const intentValues = new Set(['player_info', 'stadium_info', 'sport_info', 'general_query', 'navigation']);
        const intent = intentValues.has(String(parsed.intent))
            ? parsed.intent
            : 'general_query';
        const entityType = parsed.entityType === 'player' || parsed.entityType === 'stadium' || parsed.entityType === 'sport' ? parsed.entityType : null;
        const entityName = typeof parsed.entityName === 'string' && parsed.entityName.trim() ? parsed.entityName.trim() : null;
        return {
            intent,
            entityType,
            entityName,
            isDomainRelevant: Boolean(parsed.isDomainRelevant),
            answerLanguage,
        };
    }
    catch (error) {
        console.error('Sarvam extraction exception:', error);
        return null;
    }
}
async function searchPlayers(query) {
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
async function searchStadiums(query) {
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
async function searchSports(query) {
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
router.post('/', async (req, res) => {
    try {
        const body = (req.body ?? {});
        const message = asString(body.message).trim();
        const transcript = asString(body.transcript).trim();
        const query = message || transcript;
        const languagePreference = parseLanguage(body.language);
        const inputMode = parseInputMode(body.inputMode);
        if (!query) {
            return res.status(400).json({ error: 'message or transcript is required' });
        }
        const extracted = await callSarvamExtraction(query, languagePreference);
        const inferredName = inferEntityNameFromQuery(query);
        const searchTerm = (extracted?.entityName || inferredName || query).trim();
        const answerLanguage = extracted?.answerLanguage || (languagePreference === 'hi' ? 'hi' : 'en');
        const dbSource = [];
        if (searchTerm) {
            if (extracted?.entityType === 'player') {
                dbSource.push(...(await searchPlayers(searchTerm)));
            }
            else if (extracted?.entityType === 'stadium') {
                dbSource.push(...(await searchStadiums(searchTerm)));
            }
            else if (extracted?.entityType === 'sport') {
                dbSource.push(...(await searchSports(searchTerm)));
            }
            else {
                const [players, stadiums, sports] = await Promise.all([
                    searchPlayers(searchTerm),
                    searchStadiums(searchTerm),
                    searchSports(searchTerm),
                ]);
                dbSource.push(...players, ...stadiums, ...sports);
            }
        }
        const rankedLinks = dbSource
            .map((item) => {
            const score = scoreCandidate(searchTerm || query, item.name);
            return {
                id: item.id,
                entityType: item.entityType,
                label: item.name,
                subtitle: item.subtitle,
                score,
                route: buildRoute(item.entityType, item.id),
            };
        })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        const relevant = extracted?.isDomainRelevant || rankedLinks.length > 0 || isDomainRelevantQuery(query);
        if (!relevant) {
            const outOfScopeReply = answerLanguage === 'hi'
                ? 'Main InStadium app ke sports context ke queries handle karta hoon. Aap player, stadium, ya sport ke bare mein pooch sakte hain.'
                : 'I currently handle InStadium sports context queries. Ask me about players, stadiums, or sports.';
            const response = {
                reply: outOfScopeReply,
                action: 'answer_only',
                links: [],
                clarifications: [],
                meta: {
                    query,
                    language: answerLanguage,
                    inputMode,
                    relevant: false,
                    source: extracted ? 'sarvam+db' : 'db-fallback',
                },
            };
            return res.json(response);
        }
        if (rankedLinks.length === 0) {
            const response = {
                reply: buildFallbackReply(answerLanguage, query),
                action: 'answer_only',
                links: [],
                clarifications: [],
                meta: {
                    query,
                    language: answerLanguage,
                    inputMode,
                    relevant: true,
                    source: extracted ? 'sarvam+db' : 'db-fallback',
                },
            };
            return res.json(response);
        }
        const top = rankedLinks[0];
        const second = rankedLinks[1];
        const shouldClarify = Boolean(second) && top.score < 0.9 && top.score - second.score < 0.12;
        if (shouldClarify) {
            const response = {
                reply: answerLanguage === 'hi'
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
                    source: extracted ? 'sarvam+db' : 'db-fallback',
                },
            };
            return res.json(response);
        }
        const links = rankedLinks.slice(0, 3);
        const response = {
            reply: answerLanguage === 'hi'
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
                source: extracted ? 'sarvam+db' : 'db-fallback',
            },
        };
        return res.json(response);
    }
    catch (error) {
        console.error('POST /api/chat failed:', error);
        return res.status(500).json({ error: 'Failed to process chat' });
    }
});
export default router;
