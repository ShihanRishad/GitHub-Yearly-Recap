import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LoadingState } from '@/components/loading-state';
import { SlideshowContainer } from '@/components/recap/slideshow-container';
import { SlideNavigation } from '@/components/recap/slide-navigation';
import { TitleSlide } from '@/components/recap/slides/title-slide';
import { OverviewSlide } from '@/components/recap/slides/overview-slide';
import { HeatmapSlide } from '@/components/recap/slides/heatmap-slide';
import { StreaksSlide } from '@/components/recap/slides/streaks-slide';
import { PRsIssuesSlide } from '@/components/recap/slides/prs-issues-slide';
import { ReposSlide } from '@/components/recap/slides/repos-slide';
import { SocialSlide } from '@/components/recap/slides/social-slide';
import { LanguagesSlide } from '@/components/recap/slides/languages-slide';
import { NotesSlide } from '@/components/recap/slides/notes-slide';
import { ShareSlide } from '@/components/recap/slides/share-slide';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon, PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';
import { getMockRecapData } from '@/lib/mock-data';
import { useTheme } from '@/components/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';

// Simple relative time helper
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Slide durations in milliseconds
const SLIDE_DURATIONS: Record<number, number> = {
  0: 5000, // Title
  1: 8000, // Overview
  2: 8000, // Heatmap
  3: 6000, // Streaks
  4: 8000, // PRs/Issues
  5: 8000, // Repos
  6: 6000, // Social
  7: 8000, // Languages
  8: 8000, // Notes
  9: 10000, // Share
};

export function RecapPage() {
  const { username, year } = useParams<{ username: string; year: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedYear = parseInt(year || new Date().getFullYear().toString(), 10);
  const isDemo = searchParams.get('demo') === 'true';

  const [status, setStatus] = useState<'processing' | 'ready' | 'error' | 'found_existing'>('processing');
  const [data, setData] = useState<RecapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('Starting...');
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState<'paused' | 'resumed' | null>(null);
  const { isDark } = useTheme();

  // Timer refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initial fetch trigger
  const hasFetched = useRef(false);

  // Track previous pause state to detect transitions
  const prevPaused = useRef(isPaused);

  // Feedback Effect
  useEffect(() => {
    // Skip if no change (though dependencies usually handle this, good for initial ref sync logic)
    if (prevPaused.current === isPaused) return;

    if (isPaused) {
      // Transition to Paused
      setFeedback('paused');
      // Disappear after 3s
      const t = setTimeout(() => setFeedback(null), 3000);
      prevPaused.current = isPaused;
      return () => clearTimeout(t);
    } else {
      // Transition to Resumed (only if coming from paused)
      if (prevPaused.current) {
        setFeedback('resumed');
        // Disappear after 2s
        const t = setTimeout(() => setFeedback(null), 2000);
        prevPaused.current = isPaused;
        return () => clearTimeout(t);
      }
    }
    prevPaused.current = isPaused;
  }, [isPaused]);

  // Fetch recap data
  const fetchRecap = useCallback(async (force = false) => {
    if (!username) {
      setError('No username provided');
      return;
    }

    // Reset state for new fetch
    setStatus('processing');
    setError(null);
    setCurrentStep('Starting...');
    setIsPaused(false);
    // Only reset data if forcing (regenerating), otherwise keep it if we might use it
    if (force) {
      setData(null);
    }

    // Demo mode
    if (isDemo) {
      setCurrentStep('Fetching your GitHub data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep('Calculating your streaks & stats...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep('Generating AI commentary with Gemini...');
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData = getMockRecapData(username, selectedYear);
      setData(mockData);
      setStatus('ready');
      return;
    }

    let pollInterval: any;

    try {
      // Start the recap generation
      const url = `/api/recap?username=${username}&year=${selectedYear}${force ? '&force=true' : ''}`;
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recap generation');
      }

      const initialData = await response.json();

      // If already cached and NOT forced, show existing found screen
      if (initialData.status === 'ready' && initialData.data && !force) {
        setData(initialData.data);
        setStatus('found_existing');
        return;
      }

      // If we somehow got ready status immediately on a force refresh (unlikely but possible race)
      if (initialData.status === 'ready' && initialData.data && force) {
        setData(initialData.data);
        setStatus('ready');
        return;
      }

      // Trigger background processing if server requests it
      if (initialData.shouldTrigger) {
        fetch(`/api/process?username=${username}&year=${selectedYear}`, {
          method: 'POST'
        }).catch(err => console.error("Trigger processing failed", err));
      }

      // Poll for status
      pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/recap-status?username=${username}&year=${selectedYear}`);
          if (!statusRes.ok) return;

          const statusData = await statusRes.json();

          if (statusData.currentStep) {
            setCurrentStep(statusData.currentStep);
          }

          if (statusData.status === 'ready' && statusData.data) {
            clearInterval(pollInterval);
            setData(statusData.data);
            setStatus('ready');
          } else if (statusData.status === 'error') {
            clearInterval(pollInterval);
            setError(statusData.errorMessage || 'Processing failed');
            setStatus('error');
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 2000);

      return () => {
        if (pollInterval) clearInterval(pollInterval);
      };
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recap');
      setStatus('error');
    }
  }, [username, selectedYear, isDemo]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchRecap();
    }
  }, [fetchRecap]);

  useEffect(() => {
    if (data) {
      document.title = `${data.displayName || data.username} - GitHub ${data.year} Recap`;
    } else if (status === 'processing') {
      document.title = `Generating Recap... - GitHub Yearly Recap`;
    } else if (status === 'error') {
      document.title = `Error - GitHub Yearly Recap`;
    }
  }, [data, status]);

  // Handle existing recap timer and shortcuts
  useEffect(() => {
    if (status === 'found_existing') {
      // Auto proceed after 3 seconds
      timerRef.current = setTimeout(() => {
        setStatus('ready');
      }, 3000);

      // Access start time for animation sync if needed
      startTimeRef.current = Date.now();

      const handleKeyDown = (e: KeyboardEvent) => {
        // Space / Enter -> View Immediately
        if (['Space', 'Enter', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
          if (timerRef.current) clearTimeout(timerRef.current);
          setStatus('ready');
        }
        // R / T / G / W -> Regenerate
        if (['KeyR', 'KeyT', 'KeyG', 'KeyW'].includes(e.code)) {
          e.preventDefault();
          if (timerRef.current) clearTimeout(timerRef.current);
          fetchRecap(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [status, fetchRecap]);

  // Handle pause shortcuts
  useEffect(() => {
    if (status !== 'ready' || currentSlide === 9) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Pause with Space or P
      if (['Space', 'KeyP'].includes(e.code)) {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, currentSlide]);

  // Automatecally change slides
  useEffect(() => {
    if (status !== 'ready' || !data || isPaused) return;

    const duration = SLIDE_DURATIONS[currentSlide] || 6000;

    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);

    slideTimerRef.current = setTimeout(() => {
      if (currentSlide < 9) {
        setCurrentSlide(prev => prev + 1);
      }
    }, duration);

    return () => {
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [currentSlide, status, data, isPaused]);


  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent pause toggle
    // Resume on manual interaction
    setIsPaused(false);
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent pause toggle
    // Resume on manual interaction
    setIsPaused(false);
    if (data && currentSlide < 9) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleGoToSlide = (index: number) => {
    // Resume on manual interaction
    setIsPaused(false);
    setCurrentSlide(index);
  };

  const handleRegenerate = () => {
    fetchRecap(true);
  };

  const togglePause = () => {
    if (status === 'ready' && currentSlide !== 9) {
      setIsPaused(prev => !prev);
    }
  };

  // Render slides
  const renderSlides = () => {
    if (!data) return [];

    return [
      <TitleSlide key="title" data={data} />,
      <OverviewSlide key="overview" data={data} />,
      <HeatmapSlide key="heatmap" data={data} />,
      <StreaksSlide key="streaks" data={data} />,
      <PRsIssuesSlide key="prs-issues" data={data} />,
      <ReposSlide key="repos" data={data} />,
      <SocialSlide key="social" data={data} />,
      <LanguagesSlide key="languages" data={data} />,
      <NotesSlide key="notes" data={data} />,
      <ShareSlide key="share" data={data} onRegenerate={handleRegenerate} />,
    ];
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <img width={80} src={isDark ? "/recap_logo_horizontal_dark.svg" : "/recap_logo_horizontal.svg"} alt="" />
              </div>
            </button>
            {username && (
              <span className="text-muted-foreground text-sm">
                @{username} • {selectedYear}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden h-[100dvh]" onClick={togglePause}>
        {/* Slides - Always render if data exists */}
        {data && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                scale: status === 'found_existing' ? 0.98 : 1,
                filter: status === 'found_existing' ? 'blur(4px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.5 }}
              className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent relative"
            >
              <SlideshowContainer
                currentSlide={currentSlide}
                onSlideChange={setCurrentSlide}
                className="min-h-full"
              >
                {renderSlides()}
              </SlideshowContainer>
            </motion.div>

            <SlideNavigation
              currentSlide={currentSlide}
              totalSlides={10}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onGoToSlide={handleGoToSlide}
              duration={SLIDE_DURATIONS[currentSlide] || 6000}
              isPlaying={status === 'ready' && !isPaused && currentSlide !== 9}
            />

            {/* Pause Feedback Overlay */}
            <AnimatePresence mode="wait">
              {feedback && status === 'ready' && (
                <motion.div
                  key={feedback}
                  initial={{ opacity: 0, scale: 0.9, y: -30 }} // Coming down from above
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }} // Continuining down slightly
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="fixed top-[25%] left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                >
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/60 
                  backdrop-blur-xl border border-white/10 shadow-2xl 
                  text-white"
                    style={{
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <HugeiconsIcon icon={feedback === 'paused' ? PauseIcon : PlayIcon} size={24} strokeWidth={2.5} />
                    <span className="font-semibold text-lg tracking-wide">
                      {feedback === 'paused' ? 'Paused' : 'Resumed'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <AnimatePresence>
          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pt-16 z-50 bg-background"
            >
              <LoadingState
                message={`Generating recap for @${username}...`}
                currentStep={currentStep}
              />
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pt-16 z-50 bg-background flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4"
            >
              <LoadingState
                error={error || 'Failed to generate recap'}
              />
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go Home
                </Button>
                <Button onClick={() => fetchRecap(true)} className="gap-2">
                  <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={18} />
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {status === 'found_existing' && data && (
            <motion.div
              key="found_existing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 pt-16 z-40 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()} // Prevent pause toggle when clicking overlay
            >
              <div className="text-center max-w-md px-4 space-y-8">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-3xl font-bold tracking-tight">Recap is Ready</h2>
                  <p className="text-lg text-muted-foreground">
                    Showing you your recap generated {getRelativeTime(data.generatedAt || new Date().toISOString())}
                  </p>
                </motion.div>

                <motion.div
                  className="flex flex-col items-center gap-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative w-full max-w-[240px] h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1.5">
                        <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono font-medium border border-border">SPACE</kbd>
                        <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono font-medium border border-border">ENTER</kbd>
                      </div>
                      <span>to view</span>
                    </div>
                    <span className="w-px h-8 bg-border" />
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1.5">
                        <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono font-medium border border-border">R</kbd>
                        <kbd className="px-2 py-1 bg-muted rounded-md text-xs font-mono font-medium border border-border">G</kbd>
                      </div>
                      <span>to regenerate</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
