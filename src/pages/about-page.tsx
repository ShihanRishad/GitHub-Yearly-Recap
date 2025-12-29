import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, Github01Icon, ChartHistogramIcon, LockKeyIcon, Share08Icon } from '@hugeicons/core-free-icons';

export function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    // const { scrollYProgress } = useScroll({
    //     target: containerRef,
    //     offset: ["start start", "end end"]
    // });



    const features = [
        {
            icon: ChartHistogramIcon,
            title: "Deep Analytics",
            description: "We analyze your commit history, PRs, and issues to generate comprehensive insights about your coding year."
        },
        {
            icon: Share08Icon,
            title: "Beautifully Shareable",
            description: "Generate stunning cards and slides ready for Twitter, LinkedIn, and Instagram stories."
        },
        {
            icon: LockKeyIcon,
            title: "Privacy First",
            description: "We run entirely in your browser using the GitHub API. Your private data never touches our servers."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden" ref={containerRef}>
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border/40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
                        </Button>
                        <span className="font-semibold text-lg hidden sm:block">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20 container mx-auto px-4 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">GitHub Yearly Recap</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The ultimate tool to visualize your developer journey. Completely free, privacy-focused, and open source.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="p-6 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors"
                        >
                            <HugeiconsIcon icon={feature.icon} className="text-primary mb-4" size={40} />
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* SEO Content Section */}
                <article className="prose prose-lg dark:prose-invert mx-auto">
                    <h2>What is GitHub Yearly Recap?</h2>
                    <p>
                        GitHub Yearly Recap is a dedicated <strong>GitHub Wrapped</strong> alternative for 2025.
                        While platforms like Spotify Wrapped show your music taste, we believe developers deserve
                        to celebrate their code. This tool creates a personalized "Year in Review" for your
                        GitHub profile.
                    </p>

                    <h3>How does it work?</h3>
                    <p>
                        Simply enter your username, and our engine fetches your public contribution data using
                        the official GitHub API. We calculate your:
                    </p>
                    <ul>
                        <li>Total contributions and streaks</li>
                        <li>Top languages and repositories</li>
                        <li>Most productive hours and days</li>
                        <li>Community interactions</li>
                    </ul>

                    <div className="not-prose mt-12 text-center">
                        <Button size="lg" className="rounded-full text-lg h-12 px-8" asChild>
                            <Link to="/">
                                Generate Your 2025 Recap
                            </Link>
                        </Button>
                    </div>
                </article>

                {/* Footer */}
                <footer className="mt-20 pt-8 border-t border-border/40 text-center text-muted-foreground">
                    <p className="mb-4">
                        Built with ❤️ by Shihan. Not affiliated with GitHub.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a href="https://github.com/ShihanRishad" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            <HugeiconsIcon icon={Github01Icon} size={24} />
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    );
}
