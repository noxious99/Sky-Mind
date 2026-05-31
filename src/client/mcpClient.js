import { callTool } from "../agent/toolRegistry.js";

export const runTool = async (name, args) => {
    return await callTool(name, args);
}
