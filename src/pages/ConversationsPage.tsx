import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, ArrowLeft, Search } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations, Conversation } from '@/hooks/useConversations';
import { useTranslation } from '@/lib/i18n';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MiniChat } from '@/components/social/MiniChat';

export default function ConversationsPage() {
  const { conversations, isLoading } = useConversations();
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  const dateFnsLocale = locale === 'fr' ? fr : locale === 'de' ? de : enUS;

  const filtered = conversations.filter(c =>
    c.other_user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedConvo) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <button
            onClick={() => setSelectedConvo(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('back')}</span>
          </button>
          <MiniChat
            interactionId={selectedConvo.interaction_id}
            otherUserName={selectedConvo.other_user_name}
            className="min-h-[60vh]"
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <PageHeader
          title={t('conversations.title')}
          subtitle={t('conversations.subtitle')}
          showBack
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('conversations.search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {isLoading ? (
          <LoadingSkeleton variant="list" count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={t('conversations.empty')}
            description={t('conversations.emptyDesc')}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((convo) => (
              <button
                key={convo.interaction_id}
                onClick={() => setSelectedConvo(convo)}
                className="w-full flex items-center gap-3 p-4 rounded-xl glass hover:bg-muted/50 transition-all text-left group"
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={convo.other_user_avatar || undefined} alt={convo.other_user_name} />
                  <AvatarFallback className="bg-coral/20 text-coral font-bold">
                    {convo.other_user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "font-semibold text-foreground truncate",
                      convo.unread_count > 0 && "font-bold"
                    )}>
                      {convo.other_user_name}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true, locale: dateFnsLocale })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm truncate mt-0.5",
                    convo.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {convo.last_message || t('conversations.noMessages')}
                  </p>
                </div>
                {/* Unread badge */}
                {convo.unread_count > 0 ? (
                  <span className="flex-shrink-0 flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-coral text-white text-xs font-bold rounded-full">
                    {convo.unread_count > 99 ? '99+' : convo.unread_count}
                  </span>
                ) : (
                  <div className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {convo.message_count}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
