import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";
import { runTool } from "../client/mcpClient.js";
import { listTools } from "../agent/toolRegistry.js"

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        responseMimeType: "application/json"
    }
});

export async function agentLoop(userInput) {

    let context = userInput;

    for (let i = 0; i < 4; i++) {

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

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (err) {
            throw new Error("AI service unavailable (" + (err.status || "error") + "). Please try again later.");
        }

        const response = JSON.parse(result.response.text());
        console.log("\n\n Tools: ", response.tool)
        if (response.tool === "final") {
            return response.message;
        }

        const toolResult =
            await runTool(response.tool, response.args);

        context = JSON.stringify(toolResult);
        console.log("\n\n context: ", context)
    }

    return "Unable to complete request.";
}
