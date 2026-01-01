import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecap } from './_lib/firestore.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { username, year } = req.query;

    const usernameStr = typeof username === 'string' ? username : '';
    const yearNum = parseInt(typeof year === 'string' ? year : '', 10) || new Date().getFullYear();

    const host = req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || (host?.includes('localhost') ? 'http' : 'https');
    const baseUrl = process.env.VITE_APP_URL || `${proto}://${host}`;
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

        // Priority 1: Fetch from deployment URL in production to get the correct BUILT index.html
        // This ensures asset paths (like /assets/index-xxx.js) are correct.
        if (!host?.includes('localhost')) {
            console.log(`Production environment detected. Fetching built index.html from: ${baseUrl}/index.html`);
            try {
                const response = await fetch(`${baseUrl}/index.html`);
                if (response.ok) {
                    html = await response.text();
                    console.log('Successfully fetched built index.html via network');
                }
            } catch (fetchErr) {
                console.error('Failed to fetch index.html via network, falling back to filesystem:', fetchErr);
            }
        }

        // Priority 2: Fallback to filesystem if network fetch failed or in development
        if (!html) {
            const possiblePaths = [
                path.join(process.cwd(), 'dist', 'index.html'),
                path.join(process.cwd(), 'index.html'),
                path.join(process.cwd(), '..', 'index.html'),
            ];

            for (const p of possiblePaths) {
                try {
                    if (fs.existsSync(p)) {
                        html = fs.readFileSync(p, 'utf8');
                        console.log(`Successfully read index.html from filesystem: ${p}`);
                        break;
                    }
                } catch (err) {
                    // Ignore error, try next
                }
            }
        }

        if (!html) {
            console.error('Could not load index.html template from network or filesystem.');
            return res.status(500).send('Template Load Error');
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
