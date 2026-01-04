import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserAdd01Icon, UserCheck01Icon, StarIcon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface SocialSlideProps {
    data: RecapData;
}

export function SocialSlide({ data }: SocialSlideProps) {
    return (
        <div className="h-full flex flex-col justify-center pt-24 pb-20 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Community Impact</h2>
                <p className="text-muted-foreground text-lg">
                    Your GitHub social stats in {data.year}
                </p>
            </motion.div>

            {/* Stats cards */}
            <div className="max-w-3xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Followers */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-border/50 bg-gradient-to-br from-blue-500/5 to-transparent overflow-hidden">
                        <CardContent className="p-6 text-center">
                            <motion.div
                                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                            >
                                <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} size={28} className="text-blue-500" />
                            </motion.div>
                            <motion.p
                                className="text-4xl font-bold mb-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                {data.followers.toLocaleString()}
                            </motion.p>
                            <p className="text-muted-foreground">Followers</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Following */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-transparent overflow-hidden">
                        <CardContent className="p-6 text-center">
                            <motion.div
                                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-yellow-500/20 flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                <HugeiconsIcon icon={UserCheck01Icon} strokeWidth={2} size={28} className="text-green-500" />
                            </motion.div>
                            <motion.p
                                className="text-4xl font-bold mb-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                            >
                                {data.following.toLocaleString()}
                            </motion.p>
                            <p className="text-muted-foreground">Following</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Stars */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-border/50 bg-gradient-to-br from-yellow-500/5 to-transparent overflow-hidden">
                        <CardContent className="p-6 text-center">
                            <motion.div
                                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                            >
                                <HugeiconsIcon icon={StarIcon} strokeWidth={2} size={28} className="text-yellow-500" />
                            </motion.div>
                            <motion.p
                                className="text-4xl font-bold mb-1"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                            >
                                {data.totalStars.toLocaleString()}
                            </motion.p>
                            <p className="text-muted-foreground">Total Stars</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Appreciation message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-10"
            >
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/50 bg-background/900 backdrop-blur-sm shadow-sm">
                    <p className="text-sm md:text-base font-medium text-muted-foreground">
                        Thank you for being part of the open source community!
                    </p>
                    <span className="text-xl" role="img" aria-label="heart">❤️</span>
                </div>
            </motion.div>
        </div>
    );
}
