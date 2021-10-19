export class CloudFlareStorage {
  constructor(token, accountId, kvNamespace, prefix = '') {
    this.token = token;
    this.accountId = accountId;
    this.kvNamespace = kvNamespace;
    this.prefix = prefix;
  }

  async get(key) {
    const { data, status, error } = await this.request('GET', key);
    if (status === 200 || status === 404) {
      return data || null;
    }
    throw error;
  }

  async put(key, value) {
    const { error } = await this.request('PUT', key, value);

    if (error) {
      throw error;
    }
  }

  async request(method, key, value = null) {
    const url = this.url(key);
    const r = await fetch(url, {
      method,
      body: value,
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Bearer ${this.token}`,
      },
    });
    const data = await r.json();
    if (r.ok) {
      return { status: r.status, data };
    }
    const errorMessages = (data.errors || []).map((e) => e && e.message);
    return {
      status: r.status,
      error: new Error(
        `Request to ${url} failed with status ${r.status}. Errors: [${errorMessages}]`,
      ),
    };
  }

  url(key) {
    return `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/storage/kv/namespaces/${this.kvNamespace}/values/${this.prefix}${key}`;
  }
}
