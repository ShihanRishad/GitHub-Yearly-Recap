import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/theme-provider';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { GitHubButton } from '@/components/ui/github-button';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { PeerlistBadge } from '@/components/ui/peerlist-badge';

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

export function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    document.title = 'GitHub Yearly Recap';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setError('');
    setIsLoading(true);

    // Small delay for visual feedback
    setTimeout(() => {
      navigate(`/u/${username.trim()}/${year}`);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500">
      <PeerlistBadge />
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-sm border-b border-border/40 supports-[backdrop-filter]:bg-background/20 transition-colors duration-500">
        <div className="container mx-auto w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img width={80} src={isDark ? "/recap_logo_horizontal_dark.svg" : "/recap_logo_horizontal.svg"} alt="Recap Logo" />
          </div>
          <div className="flex items-center gap-2">
            <GitHubButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12 w-full max-w-4xl mx-auto">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center h-[33vh] flex justify-center items-center max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-normal tracking-tight mb-10">
            Your
            <span className="italic"> {year} Recap </span>
            on
            <span className=""> GitHub</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg flex flex-col h-[35vh] justify-between items-center gap-6"
        >
          <form onSubmit={handleSubmit} className="w-full relative group">
            <div className="relative flex items-center w-full transition-all duration-300">
              <span className="absolute left-5 text-muted-foreground text-xl select-none pointer-events-none z-10 font-light">@</span>
              <Input
                id="username"
                type="text"
                placeholder="GitHub username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full h-16 pl-12 pr-20 rounded-full text-lg bg-background/50 
                border-2 border-muted hover:bg-background/80 focus-visible:border-primary/50
                focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-sm hover:shadow-lg 
                hover:border-primary/50 placeholder:font-light focus-visible:bg-background/80"
                autoComplete="off"
                autoCapitalize="off"
                style={{
                  transition: 'all 0.2s ease-in-out, box-shadow 0.1s ease-in-out',

                }}
              />

              <div className="absolute right-2 top-2 bottom-2 aspect-square z-10">
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !username.trim()}
                  className="w-full h-full transition-colors duration-600 rounded-full shrink-0 disabled:opacity-50"
                >
                  <motion.div
                    initial={false}
                    animate={isLoading ? { x: 20, opacity: 0 } : { x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2.5} size={24} />
                  </motion.div>

                  {isLoading && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-5 h-5 border-2 border-primary-foreground border-tr-transparent rounded-full animate-spin" />
                    </motion.div>
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center mt-3 absolute w-full -bottom-8"
              >
                {error}
              </motion.p>
            )}
          </form>

          {/* Year Selector Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2"
          >
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger
                className="w-auto min-w-[100px] h-9 rounded-full bg-secondary/50 border-transparent hover:bg-secondary/80 transition-all px-4 text-sm font-medium focus:ring-0 focus:ring-offset-0 shadow-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
