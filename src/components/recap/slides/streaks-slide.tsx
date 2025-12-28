import { useRef, useMemo } from 'react';
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

// const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

// Helper to format date range for streaks
function formatDateRange(start: string | null, end: string | null): string {
    if (!start || !end) return 'No streak';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    // If same year
    if (startDate.getFullYear() === endDate.getFullYear()) {
        return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }
    return 'Multiple years';
}

export function StreaksSlide({ data, isPaused }: StreaksSlideProps) {
    const { isDark } = useTheme();
    const { peakStats, longestStreak, currentStreak, contributionCalendar } = data;
    const containerRef = useRef<HTMLDivElement>(null);

    const hasCurrentStreak = !!currentStreak && currentStreak.count > 0;
    const hasTopHour = !!peakStats.topHour;

    const { phase } = useStreaksController({
        isPaused,
        hasCurrentStreak,
        hasTopHour
    });

    // 1. Process Data & Calculate Positions
    const processed = useMemo(() => {
        const cells: Array<{
            date: string;
            count: number;
            // Original Grid Positions
            origX: number;
            origY: number;
            // Month Grid Positions
            monthGridX: number;
            monthGridY: number;
            // Metadata
            monthIndex: number; // 0-11
            monthName: string;
            isActiveMonth: boolean;
            isActiveWeek: boolean;
            isActiveDay: boolean;
            isLongestStreak: boolean;
            isCurrentStreak: boolean;
        }> = [];

        // Targets for camera focus
        const targets: Record<string, { x: number, y: number }> = {};

        //   const activeMonthIndex = new Date(peakStats.topMonth.year, MONTH_FULL.indexOf(peakStats.topMonth.month)).getMonth();
        const activeWeekStart = new Date(peakStats.topWeek.weekStart);
        const activeWeekEnd = new Date(peakStats.topWeek.weekEnd);
        const activeDayDate = peakStats.topDay.date;

        // Flatten weeks
        contributionCalendar.weeks.forEach((week, wIdx) => {
            week.contributionDays.forEach((day: ContributionDay) => {
                const date = new Date(day.date);
                const monthIndex = date.getMonth();
                const monthName = MONTH_FULL[monthIndex];
                const weekday = day.weekday; // 0-6

                // Status flags
                const isActiveMonth = monthName === peakStats.topMonth.month;
                const isActiveWeek = isActiveMonth && date >= activeWeekStart && date <= activeWeekEnd;
                const isActiveDay = day.date === activeDayDate;

                const isLongestStreak = longestStreak.startDate && longestStreak.endDate &&
                    date >= new Date(longestStreak.startDate) &&
                    date <= new Date(longestStreak.endDate);

                const isCurrentStreak = currentStreak?.startDate && currentStreak?.endDate &&
                    date >= new Date(currentStreak.startDate) &&
                    date <= new Date(currentStreak.endDate);

                // --- POSITIONS ---
                const cellSize = 12;
                const gap = 3;

                // 1. Heatmap (Standard)
                const origX = wIdx * (cellSize + gap);
                const origY = weekday * (cellSize + gap);

                // 2. Month Grid (3x4 Layout)
                // Col: 0-3, Row: 0-2
                const mCol = monthIndex % 4;
                const mRow = Math.floor(monthIndex / 4);

                // Position internal to month block
                // We need to know which "week of the month" this is approximately
                const dayOfMonth = date.getDate();
                const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);
                const dayOfWeek = weekday;

                const blockOffsetX = mCol * 100; // ample space between blocks
                const blockOffsetY = mRow * 100;

                const monthGridX = blockOffsetX + (weekOfMonth * (cellSize + 1));
                const monthGridY = blockOffsetY + (dayOfWeek * (cellSize + 1));

                // Save Target Centers
                // Center of Active Month
                if (isActiveMonth) {
                    // Approximate center of the month block
                    targets['activeMonth'] = {
                        x: blockOffsetX + 35, // roughly half block width
                        y: blockOffsetY + 35
                    };
                }

                // Center of Active Week
                if (isActiveWeek) {
                    targets['activeWeek'] = { x: monthGridX, y: monthGridY };
                }

                // Center of Active Day
                if (isActiveDay) {
                    targets['activeDay'] = { x: monthGridX, y: monthGridY };
                }

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
                    isCurrentStreak: !!isCurrentStreak
                });
            });
        });

        // Fallback targets if missing
        if (!targets['activeMonth']) targets['activeMonth'] = { x: 150, y: 150 };
        if (!targets['activeWeek']) targets['activeWeek'] = targets['activeMonth'];
        if (!targets['activeDay']) targets['activeDay'] = targets['activeMonth'];

        // Streak Targets
        // Just find the first cell of the streak and target that
        const longestCell = cells.find(c => c.isLongestStreak);
        targets['longestStreak'] = longestCell
            ? { x: longestCell.monthGridX, y: longestCell.monthGridY }
            : { x: 0, y: 0 };

        const currentCell = cells.find(c => c.isCurrentStreak);
        targets['currentStreak'] = currentCell
            ? { x: currentCell.monthGridX, y: currentCell.monthGridY }
            : { x: 0, y: 0 };

        return { cells, targets };
    }, [contributionCalendar, peakStats, longestStreak, currentStreak]);

    // 2. Calculate Camera Transform
    const camera = useMemo(() => {
        const centerX = 200; // SVG viewBox center X (approx)
        const centerY = 150; // SVG viewBox center Y (approx)

        switch (phase) {
            case 'heatmap':
                // Show full heatmap, centered
                return { x: 0, y: 0, scale: 0.8 };
            case 'rotate':
            case 'separate':
                // Pull back slightly to see the transformation
                return { x: 0, y: 0, scale: 0.7 };
            case 'grid':
            case 'zoomMonths':
                // Center the 3x4 grid. 
                // Grid is roughly 400x300. Center is ~200, 150
                // We want to verify this alignment
                return { x: -30, y: -20, scale: 0.9 };
            case 'activeMonth':
                // Zoom into the specific month block center
                // We need to translate the SVG so that target is at center
                // Translate = Center - Target
                // But since we scale, it's: (Center / Scale) - Target ?? 
                // Easier with CSS transform on a container: 
                // translate(ScreenCenter - Target * Scale)
                // Let's stick to SVG coordinate space for simplicity.
                // ViewBox center is (Target.x, Target.y) width/scale height/scale
                const tM = processed.targets['activeMonth'];
                return {
                    x: centerX - tM.x,
                    y: centerY - tM.y,
                    scale: 2.5
                };
            case 'activeWeek':
                const tW = processed.targets['activeWeek'];
                return { x: centerX - tW.x, y: centerY - tW.y, scale: 4.5 };
            case 'activeDay':
                const tD = processed.targets['activeDay'];
                return { x: centerX - tD.x, y: centerY - tD.y, scale: 8 };
            case 'longestStreak':
                const tL = processed.targets['longestStreak'];
                return { x: centerX - tL.x, y: centerY - tL.y, scale: 2.2 }; // Pull back to see context
            case 'currentStreak':
                const tC = processed.targets['currentStreak'];
                return { x: centerX - tC.x, y: centerY - tC.y, scale: 2.2 };
            case 'clock':
                return { x: 0, y: 0, scale: 1 };
            default:
                return { x: 0, y: 0, scale: 1 };
        }
    }, [phase, processed.targets]);

    // 3. Helper for Cell Position Interpolation
    const getCellPos = (cell: typeof processed.cells[0], index: number) => {
        if (phase === 'heatmap') {
            return { x: cell.origX, y: cell.origY, opacity: 1 };
        }
        if (phase === 'rotate') {
            return {
                x: cell.origY * 2 + 50,
                y: cell.origX * 0.5 + 20,
                opacity: 1
            };
        }
        // For distinct separate phase, explode them out deterministically
        if (phase === 'separate') {
            const seedX = (index % 7) - 3;
            const seedY = (index % 5) - 2;
            return {
                x: cell.monthGridX + seedX * 10,
                y: cell.monthGridY + seedY * 10,
                opacity: 0.8
            };
        }

        // Grid / Zoom phases -> Snap to month grid
        return { x: cell.monthGridX, y: cell.monthGridY, opacity: 1 };
    };

    // 4. Spotlight / Dimming Logic
    const getCellOpacity = (cell: typeof processed.cells[0]) => {
        if (['heatmap', 'rotate', 'separate', 'grid', 'zoomMonths'].includes(phase)) return 1;

        // During Focus Phases, dim everything else
        const DIM = 0.1;

        if (phase === 'activeMonth') {
            return cell.isActiveMonth ? 1 : DIM;
        }
        if (phase === 'activeWeek') {
            return cell.isActiveWeek ? 1 : DIM;
        }
        if (phase === 'activeDay') {
            return cell.isActiveDay ? 1 : DIM; // Only the day active? Or keep week visible? User wants spotlight.
        }
        if (phase === 'longestStreak') {
            return cell.isLongestStreak ? 1 : DIM;
        }
        if (phase === 'currentStreak') {
            return cell.isCurrentStreak ? 1 : DIM;
        }

        return DIM; // Default dim for other phases (clock)
    };

    return (
        <div className="h-[calc(100dvh-4rem)] relative overflow-hidden flex flex-col items-center justify-center bg-transparent" ref={containerRef}>

            {/* 1. The Stage (SVG Container) */}
            {phase !== 'clock' && (
                <motion.div
                    className="w-full h-full flex items-center justify-center"
                    animate={{
                        scale: camera.scale,
                        x: camera.x,
                        y: camera.y
                    }}
                    transition={{
                        duration: 1.5,
                        ease: [0.16, 1, 0.3, 1] // Custom ease for cinematic camera
                    }}
                    style={{ transformOrigin: 'center center' }}
                >
                    <svg
                        width="400"
                        height="350"
                        viewBox="0 0 400 350"
                        className="overflow-visible" // Allow cells to fly "out" if needed
                    >
                        {/* Month Labels (Only visible in grid/zoom phases) */}
                        {['grid', 'zoomMonths', 'activeMonth', 'activeWeek', 'activeDay', 'longestStreak', 'currentStreak'].includes(phase) &&
                            processed.cells
                                .filter((c, i, arr) => arr.findIndex(t => t.monthIndex === c.monthIndex) === i) // Uniq months
                                .map(m => {
                                    // center label above block
                                    // Block approx 70x70
                                    const col = m.monthIndex % 4;
                                    const row = Math.floor(m.monthIndex / 4);
                                    const x = col * 100 + 35;
                                    const y = row * 100 - 10;

                                    // Highlight active month label?
                                    const isTarget = (phase === 'activeMonth' || phase === 'activeWeek' || phase === 'activeDay') && m.isActiveMonth;
                                    const isFocusPhase = phase.startsWith('active') || phase.endsWith('Streak');
                                    const opacity = isTarget ? 1 : (isFocusPhase ? 0.2 : 0.6);

                                    return (
                                        <motion.text
                                            key={`label-${m.monthIndex}`}
                                            x={x}
                                            y={y}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity }}
                                            className="text-[10px] font-bold fill-current"
                                            textAnchor="middle"
                                        >
                                            {m.monthName}
                                        </motion.text>
                                    );
                                })
                        }

                        {/* The CElls */}
                        {processed.cells.map((cell, i) => {
                            const pos = getCellPos(cell, i);
                            const opacity = getCellOpacity(cell);
                            const color = getColor(cell.count, isDark);

                            return (
                                <motion.rect
                                    key={`cell-${i}`}
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
                                        duration: 1.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            );
                        })}
                    </svg>
                </motion.div>
            )}

            {/* 2. Spotlight UI Overlays (Titles/Stats that fade in over the zoomed view) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <AnimatePresence>
                    {phase === 'activeMonth' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 40 }}
                            exit={{ opacity: 0 }}
                            className="bg-background/80 backdrop-blur-md p-4 rounded-xl border border-purple-500/30 text-center"
                        >
                            <h2 className="text-3xl font-bold text-purple-500">{peakStats.topMonth.month}</h2>
                            <p className="text-sm text-muted-foreground">{peakStats.topMonth.contributions} Contributions</p>
                        </motion.div>
                    )}
                    {phase === 'activeWeek' && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 50 }}
                            exit={{ opacity: 0 }}
                            className="bg-background/80 backdrop-blur-md p-4 rounded-xl border border-blue-500/30 text-center"
                        >
                            <h2 className="text-2xl font-bold text-blue-500">Most Active Week</h2>
                            <p className="text-xs text-muted-foreground">
                                {new Date(peakStats.topWeek.weekStart).toLocaleDateString()}
                            </p>
                            <p className="text-xl font-bold">{peakStats.topWeek.contributions}</p>
                        </motion.div>
                    )}
                    {phase === 'activeDay' && (
                        <motion.div
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 60 }}
                            exit={{ opacity: 0 }}
                            className="bg-background/80 backdrop-blur-md p-3 rounded-xl border border-green-500/30 text-center mt-20"
                        >
                            <h2 className="text-xl font-bold text-green-500">Best Day</h2>
                            <p className="text-sm font-semibold">{new Date(peakStats.topDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            <p className="text-2xl font-bold">{peakStats.topDay.contributions}</p>
                        </motion.div>
                    )}
                    {phase === 'longestStreak' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-10 flex flex-col items-center"
                        >
                            <Card className="border-orange-500/50 bg-background/90 w-64">
                                <CardContent className="p-4 text-center">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                                            <HugeiconsIcon icon={Fire03Icon} size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-orange-500">Longest Streak</h3>
                                    <p className="text-4xl font-black my-2">{longestStreak.count} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                                    <p className="text-xs text-muted-foreground">{formatDateRange(longestStreak.startDate, longestStreak.endDate)}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    {phase === 'currentStreak' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-10 flex flex-col items-center"
                        >
                            <Card className="border-cyan-500/50 bg-background/90 w-64">
                                <CardContent className="p-4 text-center">
                                    <div className="flex justify-center mb-2">
                                        <div className="p-2 bg-cyan-500/10 rounded-full text-cyan-500">
                                            <HugeiconsIcon icon={Fire03Icon} size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-cyan-500">Current Streak</h3>
                                    <p className="text-4xl font-black my-2">{currentStreak.count} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                                    <p className="text-xs text-muted-foreground">{formatDateRange(currentStreak.startDate, currentStreak.endDate)}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. The Clock (Final Phase) */}
            <AnimatePresence>
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
            </AnimatePresence>
        </div>
    );
}
