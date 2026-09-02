# @edgepress/openai-sdk

Tiny (no runtime deps) TypeScript SDK for using the EdgePress tenant API from OpenAI-powered agents.

## Install

```
npm i openai github:edgepress-cc/openai-sdk-edgepress
```

> Once published to npm under the `@edgepress` scope the short form `@edgepress/openai-sdk` can be used directly — same import path.

## Use

```typescript
import { createClient, tools, dispatch } from '@edgepress/openai-sdk';

const edge = createClient({
  tenant: process.env.EDGEPRESS_TENANT!,   // e.g. blog.edgepress.cc
  token:  process.env.EDGEPRESS_TOKEN!,    // epat_...
});

// Plain fetch
const posts = await edge.get('/posts?limit=3');

// OpenAI function-calling loop — see examples/agent-loop.ts
const toolDefs = tools(edge);
// ... pass to openai.chat.completions.create({ tools: toolDefs, ... })
// ... await dispatch(edge, toolCall) on each returned call
```

## Env vars

- `EDGEPRESS_TENANT` — hostname, e.g. `blog.edgepress.cc`
- `EDGEPRESS_TOKEN` — token starting with `epat_`

Full API surface: https://api-docs.edgepress.cc

## Related

- [`edgepress-cc/gemini-sdk-edgepress`](https://github.com/edgepress-cc/gemini-sdk-edgepress) — same shape for Gemini
- [`edgepress-cc/claude-code-edgepress`](https://github.com/edgepress-cc/claude-code-edgepress) — Claude Code plugin
