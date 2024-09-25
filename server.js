const express = require('express');
const app = express();
const zlib = require('zlib');

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

// Middleware to handle JSON body (without gzip)
app.use(express.json());

// Middleware to handle gzip-encoded requests if they come
app.use((req, res, next) => {
  if (req.headers['content-encoding'] === 'gzip') {
    const gunzip = zlib.createGunzip();
    req.pipe(gunzip);
    
    let body = '';
    gunzip.on('data', (chunk) => {
      body += chunk.toString();
    });

    gunzip.on('end', () => {
      console.log('Decompressed Body (raw):', body);
      try {
        req.body = JSON.parse(body);
        next();
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    });

    gunzip.on('error', (err) => {
      return res.status(500).json({ error: 'Gzip decompression failed' });
    });
  } else {
    next(); // For non-gzip requests
  }
});

// Fix: Handle POST request for remote configs
app.post('/remote_configs/v1/init', (req, res) => {
  const gameKey = req.query.game_key;

  // Validate game key
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

// Fake GameAnalytics events endpoint
app.post('/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  console.log('Authorization Token:', authHeader);
  
  // Fake auth validation
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized - Missing Token' });
  }
  
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('Game Event body is empty or undefined');
    return res.status(400).json({ error: 'Invalid or Missing Game Event Data' });
  } else {
    console.log('Game Event:', req.body); // Log game event data
  }
  
  // SUCCESS
  res.status(201).json({ status: 'ok', message: 'Events received' });
});

// Fake version check
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});
