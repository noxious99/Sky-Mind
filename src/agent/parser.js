const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

async function parseUserInput(input) {
    const prompt = `
        Extract structured data from the user query.

        Return ONLY valid JSON:

        {
        "city": string,
        "intent": "weather | activity | outfit",
        "activity": string | null
        }

        Rules:
        - If city is not mentioned, default to "Dhaka"
        - Infer intent from the sentence
        - Do NOT include extra text

        User query:
        ${input}
        `;

    const result = await model.generateContent(prompt);

    // Strip markdown code fences if the model wraps the JSON in them
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    return JSON.parse(cleaned);
}

module.exports = {parseUserInput};