import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HugeiconsIcon } from '@hugeicons/react';

interface StatCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    label: string;
    value: number | string;
    suffix?: string;
    prefix?: string;
    description?: string;
    color?: 'default' | 'green' | 'blue' | 'purple' | 'orange';
    delay?: number;
}

const colorClasses = {
    default: 'text-primary',
    green: 'text-emerald-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
};

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
    const [displayValue, setDisplayValue] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current) return;

        const duration = 1500; // ms
        const startTime = Date.now();
        const startDelay = delay * 1000;

        const timer = setTimeout(() => {
            hasAnimated.current = true;

            const animate = () => {
                const elapsed = Date.now() - startTime - startDelay;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function (ease out cubic)
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * value);

                setDisplayValue(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setDisplayValue(value);
                }
            };

            animate();
        }, startDelay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return <span>{displayValue.toLocaleString()}</span>;
}

export function StatCard({
    icon,
    label,
    value,
    suffix = '',
    prefix = '',
    description,
    color = 'default',
    delay = 0,
}: StatCardProps) {
    const isNumeric = typeof value === 'number';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.4, ease: 'easeOut' }}
        >
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        <div className={`rounded-lg bg-primary/10 p-2.5 ${colorClasses[color]}`}>
                            <HugeiconsIcon icon={icon} strokeWidth={2} size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
                            <p className="text-2xl font-bold tracking-tight">
                                {prefix}
                                {isNumeric ? <AnimatedNumber value={value} delay={delay} /> : value}
                                {suffix}
                            </p>
                            {description && (
                                <p className="text-xs text-muted-foreground mt-1.5 truncate">{description}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 pointer-events-none" />
            </Card>
        </motion.div>
    );
}
