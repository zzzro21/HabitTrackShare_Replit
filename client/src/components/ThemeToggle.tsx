import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  
  // Handle animation effects when switching themes
  const [isAnimating, setIsAnimating] = React.useState(false);

  // After mounting, we can show the toggle
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    // Small delay to allow animation to complete
    setTimeout(() => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 150);
  };

  // Don't render anything until component is mounted (to avoid hydration mismatch)
  if (!mounted) return <div className="w-10 h-10"></div>;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        isAnimating ? "scale-90 opacity-70" : "scale-100 opacity-100"
      } ${
        isDark 
          ? "bg-gray-800 text-yellow-300 hover:bg-gray-700" 
          : "bg-blue-100 text-blue-800 hover:bg-blue-200"
      }`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`h-5 w-5 transition-all duration-300 absolute top-0 left-0 ${
            isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
          }`} 
        />
        <Moon 
          className={`h-5 w-5 transition-all duration-300 absolute top-0 left-0 ${
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`} 
        />
      </div>
    </button>
  );
}