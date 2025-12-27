import { motion } from 'framer-motion';
import { LanguageBreakdown } from '@/components/recap/language-breakdown';
import type { RecapData } from '@/types';

interface LanguagesSlideProps {
    data: RecapData;
}

export function LanguagesSlide({ data }: LanguagesSlideProps) {
    const topLanguages = data.topLanguages.slice(0, 8);
    const topLanguage = topLanguages[0];

    return (
        <div className="h-full flex flex-col justify-center pt-24 pb-20 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Top Languages</h2>
                <p className="text-muted-foreground text-lg">
                    Your most used programming languages in {data.year}
                </p>
            </motion.div>

            <div className="max-w-3xl mx-auto w-full">
                {topLanguages.length > 0 ? (
                    <>
                        {/* Top language highlight */}
                        {topLanguage && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-center mb-10 p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-border/50"
                            >
                                <p className="text-sm text-muted-foreground mb-2">Your #1 language</p>
                                <div className="flex items-center justify-center gap-3">
                                    <span
                                        className="w-5 h-5 rounded-full shrink-0"
                                        style={{ backgroundColor: topLanguage.color }}
                                    />
                                    <span className="text-3xl font-bold">{topLanguage.name}</span>
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    <span className="font-semibold text-foreground">{topLanguage.percentage.toFixed(1)}%</span> of your code
                                </p>
                            </motion.div>
                        )}

                        {/* Language breakdown bars */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <LanguageBreakdown languages={topLanguages} />
                        </motion.div>

                        {/* Fun fact */}
                        {topLanguages.length >= 3 && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="text-center text-sm text-muted-foreground mt-10"
                            >
                                Your top 3 languages account for{' '}
                                <span className="font-semibold text-foreground">
                                    {(topLanguages[0].percentage + topLanguages[1].percentage + topLanguages[2].percentage).toFixed(1)}%
                                </span>{' '}
                                of your code
                            </motion.p>
                        )}
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground"
                    >
                        <p>No language data available.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
