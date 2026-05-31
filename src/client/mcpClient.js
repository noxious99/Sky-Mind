import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, "../server/mcpServer.js");

let client;

async function getClient() {
    if (client) return client;

    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath]
    });

    client = new Client({ name: "skymind-agent", version: "1.0.0" });
    await client.connect(transport);
    return client;
}

// Returns the real tool list (name, description, JSON-Schema) from the server
export async function listTools() {
    const c = await getClient();
    const { tools } = await c.listTools();
    return tools;
}

// Calls a tool over the protocol and returns the MCP result
export async function runTool(name, args) {
    const c = await getClient();
    return c.callTool({ name, arguments: args });
}

export async function closeClient() {
    if (client) {
        await client.close();
        client = undefined;
    }
}
