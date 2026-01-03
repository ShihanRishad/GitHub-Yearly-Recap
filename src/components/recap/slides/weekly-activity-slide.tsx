import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { RecapData } from '@/types';
import { useTheme } from '@/components/theme-provider';

interface WeeklyActivitySlideProps {
  data: RecapData;
}

export function WeeklyActivitySlide({ data }: WeeklyActivitySlideProps) {
  const { isDark } = useTheme();
  const { contributionCalendar } = data;
  const barColor = isDark ? '#3a9149ff' : '#216e39';
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
    <div className="h-screen w-full flex flex-col items-center justify-start p-6 bg-background">
      <div className="max-w-4xl w-full flex flex-col items-center pt-20 gap-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-3">Weekly Activity</h3>
          <p className="text-muted-foreground text-lg">
            How your activity peaks throughout the week
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full aspect-[16/9] max-h-[500px] bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/50 p-8 md:p-12 flex flex-col items-center shadow-lg relative overflow-hidden"
        >

          <div className="flex-1 w-full flex items-end justify-between gap-3 md:gap-6 px-4 md:px-8 pb-4 mt-4">
            {weekdayStats.map((count, i) => {
              const heightPercentage = Math.max(8, (count / maxCount) * 100);

              return (
                <div key={shortDays[i]} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="px-3 py-1.5 rounded-xl text-sm font-black shadow-sm bg-background"
                    style={{ color: barColor }}
                  >
                    {count}
                  </motion.div>
                  {/* Bar */}
                  <div className="w-full h-full flex items-end relative">
                    <motion.div
                      className="w-full rounded-t-lg opacity-90 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: barColor }}
                      initial={{ height: "0%" }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{
                        duration: 1.5,
                        delay: 0.4 + i * 0.1,
                        type: "spring",
                        stiffness: 60,
                        damping: 12
                      }}
                    />
                  </div>
                  {/* Day name */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs md:text-sm font-black text-foreground uppercase tracking-widest hidden md:block">
                      {days[i]}
                    </span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest md:hidden">
                      {shortDays[i]}
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

