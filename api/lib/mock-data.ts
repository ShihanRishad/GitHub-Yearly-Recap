// Mock data generator for API demo mode
// Mirrors the frontend mock-data.ts logic

interface ContributionDay {
    date: string;
    contributionCount: number;
    weekday: number;
    color: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
    firstDay: string;
}

interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
    months: { name: string; firstDay: string; totalWeeks: number }[];
}

interface StreakInfo {
    count: number;
    startDate: string | null;
    endDate: string | null;
}

interface PeakStats {
    topDay: { date: string; contributions: number; dayOfWeek: string };
    topWeek: { weekStart: string; weekEnd: string; contributions: number };
    topMonth: { month: string; year: number; contributions: number };
    topHour: { hour: number; commits: number } | null;
}

interface LanguageStats {
    name: string;
    color: string;
    percentage: number;
    size: number;
}

interface NewRepo {
    name: string;
    description: string | null;
    url: string;
    stars: number;
    forks: number;
    language: string | null;
    createdAt: string;
    isPrivate: boolean;
}

interface CommentaryNote {
    id: string;
    category: 'streak' | 'productivity' | 'languages' | 'social' | 'repos' | 'general';
    title: string;
    content: string;
    emoji: string;
}

export interface RecapData {
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string | null;
    year: number;
    totalContributions: number;
    contributionCalendar: ContributionCalendar;
    longestStreak: StreakInfo;
    currentStreak: StreakInfo;
    peakStats: PeakStats;
    prCounts: { opened: number; merged: number; closed: number };
    issueCounts: { opened: number; closed: number };
    newRepos: NewRepo[];
    totalReposCreated: number;
    followers: number;
    following: number;
    totalStars: number;
    topLanguages: LanguageStats[];
    notes: CommentaryNote[];
    ogImageUrl: string | null;
    generatedAt: string;
}

function generateContributionCalendar(year: number): ContributionCalendar {
    const weeks: ContributionWeek[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // Adjust to start from Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    let totalContributions = 0;
    const currentDate = new Date(startDate);
    const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];

    // Use a seeded random for consistent demo data
    let seed = year * 1000;
    const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };

    while (currentDate <= endDate) {
        const week: ContributionDay[] = [];
        const weekStartDate = currentDate.toISOString().split('T')[0];

        for (let i = 0; i < 7; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = seededRandom() > 0.3 ? Math.floor(seededRandom() * 15) : 0;
            totalContributions += count;

            const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 6 ? 2 : count <= 9 ? 3 : 4;

            week.push({
                date: dateStr,
                contributionCount: count,
                weekday: i,
                color: colors[level],
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        weeks.push({
            contributionDays: week,
            firstDay: weekStartDate,
        });
    }

    // Generate month labels
    const months: { name: string; firstDay: string; totalWeeks: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 12; i++) {
        const firstDay = new Date(year, i, 1);
        months.push({
            name: monthNames[i],
            firstDay: firstDay.toISOString().split('T')[0],
            totalWeeks: 4,
        });
    }

    return { totalContributions, weeks, months };
}

export function getMockRecapData(username: string, year: number): RecapData {
    const calendar = generateContributionCalendar(year);

    // Find peak day
    let topDay = { date: '', contributions: 0, dayOfWeek: '' };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    calendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
            if (day.contributionCount > topDay.contributions) {
                topDay = {
                    date: day.date,
                    contributions: day.contributionCount,
                    dayOfWeek: dayNames[day.weekday],
                };
            }
        });
    });

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let longestStart = '';
    let longestEnd = '';
    let currentStart = '';

    const allDays = calendar.weeks.flatMap(w => w.contributionDays).reverse();

    for (let i = 0; i < allDays.length; i++) {
        if (allDays[i].contributionCount > 0) {
            if (tempStreak === 0) currentStart = allDays[i].date;
            tempStreak++;
            if (i === 0) currentStreak = tempStreak;
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
                longestEnd = currentStart;
                longestStart = allDays[i].date;
            }
        } else {
            tempStreak = 0;
            if (i === 0) break;
        }
    }

    // Mock languages
    const languages: LanguageStats[] = [
        { name: 'TypeScript', color: '#3178c6', percentage: 42.5, size: 150000 },
        { name: 'JavaScript', color: '#f1e05a', percentage: 28.3, size: 100000 },
        { name: 'Python', color: '#3572A5', percentage: 15.2, size: 54000 },
        { name: 'CSS', color: '#563d7c', percentage: 8.1, size: 29000 },
        { name: 'HTML', color: '#e34c26', percentage: 4.5, size: 16000 },
        { name: 'Shell', color: '#89e051', percentage: 1.4, size: 5000 },
    ];

    // Mock repos
    const repos: NewRepo[] = [
        {
            name: 'awesome-project',
            description: 'A really awesome project that does amazing things',
            url: `https://github.com/${username}/awesome-project`,
            stars: 142,
            forks: 23,
            language: 'TypeScript',
            createdAt: `${year}-03-15T10:00:00Z`,
            isPrivate: false,
        },
        {
            name: 'cool-library',
            description: 'A cool library for doing cool stuff',
            url: `https://github.com/${username}/cool-library`,
            stars: 89,
            forks: 12,
            language: 'JavaScript',
            createdAt: `${year}-05-22T14:30:00Z`,
            isPrivate: false,
        },
        {
            name: 'data-analyzer',
            description: 'Tool for analyzing and visualizing data',
            url: `https://github.com/${username}/data-analyzer`,
            stars: 56,
            forks: 8,
            language: 'Python',
            createdAt: `${year}-07-08T09:15:00Z`,
            isPrivate: false,
        },
        {
            name: 'personal-site',
            description: 'My personal portfolio website',
            url: `https://github.com/${username}/personal-site`,
            stars: 34,
            forks: 5,
            language: 'TypeScript',
            createdAt: `${year}-09-12T16:45:00Z`,
            isPrivate: false,
        },
    ];

    // AI notes
    const notes: CommentaryNote[] = [
        {
            id: '1',
            category: 'streak',
            title: 'Consistency Champion',
            content: `Your ${longestStreak}-day streak shows incredible dedication! Most developers struggle to maintain a 7-day streak.`,
            emoji: '🔥',
        },
        {
            id: '2',
            category: 'productivity',
            title: 'Peak Performance',
            content: `You're most productive on ${topDay.dayOfWeek}s. Maybe it's the coffee? ☕`,
            emoji: '📈',
        },
        {
            id: '3',
            category: 'languages',
            title: 'TypeScript Enthusiast',
            content: 'TypeScript dominates your codebase. Type safety for the win!',
            emoji: '💙',
        },
        {
            id: '4',
            category: 'social',
            title: 'Community Builder',
            content: 'Your open source contributions are making an impact. Keep it up!',
            emoji: '🤝',
        },
        {
            id: '5',
            category: 'repos',
            title: 'Creative Creator',
            content: 'You created some interesting projects this year. awesome-project seems especially popular!',
            emoji: '💡',
        },
        {
            id: '6',
            category: 'general',
            title: 'Growth Mindset',
            content: `With ${calendar.totalContributions} contributions, you've definitely committed to growth!`,
            emoji: '🌱',
        },
    ];

    return {
        username,
        displayName: username.charAt(0).toUpperCase() + username.slice(1),
        avatarUrl: `https://avatars.githubusercontent.com/${username}`,
        bio: 'Passionate developer building cool stuff 🚀',
        year,
        totalContributions: calendar.totalContributions,
        contributionCalendar: calendar,
        longestStreak: {
            count: longestStreak,
            startDate: longestStart || null,
            endDate: longestEnd || null,
        },
        currentStreak: {
            count: currentStreak,
            startDate: currentStreak > 0 ? new Date().toISOString().split('T')[0] : null,
            endDate: currentStreak > 0 ? new Date().toISOString().split('T')[0] : null,
        },
        peakStats: {
            topDay,
            topWeek: {
                weekStart: `${year}-06-05`,
                weekEnd: `${year}-06-11`,
                contributions: 67,
            },
            topMonth: {
                month: 'June',
                year,
                contributions: 284,
            },
            topHour: {
                hour: 14,
                commits: 156,
            },
        },
        prCounts: {
            opened: 47,
            merged: 42,
            closed: 3,
        },
        issueCounts: {
            opened: 23,
            closed: 19,
        },
        newRepos: repos,
        totalReposCreated: 4,
        followers: 234,
        following: 89,
        totalStars: 321,
        topLanguages: languages,
        notes,
        ogImageUrl: null,
        generatedAt: new Date().toISOString(),
    };
}
