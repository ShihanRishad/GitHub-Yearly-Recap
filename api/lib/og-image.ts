import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { ContributionCalendar, ContributionWeek, ContributionDay } from './types';
import fs from 'node:fs';
import path from 'node:path';

interface OGImageProps {
    username: string;
    displayName: string;
    avatarUrl: string;
    year: number;
    totalContributions: number;
    longestStreak: number;
    topLanguage: string;
    totalStars: number;
    newRepos: number;
    totalPRs: number;
    contributionCalendar: ContributionCalendar;
}

async function loadFont(weight: 'Regular' | 'Bold' = 'Regular'): Promise<ArrayBuffer> {
    const url = weight === 'Bold'
        ? 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf'
        : 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load font ${weight}: ${response.statusText} (${response.status}) at ${url}`);
    }
    return response.arrayBuffer();
}

/**
 * Helper to load an SVG from the public folder and return its content as a string.
 */
function loadPublicSvg(filename: string): string | null {
    try {
        const publicPath = path.join(process.cwd(), 'public', filename);
        if (fs.existsSync(publicPath)) {
            return fs.readFileSync(publicPath, 'utf8');
        }
        return null;
    } catch (e) {
        console.error(`Failed to load SVG ${filename}:`, e);
        return null;
    }
}

/**
 * Helper to convert an SVG string to a base64 data URI.
 */
function svgToDataUri(svg: string): string {
    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

export async function generateOGImage(props: OGImageProps): Promise<Buffer> {
    const [fontRegular, fontBold] = await Promise.all([
        loadFont('Regular'),
        loadFont('Bold'),
    ]);

    // Load branding SVG
    const brandingSvg = loadPublicSvg(`recap_icon_${props.year}.svg`)
        || loadPublicSvg(`recap_logo_${props.year}.svg`)
        || loadPublicSvg(`recap_logo_square.svg`);

    const brandingDataUri = brandingSvg ? svgToDataUri(brandingSvg) : null;

    // Define colors for the heatmap
    const CELL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    const getLevel = (count: number) => {
        if (count === 0) return 0;
        if (count <= 3) return 1;
        if (count <= 6) return 2;
        if (count <= 9) return 3;
        return 4;
    };

    // Card styling constants
    const cardBg = 'rgba(255, 255, 255, 0.03)';
    const cardBorder = 'rgba(255, 255, 255, 0.08)';
    const borderRadius = '24px';

    // SVG Icons for cards (converted to data URIs)
    const icons = {
        contributions: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h.01"/><path d="M7 20h.01"/><path d="M17 20h.01"/><path d="M12 16h.01"/><path d="M7 16h.01"/><path d="M17 16h.01"/><path d="M12 12h.01"/><path d="M7 12h.01"/><path d="M17 12h.01"/><path d="M12 8h.01"/><path d="M7 8h.01"/><path d="M17 8h.01"/><path d="M12 4h.01"/><path d="M7 4h.01"/><path d="M17 4h.01"/></svg>`),
        streak: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f0883e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 2 3.5 2 5a6.5 6.5 0 1 1-13 0c0-1.012.394-2.106 1-3l3 3Z"/></svg>`),
        repos: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`),
        prs: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>`),
        language: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`),
        stars: svgToDataUri(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`)
    };

    const statCard = (iconUri: string, label: string, value: string | number, color: string = '#8b949e', flex: number = 1) => ({
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: borderRadius,
                padding: '24px',
                flex: flex,
            },
            children: [
                {
                    type: 'div',
                    props: {
                        style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
                        children: [
                            { type: 'img', props: { src: iconUri, width: 20, height: 20, style: { color: color } } },
                            { type: 'div', props: { style: { fontSize: '18px', color: '#8b949e', fontWeight: 500 }, children: label } }
                        ]
                    }
                },
                {
                    type: 'div',
                    props: {
                        style: { fontSize: '48px', fontWeight: 700, color: '#ffffff' },
                        children: value.toString(),
                    },
                },
            ]
        }
    });

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(135deg, #0E2C38 0%, #221E3B 100%)',
                    padding: '60px',
                    fontFamily: 'Inter',
                    color: '#ffffff',
                },
                children: [
                    // Header Row
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', alignItems: 'center', marginBottom: '40px', justifyContent: 'space-between' },
                            children: [
                                // Left: User info
                                {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', alignItems: 'center' },
                                        children: [
                                            {
                                                type: 'img',
                                                props: {
                                                    src: props.avatarUrl,
                                                    width: 120,
                                                    height: 120,
                                                    style: { borderRadius: '50%', marginRight: '30px' },
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { display: 'flex', flexDirection: 'column' },
                                                    children: [
                                                        { type: 'div', props: { style: { fontSize: '48px', fontWeight: 700 }, children: props.displayName } },
                                                        { type: 'div', props: { style: { fontSize: '24px', color: '#8b949e', marginTop: '4px' }, children: `@${props.username}` } },
                                                        { type: 'div', props: { style: { fontSize: '20px', color: '#8b949e', opacity: 0.7, marginTop: '8px' }, children: `github.com/${props.username}` } },
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                },
                                // Right: Branding Logo
                                brandingDataUri ? {
                                    type: 'img',
                                    props: {
                                        src: brandingDataUri,
                                        width: 180,
                                        style: { display: 'flex' }
                                    }
                                } : {
                                    type: 'div',
                                    props: {
                                        style: { fontSize: '64px', fontWeight: 800 },
                                        children: props.year.toString()
                                    }
                                }
                            ]
                        }
                    },

                    // Middle Row: Heatmap + 2 Stat Cards
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', gap: '24px', marginBottom: '24px' },
                            children: [
                                // Heatmap Container
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: cardBg,
                                            border: `1px solid ${cardBorder}`,
                                            borderRadius: borderRadius,
                                            padding: '24px',
                                            flex: 1.8,
                                            justifyContent: 'center'
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { display: 'flex', gap: '4px' },
                                                    children: props.contributionCalendar.weeks.map((week: ContributionWeek) => ({
                                                        type: 'div',
                                                        props: {
                                                            style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                                                            children: week.contributionDays.map((day: ContributionDay) => ({
                                                                type: 'div',
                                                                props: {
                                                                    style: {
                                                                        width: '10px',
                                                                        height: '10px',
                                                                        borderRadius: '2px',
                                                                        backgroundColor: CELL_COLORS[getLevel(day.contributionCount)]
                                                                    }
                                                                }
                                                            }))
                                                        }
                                                    }))
                                                }
                                            }
                                        ]
                                    }
                                },
                                // Right: 2 Stacked stats
                                {
                                    type: 'div',
                                    props: {
                                        style: { display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 },
                                        children: [
                                            statCard(icons.contributions, 'Total Contributions', props.totalContributions.toLocaleString(), '#39d353'),
                                            statCard(icons.streak, 'Highest Streak', `${props.longestStreak}`, '#f0883e'),
                                        ]
                                    }
                                }
                            ]
                        }
                    },

                    // Bottom Row: 4 Stat Cards
                    {
                        type: 'div',
                        props: {
                            style: { display: 'flex', gap: '24px' },
                            children: [
                                statCard(icons.repos, 'New Repositories', props.newRepos),
                                statCard(icons.prs, 'Total PRs', props.totalPRs),
                                statCard(icons.language, 'Top language', props.topLanguage || 'JS', '#58a6ff'),
                                statCard(icons.stars, 'Stars', props.totalStars, '#e3b341'),
                            ]
                        }
                    }
                ]
            }
        } as any,
        {
            width: 1200,
            height: 630,
            fonts: [
                { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
                { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
            ],
        }
    );

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
}
