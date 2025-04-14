const express = require('express');
const router = express.Router(); // Create a router

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ reply: 'No message received.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or gpt-4
      messages: [
        { role: 'system', content: 'You are a car sales assistant for UAE. Answer based on used car data.' },
        { role: 'user', content: message }
      ]
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: 'Something went wrong while contacting OpenAI.' });
  }
});
module.exports = router;
