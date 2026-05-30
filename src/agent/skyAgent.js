const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

async function explain(userInput, weatherData, advice, city) {
    const prompt = `
        User asked: "${userInput}"

        City: ${city}
        Temperature: ${weatherData.temp}°C
        Rain chance: ${weatherData.rain}%

        Advice: ${advice.message}

        Explain this in a natural, short response.
        Be practical and conversational.
    `;

    const result = await model.generateContent(prompt);

    return result.response.text();
}

module.exports = { explain };