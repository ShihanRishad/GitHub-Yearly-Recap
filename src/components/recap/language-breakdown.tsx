import { motion } from 'framer-motion';
import type { LanguageStats } from '@/types';

interface LanguageBreakdownProps {
    languages: LanguageStats[];
    className?: string;
}

// GitHub language colors fallback map
const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Shell: '#89e051',
    Lua: '#000080',
    Dart: '#00B4AB',
    R: '#198CE7',
    Scala: '#c22d40',
    Elixir: '#6e4a7e',
    Haskell: '#5e5086',
    Clojure: '#db5855',
    Jupyter: '#DA5B0B',
    Markdown: '#083fa1',
};

function getLanguageColor(name: string, defaultColor?: string): string {
    return LANGUAGE_COLORS[name] || defaultColor || '#8b949e';
}

export function LanguageBreakdown({ languages, className = '' }: LanguageBreakdownProps) {
    const maxPercentage = Math.max(...languages.map((l) => l.percentage));

    return (
        <div className={`space-y-4 ${className}`}>
            {languages.map((lang, index) => {
                const width = (lang.percentage / maxPercentage) * 100;
                const color = getLanguageColor(lang.name, lang.color);

                return (
                    <motion.div
                        key={lang.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="font-medium text-sm">{lang.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-mono">
                                {lang.percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${width}%` }}
                                transition={{
                                    delay: index * 0.1 + 0.2,
                                    duration: 0.8,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
