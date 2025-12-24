import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

interface OGImageProps {
    username: string;
    displayName: string;
    avatarUrl: string;
    year: number;
    totalContributions: number;
    longestStreak: number;
    topLanguage: string;
    totalStars: number;
}

async function loadFont(weight: 'Regular' | 'Bold' = 'Regular'): Promise<ArrayBuffer> {
    const url = `https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-${weight}.ttf`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load font ${weight}: ${response.statusText}`);
    }
    return response.arrayBuffer();
}

export async function generateOGImage(props: OGImageProps): Promise<Buffer> {
    const [fontRegular, fontBold] = await Promise.all([
        loadFont('Regular'),
        loadFont('Bold'),
    ]);

    // Create the OG image using Satori (React-like JSX to SVG)
    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0d1117',
                    padding: '60px',
                    fontFamily: 'Inter',
                },
                children: [
                    // Header
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '40px',
                            },
                            children: [
                                // Avatar
                                {
                                    type: 'img',
                                    props: {
                                        src: props.avatarUrl,
                                        width: 100,
                                        height: 100,
                                        style: {
                                            borderRadius: '50%',
                                            marginRight: '24px',
                                        },
                                    },
                                },
                                // Name and title
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        fontSize: '36px',
                                                        fontWeight: 700,
                                                        color: '#ffffff',
                                                    },
                                                    children: props.displayName || props.username,
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        fontSize: '24px',
                                                        color: '#8b949e',
                                                    },
                                                    children: `@${props.username}`,
                                                },
                                            },
                                        ],
                                    },
                                },
                                // Year badge
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            marginLeft: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        fontSize: '24px',
                                                        color: '#58a6ff',
                                                    },
                                                    children: 'GitHub Recap',
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        fontSize: '64px',
                                                        fontWeight: 800,
                                                        color: '#ffffff',
                                                    },
                                                    children: props.year.toString(),
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    // Stats grid
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                gap: '40px',
                                flex: 1,
                            },
                            children: [
                                // Contributions
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: '#161b22',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            flex: 1,
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '18px', color: '#8b949e', marginBottom: '8px' },
                                                    children: 'Contributions',
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '48px', fontWeight: 700, color: '#39d353' },
                                                    children: props.totalContributions.toLocaleString(),
                                                },
                                            },
                                        ],
                                    },
                                },
                                // Streak
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: '#161b22',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            flex: 1,
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '18px', color: '#8b949e', marginBottom: '8px' },
                                                    children: '🔥 Longest Streak',
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '48px', fontWeight: 700, color: '#f0883e' },
                                                    children: `${props.longestStreak} days`,
                                                },
                                            },
                                        ],
                                    },
                                },
                                // Top language
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: '#161b22',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            flex: 1,
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '18px', color: '#8b949e', marginBottom: '8px' },
                                                    children: 'Top Language',
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '36px', fontWeight: 700, color: '#58a6ff' },
                                                    children: props.topLanguage || 'Various',
                                                },
                                            },
                                        ],
                                    },
                                },
                                // Stars
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: '#161b22',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            flex: 1,
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '18px', color: '#8b949e', marginBottom: '8px' },
                                                    children: '⭐ Total Stars',
                                                },
                                            },
                                            {
                                                type: 'div',
                                                props: {
                                                    style: { fontSize: '48px', fontWeight: 700, color: '#e3b341' },
                                                    children: props.totalStars.toLocaleString(),
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        } as any,
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Inter',
                    data: fontRegular,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: fontBold,
                    weight: 700,
                    style: 'normal',
                },
            ],
        }
    );

    // Convert SVG to PNG using resvg
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });

    const pngData = resvg.render();
    return Buffer.from(pngData.asPng());
}
