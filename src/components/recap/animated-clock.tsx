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
    // 12 o'clock = 0 degrees (top), 3 o'clock = 90 degrees, etc.
    const targetAngle = (hour % 12) * 30;

    // Clock dimensions
    const size = 160;
    const center = size / 2;
    const radius = size / 2 - 10;
    const handLength = radius - 25;

    // Calculate hand endpoint based on angle
    // const getHandPosition = (angle: number) => {
    //     // Convert to radians, subtract 90 to start from top
    //     const rad = ((angle - 90) * Math.PI) / 180;
    //     return {
    //         x: center + Math.cos(rad) * handLength,
    //         y: center + Math.sin(rad) * handLength,
    //     };
    // };

    // Hour markers
    const hourMarkers = Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const markerLength = i % 3 === 0 ? 10 : 5;
        const outerRadius = radius - 3;
        const innerRadius = outerRadius - markerLength;

        return {
            x1: center + Math.cos(angle) * innerRadius,
            y1: center + Math.sin(angle) * innerRadius,
            x2: center + Math.cos(angle) * outerRadius,
            y2: center + Math.sin(angle) * outerRadius,
            isMain: i % 3 === 0,
            num: i === 0 ? 12 : i,
        };
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-3"
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
                        stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
                        strokeWidth={2}
                    />

                    {/* Inner fill */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius - 2}
                        fill={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}
                    />

                    {/* Hour markers */}
                    {hourMarkers.map((marker, i) => (
                        <g key={i}>
                            <line
                                x1={marker.x1}
                                y1={marker.y1}
                                x2={marker.x2}
                                y2={marker.y2}
                                stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                                strokeWidth={marker.isMain ? 2.5 : 1}
                                strokeLinecap="round"
                            />
                        </g>
                    ))}

                    {/* Hour hand - using motion.g for proper rotation */}
                    <motion.g
                        initial={{ rotate: 0 }}
                        animate={{ rotate: isAnimating ? targetAngle : 0 }}
                        transition={{
                            duration: 1.8,
                            ease: [0.34, 1.56, 0.64, 1],
                            delay: 0.2,
                        }}
                        style={{ transformOrigin: `${center}px ${center}px` }}
                        onAnimationComplete={onAnimationComplete}
                    >
                        <line
                            x1={center}
                            y1={center}
                            x2={center}
                            y2={center - handLength}
                            stroke="#22c55e"
                            strokeWidth={4}
                            strokeLinecap="round"
                        />
                        {/* Hand arrow tip */}
                        <polygon
                            points={`${center},${center - handLength - 6} ${center - 5},${center - handLength + 4} ${center + 5},${center - handLength + 4}`}
                            fill="#22c55e"
                        />
                    </motion.g>

                    {/* Center dot */}
                    <circle
                        cx={center}
                        cy={center}
                        r={5}
                        fill="#22c55e"
                    />
                    <circle
                        cx={center}
                        cy={center}
                        r={2}
                        fill={isDark ? '#000' : '#fff'}
                    />
                </svg>
            </div>

            {/* Time display */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.4 }}
                className="text-center"
            >
                <p className="text-2xl font-bold text-green-500">{timeString}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Peak hour • {commits} commits
                </p>
            </motion.div>
        </motion.div>
    );
}
