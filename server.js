const express = require('express');
const zlib = require('zlib');
const app = express();

// Log all requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

// Handle gzipped requests
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

// Fake GameAnalytics events
app.post('/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  console.log('Authorization Token:', authHeader);
  
  // Fake auth validation
  if (!authHeader) {
    console.log('Authorization failed: Missing token');
    return res.status(401).json({ error: 'Unauthorized - Missing Token' });
  }
  
  // Logging events
  console.log('Game Event:', req.body);
  
  // SUCCESS
  res.status(201).json({ status: 'ok', message: 'Events received' });
});

// Fake remote configs 
app.post('/remote_configs/v1/init', (req, res) => {  // Changed from GET to POST as per your error log
  const gameKey = req.query.game_key;

  if (gameKey !== '16bd90bfd7369b12f908dc62b1ee1bfc') {
    return res.status(400).json({ error: 'Bad Request - Invalid game_key' });
  }
  
  res.status(201).json({
    server_ts: Date.now(),
    configs: { setting1: 'value1', setting2: 'value2' },
    configs_hash: 'fakehash',
    ab_id: '12345',
    ab_variant_id: 'A',
  });
});

// Fake version check
app.get('/data/version', (req, res) => {
  const gameId = req.query.game_id;

  if (gameId !== '26502') {
    return res.status(503).json({ error: 'Service Unavailable - Invalid game_id' });
  }

  res.status(200).json({
    version: '0.0.0', 
    status: 'available'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});
