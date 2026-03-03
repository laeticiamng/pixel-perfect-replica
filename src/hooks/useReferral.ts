import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralStats {
  referralCode: string | null;
  referralsCount: number;
  isLoading: boolean;
}

export function useReferral(): ReferralStats & {
  applyReferralCode: (code: string) => Promise<boolean>;
  shareLink: string | null;
} {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralsCount, setReferralsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsLoading(false); return; }

    const fetchReferralData = async () => {
      setIsLoading(true);
      try {
        // Get own referral code via RPC (profiles table is restricted)
        const { data: profile } = await supabase.rpc('get_own_profile');
        if (profile && profile.length > 0) {
          // referral_code might not be in the RPC result, fetch it directly
          const { data: profileData } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single();
          if (profileData?.referral_code) {
            setReferralCode(profileData.referral_code);
          }
        }

        // Count referrals (as referrer)
        const { count } = await supabase
          .from('referrals' as any)
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', user.id);
        setReferralsCount(count || 0);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const applyReferralCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('apply-referral', {
        body: { code },
      });
      if (error) return false;
      return data?.applied === true;
    } catch {
      return false;
    }
  }, []);

  const shareLink = referralCode
    ? `https://nearvity.fr/?ref=${referralCode}`
    : null;

  return { referralCode, referralsCount, isLoading, applyReferralCode, shareLink };
}
