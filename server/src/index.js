import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import searchRoutes from './routes/search.js';
import { mlClient } from './services/mlClient.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.set('io', io);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req, res) => {
  let mlStatus = 'offline';
  try { await mlClient.healthCheck(); mlStatus = 'online'; } catch { /* */ }
  res.json({ status: 'ok', mlService: mlStatus });
});

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/search', searchRoutes);

io.on('connection', (socket) => {
  socket.on('join-book', (bookId) => socket.join(`book-${bookId}`));
  socket.on('leave-book', (bookId) => socket.leave(`book-${bookId}`));
});

// Render sets the PORT environment variable automatically
const PORT = process.env.PORT || 10000;

async function start() {
  try {
    await sequelize.authenticate();
    // In production, sync might be slow, but for final year project it's fine
    await sequelize.sync({ alter: true });
    console.log('MySQL connected');
    
    // IMPORTANT: added '0.0.0.0' to allow external connections
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();
