import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ghost, Eye, MapPin, Shield, Lock, Download, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useGdprExport } from '@/hooks/useGdprExport';
import toast from 'react-hot-toast';

export default function PrivacySettingsPage() {
  const navigate = useNavigate();
  const {
    settings,
    setGhostMode,
    setVisibilityDistance,
  } = useUserSettings();
  const { downloadExport, isExporting } = useGdprExport();

  const handleExportData = async () => {
    const { error } = await downloadExport();
    if (error) {
      toast.error('Erreur lors de l\'export');
    } else {
      toast.success('Tes données ont été téléchargées !');
    }
  };

  const handleGhostMode = async (value: boolean) => {
    // Ghost mode is premium
    toast('Le mode fantôme est une fonctionnalité Premium !', { icon: '⭐' });
  };

  const handleDistanceChange = async (value: number) => {
    const { error } = await setVisibilityDistance(value);
    if (!error) {
      toast.success(`Distance de visibilité: ${value}m`);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Confidentialité</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* Privacy Score Banner */}
        <div className="glass rounded-xl p-4 border-2 border-signal-green/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-green/20">
              <Shield className="h-5 w-5 text-signal-green" />
            </div>
            <div>
              <p className="font-medium text-foreground">Protection maximale</p>
              <p className="text-sm text-muted-foreground">Tes données sont sécurisées et chiffrées</p>
            </div>
          </div>
        </div>

        {/* Ghost Mode */}
        <div className="glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">
                <Ghost className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Mode fantôme</span>
                  <span className="px-2 py-0.5 text-xs font-medium bg-coral/20 text-coral rounded-full">
                    Premium
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Vois les signaux des autres sans que le tien soit visible
                </p>
              </div>
            </div>
            <Switch
              checked={settings.ghost_mode}
              onCheckedChange={handleGhostMode}
              disabled
            />
          </div>
        </div>

        {/* Visibility Distance */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="font-medium text-foreground">Distance de visibilité</span>
              <p className="text-sm text-muted-foreground mt-0.5">
                Rayon dans lequel tu vois les autres signaux
              </p>
            </div>
          </div>
          
          <div className="px-1">
            <Slider
              value={[settings.visibility_distance]}
              onValueChange={([value]) => handleDistanceChange(value)}
              min={50}
              max={500}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>50m</span>
              <span className="text-coral font-semibold">{settings.visibility_distance}m</span>
              <span>500m</span>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Comment tes données sont protégées
          </h2>
          
          <div className="space-y-3">
            <div className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Prénom seulement</p>
                <p className="text-sm text-muted-foreground">
                  Seul ton prénom est visible par les autres. Ton email reste privé.
                </p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Position non stockée</p>
                <p className="text-sm text-muted-foreground">
                  Ta position n'est jamais stockée. Elle disparaît quand tu désactives ton signal.
                </p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Données chiffrées</p>
                <p className="text-sm text-muted-foreground">
                  Toutes tes données sont chiffrées et sécurisées.
                </p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-signal-green/20 text-signal-green">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-foreground">Contrôle total</p>
                <p className="text-sm text-muted-foreground">
                  Tu peux supprimer ton compte et toutes tes données à tout moment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Export */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-coral/20 text-coral">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Exporter mes données</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Télécharge une copie de toutes tes données (RGPD)
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full mt-4 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Télécharger mes données
              </>
            )}
          </Button>
        </div>

        {/* Link to Privacy Policy */}
        <button
          onClick={() => navigate('/privacy')}
          className="w-full glass rounded-xl p-4 text-center text-coral font-medium hover:bg-coral/10 transition-colors"
        >
          Voir la politique de confidentialité complète →
        </button>
      </div>
    </div>
  );
}