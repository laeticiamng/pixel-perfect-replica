import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReports } from '@/hooks/useReports';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ReportType = 'bug' | 'behavior' | 'content' | 'other';

export default function ReportPage() {
  const navigate = useNavigate();
  const { createReport, isLoading } = useReports();
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');

  const reportTypes = [
    { id: 'bug' as ReportType, label: 'Bug technique', emoji: '🐛' },
    { id: 'behavior' as ReportType, label: 'Comportement inapproprié', emoji: '⚠️' },
    { id: 'content' as ReportType, label: 'Contenu offensant', emoji: '🚫' },
    { id: 'other' as ReportType, label: 'Autre problème', emoji: '❓' },
  ];

  const handleSubmit = async () => {
    if (!reportType) {
      toast.error('Choisis un type de signalement');
      return;
    }
    if (!description.trim()) {
      toast.error('Décris le problème s\'il te plaît');
      return;
    }
    
    const { error } = await createReport(
      reportTypes.find(r => r.id === reportType)?.label || reportType,
      description.trim()
    );
    
    if (error) {
      toast.error('Erreur lors de l\'envoi');
    } else {
      toast.success('Signalement envoyé ! Merci pour ton aide.');
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-radial pb-8">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Signaler un problème</h1>
      </header>

      <div className="px-6 py-8">
        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-3">
            Type de signalement
          </label>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={cn(
                  'glass rounded-xl p-4 text-left transition-all',
                  reportType === type.id
                    ? 'border-2 border-coral glow-coral'
                    : 'border-2 border-transparent hover:border-muted'
                )}
              >
                <span className="text-2xl mb-2 block">{type.emoji}</span>
                <span className="text-sm font-medium text-foreground">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mb-8">
          <label className="text-sm font-medium text-foreground">
            Décris le problème
          </label>
          <Textarea
            placeholder="Explique-nous ce qui s'est passé..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[150px] bg-deep-blue-light border-border text-foreground placeholder:text-muted-foreground rounded-xl resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/1000
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="glass rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-signal-yellow shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Ton signalement sera traité de manière confidentielle. 
            Si tu signales un utilisateur, il ne sera pas informé.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !reportType || !description.trim()}
          className="w-full h-14 bg-coral hover:bg-coral-dark text-primary-foreground rounded-xl text-lg font-semibold glow-coral"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Envoyer le signalement'
          )}
        </Button>
      </div>
    </div>
  );
}
