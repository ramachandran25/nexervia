import { createContext, useEffect, useState } from "react";
import api from "../services/api";

type Theme = "light" | "dark";

export const ThemeContext = createContext({
  theme: "light" as Theme,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: any) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("user/me/");
        const saved = res.data.theme || "light";
        apply(saved);
        setTheme(saved);
      } catch {}
    }
    load();
  }, []);

  const apply = (mode: Theme) => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    apply(newTheme);
    await api.patch("user/theme/", { theme: newTheme });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}