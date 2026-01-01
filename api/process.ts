import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchGitHubData } from './_lib/github.js';
import { updateRecapReady, updateRecapError, updateRecapStep } from './_lib/firestore.js';
import { calculateStreaks, calculatePeakStats, calculateLanguageStats, calculateTotalStars } from './_lib/stats.js';
import { generateCommentary } from './_lib/gemini.js';
import { generateOGImage } from './_lib/og-image.js';
import { uploadImage } from './_lib/cloudinary.js';
import { validateConfig, getValidationErrors } from './_lib/config.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate configuration
    if (!validateConfig()) {
        return res.status(500).json({
            error: 'Server configuration error',
            details: getValidationErrors()
        });
    }

    const { username, year } = req.query;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const yearNum = parseInt(year as string, 10) || new Date().getFullYear();

    try {
        console.log(`Processing recap for ${username}/${yearNum}`);
        const startTime = Date.now();

        // 1. Fetch GitHub data
        await updateRecapStep(username, yearNum, 'Fetching your GitHub data...');
        console.time('fetchGitHubData');
        const githubData = await fetchGitHubData(username, yearNum);
        console.timeEnd('fetchGitHubData');

        if (!githubData) {
            console.error(`User ${username} not found`);
            await updateRecapError(username, yearNum, 'User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Calculate stats
        await updateRecapStep(username, yearNum, 'Calculating your streaks & stats...');
        console.time('calculateStats');
        const { longestStreak, currentStreak } = calculateStreaks(githubData.contributionCalendar);
        const peakStats = calculatePeakStats(githubData.contributionCalendar);
        const topLanguages = calculateLanguageStats(githubData.languageStats);
        const totalStars = calculateTotalStars(githubData.repositories);
        console.timeEnd('calculateStats');

        // 3. Generate AI commentary
        await updateRecapStep(username, yearNum, 'Generating AI commentary with Gemini...');
        console.time('generateCommentary');
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
        console.timeEnd('generateCommentary');

        // 4. Generate OG image
        await updateRecapStep(username, yearNum, 'Generating shareable recap image...');
        console.time('generateOGImage');
        const ogImageBuffer = await generateOGImage({
            username,
            displayName: githubData.name || username,
            avatarUrl: githubData.avatarUrl,
            year: yearNum,
            totalContributions: githubData.contributionCalendar.totalContributions,
            longestStreak: longestStreak.count,
            topLanguage: topLanguages[0]?.name || 'Code',
            totalStars,
            newRepos: githubData.repositories.length,
            totalPRs: githubData.prCounts.opened,
            contributionCalendar: {
                ...githubData.contributionCalendar,
                weeks: githubData.contributionCalendar.weeks.map(week => ({
                    contributionDays: week.contributionDays,
                    firstDay: week.contributionDays[0]?.date || ''
                }))
            },
        });
        console.timeEnd('generateOGImage');

        // 5. Upload OG image to Cloudinary
        await updateRecapStep(username, yearNum, 'Finalizing & saving your recap...');
        console.time('uploadImage');
        const uploadResult = await uploadImage(
            ogImageBuffer,
            'og-images',
            `${username}-${yearNum}-recap`
        );
        console.timeEnd('uploadImage');

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
        console.time('updateFirestore');
        await updateRecapReady(username, yearNum, processedData, uploadResult.secureUrl);
        console.timeEnd('updateFirestore');

        const duration = Date.now() - startTime;
        console.log(`Recap processed successfully for ${username}/${yearNum} in ${duration}ms`);

        return res.status(200).json({
            status: 'ready',
            data: processedData,
            ogImageUrl: uploadResult.secureUrl,
            duration,
        });
    } catch (error) {
        console.error(`Error processing recap for ${username}/${yearNum}:`, error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await updateRecapError(
            username,
            yearNum,
            errorMessage
        );

        return res.status(500).json({
            error: 'Failed to process recap',
            message: errorMessage,
        });
    }
}

