const { callTool } = require("../server/mcpServer");

const runTool = async (name, args) => {
    return await callTool(name, args);
}

module.exports = { runTool };