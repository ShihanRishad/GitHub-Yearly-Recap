import { motion } from 'framer-motion';
import { ContributionHeatmap } from '@/components/recap/contribution-heatmap';
import type { RecapData } from '@/types';

interface HeatmapSlideProps {
    data: RecapData;
}

export function HeatmapSlide({ data }: HeatmapSlideProps) {
    return (
        <div className="h-full flex flex-col justify-center py-12 px-4 relative">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Contribution Graph</h2>
                <p className="text-muted-foreground text-lg">
                    <span className="text-green-500 font-semibold">
                        {data.totalContributions.toLocaleString()}
                    </span>{' '}
                    contributions in the past year
                </p>
            </motion.div>

            {/* Heatmap container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-4xl mx-auto w-full bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/5 shadow-2xl"
            >
                <ContributionHeatmap calendar={data.contributionCalendar} />
            </motion.div>

            {/* Quick stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-x-12 gap-y-6 mt-12 mb-8 text-sm"
            >
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {data.peakStats.topMonth.contributions.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                        in {data.peakStats.topMonth.month} (best month)
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {data.peakStats.topWeek.contributions.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                        in your best week
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                        {Math.round(data.totalContributions / 365)}
                    </p>
                    <p className="text-muted-foreground">
                        daily average
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
