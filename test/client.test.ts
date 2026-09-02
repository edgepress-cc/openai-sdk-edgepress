import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '../src/client.ts';

test('createClient throws on missing tenant', () => {
  assert.throws(() => createClient({ tenant: '', token: 'epat_x' }), /tenant/);
});

test('createClient throws on missing token', () => {
  assert.throws(() => createClient({ tenant: 'blog.edgepress.cc', token: '' }), /token/);
});

test('createClient builds correct URL', () => {
  const c = createClient({ tenant: 'blog.edgepress.cc', token: 'epat_x' });
  assert.equal(c.baseUrl, 'https://blog.edgepress.cc/api/v1');
});

test('rate-limit error carries retry-after', async () => {
  const c = createClient({
    tenant: 'blog.edgepress.cc',
    token: 'epat_x',
    fetch: async () => new Response(null, { status: 429, headers: { 'Retry-After': '30' } })
  });
  await assert.rejects(() => c.fetch('GET', '/posts'), (e: any) => e.status === 429 && e.retryAfter === 30);
});
