import { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface LocationDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  maxLength?: number;
  className?: string;
  placeholder?: string;
}

export function LocationDescriptionInput({
  value,
  onChange,
  onSave,
  maxLength = 100,
  className,
  placeholder: customPlaceholder
}: LocationDescriptionInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { t } = useTranslation();
  const placeholder = customPlaceholder || t('locationInput.placeholder');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const charsRemaining = maxLength - value.length;
  const isNearLimit = charsRemaining <= 20;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-12 h-12 bg-deep-blue-light border-border text-foreground",
            "placeholder:text-muted-foreground rounded-xl transition-all",
            isFocused && "ring-2 ring-coral/30"
          )}
        />
        {value && onSave && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onSave}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-coral hover:text-coral-dark hover:bg-coral/10"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex justify-between mt-1.5 px-1">
        <span className="text-xs text-muted-foreground">
          {t('locationInput.hint')}
        </span>
        <span className={cn(
          "text-xs font-medium transition-colors",
          isNearLimit ? "text-signal-yellow" : "text-muted-foreground",
          charsRemaining <= 5 && "text-signal-red"
        )}>
          {charsRemaining}
        </span>
      </div>
    </div>
  );
}
