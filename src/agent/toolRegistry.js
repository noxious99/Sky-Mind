import {getCoordinates} from "../tools/geo.tools.js";
import {getDailyWeather} from "../tools/weather.tools.js";
import {getAdvice} from "../tools/advice.tools.js";

export const callTool = (name, args) => {

    if (!tools[name]) {
        throw new Error("Tool not found: " + name);
    }

    return tools[name].fn(args);
}

const tools = {
    getCoordinates: {
        fn: getCoordinates,
        description: "Get latitude/longitude for a city. args: { city }"
    },
    getDailyWeather: {
        fn: getDailyWeather,
        description: "Get today's max temperature and rain probability. args: { lat, lon }"
    },
    getAdvice: {
        fn: getAdvice,
        description: "Get clothing/umbrella advice. args: { temp, rainProb }"
    }
};

export const listTools = () => {
    return Object.entries(tools)
        .map(([name, tool]) => `- ${name}: ${tool.description}`)
        .join("\n");
}