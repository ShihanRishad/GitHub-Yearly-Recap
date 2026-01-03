import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RecapData } from '@/types';

interface WeeklyActivitySlideProps {
  data: RecapData;
}

export function WeeklyActivitySlide({ data }: WeeklyActivitySlideProps) {
  const { contributionCalendar } = data;

  const weekdayStats = useMemo(() => {
    const stats = [0, 0, 0, 0, 0, 0, 0];

    contributionCalendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (typeof day.weekday === 'number' && day.weekday >= 0 && day.weekday <= 6) {
          stats[day.weekday] += day.contributionCount;
        }
      });
    });

    return stats;
  }, [contributionCalendar]);

  const maxCount = Math.max(...weekdayStats, 1);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full flex flex-col items-center justify-start p-4 md:p-6 bg-background relative">
      <div className="max-w-4xl w-full flex flex-col items-center pt-16 md:pt-16 gap-6 md:gap-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-0"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-0">Weekly Activity</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full aspect-[4/5] md:aspect-[16/9] max-h-[60dvh] md:max-h-[500px] bg-card/80 mb-15 rounded-[2rem] border border-border/40 p-6 md:p-12 flex flex-col items-center shadow-lg relative"
        >
          <div className="flex-1 w-full flex items-end justify-between gap-2 md:gap-8 px-0 md:px-4 pb-1">
            {weekdayStats.map((count, i) => {
              const heightPercentage = Math.max(8, (count / maxCount) * 100);

              return (
                <div key={shortDays[i]} className="flex-1 min-w-0 flex flex-col items-center gap-2 md:gap-4 h-full justify-end group/bar">
                  {/* Count Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="text-[10px] md:text-sm font-medium text-primary/70 group-hover/bar:text-primary transition-colors"
                  >
                    {count}
                  </motion.div>

                  {/* Bar Container */}
                  <div className="w-full h-full flex items-end relative bg-primary/5 rounded-t-lg md:rounded-t-xl overflow-hidden">
                    <motion.div
                      className="w-full bg-primary/60 group-hover/bar:bg-primary rounded-t-lg transition-colors"
                      initial={{ height: "0%" }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{
                        duration: 1.2,
                        delay: 0.2 + i * 0.05,
                        type: "spring",
                        stiffness: 80,
                        damping: 20
                      }}
                    />
                  </div>

                  {/* Day Label */}
                  <div className="w-full text-center mt-1">
                    <span className="text-[10px] md:text-xs font-light text-muted-foreground uppercase tracking-wider truncate block">
                      <span className="hidden md:inline">{days[i]}</span>
                      <span className="md:hidden">{shortDays[i]}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


