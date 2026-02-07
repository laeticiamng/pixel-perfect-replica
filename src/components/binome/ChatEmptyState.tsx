import { MessageCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function ChatEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full text-center py-12">
      <p className="text-muted-foreground text-sm">
        {t('sessionChat.noMessages')} <MessageCircle className="h-4 w-4 inline ml-1" /><br />
        <span className="text-xs">{t('sessionChat.beFirst')}</span>
      </p>
    </div>
  );
}
