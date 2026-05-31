const { agentLoop } = require("../agent/toolRouter");

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Ask SkyMind: ", async (input) => {

    const output = await agentLoop(input);

    console.log("\n🌤 SkyMind:\n");
    console.log(output);

    rl.close();
});