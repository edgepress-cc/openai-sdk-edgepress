// Minimal OpenAI agent loop against EdgePress.
// Requires: npm i openai; export OPENAI_API_KEY=... EDGEPRESS_TENANT=... EDGEPRESS_TOKEN=...
import OpenAI from 'openai';
import { createClient, tools, dispatch } from '@edgepress/openai-sdk';

const openai = new OpenAI();
const edge = createClient({ tenant: process.env.EDGEPRESS_TENANT!, token: process.env.EDGEPRESS_TOKEN! });

const messages: any[] = [
  { role: 'system', content: 'You manage an EdgePress tenant via the ep_* tools. Confirm before destructive ops.' },
  { role: 'user', content: process.argv.slice(2).join(' ') || 'list my last 3 posts' },
];

for (let step = 0; step < 10; step++) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools: tools(edge),
  });
  const msg = res.choices[0].message;
  messages.push(msg);
  if (!msg.tool_calls?.length) { console.log(msg.content); break; }
  for (const call of msg.tool_calls) {
    const out = await dispatch(edge, call);
    messages.push({ role: 'tool', tool_call_id: call.id, content: out });
  }
}
