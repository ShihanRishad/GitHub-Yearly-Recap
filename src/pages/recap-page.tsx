import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { GithubIcon, Home01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import type { RecapData, RecapStatus } from '@/types';
import { getMockRecapData } from '@/lib/mock-data';

export function RecapPage() {
    const { username, year } = useParams<{ username: string; year: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedYear = parseInt(year || new Date().getFullYear().toString(), 10);
    const isDemo = searchParams.get('demo') === 'true';

    const [status, setStatus] = useState<RecapStatus>('processing');
    const [data, setData] = useState<RecapData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fetch recap data - supports demo mode with mock data
    const fetchRecap = useCallback(async () => {
        if (!username) {
            setError('No username provided');
            return;
        }

        setStatus('processing');
        setError(null);

        // Demo mode - use mock data immediately
        if (isDemo) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Brief loading
            const mockData = getMockRecapData(username, selectedYear);
            setData(mockData);
            setStatus('ready');
            return;
        }

        try {
            // Start the recap generation
            const response = await fetch(`/api/recap?username=${username}&year=${selectedYear}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start recap generation');
            }

            const initialData = await response.json();

            // If already cached, use it directly
            if (initialData.status === 'ready' && initialData.data) {
                setData(initialData.data);
                setStatus('ready');
                return;
            }

            // If new or retrying, trigger processing
            if (initialData.shouldTrigger) {
                try {
                    // Trigger processing (fire and forget from client perspective, but we poll)
                    fetch(`/api/process?username=${username}&year=${selectedYear}`, {
                        method: 'POST',
                    }).catch(err => console.error('Failed to trigger process:', err));
                } catch (e) {
                    console.error('Error triggering process:', e);
                    // Don't fail here, polling might still pick it up if another trigger worked
                }
            }

            // Poll for status
            const startTime = Date.now();
            const POLL_TIMEOUT = 60000; // 60 seconds timeout

            const pollInterval = setInterval(async () => {
                // Check timeout
                if (Date.now() - startTime > POLL_TIMEOUT) {
                    clearInterval(pollInterval);
                    setError('Processing timed out. This is taking longer than usual. Please try again later.');
                    setStatus('error');
                    return;
                }

                try {
                    const statusResponse = await fetch(
                        `/api/recap-status?username=${username}&year=${selectedYear}`
                    );

                    if (!statusResponse.ok) {
                        // If status check fails, don't abort immediately, might be temporary
                        return;
                    }

                    const statusData = await statusResponse.json();

                    if (statusData.status === 'ready' && statusData.data) {
                        clearInterval(pollInterval);
                        setData(statusData.data);
                        setStatus('ready');
                    } else if (statusData.status === 'error') {
                        clearInterval(pollInterval);
                        setError(statusData.error || 'Processing failed');
                        setStatus('error');
                    }
                    // Continue polling if still processing
                } catch {
                    // Network errors during polling are ignored until timeout
                }
            }, 2000); // Poll every 2 seconds

            // Cleanup on unmount
            return () => clearInterval(pollInterval);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch recap data');
            setStatus('error');
        }
    }, [username, selectedYear, isDemo]);

    useEffect(() => {
        fetchRecap();
    }, [fetchRecap]);

    const handlePrevious = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleNext = () => {
        if (data && currentSlide < 9) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handleGoToSlide = (index: number) => {
        setCurrentSlide(index);
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
            <ShareSlide key="share" data={data} />,
        ];
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <HugeiconsIcon icon={GithubIcon} strokeWidth={2} size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-lg hidden sm:block">GitHub Recap</span>
                        </button>
                        {username && (
                            <span className="text-muted-foreground text-sm">
                                @{username} • {selectedYear}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} size={18} />
                            <span className="hidden sm:inline ml-2">Home</span>
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1 pt-16">
                {status === 'processing' && (
                    <LoadingState
                        message={`Generating recap for @${username}...`}
                        subMessage="Fetching your GitHub data"
                    />
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center"
                        >
                            <span className="text-3xl">😕</span>
                        </motion.div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                            <p className="text-muted-foreground max-w-md">
                                {error || 'Failed to generate recap. Please try again.'}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => navigate('/')}>
                                Go Home
                            </Button>
                            <Button onClick={fetchRecap} className="gap-2">
                                <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={18} />
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'ready' && data && (
                    <div className="container mx-auto px-4 py-8">
                        <SlideshowContainer
                            currentSlide={currentSlide}
                            onSlideChange={setCurrentSlide}
                            className="mb-8"
                        >
                            {renderSlides()}
                        </SlideshowContainer>

                        <SlideNavigation
                            currentSlide={currentSlide}
                            totalSlides={10}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onGoToSlide={handleGoToSlide}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
