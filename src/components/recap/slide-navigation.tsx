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
    className?: string;
}

export function SlideNavigation({
    currentSlide,
    totalSlides,
    onPrevious,
    onNext,
    onGoToSlide,
    className = '',
}: SlideNavigationProps) {
    const canGoPrevious = currentSlide > 0;
    const canGoNext = currentSlide < totalSlides - 1;

    return (
        <div className={`flex flex-col items-center gap-6 ${className}`}>
            {/* Progress dots */}
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => onGoToSlide(index)}
                        className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <motion.div
                            className={`rounded-full transition-colors ${index === currentSlide
                                    ? 'bg-primary'
                                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                            animate={{
                                width: index === currentSlide ? 24 : 8,
                                height: 8,
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    </button>
                ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onPrevious}
                    disabled={!canGoPrevious}
                    className="gap-2 min-w-[120px]"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} size={18} />
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground font-mono min-w-[60px] text-center">
                    {currentSlide + 1} / {totalSlides}
                </span>

                <Button
                    variant={canGoNext ? 'default' : 'outline'}
                    size="lg"
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="gap-2 min-w-[120px]"
                >
                    Next
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} size={18} />
                </Button>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-muted-foreground/60">
                Use <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">→</kbd> keys to navigate
            </p>
        </div>
    );
}
