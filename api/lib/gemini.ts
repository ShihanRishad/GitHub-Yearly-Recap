import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export interface CommentaryNote {
    id: string;
    category: 'streak' | 'productivity' | 'languages' | 'social' | 'repos' | 'general';
    title: string;
    content: string;
    emoji: string;
}

interface RecapStats {
    username: string;
    year: number;
    totalContributions: number;
    longestStreak: number;
    topDay: { date: string; contributions: number };
    topMonth: { month: string; contributions: number };
    prCount: number;
    issueCount: number;
    newReposCount: number;
    followers: number;
    totalStars: number;
    topLanguages: string[];
}

export async function generateCommentary(stats: RecapStats): Promise<CommentaryNote[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a friendly, witty AI assistant creating fun commentary for a GitHub Recap.

Given these stats for @${stats.username} in ${stats.year}:
- Total contributions: ${stats.totalContributions}
- Longest streak: ${stats.longestStreak} days
- Best day: ${stats.topDay.date} with ${stats.topDay.contributions} contributions
- Best month: ${stats.topMonth.month} with ${stats.topMonth.contributions} contributions
- Pull requests: ${stats.prCount}
- Issues: ${stats.issueCount}
- New repos: ${stats.newReposCount}
- Followers: ${stats.followers}
- Total stars: ${stats.totalStars}
- Top languages: ${stats.topLanguages.join(', ')}

Generate 5-6 fun, encouraging, and personalized commentary notes. Each note should be SHORT (1-2 sentences max).

Format as JSON array with this structure:
[
  {
    "category": "streak|productivity|languages|social|repos|general",
    "title": "Short catchy title (3-5 words)",
    "content": "Brief fun observation (1-2 sentences)",
    "emoji": "single relevant emoji"
  }
]

Be encouraging, use modern internet language sparingly, add personality. Don't be generic.
Only return valid JSON, nothing else.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response:', text);
            return getDefaultNotes(stats);
        }

        const notes = JSON.parse(jsonMatch[0]) as Array<{
            category: CommentaryNote['category'];
            title: string;
            content: string;
            emoji: string;
        }>;

        return notes.map((note, index) => ({
            id: `note-${index}`,
            category: note.category,
            title: note.title,
            content: note.content,
            emoji: note.emoji,
        }));
    } catch (error) {
        console.error('Error generating commentary:', error);
        return getDefaultNotes(stats);
    }
}

function getDefaultNotes(stats: RecapStats): CommentaryNote[] {
    return [
        {
            id: 'note-1',
            category: 'general',
            title: 'Unstoppable Coder',
            content: `You made ${stats.totalContributions.toLocaleString()} contributions in ${stats.year}! That's dedication.`,
            emoji: '💪',
        },
        {
            id: 'note-2',
            category: 'streak',
            title: 'Streak Master',
            content: `${stats.longestStreak} days of consistency! Most developers can't keep that up.`,
            emoji: '🔥',
        },
        {
            id: 'note-3',
            category: 'languages',
            title: 'Language Lover',
            content: `Your top language is ${stats.topLanguages[0] || 'code'}. Solid choice!`,
            emoji: '💻',
        },
        {
            id: 'note-4',
            category: 'productivity',
            title: 'Peak Performance',
            content: `${stats.topMonth.month} was your month to shine with ${stats.topMonth.contributions} contributions.`,
            emoji: '📈',
        },
        {
            id: 'note-5',
            category: 'social',
            title: 'Community Star',
            content: `${stats.totalStars} stars across your repos. People appreciate your work!`,
            emoji: '⭐',
        },
    ];
}
