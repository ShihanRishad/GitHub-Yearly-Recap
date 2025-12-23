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

    const { username } = req.query;
    const { year = new Date().getFullYear() } = req.body || {};

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const yearNum = typeof year === 'number' ? year : parseInt(year, 10);

    if (isNaN(yearNum) || yearNum < 2008 || yearNum > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year' });
    }

    try {
        // Check if recap already exists
        const existingRecap = await getRecap(username, yearNum);

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
                });
            }

            if (existingRecap.status === 'error') {
                // Allow retry - delete and recreate
                await createRecap(username, yearNum);

                // Trigger processing (in production, this would be a background job)
                triggerProcessing(username, yearNum);

                return res.status(200).json({
                    status: 'processing',
                    message: 'Retrying recap generation',
                });
            }
        }

        // Create new recap record
        await createRecap(username, yearNum);

        // Trigger processing (in production, this would be a background job)
        triggerProcessing(username, yearNum);

        return res.status(200).json({
            status: 'processing',
            message: 'Recap generation started',
        });
    } catch (error) {
        console.error('Error in recap handler:', error);
        return res.status(500).json({
            error: 'Failed to process recap request',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

// In a real implementation, this would trigger a background job
// For Vercel, you might use Vercel Cron or a separate serverless function
async function triggerProcessing(username: string, year: number) {
    // This is a simplified version - in production you'd want proper job queuing
    const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

    // Fire and forget - don't await
    fetch(`${baseUrl}/api/process?username=${username}&year=${year}`, {
        method: 'POST',
    }).catch(err => console.error('Failed to trigger processing:', err));
}
