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

// Updated MiniStatCard with better animation states
function MiniStatCard({
    label,
    value,
    color,
    isActive = false,
    isHighlighted = false // New: for final highlight phase
}: {
    label: string,
    value: string | number,
    color: string,
    isActive?: boolean,
    isHighlighted?: boolean
}) {
    const colorMap: Record<string, string> = {
        purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
        blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
        green: 'text-green-400 border-green-500/30 bg-green-500/10',
        orange: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
        red: 'text-red-400 border-red-500/30 bg-red-500/10',
        cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    };
    const classes = colorMap[color] || colorMap.green;

    // Determine state: active (current focus), highlighted (final show), or settled (dimmed)
    const showFull = isActive || isHighlighted;

    return (
        <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.6 }}
            animate={{
                opacity: showFull ? 1 : 0.4,
                y: 0,
                scale: showFull ? 1.1 : 0.85,
                filter: showFull ? 'blur(0px)' : 'blur(3px)'
            }}
            exit={{ opacity: 0, y: -20, scale: 0.5 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 120, damping: 15 }}
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

    // ViewBox dimensions
    const VB_WIDTH = 600;
    const VB_HEIGHT = 520;
    const VB_CX = VB_WIDTH / 2;  // 300
    const VB_CY = VB_HEIGHT / 2; // 260

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

        // Calculate heatmap dimensions for centering
        const cellSize = 10;
        const gap = 2;
        const totalWeeks = contributionCalendar.weeks.length;
        const heatmapWidth = totalWeeks * (cellSize + gap);
        const heatmapHeight = 7 * (cellSize + gap);

        // Offset to center the heatmap in the viewBox
        const heatmapOffsetX = (VB_WIDTH - heatmapWidth) / 2;
        const heatmapOffsetY = (VB_HEIGHT - heatmapHeight) / 2;

        contributionCalendar.weeks.forEach((week, wIdx) => {
            week.contributionDays.forEach((day: ContributionDay) => {
                const date = new Date(day.date);
                const monthIndex = date.getMonth();
                const monthName = MONTH_FULL[monthIndex];

                const isActiveMonth = monthName === activeMonthName;
                const isActiveWeek = date >= activeWeekStart && date <= activeWeekEnd;
                const isActiveDay = day.date === activeDayDate;

                const isLongestStreak = longestStreak.startDate && longestStreak.endDate &&
                    date >= new Date(longestStreak.startDate) &&
                    date <= new Date(longestStreak.endDate);
                const isCurrentStreak = currentStreak?.startDate && currentStreak?.endDate &&
                    date >= new Date(currentStreak.startDate) &&
                    date <= new Date(currentStreak.endDate);

                // 1. Heatmap Position (CENTERED in viewbox)
                const origX = heatmapOffsetX + wIdx * (cellSize + gap);
                const origY = heatmapOffsetY + day.weekday * (cellSize + gap);

                // 2. Month Grid (Dynamic Layout)
                const monthCols = isPortrait ? 3 : 4;
                const mCol = monthIndex % monthCols;
                const mRow = Math.floor(monthIndex / monthCols);

                const dom = date.getDate();
                const firstDayOfMonth = new Date(date.getFullYear(), monthIndex, 1).getDay();
                const dayOffset = dom + firstDayOfMonth - 1;
                const calRow = Math.floor(dayOffset / 7);
                const calCol = dayOffset % 7;

                // Block dimensions
                const blockW = 145;
                const blockH = 130;

                // Grid offset to center within viewBox
                const gridOffsetX = isPortrait ? 82 : 10;
                const gridOffsetY = 20;

                const blockX = mCol * blockW + gridOffsetX;
                const blockY = mRow * blockH + gridOffsetY;

                const itemX = calCol * (cellSize + 1);
                const itemY = calRow * (cellSize + 1);

                const labelHeight = 25;
                const monthGridX = blockX + itemX + 5;
                const monthGridY = blockY + itemY + labelHeight;

                // Separation offset for 'separate' phase
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

        const calcCenter = (someCells: typeof cells) => {
            if (!someCells.length) return { x: VB_CX, y: VB_CY };
            const minX = Math.min(...someCells.map(c => c.monthGridX));
            const maxX = Math.max(...someCells.map(c => c.monthGridX));
            const minY = Math.min(...someCells.map(c => c.monthGridY));
            const maxY = Math.max(...someCells.map(c => c.monthGridY));
            return { x: (minX + maxX) / 2 + 5, y: (minY + maxY) / 2 + 5 };
        };

        if (cells.some(c => c.isActiveMonth)) {
            const mCells = cells.filter(c => c.isActiveMonth);
            targets['activeMonth'] = calcCenter(mCells);
        }

        const weekCells = cells.filter(c => c.isActiveWeek);
        if (weekCells.length > 0) targets['activeWeek'] = calcCenter(weekCells);

        const dayCell = cells.find(c => c.isActiveDay);
        if (dayCell) {
            targets['activeDay'] = { x: dayCell.monthGridX + 5, y: dayCell.monthGridY + 5 };
        }

        const lCells = cells.filter(c => c.isLongestStreak);
        if (lCells.length > 0) targets['longestStreak'] = calcCenter(lCells);

        const cCells = cells.filter(c => c.isCurrentStreak);
        if (cCells.length > 0) targets['currentStreak'] = calcCenter(cCells);

        ['activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'].forEach(key => {
            if (!targets[key]) targets[key] = { x: VB_CX, y: VB_CY };
        });

        return { cells, targets };
    }, [contributionCalendar, peakStats, longestStreak, currentStreak, isPortrait, VB_CX, VB_CY, VB_WIDTH, VB_HEIGHT]);

    // 2. Camera Logic - Fixed centering with SCALED translation
    // Key insight: When scaling with transform-origin center, the translation must be 
    // multiplied by the scale factor to correctly pan the target to the visual center
    const camera = useMemo(() => {
        switch (phase) {
            case 'heatmap':
                return { x: 0, y: 0, scale: 1.2, rotate: 0 };
            case 'rotate':
                return { x: 0, y: 0, scale: 1.0, rotate: 90 };
            case 'separate':
                return { x: 0, y: 0, scale: 0.8, rotate: 90 };
            case 'grid':
            case 'zoomMonths':
                return { x: 0, y: 0, scale: 1, rotate: 0 };
            case 'activeMonth': {
                const t = processed.targets['activeMonth'];
                const scale = 2.5;
                // Translation multiplied by scale to account for zoom
                return { x: (VB_CX - t.x) * scale, y: (VB_CY - t.y) * scale, scale, rotate: 0 };
            }
            case 'activeWeek': {
                const t = processed.targets['activeWeek'];
                const scale = 4.5;
                return { x: (VB_CX - t.x) * scale, y: (VB_CY - t.y) * scale, scale, rotate: 0 };
            }
            case 'activeDay': {
                const t = processed.targets['activeDay'];
                const scale = 8;
                return { x: (VB_CX - t.x) * scale, y: (VB_CY - t.y) * scale, scale, rotate: 0 };
            }
            case 'longestStreak': {
                const t = processed.targets['longestStreak'];
                const scale = 2.5;
                return { x: (VB_CX - t.x) * scale, y: (VB_CY - t.y) * scale, scale, rotate: 0 };
            }
            case 'currentStreak': {
                const t = processed.targets['currentStreak'];
                const scale = 2.5;
                return { x: (VB_CX - t.x) * scale, y: (VB_CY - t.y) * scale, scale, rotate: 0 };
            }
            default:
                return { x: 0, y: 0, scale: 1, rotate: 0 };
        }
    }, [phase, processed.targets, VB_CX, VB_CY]);

    // 3. Cell Position Logic
    const getCellState = (cell: typeof processed.cells[0]) => {
        if (phase === 'heatmap' || phase === 'rotate') {
            // Already centered via origX/origY
            return { x: cell.origX, y: cell.origY, opacity: 1 };
        }
        if (phase === 'separate') {
            // Add separation between months (horizontal offset)
            return {
                x: cell.origX + cell.separationOffset,
                y: cell.origY,
                opacity: 0.9
            };
        }
        // Grid phase and zoom phases use monthGridX/Y
        return { x: cell.monthGridX, y: cell.monthGridY, opacity: 1 };
    };

    // Determine which stats have been shown
    const statPhases = ['activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'];
    const currentPhaseIdx = statPhases.indexOf(phase);

    // isSettled: phase has passed (card collected but dimmed)
    const isSettled = (p: string) => {
        const pIdx = statPhases.indexOf(p);
        return currentPhaseIdx > pIdx && pIdx >= 0;
    };

    // isActive: currently focused phase
    const isActive = (p: string) => phase === p;

    // isHighlighted: in final showcase phase (after all stats shown, before clock)
    // We treat 'currentStreak' as the last stat phase; after that is 'clock' or end
    const isFinalShowcase = phase === 'clock' || (currentPhaseIdx >= statPhases.length - 1 && !hasCurrentStreak && phase === 'longestStreak');

    return (
        <div className="max-h-[calc(100dvh-4rem)] h-[calc(100dvh-4rem)] mt-16 relative overflow-hidden flex flex-col bg-transparent" ref={containerRef}>

            {/* 1. Stats Row - Improved animation flow */}
            <div className="h-16 w-full flex items-center justify-center gap-3 z-20 translate-y-10">
                <AnimatePresence mode="sync">
                    {(isActive('activeMonth') || isSettled('activeMonth') || isFinalShowcase) && (
                        <MiniStatCard
                            key="month-card"
                            label="Month"
                            value={peakStats.topMonth.month.slice(0, 3)}
                            color="purple"
                            isActive={isActive('activeMonth')}
                            isHighlighted={isFinalShowcase}
                        />
                    )}
                    {(isActive('activeWeek') || isSettled('activeWeek') || isFinalShowcase) && (
                        <MiniStatCard
                            key="week-card"
                            label="Week"
                            value={`${peakStats.topWeek.contributions}`}
                            color="blue"
                            isActive={isActive('activeWeek')}
                            isHighlighted={isFinalShowcase}
                        />
                    )}
                    {(isActive('activeDay') || isSettled('activeDay') || isFinalShowcase) && (
                        <MiniStatCard
                            key="day-card"
                            label="Day"
                            value={`${peakStats.topDay.contributions}`}
                            color="green"
                            isActive={isActive('activeDay')}
                            isHighlighted={isFinalShowcase}
                        />
                    )}
                    {(isActive('longestStreak') || isSettled('longestStreak') || isFinalShowcase) && (
                        <MiniStatCard
                            key="streak-card"
                            label="Streak"
                            value={`${longestStreak.count}d`}
                            color="orange"
                            isActive={isActive('longestStreak')}
                            isHighlighted={isFinalShowcase}
                        />
                    )}
                    {hasCurrentStreak && (isActive('currentStreak') || isFinalShowcase) && (
                        <MiniStatCard
                            key="current-streak-card"
                            label="Current"
                            value={`${currentStreak?.count}d`}
                            color="cyan"
                            isActive={isActive('currentStreak')}
                            isHighlighted={isFinalShowcase}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* 2. Main Stage */}
            <div className="flex-1 relative flex items-center justify-center">
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
                            width={VB_WIDTH}
                            height={VB_HEIGHT}
                            viewBox={`0 0 ${VB_WIDTH} ${VB_HEIGHT}`}
                            className="overflow-visible"
                        >
                            {/* Month Labels */}
                            {['grid', 'zoomMonths', 'activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'].includes(phase) &&
                                processed.cells
                                    .filter((c, i, arr) => arr.findIndex(t => t.monthIndex === c.monthIndex) === i)
                                    .map(m => {
                                        const cols = isPortrait ? 3 : 4;
                                        const col = m.monthIndex % cols;
                                        const row = Math.floor(m.monthIndex / cols);

                                        const blockW = 145;
                                        const blockH = 130;
                                        const gridOffsetX = isPortrait ? 82 : 10;
                                        const gridOffsetY = 20;

                                        const x = (col * blockW + gridOffsetX) + 45;
                                        const y = row * blockH + gridOffsetY + 12;

                                        const isTarget = m.isActiveMonth && ['activeMonth', 'activeWeek', 'activeDay'].includes(phase);

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
                                key="am-spotlight"
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 60, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.8 }}
                                className="text-center bg-background/80 backdrop-blur-md p-4 rounded-xl border border-purple-500/30"
                            >
                                <h3 className="text-2xl font-bold text-purple-500">{peakStats.topMonth.month}</h3>
                                <p className="text-sm">{peakStats.topMonth.contributions} Contributions</p>
                            </motion.div>
                        )}
                        {phase === 'activeWeek' && (
                            <motion.div
                                key="aw-spotlight"
                                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                                animate={{ opacity: 1, y: 100, scale: 1 }}
                                exit={{ opacity: 0, y: 60, scale: 0.8 }}
                                className="text-center bg-background/80 backdrop-blur-md p-4 rounded-xl border border-green-500/30"
                            >
                                <h3 className="text-xl font-bold text-green-500">Most Active Week</h3>
                                <p className="text-sm font-semibold">{formatDateRange(peakStats.topWeek.weekStart, peakStats.topWeek.weekEnd)}</p>
                                <p className="text-2xl font-bold">{peakStats.topWeek.contributions}</p>
                            </motion.div>
                        )}
                        {phase === 'activeDay' && (
                            <motion.div
                                key="ad-spotlight"
                                initial={{ opacity: 0, y: 80, scale: 0.9 }}
                                animate={{ opacity: 1, y: 100, scale: 1 }}
                                exit={{ opacity: 0, y: 60, scale: 0.8 }}
                                className="text-center bg-background/80 backdrop-blur-md p-4 rounded-xl border border-green-500/30"
                            >
                                <h3 className="text-xl font-bold text-green-500">Best Day</h3>
                                <p className="text-sm font-semibold">{new Date(peakStats.topDay.date).toDateString()}</p>
                                <p className="text-2xl font-bold">{peakStats.topDay.contributions}</p>
                            </motion.div>
                        )}
                        {phase === 'longestStreak' && (
                            <motion.div
                                key="ls-spotlight"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bottom-24"
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
                                key="cs-spotlight"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bottom-24"
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
