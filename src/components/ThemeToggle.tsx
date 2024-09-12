'use client'

import { useTheme } from "next-themes"
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    
    return (
        <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
                <Sun
                    className="h-[1.2rem] w-[1.2rem]"
                />
            ) : (
                <Moon
                    className="h-[1.2rem] w-[1.2rem]"
                />
            )}
        </Button>
    );
}