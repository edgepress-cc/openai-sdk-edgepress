export interface ClientOptions {
  tenant: string;
  token: string;
  fetch?: typeof fetch;
}

export interface EdgePressClient {
  baseUrl: string;
  fetch(method: string, path: string, body?: unknown): Promise<unknown>;
  get(path: string): Promise<unknown>;
  post(path: string, body?: unknown): Promise<unknown>;
  put(path: string, body?: unknown): Promise<unknown>;
  delete(path: string): Promise<unknown>;
}

export class EdgePressApiError extends Error {
  status: number;
  body: unknown;
  retryAfter?: number;
  constructor(status: number, body: unknown, retryAfter?: number) {
    super(`EdgePress API ${status}`);
    this.status = status;
    this.body = body;
    this.retryAfter = retryAfter;
  }
}

export function createClient(opts: ClientOptions): EdgePressClient {
  if (!opts.tenant) throw new Error('tenant is required (e.g. blog.edgepress.cc)');
  if (!opts.token) throw new Error('token is required (starts with epat_)');
  const baseUrl = `https://${opts.tenant}/api/v1`;
  const fetchImpl = opts.fetch ?? globalThis.fetch;

  async function call(method: string, path: string, body?: unknown): Promise<unknown> {
    const res = await fetchImpl(baseUrl + path, {
      method,
      headers: {
        Authorization: `Bearer ${opts.token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let parsed: unknown = null;
    const text = await res.text();
    if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
    if (!res.ok) {
      const ra = res.headers.get('Retry-After');
      throw new EdgePressApiError(res.status, parsed, ra ? parseInt(ra, 10) : undefined);
    }
    return parsed;
  }

  return {
    baseUrl,
    fetch: call,
    get: (p) => call('GET', p),
    post: (p, b) => call('POST', p, b),
    put: (p, b) => call('PUT', p, b),
    delete: (p) => call('DELETE', p),
  };
}
