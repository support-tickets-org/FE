export type ErrorDetails = Record<string, string[] | undefined>;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ErrorDetails,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

const BASE_URL = '/api';

export const isAbortError = (err: unknown) =>
  err instanceof DOMException && err.name === 'AbortError';

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    // Aborts are expected when a newer request replaces this one; callers ignore them.
    if (isAbortError(err)) throw err;
    throw new ApiError(0, 'Network error. Please check your connection.');
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.message ?? `Request failed (${response.status})`,
      payload?.error?.details,
    );
  }

  return payload as T;
}
