import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ContributionCalendar, ContributionDay } from '@/types';
import { useTheme } from '@/components/theme-provider';

interface ContributionHeatmapProps {
    calendar: ContributionCalendar;
    className?: string;
}

const CELL_SIZE = 12;
const CELL_GAP = 3;
const MONTH_LABEL_HEIGHT = 20;
const DAY_LABEL_WIDTH = 32;

// GitHub contribution colors
const LIGHT_COLORS = [
    '#ebedf0', // 0 contributions
    '#9be9a8', // Level 1
    '#40c463', // Level 2
    '#30a14e', // Level 3
    '#216e39', // Level 4
];

const DARK_COLORS = [
    '#161b22', // 0 contributions
    '#0e4429', // Level 1
    '#006d32', // Level 2
    '#26a641', // Level 3
    '#39d353', // Level 4
];

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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ContributionHeatmap({ calendar, className = '' }: ContributionHeatmapProps) {
    const { isDark } = useTheme();

    // Calculate dimensions
    const width = calendar.weeks.length * (CELL_SIZE + CELL_GAP) + DAY_LABEL_WIDTH;
    const height = 7 * (CELL_SIZE + CELL_GAP) + MONTH_LABEL_HEIGHT;

    // Get month positions for labels
    const monthLabels = useMemo(() => {
        const labels: { name: string; x: number }[] = [];
        let currentMonth = '';

        calendar.weeks.forEach((week, weekIndex) => {
            const firstDay = week.contributionDays[0];
            if (firstDay) {
                const date = new Date(firstDay.date);
                const month = date.toLocaleDateString('en-US', { month: 'short' });

                if (month !== currentMonth) {
                    const x = DAY_LABEL_WIDTH + weekIndex * (CELL_SIZE + CELL_GAP);

                    // Avoid overlapping labels - ensure at least 2 weeks (30px) between labels
                    const lastLabel = labels[labels.length - 1];
                    const isTooClose = lastLabel && (x - lastLabel.x < 30);

                    // Special case: If the first label is 'Dec', it's likely the previous year.
                    // For a "2025 Recap", starting with 'Dec' (2024) is confusing.
                    // We skip the first label if it's 'Dec' to let 'Jan' be the first visible one.
                    const isFirstDec = labels.length === 0 && month === 'Dec';

                    if (!isTooClose && !isFirstDec) {
                        currentMonth = month;
                        labels.push({ name: month, x });
                    }
                }
            }
        });

        return labels;
    }, [calendar.weeks]);

    return (
        <div className={`flex flex-col items-center w-full ${className}`}>
            <div className="w-full overflow-x-auto py-2 flex justify-center">
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="block shrink-0 max-w-full h-auto min-w-[250px]"
                    role="img"
                    aria-label={`Contribution graph showing ${calendar.totalContributions} total contributions`}
                >
                    {/* Month labels */}
                    <g className="fill-muted-foreground" style={{ fontSize: '10px' }}>
                        {monthLabels.map((label, i) => (
                            <text key={i} x={label.x} y={12}>
                                {label.name}
                            </text>
                        ))}
                    </g>

                    {/* Day labels */}
                    <g className="fill-muted-foreground" style={{ fontSize: '9px' }}>
                        {[1, 3, 5].map((dayIndex) => (
                            <text
                                key={dayIndex}
                                x={0}
                                y={MONTH_LABEL_HEIGHT + dayIndex * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
                            >
                                {DAYS[dayIndex]}
                            </text>
                        ))}
                    </g>

                    {/* Contribution cells */}
                    <g>
                        {calendar.weeks.map((week, weekIndex) =>
                            week.contributionDays.map((day: ContributionDay, dayIndex: number) => {
                                const x = DAY_LABEL_WIDTH + weekIndex * (CELL_SIZE + CELL_GAP);
                                const y = MONTH_LABEL_HEIGHT + day.weekday * (CELL_SIZE + CELL_GAP);

                                return (
                                    <motion.rect
                                        key={day.date}
                                        x={x}
                                        y={y}
                                        width={CELL_SIZE}
                                        height={CELL_SIZE}
                                        rx={2}
                                        ry={2}
                                        fill={getColor(day.contributionCount, isDark)}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: (weekIndex * 7 + dayIndex) * 0.002,
                                            duration: 0.3,
                                        }}
                                        className="cursor-pointer"
                                        role="gridcell"
                                        aria-label={`${day.contributionCount} contributions on ${new Date(day.date).toLocaleDateString()}`}
                                    >
                                        <title>
                                            {day.contributionCount} contribution{day.contributionCount !== 1 ? 's' : ''} on{' '}
                                            {new Date(day.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </title>
                                    </motion.rect>
                                );
                            })
                        )}
                    </g>
                </svg>
            </div>

            {/* Legend - match SVG width if possible or just align right */}
            <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground w-full" style={{ maxWidth: width }}>
                <span className="opacity-60">Less</span>
                <div className="flex gap-[3px]">
                    {(isDark ? DARK_COLORS : LIGHT_COLORS).map((color, i) => (
                        <div
                            key={i}
                            className="h-[10px] w-[10px] rounded-[2px]"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <span className="opacity-60">More</span>
            </div>
        </div>
    );
}
