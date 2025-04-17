const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const carsData = require('../data/usedCars.json');
const NodeCache = require('node-cache');

// Initialize cache with 5 minute TTL and check period of 10 minutes
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 600,
  useClones: false
});

// Initialize Google AI with error handling
let genAI;
try {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not set in environment variables');
  }
  genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  console.log('Google AI initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google AI:', error);
  throw error;
}

// Pre-process and cache car data for better performance
const processedCarsData = carsData.map(car => ({
  make: car.make?.toLowerCase(),
  model: car.model,
  year: parseInt(car.year),
  price: parseFloat(car.price),
  mileage: parseFloat(car.mileage),
  bodyType: car.bodyType?.toLowerCase(),
  fuelType: car.fuelType?.toLowerCase(),
  transmission: car.transmission?.toLowerCase(),
  originalData: car
}));

// Cache for filtered cars results with memoization
const getCachedFilteredCars = (message) => {
  const cacheKey = `filtered_cars_${message.toLowerCase().trim()}`;
  let filteredCars = cache.get(cacheKey);
  
  if (!filteredCars) {
    filteredCars = getFilteredCars(message);
    cache.set(cacheKey, filteredCars);
  }
  
  return filteredCars;
};

// Extract filters from message with optimized regex
function extractFiltersFromMessage(message) {
  const lower = message.toLowerCase().trim();
  const filters = {};

  // Use single regex for body types
  const bodyTypeMatch = lower.match(/\b(suv|sedan|hatchback|pickup|coupe)\b/);
  if (bodyTypeMatch) filters.bodyType = bodyTypeMatch[1];

  // Price filtering
  if (lower.includes('cheap') || lower.includes('budget')) {
    filters.maxPrice = 20000;
  } else {
    const priceMatch = lower.match(/under\s?(\d{2,5})/);
    if (priceMatch) filters.maxPrice = parseInt(priceMatch[1]);
  }

  // Year filtering with optimized regex
  const yearMatch = lower.match(/\b(20\d{2})\b/);
  if (yearMatch) filters.minYear = parseInt(yearMatch[1]);

  // Mileage filtering
  const mileageMatch = lower.match(/under\s?(\d{1,5})\s?km/);
  if (mileageMatch) filters.maxMileage = parseInt(mileageMatch[1]);

  // Fuel type with single regex
  const fuelMatch = lower.match(/\b(electric|hybrid|petrol|diesel)\b/);
  if (fuelMatch) filters.fuel = fuelMatch[1];

  // Transmission with single regex
  const transmissionMatch = lower.match(/\b(automatic|manual)\b/);
  if (transmissionMatch) filters.transmission = transmissionMatch[1];

  // Brand matching with optimized search
  const knownBrands = ['toyota', 'nissan', 'honda', 'bmw', 'mercedes', 'kia', 'hyundai', 'ford', 'chevrolet'];
  const brandMatch = knownBrands.find(brand => lower.includes(brand));
  if (brandMatch) filters.brand = brandMatch;

  return filters;
}

// Apply filters with optimized filtering
function getFilteredCars(message) {
  const filters = extractFiltersFromMessage(message);
  
  return processedCarsData.filter(car => {
    // Early return for non-matching criteria
    if (filters.bodyType && !car.bodyType?.includes(filters.bodyType)) return false;
    if (filters.maxPrice && car.price > filters.maxPrice) return false;
    if (filters.minYear && car.year < filters.minYear) return false;
    if (filters.maxMileage && car.mileage > filters.maxMileage) return false;
    if (filters.fuel && !car.fuelType?.includes(filters.fuel)) return false;
    if (filters.transmission && !car.transmission?.includes(filters.transmission)) return false;
    if (filters.brand && !car.make?.includes(filters.brand)) return false;
    
    return true;
  }).map(car => car.originalData);
}

// Google AI API call with optimizations
async function queryGoogleAI(message, filteredCars) {
  try {
    // Validate input
    if (!message || typeof message !== 'string') {
      return "Please provide a valid question about cars.";
    }

    // Check cache for similar queries
    const cacheKey = `chat_response_${message}`;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Prepare the car data for the prompt
    const carDataForPrompt = filteredCars.length > 0 
      ? `Here are the available car listings that match your criteria:\n${JSON.stringify(filteredCars.slice(0, 3), null, 2)}`
      : "No specific car listings match your criteria. I'll provide general advice based on your query.";

    const prompt = `
You are CarExpert, a specialized automotive assistant for the UAE market. Follow these guidelines:

1. RESPONSE FORMAT:
   - Keep responses concise and appropriate to the question
   - For greetings (hi, hello, etc.): Respond briefly with a friendly greeting
   - For specific car queries: Provide detailed recommendations
   - For general questions: Give focused, relevant answers
   - End with one relevant follow-up question only when appropriate

2. CAR RECOMMENDATIONS (ONLY when specifically asked about cars):
   - List up to 3 cars in this format:
   1. [Year] [Make] [Model] - AED [Price]
      Features: [Key Features]
      Highlights: [Unique Selling Points]

3. WRITING STYLE:
   - Use clear, simple language
   - Avoid technical jargon unless specifically asked
   - Be friendly but professional
   - Keep responses concise and focused
   - Add relevant emojis naturally in the text:
     * Use 🚗 for cars
     * Use 💰 for prices
     * Use ⚙️ for features
     * Use ✨ for highlights
     * Use 🛣️ for mileage
     * Use ⛽ for fuel type
     * Use ⚡ for electric vehicles
     * Use 😊 for friendly responses
     * Use ❓ for questions

4. WHEN NO EXACT MATCHES:
   - Clearly state that no exact matches were found
   - Suggest similar alternatives
   - Explain why these alternatives might be suitable
   - Ask for flexibility on specific criteria

5. PRICE FORMATTING:
   - Format prices as: AED 50,000
   - For ranges use: AED 50,000 - 60,000
   - Always include currency (AED)

6. MEASUREMENTS:
   - Mileage in km: 50,000 km
   - Engine size in liters: 2.0L
   - Power in HP: 200 HP

7. RESPONSE LENGTH GUIDELINES:
   - Greetings: 1-2 sentences max
   - Simple questions: 2-3 sentences max
   - Car recommendations: Detailed but concise
   - Complex queries: Focus on key points

${carDataForPrompt}

User question: ${message}
`;

    console.log('Sending request to Google AI...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.5,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }).catch(error => {
      console.error('Detailed Google AI error:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        details: error.details
      });
      throw error;
    });

    console.log('Received response from Google AI');
    const response = await result.response;
    let content = response.text();
    
    if (!content || content.trim().length === 0) {
      return "I couldn't generate a response. Please try rephrasing your question or ask about something else.";
    }

    // Format the response to ensure consistency
    content = content
      .replace(/\*\*/g, '') // Remove any asterisks
      .replace(/•/g, '-') // Replace bullets with dashes
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra blank lines
      .trim();

    // Cache the formatted response
    cache.set(cacheKey, content);
    return content;
  } catch (err) {
    console.error('Google AI API error:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      details: err.details
    });
    
    // Handle specific error cases
    if (err.message?.includes('API key') || err.message?.includes('authentication')) {
      return "Authentication error. Please check the API configuration.";
    } else if (err.message?.includes('quota')) {
      return "The service is currently busy. Please try again in a few moments.";
    } else if (err.message?.includes('fetch failed')) {
      return "Network error. Please check your internet connection and try again.";
    }
    
    return "I'm having trouble processing your request right now. Please try again in a moment.";
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

// Main chatbot route with rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

router.post('/', async (req, res) => {
  const now = Date.now();
  if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
    return res.status(429).json({ 
      reply: "Please wait a moment before sending another message." 
    });
  }
  lastRequestTime = now;

  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: 'No message received.' });

  try {
    const filteredCars = getCachedFilteredCars(message);
    const reply = await queryGoogleAI(message, filteredCars);
    res.json({ reply });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ reply: "An error occurred while processing your request." });
  }
});

module.exports = router;