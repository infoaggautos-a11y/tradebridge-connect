import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: Request): string {
    // Use IP + user agent for identification
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${ip}:${req.path}`;
  }

  check(req: Request): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: this.store[key].resetTime };
    }

    this.store[key].count++;
    const remaining = Math.max(0, this.maxRequests - this.store[key].count);

    if (this.store[key].count > this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: this.store[key].resetTime };
    }

    return { allowed: true, remaining, resetTime: this.store[key].resetTime };
  }
}

// Different limiters for different endpoints
export const apiLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const authLimiter = new RateLimiter(900000, 10); // 10 requests per 15 minutes (auth endpoints)
export const paymentLimiter = new RateLimiter(60000, 20); // 20 payment requests per minute
export const webhookLimiter = new RateLimiter(60000, 50); // 50 webhooks per minute

export function applyRateLimit(limiter: RateLimiter) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = limiter.check(req);
    
    res.setHeader('X-RateLimit-Limit', limiter['maxRequests']);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime);

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    next();
  };
}

// Request ID middleware
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] as string || crypto.randomUUID();
  res.setHeader('X-Request-ID', id);
  (req as any).requestId = id;
  next();
}

// Input sanitization
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (Buffer.isBuffer(req.body)) {
    return next();
  }

  const sanitize = (obj: any): any => {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      // Remove potential script tags and trim
      return obj.replace(/<[^>]*>/g, '').trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  
  next();
}

// Validate required headers
export function validateHeaders(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = required.filter(h => !req.headers[h]);
    
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required headers',
        missing,
      });
    }
    
    next();
  };
}

// IP whitelist for webhooks
const webhookWhitelist = [
  '54.187.174.169',   // Stripe
  '54.187.205.235',   // Stripe
  '54.187.238.89',    // Stripe
  '52.21.165.176',    // Stripe
  '52.22.192.60',     // Stripe
  '13.238.217.89',    // Paystack
  '13.244.121.220',  // Paystack
  '13.244.87.139',    // Paystack
];

export function isWhitelistedIP(req: Request): boolean {
  const ip = req.ip || req.socket.remoteAddress || '';
  return webhookWhitelist.some(allowed => ip.includes(allowed));
}

// Trust proxy for correct IP detection
export function trustProxy(app: express.Application) {
  app.set('trust proxy', 1);
}
