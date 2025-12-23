import { motion } from 'framer-motion';
import { StatCard } from '@/components/recap/stat-card';
import {
    SourceCodeCircleIcon,
    GitPullRequestIcon,
    TaskDone01Icon,
    FolderOpenIcon,
    Fire03Icon,
    Folder02Icon
} from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface OverviewSlideProps {
    data: RecapData;
}

export function OverviewSlide({ data }: OverviewSlideProps) {
    return (
        <div className="min-h-[70vh] flex flex-col justify-center py-12 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Your Year at a Glance</h2>
                <p className="text-muted-foreground text-lg">
                    Here's what you accomplished in {data.year}
                </p>
            </motion.div>

            {/* Stats grid */}
            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    icon={SourceCodeCircleIcon}
                    label="Total Contributions"
                    value={data.totalContributions}
                    color="green"
                    delay={0.1}
                />
                <StatCard
                    icon={Fire03Icon}
                    label="Longest Streak"
                    value={data.longestStreak.count}
                    suffix=" days"
                    color="orange"
                    delay={0.2}
                />
                <StatCard
                    icon={GitPullRequestIcon}
                    label="Pull Requests"
                    value={data.prCounts.opened}
                    description={`${data.prCounts.merged} merged`}
                    color="purple"
                    delay={0.3}
                />
                <StatCard
                    icon={TaskDone01Icon}
                    label="Issues"
                    value={data.issueCounts.opened}
                    description={`${data.issueCounts.closed} closed`}
                    color="blue"
                    delay={0.4}
                />
                <StatCard
                    icon={Folder02Icon}
                    label="New Repos"
                    value={data.totalReposCreated}
                    delay={0.5}
                />
                <StatCard
                    icon={FolderOpenIcon}
                    label="Stars Earned"
                    value={data.totalStars}
                    color="orange"
                    delay={0.6}
                />
            </div>

            {/* Highlight */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center mt-10"
            >
                <p className="text-muted-foreground">
                    Your busiest day was{' '}
                    <span className="font-semibold text-foreground">
                        {new Date(data.peakStats.topDay.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>{' '}
                    with{' '}
                    <span className="font-bold text-green-500">
                        {data.peakStats.topDay.contributions} contributions
                    </span>
                </p>
            </motion.div>
        </div>
    );
}
