// Backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes); // Mount routes under /api/chat

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const usedCars = require('./data/usedCars.json');

