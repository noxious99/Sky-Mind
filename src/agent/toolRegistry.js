const tools = require("../tools");

const callTool = (name, args) => {

    if (!tools[name]) {
        throw new Error("Tool not found: " + name);
    }

    return tools[name](args);
}

const get_coordinates = require("../tools/geo.tool");
const get_weather = require("../tools/weather.tool");
const get_advice = require("../tools/advice.tool");

const tools = {
    get_coordinates,
    get_weather,
    get_advice
};

const listTools = () => {
    return Object.keys(tools).map(name => ({
        name,
        description: "SkyMind tool: " + name
    }));
}

module.exports = {
    callTool,
    listTools
};