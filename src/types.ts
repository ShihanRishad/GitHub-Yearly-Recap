// GitHub Recap 2025 - Core TypeScript Types

// ============================================
// Contribution Calendar Types
// ============================================

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

// ============================================
// Streak & Peak Types
// ============================================

export interface StreakInfo {
  count: number;
  startDate: string | null;
  endDate: string | null;
}

export interface PeakDay {
  date: string;
  contributions: number;
  dayOfWeek: string;
}

export interface PeakWeek {
  weekStart: string;
  weekEnd: string;
  contributions: number;
}

export interface PeakMonth {
  month: string; // e.g., "January"
  year: number;
  contributions: number;
}

export interface PeakHour {
  hour: number; // 0-23
  commits: number;
}

export interface PeakStats {
  topDay: PeakDay;
  topWeek: PeakWeek;
  topMonth: PeakMonth;
  topHour: PeakHour | null;
}

// ============================================
// Repository & Language Types
// ============================================

export interface NewRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  createdAt: string;
  isPrivate: boolean;
}

export interface LanguageStats {
  name: string;
  color: string;
  percentage: number;
  size: number;
}

// ============================================
// PR & Issue Types
// ============================================

export interface PRCounts {
  opened: number;
  merged: number;
  closed: number;
}

export interface IssueCounts {
  opened: number;
  closed: number;
}

// ============================================
// AI Commentary Types
// ============================================

export interface CommentaryNote {
  id: string;
  category: 'streak' | 'productivity' | 'languages' | 'social' | 'repos' | 'general';
  title: string;
  content: string;
  emoji: string;
}

// ============================================
// Main Recap Data Type
// ============================================

export interface RecapData {
  // User info
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string | null;
  year: number;

  // Contribution data
  totalContributions: number;
  contributionCalendar: ContributionCalendar;

  // Streaks
  longestStreak: StreakInfo;
  currentStreak: StreakInfo;

  // Peaks
  peakStats: PeakStats;

  // PRs & Issues
  prCounts: PRCounts;
  issueCounts: IssueCounts;

  // Repositories
  newRepos: NewRepo[];
  totalReposCreated: number;

  // Social
  followers: number;
  following: number;
  totalStars: number;

  // Languages
  topLanguages: LanguageStats[];

  // AI Commentary
  notes: CommentaryNote[];

  // OG Image
  ogImageUrl: string | null;

  // Metadata
  generatedAt: string;
}

// ============================================
// Firestore Document Types
// ============================================

export type RecapStatus = 'processing' | 'ready' | 'error';

export interface FirestoreRecapDoc {
  username: string;
  year: number;
  status: RecapStatus;
  processedJson: RecapData | null;
  ogImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  errorMessage: string | null;
  version: number;
}

// ============================================
// API Response Types
// ============================================

export interface RecapStatusResponse {
  status: RecapStatus;
  message?: string;
  data?: RecapData;
  ogImageUrl?: string;
  errorMessage?: string;
}

export interface RecapRequestBody {
  year?: number;
}

// ============================================
// GitHub GraphQL Response Types
// ============================================

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  followers: { totalCount: number };
  following: { totalCount: number };
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: number;
      weeks: {
        contributionDays: {
          date: string;
          contributionCount: number;
          weekday: number;
          color: string;
        }[];
      }[];
      months: { name: string; firstDay: string; totalWeeks: number }[];
    };
    totalCommitContributions: number;
    totalPullRequestContributions: number;
    totalIssueContributions: number;
    totalRepositoriesWithContributedCommits: number;
    commitContributionsByRepository: {
      repository: {
        name: string;
        owner: { login: string };
        stargazerCount: number;
        primaryLanguage: { name: string; color: string } | null;
      };
      contributions: { totalCount: number };
    }[];
  };
  repositories: {
    totalCount: number;
    nodes: {
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      forkCount: number;
      primaryLanguage: { name: string; color: string } | null;
      createdAt: string;
      isPrivate: boolean;
    }[];
  };
  pullRequests: {
    totalCount: number;
  };
  issues: {
    totalCount: number;
  };
}

export interface GitHubGraphQLResponse {
  data: {
    user: GitHubUser | null;
  };
  errors?: { message: string }[];
}

// ============================================
// Slide Types
// ============================================

export type SlideType =
  | 'title'
  | 'overview'
  | 'heatmap'
  | 'streaks'
  | 'prs-issues'
  | 'repos'
  | 'social'
  | 'languages'
  | 'notes'
  | 'share';

export interface SlideConfig {
  id: SlideType;
  title: string;
  icon: string;
}

// ============================================
// Theme Types
// ============================================

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}
