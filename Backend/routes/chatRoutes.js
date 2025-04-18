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


// Google AI API call with optimizations
async function queryGoogleAI(message, history, cars) {
  console.log(history);
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

    const sanitizedCars = cars.map(car => {
      const { Overview, ...rest } = car;
      return rest;
    });
    console.log(sanitizedCars.length);
    // Prepare the car data for the prompt
    const carDataForPrompt = sanitizedCars.length > 0 
      ? `Here are the available car listings that match your criteria:\n${JSON.stringify(sanitizedCars.slice(0, 201), null, 2)}`
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

8. CUSTOM OUTPUT (idncu):
   - FORMAT: Always include 'idncu: X' at the end of your response, where X is the car's index number
   - RULES:
     * Only include idncu when exactly ONE car is being recommended
     * Do not include idncu if no car is selected or if multiple cars are recommended
     * The index number (X) must match the car's position in the provided JSON array (0-based index)
     * Example: If recommending the first car in the array, use 'idncu: 0'
     * Example: If recommending the 15th car in the array, use 'idncu: 14'
   - IMPORTANT: This is a required format for single car recommendations

Messages histroy: ${history}

User question: ${message}

${carDataForPrompt}
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

  const { message, history } = req.body;

  if (!message) return res.status(400).json({ reply: 'No message received.' });

  try {
    const reply = await queryGoogleAI(message, history, carsData);
    res.json({ reply });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({ reply: "An error occurred while processing your request." });
  }
});

module.exports = router;