import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { StreakDisplay } from '@/components/recap/streak-display';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar01Icon, CalendarCheckIn01Icon, CalendarCheckOut01Icon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface StreaksSlideProps {
    data: RecapData;
}

export function StreaksSlide({ data }: StreaksSlideProps) {
    const { peakStats } = data;

    return (
        <div className="min-h-[70vh] flex flex-col justify-center py-12 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Streaks & Peaks</h2>
                <p className="text-muted-foreground text-lg">
                    Your consistency game was strong in {data.year}
                </p>
            </motion.div>

            {/* Streak cards */}
            <div className="max-w-3xl mx-auto w-full mb-10">
                <StreakDisplay
                    longestStreak={data.longestStreak}
                    currentStreak={data.currentStreak}
                />
            </div>

            {/* Peak times */}
            <div className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Day */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-border/50 h-full">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                                    <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} size={20} />
                                </div>
                                <h3 className="font-semibold">Best Day</h3>
                            </div>
                            <p className="text-3xl font-bold mb-1">
                                {peakStats.topDay.contributions}
                                <span className="text-lg font-normal text-muted-foreground"> contribs</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(peakStats.topDay.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Week */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="border-border/50 h-full">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                                    <HugeiconsIcon icon={CalendarCheckIn01Icon} strokeWidth={2} size={20} />
                                </div>
                                <h3 className="font-semibold">Best Week</h3>
                            </div>
                            <p className="text-3xl font-bold mb-1">
                                {peakStats.topWeek.contributions}
                                <span className="text-lg font-normal text-muted-foreground"> contribs</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Week of {new Date(peakStats.topWeek.weekStart).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Month */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="border-border/50 h-full">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                                    <HugeiconsIcon icon={CalendarCheckOut01Icon} strokeWidth={2} size={20} />
                                </div>
                                <h3 className="font-semibold">Best Month</h3>
                            </div>
                            <p className="text-3xl font-bold mb-1">
                                {peakStats.topMonth.contributions}
                                <span className="text-lg font-normal text-muted-foreground"> contribs</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {peakStats.topMonth.month} {peakStats.topMonth.year}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Peak hour (if available) */}
            {peakStats.topHour && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-8"
                >
                    <p className="text-muted-foreground">
                        You're most productive at{' '}
                        <span className="font-semibold text-foreground">
                            {peakStats.topHour.hour.toString().padStart(2, '0')}:00
                        </span>{' '}
                        with{' '}
                        <span className="font-semibold text-foreground">
                            {peakStats.topHour.commits} commits
                        </span>{' '}
                        during that hour
                    </p>
                </motion.div>
            )}
        </div>
    );
}
