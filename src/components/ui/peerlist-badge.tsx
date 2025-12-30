import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

export function PeerlistBadge() {
    const { isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isHidden, setIsHidden] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('peerlist-badge-hidden');
        if (stored !== 'true') {
            setIsHidden(false);
            // Small delay to show animation
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleHide = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(() => {
            setIsHidden(true);
            localStorage.setItem('peerlist-badge-hidden', 'true');
        }, 300);
    };

    if (isHidden) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="fixed z-[100] transition-all duration-300
                    /* Desktop: Top Center */
                    md:top-6 md:left-1/2 md:-translate-x-1/2 md:bottom-auto
                    /* Mobile: Bottom Center */
                    bottom-10 left-1/2 -translate-x-1/2 md:translate-x-[-50%] md:left-1/2"
                >
                    <div className="relative group">
                        <a
                            href="https://peerlist.io/shihanrishad/project/github-yearly-recap"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <img
                                src={isDark ? "/launch-badge-peerlist-upvote.svg" : "/launch-badge-peerlist-upvote-light.svg"}
                                alt="Peerlist Launch Badge"
                                className="h-10 md:h-12 w-auto shadow-xl rounded-lg"
                                style={{
                                    filter: isDark ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'drop-shadow(0 0 10px rgba(0,0,0,0.1))'
                                }}
                            />
                        </a>

                        <button
                            onClick={handleHide}
                            className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 
                            shadow-md hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Hide Peerlist Badge"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
