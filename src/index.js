import {agentLoop} from "./agent/toolRouter.js";

import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Ask SkyMind: ", async (input) => {

    console.log("\n 🌤 Looking at the sky... ")

    try {
        const output = await agentLoop(input);

        console.log("\n🌤 SkyMind:\n");
        console.log(output);
    } catch (err) {
        console.log("\n  " + err.message);
    } finally {
        rl.close();
    }
});