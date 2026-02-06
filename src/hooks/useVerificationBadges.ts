import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type BadgeType = 'email_edu' | 'linkedin' | 'instagram' | 'photo_liveness';

interface VerificationBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  verified_at: string;
  metadata: Record<string, unknown>;
}

// List of verified .edu and university domains
const EDU_DOMAINS = [
  // French universities
  '.edu',
  '.univ-',
  '.u-',
  'sorbonne',
  'polytechnique',
  'centrale',
  'mines-',
  'enpc.fr',
  'ensam',
  'insa-',
  'ens-',
  'hec.fr',
  'essec',
  'escp',
  'emlyon',
  'edhec',
  'sciencespo',
  'iep-',
  // Add more as needed
];

export function useVerificationBadges(userId?: string) {
  const { user } = useAuth();
  const [badges, setBadges] = useState<VerificationBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const targetUserId = userId || user?.id;

  // Fetch badges for user
  const fetchBadges = useCallback(async () => {
    if (!targetUserId) return;

    setIsLoading(true);
    const { data } = await supabase
      .from('verification_badges')
      .select('*')
      .eq('user_id', targetUserId);

    // Cast to proper type
    const typedBadges = (data || []).map(badge => ({
      ...badge,
      badge_type: badge.badge_type as BadgeType,
      metadata: badge.metadata as Record<string, unknown>,
    }));
    setBadges(typedBadges);
    setIsLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Check if email is from an educational domain
  const isEducationalEmail = (email: string): boolean => {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return false;
    
    return EDU_DOMAINS.some(eduDomain => 
      domain.includes(eduDomain.toLowerCase())
    );
  };

  // Check if user has a specific badge
  const hasBadge = (badgeType: BadgeType): boolean => {
    return badges.some(b => b.badge_type === badgeType);
  };

  // Get badge info (i18n keys + emoji)
  const getBadgeInfo = (badgeType: BadgeType) => {
    const badgeData: Record<BadgeType, { labelKey: string; emoji: string; descriptionKey: string }> = {
      email_edu: { labelKey: 'badges.emailEdu.label', emoji: '🎓', descriptionKey: 'badges.emailEdu.description' },
      linkedin: { labelKey: 'badges.linkedin.label', emoji: '💼', descriptionKey: 'badges.linkedin.description' },
      instagram: { labelKey: 'badges.instagram.label', emoji: '📸', descriptionKey: 'badges.instagram.description' },
      photo_liveness: { labelKey: 'badges.photoLiveness.label', emoji: '✅', descriptionKey: 'badges.photoLiveness.description' },
    };
    return badgeData[badgeType];
  };

  return {
    badges,
    isLoading,
    hasBadge,
    isEducationalEmail,
    getBadgeInfo,
    refetch: fetchBadges,
  };
}
