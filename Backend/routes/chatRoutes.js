const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();
const carsData = require('../data/usedCars.json');

// Extract filters from message
function extractFiltersFromMessage(message) {
  const lower = message.toLowerCase();
  const filters = {};

  if (lower.includes('suv')) filters.bodyType = 'suv';
  if (lower.includes('sedan')) filters.bodyType = 'sedan';
  if (lower.includes('hatchback')) filters.bodyType = 'hatchback';
  if (lower.includes('pickup')) filters.bodyType = 'pickup';
  if (lower.includes('coupe')) filters.bodyType = 'coupe';

  if (lower.includes('cheap') || lower.includes('budget')) filters.maxPrice = 20000;
  const priceMatch = lower.match(/under\s?(\d{2,5})/);
  if (priceMatch) filters.maxPrice = parseInt(priceMatch[1]);

  const yearMatch = lower.match(/(20\d{2})/);
  if (yearMatch) filters.minYear = parseInt(yearMatch[1]);

  const mileageMatch = lower.match(/under\s?(\d{1,5})\s?km/);
  if (mileageMatch) filters.maxMileage = parseInt(mileageMatch[1]);

  if (lower.includes('electric')) filters.fuel = 'electric';
  if (lower.includes('hybrid')) filters.fuel = 'hybrid';
  if (lower.includes('petrol')) filters.fuel = 'petrol';
  if (lower.includes('diesel')) filters.fuel = 'diesel';

  if (lower.includes('automatic')) filters.transmission = 'automatic';
  if (lower.includes('manual')) filters.transmission = 'manual';

  const knownBrands = ['toyota', 'nissan', 'honda', 'bmw', 'mercedes', 'kia', 'hyundai', 'ford', 'chevrolet'];
  knownBrands.forEach(brand => {
    if (lower.includes(brand)) filters.brand = brand;
  });

  return filters;
}

// Apply filters
function getFilteredCars(message) {
  const filters = extractFiltersFromMessage(message);

  return carsData.filter(car => {
    let match = true;
    if (filters.bodyType) match = match && car.bodyType?.toLowerCase().includes(filters.bodyType);
    if (filters.maxPrice) match = match && parseFloat(car.price) <= filters.maxPrice;
    if (filters.minYear) match = match && parseInt(car.year) >= filters.minYear;
    if (filters.maxMileage) match = match && parseFloat(car.mileage) <= filters.maxMileage;
    if (filters.fuel) match = match && car.fuelType?.toLowerCase().includes(filters.fuel);
    if (filters.transmission) match = match && car.transmission?.toLowerCase().includes(filters.transmission);
    if (filters.brand) match = match && car.make?.toLowerCase().includes(filters.brand);
    return match;
  });
}

// DeepSeek API call
async function queryDeepSeek(message, filteredCars) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'system',
            content: `
            You are an intelligent automotive assistant specialized in the UAE market.
            You understand and respond fluently in both English and Arabic, depending on the user's message.
            You help users with finding, comparing, and recommending used cars based on their needs.
            Use the latest available dataset to suggest real listings when possible.
            Always be friendly, concise, and ask follow-up questions when the user is vague.
            Prioritize usefulness and relevance in your answers.
            If the user mentions something vague like "cheap" or "family car", ask for budget or seating preferences.
            `.trim()
            },
          {
            role: 'system',
            content: `Here are some relevant listings from the UAE car dataset:\n${JSON.stringify(filteredCars.slice(0, 10), null, 2)}`
          },
          {
            role: 'user',
            content: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('DeepSeek API error:', err.response?.data || err.message);
    return "Sorry, I couldn't get a response from the AI.";
  }
}

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Chat route is working!' });
});

// Get all cars
router.get('/cars', (req, res) => {
  res.json(carsData);
});

// Main chatbot route
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: 'No message received.' });

  const filteredCars = getFilteredCars(message);
  const reply = await queryDeepSeek(message, filteredCars);
  res.json({ reply });
});

module.exports = router;
