import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config/env.js";
import { runTool, listTools } from "../client/mcpClient.js";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
});

export async function agentLoop(userInput) {
    const tools = await listTools();
    const toolText = tools
        .map(t => `- ${t.name}: ${t.description}\n  input schema: ${JSON.stringify(t.inputSchema)}`)
        .join("\n");

    let context = userInput;

    for (let i = 0; i < 4; i++) {
        const prompt = `
You are SkyMind agent.

You can use tools:

${toolText}

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

        if (response.tool === "final") {
            return response.message;
        }

        // MCP results are { content: [{ type: "text", text }] } — unwrap the text
        const toolResult = await runTool(response.tool, response.args);
        const text = toolResult.content?.map(c => c.text).join("") ?? "";
        context = text;
    }

    return "Unable to complete request.";
}
