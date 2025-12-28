import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire03Icon } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedClock } from '@/components/recap/animated-clock';
import { useTheme } from '@/components/theme-provider';
import type { RecapData, ContributionDay } from '@/types';

interface StreaksSlideProps {
    data: RecapData;
}

// Animation phases
type Phase =
    | 'heatmap'       // Full heatmap view
    | 'months'        // Cells group into month blocks
    | 'activeMonth'   // Zoom to most active month
    | 'activeWeek'    // Highlight most active week within month
    | 'activeDay'     // Highlight most active day
    | 'streaks'       // Show streak cards
    | 'clock'         // Animated clock
    | 'final';        // All settled

const PHASE_ORDER: Phase[] = ['heatmap', 'months', 'activeMonth', 'activeWeek', 'activeDay', 'streaks', 'clock', 'final'];
const PHASE_DURATIONS: Record<Phase, number> = {
    heatmap: 1500,
    months: 2000,
    activeMonth: 2500,
    activeWeek: 2500,
    activeDay: 2500,
    streaks: 3000,
    clock: 4500,
    final: 999999,
};

// GitHub contribution colors
const DARK_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const LIGHT_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

function getContributionLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
}

function getColor(count: number, isDark: boolean): string {
    const level = getContributionLevel(count);
    return isDark ? DARK_COLORS[level] : LIGHT_COLORS[level];
}

function formatDateRange(start: string | null, end: string | null): string {
    if (!start || !end) return 'No streak';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
}

// Mini stat card for settled state
interface MiniStatCardProps {
    label: string;
    value: string | number;
    color: string;
}

function MiniStatCard({ label, value, color }: MiniStatCardProps) {
    const colorMap: Record<string, string> = {
        purple: 'text-purple-400 border-purple-500/30',
        blue: 'text-blue-400 border-blue-500/30',
        green: 'text-green-400 border-green-500/30',
        orange: 'text-orange-400 border-orange-500/30',
        red: 'text-red-400 border-red-500/30',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 0.6, y: 0, scale: 0.85 }}
            className="pointer-events-none"
            style={{ filter: 'blur(0.5px)' }}
        >
            <div className={`border ${colorMap[color]} rounded-lg px-2 py-1 bg-card/50`}>
                <p className="text-[9px] text-muted-foreground">{label}</p>
                <p className={`text-xs font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
            </div>
        </motion.div>
    );
}

export function StreaksSlide({ data }: StreaksSlideProps) {
    const { isDark } = useTheme();
    const { peakStats, longestStreak, currentStreak, contributionCalendar } = data;
    const [phase, setPhase] = useState<Phase>('heatmap');
    const [clockAnimating, setClockAnimating] = useState(false);

    // Process calendar data into cells with month info
    const processedCells = useMemo(() => {
        const cells: Array<{
            date: string;
            count: number;
            weekIndex: number;
            dayIndex: number;
            month: string;
            monthNum: number;
            weekday: number;
            isActiveMonth: boolean;
            isActiveWeek: boolean;
            isActiveDay: boolean;
        }> = [];

        const activeMonth = peakStats.topMonth.month;
        const activeWeekStart = peakStats.topWeek.weekStart;
        const activeWeekEnd = peakStats.topWeek.weekEnd;
        const activeDayDate = peakStats.topDay.date;

        contributionCalendar.weeks.forEach((week, weekIndex) => {
            week.contributionDays.forEach((day: ContributionDay) => {
                const date = new Date(day.date);
                const month = date.toLocaleDateString('en-US', { month: 'long' });
                const monthNum = date.getMonth();

                const isActiveMonth = month === activeMonth;
                const dayDate = new Date(day.date);
                const weekStartDate = new Date(activeWeekStart);
                const weekEndDate = new Date(activeWeekEnd);
                const isActiveWeek = isActiveMonth && dayDate >= weekStartDate && dayDate <= weekEndDate;
                const isActiveDay = day.date === activeDayDate;

                cells.push({
                    date: day.date,
                    count: day.contributionCount,
                    weekIndex,
                    dayIndex: day.weekday,
                    month,
                    monthNum,
                    weekday: day.weekday,
                    isActiveMonth,
                    isActiveWeek,
                    isActiveDay,
                });
            });
        });

        return cells;
    }, [contributionCalendar, peakStats]);

    // Group cells by month
    const monthGroups = useMemo(() => {
        const groups: Record<string, typeof processedCells> = {};
        processedCells.forEach(cell => {
            if (!groups[cell.month]) groups[cell.month] = [];
            groups[cell.month].push(cell);
        });
        return groups;
    }, [processedCells]);

    // Auto-advance phases
    useEffect(() => {
        if (phase === 'final') return;

        const duration = PHASE_DURATIONS[phase];
        const timer = setTimeout(() => {
            const currentIndex = PHASE_ORDER.indexOf(phase);
            if (currentIndex < PHASE_ORDER.length - 1) {
                const nextPhase = PHASE_ORDER[currentIndex + 1];
                setPhase(nextPhase);
                if (nextPhase === 'clock') setClockAnimating(true);
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [phase]);

    // Calculate cell position based on phase
    const getCellStyle = useCallback((cell: typeof processedCells[0], phaseState: Phase) => {
        const baseSize = 8;
        const gap = 2;

        // Heatmap phase - normal grid layout
        if (phaseState === 'heatmap') {
            return {
                x: cell.weekIndex * (baseSize + gap),
                y: cell.dayIndex * (baseSize + gap),
                opacity: 1,
                scale: 1,
            };
        }

        // Months phase - group into month blocks (3 rows x 4 cols arrangement)
        if (phaseState === 'months') {
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIdx = monthOrder.indexOf(cell.month);
            if (monthIdx === -1) return { x: 0, y: 0, opacity: 0.3, scale: 1 };

            const col = monthIdx % 4;
            const row = Math.floor(monthIdx / 4);
            const blockWidth = 70;
            const blockHeight = 50;

            // Position within month block
            const cellsInMonth = monthGroups[cell.month] || [];
            const cellIdx = cellsInMonth.indexOf(cell);
            const cellCol = cellIdx % 7;
            const cellRow = Math.floor(cellIdx / 7);

            return {
                x: col * blockWidth + cellCol * (baseSize + 1) + 10,
                y: row * blockHeight + cellRow * (baseSize + 1) + 10,
                opacity: 1,
                scale: 1,
            };
        }

        // Active month phase - highlight active month
        if (phaseState === 'activeMonth' || phaseState === 'activeWeek' || phaseState === 'activeDay') {
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            const monthIdx = monthOrder.indexOf(cell.month);
            const col = monthIdx % 4;
            const row = Math.floor(monthIdx / 4);
            const blockWidth = 70;
            const blockHeight = 50;

            const cellsInMonth = monthGroups[cell.month] || [];
            const cellIdx = cellsInMonth.indexOf(cell);
            const cellCol = cellIdx % 7;
            const cellRow = Math.floor(cellIdx / 7);

            let opacity = cell.isActiveMonth ? 1 : 0.15;
            let scale = cell.isActiveMonth ? 1.1 : 0.9;

            // Week highlight
            if (phaseState === 'activeWeek' || phaseState === 'activeDay') {
                if (cell.isActiveWeek) {
                    opacity = 1;
                    scale = 1.2;
                } else if (cell.isActiveMonth) {
                    opacity = 0.4;
                    scale = 1;
                }
            }

            // Day highlight
            if (phaseState === 'activeDay') {
                if (cell.isActiveDay) {
                    opacity = 1;
                    scale = 1.5;
                } else if (cell.isActiveWeek) {
                    opacity = 0.5;
                    scale = 1.1;
                }
            }

            return {
                x: col * blockWidth + cellCol * (baseSize + 1) + 10,
                y: row * blockHeight + cellRow * (baseSize + 1) + 10,
                opacity,
                scale,
            };
        }

        // Later phases - fade out heatmap
        return { x: 0, y: 0, opacity: 0, scale: 0.5 };
    }, [monthGroups]);

    // Which settled cards to show
    const phaseIndex = PHASE_ORDER.indexOf(phase);
    const showMonthCard = phaseIndex >= PHASE_ORDER.indexOf('activeWeek');
    const showWeekCard = phaseIndex >= PHASE_ORDER.indexOf('activeDay');
    const showDayCard = phaseIndex >= PHASE_ORDER.indexOf('streaks');
    const showStreakCards = phaseIndex >= PHASE_ORDER.indexOf('clock');
    const showClock = phaseIndex >= PHASE_ORDER.indexOf('clock');
    const hideHeatmap = phaseIndex >= PHASE_ORDER.indexOf('streaks');

    return (
        <div className="h-[calc(100dvh-4rem)] flex flex-col overflow-hidden px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-3 shrink-0"
            >
                <h2 className="text-xl md:text-2xl font-bold">Streaks & Peaks</h2>
                <p className="text-muted-foreground text-xs">
                    Your consistency in {data.year}
                </p>
            </motion.div>

            {/* Settled cards row */}
            <div className="flex justify-center gap-2 py-2 shrink-0 min-h-[40px]">
                <AnimatePresence>
                    {showMonthCard && (
                        <MiniStatCard
                            key="month"
                            label="Best Month"
                            value={`${peakStats.topMonth.contributions}`}
                            color="purple"
                        />
                    )}
                    {showWeekCard && (
                        <MiniStatCard
                            key="week"
                            label="Best Week"
                            value={`${peakStats.topWeek.contributions}`}
                            color="blue"
                        />
                    )}
                    {showDayCard && (
                        <MiniStatCard
                            key="day"
                            label="Best Day"
                            value={`${peakStats.topDay.contributions}`}
                            color="green"
                        />
                    )}
                    {showStreakCards && (
                        <>
                            <MiniStatCard
                                key="longest"
                                label="Longest Streak"
                                value={`${longestStreak.count}d`}
                                color="orange"
                            />
                            <MiniStatCard
                                key="current"
                                label="Current Streak"
                                value={`${currentStreak.count}d`}
                                color="red"
                            />
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center relative min-h-0">
                {/* Animated heatmap */}
                <AnimatePresence>
                    {!hideHeatmap && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <svg
                                width={300}
                                height={160}
                                viewBox="0 0 300 160"
                                className="max-w-full h-auto"
                            >
                                {processedCells.map((cell) => {
                                    const style = getCellStyle(cell, phase);
                                    return (
                                        <motion.rect
                                            key={cell.date}
                                            width={8}
                                            height={8}
                                            rx={1.5}
                                            fill={getColor(cell.count, isDark)}
                                            initial={false}
                                            animate={{
                                                x: style.x,
                                                y: style.y,
                                                opacity: style.opacity,
                                                scale: style.scale,
                                            }}
                                            transition={{
                                                duration: 0.6,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Phase labels */}
                            <AnimatePresence mode="wait">
                                {phase === 'activeMonth' && (
                                    <motion.div
                                        key="month-label"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-8 left-0 right-0 text-center"
                                    >
                                        <p className="text-sm font-semibold text-purple-400">
                                            {peakStats.topMonth.month}: {peakStats.topMonth.contributions} contributions
                                        </p>
                                    </motion.div>
                                )}
                                {phase === 'activeWeek' && (
                                    <motion.div
                                        key="week-label"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-8 left-0 right-0 text-center"
                                    >
                                        <p className="text-sm font-semibold text-blue-400">
                                            Best Week: {peakStats.topWeek.contributions} contributions
                                        </p>
                                    </motion.div>
                                )}
                                {phase === 'activeDay' && (
                                    <motion.div
                                        key="day-label"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-8 left-0 right-0 text-center"
                                    >
                                        <p className="text-sm font-semibold text-green-400">
                                            Best Day: {peakStats.topDay.contributions} contributions on {peakStats.topDay.dayOfWeek}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Streaks phase content */}
                <AnimatePresence>
                    {phase === 'streaks' && (
                        <motion.div
                            key="streaks"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 gap-3 max-w-xs"
                        >
                            <Card className="border-orange-500/30 border">
                                <CardContent className="p-3 text-center">
                                    <div className="inline-flex rounded-lg bg-orange-500/10 p-1.5 text-orange-500 mb-2">
                                        <HugeiconsIcon icon={Fire03Icon} strokeWidth={2} size={16} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">🔥 Longest</p>
                                    <p className="text-2xl font-bold text-orange-500">{longestStreak.count}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatDateRange(longestStreak.startDate, longestStreak.endDate)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-border/50">
                                <CardContent className="p-3 text-center">
                                    <div className="inline-flex rounded-lg bg-secondary p-1.5 text-muted-foreground mb-2">
                                        <HugeiconsIcon icon={Fire03Icon} strokeWidth={2} size={16} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Current</p>
                                    <p className="text-2xl font-bold">{currentStreak.count}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {formatDateRange(currentStreak.startDate, currentStreak.endDate)}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Clock phase content */}
                <AnimatePresence>
                    {(phase === 'clock' || phase === 'final') && peakStats.topHour && (
                        <motion.div
                            key="clock"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <AnimatedClock
                                hour={peakStats.topHour.hour}
                                commits={peakStats.topHour.commits}
                                isAnimating={clockAnimating}
                                onAnimationComplete={() => setClockAnimating(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Phase indicator */}
            <div className="flex justify-center gap-1 py-2 shrink-0">
                {PHASE_ORDER.slice(0, -1).map((p, i) => (
                    <div
                        key={p}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${PHASE_ORDER.indexOf(phase) >= i ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
