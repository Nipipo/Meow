const express = require('express');
const app = express();
const zlib = require('zlib');

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

// Handle non-gzip JSON bodies
app.use(express.json());

// Handle gzip-encoded bodies
app.use((req, res, next) => {
  if (req.headers['content-encoding'] === 'gzip') {
    const gunzip = zlib.createGunzip();
    req.pipe(gunzip);
    
    let body = '';
    gunzip.on('data', (chunk) => {
      body += chunk.toString();
    });

    gunzip.on('end', () => {
      console.log('Decompressed Body:', body);
      try {
        req.body = JSON.parse(body);
        next();
      } catch (error) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
    });

    gunzip.on('error', () => {
      return res.status(500).json({ error: 'Gzip decompression failed' });
    });
  } else {
    next();
  }
});

// Handle remote config POST request
app.post('/remote_configs/v1/init', (req, res) => {
  const gameKey = req.query.game_key;

  // Validate game key
  if (gameKey !== '16bd90bfd7369b12f908dc62b1ee1bfc') {
    return res.status(403).json({ error: 'Forbidden - Invalid game_key' });
  }
  
  res.status(201).json({
    server_ts: Date.now(),
    configs: { setting1: 'value1', setting2: 'value2' },
    configs_hash: 'fakehash',
    ab_id: '12345',
    ab_variant_id: 'A',
  });
});

// Handle GameAnalytics events
app.post('/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  console.log('Authorization Token:', authHeader);
  
  // Fake auth validation
  if (!authHeader) {
    return res.status(403).json({ error: 'Forbidden - Missing Authorization' });
  }
  
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'Invalid or Missing Game Event Data' });
  }
  
  console.log('Game Event:', req.body);
  
  // SUCCESS
  res.status(201).json({ status: 'ok', message: 'Events received' });
});

// Handle version check
app.get('/data/version', (req, res) => {
  const gameId = req.query.game_id;

  // Validate game ID
  if (gameId !== '26502') {
    return res.status(503).json({ error: 'Service Unavailable - Invalid game_id' });
  }

  res.status(200).json({
    version: '0.0.1', 
    status: 'available'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
