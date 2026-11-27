const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

const corsOptions = process.env.CLIENT_ORIGIN
  ? { origin: process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim()), credentials: true }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Kadidjiny Library API' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));

// Serve compiled React client when present in production deployments
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Kadidjiny Library API running on port ${PORT}`));
}

module.exports = app;
