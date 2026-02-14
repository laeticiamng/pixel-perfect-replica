import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SettingsRowBaseProps {
  icon: ReactNode;
  label: string;
  description?: string;
  premium?: boolean;
  className?: string;
}

interface SettingsRowToggleProps extends SettingsRowBaseProps {
  type: 'toggle';
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

interface SettingsRowSliderProps extends SettingsRowBaseProps {
  type: 'slider';
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}

interface SettingsRowLinkProps extends SettingsRowBaseProps {
  type: 'link';
  onClick: () => void;
}

interface SettingsRowCustomProps extends SettingsRowBaseProps {
  type: 'custom';
  children: ReactNode;
}

type SettingsRowProps = 
  | SettingsRowToggleProps 
  | SettingsRowSliderProps 
  | SettingsRowLinkProps
  | SettingsRowCustomProps;

export function SettingsRow(props: SettingsRowProps) {
  const { icon, label, description, premium, className, type } = props;

  const content = (
    <>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
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
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {type === 'toggle' && (
        <Switch
          aria-label={label}
          checked={props.value}
          onCheckedChange={props.onChange}
          disabled={props.disabled || premium}
        />
      )}
      
      {type === 'link' && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
    </>
  );

  // Slider has a different layout
  if (type === 'slider') {
    return (
      <div className={cn("glass rounded-xl p-4", className)}>
        <div className="flex items-start justify-between gap-4">
          {content}
        </div>
        <div className="mt-4 px-1">
          <Slider
            aria-label={label}
            value={[props.value]}
            onValueChange={([value]) => props.onChange(value)}
            min={props.min}
            max={props.max}
            step={props.step}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{props.min}{props.unit}</span>
            <span>{props.max}{props.unit}</span>
          </div>
        </div>
      </div>
    );
  }

  // Custom type for special content
  if (type === 'custom') {
    return (
      <div className={cn("glass rounded-xl p-4", className)}>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-2 rounded-lg bg-deep-blue-light text-coral">
            {icon}
          </div>
          <div>
            <span className="font-medium text-foreground">{label}</span>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {props.children}
      </div>
    );
  }

  // Link type is clickable
  if (type === 'link') {
    return (
      <button
        onClick={props.onClick}
        className={cn(
          "w-full glass rounded-xl p-4 flex items-center justify-between gap-4",
          "hover:bg-muted/50 active:bg-muted/70 transition-colors",
          "focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2",
          className
        )}
      >
        {content}
      </button>
    );
  }

  // Toggle type
  return (
    <div className={cn("glass rounded-xl p-4 flex items-start justify-between gap-4", className)}>
      {content}
    </div>
  );
}
