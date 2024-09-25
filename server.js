const express = require('express');
const app = express();
const zlib = require('zlib');

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}, Method: ${req.method}`);
  next();
});

// gzip thing
app.use((req, res, next) => {
  res.setHeader('Content-Encoding', 'gzip');
  const originalSend = res.send;
  res.send = function (body) {
    const buffer = Buffer.from(body);
    zlib.gzip(buffer, (err, gzippedBody) => {
      if (err) {
        return next(err);
      }
      originalSend.call(this, gzippedBody);
    });
  };
  next();
});

// Fake GameAnalytics events
app.post('/v2/16bd90bfd7369b12f908dc62b1ee1bfc/events', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  console.log('Authorization Token:', authHeader);
  
  if (!authHeader || authHeader !== 'expected-token-here') {
    console.log('Authorization failed: Invalid token');
    return res.status(401).json({ error: 'Unauthorized - Invalid Token' });
  }

  // Logging events
  console.log('Game Event:', req.body);
  
  // SUCCESS
  res.status(201).json({ status: 'ok', message: 'Events received' });
});

// Fake remote configs 
app.get('/remote_configs/v1/init', (req, res) => {
  const response = {
    server_ts: Date.now(),
    configs: { setting1: 'value1', setting2: 'value2' },
    configs_hash: 'fakehash',
    ab_id: '12345',
    ab_variant_id: 'A',
  };
  res.status(201).json(response);
});


  // Return mock configuration
  res.status(201).json({
    server_ts: Date.now(),
    configs: { setting1: 'value1', setting2: 'value2' },
    configs_hash: 'fakehash',
    ab_id: '12345',
    ab_variant_id: 'A',
  });
});

app.get('/data/version', (req, res) => {
  const gameId = req.query.game_id;

  // Validate game id 
  if (gameId !== '26502') {
    console.error('Invalid game_id:', gameId);
    return res.status(503).json({ error: 'Service Unavailable - Invalid game_id' });
  }

  res.status(200).json({
    version: 'Hi, and have an awesome day, i am nipi!', 
    status: 'available',
  });
});
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Encoding', 'gzip');
  next();
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});
