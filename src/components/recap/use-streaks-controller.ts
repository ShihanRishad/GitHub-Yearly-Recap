import { useState, useEffect, useCallback, useRef } from 'react';

// Animation phases
export type StreakPhase =
    | 'heatmap'        // Full heatmap view (initial)
    | 'rotate'         // Rotate to vertical
    | 'separate'       // Months separate apart
    | 'grid'           // Months go to 3x4 grid
    | 'zoomMonths'     // Zoom to fit all months
    | 'activeMonth'    // Zoom to most active month
    | 'activeWeek'     // Zoom to most active week
    | 'activeDay'      // Zoom to most active day
    | 'longestStreak'  // Pan to longest streak
    | 'currentStreak'  // Pan to current streak
    | 'clock'          // Show clock
    | 'final';         // Final settled state

const PHASE_ORDER: StreakPhase[] = [
    'heatmap', 'rotate', 'separate', 'grid', 'zoomMonths',
    'activeMonth', 'activeWeek', 'activeDay',
    'longestStreak', 'currentStreak', 'clock', 'final'
];

const PHASE_DURATIONS: Record<StreakPhase, number> = {
    heatmap: 1000,
    rotate: 1500,
    separate: 1500,
    grid: 1500,
    zoomMonths: 2000,
    activeMonth: 3000,    // Longer for reading
    activeWeek: 3000,
    activeDay: 3000,
    longestStreak: 2500,
    currentStreak: 2500,
    clock: 5000,
    final: 999999,
};

interface UseStreaksControllerProps {
    isPaused: boolean;
    hasCurrentStreak: boolean;
    hasTopHour: boolean;
}

export function useStreaksController({ isPaused, hasCurrentStreak, hasTopHour }: UseStreaksControllerProps) {
    const [phase, setPhase] = useState<StreakPhase>('heatmap');
    const startTimeRef = useRef<number>(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    // Determines the next phase based on current state and data availability
    const getNextPhase = useCallback((current: StreakPhase): StreakPhase => {
        const nextIndex = PHASE_ORDER.indexOf(current) + 1;
        if (nextIndex >= PHASE_ORDER.length) return 'final';

        const next = PHASE_ORDER[nextIndex];

        // Skip logic
        if (next === 'currentStreak' && !hasCurrentStreak) {
            return getNextPhase(next); // Recurse to skip
        }
        if (next === 'clock' && !hasTopHour) {
            return getNextPhase(next);
        }

        return next;
    }, [hasCurrentStreak, hasTopHour]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        if (!isPaused && phase !== 'final') {
            const timeRemaining = Math.max(0, PHASE_DURATIONS[phase] - elapsedTime);

            timeoutId = setTimeout(() => {
                const next = getNextPhase(phase);
                setPhase(next);
                setElapsedTime(0);
                startTimeRef.current = Date.now();
            }, timeRemaining);
        }

        return () => clearTimeout(timeoutId);
    }, [phase, isPaused, elapsedTime, getNextPhase]);

    // Track elapsed time when paused so we resume correctly
    useEffect(() => {
        if (isPaused) {
            // Update elapsed time right as we pause
            setElapsedTime(prev => prev + (Date.now() - startTimeRef.current));
        } else {
            // Reset start time when resuming
            startTimeRef.current = Date.now();
        }
    }, [isPaused]);

    return { phase, setPhase };
}
