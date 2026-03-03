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

export const LandingTestimonialsSection = forwardRef<HTMLElement>(function LandingTestimonialsSection(_props, ref) {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase
      .from('user_testimonials')
      .select('id, quote, activity')
      .eq('is_approved', true)
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data);
      });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section ref={ref} className="py-16 px-6 relative z-10 bg-card/30">
      <div className="max-w-5xl mx-auto">
        <RevealText>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {t('landing.testimonialsTitle')}
          </h2>
        </RevealText>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <RevealText key={item.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -2 }}
                className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <Quote className="h-5 w-5 text-coral/40 mb-3" />
                <p className="text-sm text-foreground/80 italic leading-relaxed mb-4">
                  "{item.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-coral/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-coral">
                      {item.activity.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{item.activity}</span>
                </div>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
});
