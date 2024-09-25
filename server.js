const express = require('express');
const app = express();
const zlib = require('zlib');

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

// Middleware to handle gzip-encoded requests
app.use((req, res, next) => {
  if (req.headers['content-encoding'] === 'gzip') {
    const gunzip = zlib.createGunzip();
    req.pipe(gunzip);
    let body = '';
    gunzip.on('data', (chunk) => {
      body += chunk.toString();
    });
    gunzip.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else {
    next();
  }
});

// Corrected to handle GET requests for remote configs
app.get('/remote_configs/v1/init', (req, res) => {
  const gameKey = req.query.game_key;
  const intervalSeconds = req.query.interval_seconds;
  const configsHash = req.query.configs_hash;

  // Validate the game_key parameter
  if (gameKey !== '16bd90bfd7369b12f908dc62b1ee1bfc') {
    return res.status(400).json({ error: 'Bad Request - Invalid game_key' });
  }

  // Simulate response for remote configs
  res.status(201).json({
    server_ts: Date.now(),
    configs: { setting1: 'value1', setting2: 'value2' },
    configs_hash: 'fakehash',
    ab_id: '12345',
    ab_variant_id: 'A',
  });
});

// Mocking the GameAnalytics events POST endpoint
app.post('/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  console.log('Authorization Token:', authHeader);
  
  if (!authHeader) {
    console.log('Authorization failed: Missing token');
    return res.status(401).json({ error: 'Unauthorized - Missing Token' });
  }

  // Log the event payload
  console.log('Game Event:', req.body);

  // Respond with success
  res.status(201).json({ status: 'ok', message: 'Events received' });
});

// Mocking the version check endpoint
app.get('/data/version', (req, res) => {
  const gameId = req.query.game_id;

  // Validate game id
  if (gameId !== '26502') {
    return res.status(503).json({ error: 'Service Unavailable - Invalid game_id' });
  }

  res.status(200).json({
    version: '0.0.1',
    status: 'available'
  });
});

// Set the server to listen on the PORT specified by Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});
