import { useEffect } from 'react';
import { MessageCircle, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCityGuides, CityGuide } from '@/hooks/useCityGuides';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CityGuidesPanelProps {
  city: string;
}

export function CityGuidesPanel({ city }: CityGuidesPanelProps) {
  const { guides, isLoading, fetchGuides } = useCityGuides();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (city) fetchGuides(city);
  }, [city, fetchGuides]);

  const handleContact = async (guide: CityGuide) => {
    if (!user) return;
    // Create or get interaction, then navigate to conversations
    const { data } = await supabase.rpc('get_or_create_interaction', {
      p_other_user_id: guide.user_id,
      p_activity: 'talking',
    });
    if (data) {
      navigate('/conversations');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
          {t('erasmus.cityGuides')}
        </h3>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{t('erasmus.noGuidesYet')}</p>
        <p className="text-xs text-muted-foreground mt-1">{t('erasmus.noGuidesDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-400" />
        {t('erasmus.cityGuides')}
      </h3>
      <p className="text-sm text-muted-foreground">{t('erasmus.guidesSubtitle')}</p>

      <div className="space-y-2">
        {guides.map((guide, i) => (
          <motion.div
            key={guide.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-coral/30 transition-colors"
          >
            <Avatar className="h-12 w-12 border-2 border-coral/20">
              <AvatarImage src={guide.avatar_url || undefined} />
              <AvatarFallback className="bg-coral/20 text-coral font-bold">
                {guide.first_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{guide.first_name}</p>
              {guide.university && (
                <p className="text-xs text-muted-foreground truncate">{guide.university}</p>
              )}
              {guide.bio && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{guide.bio}</p>
              )}
            </div>

            <Button
              size="sm"
              onClick={() => handleContact(guide)}
              className="bg-coral hover:bg-coral-dark text-primary-foreground rounded-lg flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {t('erasmus.sayHi')}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
