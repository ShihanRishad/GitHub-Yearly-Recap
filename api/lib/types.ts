// Shared Types for GitHub Recap API

export interface ContributionDay {
    date: string; // YYYY-MM-DD
    contributionCount: number;
    weekday: number; // 0-6 (Sun-Sat)
    color: string; // GitHub color level
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
    firstDay: string;
}

export interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
    months: { name: string; firstDay: string; totalWeeks: number }[];
}
