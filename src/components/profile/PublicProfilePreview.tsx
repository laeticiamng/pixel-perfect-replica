import { useState, useEffect } from 'react';
import { Eye, GraduationCap, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useVerificationBadges } from '@/hooks/useVerificationBadges';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfilePreviewProps {
  trigger?: React.ReactNode;
}

const activityLabels: Record<string, string> = {
  studying: 'Réviser',
  eating: 'Manger',
  working: 'Bosser',
  talking: 'Parler',
  sport: 'Sport',
  other: 'Autre'
};

const activityEmojis: Record<string, string> = {
  studying: '📚',
  eating: '🍽️',
  working: '💻',
  talking: '💬',
  sport: '🏃',
  other: '✨'
};

interface ExtendedProfile {
  bio?: string;
  favorite_activities?: string[];
}

export function PublicProfilePreview({ trigger }: PublicProfilePreviewProps) {
  const [open, setOpen] = useState(false);
  const { user, profile, stats } = useAuth();
  const { badges } = useVerificationBadges();
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile>({});

  const hasStudentBadge = badges.some(b => b.badge_type === 'email_edu');

  useEffect(() => {
    if (user && open) {
      // Fetch additional profile fields
      supabase
        .from('profiles')
        .select('bio, favorite_activities')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setExtendedProfile({
              bio: data.bio || undefined,
              favorite_activities: data.favorite_activities || undefined
            });
          }
        });
    }
  }, [user, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            Prévisualiser le profil public
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-coral" />
            Aperçu du profil public
          </DialogTitle>
        </DialogHeader>

        <div className="border-2 border-dashed border-muted rounded-xl p-4 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center mb-4">
            Voici ce que les autres utilisateurs voient de ton profil
          </p>

          {/* Preview Card */}
          <div className="glass rounded-xl p-4 space-y-4">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-coral/30">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-coral/20 text-coral text-xl">
                  {profile?.first_name?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {profile?.first_name || 'Utilisateur'}
                </h3>
                {profile?.university && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.university}
                  </p>
                )}
                {hasStudentBadge && (
                  <Badge className="mt-1 bg-signal-green/20 text-signal-green border-0 text-xs">
                    ✓ Étudiant vérifié
                  </Badge>
                )}
              </div>
            </div>

            {/* Bio */}
            {extendedProfile.bio && (
              <p className="text-sm text-foreground italic border-l-2 border-coral/30 pl-3">
                "{extendedProfile.bio}"
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-coral">
                  <Star className="h-3.5 w-3.5" />
                  <span className="font-bold">{stats?.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <p className="text-xs text-muted-foreground">Note</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-signal-green">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-bold">{stats?.interactions || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Rencontres</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-signal-yellow">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-bold">{Math.round(stats?.hours_active || 0)}h</span>
                </div>
                <p className="text-xs text-muted-foreground">Actif</p>
              </div>
            </div>

            {/* Favorite Activities */}
            {extendedProfile.favorite_activities && extendedProfile.favorite_activities.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Activités favorites</p>
                <div className="flex flex-wrap gap-1">
                  {extendedProfile.favorite_activities.map(activity => (
                    <Badge key={activity} variant="secondary" className="text-xs">
                      {activityEmojis[activity]} {activityLabels[activity] || activity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            💡 Les autres ne voient jamais ton email ni ta position exacte
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
