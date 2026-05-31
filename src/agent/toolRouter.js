const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require("../config/env");
const { runTool } = require("../client/mcpClient");
const { listTools } = require("../agent/toolRegistry")

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

async function agentLoop(userInput) {

    let context = userInput;

    for (let i = 0; i < 3; i++) {

        const prompt = `
You are SkyMind agent.

You can use tools:

${listTools()}

Return JSON only:

{
  "tool": "tool_name" | "final",
  "args": {},
  "message": "final answer if tool=final"
}

User input:
${context}
`;

        const result = await model.generateContent(prompt);
        const response = JSON.parse(result.response.text());

        if (response.tool === "final") {
            return response.message;
        }

        const toolResult =
            await runTool(response.tool, response.args);

        context = JSON.stringify(toolResult);
    }

    return "Unable to complete request.";
}

module.exports = { agentLoop };