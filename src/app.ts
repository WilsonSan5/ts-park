import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';

import routes from './routes';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';

const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TSPark API Documentation',
}));

// Swagger JSON spec endpoint (for external tools)
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TSPark API is running' });
});

// API Routes
app.use('/api', routes);

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Error handling middleware (must be LAST)
app.use(errorMiddleware);

export default app;
