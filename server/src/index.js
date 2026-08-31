// FitWell local backend: Express + SQLite.
// Run: node src/index.js   (or: npm run seed then npm start)
import express from 'express';
import cors from 'cors';
import { initSchema } from './db.js';
import { runSeed } from './seed.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import foodsRouter from './routes/foods.js';
import libraryRouter from './routes/library.js';
import foodlogsRouter from './routes/foodlogs.js';
import waterRouter from './routes/water.js';
import weightRouter from './routes/weight.js';
import sleepRouter from './routes/sleep.js';
import workoutlogsRouter from './routes/workoutlogs.js';
import stepsRouter from './routes/steps.js';
import notificationsRouter from './routes/notifications.js';
import aiRouter from './routes/ai.js';
import adminRouter from './routes/admin.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

// Ensure the DB is ready and reference data exists on boot (idempotent).
initSchema();
runSeed();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'fitwell-server' });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/foods', foodsRouter);
app.use('/api', libraryRouter); // provides /api/exercises + /api/workouts...
app.use('/api/food-logs', foodlogsRouter);
app.use('/api/water-logs', waterRouter);
app.use('/api/weight-logs', weightRouter);
app.use('/api/sleep-logs', sleepRouter);
app.use('/api/workout-logs', workoutlogsRouter);
app.use('/api/steps', stepsRouter);
app.use('/api/notification-settings', notificationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

// 404 for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler.
app.use((err, req, res, next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`FitWell server listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('Demo admin login: admin@fitwell.local / admin123');
});
