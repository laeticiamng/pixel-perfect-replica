import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReports } from '@/hooks/useReports';
import { useRateLimit, RATE_LIMIT_PRESETS } from '@/hooks/useRateLimit';
import { sanitizeDbText } from '@/lib/sanitize';
import { useTranslation } from '@/lib/i18n';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ReportType = 'bug' | 'behavior' | 'content' | 'other';

export default function ReportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createReport, isLoading } = useReports();
  const reportRateLimit = useRateLimit(RATE_LIMIT_PRESETS.report);
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [description, setDescription] = useState('');

  const reportTypes = [
    { id: 'bug' as ReportType, label: t('report.typeBug'), emoji: '🐛' },
    { id: 'behavior' as ReportType, label: t('report.typeBehavior'), emoji: '⚠️' },
    { id: 'content' as ReportType, label: t('report.typeContent'), emoji: '🚫' },
    { id: 'other' as ReportType, label: t('report.typeOther'), emoji: '❓' },
  ];

  const handleSubmit = async () => {
    if (!reportType) {
      toast.error(t('report.typeRequired'));
      return;
    }
    
    const sanitizedDescription = sanitizeDbText(description, 1000);
    
    if (!sanitizedDescription) {
      toast.error(t('report.descriptionRequired'));
      return;
    }
    
    if (sanitizedDescription.length < 10) {
      toast.error(t('report.descriptionTooShort'));
      return;
    }
    
    const { allowed } = reportRateLimit.checkRateLimit();
    if (!allowed) {
      toast.error(t('auth.tooManyAttempts'));
      return;
    }
    
    reportRateLimit.recordAttempt();
    const { error } = await createReport(
      reportTypes.find(r => r.id === reportType)?.label || reportType,
      sanitizedDescription
    );
    
    if (error) {
      toast.error(t('report.sendError'));
    } else {
      toast.success(t('report.success'));
      navigate('/profile');
    }
  };

  return (
    <PageLayout className="pb-8 safe-bottom">
      <PageHeader title={t('report.title')} backTo="/profile" />

      <div className="px-6 py-8">
        {/* Info Banner */}
        <div className="glass rounded-xl p-4 mb-6 border-2 border-signal-yellow/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-signal-yellow/20">
              <AlertTriangle className="h-5 w-5 text-signal-yellow" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('report.confidentialNotice')}
            </p>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground block mb-3">
            {t('report.typeLabel')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {reportTypes.map((type, idx) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={cn(
                  'glass rounded-xl p-4 text-left transition-all animate-slide-up',
                  reportType === type.id
                    ? 'border-2 border-coral glow-coral'
                    : 'border-2 border-transparent hover:border-muted'
                )}
                style={{ animationDelay: `${idx * 0.05}s` }}
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
            {t('report.describeLabel')}
          </label>
          <Textarea
            placeholder={t('report.describePlaceholder')}
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
            {t('report.privacyNotice')}
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
            t('report.submit')
          )}
        </Button>
      </div>
    </PageLayout>
  );
}
