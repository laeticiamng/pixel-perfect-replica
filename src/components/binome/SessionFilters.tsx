import { useState } from 'react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Search, Calendar, Clock, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import type { SessionFilters as Filters, ActivityType, DurationOption } from '@/hooks/useBinomeSessions';

interface SessionFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const durationOptions: { value: DurationOption; label: string }[] = [
  { value: 45, label: '45 min' },
  { value: 90, label: '1h30' },
  { value: 180, label: '3h' },
];

export function SessionFilters({ filters, onFiltersChange, onSearch, isLoading }: SessionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;

  const activeFiltersCount = [filters.activity, filters.date, filters.duration].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({ ...filters, activity: undefined, date: undefined, duration: undefined });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('sessionFilters.searchCity')}
            value={filters.city}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <Button onClick={onSearch} disabled={!filters.city || isLoading} className="bg-coral hover:bg-coral/90">
          {isLoading ? t('sessionFilters.searching') : t('sessionFilters.search')}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="text-muted-foreground">
          <Filter className="h-4 w-4 mr-2" />
          {t('sessionFilters.filters')}
          {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-2 text-xs">{activeFiltersCount}</Badge>}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" />
            {t('sessionFilters.clear')}
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !filters.date && "text-muted-foreground")}>
                <Calendar className="h-4 w-4 mr-2" />
                {filters.date ? format(new Date(filters.date), 'd MMM', { locale: dateLocale }) : t('sessionFilters.date')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filters.date ? new Date(filters.date) : undefined}
                onSelect={(date) => onFiltersChange({ ...filters, date: date ? format(date, 'yyyy-MM-dd') : undefined })}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={filters.activity || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, activity: value === 'all' ? undefined : value as ActivityType })}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t('sessionFilters.activity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sessionFilters.allActivities')}</SelectItem>
              <SelectItem value="studying">{t('activities.studying')}</SelectItem>
              <SelectItem value="working">{t('activities.working')}</SelectItem>
              <SelectItem value="eating">{t('activities.eating')}</SelectItem>
              <SelectItem value="sport">{t('activities.sport')}</SelectItem>
              <SelectItem value="talking">{t('activities.talking')}</SelectItem>
              <SelectItem value="other">{t('activities.other')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.duration?.toString() || 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, duration: value === 'all' ? undefined : Number(value) as DurationOption })}
          >
            <SelectTrigger className="h-9">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('sessionFilters.duration')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('sessionFilters.allDurations')}</SelectItem>
              {durationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
