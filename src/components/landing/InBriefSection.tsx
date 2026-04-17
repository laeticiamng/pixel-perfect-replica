import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import { MapPin, Users, Zap, Shield } from 'lucide-react';

/**
 * "In Brief" / TL;DR section — GEO-optimized for AI citation.
 * Provides a concise, citable summary of what NEARVITY is, for whom,
 * and how it works. Designed to be easily extracted by LLMs
 * (ChatGPT Search, Perplexity, Copilot) when answering user queries.
 */
export function InBriefSection() {
  const { t } = useTranslation();

  const points = [
    { icon: Zap, label: t('landing.inBriefWhat'), value: t('landing.inBriefWhatValue') },
    { icon: Users, label: t('landing.inBriefWho'), value: t('landing.inBriefWhoValue') },
    { icon: MapPin, label: t('landing.inBriefHow'), value: t('landing.inBriefHowValue') },
    { icon: Shield, label: t('landing.inBriefPrice'), value: t('landing.inBriefPriceValue') },
  ];

  return (
    <section
      id="in-brief"
      aria-labelledby="in-brief-heading"
      className="py-12 px-6 relative z-10 scroll-mt-20"
    >
      <div className="max-w-4xl mx-auto">
        <RevealText>
          <p className="text-xs uppercase tracking-widest text-coral mb-2 text-center font-medium">
            {t('landing.inBriefLabel')}
          </p>
          <h2
            id="in-brief-heading"
            className="text-2xl md:text-3xl font-bold text-center mb-4"
          >
            {t('landing.inBriefTitle')}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('landing.inBriefSummary')}
          </p>
        </RevealText>

        <div className="grid sm:grid-cols-2 gap-3">
          {points.map((point, i) => (
            <RevealText key={i} delay={i * 0.08}>
              <motion.div
                className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-md"
                whileHover={{ y: -2 }}
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-coral/10 flex items-center justify-center border border-coral/20">
                  <point.icon className="h-4 w-4 text-coral" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-0.5">
                    {point.label}
                  </p>
                  <p className="text-sm text-foreground leading-snug">
                    {point.value}
                  </p>
                </div>
              </motion.div>
            </RevealText>
          ))}
        </div>
      </div>
    </section>
  );
}
