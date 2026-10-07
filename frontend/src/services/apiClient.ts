export interface ApiErrorPayload {
  code: string;
  message: string;
  details: Array<{ field: string; message: string }>;
  requestId?: string;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Array<{ field: string; message: string }>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.code = payload.code;
    this.status = status;
    this.details = payload.details;
  }

  /** Field-level validation messages when present, falling back to the top-level message. */
  get displayMessage(): string {
    if (this.details.length === 0) {
      return this.message;
    }
    return this.details.map((detail) => `${detail.field}: ${detail.message}`).join(' ');
  }
}

const API_BASE_URL = '/api/v1';

export async function apiRequest<TResponse>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  let json: { data?: TResponse; error?: ApiErrorPayload } | undefined;
  try {
    json = (await response.json()) as { data?: TResponse; error?: ApiErrorPayload };
  } catch {
    json = undefined;
  }

  if (!response.ok) {
    throw new ApiClientError(response.status, json?.error ?? {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
      details: [],
    });
  }

  return json?.data as TResponse;
}
