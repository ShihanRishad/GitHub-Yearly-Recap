import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder02Icon, GitBranchIcon, LinkSquare02Icon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';

interface ReposSlideProps {
    data: RecapData;
}

export function ReposSlide({ data }: ReposSlideProps) {
    const repos = [...data.newRepos]
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 6); // Show top 6 by stars

    return (
        <div className="min-h-[70vh] flex flex-col justify-center py-12 px-4">
            {/* Section header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <h2 className="text-3xl md:text-4xl font-bold mb-3">New Repositories</h2>
                <p className="text-muted-foreground text-lg">
                    You created <span className="font-semibold text-foreground">{data.totalReposCreated}</span> new repos in {data.year}
                </p>
            </motion.div>

            {/* Repos grid */}
            {repos.length > 0 ? (
                <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repos.map((repo, index) => (
                        <motion.div
                            key={repo.name}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-border/50 h-full hover:border-primary/30 transition-colors group">
                                <CardContent className="p-5 h-full flex flex-col">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <HugeiconsIcon
                                                icon={Folder02Icon}
                                                strokeWidth={2}
                                                size={18}
                                                className="text-primary shrink-0"
                                            />
                                            <h3 className="font-semibold truncate">{repo.name}</h3>
                                        </div>
                                        <a
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                                        >
                                            <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} size={16} />
                                        </a>
                                    </div>

                                    {repo.description && (
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                                            {repo.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 mt-auto">
                                        {repo.language && (
                                            <Badge variant="secondary" className="text-xs">
                                                {repo.language}
                                            </Badge>
                                        )}
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto">
                                            {repo.stars > 0 && (
                                                <span className="flex items-center gap-1">
                                                    ⭐
                                                    {repo.stars}
                                                </span>
                                            )}
                                            {repo.forks > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <HugeiconsIcon icon={GitBranchIcon} strokeWidth={2} size={14} />
                                                    {repo.forks}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground"
                >
                    <p>No public repositories created this year.</p>
                </motion.div>
            )}

            {/* More repos hint */}
            {data.totalReposCreated > 6 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-sm text-muted-foreground mt-6"
                >
                    And {data.totalReposCreated - 6} more...
                </motion.p>
            )}
        </div>
    );
}
