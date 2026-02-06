import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import type { Locale } from '@/lib/i18n/translations';

interface ChatMessageBubbleProps {
  content: string;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
  isOwn: boolean;
  locale?: Locale;
}

export function ChatMessageBubble({ 
  content, createdAt, senderName, senderAvatar, isOwn, locale = 'fr'
}: ChatMessageBubbleProps) {
  const dateLocale = locale === 'fr' ? fr : enUS;

  return (
    <div className={cn("flex gap-3", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={senderAvatar || undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {senderName?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 px-1">{senderName}</span>
        )}
        <div className={cn(
          "px-4 py-2 rounded-2xl text-sm",
          isOwn ? "bg-coral text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
        )}>
          {content}
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: dateLocale })}
        </span>
      </div>
    </div>
  );
}
