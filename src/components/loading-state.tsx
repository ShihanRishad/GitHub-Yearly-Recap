import { motion } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading02Icon } from '@hugeicons/core-free-icons';

interface LoadingStateProps {
    message?: string;
    subMessage?: string;
}

const loadingMessages = [
    'Fetching your GitHub data...',
    'Calculating your streaks...',
    'Analyzing your contributions...',
    'Computing top languages...',
    'Generating your recap...',
];

export function LoadingState({
    message = 'Loading your GitHub Recap...',
    subMessage = 'This might take a moment',
}: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            {/* Animated spinner */}
            <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl" />

                {/* Spinning icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative z-10"
                >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <HugeiconsIcon icon={Loading02Icon} strokeWidth={2} size={32} className="text-white" />
                    </div>
                </motion.div>

                {/* Pulsing ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/50"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>

            {/* Messages */}
            <div className="text-center space-y-2">
                <motion.h2
                    className="text-xl font-semibold"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {message}
                </motion.h2>
                <motion.p
                    className="text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {subMessage}
                </motion.p>
            </div>

            {/* Progress steps */}
            <motion.div
                className="flex flex-col gap-2 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {loadingMessages.map((msg, index) => (
                    <motion.div
                        key={msg}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 0.6, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.15 }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                        <span>{msg}</span>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
