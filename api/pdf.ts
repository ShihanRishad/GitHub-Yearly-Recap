import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderToBuffer } from '@react-pdf/renderer';
import { RecapPDFDocument } from './_pdf-document.js';
import { getMockRecapData } from './_lib/mock-data.js';
import { getRecap } from './_lib/firestore.js';
import React from 'react';

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

    const { username, year: queryYear, demo } = req.query;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const year = queryYear
        ? (typeof queryYear === 'number' ? queryYear : parseInt(queryYear as string, 10))
        : new Date().getFullYear();

    const isDemo = demo === 'true';

    if (isNaN(year) || year < 2008 || year > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year' });
    }

    try {
        let recapData;

        if (isDemo) {
            recapData = getMockRecapData(username, year);
        } else {
            const existingRecap = await getRecap(username, year);

            if (!existingRecap || existingRecap.status !== 'ready' || !existingRecap.processedJson) {
                return res.status(404).json({
                    error: 'Recap not found or not ready',
                    message: 'Please generate a recap first by visiting the recap page',
                });
            }

            recapData = existingRecap.processedJson;
        }

        // Generate PDF
        const { renderToBuffer } = await import('@react-pdf/renderer');
        const pdfBuffer = await renderToBuffer(
            React.createElement(RecapPDFDocument, { data: recapData as any }) as any
        );

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${username}-${year}-recap.pdf"`
        );
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        return res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
