import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/theme-provider';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

export function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

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
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">

            <img width={80} src={isDark ? "public/recap_logo_horizontal_dark.svg" : "public/recap_logo_horizontal.svg"} alt="" />
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-12">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-normal tracking-tight mb-4">
            Your
            <span className="italic"> {year} </span>
            on
            <span className=""> GitHub</span>
          </h1>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="username">GitHub Username</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                      <Input
                        id="username"
                        type="text"
                        placeholder="octocat"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setError('');
                        }}
                        className="pl-8"
                        autoComplete="off"
                        autoCapitalize="off"
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="year">Year</FieldLabel>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger id="year">
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
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Generating...'
                    ) : (
                      <>
                        Generate My Recap
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} size={18} />
                      </>
                    )}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
