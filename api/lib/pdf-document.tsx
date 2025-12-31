// PDF Document Component using @react-pdf/renderer
// Light theme design with pages for each slide

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
} from '@react-pdf/renderer';
import type { RecapData } from './mock-data.js';

// Light theme colors
const colors = {
    background: '#ffffff',
    primary: '#1f2937',
    muted: '#6b7280',
    border: '#e5e7eb',
    accent: {
        green: '#22c55e',
        orange: '#f97316',
        blue: '#3b82f6',
        purple: '#a855f7',
        pink: '#ec4899',
    },
    heatmap: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
};

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: colors.background,
        fontFamily: 'Helvetica',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    pageSubtitle: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 30,
    },
    // Title page
    titlePage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleYear: {
        fontSize: 72,
        fontWeight: 'bold',
        color: colors.accent.green,
        marginBottom: 16,
    },
    titleName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    titleUsername: {
        fontSize: 18,
        color: colors.muted,
        marginBottom: 24,
    },
    titleLabel: {
        fontSize: 16,
        color: colors.muted,
    },
    // Stats
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    statCard: {
        width: '30%',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 16,
    },
    statLabel: {
        fontSize: 11,
        color: colors.muted,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    statSuffix: {
        fontSize: 14,
        color: colors.muted,
    },
    statDescription: {
        fontSize: 10,
        color: colors.muted,
        marginTop: 4,
    },
    // Heatmap
    heatmapContainer: {
        flexDirection: 'row',
        gap: 2,
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    heatmapWeek: {
        flexDirection: 'column',
        gap: 2,
    },
    heatmapCell: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    // Streaks
    streakCard: {
        padding: 24,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
    },
    streakValue: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    streakLabel: {
        fontSize: 14,
        color: colors.muted,
        marginTop: 4,
    },
    streakDates: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 8,
    },
    // Repos list
    repoItem: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 12,
    },
    repoName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    repoDescription: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 4,
    },
    repoStats: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    repoStat: {
        fontSize: 10,
        color: colors.muted,
    },
    // Languages
    languageBar: {
        height: 12,
        borderRadius: 6,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 20,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    languageDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    languageName: {
        fontSize: 12,
        color: colors.primary,
        flex: 1,
    },
    languagePercent: {
        fontSize: 12,
        color: colors.muted,
    },
    // Notes
    noteCard: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 12,
    },
    noteEmoji: {
        fontSize: 20,
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    noteContent: {
        fontSize: 11,
        color: colors.muted,
        lineHeight: 1.4,
    },
    // Footer
    footer: {
        marginTop: 'auto',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 10,
        color: colors.muted,
    },
    // Peak stats row
    peakStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    peakStat: {
        alignItems: 'center',
    },
    peakStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    peakStatLabel: {
        fontSize: 10,
        color: colors.muted,
        marginTop: 4,
        textAlign: 'center',
    },
    // Summary page
    summaryStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 40,
    },
    summaryBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    summaryBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    thankYou: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginTop: 60,
    },
});

// Helper function to get heatmap color
function getHeatmapColor(count: number): string {
    if (count === 0) return colors.heatmap[0];
    if (count <= 3) return colors.heatmap[1];
    if (count <= 6) return colors.heatmap[2];
    if (count <= 9) return colors.heatmap[3];
    return colors.heatmap[4];
}

// Helper to format date
function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Component Props
interface PDFDocumentProps {
    data: RecapData;
}

// Page Components
function TitlePage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.titlePage}>
                <Text style={styles.titleYear}>{data.year}</Text>
                <Text style={styles.titleName}>{data.displayName}</Text>
                <Text style={styles.titleUsername}>@{data.username}</Text>
                <Text style={styles.titleLabel}>GitHub Yearly Recap</Text>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>github-yearly-recap.vercel.app</Text>
            </View>
        </Page>
    );
}

function OverviewPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Your Year at a Glance</Text>
            <Text style={styles.pageSubtitle}>Here's what you accomplished in {data.year}</Text>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Contributions</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.totalContributions.toLocaleString()}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.longestStreak.count}
                        <Text style={styles.statSuffix}> days</Text>
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Pull Requests</Text>
                    <Text style={[styles.statValue, { color: colors.accent.purple }]}>
                        {data.prCounts.opened}
                    </Text>
                    <Text style={styles.statDescription}>{data.prCounts.merged} merged</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Issues</Text>
                    <Text style={[styles.statValue, { color: colors.accent.blue }]}>
                        {data.issueCounts.opened}
                    </Text>
                    <Text style={styles.statDescription}>{data.issueCounts.closed} closed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>New Repos</Text>
                    <Text style={styles.statValue}>{data.totalReposCreated}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Stars Earned</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.totalStars}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Busiest day: {formatDate(data.peakStats.topDay.date)} with {data.peakStats.topDay.contributions} contributions
                </Text>
            </View>
        </Page>
    );
}

function HeatmapPage({ data }: PDFDocumentProps) {
    const weeks = data.contributionCalendar.weeks;

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Contribution Graph</Text>
            <Text style={styles.pageSubtitle}>
                {data.totalContributions.toLocaleString()} contributions in {data.year}
            </Text>

            <View style={styles.heatmapContainer}>
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.heatmapWeek}>
                        {week.contributionDays.map((day, dayIndex) => (
                            <View
                                key={dayIndex}
                                style={[
                                    styles.heatmapCell,
                                    { backgroundColor: getHeatmapColor(day.contributionCount) },
                                ]}
                            />
                        ))}
                    </View>
                ))}
            </View>

            <View style={styles.peakStatsRow}>
                <View style={styles.peakStat}>
                    <Text style={styles.peakStatValue}>{data.peakStats.topMonth.contributions}</Text>
                    <Text style={styles.peakStatLabel}>in {data.peakStats.topMonth.month}{'\n'}(best month)</Text>
                </View>
                <View style={styles.peakStat}>
                    <Text style={styles.peakStatValue}>{data.peakStats.topWeek.contributions}</Text>
                    <Text style={styles.peakStatLabel}>in your best week</Text>
                </View>
                <View style={styles.peakStat}>
                    <Text style={styles.peakStatValue}>{Math.round(data.totalContributions / 365)}</Text>
                    <Text style={styles.peakStatLabel}>daily average</Text>
                </View>
            </View>
        </Page>
    );
}

function StreaksPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Streaks & Consistency</Text>
            <Text style={styles.pageSubtitle}>Your dedication throughout {data.year}</Text>

            <View style={[styles.streakCard, { borderLeftColor: colors.accent.orange }]}>
                <Text style={[styles.streakValue, { color: colors.accent.orange }]}>
                    {data.longestStreak.count} days
                </Text>
                <Text style={styles.streakLabel}>Longest Streak</Text>
                <Text style={styles.streakDates}>
                    {formatDate(data.longestStreak.startDate)} - {formatDate(data.longestStreak.endDate)}
                </Text>
            </View>

            <View style={[styles.streakCard, { borderLeftColor: colors.accent.green }]}>
                <Text style={[styles.streakValue, { color: colors.accent.green }]}>
                    {data.currentStreak.count} days
                </Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
                {data.currentStreak.count > 0 && (
                    <Text style={styles.streakDates}>
                        Started {formatDate(data.currentStreak.startDate)}
                    </Text>
                )}
            </View>

            <View style={[styles.streakCard, { borderLeftColor: colors.accent.blue }]}>
                <Text style={[styles.streakValue, { color: colors.accent.blue }]}>
                    {data.peakStats.topDay.contributions}
                </Text>
                <Text style={styles.streakLabel}>Peak Day Contributions</Text>
                <Text style={styles.streakDates}>
                    on {data.peakStats.topDay.dayOfWeek}, {formatDate(data.peakStats.topDay.date)}
                </Text>
            </View>
        </Page>
    );
}

function PRsIssuesPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>PRs & Issues</Text>
            <Text style={styles.pageSubtitle}>Your collaboration activity in {data.year}</Text>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>PRs Opened</Text>
                    <Text style={[styles.statValue, { color: colors.accent.purple }]}>
                        {data.prCounts.opened}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>PRs Merged</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.prCounts.merged}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>Issues Opened</Text>
                    <Text style={[styles.statValue, { color: colors.accent.blue }]}>
                        {data.issueCounts.opened}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>Issues Closed</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.issueCounts.closed}
                    </Text>
                </View>
            </View>

            {data.prCounts.merged > 0 && (
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.footerText}>
                        Merge rate: {Math.round((data.prCounts.merged / data.prCounts.opened) * 100)}%
                    </Text>
                </View>
            )}
        </Page>
    );
}

function ReposPage({ data }: PDFDocumentProps) {
    const repos = data.newRepos.slice(0, 5);

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>New Repositories</Text>
            <Text style={styles.pageSubtitle}>{data.totalReposCreated} repos created in {data.year}</Text>

            {repos.map((repo, index) => (
                <View key={index} style={styles.repoItem}>
                    <Text style={styles.repoName}>{repo.name}</Text>
                    {repo.description && (
                        <Text style={styles.repoDescription}>{repo.description}</Text>
                    )}
                    <View style={styles.repoStats}>
                        <Text style={styles.repoStat}>⭐ {repo.stars}</Text>
                        <Text style={styles.repoStat}>🔀 {repo.forks}</Text>
                        {repo.language && <Text style={styles.repoStat}>{repo.language}</Text>}
                    </View>
                </View>
            ))}
        </Page>
    );
}

function SocialPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Social & Community</Text>
            <Text style={styles.pageSubtitle}>Your GitHub presence in {data.year}</Text>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { width: '30%' }]}>
                    <Text style={styles.statLabel}>Followers</Text>
                    <Text style={[styles.statValue, { color: colors.accent.pink }]}>
                        {data.followers}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '30%' }]}>
                    <Text style={styles.statLabel}>Following</Text>
                    <Text style={styles.statValue}>{data.following}</Text>
                </View>
                <View style={[styles.statCard, { width: '30%' }]}>
                    <Text style={styles.statLabel}>Total Stars</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.totalStars}
                    </Text>
                </View>
            </View>
        </Page>
    );
}

function LanguagesPage({ data }: PDFDocumentProps) {
    const languages = data.topLanguages.slice(0, 6);

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Top Languages</Text>
            <Text style={styles.pageSubtitle}>Most used programming languages in {data.year}</Text>

            {languages.length > 0 && (
                <>
                    <View style={styles.languageBar}>
                        {languages.map((lang, index) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: lang.color,
                                    width: `${lang.percentage}%`,
                                }}
                            />
                        ))}
                    </View>

                    {languages.map((lang, index) => (
                        <View key={index} style={styles.languageItem}>
                            <View style={[styles.languageDot, { backgroundColor: lang.color }]} />
                            <Text style={styles.languageName}>{lang.name}</Text>
                            <Text style={styles.languagePercent}>{lang.percentage.toFixed(1)}%</Text>
                        </View>
                    ))}
                </>
            )}
        </Page>
    );
}

function NotesPage({ data }: PDFDocumentProps) {
    const notes = data.notes.slice(0, 6);

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Fun Notes</Text>
            <Text style={styles.pageSubtitle}>AI-powered insights about your {data.year} journey</Text>

            {notes.map((note, index) => (
                <View key={index} style={styles.noteCard}>
                    <Text style={styles.noteEmoji}>{note.emoji}</Text>
                    <Text style={styles.noteTitle}>{note.title}</Text>
                    <Text style={styles.noteContent}>{note.content}</Text>
                </View>
            ))}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Powered by Gemini AI</Text>
            </View>
        </Page>
    );
}

function SummaryPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.pageTitle}>Your {data.year} Highlights</Text>

                <View style={styles.summaryStats}>
                    <View style={[styles.summaryBadge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.green }]}>
                            {data.totalContributions.toLocaleString()} contributions
                        </Text>
                    </View>
                    <View style={[styles.summaryBadge, { backgroundColor: '#ffedd5' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.orange }]}>
                            {data.longestStreak.count} day streak
                        </Text>
                    </View>
                    {data.topLanguages[0] && (
                        <View style={[styles.summaryBadge, { backgroundColor: '#dbeafe' }]}>
                            <Text style={[styles.summaryBadgeText, { color: colors.accent.blue }]}>
                                {data.topLanguages[0].name}
                            </Text>
                        </View>
                    )}
                </View>

                <Text style={styles.thankYou}>Thank you for an amazing {data.year}! 🎉</Text>

                <View style={{ marginTop: 40 }}>
                    <Link src="https://github-yearly-recap.vercel.app" style={styles.footerText}>
                        github-yearly-recap.vercel.app
                    </Link>
                </View>
            </View>
        </Page>
    );
}

// Main Document Component
export function RecapPDFDocument({ data }: PDFDocumentProps) {
    return (
        <Document
            title={`GitHub Recap ${data.year} - ${data.username}`}
            author="GitHub Yearly Recap"
            subject={`GitHub Year in Review for ${data.displayName}`}
        >
            <TitlePage data={data} />
            <OverviewPage data={data} />
            <HeatmapPage data={data} />
            <StreaksPage data={data} />
            <PRsIssuesPage data={data} />
            <ReposPage data={data} />
            <SocialPage data={data} />
            <LanguagesPage data={data} />
            <NotesPage data={data} />
            <SummaryPage data={data} />
        </Document>
    );
}
