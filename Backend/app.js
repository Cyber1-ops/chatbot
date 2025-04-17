// Backend/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const googleRoutes = require('./routes/googleRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/google', googleRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const usedCars = require('./data/usedCars.json');

