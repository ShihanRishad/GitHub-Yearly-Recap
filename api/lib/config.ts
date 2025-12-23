// API Configuration - Read from environment variables

export const config = {
    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    },

    // Cloudinary
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },

    // GitHub
    github: {
        token: process.env.GITHUB_TOKEN || '',
    },

    // Gemini
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || '',
    },

    // App
    app: {
        url: process.env.VITE_APP_URL || 'http://localhost:5173',
    },
};

export function validateConfig() {
    const errors: string[] = [];

    if (!config.firebase.projectId) errors.push('FIREBASE_PROJECT_ID is required');
    if (!config.firebase.clientEmail) errors.push('FIREBASE_CLIENT_EMAIL is required');
    if (!config.firebase.privateKey) errors.push('FIREBASE_PRIVATE_KEY is required');
    if (!config.cloudinary.cloudName) errors.push('CLOUDINARY_CLOUD_NAME is required');
    if (!config.cloudinary.apiKey) errors.push('CLOUDINARY_API_KEY is required');
    if (!config.cloudinary.apiSecret) errors.push('CLOUDINARY_API_SECRET is required');
    if (!config.github.token) errors.push('GITHUB_TOKEN is required');
    if (!config.gemini.apiKey) errors.push('GEMINI_API_KEY is required');

    if (errors.length > 0) {
        console.error('Configuration errors:', errors);
        return false;
    }

    return true;
}
