import type { EdgePressClient } from './client.js';

const DOMAINS = [
  { name: 'ep_posts',          desc: 'Author, list, update, delete posts.' },
  { name: 'ep_pages',          desc: 'Author, list, update, delete pages.' },
  { name: 'ep_media',          desc: 'Upload, list, delete media files. POST /media uses multipart; other endpoints JSON.' },
  { name: 'ep_categories',     desc: 'CRUD post categories.' },
  { name: 'ep_tags',           desc: 'CRUD post tags.' },
  { name: 'ep_users',          desc: 'Read-only unless the caller is admin. GET /users/me is always safe.' },
  { name: 'ep_podcasts',       desc: 'CRUD podcast episodes.' },
  { name: 'ep_daily_cartoons', desc: 'CRUD daily cartoons.' },
  { name: 'ep_settings',       desc: 'Read + write tenant settings.' },
  { name: 'ep_api_tokens',     desc: 'Read-only: GET /api-tokens. POST/DELETE are session-only — refuse and refer to the admin UI.' },
];

export function tools(_client: EdgePressClient) {
  return DOMAINS.map(d => ({
    type: 'function' as const,
    function: {
      name: d.name,
      description: `${d.desc} See https://api-docs.edgepress.cc for the full OpenAPI spec of /api/v1.`,
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['method', 'path'],
        properties: {
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'] },
          path: { type: 'string', description: 'Path under /api/v1, e.g. "/posts?limit=3" or "/posts/42".' },
          body: { type: 'object', additionalProperties: true, description: 'JSON body for POST/PUT.' },
        },
      },
    },
  }));
}

export interface ToolCall {
  id: string;
  function: { name: string; arguments: string };
}

export async function dispatch(client: EdgePressClient, call: ToolCall): Promise<string> {
  const args = JSON.parse(call.function.arguments) as { method: string; path: string; body?: unknown };
  const result = await client.fetch(args.method, args.path, args.body);
  return JSON.stringify(result);
}
