import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecap } from './lib/firestore.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { username, year } = req.query;

    const usernameStr = typeof username === 'string' ? username : '';
    const yearNum = parseInt(typeof year === 'string' ? year : '', 10) || new Date().getFullYear();

    const baseUrl = process.env.VITE_APP_URL || `https://${req.headers.host}`;
    const defaultImage = `${baseUrl}/og-image.png`;

    let title = "GitHub Yearly Recap";
    let description = "See your 2025 coding journey visualized with beautiful animations. Get your GitHub Yearly Recap today!";
    let ogImage = defaultImage;

    if (usernameStr) {
        try {
            const recap = await getRecap(usernameStr, yearNum);
            if (recap && recap.status === 'ready' && recap.ogImageUrl) {
                title = `${usernameStr}'s ${yearNum} GitHub Recap`;
                description = `Check out ${usernameStr}'s coding journey in ${yearNum}! Total contributions, streaks, top languages and more.`;
                ogImage = recap.ogImageUrl;
            } else if (recap && recap.status === 'processing') {
                title = `Generating ${usernameStr}'s ${yearNum} Recap...`;
            }
        } catch (error) {
            console.error('Error fetching recap for meta tags:', error);
        }
    }

    try {
        let html = '';

        // Try reading file from possible locations
        // In local development with 'vercel dev', process.cwd() is the project root.
        // In Vercel production, index.html is expected in cwd when using includeFiles.
        const possiblePaths = [
            path.join(process.cwd(), 'index.html'),      // Bundled by includeFiles
            path.join(process.cwd(), 'dist', 'index.html'),
            path.join(process.cwd(), '..', 'index.html'),
        ]; for (const p of possiblePaths) {
            try {
                if (fs.existsSync(p)) {
                    html = fs.readFileSync(p, 'utf8');
                    console.log(`Successfully read index.html from ${p}`);
                    break;
                }
            } catch (err) {
                // Ignore error, try next
            }
        }

        if (!html) {
            console.error('Could not find index.html in any of the expected locations:', possiblePaths);
            return res.status(500).send('Could not load index.html template');
        }

        // Helper to replace content of a meta tag
        const replaceMeta = (property: string, content: string, isName: boolean = false) => {
            const attr = isName ? 'name' : 'property';
            const regex = new RegExp(`<meta ${attr}="${property}" content="[^]*?" \/>`, 'g');
            html = html.replace(regex, `<meta ${attr}="${property}" content="${content}" />`);
        };

        // Replace title
        html = html.replace(/<title>[^]*?<\/title>/, `<title>${title}</title>`);

        // Replace OG tags
        replaceMeta('og:title', title);
        replaceMeta('og:description', description);
        replaceMeta('og:image', ogImage);
        replaceMeta('og:url', `${baseUrl}/u/${usernameStr}/${yearNum}`);

        // Replace Twitter tags
        replaceMeta('twitter:title', title);
        replaceMeta('twitter:description', description);
        replaceMeta('twitter:image', ogImage);

        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(html);
    } catch (error) {
        console.error('Error serving index.html:', error);
        return res.status(500).send('Internal Server Error');
    }
}
