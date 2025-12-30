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
        // Read index.html from the root directory
        const indexPath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');

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
