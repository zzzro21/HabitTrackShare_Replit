import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  urlOrMethod: string,
  urlOrData?: string | unknown,
  data?: unknown
): Promise<T> {
  // Handle overloaded versions
  let method: string;
  let url: string;
  let bodyData: unknown | undefined;

  if (arguments.length === 1 || (arguments.length === 2 && typeof urlOrData !== 'string')) {
    // GET request: apiRequest(url) or apiRequest(url, queryParams)
    method = 'GET';
    url = urlOrMethod;
    bodyData = urlOrData;
  } else {
    // Traditional method call: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrData as string;
    bodyData = data;
  }

  const res = await fetch(url, {
    method,
    headers: bodyData ? { "Content-Type": "application/json" } : {},
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
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
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
