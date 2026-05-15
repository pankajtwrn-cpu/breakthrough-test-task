import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './middleware/logger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  next();
});

app.use(logger);

import authRoutes from './routes/auth.js';
import programRoutes from './routes/programs.js';
import sessionRoutes from './routes/sessions.js';
import auditRoutes from './routes/audit.js';

app.use('/auth', authRoutes);
app.use('/programs', programRoutes);
app.use('/sessions', sessionRoutes);
app.use('/audit', auditRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes will be added here

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
