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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "CraveAI API key is not configured.",
      });
    }

    // Get the real CRAVINGS menu from MongoDB
    const foods = await Food.find().lean();

    const foodMenu = foods.map((food) => ({
      id: food._id,
      name: food.name,
      price: food.price,
      category: food.category,
      description: food.description || "",
    }));

    const systemPrompt = `
You are CraveAI, the official AI food assistant inside the CRAVINGS food ordering application.

Your job is to help users choose food from CRAVINGS.

IMPORTANT RULES:

1. Recommend ONLY food items that exist in the CRAVINGS menu below.
2. Never invent food items or prices.
3. Always use the exact food name from the menu.
4. Always use the actual price from the menu.
5. If the user gives a budget, recommend items within that budget whenever possible.
6. Understand natural language such as:
   - spicy
   - vegetarian
   - non-vegetarian
   - healthy
   - cheap
   - budget
   - dinner
   - lunch
   - breakfast
   - snack
   - sweet
   - biryani
   - burger
   - pizza
   - hungry
7. Give useful food recommendations instead of generic chatbot answers.
8. Keep responses concise and friendly.
9. If the user asks something unrelated to food, politely explain that CraveAI is designed to help with CRAVINGS food choices.
10. Never claim that an unavailable food exists in CRAVINGS.

CURRENT CRAVINGS MENU:

${JSON.stringify(foodMenu, null, 2)}
`;

    // Prevent CraveAI from waiting forever
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 25000);

    let geminiResponse;

    try {
      geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },

            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: message,
                  },
                ],
              },
            ],

            generationConfig: {
              maxOutputTokens: 400,
            },
          }),

          signal: controller.signal,
        }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error("Gemini API Error:", errorText);

      return res.status(500).json({
        message: "CraveAI could not get a response from Gemini.",
      });
    }

    const geminiData = await geminiResponse.json();

    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        message: "CraveAI received an empty response.",
      });
    }

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("CraveAI Error:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        message:
          "CraveAI took too long to respond. Please try again.",
      });
    }

    res.status(500).json({
      message: "CraveAI failed.",
      error: error.message,
    });
  }
});

module.exports = router;