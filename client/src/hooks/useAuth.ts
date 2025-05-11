import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AuthResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    queryFn: () => apiRequest("/api/auth/me"),
    retry: false,
  });

  return {
    user: data?.success ? data.user : null,
    isLoading,
    isAuthenticated: data?.success === true,
    error,
  };
}