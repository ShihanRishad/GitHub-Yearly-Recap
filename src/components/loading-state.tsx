import { motion } from 'framer-motion';


interface LoadingStateProps {
    message?: string;
    subMessage?: string;
    currentStep?: string;
    error?: string;
}

const loadingSteps = [
    'Fetching your GitHub data...',
    'Calculating your streaks & stats...',
    'Generating AI commentary with Gemini...',
    'Generating shareable recap image...',
    'Finalizing & saving your recap...',
];

export function LoadingState({
    message = 'Loading your GitHub Recap...',
    subMessage = 'This might take a moment',
    currentStep,
    error,
}: LoadingStateProps) {
    const activeIndex = currentStep ? loadingSteps.indexOf(currentStep) : -1;
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            {/* Animated spinner */}
            {/* 3-dot simple loader */}
            <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-4 h-4 rounded-full bg-primary"
                        animate={{
                            y: [-10, 0, -10],
                            opacity: [1, 0.5, 1],
                            scale: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </motion.div>

            {/* Messages */}
            <div className="text-center flex flex-col items-center justify-center space-y-2 max-w-md px-6">
                <motion.h2
                    className={`text-xl font-semibold ${error ? 'text-destructive' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {error ? 'Something went wrong' : (currentStep || message)}
                </motion.h2>
                <motion.p
                    className="text-muted-foreground break-words"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {error || subMessage}
                </motion.p>
            </div>

            {/* Progress steps */}
            {!error && (
                <motion.div
                    className="flex flex-col gap-2 text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {loadingSteps.map((msg, index) => {
                        const isCompleted = activeIndex > index;
                        const isActive = activeIndex === index;

                        return (
                            <motion.div
                                key={msg}
                                className={`flex items-center gap-2 transition-colors duration-300 ${isActive ? 'text-primary font-medium' :
                                    isCompleted ? 'text-green-500/80' : 'opacity-40'
                                    }`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary animate-pulse' :
                                    isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
                                    }`} />
                                <span>{msg}</span>
                                {isCompleted && <span className="text-[10px]">✓</span>}
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

        </div>
    );
}
