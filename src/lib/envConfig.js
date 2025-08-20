export class EnvironmentValidator {
    static requiredServerEnvs = [
        'GEMINI_API_KEY',
        'HEYGEN_API_KEY',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
        'CLOUDINARY_CLOUD_NAME',
        'FIREBASE_PROJECT_ID'
    ];
    static requiredClientEnvs = [
        'NEXT_PUBLIC_FIREBASE_API_KEY',
        'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
        'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    static validateServerEnvironment() {
        const missing = this.requiredServerEnvs.filter(env => !process.env[env]);
        if (missing.length > 0) {
            throw new Error(`Missing server environment variables: ${missing.join(', ')}`);
        }
        return true;
    }
    static validateClientEnvironment() {
        const missing = this.requiredClientEnvs.filter(env => !process.env[env]);
        if (missing.length > 0) {
            throw new Error(`Missing client environment variables: ${missing.join(', ')}`);
        }
        return true;
    }
    static getConfiguration() {
        return {
            server: {
                gemini: {
                    apiKey: process.env.GEMINI_API_KEY ? '***configured***' : 'missing',
                },
                heygen: {
                    apiKey: process.env.HEYGEN_API_KEY ? '***configured***' : 'missing',
                    baseUrl: process.env.HEYGEN_BASE_URL || 'https://api.heygen.com'
                },
                cloudinary: {
                    apiKey: process.env.CLOUDINARY_API_KEY ? '***configured***' : 'missing',
                    apiSecret: process.env.CLOUDINARY_API_SECRET ? '***configured***' : 'missing',
                    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'missing'
                },
                firebase: {
                    projectId: process.env.FIREBASE_PROJECT_ID || 'missing'
                }
            },
            client: {
                firebase: {
                    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '***configured***' : 'missing',
                    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'missing',
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing'
                },
                app: {
                    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    environment: process.env.NODE_ENV || 'development'
                }
            }
        };
    }
    static logConfiguration() {
    }
}
export const ENV_CONFIG = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    server: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
            model: 'gemini-2.5-flash'
        },
        heygen: {
            apiKey: process.env.HEYGEN_API_KEY,
            baseUrl: process.env.HEYGEN_BASE_URL || 'https://api.heygen.com'
        },
        cloudinary: {
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME
        }
    },
    client: {
        firebase: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        },
        app: {
            url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }
    }
};
export class SecurityHelper {
    static maskApiKey(key) {
        if (!key) return 'missing';
        if (key.length <= 8) return '***masked***';
        return `${key.substring(0, 4)}***${key.substring(key.length - 4)}`;
    }
    static maskEmail(email) {
        if (!email) return 'missing';
        const [local, domain] = email.split('@');
        if (!domain) return '***masked***';
        return `${local.substring(0, 2)}***@${domain}`;
    }
    static createSecureLogObject(data) {
        const secured = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                if (key.toLowerCase().includes('key') || key.toLowerCase().includes('secret')) {
                    secured[key] = this.maskApiKey(value);
                } else if (key.toLowerCase().includes('email')) {
                    secured[key] = this.maskEmail(value);
                } else {
                    secured[key] = value;
                }
            } else if (typeof value === 'object' && value !== null) {
                secured[key] = this.createSecureLogObject(value);
            } else {
                secured[key] = value;
            }
        }
        return secured;
    }
}
if (typeof window === 'undefined') {
    try {
        EnvironmentValidator.validateServerEnvironment();
    } catch (error) {
    }
}
