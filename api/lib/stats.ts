import type { GitHubUserData } from './github.js';

export interface StreakInfo {
    count: number;
    startDate: string | null;
    endDate: string | null;
}

export interface PeakStats {
    topDay: { date: string; contributions: number; dayOfWeek: string };
    topWeek: { weekStart: string; weekEnd: string; contributions: number };
    topMonth: { month: string; year: number; contributions: number };
    topHour: { hour: number; commits: number } | null;
}

export interface LanguageStats {
    name: string;
    color: string;
    percentage: number;
    size: number;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function calculateStreaks(calendar: GitHubUserData['contributionCalendar']): {
    longestStreak: StreakInfo;
    currentStreak: StreakInfo;
} {
    // Flatten all days
    const allDays = calendar.weeks
        .flatMap(w => w.contributionDays)
        .sort((a, b) => a.date.localeCompare(b.date));

    let longestStreak: StreakInfo = { count: 0, startDate: null, endDate: null };
    let currentStreak: StreakInfo = { count: 0, startDate: null, endDate: null };

    let tempStreak = 0;
    let tempStart: string | null = null;

    for (let i = 0; i < allDays.length; i++) {
        const day = allDays[i];

        if (day.contributionCount > 0) {
            if (tempStreak === 0) {
                tempStart = day.date;
            }
            tempStreak++;

            if (tempStreak > longestStreak.count) {
                longestStreak = {
                    count: tempStreak,
                    startDate: tempStart,
                    endDate: day.date,
                };
            }
        } else {
            tempStreak = 0;
            tempStart = null;
        }
    }

    // Calculate current streak (from today backwards)
    const today = new Date().toISOString().split('T')[0];
    let currentCount = 0;
    let currentEnd: string | null = null;
    let currentStart: string | null = null;

    for (let i = allDays.length - 1; i >= 0; i--) {
        const day = allDays[i];

        // Skip future dates
        if (day.date > today) continue;

        if (day.contributionCount > 0) {
            if (currentCount === 0) {
                currentEnd = day.date;
            }
            currentCount++;
            currentStart = day.date;
        } else {
            // If we haven't started counting yet, check if today has no contributions
            if (currentCount === 0 && day.date === today) {
                // Check yesterday
                continue;
            }
            break;
        }
    }

    currentStreak = {
        count: currentCount,
        startDate: currentStart,
        endDate: currentEnd,
    };

    return { longestStreak, currentStreak };
}

export function calculatePeakStats(calendar: GitHubUserData['contributionCalendar']): PeakStats {
    const allDays = calendar.weeks.flatMap(w => w.contributionDays);

    // Top day
    let topDay = { date: '', contributions: 0, dayOfWeek: '' };
    for (const day of allDays) {
        if (day.contributionCount > topDay.contributions) {
            topDay = {
                date: day.date,
                contributions: day.contributionCount,
                dayOfWeek: DAY_NAMES[day.weekday],
            };
        }
    }

    // Top week
    let topWeek = { weekStart: '', weekEnd: '', contributions: 0 };
    for (const week of calendar.weeks) {
        const weekContribs = week.contributionDays.reduce((sum, d) => sum + d.contributionCount, 0);
        if (weekContribs > topWeek.contributions) {
            topWeek = {
                weekStart: week.contributionDays[0].date,
                weekEnd: week.contributionDays[week.contributionDays.length - 1].date,
                contributions: weekContribs,
            };
        }
    }

    // Top month
    const monthStats = new Map<string, number>();
    for (const day of allDays) {
        const date = new Date(day.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        monthStats.set(key, (monthStats.get(key) || 0) + day.contributionCount);
    }

    let topMonth = { month: '', year: 0, contributions: 0 };
    for (const [key, contributions] of monthStats) {
        if (contributions > topMonth.contributions) {
            const [year, month] = key.split('-').map(Number);
            topMonth = {
                month: MONTH_NAMES[month],
                year,
                contributions,
            };
        }
    }

    return {
        topDay,
        topWeek,
        topMonth,
        topHour: null, // Would need commit timestamp data
    };
}

export function calculateLanguageStats(
    languageStats: Map<string, { size: number; color: string }>
): LanguageStats[] {
    const total = Array.from(languageStats.values()).reduce((sum, l) => sum + l.size, 0);

    const result: LanguageStats[] = [];
    for (const [name, data] of languageStats) {
        result.push({
            name,
            color: data.color,
            size: data.size,
            percentage: total > 0 ? (data.size / total) * 100 : 0,
        });
    }

    // Sort by size descending
    result.sort((a, b) => b.size - a.size);

    return result.slice(0, 10); // Top 10 languages
}

export function calculateTotalStars(repositories: GitHubUserData['repositories']): number {
    return repositories.reduce((sum, repo) => sum + repo.stars, 0);
}
