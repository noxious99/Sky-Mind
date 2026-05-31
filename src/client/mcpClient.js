const { callTool } = require("../agent/toolRegistry");

const runTool = async (name, args) => {
    return await callTool(name, args);
}

module.exports = { runTool };