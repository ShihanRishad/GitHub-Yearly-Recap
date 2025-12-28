import { motion } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';

interface AnimatedClockProps {
    hour: number; // 0-23 (24-hour format)
    commits: number;
    isAnimating: boolean;
    onAnimationComplete?: () => void;
}

export function AnimatedClock({ hour, commits, isAnimating, onAnimationComplete }: AnimatedClockProps) {
    const { isDark } = useTheme();

    // Convert 24h to 12h format for display
    const hour12 = hour % 12 || 12;
    const isPM = hour >= 12;
    const timeString = `${hour12}:00 ${isPM ? 'PM' : 'AM'}`;

    // Calculate rotation angle (30 degrees per hour on 12-hour clock)
    // 12 o'clock = 0 degrees, 3 o'clock = 90 degrees, etc.
    const targetAngle = (hour % 12) * 30;

    // Clock dimensions
    const size = 180;
    const center = size / 2;
    const radius = size / 2 - 12;
    const handLength = radius - 20;

    // Hour markers
    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180); // Start from 12 o'clock
        const markerLength = i % 3 === 0 ? 12 : 6; // Longer markers at 12, 3, 6, 9
        const outerRadius = radius - 4;
        const innerRadius = outerRadius - markerLength;

        return {
            x1: center + Math.cos(angle) * innerRadius,
            y1: center + Math.sin(angle) * innerRadius,
            x2: center + Math.cos(angle) * outerRadius,
            y2: center + Math.sin(angle) * outerRadius,
            isMain: i % 3 === 0,
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
        >
            {/* Clock face */}
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Outer ring */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={2}
                    />

                    {/* Inner glow circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius - 8}
                        fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                    />

                    {/* Hour markers */}
                    {hourMarkers.map((marker, i) => (
                        <line
                            key={i}
                            x1={marker.x1}
                            y1={marker.y1}
                            x2={marker.x2}
                            y2={marker.y2}
                            stroke={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
                            strokeWidth={marker.isMain ? 2 : 1}
                            strokeLinecap="round"
                        />
                    ))}

                    {/* Center dot */}
                    <circle
                        cx={center}
                        cy={center}
                        r={6}
                        className="fill-green-500"
                    />

                    {/* Hour hand */}
                    <motion.line
                        x1={center}
                        y1={center}
                        x2={center}
                        y2={center - handLength}
                        stroke="currentColor"
                        strokeWidth={4}
                        strokeLinecap="round"
                        className="text-green-500"
                        style={{ transformOrigin: `${center}px ${center}px` }}
                        initial={{ rotate: -90 }} // Start at 12 o'clock (top)
                        animate={isAnimating ? { rotate: targetAngle - 90 } : { rotate: -90 }}
                        transition={{
                            duration: 2,
                            ease: [0.34, 1.56, 0.64, 1], // Springy easing
                            delay: 0.3,
                        }}
                        onAnimationComplete={onAnimationComplete}
                    />
                </svg>
            </div>

            {/* Time display */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="text-center"
            >
                <p className="text-3xl font-bold text-green-500">{timeString}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Peak productivity hour • {commits} commits
                </p>
            </motion.div>
        </motion.div>
    );
}
