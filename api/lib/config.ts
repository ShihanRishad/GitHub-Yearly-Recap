// API Configuration - Read from environment variables
// Using function-based access to avoid Vercel parser issues with binary expressions

function getEnv(key: string, defaultValue: string = ''): string {
    const value = process.env[key];
    if (value === undefined || value === null) {
        return defaultValue;
    }
    return value;
}

function getPrivateKey(): string {
    const key = getEnv('FIREBASE_PRIVATE_KEY');
    return key.replace(/\\n/g, '\n');
}

interface Config {
    firebase: {
        projectId: string;
        clientEmail: string;
        privateKey: string;
    };
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    github: {
        token: string;
    };
    gemini: {
        apiKey: string;
    };
    app: {
        url: string;
    };
}

export function getConfig(): Config {
    return {
        firebase: {
            projectId: getEnv('FIREBASE_PROJECT_ID'),
            clientEmail: getEnv('FIREBASE_CLIENT_EMAIL'),
            privateKey: getPrivateKey(),
        },
        cloudinary: {
            cloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
            apiKey: getEnv('CLOUDINARY_API_KEY'),
            apiSecret: getEnv('CLOUDINARY_API_SECRET'),
        },
        github: {
            token: getEnv('GITHUB_TOKEN'),
        },
        gemini: {
            apiKey: getEnv('GEMINI_API_KEY'),
        },
        app: {
            url: getEnv('VITE_APP_URL', 'http://localhost:5173'),
        },
    };
}

// For backward compatibility
export const config = getConfig();

export function getValidationErrors(): string[] {
    const c = getConfig();
    const errors: string[] = [];

    if (!c.firebase.projectId) errors.push('FIREBASE_PROJECT_ID is required');
    if (!c.firebase.clientEmail) errors.push('FIREBASE_CLIENT_EMAIL is required');
    if (!c.firebase.privateKey) errors.push('FIREBASE_PRIVATE_KEY is required');
    if (!c.cloudinary.cloudName) errors.push('CLOUDINARY_CLOUD_NAME is required');
    if (!c.cloudinary.apiKey) errors.push('CLOUDINARY_API_KEY is required');
    if (!c.cloudinary.apiSecret) errors.push('CLOUDINARY_API_SECRET is required');
    if (!c.github.token) errors.push('GITHUB_TOKEN is required');
    if (!c.gemini.apiKey) errors.push('GEMINI_API_KEY is required');

    return errors;
}

export function validateConfig(): boolean {
    const errors = getValidationErrors();

    if (errors.length > 0) {
        console.error('Configuration errors:', errors);
        return false;
    }

    return true;
}
