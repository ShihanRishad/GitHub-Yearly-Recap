import { config } from './config.js';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

// GraphQL query for user contributions and stats
const USER_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    login
    name
    avatarUrl
    bio
    followers { totalCount }
    following { totalCount }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
            color
          }
        }
        months {
          name
          firstDay
          totalWeeks
        }
      }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoriesWithContributedCommits
      commitContributionsByRepository(maxRepositories: 20) {
        repository {
          name
          owner { login }
          stargazerCount
          primaryLanguage {
            name
            color
          }
        }
        contributions { totalCount }
      }
    }
    repositories(first: 100, orderBy: {field: CREATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
      totalCount
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        primaryLanguage {
          name
          color
        }
        createdAt
        isPrivate
      }
    }
    pullRequests(first: 1, states: [OPEN, CLOSED, MERGED]) {
      totalCount
    }
    issues(first: 1) {
      totalCount
    }
  }
}
`;

// Query for PR/Issue counts by state
const PR_ISSUE_QUERY = `
query($username: String!) {
  user(login: $username) {
    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        createdAt
        mergedAt
        closedAt
        state
      }
    }
    issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        createdAt
        closedAt
        state
      }
    }
  }
}
`;

export interface GitHubUserData {
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    followers: number;
    following: number;
    contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
            contributionDays: Array<{
                date: string;
                contributionCount: number;
                weekday: number;
                color: string;
            }>;
        }>;
        months: Array<{
            name: string;
            firstDay: string;
            totalWeeks: number;
        }>;
    };
    totalCommits: number;
    repositories: Array<{
        name: string;
        description: string | null;
        url: string;
        stars: number;
        forks: number;
        language: string | null;
        languageColor: string | null;
        createdAt: string;
        isPrivate: boolean;
    }>;
    prCounts: {
        opened: number;
        merged: number;
        closed: number;
    };
    issueCounts: {
        opened: number;
        closed: number;
    };
    languageStats: Map<string, { size: number; color: string }>;
}

async function executeGraphQL(query: string, variables: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.github.token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'GitHub-Recap-App',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
}

export async function fetchGitHubData(username: string, year: number): Promise<GitHubUserData | null> {
    const from = new Date(year, 0, 1).toISOString();
    const to = new Date(year, 11, 31, 23, 59, 59).toISOString();

    try {
        // Fetch main user data
        const data = await executeGraphQL(USER_QUERY, { username, from, to }) as {
            user: {
                login: string;
                name: string | null;
                avatarUrl: string;
                bio: string | null;
                followers: { totalCount: number };
                following: { totalCount: number };
                contributionsCollection: {
                    contributionCalendar: {
                        totalContributions: number;
                        weeks: Array<{
                            contributionDays: Array<{
                                date: string;
                                contributionCount: number;
                                weekday: number;
                                color: string;
                            }>;
                        }>;
                        months: Array<{
                            name: string;
                            firstDay: string;
                            totalWeeks: number;
                        }>;
                    };
                    totalCommitContributions: number;
                    commitContributionsByRepository: Array<{
                        repository: {
                            primaryLanguage: { name: string; color: string } | null;
                        };
                        contributions: { totalCount: number };
                    }>;
                };
                repositories: {
                    nodes: Array<{
                        name: string;
                        description: string | null;
                        url: string;
                        stargazerCount: number;
                        forkCount: number;
                        primaryLanguage: { name: string; color: string } | null;
                        createdAt: string;
                        isPrivate: boolean;
                    }>;
                };
            } | null;
        };

        if (!data.user) {
            return null;
        }

        const user = data.user;

        // Fetch PR/Issue details
        const prIssueData = await executeGraphQL(PR_ISSUE_QUERY, { username }) as {
            user: {
                pullRequests: {
                    nodes: Array<{
                        createdAt: string;
                        mergedAt: string | null;
                        closedAt: string | null;
                        state: string;
                    }>;
                };
                issues: {
                    nodes: Array<{
                        createdAt: string;
                        closedAt: string | null;
                        state: string;
                    }>;
                };
            };
        };

        // Filter PRs/Issues for the year
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        const prsInYear = prIssueData.user.pullRequests.nodes.filter(pr => {
            const created = new Date(pr.createdAt);
            return created >= yearStart && created <= yearEnd;
        });

        const issuesInYear = prIssueData.user.issues.nodes.filter(issue => {
            const created = new Date(issue.createdAt);
            return created >= yearStart && created <= yearEnd;
        });

        // Calculate language stats
        const languageStats = new Map<string, { size: number; color: string }>();
        user.contributionsCollection.commitContributionsByRepository.forEach(repo => {
            if (repo.repository.primaryLanguage) {
                const lang = repo.repository.primaryLanguage;
                const existing = languageStats.get(lang.name) || { size: 0, color: lang.color };
                existing.size += repo.contributions.totalCount;
                languageStats.set(lang.name, existing);
            }
        });

        // Filter repos created in the year
        const reposInYear = user.repositories.nodes.filter(repo => {
            const created = new Date(repo.createdAt);
            return created >= yearStart && created <= yearEnd && !repo.isPrivate;
        });

        return {
            login: user.login,
            name: user.name,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            followers: user.followers.totalCount,
            following: user.following.totalCount,
            contributionCalendar: user.contributionsCollection.contributionCalendar,
            totalCommits: user.contributionsCollection.totalCommitContributions,
            repositories: reposInYear.map(repo => ({
                name: repo.name,
                description: repo.description,
                url: repo.url,
                stars: repo.stargazerCount,
                forks: repo.forkCount,
                language: repo.primaryLanguage?.name || null,
                languageColor: repo.primaryLanguage?.color || null,
                createdAt: repo.createdAt,
                isPrivate: repo.isPrivate,
            })),
            prCounts: {
                opened: prsInYear.length,
                merged: prsInYear.filter(pr => pr.mergedAt).length,
                closed: prsInYear.filter(pr => pr.state === 'CLOSED' && !pr.mergedAt).length,
            },
            issueCounts: {
                opened: issuesInYear.length,
                closed: issuesInYear.filter(issue => issue.closedAt).length,
            },
            languageStats,
        };
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        throw error;
    }
}
