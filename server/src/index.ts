import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';

import paymentRoutes from './routes/paymentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

import { logger } from './services/logger.js';
import { processScheduledRenewals } from './services/subscriptionService.js';
import { processPendingPayouts } from './services/payoutService.js';
import { 
  applyRateLimit, 
  apiLimiter, 
  webhookLimiter,
  requestId, 
  sanitizeInput,
  trustProxy 
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for correct IP detection
trustProxy(app);

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Request logging
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Body parsing with size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Security middleware
app.use(requestId);
app.use(sanitizeInput);

// Health check (no rate limit)
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes with rate limiting
app.use('/api/payments', applyRateLimit(apiLimiter), paymentRoutes);
app.use('/api/subscriptions', applyRateLimit(apiLimiter), subscriptionRoutes);
app.use('/api/payouts', applyRateLimit(apiLimiter), payoutRoutes);

// Webhooks with separate rate limit
app.use('/api/webhooks', applyRateLimit(webhookLimiter), webhookRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;
  
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack, 
    requestId,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    requestId,
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
  });
});

// Cron jobs
cron.schedule('0 * * * *', async () => {
  logger.info('Running scheduled subscription renewals');
  await processScheduledRenewals();
});

cron.schedule('*/15 * * * *', async () => {
  logger.info('Processing pending payouts');
  await processPendingPayouts();
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Stripe key loaded: ${process.env.STRIPE_SECRET_KEY ? 'YES' : 'NO'}`);
  logger.info(`Paystack key loaded: ${process.env.PAYSTACK_SECRET_KEY ? 'YES' : 'NO'}`);
});

export default app;
