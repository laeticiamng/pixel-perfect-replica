import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface InviteFriendCTAProps {
  onDismiss?: () => void;
}

export function InviteFriendCTA({ onDismiss }: InviteFriendCTAProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.referral_code) setReferralCode(data.referral_code);
      });
  }, [user]);

  const shareUrl = referralCode
    ? `https://nearvity.lovable.app?ref=${referralCode}&utm_source=invite_cta&utm_medium=post_feedback&utm_campaign=binome_referral`
    : 'https://nearvity.lovable.app';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('referral.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEARVITY',
          text: t('inviteCTA.shareText'),
          url: shareUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="border-2 border-coral/40 bg-gradient-to-br from-coral/10 via-background to-signal-green/10 overflow-hidden relative">
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles className="h-16 w-16 text-coral" />
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-coral/20 flex items-center justify-center shrink-0">
              <Gift className="h-6 w-6 text-coral" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                {t('inviteCTA.title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('inviteCTA.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              className="flex-1 bg-coral hover:bg-coral/90 text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t('referral.shareNative')}
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              className="border-coral/30 hover:bg-coral/10"
            >
              {copied ? (
                <Check className="h-4 w-4 text-signal-green" />
              ) : (
                <Copy className="h-4 w-4 text-coral" />
              )}
            </Button>
          </div>

          {referralCode && (
            <p className="text-xs text-center text-muted-foreground">
              {t('referral.yourCode')}: <span className="font-mono font-bold text-coral">{referralCode}</span>
            </p>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
            >
              {t('inviteCTA.maybeLater')}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
