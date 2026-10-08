const express = require("express");
const Food = require("../models/Food");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message.",
      });
    }

    // Get actual CRAVINGS food data from MongoDB
    const foods = await Food.find().lean();

    const foodMenu = foods.map((food) => ({
      id: food._id,
      name: food.name,
      price: food.price,
      category: food.category,
      description: food.description,
    }));

    const systemPrompt = `
You are CraveAI, the official AI food assistant inside the CRAVINGS food ordering application.

Your job is to help users decide what food to order.

IMPORTANT RULES:
1. Recommend ONLY food items that exist in the CRAVINGS menu provided below.
2. Never invent a food item or price.
3. If the user gives a budget, stay within that budget whenever possible.
4. Understand natural language such as spicy, vegetarian, cheap, dinner, snack, healthy, hungry, etc.
5. Be friendly and concise.
6. If the user asks something unrelated to food ordering, politely say that you are CraveAI and are designed to help with CRAVINGS food choices.
7. Mention the actual CRAVINGS food name and price when recommending something.

CURRENT CRAVINGS MENU:
${JSON.stringify(foodMenu, null, 2)}
`;

    // Send the request to the locally running Ollama AI
    const ollamaResponse = await fetch(
      "http://localhost:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: message,
            },
          ],
          stream: false,
        }),
      }
    );

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();

      return res.status(500).json({
        message: "CraveAI could not connect to the local AI.",
        error: errorText,
      });
    }

    const aiData = await ollamaResponse.json();

    res.json({
      success: true,
      reply: aiData.message?.content || "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.error("CraveAI Error:", error);

    res.status(500).json({
      message: "CraveAI failed.",
      error: error.message,
    });
  }
});

module.exports = router;