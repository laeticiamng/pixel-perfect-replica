import { MapPin, Shield, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

interface LocationPermissionScreenProps {
  onRequestPermission: () => void;
  onSkip: () => void;
}

export function LocationPermissionScreen({ onRequestPermission, onSkip }: LocationPermissionScreenProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full px-6 text-center"
    >
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-coral/20 blur-xl animate-breathing" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-coral to-coral-dark flex items-center justify-center relative shadow-xl">
          <MapPin className="h-12 w-12 text-white" />
        </div>
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full border-2 border-coral/40 animate-ripple" />
        <div className="absolute inset-0 rounded-full border-2 border-coral/20 animate-ripple" style={{ animationDelay: '0.5s' }} />
      </motion.div>
      
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-3"
      >
        {t('map.locationNeeded')}
      </motion.h2>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-8 max-w-sm"
      >
        {t('map.locationExplain')}
      </motion.p>
      
      {/* Privacy guarantees */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3 mb-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
          <Shield className="h-5 w-5 text-signal-green flex-shrink-0" />
          <span className="text-sm text-foreground">{t('map.privacyGuarantee1')}</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-signal-green/10 border border-signal-green/20">
          <Eye className="h-5 w-5 text-signal-green flex-shrink-0" />
          <span className="text-sm text-foreground">{t('map.privacyGuarantee2')}</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-signal-yellow/10 border border-signal-yellow/20">
          <AlertTriangle className="h-5 w-5 text-signal-yellow flex-shrink-0" />
          <span className="text-sm text-foreground">{t('map.privacyGuarantee3')}</span>
        </div>
      </motion.div>
      
      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button
          onClick={onRequestPermission}
          className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
        >
          <MapPin className="h-5 w-5 mr-2" />
          {t('map.allowLocation')}
        </Button>
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {t('map.useDemo')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
