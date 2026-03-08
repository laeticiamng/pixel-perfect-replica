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
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="relative flex-shrink-0 w-[320px] p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md group hover:border-coral/30 transition-all duration-300">
      {/* Top shine */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
      
      <Quote className="h-5 w-5 text-coral/30 mb-3" />
      <p className="text-sm text-foreground/80 italic leading-relaxed mb-4 line-clamp-4">
        "{item.quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-coral/30 to-coral/10 flex items-center justify-center border border-coral/20">
          <span className="text-xs font-bold text-coral">
            {item.activity.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground capitalize font-medium">{item.activity}</span>
        </div>
      </div>
    </div>
  );
}

function Marquee({ items, direction = 'left' }: { items: Testimonial[]; direction?: 'left' | 'right' }) {
  // Double items for infinite loop
  const doubled = [...items, ...items];
  
  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      
      <motion.div
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          x: {
            duration: items.length * 8,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.id}-${i}`} item={item} />
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
        if (data && data.length > 0) setTestimonials(data);
      });
  }, []);

  if (testimonials.length === 0) return null;

  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);

  return (
    <section ref={ref} className="py-16 relative z-10 overflow-hidden">
      <div className="px-6">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('landing.testimonialsTitle')}
          </h2>
        </RevealText>
      </div>

      <div className="space-y-4">
        <Marquee items={row1} direction="left" />
        {row2.length > 0 && <Marquee items={row2} direction="right" />}
      </div>
    </section>
  );
});
