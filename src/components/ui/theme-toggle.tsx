import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { HugeiconsIcon } from '@hugeicons/react';
import { SunIcon, MoonIcon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { isDark, setTheme } = useTheme();

    const toggleTheme = () => {
        // Add transition to body on first click so initial load doesn't transition
        if (!document.body.style.transition) {
            document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease';
        }
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                    <motion.div
                        key="moon"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <HugeiconsIcon icon={MoonIcon} strokeWidth={2} size={18} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <HugeiconsIcon icon={SunIcon} strokeWidth={2} size={18} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Button>
    );
}
