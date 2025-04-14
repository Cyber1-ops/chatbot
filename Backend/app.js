// Backend/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
console.log(chatRoutes);

app.use(cors());
app.use(express.json());
console.log(chatRoutes);  // Log the imported chatRoutes
app.use('/api/chat', chatRoutes); // Mount routes under /api/chat

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const usedCars = require('./data/usedCars.json');

