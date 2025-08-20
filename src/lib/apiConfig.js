export const API_CONFIG = {
    TIMEOUTS: {
        DEFAULT: 30000,
        UPLOAD: 60000,
        VIDEO_GENERATION: 45000,
        STATUS_CHECK: 15000
    },
    RETRY: {
        MAX_ATTEMPTS: 3,
        BASE_DELAY: 1000,
        MAX_DELAY: 10000
    },
    FILE_LIMITS: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        ALLOWED_DOCUMENT_TYPES: ['application/pdf']
    },
    VIDEO: {
        DEFAULT_DIMENSIONS: {
            width: 1280,
            height: 720
        },
        ASPECT_RATIO: '16:9',
        MAX_SCRIPT_LENGTH: 5000,
        MIN_SCRIPT_LENGTH: 10
    },
    ENDPOINTS: {
        HEYGEN: {
            BASE_URL: process.env.HEYGEN_BASE_URL || 'https://api.heygen.com',
            VIDEO_GENERATE: '/v2/video/generate',
            VIDEO_STATUS: '/v1/video_status.get',
            AVATARS: '/v2/avatars',
            VOICES: '/v2/voices'
        }
    },
    STATUS_MAPPINGS: {
        VIDEO: {
            'pending': 'processing',
            'processing': 'processing',
            'completed': 'completed',
            'failed': 'failed',
            'error': 'failed'
        }
    },
    ERROR_CODES: {
        CONFIG_ERROR: 'CONFIG_ERROR',
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        UPLOAD_ERROR: 'UPLOAD_ERROR',
        PROCESSING_ERROR: 'PROCESSING_ERROR',
        EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
        TIMEOUT_ERROR: 'TIMEOUT_ERROR',
        SERVICE_ERROR: 'SERVICE_ERROR'
    }
};
export class Logger {
    static info(message, context = {}) {
        console.info(message, {
            ...context,
            timestamp: new Date().toISOString()
        });
    }
    static warn(message, context = {}) {
        console.warn(message, {
            ...context,
            timestamp: new Date().toISOString()
        });
    }
    static error(message, context = {}) {
        console.error(message, {
            ...context,
            timestamp: new Date().toISOString()
        });
    }
    static success(message, context = {}) {
        console.log(message, {
            ...context,
            timestamp: new Date().toISOString()
        });
    }
}
export class RetryHelper {
    static async withRetry(fn, options = {}) {
        const {
            maxAttempts = API_CONFIG.RETRY.MAX_ATTEMPTS,
            baseDelay = API_CONFIG.RETRY.BASE_DELAY,
            maxDelay = API_CONFIG.RETRY.MAX_DELAY
        } = options;
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn(attempt);
            } catch (error) {
                lastError = error;
                Logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed`, {
                    error: error.message,
                    attempt
                });
                if (attempt < maxAttempts) {
                    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError;
    }
}
export class ValidationHelper {
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    static validatePhone(phone) {
        const phoneRegex = /^(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
        return phoneRegex.test(phone);
    }
    static validateFileType(file, allowedTypes) {
        return allowedTypes.includes(file.type);
    }
    static validateFileSize(file, maxSize) {
        return file.size <= maxSize;
    }
    static sanitizeString(str) {
        return str.replace(/[<>'"]/g, '').trim();
    }
}
export class PerformanceMonitor {
    constructor(operationName) {
        this.operationName = operationName;
        this.startTime = Date.now();
    }
    complete(additionalContext = {}) {
        const duration = Date.now() - this.startTime;
        Logger.info(`Operation completed: ${this.operationName}`, {
            duration: `${duration}ms`,
            ...additionalContext
        });
        return duration;
    }
    static time(operationName) {
        return new PerformanceMonitor(operationName);
    }
}
