import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecap, createRecap, updateRecapReady } from './lib/firestore.js';
import { validateConfig } from './lib/config.js';
import { generateOGImage } from './lib/og-image.js';
import { uploadImage } from './lib/cloudinary.js';
import type { ContributionCalendar } from './lib/types.js';

// Check if it's old image and regenerate it to newer one
function isOldOgImageFormat(ogImageUrl: string | null): boolean {
    if (!ogImageUrl) return true; // No URL means we need to generate
    const urlParts = ogImageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1]; // example: "username-2025-recap.png"
    const publicId = fileName.replace(/\.[^/.]+$/, ''); // Remove extension

    return !publicId.endsWith('-recap');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Validate configuration
    if (!validateConfig()) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get params from query (preferred) or body
    const { username, year: queryYear, force } = req.query;
    const bodyYear = req.body?.year;
    // Prioritize query param, then body, then default
    const year = queryYear || bodyYear || new Date().getFullYear();

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const yearNum = typeof year === 'number' ? year : parseInt(year, 10);

    if (isNaN(yearNum) || yearNum < 2008 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year' });
    }

    try {
        // Check if recap already exists (unless forced)
        const existingRecap = force === 'true' ? null : await getRecap(username, yearNum);

        if (existingRecap) {
            if (existingRecap.status === 'ready') {
                let ogImageUrl = existingRecap.ogImageUrl;
                let processedData = existingRecap.processedJson as Record<string, unknown>;

                // Check if OG image uses old format and needs regeneration
                if (isOldOgImageFormat(ogImageUrl)) {
                    console.log(`Regenerating OG image for ${username}/${yearNum} (old format detected)`);

                    try {
                        // Extract data from existing processedJson for OG image generation
                        const contributionCalendar = processedData.contributionCalendar as ContributionCalendar;

                        // Generate new OG image
                        const ogImageBuffer = await generateOGImage({
                            username,
                            displayName: (processedData.displayName as string) || username,
                            avatarUrl: processedData.avatarUrl as string,
                            year: yearNum,
                            totalContributions: processedData.totalContributions as number,
                            longestStreak: (processedData.longestStreak as { count: number }).count,
                            topLanguage: ((processedData.topLanguages as { name: string }[])?.[0]?.name) || 'Code',
                            totalStars: processedData.totalStars as number,
                            newRepos: processedData.totalReposCreated as number,
                            totalPRs: (processedData.prCounts as { opened: number }).opened,
                            contributionCalendar,
                        });

                        // Upload new OG image with new naming format
                        const uploadResult = await uploadImage(
                            ogImageBuffer,
                            'og-images',
                            `${username}-${yearNum}-recap`
                        );

                        ogImageUrl = uploadResult.secureUrl;

                        // Update processedData with new OG image URL
                        processedData = {
                            ...processedData,
                            ogImageUrl: uploadResult.secureUrl,
                        };

                        // Update Firestore with new OG image URL
                        await updateRecapReady(username, yearNum, processedData, uploadResult.secureUrl);

                        console.log(`Successfully regenerated OG image for ${username}/${yearNum}`);
                    } catch (regenerateError) {
                        console.error(`Failed to regenerate OG image for ${username}/${yearNum}:`, regenerateError);
                        // Continue with old image if regeneration fails
                    }
                }

                return res.status(200).json({
                    status: 'ready',
                    data: processedData,
                    ogImageUrl: ogImageUrl,
                });
            }

            if (existingRecap.status === 'processing') {
                return res.status(200).json({
                    status: 'processing',
                    message: 'Recap is being generated',
                    shouldTrigger: true, // Ensure processing is triggered/retried
                });
            }

            if (existingRecap.status === 'error') {
                // Allow retry - delete and recreate
                await createRecap(username, yearNum);

                return res.status(200).json({
                    status: 'processing',
                    message: 'Retrying recap generation',
                    shouldTrigger: true, // Signal client to trigger processing
                });
            }
        }

        // Create new recap record
        await createRecap(username, yearNum);

        return res.status(200).json({
            status: 'processing',
            message: 'Recap generation started',
            shouldTrigger: true, // Signal client to trigger processing
        });
    } catch (error) {
        console.error('Error in recap handler:', error);
        return res.status(500).json({
            error: 'Failed to process recap request',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
