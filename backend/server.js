const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, getMongoUri } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Load env vars — override: true so backend/.env wins over a stale MONGO_URI in the OS/shell (common cause of "Atlas empty but login works").
dotenv.config({ override: true });

// Connect to database
connectDB();

const app = express();

app.get('/api', (_req, res) => {
  res.status(200).json({
    message: 'TaskFlow API is running',
    health: '/api/health',
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
    },
  });
});

// Liveness probe (Railway, etc.) — must not depend on MongoDB
app.get('/health', (_req, res) => {
  res.status(200).type('text/plain').send('ok');
});

// When deployed on Vercel Services, the API is mounted under routePrefix /_/backend — strip it so routes stay /api/...
app.use((req, res, next) => {
  const prefix = '/_/backend';
  const full = req.originalUrl || '';
  const pathOnly = full.split('?')[0];
  const query = full.includes('?') ? `?${full.split('?').slice(1).join('?')}` : '';
  if (pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)) {
    const rest = pathOnly.slice(prefix.length) || '/';
    req.url = rest + query;
  }
  next();
});

// CORS: set CLIENT_ORIGINS in production (comma-separated), e.g. https://your-app.vercel.app,https://www.yourdomain.com
const parseOrigins = () => {
  const raw = process.env.CLIENT_ORIGINS;
  if (!raw || !raw.trim()) return null;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = parseOrigins();
    if (!allowed || allowed.length === 0) {
      return callback(null, true);
    }
    if (!origin) {
      return callback(null, true);
    }
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
};

const requireDatabase = (_req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    message: 'Database connection unavailable. Set MONGO_URI, MONGODB_URI, or MONGO_URL in Railway variables and check MongoDB Atlas Network Access.',
    mongo: {
      connected: false,
      readyState: mongoose.connection.readyState,
    },
  });
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', requireDatabase, require('./routes/authRoutes'));
app.use('/api/users', requireDatabase, require('./routes/userRoutes'));
app.use('/api/projects', requireDatabase, require('./routes/projectRoutes'));
app.use('/api/tasks', requireDatabase, require('./routes/taskRoutes'));
app.use('/api/dashboard', requireDatabase, require('./routes/dashboardRoutes'));

// Health check — includes which MongoDB the process is using (helps Atlas vs local / taskflow vs test).
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  const mongoReady = mongoose.connection.readyState === 1;
  res.json({
    _healthVersion: 2,
    status: mongoReady ? 'OK' : 'DEGRADED',
    message: 'TaskFlow API is running',
    mongo: {
      connected: mongoReady,
      readyState: mongoose.connection.readyState,
      hasMongoUri: Boolean(getMongoUri()),
      acceptedEnvVars: ['MONGO_URI', 'MONGODB_URI', 'MONGO_URL'],
      host: mongoReady ? mongoose.connection.host : null,
      database: mongoReady ? mongoose.connection.name : null,
    },
  });
});

const staticDir =
  [path.join(__dirname, 'public'), path.join(__dirname, '..', 'frontend', 'dist')]
    .find((candidate) => fs.existsSync(path.join(candidate, 'index.html')));
const indexFile = staticDir ? path.join(staticDir, 'index.html') : null;

if (staticDir && indexFile) {
  app.use(express.static(staticDir));

  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    return res.sendFile(indexFile);
  });
}

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT} (required for Docker / Railway health checks)`);
    console.log(`TaskFlow server build: mongo-health-v2 (GET /api/health includes "mongo" + "_healthVersion")`);
  });
}

module.exports = app;
