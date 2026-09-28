const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db, initDatabase } = require('./db');
const inspectionsRouter = require('./routes/inspections');
const sapWebhookRouter = require('./routes/sapWebhook');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Timestamped HTTP Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/sap-webhook', sapWebhookRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Arvind Quality Inspection Tracker API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Server Instance & Graceful Shutdown
let server;

initDatabase()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(` Arvind Quality Inspection Tracker API Server`);
      console.log(` Listening on port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===================================================`);
    });
  })
  .catch((err) => {
    console.error('Fatal: Failed to initialize SQLite database:', err);
    process.exit(1);
  });

// Senior Dev Practice: Graceful Shutdown Process Handlers
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Gracefully shutting down Express server...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      db.close((err) => {
        if (err) {
          console.error('Error closing SQLite database:', err.message);
        } else {
          console.log('SQLite database connection closed cleanly.');
        }
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});
