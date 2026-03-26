import { forwardRef, useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  quote: string;
  activity: string;
  name?: string;
}

const TestimonialCard = forwardRef<HTMLDivElement, { item: Testimonial; betaLabel?: string }>(function TestimonialCard({ item, betaLabel }, ref) {
  return (
    <div ref={ref} className="relative flex-shrink-0 w-[280px] sm:w-[320px] p-5 sm:p-6 rounded-2xl border border-border/25 bg-card/25 backdrop-blur-xl group hover:border-coral/25 hover:bg-card/40 transition-all duration-400">
      {/* Top shine */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/6 to-transparent" />

      <Quote className="h-4 w-4 text-coral/25 mb-3" />
      <p className="text-sm text-foreground/75 italic leading-relaxed mb-4 line-clamp-4">
        "{item.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-coral/25 to-coral/10 flex items-center justify-center border border-coral/15">
          <span className="text-[10px] font-bold text-coral">
            {(item.name ?? item.activity).charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          {item.name ? (
            <>
              <span className="text-xs font-semibold text-foreground/75 block">{item.name}</span>
              <span className="text-[10px] text-muted-foreground/60">{betaLabel ?? item.activity}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground/70 capitalize font-medium">{item.activity}</span>
          )}
        </div>
      </div>
    </div>
  );
});

function Marquee({ items, direction = 'left', betaLabel }: { items: Testimonial[]; direction?: 'left' | 'right'; betaLabel?: string }) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <motion.div
        className="flex gap-3 sm:gap-4"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            duration: items.length * 10,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.id}-${i}`} item={item} betaLabel={betaLabel} />
        ))}
      </motion.div>
    </div>
  );
}

export const LandingTestimonialsSection = forwardRef<HTMLElement>(function LandingTestimonialsSection(_props, ref) {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from('user_testimonials')
      .select('id, quote, activity')
      .eq('is_approved', true)
      .limit(12)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials([
            { id: 'f1', quote: t('landing.fallbackTestimonial1'), activity: t('landing.fallbackActivity1'), name: 'Lucas' },
            { id: 'f2', quote: t('landing.fallbackTestimonial2'), activity: t('landing.fallbackActivity2'), name: 'Maria' },
            { id: 'f3', quote: t('landing.fallbackTestimonial3'), activity: t('landing.fallbackActivity3'), name: 'Thomas' },
            { id: 'f4', quote: t('landing.fallbackTestimonial4'), activity: t('landing.fallbackActivity4'), name: 'Sophie' },
          ]);
        }
      });
  }, [t]);

  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);
  const isFallback = testimonials.length > 0 && testimonials[0].name != null;
  const betaLabel = isFallback ? t('landing.betaTester') : undefined;

  return (
    <section ref={ref} className="py-14 sm:py-16 relative z-10 overflow-hidden">
      <div className="px-6">
        <RevealText>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-12">
            {t('landing.testimonialsTitle')}
          </h2>
        </RevealText>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <Marquee items={row1} direction="left" betaLabel={betaLabel} />
        {row2.length > 0 && <Marquee items={row2} direction="right" betaLabel={betaLabel} />}
      </div>
    </section>
  );
});
