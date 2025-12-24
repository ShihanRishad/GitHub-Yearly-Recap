import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecap } from './lib/firestore.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, year } = req.query;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const yearNum = parseInt(year as string, 10) || new Date().getFullYear();

    try {
        const recap = await getRecap(username, yearNum);

        if (!recap) {
            return res.status(404).json({
                status: 'not_found',
                message: 'Recap not found. Please generate it first.',
            });
        }

        return res.status(200).json({
            status: recap.status,
            data: recap.status === 'ready' ? recap.processedJson : null,
            ogImageUrl: recap.ogImageUrl,
            errorMessage: recap.errorMessage,
            currentStep: recap.currentStep,
        });
    } catch (error) {
        console.error('Error fetching recap status:', error);
        return res.status(500).json({
            error: 'Failed to fetch recap status',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
