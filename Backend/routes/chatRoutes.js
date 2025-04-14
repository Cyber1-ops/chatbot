// Backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const carsData = require('../data/usedCars.json');

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Chat route is working!' });
});

// Route to fetch all cars
router.get('/cars', (req, res) => {
  res.json(carsData);
});

// Simple chatbot route
router.post('/', (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: 'No message received.' });

  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('suv')) {
    const suvs = carsData.filter(car => car['bodyType']?.toLowerCase().includes('suv'));
    return res.json({ reply: `Here are some SUVs:`, results: suvs.slice(0, 5) });
  }

  if (lowerMsg.includes('cheap') || lowerMsg.includes('budget')) {
    const cheapCars = carsData
      .filter(car => parseFloat(car.price) < 20000)
      .slice(0, 5);
    return res.json({ reply: `Here are some budget-friendly cars:`, results: cheapCars });
  }

  res.json({ reply: 'Sorry, I didn’t get that. Try asking about SUVs, sedans, or budget cars!' });
});

module.exports = router;
