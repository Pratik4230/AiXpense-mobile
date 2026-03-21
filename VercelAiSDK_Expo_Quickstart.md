# Vercel AI SDK - Expo Quickstart (Official)

Source: https://sdk.vercel.ai/docs/getting-started/expo

---

## Key Points

- Requires Expo 52+
- Uses `expo/fetch` instead of native `fetch` for streaming
- API route at `app/api/chat+api.ts`
- `generateAPIUrl` utility handles dev vs production URL

---

## Install

```bash
bun add ai @ai-sdk/react zod
```

---

## API Route (`app/api/chat+api.ts`)

```ts
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      myTool: tool({
        description: "Tool description",
        inputSchema: z.object({ param: z.string() }),
        execute: async ({ param }) => ({ result: param }),
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
```

---

## UI (`app/(tabs)/index.tsx`)

```tsx
import { generateAPIUrl } from "@/utils/api";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const { messages, error, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  // messages[i].parts - array of parts (text, tool-*, etc.)
  // part.type === 'text' -> part.text
  // part.type === 'tool-myTool' -> part.state, part.input, part.output
}
```

### Message Parts

Tool parts are named `tool-{toolName}`. States:

- `input-streaming` / `input-available` → tool is being called (show loading)
- `output-available` → tool result ready → `part.output`

```tsx
{
  m.parts.map((part, i) => {
    switch (part.type) {
      case "text":
        return <Text key={i}>{part.text}</Text>;
      case "tool-myTool":
        // part.state: 'input-streaming' | 'input-available' | 'output-available'
        // part.output: result from execute()
        return <Text key={i}>{JSON.stringify(part.output)}</Text>;
    }
  });
}
```

---

## `generateAPIUrl` utility (`src/utils/api.ts`)

```ts
import Constants from "expo-constants";

export const generateAPIUrl = (relativePath: string) => {
  const origin = Constants.experienceUrl.replace("exp://", "http://");
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === "development") {
    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL environment variable is not defined",
    );
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
```

> In dev, uses `Constants.experienceUrl` (e.g. `exp://192.168.x.x:8081`) converted to `http://`.
> In production, uses `EXPO_PUBLIC_API_BASE_URL`.

---

## Polyfills (`polyfills.js`)

```bash
bun add @ungap/structured-clone @stardazed/streams-text-encoding
```

```js
import { Platform } from "react-native";
import structuredClone from "@ungap/structured-clone";

if (Platform.OS !== "web") {
  const setupPolyfills = async () => {
    const { polyfillGlobal } =
      await import("react-native/Libraries/Utilities/PolyfillFunctions");
    const { TextEncoderStream, TextDecoderStream } =
      await import("@stardazed/streams-text-encoding");

    if (!("structuredClone" in global)) {
      polyfillGlobal("structuredClone", () => structuredClone);
    }
    polyfillGlobal("TextEncoderStream", () => TextEncoderStream);
    polyfillGlobal("TextDecoderStream", () => TextDecoderStream);
  };

  setupPolyfills();
}

export {};
```

Import in root `_layout.tsx`:

```ts
import "../polyfills";
```

---

## Multi-step Tool Calls

Use `stopWhen: stepCountIs(N)` in `streamText` to allow the model to call tools and continue generating until N steps are reached. Default is 1 step (stops after first tool call).

---

## Notes

- Expo API routes run on the **Expo dev server** (same process), not a separate backend
- For production, routes run via EAS or self-hosted Expo server
- Use `expo/fetch` (not native `fetch`) for streaming to work on mobile
