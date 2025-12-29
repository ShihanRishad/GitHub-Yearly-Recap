import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';

interface StatRevealCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    accentColor: string; // e.g., 'green', 'blue', 'purple', 'orange'
    state: 'hidden' | 'featured' | 'settled';
    settledIndex?: number; // Position in the settled row
    className?: string;
}

const stateVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 30,
    },
    featured: {
        opacity: 1,
        scale: 1,
        y: 0,
    },
    settled: {
        opacity: 0.5,
        scale: 0.75,
        y: 0,
        filter: 'blur(1px)',
    },
};

const accentColorMap: Record<string, { bg: string; text: string; border: string }> = {
    green: {
        bg: 'bg-green-500/10',
        text: 'text-green-500',
        border: 'border-green-500/20',
    },
    blue: {
        bg: 'bg-blue-500/10',
        text: 'text-blue-500',
        border: 'border-blue-500/20',
    },
    purple: {
        bg: 'bg-purple-500/10',
        text: 'text-purple-500',
        border: 'border-purple-500/20',
    },
    orange: {
        bg: 'bg-orange-500/10',
        text: 'text-orange-500',
        border: 'border-orange-500/20',
    },
    red: {
        bg: 'bg-red-500/10',
        text: 'text-red-500',
        border: 'border-red-500/20',
    },
};

export function StatRevealCard({
    title,
    value,
    subtitle,
    icon,
    accentColor,
    state,
    className = '',
}: StatRevealCardProps) {
    const colorClasses = accentColorMap[accentColor] || accentColorMap.green;

    return (
        <motion.div
            variants={stateVariants}
            initial="hidden"
            animate={state}
            transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
            }}
            className={className}
        >
            <Card className={`${colorClasses.border} border overflow-hidden`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`rounded-lg ${colorClasses.bg} p-1.5 ${colorClasses.text}`}>
                            <HugeiconsIcon icon={icon} strokeWidth={2} size={16} />
                        </div>
                        <h3 className="font-medium text-sm">{title}</h3>
                    </div>
                    <p className={`text-2xl font-bold ${colorClasses.text}`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
