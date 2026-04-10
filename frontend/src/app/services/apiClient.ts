const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:3001';

export class ApiClientError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

type JsonRequestOptions = {
  csrfToken?: string;
  body?: unknown;
};

type BinaryRequestOptions = {
  csrfToken?: string;
  body: BodyInit;
  contentType?: string;
};

async function requestJson<TResponse>(
  path: string,
  method: string,
  options: JsonRequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.csrfToken ? { 'x-csrf-token': options.csrfToken } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof responseBody?.error === 'string'
        ? responseBody.error
        : `Request failed with status ${response.status}`;

    throw new ApiClientError(response.status, message);
  }

  return responseBody as TResponse;
}

export const apiClient = {
  get<TResponse>(path: string) {
    return requestJson<TResponse>(path, 'GET');
  },

  post<TResponse>(path: string, body?: unknown, csrfToken?: string) {
    return requestJson<TResponse>(path, 'POST', {
      body,
      csrfToken,
    });
  },

  put<TResponse>(path: string, body?: unknown, csrfToken?: string) {
    return requestJson<TResponse>(path, 'PUT', {
      body,
      csrfToken,
    });
  },

  delete<TResponse>(path: string, csrfToken?: string) {
    return requestJson<TResponse>(path, 'DELETE', {
      csrfToken,
    });
  },

  async postBinary<TResponse>(
    path: string,
    options: BinaryRequestOptions,
  ): Promise<TResponse> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.contentType ? { 'Content-Type': options.contentType } : {}),
        ...(options.csrfToken ? { 'x-csrf-token': options.csrfToken } : {}),
      },
      body: options.body,
    });

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        typeof responseBody?.error === 'string'
          ? responseBody.error
          : `Request failed with status ${response.status}`;

      throw new ApiClientError(response.status, message);
    }

    return responseBody as TResponse;
  },
};
