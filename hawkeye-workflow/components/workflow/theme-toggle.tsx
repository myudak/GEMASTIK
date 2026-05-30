"use client";

import { Moon, Sun } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { setThemeMode, useThemeMode } from "@/components/workflow/theme-mode";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useThemeMode();

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setThemeMode(nextTheme);
  }

  const darkMode = theme === "dark";

  return (
    <Button
      aria-label={darkMode ? "Gunakan mode terang" : "Gunakan mode gelap"}
      className={cn(compact ? "size-11" : "h-11 w-full justify-start gap-3 text-base")}
      onClick={toggleTheme}
      size={compact ? "icon" : "default"}
      type="button"
      variant="outline"
    >
      {darkMode ? <Sun aria-hidden size={22} /> : <Moon aria-hidden size={22} />}
      {compact ? null : darkMode ? "Mode terang" : "Mode gelap"}
    </Button>
  );
}
