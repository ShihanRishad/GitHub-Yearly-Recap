import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Button } from './button';

interface ErrorToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export function ErrorToast({ message, isVisible, onClose }: ErrorToastProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed z-[100] sm:left-6 sm:bottom-6 left-0 bottom-0 w-full sm:w-auto sm:max-w-md p-4 sm:p-0"
                >
                    <div className="bg-destructive/10 backdrop-blur-xl border border-destructive/20 rounded-2xl sm:rounded-xl p-4 flex items-center gap-4 shadow-2xl relative overflow-hidden group">
                        {/* Ambient Background Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-destructive/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />

                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                            <HugeiconsIcon icon={AlertCircleIcon} size={24} strokeWidth={2} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Error</p>
                            <p className="text-sm text-muted-foreground truncate">{message}</p>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={onClose}
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.5} />
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
