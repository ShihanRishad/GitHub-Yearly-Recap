import { useState, useEffect, useCallback } from 'react';
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
import { Home01Icon, RefreshIcon } from '@hugeicons/core-free-icons';
import type { RecapData } from '@/types';
import { getMockRecapData } from '@/lib/mock-data';
import { useTheme } from '@/components/theme-provider';

export function RecapPage() {
    const { username, year } = useParams<{ username: string; year: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const selectedYear = parseInt(year || new Date().getFullYear().toString(), 10);
    const isDemo = searchParams.get('demo') === 'true';

    const [status, setStatus] = useState<'processing' | 'ready' | 'error'>('processing');
    const [data, setData] = useState<RecapData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState<string>('Starting...');
    const { isDark } = useTheme();

    // Fetch recap data - supports demo mode with mock data
    const fetchRecap = useCallback(async () => {
        if (!username) {
            setError('No username provided');
            return;
        }

        setStatus('processing');
        setError(null);
        setCurrentStep('Starting...');

        // Demo mode - use mock data immediately
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

            // Trigger background processing if server requests it
            if (initialData.shouldTrigger) {
                // Fire and forget (but keep connection open to allow serverless execution)
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
        if (data) {
            document.title = `${data.displayName || data.username} - GitHub ${data.year} Recap`;
        } else if (status === 'processing') {
            document.title = `Generating Recap... - GitHub Yearly Recap`;
        } else if (status === 'error') {
            document.title = `Error - GitHub Yearly Recap`;
        }
    }, [data, status]);

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
                        currentStep={currentStep}
                    />
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
                        <LoadingState
                            error={error || 'Failed to generate recap'}
                        />
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
