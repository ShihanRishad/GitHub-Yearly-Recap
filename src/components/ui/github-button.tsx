import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Github01Icon } from '@hugeicons/core-free-icons';

export function GitHubButton() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/ShihanRishad/GitHub-Yearly-Recap')
            .then(res => res.json())
            .then(data => {
                if (typeof data.stargazers_count === 'number') {
                    setStars(data.stargazers_count);
                }
            })
            .catch(console.error);
    }, []);

    return (
        <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex"
            asChild
        >
            <a
                href="https://github.com/ShihanRishad/GitHub-Yearly-Recap"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Star on GitHub"
            >
                <HugeiconsIcon icon={Github01Icon} size={18} strokeWidth={2} />
                <span className="font-medium text-sm">
                    {stars !== null ? stars : 'Star'}
                </span>
            </a>
        </Button>
    );
}
