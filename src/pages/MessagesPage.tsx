import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Send, User } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { BottomNav } from '@/components/BottomNav';
import { PageHeader, EmptyState } from '@/components/shared';
import { useInteractions } from '@/hooks/useInteractions';
import { useMessages } from '@/hooks/useMessages';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InteractionListItem {
  id: string;
  target_profile?: {
    first_name: string;
    avatar_url: string | null;
  };
  created_at: string;
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { getMyInteractions } = useInteractions();
  const [interactions, setInteractions] = useState<InteractionListItem[]>([]);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const {
    messages,
    sendMessage,
    canSendMessage,
    remainingMessages,
    isLoading: isMessagesLoading,
  } = useMessages(selectedInteractionId);

  useEffect(() => {
    const load = async () => {
      const { data } = await getMyInteractions(30);
      const list = (data || []) as InteractionListItem[];
      setInteractions(list);
      if (list.length > 0) {
        setSelectedInteractionId(list[0].id);
      }
    };
    load();
  }, [getMyInteractions]);

  const selectedInteraction = useMemo(
    () => interactions.find((i) => i.id === selectedInteractionId) || null,
    [interactions, selectedInteractionId],
  );

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !selectedInteractionId) return;
    const { error } = await sendMessage(content);
    if (!error) setDraft('');
  };

  return (
    <PageLayout className="pb-24 safe-bottom">
      <PageHeader title={t('messages.title')} subtitle={t('messages.subtitle')} backTo="/map" />

      <div className="px-6 space-y-4">
        {interactions.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={t('messages.emptyTitle')}
            description={t('messages.emptyDesc')}
          />
        ) : (
          <>
            <div className="glass rounded-xl p-3 overflow-x-auto">
              <div className="flex gap-2">
                {interactions.map((interaction) => {
                  const isActive = interaction.id === selectedInteractionId;
                  return (
                    <button
                      key={interaction.id}
                      onClick={() => setSelectedInteractionId(interaction.id)}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap border transition-colors ${
                        isActive
                          ? 'bg-coral text-white border-coral'
                          : 'bg-background text-foreground border-border hover:border-coral/40'
                      }`}
                    >
                      {(interaction.target_profile?.first_name || t('messages.contact'))}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass rounded-xl p-4 min-h-[320px] flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedInteraction?.target_profile?.first_name || t('messages.contact')}
                </p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {isMessagesLoading ? (
                  <p className="text-sm text-muted-foreground">{t('loading')}</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('messages.noMessages')}</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="bg-background border border-border rounded-lg px-3 py-2">
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('messages.placeholder')}
                  maxLength={500}
                />
                <Button onClick={handleSend} disabled={!canSendMessage || !draft.trim()} className="bg-coral hover:bg-coral/90">
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {t('messages.remaining', { count: remainingMessages })}
              </p>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </PageLayout>
  );
}
