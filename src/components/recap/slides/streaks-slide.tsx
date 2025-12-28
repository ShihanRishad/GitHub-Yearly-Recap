import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedClock } from '@/components/recap/animated-clock';
import { useTheme } from '@/components/theme-provider';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Fire03Icon } from '@hugeicons/core-free-icons';
import { useStreaksController } from '../use-streaks-controller';
import type { RecapData, ContributionDay } from '@/types';

interface StreaksSlideProps {
    data: RecapData;
    isPaused: boolean;
}

// GitHub contribution colors
const DARK_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const LIGHT_COLORS = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }
    return 'Multiple years';
}

function MiniStatCard({ label, value, color, delay = 0, isActive = false }: { label: string, value: string | number, color: string, delay?: number, isActive?: boolean }) {
    const colorMap: Record<string, string> = {
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        green: 'text-green-400 border-green-500/30 bg-green-500/10',
        orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
        red: 'text-red-400 border-red-500/30 bg-red-500/10',
    };
    const classes = colorMap[color] || colorMap.green;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{
                opacity: isActive ? 1 : 0.5,
                y: 0,
                scale: isActive ? 1.05 : 0.9,
                filter: isActive ? 'blur(0px)' : 'blur(0.5px)'
            }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            className={`border ${classes} rounded-lg px-3 py-1.5 flex flex-col items-center min-w-[80px]`}
        >
            <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
            <span className="text-sm font-bold">{value}</span>
        </motion.div>
    );
}

export function StreaksSlide({ data, isPaused }: StreaksSlideProps) {
    const { isDark } = useTheme();
    const { peakStats, longestStreak, currentStreak, contributionCalendar } = data;
    const containerRef = useRef<HTMLDivElement>(null);

    // --- Dynamic Layout State ---
    const [isPortrait, setIsPortrait] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };
        // Initial check
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const hasCurrentStreak = !!currentStreak && currentStreak.count > 0;
    const hasTopHour = !!peakStats.topHour;

    const { phase } = useStreaksController({
        isPaused,
        hasCurrentStreak,
        hasTopHour
    });

    // 1. Process Data
    const processed = useMemo(() => {
        const cells: Array<{
            date: string;
            count: number;
            origX: number;
            origY: number;
            monthGridX: number;
            monthGridY: number;
            monthIndex: number;
            monthName: string;
            isActiveMonth: boolean;
            isActiveWeek: boolean;
            isActiveDay: boolean;
            isLongestStreak: boolean;
            isCurrentStreak: boolean;
            weekIndex: number;
            dayIndex: number;
            separationOffset: number;
        }> = [];

        const activeMonthName = peakStats.topMonth.month;
        const activeWeekStart = new Date(peakStats.topWeek.weekStart);
        const activeWeekEnd = new Date(peakStats.topWeek.weekEnd);
        const activeDayDate = peakStats.topDay.date;

        contributionCalendar.weeks.forEach((week, wIdx) => {
            week.contributionDays.forEach((day: ContributionDay) => {
                const date = new Date(day.date);
                const monthIndex = date.getMonth();
                const monthName = MONTH_FULL[monthIndex];

                // Allow targets to be outside the Top Month
                const isActiveMonth = monthName === activeMonthName;
                const isActiveWeek = date >= activeWeekStart && date <= activeWeekEnd;
                const isActiveDay = day.date === activeDayDate;

                const isLongestStreak = longestStreak.startDate && longestStreak.endDate &&
                    date >= new Date(longestStreak.startDate) &&
                    date <= new Date(longestStreak.endDate);
                const isCurrentStreak = currentStreak?.startDate && currentStreak?.endDate &&
                    date >= new Date(currentStreak.startDate) &&
                    date <= new Date(currentStreak.endDate);

                // --- POSITIONS ---
                const cellSize = 10;
                const gap = 2; // Gap between cells within a month

                // 1. Heatmap (Compact Grid)
                const origX = wIdx * (cellSize + gap);
                const origY = day.weekday * (cellSize + gap);

                // 2. Month Grid (Dynamic Layout)
                const monthCols = isPortrait ? 3 : 4;

                const mCol = monthIndex % monthCols;
                const mRow = Math.floor(monthIndex / monthCols);

                const dom = date.getDate();
                const firstDayOfMonth = new Date(date.getFullYear(), monthIndex, 1).getDay();

                const dayOffset = dom + firstDayOfMonth - 1;
                const calRow = Math.floor(dayOffset / 7);
                const calCol = dayOffset % 7;

                // --- NEW DIMENSIONS ---
                // Block W: 145px (increased from 125)
                // Block H: 130px (increased from 85)
                const blockW = 145;
                const blockH = 130;

                // Centers calculation for 600x520 ViewBox
                // Landscape (4x3): 4 * 145 = 580. Left margin = (600-580)/2 = 10.
                // Portrait (3x4): 3 * 145 = 435. Left margin = (600-435)/2 = 82.5.
                const gridOffsetX = isPortrait ? 82 : 10;
                const gridOffsetY = 20;

                const blockX = mCol * blockW + gridOffsetX;
                const blockY = mRow * blockH + gridOffsetY;

                const itemX = calCol * (cellSize + 1);
                const itemY = calRow * (cellSize + 1);

                // Add vertical offset for label
                const labelHeight = 25;
                const monthGridX = blockX + itemX + 5; // +5 padding inside block
                const monthGridY = blockY + itemY + labelHeight;

                // Separation Offset:
                // Add vertical gap between months during 'separate' phase (-90deg).
                const separationOffset = monthIndex * 15;

                cells.push({
                    date: day.date,
                    count: day.contributionCount,
                    origX,
                    origY,
                    monthGridX,
                    monthGridY,
                    monthIndex,
                    monthName,
                    isActiveMonth,
                    isActiveWeek,
                    isActiveDay,
                    isLongestStreak: !!isLongestStreak,
                    isCurrentStreak: !!isCurrentStreak,
                    weekIndex: wIdx,
                    dayIndex: day.weekday,
                    separationOffset
                });
            });
        });

        // --- CALCULATE CENTROIDS ---
        const targets: Record<string, { x: number, y: number }> = {};

        // Helper to calc center of valid cells
        const calcCenter = (someCells: typeof cells) => {
            if (!someCells.length) return { x: 300, y: 260 };
            const minX = Math.min(...someCells.map(c => c.monthGridX));
            const maxX = Math.max(...someCells.map(c => c.monthGridX));
            const minY = Math.min(...someCells.map(c => c.monthGridY));
            const maxY = Math.max(...someCells.map(c => c.monthGridY));
            return { x: (minX + maxX) / 2 + 5, y: (minY + maxY) / 2 + 5 };
        };

        // 1. Active Month (Block Center)
        if (cells.some(c => c.isActiveMonth)) {
            const mCells = cells.filter(c => c.isActiveMonth);
            // Use the centroid of the cells for better zooming info
            targets['activeMonth'] = calcCenter(mCells);
        }

        // 2. Active Week
        const weekCells = cells.filter(c => c.isActiveWeek);
        if (weekCells.length > 0) targets['activeWeek'] = calcCenter(weekCells);

        // 3. Active Day
        const dayCell = cells.find(c => c.isActiveDay);
        if (dayCell) {
            targets['activeDay'] = { x: dayCell.monthGridX + 5, y: dayCell.monthGridY + 5 };
        }

        // 4. Streaks
        const lCells = cells.filter(c => c.isLongestStreak);
        if (lCells.length > 0) targets['longestStreak'] = calcCenter(lCells);

        const cCells = cells.filter(c => c.isCurrentStreak);
        if (cCells.length > 0) targets['currentStreak'] = calcCenter(cCells);

        // Fallback
        ['activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'].forEach(key => {
            if (!targets[key]) targets[key] = { x: 300, y: 260 };
        });

        return { cells, targets };
    }, [contributionCalendar, peakStats, longestStreak, currentStreak, isPortrait]);

    // 2. Camera Logic
    const camera = useMemo(() => {
        // Center of new ViewBox 600x520
        const cx = 300;
        const cy = 260;

        switch (phase) {
            case 'heatmap':
                return { x: 0, y: 0, scale: 1.4, rotate: 0 };
            case 'rotate':
                return { x: 0, y: 100, scale: 1.2, rotate: -90 };
            case 'separate':
                return { x: 0, y: 100, scale: 0.9, rotate: -90 };
            case 'grid':
            case 'zoomMonths':
                return { x: 0, y: 0, scale: 1, rotate: 0 };
            case 'activeMonth':
                const tM = processed.targets['activeMonth'];
                return { x: cx - tM.x, y: cy - tM.y, scale: 2.5, rotate: 0 };
            case 'activeWeek':
                const tW = processed.targets['activeWeek'];
                return { x: cx - tW.x, y: cy - tW.y, scale: 4.5, rotate: 0 };
            case 'activeDay':
                const tD = processed.targets['activeDay'];
                return { x: cx - tD.x, y: cy - tD.y, scale: 8, rotate: 0 };
            case 'longestStreak':
                const tL = processed.targets['longestStreak'];
                return { x: cx - tL.x, y: cy - tL.y, scale: 2.5, rotate: 0 };
            case 'currentStreak':
                const tC = processed.targets['currentStreak'];
                return { x: cx - tC.x, y: cy - tC.y, scale: 2.5, rotate: 0 };
            default:
                return { x: 0, y: 0, scale: 1, rotate: 0 };
        }
    }, [phase, processed.targets]);

    // 3. Cell Position Logic
    const getCellState = (cell: typeof processed.cells[0]) => {
        if (phase === 'heatmap' || phase === 'rotate') {
            return { x: cell.origX - 120, y: cell.origY + 40, opacity: 1 };
        }
        if (phase === 'separate') {
            return {
                x: cell.origX - 120 + cell.separationOffset,
                y: cell.origY + 40,
                opacity: 0.9
            };
        }
        return { x: cell.monthGridX, y: cell.monthGridY, opacity: 1 };
    };

    const isSettled = (p: string) => {
        const order = ['activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'];
        const currIdx = order.indexOf(phase);
        const pIdx = order.indexOf(p);
        return currIdx >= pIdx;
    };

    return (
        <div className="h-[calc(100dvh-4rem)] relative overflow-hidden flex flex-col bg-transparent" ref={containerRef}>

            {/* 1. Settled Stats Row */}
            <div className="h-16 w-full flex items-center justify-center gap-2 z-20 mt-2">
                <AnimatePresence>
                    {(phase === 'activeMonth' || isSettled('activeMonth')) && (
                        <MiniStatCard
                            label="Month"
                            value={peakStats.topMonth.month.slice(0, 3)}
                            color="purple"
                            isActive={phase === 'activeMonth'}
                        />
                    )}
                    {(phase === 'activeWeek' || isSettled('activeWeek')) && (
                        <MiniStatCard
                            label="Week"
                            value={`${peakStats.topWeek.contributions}`}
                            color="blue"
                            isActive={phase === 'activeWeek'}
                        />
                    )}
                    {(phase === 'activeDay' || isSettled('activeDay')) && (
                        <MiniStatCard
                            label="Day"
                            value={`${peakStats.topDay.contributions}`}
                            color="green"
                            isActive={phase === 'activeDay'}
                        />
                    )}
                    {(phase === 'longestStreak' || isSettled('longestStreak')) && (
                        <MiniStatCard
                            label="Streak"
                            value={`${longestStreak.count}d`}
                            color="orange"
                            isActive={phase === 'longestStreak'}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Main Stage */}
            <div className="flex-1 relative flex items-center justify-center -mt-10">
                {phase !== 'clock' && (
                    <motion.div
                        className="w-full h-full flex items-center justify-center transform-gpu"
                        animate={{
                            scale: camera.scale,
                            rotate: camera.rotate,
                            x: camera.x,
                            y: camera.y
                        }}
                        transition={{
                            duration: 1.2,
                            ease: [0.16, 1, 0.3, 1]
                        }}
                        style={{ transformOrigin: 'center center' }}
                    >
                        <svg
                            width="600"
                            height="520"
                            viewBox="0 0 600 520"
                            className="overflow-visible"
                        >
                            {/* Month Labels */}
                            {['grid', 'zoomMonths', 'activeMonth'].includes(phase) &&
                                processed.cells
                                    .filter((c, i, arr) => arr.findIndex(t => t.monthIndex === c.monthIndex) === i)
                                    .map(m => {
                                        // Re-calc label pos based on grid blocks matching stored cells
                                        const cols = isPortrait ? 3 : 4;
                                        const col = m.monthIndex % cols;
                                        const row = Math.floor(m.monthIndex / cols);

                                        const blockW = 145;
                                        const blockH = 130;
                                        const gridOffsetX = isPortrait ? 82 : 10;
                                        const gridOffsetY = 20;

                                        // Text centered in block. 
                                        // Grid inside is ~80px wide. Block is 145.
                                        // Let's align text to the grid start + margin
                                        // Grid starts at relative X=5.
                                        // Let's center it roughly around the grid content 
                                        const x = (col * blockW + gridOffsetX) + 40 + 5;
                                        const y = row * blockH + gridOffsetY + 10;

                                        const isTarget = m.isActiveMonth && phase === 'activeMonth';

                                        return (
                                            <motion.text
                                                key={`lbl-${m.monthIndex}`}
                                                x={x}
                                                y={y}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: isTarget ? 1 : 0.5 }}
                                                className="text-[10px] uppercase font-bold fill-current"
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill={isDark ? '#aaa' : '#555'}
                                            >
                                                {m.monthIndex + 1}. {m.monthName.slice(0, 3)}
                                            </motion.text>
                                        );
                                    })
                            }

                            {/* Cells */}
                            {processed.cells.map((cell, i) => {
                                const pos = getCellState(cell);
                                const color = getColor(cell.count, isDark);

                                let opacity = pos.opacity;
                                if (phase.startsWith('active')) {
                                    if (phase === 'activeMonth' && !cell.isActiveMonth) opacity = 0.1;
                                    if (phase === 'activeWeek' && !cell.isActiveWeek) opacity = 0.1;
                                    if (phase === 'activeDay' && !cell.isActiveDay) opacity = 0.1;
                                }
                                if (phase.endsWith('Streak')) {
                                    if (phase === 'longestStreak' && !cell.isLongestStreak) opacity = 0.1;
                                    if (phase === 'currentStreak' && !cell.isCurrentStreak) opacity = 0.1;
                                }

                                return (
                                    <motion.rect
                                        key={`c-${i}`}
                                        width={10}
                                        height={10}
                                        rx={2}
                                        fill={color}
                                        initial={false}
                                        animate={{
                                            x: pos.x,
                                            y: pos.y,
                                            opacity: opacity
                                        }}
                                        transition={{
                                            duration: 1.0,
                                            type: "spring",
                                            stiffness: 70,
                                            damping: 20
                                        }}
                                    />
                                );
                            })}
                        </svg>
                    </motion.div>
                )}

                {/* 3. Spotlights */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <AnimatePresence>
                        {phase === 'activeMonth' && (
                            <motion.div
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 80 }}
                                exit={{ opacity: 0 }}
                                className="text-center bg-background/80 backdrop-blur-md p-4 rounded-xl border border-purple-500/30"
                            >
                                <h3 className="text-2xl font-bold text-purple-500">{peakStats.topMonth.month}</h3>
                                <p className="text-sm">{peakStats.topMonth.contributions} Contributions</p>
                            </motion.div>
                        )}
                        {phase === 'activeDay' && (
                            <motion.div
                                key="ad-card"
                                initial={{ opacity: 0, y: 120 }}
                                animate={{ opacity: 1, y: 120 }}
                                exit={{ opacity: 0 }}
                                className="text-center bg-background/80 backdrop-blur-md p-4 rounded-xl border border-green-500/30 mt-20"
                            >
                                <h3 className="text-xl font-bold text-green-500">Best Day</h3>
                                <p className="text-sm font-semibold">{new Date(peakStats.topDay.date).toDateString()}</p>
                                <p className="text-2xl font-bold">{peakStats.topDay.contributions}</p>
                            </motion.div>
                        )}
                        {phase === 'longestStreak' && (
                            <motion.div
                                key="ls-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-20"
                            >
                                <Card className="border-orange-500/50 bg-background/90 min-w-[200px]">
                                    <CardContent className="p-4 text-center">
                                        <div className="flex justify-center mb-2">
                                            <HugeiconsIcon icon={Fire03Icon} className="text-orange-500 w-6 h-6" />
                                        </div>
                                        <p className="text-3xl font-black text-orange-500">{longestStreak.count}</p>
                                        <p className="text-xs text-muted-foreground">DAY STREAK</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDateRange(longestStreak.startDate, longestStreak.endDate)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                        {phase === 'currentStreak' && currentStreak && (
                            <motion.div
                                key="cs-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-20"
                            >
                                <Card className="border-cyan-500/50 bg-background/90 min-w-[200px]">
                                    <CardContent className="p-4 text-center">
                                        <div className="flex justify-center mb-2">
                                            <HugeiconsIcon icon={Fire03Icon} className="text-cyan-500 w-6 h-6" />
                                        </div>
                                        <p className="text-3xl font-black text-cyan-500">{currentStreak.count}</p>
                                        <p className="text-xs text-muted-foreground">CURRENT STREAK</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDateRange(currentStreak.startDate, currentStreak.endDate)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 4. Clock */}
                {phase === 'clock' && peakStats.topHour && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-background z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AnimatedClock
                            hour={peakStats.topHour.hour}
                            commits={peakStats.topHour.commits}
                            isAnimating={true}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
