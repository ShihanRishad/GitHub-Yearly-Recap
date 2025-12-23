import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { HugeiconsIcon } from '@hugeicons/react';
import { SunIcon, MoonIcon } from '@hugeicons/core-free-icons';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative overflow-hidden"
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <AnimatePresence mode="wait" initial={false}>
                {resolvedTheme === 'dark' ? (
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
