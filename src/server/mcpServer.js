import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { getCoordinates } from "../tools/geo.tools.js";
import { getDailyWeather } from "../tools/weather.tools.js";
import { getAdvice } from "../tools/advice.tools.js";

const server = new McpServer({ name: "skymind", version: "1.0.0" });

server.registerTool(
    "get_coordinates",
    {
        description: "Get latitude/longitude for a city.",
        inputSchema: { city: z.string().describe("City name, e.g. Dhaka") }
    },
    async ({ city }) => {
        const result = await getCoordinates({ city });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
);

server.registerTool(
    "get_weather",
    {
        description: "Get today's max temperature and rain probability for coordinates.",
        inputSchema: { lat: z.number(), lon: z.number() }
    },
    async ({ lat, lon }) => {
        const result = await getDailyWeather({ lat, lon });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
);

server.registerTool(
    "get_advice",
    {
        description: "Get clothing/umbrella advice from temperature and rain probability.",
        inputSchema: { temp: z.number(), rainProb: z.number() }
    },
    async ({ temp, rainProb }) => {
        const result = getAdvice({ temp, rainProb });
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);
