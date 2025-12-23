import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire03Icon } from '@hugeicons/core-free-icons';
import type { StreakInfo } from '@/types';

interface StreakDisplayProps {
    longestStreak: StreakInfo;
    currentStreak: StreakInfo;
    className?: string;
}

function formatDateRange(start: string | null, end: string | null): string {
    if (!start || !end) return 'No streak';

    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric'
    };

    if (startDate.getFullYear() !== endDate.getFullYear()) {
        return `${startDate.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' })}`;
    }

    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
}

interface StreakCardProps {
    title: string;
    streak: StreakInfo;
    variant: 'primary' | 'secondary';
    delay?: number;
}

function StreakCard({ title, streak, variant, delay = 0 }: StreakCardProps) {
    const isPrimary = variant === 'primary';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
        >
            <Card
                className={`relative overflow-hidden ${isPrimary
                        ? 'bg-gradient-to-br from-orange-500/10 via-red-500/10 to-yellow-500/10 border-orange-500/20'
                        : 'border-border/50'
                    }`}
            >
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`rounded-lg p-2.5 ${isPrimary
                                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                                    : 'bg-secondary text-muted-foreground'
                                }`}
                        >
                            <HugeiconsIcon icon={Fire03Icon} strokeWidth={2} size={22} />
                        </div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <motion.span
                            className={`text-5xl font-bold tracking-tight ${isPrimary
                                    ? 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 bg-clip-text text-transparent'
                                    : ''
                                }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                        >
                            {streak.count}
                        </motion.span>
                        <span className="text-muted-foreground text-lg">days</span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3">
                        {formatDateRange(streak.startDate, streak.endDate)}
                    </p>
                </CardContent>

                {/* Fire glow effect for primary */}
                {isPrimary && streak.count > 0 && (
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                )}
            </Card>
        </motion.div>
    );
}

export function StreakDisplay({ longestStreak, currentStreak, className = '' }: StreakDisplayProps) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
            <StreakCard
                title="🔥 Longest Streak"
                streak={longestStreak}
                variant="primary"
                delay={0}
            />
            <StreakCard
                title="Current Streak"
                streak={currentStreak}
                variant="secondary"
                delay={0.15}
            />
        </div>
    );
}
