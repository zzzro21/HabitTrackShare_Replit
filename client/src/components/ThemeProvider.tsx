import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
};

// Simplified ThemeProvider that doesn't try to manage mounted state
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false} // Enable transitions when theme changes
    >
      {children}
    </NextThemesProvider>
  );
}