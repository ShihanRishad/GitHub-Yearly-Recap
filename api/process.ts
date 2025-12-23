import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchGitHubData } from './lib/github.js';
import { updateRecapReady, updateRecapError } from './lib/firestore.js';
import { calculateStreaks, calculatePeakStats, calculateLanguageStats, calculateTotalStars } from './lib/stats.js';
import { generateCommentary } from './lib/gemini.js';
import { generateOGImage } from './lib/og-image.js';
import { uploadImage } from './lib/cloudinary.js';
import { validateConfig } from './lib/config.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate configuration
    if (!validateConfig()) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const { username, year } = req.query;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const yearNum = parseInt(year as string, 10) || new Date().getFullYear();

    try {
        console.log(`Processing recap for ${username}/${yearNum}`);

        // 1. Fetch GitHub data
        const githubData = await fetchGitHubData(username, yearNum);

        if (!githubData) {
            await updateRecapError(username, yearNum, 'User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Calculate stats
        const { longestStreak, currentStreak } = calculateStreaks(githubData.contributionCalendar);
        const peakStats = calculatePeakStats(githubData.contributionCalendar);
        const topLanguages = calculateLanguageStats(githubData.languageStats);
        const totalStars = calculateTotalStars(githubData.repositories);

        // 3. Generate AI commentary
        const notes = await generateCommentary({
            username,
            year: yearNum,
            totalContributions: githubData.contributionCalendar.totalContributions,
            longestStreak: longestStreak.count,
            topDay: {
                date: peakStats.topDay.date,
                contributions: peakStats.topDay.contributions,
            },
            topMonth: {
                month: peakStats.topMonth.month,
                contributions: peakStats.topMonth.contributions,
            },
            prCount: githubData.prCounts.opened,
            issueCount: githubData.issueCounts.opened,
            newReposCount: githubData.repositories.length,
            followers: githubData.followers,
            totalStars,
            topLanguages: topLanguages.slice(0, 5).map(l => l.name),
        });

        // 4. Generate OG image
        const ogImageBuffer = await generateOGImage({
            username,
            displayName: githubData.name || username,
            avatarUrl: githubData.avatarUrl,
            year: yearNum,
            totalContributions: githubData.contributionCalendar.totalContributions,
            longestStreak: longestStreak.count,
            topLanguage: topLanguages[0]?.name || 'Code',
            totalStars,
        });

        // 5. Upload OG image to Cloudinary
        const uploadResult = await uploadImage(
            ogImageBuffer,
            'og-images',
            `${username}-${yearNum}`
        );

        // 6. Prepare processed data
        const processedData = {
            username,
            displayName: githubData.name || username,
            avatarUrl: githubData.avatarUrl,
            bio: githubData.bio,
            year: yearNum,
            totalContributions: githubData.contributionCalendar.totalContributions,
            contributionCalendar: githubData.contributionCalendar,
            longestStreak,
            currentStreak,
            peakStats,
            prCounts: githubData.prCounts,
            issueCounts: githubData.issueCounts,
            newRepos: githubData.repositories.map(repo => ({
                name: repo.name,
                description: repo.description,
                url: repo.url,
                stars: repo.stars,
                forks: repo.forks,
                language: repo.language,
                createdAt: repo.createdAt,
                isPrivate: repo.isPrivate,
            })),
            totalReposCreated: githubData.repositories.length,
            followers: githubData.followers,
            following: githubData.following,
            totalStars,
            topLanguages,
            notes,
            ogImageUrl: uploadResult.secureUrl,
            generatedAt: new Date().toISOString(),
        };

        // 7. Update Firestore
        await updateRecapReady(username, yearNum, processedData, uploadResult.secureUrl);

        console.log(`Recap processed successfully for ${username}/${yearNum}`);

        return res.status(200).json({
            status: 'ready',
            data: processedData,
            ogImageUrl: uploadResult.secureUrl,
        });
    } catch (error) {
        console.error('Error processing recap:', error);

        await updateRecapError(
            username,
            yearNum,
            error instanceof Error ? error.message : 'Unknown error'
        );

        return res.status(500).json({
            error: 'Failed to process recap',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
