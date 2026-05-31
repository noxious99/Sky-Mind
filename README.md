# 🌤 SkyMind

SkyMind is a command-line **weather assistant agent**. You ask a question in plain
English (e.g. *"what should I wear in Dhaka?"*) and it figures out which tools to
call — geocoding, weather lookup, clothing advice — then replies with a natural,
helpful answer.

It is powered by **Google Gemini** for the reasoning/agent loop and
**Open-Meteo** (free, no API key) for geocoding and weather data. Tools are exposed
through an **MCP-style tool layer** (a client → registry indirection).

---

## Features

- 🗣️ Natural-language questions via a simple CLI prompt
- 🤖 Agentic loop — the model decides which tool to call and when it's done
- 🌍 City → coordinates lookup (Open-Meteo geocoding)
- 🌡️ Daily temperature + rain probability (Open-Meteo forecast)
- 🧥 Clothing / umbrella advice derived from the weather
- 🧩 JSON-only tool protocol between the agent and the tools

---

## Architecture

```
            ┌──────────────┐
 user ────► │  index.js    │   CLI prompt ("Ask SkyMind:")
            └──────┬───────┘
                   │ agentLoop(input)
            ┌──────▼─────────────┐
            │ agent/toolRouter   │  Gemini loop: decide tool → call → repeat
            └──────┬─────────────┘
                   │ runTool(name, args)
            ┌──────▼───────────┐
            │ client/mcpClient │  thin indirection (in-process)
            └──────┬───────────┘
                   │ callTool(name, args)
            ┌──────▼───────────────┐
            │ agent/toolRegistry   │  tool map + descriptions (listTools)
            └──────┬───────────────┘
                   │ dispatches to
       ┌───────────┼─────────────────┐
       ▼           ▼                 ▼
 geo.tools   weather.tools     advice.tools
   │              │
   ▼              ▼
        services/openMeteo  ──►  Open-Meteo HTTP API
```

### The agent loop

[`src/agent/toolRouter.js`](src/agent/toolRouter.js) runs up to **4 iterations**.
On each pass it sends Gemini:

- the list of available tools (from `listTools()`), and
- the current context (the user's question, then later the result of the last tool call).

Gemini is forced to reply with **JSON only** (`responseMimeType: "application/json"`):

```json
{
  "tool": "tool_name | final",
  "args": {},
  "message": "final answer when tool = final"
}
```

- If `tool === "final"`, the loop returns `message` as the answer.
- Otherwise it calls the named tool with `args`, feeds the result back as context,
  and loops again.

> **Note on tool args:** the model infers each tool's arguments from the
> human-readable description string in the registry (e.g. `"...args: { city }"`).
> Arguments are not schema-validated.

---

## Project structure

```
src/
├── index.js                # CLI entry point (readline prompt)
├── agent/
│   ├── toolRouter.js        # Gemini agent loop (agentLoop)
│   └── toolRegistry.js      # tool map, callTool, listTools
├── client/
│   └── mcpClient.js         # runTool → callTool indirection
├── tools/
│   ├── geo.tools.js         # getCoordinates({ city })
│   ├── weather.tools.js     # getDailyWeather({ lat, lon })
│   └── advice.tools.js      # getAdvice({ temp, rainProb })
├── services/
│   └── openMeteo.js         # getWeather(lat, lon) — Open-Meteo HTTP call
└── config/
    └── env.js               # loads GEMINI_API_KEY from .env
```

---

## Tools reference

| Tool              | Args                      | Returns                                  | Source |
|-------------------|---------------------------|------------------------------------------|--------|
| `getCoordinates`  | `{ city }`                | `{ city, lat, lon }`                     | [geo.tools.js](src/tools/geo.tools.js) |
| `getDailyWeather` | `{ lat, lon }`            | `{ temp, rain }`                         | [weather.tools.js](src/tools/weather.tools.js) |
| `getAdvice`       | `{ temp, rainProb }`      | `{ umbrella, message }`                  | [advice.tools.js](src/tools/advice.tools.js) |

---

## Prerequisites

- **Node.js** 18+ (developed on Node 22)
- A **Google Gemini API key** — get one free at
  [Google AI Studio](https://aistudio.google.com/apikey)

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   > `.env` is gitignored — never commit your key.

---

## Usage

```bash
npm start
```

Then type a question at the prompt:

```
Ask SkyMind: what should I wear in Rajshahi

 🌤 Looking at the sky...

🌤 SkyMind:

It's hot in Rajshahi today (around 34°C) with a low chance of rain — wear
light clothing, stay hydrated, and you can leave the umbrella at home.
```

---

## Dependencies

| Package                     | Purpose                                  |
|-----------------------------|------------------------------------------|
| `@google/generative-ai`     | Gemini model client (agent reasoning)    |
| `axios`                     | HTTP requests to Open-Meteo              |
| `dotenv`                    | Loads `GEMINI_API_KEY` from `.env`       |

---

## Known limitations

- **No arg validation** — tool arguments are inferred by the model from prose
  descriptions, not validated against a schema.
- **Rate limits** — the free Gemini tier can return `429`; the app surfaces a
  friendly message and you simply retry.
- **`rain` vs `rainProb`** — `getDailyWeather` returns `rain`, but `getAdvice`
  expects `rainProb`; the model currently bridges this gap itself.
- The MCP-style tool layer runs **in-process** (client → registry), not over a
  separate transport.

---

## Roadmap

- [ ] Migrate to a **true MCP server** (`@modelcontextprotocol/sdk`) over stdio
- [ ] Publish real **`zod` input schemas** per tool (replacing prose arg hints)
- [ ] Convert the project to **ES Modules**
- [ ] Add retry/backoff for transient Gemini errors

---

## License

ISC
