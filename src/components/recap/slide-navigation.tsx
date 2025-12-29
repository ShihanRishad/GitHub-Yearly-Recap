import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';

interface SlideNavigationProps {
    currentSlide: number;
    totalSlides: number;
    onPrevious: () => void;
    onNext: () => void;
    onGoToSlide: (index: number) => void;
    elapsedTime?: number;
    className?: string;
}

export function SlideNavigation({
    currentSlide,
    totalSlides,
    onPrevious,
    onNext,
    onGoToSlide,
    duration = 6000,
    isPlaying = true,
    elapsedTime = 0,
    className = '',
}: SlideNavigationProps & { duration?: number; isPlaying?: boolean }) {
    const canGoPrevious = currentSlide > 0;
    const canGoNext = currentSlide < totalSlides - 1;

    return (
        <>
            {/* Progress dots */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 p-3 rounded-full bg-background/40 backdrop-blur-md border border-white/10 ${className}`}>
                {Array.from({ length: totalSlides }).map((_, index) => {
                    const isActive = index === currentSlide;
                    return (
                        <button
                            key={index}
                            onClick={() => onGoToSlide(index)}
                            className="group p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full relative"
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {/* Track background for active slide, or normal dot for others */}
                            <motion.div
                                className={`rounded-full shadow-sm transition-colors duration-300 relative overflow-hidden ${isActive
                                    ? (isPlaying ? 'bg-muted/50' : 'bg-foreground')
                                    : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/60'
                                    }`}
                                animate={{
                                    width: isActive && isPlaying ? 48 : 8,
                                    height: 8,
                                }}
                            >
                                {isActive && isPlaying && (
                                    <motion.div
                                        className="absolute inset-y-0 min-w-[8px] left-0 bg-foreground rounded-full"
                                        initial={{ width: `${(elapsedTime / duration) * 100}%` }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: Math.max(0, duration - elapsedTime) / 1000,
                                            ease: "linear",
                                        }}
                                        // key changes on slide change ensuring animation resets
                                        key={`progress-${currentSlide}`}
                                    />
                                )}
                            </motion.div>
                        </button>
                    )
                })}
            </div>

            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-4 sm:px-8 md:px-12 z-20">
                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        className={`w-14 h-14 fixed ${window.screenWidth < 1024 ? 'bottom-1/4' : 'bottom-1/2'} left-[20px] rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:bg-background hover:scale-105 transition-all text-foreground ${!canGoPrevious ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        aria-label="Previous slide"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2.5} size={28} />
                    </Button>
                </div>

                <div className="pointer-events-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNext}
                        disabled={!canGoNext}
                        className={`w-14 h-14 fixed ${window.screenWidth < 1024 ? 'bottom-1/4' : 'bottom-1/2'} right-[20px] rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg hover:bg-background hover:scale-105 transition-all text-foreground ${!canGoNext ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                        aria-label="Next slide"
                    >
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.5} size={28} />
                    </Button>
                </div>
            </div>
        </>
    );
}
