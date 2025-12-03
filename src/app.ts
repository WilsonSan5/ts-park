import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';

import routes from './routes';

const app: Application = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'TSPark API is running' });
});

// API Routes
app.use('/api', routes);

// TODO: Error handling middleware
// app.use(errorMiddleware);

export default app;
