const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(endpoint, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.');
    error.status = response.status;
    error.errors = data?.errors || {};
    error.data = data;
    throw error;
  }

  return data;
}

export { API_URL };
export default { request };
