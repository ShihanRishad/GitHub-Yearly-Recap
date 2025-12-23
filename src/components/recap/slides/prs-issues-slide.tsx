import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { GitPullRequestIcon, TaskDone01Icon, CheckmarkCircle02Icon, CancelCircleIcon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface PRsIssuesSlideProps {
    data: RecapData;
}

export function PRsIssuesSlide({ data }: PRsIssuesSlideProps) {
    const { prCounts, issueCounts } = data;

    return (
        <div className="min-h-[70vh] flex flex-col justify-center py-12 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Pull Requests & Issues</h2>
                <p className="text-muted-foreground text-lg">
                    Your collaboration stats for {data.year}
                </p>
            </motion.div>

            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pull Requests Card */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="rounded-xl bg-purple-500/20 p-3 text-purple-500">
                                    <HugeiconsIcon icon={GitPullRequestIcon} strokeWidth={2} size={28} />
                                </div>
                                <h3 className="text-xl font-semibold">Pull Requests</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Opened</span>
                                    <motion.span
                                        className="text-3xl font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: 'spring' }}
                                    >
                                        {prCounts.opened}
                                    </motion.span>
                                </div>

                                <div className="h-px bg-border/50" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} size={18} />
                                        <span>Merged</span>
                                    </div>
                                    <motion.span
                                        className="text-2xl font-bold text-emerald-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        {prCounts.merged}
                                    </motion.span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-red-500">
                                        <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} size={18} />
                                        <span>Closed</span>
                                    </div>
                                    <motion.span
                                        className="text-2xl font-bold text-red-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                    >
                                        {prCounts.closed}
                                    </motion.span>
                                </div>
                            </div>

                            {/* Merge rate */}
                            {prCounts.opened > 0 && (
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <p className="text-sm text-muted-foreground">
                                        Merge rate:{' '}
                                        <span className="font-semibold text-emerald-500">
                                            {Math.round((prCounts.merged / prCounts.opened) * 100)}%
                                        </span>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Issues Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="rounded-xl bg-blue-500/20 p-3 text-blue-500">
                                    <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={2} size={28} />
                                </div>
                                <h3 className="text-xl font-semibold">Issues</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Opened</span>
                                    <motion.span
                                        className="text-3xl font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: 'spring' }}
                                    >
                                        {issueCounts.opened}
                                    </motion.span>
                                </div>

                                <div className="h-px bg-border/50" />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-500">
                                        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} size={18} />
                                        <span>Closed</span>
                                    </div>
                                    <motion.span
                                        className="text-2xl font-bold text-emerald-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: 'spring' }}
                                    >
                                        {issueCounts.closed}
                                    </motion.span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-orange-500">
                                        <HugeiconsIcon icon={TaskDone01Icon} strokeWidth={2} size={18} />
                                        <span>Still Open</span>
                                    </div>
                                    <motion.span
                                        className="text-2xl font-bold text-orange-500"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                    >
                                        {issueCounts.opened - issueCounts.closed}
                                    </motion.span>
                                </div>
                            </div>

                            {/* Resolution rate */}
                            {issueCounts.opened > 0 && (
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <p className="text-sm text-muted-foreground">
                                        Resolution rate:{' '}
                                        <span className="font-semibold text-emerald-500">
                                            {Math.round((issueCounts.closed / issueCounts.opened) * 100)}%
                                        </span>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
