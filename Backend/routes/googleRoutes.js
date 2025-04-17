const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();
const NodeCache = require('node-cache');

// Initialize cache with 5 minute TTL and check period of 10 minutes
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 600,
  useClones: false
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Cache for AI responses
const getCachedAIResponse = async (message) => {
  const cacheKey = `ai_response_${message.toLowerCase().trim()}`;
  let response = cache.get(cacheKey);
  
  if (!response) {
    response = await queryGoogleAI(message);
    cache.set(cacheKey, response);
  }
  
  return response;
};

async function queryGoogleAI(message) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });
    return response.text;
  } catch (error) {
    console.error('Error querying Google AI:', error);
    throw error;
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getCachedAIResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test', async (req, res) => {
  try {
    const response = await queryGoogleAI("Explain how AI works in a few words");
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 