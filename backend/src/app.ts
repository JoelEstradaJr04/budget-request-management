// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { setupSwagger, validateSwaggerSpec } from './middlewares/swagger.middleware';
import { env } from './config/env';

const app: Application = express();

// Validate Swagger specification on startup (if enabled)
if (env.ENABLE_API_DOCS) {
  validateSwaggerSpec();
}

// CORS configuration
// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (env.CORS_ORIGIN || '*').split(',');
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use('/api', apiLimiter);

// Setup Swagger/OpenAPI documentation (if enabled)
setupSwagger(app);

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
