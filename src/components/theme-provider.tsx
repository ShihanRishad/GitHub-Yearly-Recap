import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Theme, ThemeContextType } from '@/types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
        if (theme === 'system') return getSystemTheme();
        return theme;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove both classes first
        root.classList.remove('light', 'dark');

        // Determine the actual theme to apply
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
        setResolvedTheme(effectiveTheme);

        // Apply the theme class
        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme === 'system') {
                const newTheme = getSystemTheme();
                setResolvedTheme(newTheme);
                const root = window.document.documentElement;
                root.classList.remove('light', 'dark');
                if (newTheme === 'dark') {
                    root.classList.add('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        localStorage.setItem('theme', newTheme);
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
