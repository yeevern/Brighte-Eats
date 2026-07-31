import express from 'express';
import cors from 'cors';
import leadsRouter from './routes/leads';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/leads', leadsRouter);

// Health check — handy during development
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

export default app;
