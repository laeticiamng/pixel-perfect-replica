import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  type?: 'toggle' | 'slider' | 'link';
  value?: boolean | number;
  onChange?: (value: boolean | number) => void;
  onClick?: () => void;
  premium?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function SettingsItem({
  icon,
  label,
  description,
  type = 'toggle',
  value,
  onChange,
  onClick,
  premium,
  disabled,
  min = 50,
  max = 500,
  step = 50,
}: SettingsItemProps) {
  const isToggle = type === 'toggle';
  const isSlider = type === 'slider';
  const isLink = type === 'link';

  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-deep-blue-light text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{label}</span>
            {premium && (
              <span className="px-2 py-0.5 text-xs font-medium bg-coral/20 text-coral rounded-full">
                Premium
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {isToggle && (
        <Switch
          checked={value as boolean}
          onCheckedChange={(checked) => onChange?.(checked)}
          disabled={disabled || premium}
        />
      )}
      
      {isLink && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </div>
  );

  if (isLink && onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full glass rounded-xl p-4 text-left hover:bg-muted/50 active:bg-muted/70 transition-colors"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      {content}
      {isSlider && (
        <div className="mt-4 px-1">
          <Slider
            value={[value as number]}
            onValueChange={([v]) => onChange?.(v)}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{min}m</span>
            <span>{max}m</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingsSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({ title, children, className }: SettingsSectionProps) {
  return (
    <motion.div 
      className={cn("space-y-3", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}

interface SettingsGroupProps {
  children: ReactNode;
  className?: string;
}

export function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <div className={cn("glass rounded-xl overflow-hidden divide-y divide-border/50", className)}>
      {children}
    </div>
  );
}

interface SettingsGroupItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  onClick?: () => void;
}

export function SettingsGroupItem({ icon, label, description, onClick }: SettingsGroupItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-muted/50 active:bg-muted/70 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
          {icon}
        </div>
        <div className="text-left">
          <span className="font-medium text-foreground">{label}</span>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}
