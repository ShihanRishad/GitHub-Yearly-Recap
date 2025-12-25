import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecap, createRecap } from './lib/firestore.js';
import { validateConfig } from './lib/config.js';

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
                return res.status(200).json({
                    status: 'ready',
                    data: existingRecap.processedJson,
                    ogImageUrl: existingRecap.ogImageUrl,
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
