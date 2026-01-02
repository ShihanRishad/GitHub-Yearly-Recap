import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Link,
    Svg,
    Path,
    G,
    Circle,
    Font,
    Image,
} from '@react-pdf/renderer';
import { getMockRecapData } from './_lib/mock-data.js';
import { getRecap } from './_lib/firestore.js';
import React from 'react';
import type { RecapData, NewRepo, CommentaryNote, LanguageStats } from './_lib/mock-data.js';
import type { ContributionWeek, ContributionDay } from './_lib/types.js';

// Light theme colors
const colors = {
    primary: '#1f2937',
    muted: '#6b7280',
    border: '#e5e7eb',
    background: {
        white: "#ffffff",
        orange: "#fff7f2",
        yellow: "#fffcecff",
        green: "#f3fcf2ff",
        blue: "#f6f5ff",
        purple: '#f9f2ffff',
        pink: '#ffeef6ff',
    },
    accent: {
        green: '#22c55e',
        orange: '#f97316',
        blue: '#3b82f6',
        purple: '#a855f7',
        pink: '#ec4899',
    },
    heatmap: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
};



// Register emoji source for global emoji support
Font.registerEmojiSource({
    format: 'png',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});

// Styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        paddingTop: 65,
        backgroundColor: colors.background.white,
        fontFamily: 'Helvetica',
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    pageSubtitle: {
        fontSize: 16,
        color: colors.muted,
        marginBottom: 30,
        textAlign: 'center',
    },
    // Title page
    titlePageWrapper: {
        display: "flex",
        alignItems: "center",
        flex: 1,
        width: '100%',
    },
    titlePage: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        maxWidth: 400,
    },
    titleYear: {
        marginBottom: 60,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    titleAvatar: {
        width: 180,
        height: 180,
        borderRadius: 100,
        marginBottom: 16,
    },
    recapLogo: {
        marginBottom: 8,
        height: 50,
    },
    titleYearText: {
        fontSize: 65,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 8,
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
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        width: '45%',
        padding: 16,
        paddingHorizontal: 24,
        paddingVertical: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.border,
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
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: colors.border,
    },
    streakValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    streakLabel: {
        fontSize: 14,
        color: colors.muted,
        marginBottom: 8,
    },
    streakDates: {
        fontSize: 11,
        color: colors.muted,
        marginTop: 8,
    },
    // Repos list
    repoItem: {
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    repoStatText: {
        fontSize: 10,
        color: colors.muted,
    },
    // Languages
    languageBar: {
        height: 16,
        borderRadius: 8,
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 40,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        fontSize: 24,
    },
    languageDot: {
        width: 18,
        height: 18,
        borderRadius: 12,
        marginRight: 8,
    },
    languageName: {
        fontSize: 18,
        color: colors.primary,
        flex: 1,
    },
    languagePercent: {
        fontSize: 18,
        color: colors.muted,
    },
    // Notes
    noteCard: {
        width: '45%',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    noteEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 6,
    },
    noteContent: {
        fontSize: 11,
        color: colors.muted,
        lineHeight: 1.4,
    },
    // Footer
    extraText: {
        textAlign: "center",

    },

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

    // Summary page
    summaryStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        marginTop: 40,
        maxWidth: 500,
    },
    summaryBadge: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    summaryBadgeLabel: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.8,
        textAlign: 'center',
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

function StarIcon({ size = 10, color = colors.muted }: { size?: number; color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" >
            <Path
                fill={color}
                d="M11.334 3.549c.21-.645 1.122-.645 1.332 0L14.2 8.272a.7.7 0 0 0 .666.483h4.966c.678 0 .96.868.411 1.267l-4.017 2.918a.7.7 0 0 0-.254.783l1.534 4.723c.21.645-.529 1.18-1.077.782l-4.017-2.918a.7.7 0 0 0-.823 0L7.57 19.228c-.548.399-1.287-.137-1.077-.782l1.534-4.723a.7.7 0 0 0-.254-.783l-4.017-2.918c-.549-.399-.267-1.267.411-1.267h4.966a.7.7 0 0 0 .666-.483z"
            />
        </Svg>
    );
}

function ForkIcon({ size = 10, color = colors.muted }: { size?: number; color?: string }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" >
            <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" >
                <Circle cx="12" cy="18" r="3" />
                <Circle cx="6" cy="6" r="3" />
                <Circle cx="18" cy="6" r="3" />
                <Path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9m6 3v3" />
            </G>
        </Svg>
    );
}

// Page Components
function TitlePage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <View style={styles.titlePageWrapper}>
                <View style={styles.titlePage}>
                    <View style={styles.titleYear}>
                        <Svg width="426" height="139" viewBox="0 0 426 139" fill="none" style={styles.recapLogo}>
                            <Path fill-rule="evenodd" clip-rule="evenodd" d="M70.9617 0C31.7554 0 0 31.7487 0 70.9468C0 102.341 20.3128 128.857 48.5201 138.258C52.0682 138.878 53.3987 136.75 53.3987 134.888C53.3987 133.203 53.31 127.616 53.31 121.674C35.4809 124.955 30.8684 117.328 29.4491 113.337C28.6508 111.298 25.1914 105.001 22.1755 103.316C19.6919 101.986 16.1438 98.7047 22.0868 98.616C27.6751 98.5273 31.6667 103.76 32.9972 105.888C39.3838 116.619 49.5845 113.604 53.6648 111.741C54.2857 107.13 56.1485 104.026 58.1886 102.252C42.3996 100.478 25.901 94.3592 25.901 67.2221C25.901 59.5066 28.6508 53.1214 33.1746 48.1551C32.465 46.3814 29.9813 39.1094 33.8842 29.3542C33.8842 29.3542 39.8273 27.4919 53.3987 36.6263C59.0756 35.03 65.1074 34.2318 71.1391 34.2318C77.1709 34.2318 83.2026 35.03 88.8796 36.6263C102.451 27.4032 108.394 29.3542 108.394 29.3542C112.297 39.1094 109.813 46.3814 109.104 48.1551C113.627 53.1214 116.377 59.4179 116.377 67.2221C116.377 94.4479 99.7899 100.478 84.001 102.252C86.5733 104.469 88.7909 108.726 88.7909 115.377C88.7909 124.866 88.7022 132.493 88.7022 134.888C88.7022 136.75 90.0327 138.967 93.5808 138.258C121.611 128.857 141.923 102.252 141.923 70.9468C141.923 31.7487 110.168 0 70.9617 0Z" fill="black" />
                            <Path d="M224.96 113.413C217.478 113.413 212.705 108.511 210.641 98.7072L207.674 84.3882C206.728 79.7442 205.653 76.2182 204.449 73.8102C203.331 71.4022 201.74 69.7682 199.676 68.9082C197.698 68.0482 194.946 67.6182 191.42 67.6182C190.216 67.6182 189.27 67.9622 188.582 68.6502C187.894 69.2522 187.55 70.0262 187.55 70.9722V103.222C187.55 105.028 187.894 106.275 188.582 106.963C189.27 107.565 190.818 108.081 193.226 108.511L197.999 109.285C198.945 109.457 199.418 109.93 199.418 110.704C199.418 111.736 198.773 112.252 197.483 112.252H171.296C170.006 112.252 169.361 111.779 169.361 110.833C169.361 110.059 169.92 109.543 171.038 109.285L174.005 108.769C175.811 108.425 176.972 107.952 177.488 107.35C178.09 106.748 178.391 105.544 178.391 103.738V27.8862C178.391 26.0802 178.09 24.8762 177.488 24.2742C176.972 23.6722 175.811 23.1992 174.005 22.8552L171.038 22.3392C169.92 22.0812 169.361 21.5652 169.361 20.7912C169.361 19.8452 170.006 19.3722 171.296 19.3722H197.483C202.557 19.3722 207.072 20.3612 211.028 22.3392C214.984 24.3172 218.08 27.0692 220.316 30.5952C222.552 34.0352 223.67 38.0342 223.67 42.5922C223.67 48.0102 222.036 52.9122 218.768 57.2982C215.5 61.5982 211.372 64.6512 206.384 66.4572C205.782 66.6292 205.438 66.9302 205.352 67.3602C205.352 67.7042 205.653 68.0052 206.255 68.2632C209.007 69.5532 211.157 71.3592 212.705 73.6812C214.339 76.0032 215.586 79.0992 216.446 82.9692L219.284 96.1272C220.23 100.599 221.348 103.781 222.638 105.673C223.928 107.565 225.562 108.511 227.54 108.511C228.228 108.511 228.83 108.425 229.346 108.253C229.948 107.995 230.679 107.565 231.539 106.963C232.227 106.533 232.872 106.447 233.474 106.705C234.076 106.877 234.377 107.307 234.377 107.995C234.377 109.457 233.431 110.747 231.539 111.865C229.647 112.897 227.454 113.413 224.96 113.413ZM196.193 64.3932C202.041 64.3932 206.47 62.4582 209.48 58.5882C212.49 54.6322 213.995 49.3862 213.995 42.8502C213.995 36.4862 212.232 31.5412 208.706 28.0152C205.266 24.4032 200.493 22.5972 194.387 22.5972C189.829 22.5972 187.55 24.3172 187.55 27.7572V57.2982C187.55 62.0282 190.431 64.3932 196.193 64.3932ZM252.086 113.413C247.958 113.413 244.26 112.037 240.992 109.285C237.724 106.533 235.101 102.663 233.123 97.6752C231.231 92.6012 230.285 86.7532 230.285 80.1312C230.285 73.3372 231.274 67.3602 233.252 62.2002C235.23 57.0402 237.939 52.9982 241.379 50.0742C244.819 47.1502 248.646 45.6882 252.86 45.6882C257.934 45.6882 262.019 47.7952 265.115 52.0092C268.297 56.1372 269.888 62.8882 269.888 72.2622C269.888 75.1002 268.813 76.5192 266.663 76.5192H242.153C240.433 76.5192 239.573 77.5082 239.573 79.4862C239.573 88.6022 240.906 95.4392 243.572 99.9972C246.238 104.555 249.635 106.834 253.763 106.834C257.031 106.834 259.697 105.673 261.761 103.351C263.825 101.029 265.502 97.1162 266.792 91.6122C267.05 90.6662 267.609 90.1932 268.469 90.1932C269.501 90.1932 269.888 91.0532 269.63 92.7732C268.254 100.427 266.061 105.802 263.051 108.898C260.041 111.908 256.386 113.413 252.086 113.413ZM241.766 73.2942H254.795C258.923 73.2942 260.987 71.1442 260.987 66.8442C260.987 61.2542 260.299 56.8682 258.923 53.6862C257.547 50.5042 255.483 48.9132 252.731 48.9132C249.377 48.9132 246.539 50.8482 244.217 54.7182C241.981 58.5882 240.519 64.0922 239.831 71.2302C239.659 72.6062 240.304 73.2942 241.766 73.2942ZM293.814 113.413C290.03 113.413 286.59 112.166 283.494 109.672C280.484 107.092 278.076 103.437 276.27 98.7072C274.464 93.9772 273.561 88.3442 273.561 81.8082C273.561 74.4982 274.636 68.1342 276.786 62.7162C279.022 57.2982 282.032 53.1272 285.816 50.2032C289.6 47.1932 293.814 45.6882 298.458 45.6882C302.414 45.6882 305.51 46.4622 307.746 48.0102C308.606 48.6122 309.036 49.5582 309.036 50.8482L309.294 66.5862C309.294 67.8762 308.778 68.5212 307.746 68.5212C306.8 68.5212 306.198 67.9622 305.94 66.8442C304.736 62.1142 303.575 58.4592 302.457 55.8792C301.339 53.2992 300.178 51.5362 298.974 50.5902C297.77 49.5582 296.437 49.0422 294.975 49.0422C293.255 49.0422 291.449 50.0312 289.557 52.0092C287.751 53.9872 286.203 57.2122 284.913 61.6842C283.709 66.0702 283.107 71.8752 283.107 79.0992C283.107 88.3012 284.268 95.2242 286.59 99.8682C288.998 104.512 292.094 106.834 295.878 106.834C298.888 106.834 301.382 105.587 303.36 103.093C305.424 100.599 307.187 96.0842 308.649 89.5482C308.907 88.6022 309.423 88.1292 310.197 88.1292C311.229 88.1292 311.616 88.9892 311.358 90.7092C310.412 96.7292 309.079 101.416 307.359 104.77C305.725 108.038 303.747 110.317 301.425 111.607C299.189 112.811 296.652 113.413 293.814 113.413ZM327.207 113.413C323.595 113.413 320.628 112.295 318.306 110.059C315.984 107.737 314.823 104.684 314.823 100.9C314.823 97.2022 315.984 93.7192 318.306 90.4512C320.628 87.0972 323.81 84.0872 327.852 81.4212C331.894 78.7552 336.495 76.6052 341.655 74.9712C342.773 74.6272 343.332 73.8962 343.332 72.7782V61.0392C343.332 56.9112 342.687 53.9872 341.397 52.2672C340.107 50.4612 338.344 49.5582 336.108 49.5582C333.958 49.5582 331.98 50.5472 330.174 52.5252C328.454 54.4172 327.207 57.6422 326.433 62.2002C326.003 64.9522 325.057 66.9732 323.595 68.2632C322.219 69.4672 320.8 70.0692 319.338 70.0692C316.93 70.0692 315.726 68.8652 315.726 66.4572C315.726 63.9632 316.414 61.5122 317.79 59.1042C319.252 56.6102 321.144 54.3742 323.466 52.3962C325.788 50.3322 328.325 48.6982 331.077 47.4942C333.829 46.2902 336.581 45.6882 339.333 45.6882C347.847 45.6882 352.104 50.6332 352.104 60.5232V99.9972C352.104 103.609 353.007 105.415 354.813 105.415C355.931 105.415 356.963 104.684 357.909 103.222C358.855 101.674 359.328 99.0942 359.328 95.4822C359.328 94.1062 359.887 93.4182 361.005 93.4182C362.037 93.4182 362.553 94.1492 362.553 95.6112C362.553 101.889 361.435 106.447 359.199 109.285C357.049 112.037 354.598 113.413 351.846 113.413C349.782 113.413 348.148 112.596 346.944 110.962C345.74 109.242 344.923 107.221 344.493 104.899C344.407 104.039 344.02 103.609 343.332 103.609C342.73 103.523 342.128 103.91 341.526 104.77C339.462 107.608 337.355 109.758 335.205 111.22C333.055 112.682 330.389 113.413 327.207 113.413ZM330.69 107.479C332.926 107.479 334.99 106.705 336.882 105.157C338.774 103.523 340.322 101.373 341.526 98.7072C342.73 96.0412 343.332 93.0312 343.332 89.6772V80.2602C343.332 78.6262 342.429 78.1532 340.623 78.8412C335.377 80.7332 331.292 83.3562 328.368 86.7102C325.53 89.9782 324.111 93.9342 324.111 98.5782C324.111 104.512 326.304 107.479 330.69 107.479ZM364.155 138.697C362.865 138.697 362.22 138.224 362.22 137.278C362.22 136.332 362.779 135.816 363.897 135.73L365.703 135.472C367.509 135.214 368.67 134.698 369.186 133.924C369.788 133.15 370.089 131.86 370.089 130.054V60.2652C370.089 58.7172 369.831 57.6852 369.315 57.1692C368.885 56.5672 368.068 56.1802 366.864 56.0082L364.155 55.6212C363.037 55.5352 362.478 55.0622 362.478 54.2022C362.478 53.5142 363.166 53.0412 364.542 52.7832C367.208 52.3532 369.229 51.6652 370.605 50.7192C372.067 49.7732 373.572 48.6122 375.12 47.2362C375.894 46.4622 376.539 46.0752 377.055 46.0752C377.829 46.0752 378.216 46.5912 378.216 47.6232V51.6222C378.216 52.2242 378.474 52.6542 378.99 52.9122C379.506 53.0842 380.108 52.8262 380.796 52.1382L382.215 50.7192C383.935 48.9992 385.698 47.7522 387.504 46.9782C389.31 46.1182 391.374 45.6882 393.696 45.6882C397.652 45.6882 401.135 47.0212 404.145 49.6872C407.241 52.2672 409.649 55.8792 411.369 60.5232C413.175 65.1672 414.078 70.6282 414.078 76.9062C414.078 84.0442 412.96 90.3652 410.724 95.8692C408.488 101.373 405.392 105.673 401.436 108.769C397.566 111.865 393.094 113.413 388.02 113.413C385.44 113.413 383.161 112.94 381.183 111.994C379.635 111.306 378.861 111.779 378.861 113.413V130.054C378.861 131.86 379.119 133.064 379.635 133.666C380.237 134.354 381.441 134.827 383.247 135.085L388.02 135.73C388.966 135.902 389.439 136.375 389.439 137.149C389.439 138.181 388.794 138.697 387.504 138.697H364.155ZM388.407 110.188C393.223 110.188 397.093 107.35 400.017 101.674C403.027 95.9982 404.532 88.3442 404.532 78.7122C404.532 69.8542 403.242 63.1032 400.662 58.4592C398.082 53.8152 394.427 51.4932 389.697 51.4932C386.773 51.4932 384.236 52.6972 382.086 55.1052C379.936 57.5132 378.861 60.8672 378.861 65.1672V97.6752C378.861 101.545 379.721 104.598 381.441 106.834C383.247 109.07 385.569 110.188 388.407 110.188Z" fill="black" />
                        </Svg>
                        <Text style={styles.titleYearText}>
                            {data.year}
                        </Text>
                    </View>
                    {data.avatarUrl && (
                        <Image
                            src={data.avatarUrl}
                            style={styles.titleAvatar}
                        />
                    )}
                    <Text style={styles.titleName}>{data.displayName}</Text>
                    <Text style={styles.titleUsername}>@{data.username}</Text>
                    <Text style={styles.titleLabel}>{data.bio}</Text>
                </View>
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

            <View style={[styles.statsGrid]}>
                <View style={[styles.statCard, { backgroundColor: colors.background.green }]}>
                    <Text style={styles.statLabel}>Total Contributions</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.totalContributions.toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background.orange }]}>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.longestStreak.count}
                        <Text style={styles.statSuffix}> days</Text>
                    </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background.purple }]}>
                    <Text style={styles.statLabel}>Pull Requests</Text>
                    <Text style={[styles.statValue, { color: colors.accent.purple }]}>
                        {data.prCounts.opened}
                    </Text>
                    <Text style={styles.statDescription}>{data.prCounts.merged} merged</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background.blue }]}>
                    <Text style={styles.statLabel}>Issues</Text>
                    <Text style={[styles.statValue, { color: colors.accent.blue }]}>
                        {data.issueCounts.opened}
                    </Text>
                    <Text style={styles.statDescription}>{data.issueCounts.closed} closed</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.background.blue }]}>
                    <Text style={styles.statLabel}>New Repos</Text>
                    <Text style={styles.statValue}>{data.totalReposCreated}</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.background.orange }]}>
                    <Text style={styles.statLabel}>Stars Earned</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.totalStars}
                    </Text>
                </View>
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
                {weeks.map((week: ContributionWeek, weekIndex: number) => (
                    <View key={weekIndex} style={styles.heatmapWeek}>
                        {week.contributionDays.map((day: ContributionDay, dayIndex: number) => (
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

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { width: '45%', backgroundColor: colors.background.purple }]}>
                    <Text style={styles.statLabel}>Best Month</Text>
                    <Text style={[styles.statValue, { color: colors.accent.purple }]}>
                        {data.peakStats.topMonth.contributions}
                    </Text>
                    <Text style={styles.statDescription}>in {data.peakStats.topMonth.month}</Text>
                </View>

                <View style={[styles.statCard, { width: '45%', backgroundColor: colors.background.orange }]}>
                    <Text style={styles.statLabel}>Best Week</Text>
                    <Text style={[styles.statValue, { color: colors.accent.orange }]}>
                        {data.peakStats.topWeek.contributions}
                    </Text>
                    <Text style={styles.statDescription}>contributions</Text>
                </View>

                <View style={[styles.statCard, { width: '45%', backgroundColor: colors.background.green }]}>
                    <Text style={styles.statLabel}>Most Active Day</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.peakStats.topDay.contributions}
                    </Text>
                    <Text style={styles.statDescription}>
                        {formatDate(data.peakStats.topDay.date)}
                    </Text>
                </View>

                <View style={[styles.statCard, { width: '45%', backgroundColor: colors.background.blue }]}>
                    <Text style={styles.statLabel}>Daily Average</Text>
                    <Text style={[styles.statValue, { color: colors.accent.blue }]}>
                        {Math.round(data.totalContributions / 365)}
                    </Text>
                    <Text style={styles.statDescription}>contributions/day</Text>
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

            <View style={[styles.streakCard, { backgroundColor: colors.background.orange }]}>
                <Text style={styles.streakLabel}>Longest Streak</Text>
                <Text style={[styles.streakValue, { color: colors.accent.orange }]}>
                    {data.longestStreak.count}
                    <Text style={styles.statSuffix}> days</Text>
                </Text>
                <Text style={styles.streakDates}>
                    {formatDate(data.longestStreak.startDate)} - {formatDate(data.longestStreak.endDate)}
                </Text>
            </View>

            <View style={[styles.streakCard, { backgroundColor: colors.background.green }]}>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={[styles.streakValue, { color: colors.accent.green }]}>
                    {data.currentStreak.count}
                    <Text style={styles.statSuffix}> days</Text>
                </Text>
                {data.currentStreak.count > 0 && (
                    <Text style={styles.streakDates}>
                        From {formatDate(data.currentStreak.startDate)}
                    </Text>
                )}
            </View>

            <View style={[styles.streakCard, { backgroundColor: colors.background.blue }]}>
                <Text style={styles.streakLabel}>Most Active Day</Text>
                <Text style={[styles.streakValue, { color: colors.accent.blue }]}>
                    {data.peakStats.topDay.contributions}
                    <Text style={styles.statSuffix}> contributions</Text>
                </Text>
                <Text style={styles.streakDates}>
                    {data.peakStats.topDay.dayOfWeek}, {formatDate(data.peakStats.topDay.date)}
                </Text>
            </View>
        </Page>
    );
}

function PRsIssuesPage({ data }: PDFDocumentProps) {
    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Pull Requests & Issues</Text>
            <Text style={styles.pageSubtitle}>Your collaboration activity in {data.year}</Text>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>Pull Requests Opened</Text>
                    <Text style={[styles.statValue, { color: colors.accent.purple }]}>
                        {data.prCounts.opened}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>Pull Requests Merged</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.prCounts.merged}
                    </Text>
                </View>
                <View style={[styles.statCard, { width: '45%' }]}>
                    <Text style={styles.statLabel}>Pull Requests Closed</Text>
                    <Text style={[styles.statValue, { color: colors.accent.green }]}>
                        {data.prCounts.closed}
                    </Text>
                </View>
                {data.prCounts.merged > 0 && (
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Merge Rate</Text>
                        <Text style={styles.statValue}>{Math.round((data.prCounts.merged / data.prCounts.opened) * 100)}%</Text>
                    </View>
                )}
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

        </Page>
    );
}

function ReposPage({ data }: PDFDocumentProps) {
    const repos = [...data.newRepos]
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 6);

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
                        {repo.stars > 0 && (
                            <View style={styles.repoStat}>
                                <StarIcon size={10} color={colors.accent.orange} />
                                <Text style={styles.repoStatText}>{repo.stars}</Text>
                            </View>
                        )}
                        {repo.forks > 0 && (
                            <View style={styles.repoStat}>
                                <ForkIcon size={10} color={colors.muted} />
                                <Text style={styles.repoStatText}>{repo.forks}</Text>
                            </View>
                        )}
                        {repo.language && <Text style={styles.repoStatText}>{repo.language}</Text>}
                    </View>
                </View>
            ))}

            {data.totalReposCreated > 6 && (
                <View style={{ marginTop: 10, alignItems: 'center' }}>
                    <Text style={[styles.repoStat, { fontSize: 11 }]}>And {data.totalReposCreated - 6} more...</Text>
                </View>
            )}
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
                        {languages.map((lang: LanguageStats, index: number) => (
                            <View
                                key={index}
                                style={{
                                    backgroundColor: lang.color,
                                    width: `${lang.percentage}%`,

                                }}
                            />
                        ))}
                    </View>

                    {languages.map((lang: LanguageStats, index: number) => (
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

// Helper to get category colors for notes
function getNoteColors(category: string) {
    switch (category) {
        case 'streak':
            return { bg: colors.background.orange, border: colors.accent.orange };
        case 'productivity':
            return { bg: colors.background.green, border: colors.accent.green };
        case 'languages':
            return { bg: colors.background.blue, border: colors.accent.blue };
        case 'social':
            return { bg: colors.background.pink, border: colors.accent.pink };
        case 'repos':
            return { bg: colors.background.purple, border: colors.accent.purple };
        default:
            return { bg: '#f9fafb', border: colors.border };
    }
}

function NotesPage({ data }: PDFDocumentProps) {
    const notes = data.notes.slice(0, 6);

    return (
        <Page size="A4" style={styles.page}>
            <Text style={styles.pageTitle}>Fun Notes</Text>
            <Text style={styles.pageSubtitle}>Some fun insights about your {data.year} journey</Text>

            <View style={styles.statsGrid}>
                {notes.map((note: CommentaryNote, index: number) => {
                    const { bg, border } = getNoteColors(note.category);
                    return (
                        <View key={index} style={[styles.noteCard, { backgroundColor: bg, borderColor: border }]}>
                            {note.emoji && <Text style={styles.noteEmoji}>{note.emoji}</Text>}
                            <Text style={styles.noteTitle}>{note.title}</Text>
                            <Text style={styles.noteContent}>{note.content}</Text>
                        </View>
                    );
                })}
            </View>

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
                <Text style={styles.pageTitle}>Your {data.year} was strong.</Text>

                <View style={styles.summaryStats}>
                    {/* Original 3 */}
                    <View style={[styles.summaryBadge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.green }]}>
                            {data.totalContributions.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.green }]}>contributions</Text>
                    </View>
                    <View style={[styles.summaryBadge, { backgroundColor: '#ffedd5' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.orange }]}>
                            {data.longestStreak.count} days
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.orange }]}>longest streak</Text>
                    </View>
                    {data.topLanguages[0] && (
                        <View style={[styles.summaryBadge, { backgroundColor: '#dbeafe' }]}>
                            <Text style={[styles.summaryBadgeText, { color: colors.accent.blue }]}>
                                {data.topLanguages[0].name}
                            </Text>
                            <Text style={[styles.summaryBadgeLabel, { color: colors.accent.blue }]}>top language</Text>
                        </View>
                    )}

                    {/* New 6 */}
                    <View style={[styles.summaryBadge, { backgroundColor: '#fae8ff' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.purple }]}>
                            {data.totalStars.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.purple }]}>stars earned</Text>
                    </View>

                    <View style={[styles.summaryBadge, { backgroundColor: '#f3e8ff' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.purple }]}>
                            {data.prCounts.opened.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.purple }]}>PRs opened</Text>
                    </View>

                    <View style={[styles.summaryBadge, { backgroundColor: '#e0f2fe' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.blue }]}>
                            {data.issueCounts.opened.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.blue }]}>issues opened</Text>
                    </View>

                    <View style={[styles.summaryBadge, { backgroundColor: '#fce7f3' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.pink }]}>
                            {data.totalReposCreated.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.pink }]}>new repos</Text>
                    </View>

                    <View style={[styles.summaryBadge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.green }]}>
                            {data.peakStats.topDay.dayOfWeek}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.green }]}>most active</Text>
                    </View>

                    <View style={[styles.summaryBadge, { backgroundColor: '#ffedd5' }]}>
                        <Text style={[styles.summaryBadgeText, { color: colors.accent.orange }]}>
                            {data.followers.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryBadgeLabel, { color: colors.accent.orange }]}>followers</Text>
                    </View>

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
function RecapPDFDocument({ data }: PDFDocumentProps) {
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



export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, year: queryYear, demo } = req.query;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const year = queryYear
        ? (typeof queryYear === 'number' ? queryYear : parseInt(queryYear as string, 10))
        : new Date().getFullYear();

    const isDemo = demo === 'true';

    if (isNaN(year) || year < 2008 || year > new Date().getFullYear()) {
        return res.status(400).json({ error: 'Invalid year' });
    }

    try {
        let recapData;

        if (isDemo) {
            recapData = getMockRecapData(username, year);
        } else {
            const existingRecap = await getRecap(username, year);

            if (!existingRecap || existingRecap.status !== 'ready' || !existingRecap.processedJson) {
                return res.status(404).json({
                    error: 'Recap not found or not ready',
                    message: 'Please generate a recap first by visiting the recap page',
                });
            }

            recapData = existingRecap.processedJson;
        }

        // Generate PDF
        const { renderToBuffer } = await import('@react-pdf/renderer');
        const pdfBuffer = await renderToBuffer(
            React.createElement(RecapPDFDocument, { data: recapData as any }) as any
        );

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${username}-${year}-recap.pdf"`
        );
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF buffer
        return res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Error generating PDF:', error);
        return res.status(500).json({
            error: 'Failed to generate PDF',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
