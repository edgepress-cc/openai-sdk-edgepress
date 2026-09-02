import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tools, dispatch } from '../src/tools.ts';
import { createClient } from '../src/client.ts';

test('tools() returns 10 tool definitions (one per domain)', () => {
  const client = createClient({ tenant: 'x.edgepress.cc', token: 'epat_x' });
  const defs = tools(client);
  assert.equal(defs.length, 10);
  const names = defs.map(d => d.function.name).sort();
  assert.deepEqual(names, [
    'ep_api_tokens', 'ep_categories', 'ep_daily_cartoons', 'ep_media',
    'ep_pages', 'ep_podcasts', 'ep_posts', 'ep_settings', 'ep_tags', 'ep_users'
  ]);
});

test('dispatch() routes to the right endpoint', async () => {
  let seen: any = null;
  const client = createClient({
    tenant: 'x.edgepress.cc', token: 'epat_x',
    fetch: async (url, init) => {
      seen = { url: String(url), method: init?.method };
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    },
  });
  await dispatch(client, {
    id: 'call_1',
    function: { name: 'ep_posts', arguments: JSON.stringify({ method: 'GET', path: '/posts?limit=3' }) },
  });
  assert.equal(seen.url, 'https://x.edgepress.cc/api/v1/posts?limit=3');
  assert.equal(seen.method, 'GET');
});
