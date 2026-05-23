const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'SmartPrep API is running 🚀', version: '1.0.0' });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/ai', require('./routes/ai'));
app.use('/resources', require('./routes/resources'));
app.use('/user', require('./routes/user'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ SmartPrep server running on port ${PORT}`));
