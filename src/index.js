const { parseUserInput } = require("./agent/parser");
const { getCoordinates } = require("./tools/geo.tools");
const { getDailyWeather } = require("./tools/weather.tools");
const { getAdvice } = require("./tools/advice.tools");
const { explain } = require("./agent/skyAgent");

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Ask SkyMind: ", async (input) => {
    console.log("\n🌤 Looking at the sky...");

    const parsed = await parseUserInput(input);

    const geo = await getCoordinates(parsed.city);
    const weather = await getDailyWeather(geo.lat, geo.lon);
    const advice = getAdvice(weather.temp, weather.rain);

    const final = await explain(
        input,
        weather,
        advice,
        geo.city
    );

    console.log("\n🌤 SkyMind:\n");
    console.log(final);

    rl.close();
});