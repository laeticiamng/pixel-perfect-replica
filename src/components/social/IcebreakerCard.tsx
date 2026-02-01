import { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Sparkles, Copy, Check } from 'lucide-react';
import { ActivityType } from '@/types/signal';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import toast from 'react-hot-toast';

interface IcebreakerCardProps {
  icebreaker?: string;
  activity?: ActivityType;
  otherUserName?: string;
  onRefresh?: () => void;
  useAI?: boolean;
}

export const IcebreakerCard = forwardRef<HTMLDivElement, IcebreakerCardProps>(
  function IcebreakerCard({ 
    icebreaker: staticIcebreaker, 
    activity,
    otherUserName,
    onRefresh,
    useAI = true 
  }, ref) {
    const [currentIcebreaker, setCurrentIcebreaker] = useState(staticIcebreaker || '');
    const [allIcebreakers, setAllIcebreakers] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [copied, setCopied] = useState(false);
    
    const { generateIcebreakers, isLoading } = useAIAssistant();

    // Generate AI icebreakers on mount if activity is provided
    useEffect(() => {
      if (useAI && activity && !staticIcebreaker) {
        generateIcebreakers(activity, { other_user_name: otherUserName })
          .then((icebreakers) => {
            setAllIcebreakers(icebreakers);
            if (icebreakers.length > 0) {
              setCurrentIcebreaker(icebreakers[0]);
            }
          });
      } else if (staticIcebreaker) {
        setCurrentIcebreaker(staticIcebreaker);
      }
    }, [activity, staticIcebreaker, useAI, otherUserName, generateIcebreakers]);

    const handleRefresh = async () => {
      if (allIcebreakers.length > 1) {
        // Cycle through existing icebreakers
        const nextIndex = (currentIndex + 1) % allIcebreakers.length;
        setCurrentIndex(nextIndex);
        setCurrentIcebreaker(allIcebreakers[nextIndex]);
      } else if (activity) {
        // Generate new icebreakers
        const newIcebreakers = await generateIcebreakers(activity, { other_user_name: otherUserName });
        setAllIcebreakers(newIcebreakers);
        setCurrentIndex(0);
        if (newIcebreakers.length > 0) {
          setCurrentIcebreaker(newIcebreakers[0]);
        }
      }
      
      onRefresh?.();
    };

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(currentIcebreaker);
        setCopied(true);
        toast.success('Copié !');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Impossible de copier');
      }
    };

    if (!currentIcebreaker && isLoading) {
      return (
        <div ref={ref} className="glass rounded-xl p-4 border-2 border-coral/50 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-coral animate-spin" />
            <p className="text-xs text-coral font-medium uppercase tracking-wide">
              Génération IA en cours...
            </p>
          </div>
          <div className="h-6 bg-muted/30 rounded w-3/4" />
        </div>
      );
    }

    return (
      <div ref={ref} className="glass rounded-xl p-4 border-2 border-coral/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {useAI && <Sparkles className="h-3.5 w-3.5 text-coral" />}
              <p className="text-xs text-coral font-medium uppercase tracking-wide">
                💬 Icebreaker {useAI ? 'IA' : 'suggéré'}
              </p>
            </div>
            <p className="text-foreground text-lg font-medium leading-relaxed">
              "{currentIcebreaker}"
            </p>
            {allIcebreakers.length > 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                {currentIndex + 1}/{allIcebreakers.length} suggestions
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className={cn(
                'p-2 rounded-lg transition-all duration-300',
                copied 
                  ? 'bg-signal-green/20 text-signal-green' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
              aria-label="Copier"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-lg transition-all duration-300',
                'bg-coral/10 hover:bg-coral/20 text-coral',
                isLoading && 'animate-spin'
              )}
              aria-label="Nouvelle suggestion"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);
