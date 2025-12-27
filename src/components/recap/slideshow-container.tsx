import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideshowContainerProps {
    children: ReactNode[];
    currentSlide: number;
    onSlideChange: (index: number) => void;
    className?: string;
}

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
        zIndex: 0,
    }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export function SlideshowContainer({
    children,
    currentSlide,
    onSlideChange,
    className = '',
}: SlideshowContainerProps) {
    const [[page, direction], setPage] = useState([currentSlide, 0]);
    const totalSlides = children.length;

    // Sync internal state with external currentSlide
    useEffect(() => {
        if (page !== currentSlide) {
            setPage([currentSlide, currentSlide > page ? 1 : -1]);
        }
    }, [currentSlide, page]);

    const paginate = useCallback(
        (newDirection: number) => {
            const newIndex = page + newDirection;
            if (newIndex >= 0 && newIndex < totalSlides) {
                setPage([newIndex, newDirection]);
                onSlideChange(newIndex);
            }
        },
        [page, totalSlides, onSlideChange]
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                paginate(1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                paginate(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [paginate]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: 'spring', stiffness: 300, damping: 30 },
                        opacity: { duration: 0.3 },
                        scale: { duration: 0.3 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(_, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                    }}
                    className="w-full h-full p-0 m-0"
                >
                    {children[page]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
