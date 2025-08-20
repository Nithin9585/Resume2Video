import { NextResponse } from 'next/server';
import { Logger } from './apiConfig';
export class ApiMiddleware {
    static async handleRequest(request, handler) {
        const startTime = Date.now();
        const requestId = this.generateRequestId();
        try {
            Logger.info('API request received', {
                requestId,
                method: request.method,
                url: request.url,
                userAgent: request.headers.get('user-agent')
            });
            request.requestId = requestId;
            request.startTime = startTime;
            const response = await handler(request);
            const duration = Date.now() - startTime;
            Logger.success('API request completed', {
                requestId,
                status: response.status,
                duration: `${duration}ms`
            });
            response.headers.set('X-Request-ID', requestId);
            response.headers.set('X-Response-Time', `${duration}ms`);
            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            Logger.error('API request failed', {
                requestId,
                error: error.message,
                stack: error.stack,
                duration: `${duration}ms`
            });
            return this.createErrorResponse(error, requestId, duration);
        }
    }
    static generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    static createErrorResponse(error, requestId, duration) {
        const errorResponse = {
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
            requestId,
            timestamp: new Date().toISOString()
        };
        if (process.env.NODE_ENV === 'development') {
            errorResponse.message = error.message;
            errorResponse.stack = error.stack;
        }
        const response = NextResponse.json(errorResponse, { status: 500 });
        response.headers.set('X-Request-ID', requestId);
        response.headers.set('X-Response-Time', `${duration}ms`);
        return response;
    }
    static validateEnvironmentVariables(requiredVars) {
        const missing = requiredVars.filter(varName => !process.env[varName]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
    static async parseRequestBody(request) {
        try {
            const contentType = request.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await request.json();
            } else if (contentType?.includes('multipart/form-data')) {
                return await request.formData();
            } else {
                return await request.text();
            }
        } catch (error) {
            throw new Error(`Failed to parse request body: ${error.message}`);
        }
    }
    static validateRequiredFields(data, requiredFields) {
        const missing = requiredFields.filter(field => {
            const value = data[field];
            return value === undefined || value === null || value === '';
        });
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }
    static sanitizeInput(input) {
        if (typeof input === 'string') {
            return input.trim().replace(/[<>'"]/g, '');
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                sanitized[key] = this.sanitizeInput(value);
            }
            return sanitized;
        }
        return input;
    }
}
export class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 60000; // 1 minute
        this.maxRequests = 100; // 100 requests per minute
    }
    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter(time => time > windowStart);
            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
        const userRequests = this.requests.get(identifier) || [];
        const recentRequests = userRequests.filter(time => time > windowStart);
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);
        return true;
    }
    getRemainingRequests(identifier) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        const userRequests = this.requests.get(identifier) || [];
        const recentRequests = userRequests.filter(time => time > windowStart);
        return Math.max(0, this.maxRequests - recentRequests.length);
    }
}
export const corsConfig = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : process.env.ALLOWED_ORIGINS,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
};
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'"
};
