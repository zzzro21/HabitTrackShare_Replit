import { QueryClient, QueryFunction } from "@tanstack/react-query";
import config from '../config';
import { staticApiRequest } from './staticData';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// GET request
export async function apiRequest<T = any>(url: string): Promise<T>;
// POST/PUT/DELETE request with method and url
export async function apiRequest<T = any>(method: string, url: string, data?: unknown): Promise<T>;
// Implementation
export async function apiRequest<T = any>(
  urlOrMethod: string,
  urlOrData?: string | unknown,
  data?: unknown
): Promise<T> {
  // Handle overloaded versions
  let method: string;
  let url: string;
  let bodyData: unknown | undefined;

  // Check if this is a simple GET request or a method-specified request
  const isSimpleGet = urlOrData === undefined || typeof urlOrData !== 'string';
  
  if (isSimpleGet) {
    // GET request: apiRequest(url)
    method = 'GET';
    url = urlOrMethod;
    bodyData = urlOrData;
  } else {
    // Traditional method call: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrData as string;
    bodyData = data;
  }

  // GitHub Pages에서는 정적 데이터를 사용
  if (config.isGitHubPages || config.useStaticData) {
    return staticApiRequest(method, url, bodyData) as Promise<T>;
  }

  // 일반 API 요청
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: bodyData ? JSON.stringify(bodyData) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // GitHub Pages에서는 정적 데이터를 사용
    if (config.isGitHubPages || config.useStaticData) {
      try {
        return await staticApiRequest('GET', queryKey[0] as string) as unknown as T;
      } catch (error) {
        console.error('Error in static getQueryFn:', error);
        if (unauthorizedBehavior === "returnNull") {
          return null as T;
        }
        throw error;
      }
    }
    
    // 일반 API 요청
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Accept": "application/json"
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
