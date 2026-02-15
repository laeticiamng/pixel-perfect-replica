import { useState } from 'react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, MapPin, Clock, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartLocationRecommender } from '@/components/social';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivitySelector } from '@/components/radar';
import type { CreateSessionInput, ActivityType, DurationOption } from '@/hooks/useBinomeSessions';

// Schema factory to inject translated error messages (fixes I18N-02)
const createFormSchema = (t: (key: string) => string) => z.object({
  scheduled_date: z.date({ required_error: t('createSession.dateRequired') }).refine(date => date >= new Date(new Date().setHours(0,0,0,0)), { message: t('createSession.dateFuture') }),
  start_time: z.string().min(1, t('createSession.timeRequired')),
  duration_minutes: z.number().refine(val => [45, 90, 180].includes(val), { message: t('createSession.invalidDuration') }),
  activity: z.enum(['studying', 'eating', 'working', 'talking', 'sport', 'other'] as const),
  city: z.string().min(2, t('createSession.cityRequired')).max(100),
  location_name: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
  max_participants: z.number().min(1).max(10).default(3),
});

type FormData = z.infer<typeof formSchema>;

interface CreateSessionFormProps {
  onSubmit: (data: CreateSessionInput) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function CreateSessionForm({ onSubmit, onCancel, isLoading }: CreateSessionFormProps) {
  const { t, locale } = useTranslation();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);

  const durationOptions: { value: DurationOption; label: string }[] = [
    { value: 45, label: t('createSession.duration45') },
    { value: 90, label: t('createSession.duration90') },
    { value: 180, label: t('createSession.duration180') },
  ];

  const formSchema = createFormSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { duration_minutes: 90, max_participants: 3, city: '', location_name: '', note: '' },
  });

  const cityValue = useWatch({ control: form.control, name: 'city' });

  const handleSelectLocation = (name: string) => { form.setValue('location_name', name); };

  const handleSubmit = async (data: FormData) => {
    if (!selectedActivity) { form.setError('activity', { message: t('createSession.selectActivity') }); return; }

    const input: CreateSessionInput = {
      scheduled_date: format(data.scheduled_date, 'yyyy-MM-dd'),
      start_time: data.start_time,
      duration_minutes: data.duration_minutes as DurationOption,
      activity: selectedActivity,
      city: data.city.trim(),
      location_name: data.location_name?.trim() || undefined,
      note: data.note?.trim() || undefined,
      max_participants: data.max_participants,
    };

    const success = await onSubmit(input);
    if (success) { form.reset(); setSelectedActivity(null); }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div>
          <FormLabel className="text-foreground">{t('createSession.activity')}</FormLabel>
          <div className="mt-2">
            <ActivitySelector selectedActivity={selectedActivity} onSelect={(activity) => { setSelectedActivity(activity as ActivityType); form.setValue('activity', activity as ActivityType); form.clearErrors('activity'); }} />
          </div>
          {form.formState.errors.activity && <p className="text-sm text-destructive mt-1">{form.formState.errors.activity.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="scheduled_date" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('createSession.date')}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "d MMM", { locale: dateLocale }) : <span>{t('createSession.choose')}</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus className="p-3 pointer-events-auto" locale={dateLocale} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="start_time" render={({ field }) => (
            <FormItem>
              <FormLabel>{t('createSession.time')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><Clock className="mr-2 h-4 w-4" /><SelectValue placeholder={t('createSession.time')} /></SelectTrigger>
                </FormControl>
                <SelectContent>{timeSlots.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="duration_minutes" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('createSession.duration')}</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <Button key={option.value} type="button" variant={field.value === option.value ? "default" : "outline"}
                  className={cn(field.value === option.value && "bg-coral hover:bg-coral/90")} onClick={() => field.onChange(option.value)}>
                  {option.label}
                </Button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="city" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('createSession.city')}</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('createSession.cityPlaceholder')} className="pl-10" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="location_name" render={({ field }) => (
          <FormItem>
            <FormLabel>{t('createSession.locationOptional')}</FormLabel>
            <FormControl><Input placeholder={t('createSession.locationPlaceholder')} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {selectedActivity && cityValue && cityValue.length >= 2 && (
          <SmartLocationRecommender activity={selectedActivity} city={cityValue} onSelectLocation={handleSelectLocation} />
        )}

        {/* UX-02: Aligned max participants UI with DB constraint (1-10) */}
        <FormField control={form.control} name="max_participants" render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4" />{t('createSession.maxParticipants')}</FormLabel>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Button key={num} type="button" variant={field.value === num ? "default" : "outline"} size="sm"
                  className={cn("w-10 h-10", field.value === num && "bg-coral hover:bg-coral/90")} onClick={() => field.onChange(num)}>
                  {num}
                </Button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="note" render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2"><FileText className="h-4 w-4" />{t('createSession.noteOptional')}</FormLabel>
            <FormControl><Textarea placeholder={t('createSession.notePlaceholder')} className="resize-none" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isLoading}>{t('createSession.cancel')}</Button>
          <Button type="submit" className="flex-1 bg-coral hover:bg-coral/90" disabled={isLoading}>
            {isLoading ? t('createSession.creating') : t('createSession.createSlot')}
          </Button>
        </div>
      </form>
    </Form>
  );
}