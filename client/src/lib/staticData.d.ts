declare module './staticData' {
  export function fetchStaticData(endpoint: string): Promise<any>;
  export function staticApiRequest(method: string, url: string, data?: unknown): Promise<any>;
}