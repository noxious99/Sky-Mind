# 🌤 SkyMind

SkyMind is a command-line **weather assistant agent**. You ask a question in plain
English (e.g. *"what should I wear in Dhaka?"*) and it figures out which tools to
call — geocoding, weather lookup, clothing advice — then replies with a natural,
helpful answer.

It is powered by **Google Gemini** for the reasoning/agent loop and
**Open-Meteo** (free, no API key) for geocoding and weather data. The tools are
served by a real **[Model Context Protocol](https://modelcontextprotocol.io) (MCP)
server** that the agent talks to over JSON-RPC — the same protocol used by Claude
Desktop, Cursor, and other AI hosts.

---

## Features

- 🗣️ Natural-language questions via a simple CLI prompt
- 🤖 Agentic loop — the model decides which tool to call and when it's done
- 🌍 City → coordinates lookup (Open-Meteo geocoding)
- 🌡️ Daily temperature + rain probability (Open-Meteo forecast)
- 🧥 Clothing / umbrella advice derived from the weather
- 🧩 Tools exposed over a **standard MCP server** with `zod`-validated input schemas

---

## Architecture

SkyMind runs as **two processes**: the agent (MCP *client*) and the tool server
(MCP *server*). They communicate over **JSON-RPC 2.0 via stdio** — the client spawns
the server as a child process and pipes its stdin/stdout.

```
   PROCESS 1 — the agent (client)                PROCESS 2 — the MCP server
 ┌──────────────────────────────────┐         ┌────────────────────────────────────┐
 │ index.js   (CLI prompt)           │         │ server/mcpServer.js                 │
 │   │ agentLoop(input)              │         │   registers tools w/ zod schemas:   │
 │   ▼                               │         │     • get_coordinates               │
 │ agent/toolRouter.js  (Gemini)     │         │     • get_weather                   │
 │   │ listTools() / runTool()       │         │     • get_advice                    │
 │   ▼                               │         │        │ calls                       │
 │ client/mcpClient.js               │         │        ▼                            │
 │   (spawns + connects to server) ──┼────────►│  tools/*.tools.js                   │
 └──────────────────────────────────┘ JSON-RPC└────────────────┬───────────────────┘
        ▲                              over stdio               │
        │   tools/list, tools/call                              ▼
        └───────────────────────────────────────  services/openMeteo ─► Open-Meteo API
```

### How one question flows

1. **`index.js`** reads your question and calls `agentLoop()`.
2. **`toolRouter.js`** calls `listTools()`. On first use, **`mcpClient.js`** spawns
   `node server/mcpServer.js` and performs the MCP handshake, then asks the server
   `tools/list` — getting back each tool's name, description, and **JSON Schema**.
3. The tools + schemas are placed in the prompt. Gemini replies with **JSON only**
   (`responseMimeType: "application/json"`):
   ```json
   { "tool": "tool_name | final", "args": {}, "message": "final answer if tool=final" }
   ```
4. If `tool !== "final"`, `runTool(name, args)` sends a `tools/call` over the
   protocol; the server runs the tool and returns an MCP result
   (`{ content: [{ type: "text", text }] }`).
5. The result is fed back as context and the loop repeats (up to 4 iterations) until
   the model returns `"final"`.
6. On exit, `closeClient()` shuts the connection and terminates the server process.

> **Tool args come from real schemas.** Because the server declares each tool's
> inputs with `zod`, the client receives a machine-readable JSON Schema via
> `tools/list` — the model is given the exact arg shape, not a prose hint.

---

## Project structure

```
src/
├── index.js                # CLI entry point; connects + clean shutdown
├── agent/
│   └── toolRouter.js        # Gemini agent loop (agentLoop)
├── client/
│   └── mcpClient.js         # MCP client: spawns server, listTools / runTool
├── server/
│   └── mcpServer.js         # MCP server: registers tools over stdio
├── tools/
│   ├── geo.tools.js         # getCoordinates({ city })
│   ├── weather.tools.js     # getDailyWeather({ lat, lon })
│   └── advice.tools.js      # getAdvice({ temp, rainProb })
├── services/
│   └── openMeteo.js         # getWeather(lat, lon) — Open-Meteo HTTP call
└── config/
    └── env.js               # loads GEMINI_API_KEY from .env
```

> This project uses **ES Modules** (`"type": "module"`), required by the MCP SDK.

---

## MCP tools reference

These are the tools the server publishes (names as seen over the protocol):

| Tool             | Input schema (`zod`)        | Returns (JSON text)        | Implementation |
|------------------|-----------------------------|----------------------------|----------------|
| `get_coordinates`| `{ city: string }`          | `{ city, lat, lon }`       | [geo.tools.js](src/tools/geo.tools.js) |
| `get_weather`    | `{ lat: number, lon: number }` | `{ temp, rain }`        | [weather.tools.js](src/tools/weather.tools.js) |
| `get_advice`     | `{ temp: number, rainProb: number }` | `{ umbrella, message }` | [advice.tools.js](src/tools/advice.tools.js) |

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

## Inspecting the MCP server

Because the server is a **standalone MCP server**, any MCP host can use it — not just
SkyMind. You can open it in the official inspector (no client code, no Gemini needed):

```bash
npx @modelcontextprotocol/inspector node src/server/mcpServer.js
```

This launches a UI where you can browse the three tools, see their schemas, and call
them directly — exactly what Claude Desktop or any other MCP client would see.

---

## Dependencies

| Package                     | Purpose                                       |
|-----------------------------|-----------------------------------------------|
| `@google/generative-ai`     | Gemini model client (agent reasoning)         |
| `@modelcontextprotocol/sdk` | MCP client + server (protocol, stdio transport)|
| `zod`                       | Tool input schemas (published as JSON Schema) |
| `axios`                     | HTTP requests to Open-Meteo                   |
| `dotenv`                    | Loads `GEMINI_API_KEY` from `.env`            |

---

## Notes & limitations

- **Free-tier rate limits** — the free Gemini tier allows only ~20 requests/day per
  model, and the agent uses several per question; on `429` the app shows a friendly
  message and you retry (or switch models / enable billing).
- **`rain` vs `rainProb`** — `get_weather` returns `rain`, but `get_advice` expects
  `rainProb`; the model currently bridges this naming gap itself.
- **Server logging** — the MCP server must not write to `stdout` (that channel carries
  the JSON-RPC protocol); use `stderr` for any debugging.

---

## License

ISC
