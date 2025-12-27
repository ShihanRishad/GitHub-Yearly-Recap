import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';
import { Download01Icon, Share01Icon, Image01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface ShareSlideProps {
    data: RecapData;
    onRegenerate?: () => void;
}

export function ShareSlide({ data, onRegenerate }: ShareSlideProps) {
    const shareUrl = `${window.location.origin}/u/${data.username}/${data.year}`;
    const shareText = `Check out my GitHub Recap ${data.year}! 🚀 ${data.totalContributions} contributions, ${data.longestStreak.count} day streak, and more!`;

    const handleDownload = () => {
        if (data.ogImageUrl) {
            window.open(data.ogImageUrl, '_blank');
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `GitHub Recap ${data.year} - ${data.username}`,
                    text: shareText,
                    url: shareUrl,
                });
            } catch {
                // User cancelled or error, ignore
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="h-full flex flex-col justify-center pt-24 pb-20 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Share Your Recap</h2>
                <p className="text-muted-foreground text-lg">
                    Show off your amazing {data.year}!
                </p>
            </motion.div>

            <div className="max-w-2xl mx-auto w-full">
                {/* OG Image Preview */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="overflow-hidden mb-6 p-0">
                        <CardContent className="p-0">
                            {data.ogImageUrl ? (
                                <img
                                    src={data.ogImageUrl}
                                    alt={`GitHub Recap ${data.year} for ${data.username}`}
                                    className="w-full h-auto"
                                />
                            ) : (
                                <div className="aspect-[1200/630] bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center gap-4">
                                    <HugeiconsIcon icon={Image01Icon} strokeWidth={2} size={48} className="text-muted-foreground/50" />
                                    <p className="text-muted-foreground">OG Image will be generated</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <Button
                        size="lg"
                        onClick={handleDownload}
                        disabled={!data.ogImageUrl}
                        className="gap-2 w-full sm:w-auto"
                    >
                        <HugeiconsIcon icon={Download01Icon} strokeWidth={2} size={18} />
                        Download Image
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={handleShare}
                        className="gap-2 w-full sm:w-auto"
                    >
                        <HugeiconsIcon icon={Share01Icon} strokeWidth={2} size={18} />
                        Share Recap
                    </Button>

                    {onRegenerate && (
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={onRegenerate}
                            className="gap-2 w-full sm:w-auto text-muted-foreground hover:text-foreground"
                        >
                            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={18} />
                            Regenerate
                        </Button>
                    )}
                </motion.div>

                {/* Summary */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 text-center"
                >
                    <div className="inline-flex flex-wrap justify-center gap-2 text-sm">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500">
                            {data.totalContributions.toLocaleString()} contributions
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500">
                            {data.longestStreak.count} day streak
                        </span>
                        {data.topLanguages[0] && (
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                                {data.topLanguages[0].name}
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Thank you message */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center text-muted-foreground mt-8"
                >
                    Thank you for an amazing {data.year}! 🎉
                </motion.p>
            </div>
        </div>
    );
}
