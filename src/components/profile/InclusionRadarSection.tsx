import { Globe, Accessibility, Heart, GraduationCap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n';

interface InclusionRadarSectionProps {
  inclusionInternational: boolean;
  inclusionDisability: boolean;
  inclusionLgbtq: boolean;
  inclusionFirstGen: boolean;
  onChangeInternational: (v: boolean) => void;
  onChangeDisability: (v: boolean) => void;
  onChangeLgbtq: (v: boolean) => void;
  onChangeFirstGen: (v: boolean) => void;
}

const tags = [
  { key: 'international', icon: Globe, color: 'text-blue-400' },
  { key: 'disability', icon: Accessibility, color: 'text-purple-400' },
  { key: 'lgbtq', icon: Heart, color: 'text-pink-400' },
  { key: 'firstGen', icon: GraduationCap, color: 'text-amber-400' },
] as const;

export function InclusionRadarSection({
  inclusionInternational,
  inclusionDisability,
  inclusionLgbtq,
  inclusionFirstGen,
  onChangeInternational,
  onChangeDisability,
  onChangeLgbtq,
  onChangeFirstGen,
}: InclusionRadarSectionProps) {
  const { t } = useTranslation();

  const values = {
    international: inclusionInternational,
    disability: inclusionDisability,
    lgbtq: inclusionLgbtq,
    firstGen: inclusionFirstGen,
  };

  const handlers = {
    international: onChangeInternational,
    disability: onChangeDisability,
    lgbtq: onChangeLgbtq,
    firstGen: onChangeFirstGen,
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        🌈 {t('inclusion.title')}
      </h4>
      <p className="text-xs text-muted-foreground">{t('inclusion.description')}</p>

      <div className="space-y-3">
        {tags.map(({ key, icon: Icon, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{t(`inclusion.${key}`)}</p>
                <p className="text-xs text-muted-foreground">{t(`inclusion.${key}Desc`)}</p>
              </div>
            </div>
            <Switch
              checked={values[key]}
              onCheckedChange={handlers[key]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
