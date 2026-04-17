import { useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { RevealText } from './RevealText';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * Landing FAQ — visible answers + crawlable text.
 * The JSON-LD FAQPage schema is emitted in LandingPage.tsx Helmet
 * to keep all structured data co-located with page metadata.
 */
export function LandingFAQSection() {
  const { t } = useTranslation();

  const faqs = useMemo(
    () => [
      { q: t('landing.faqWhatIsItQ'), a: t('landing.faqWhatIsItA') },
      { q: t('landing.faqHowMapWorksQ'), a: t('landing.faqHowMapWorksA') },
      { q: t('landing.faqDataVisibleQ'), a: t('landing.faqDataVisibleA') },
      { q: t('landing.faqIsItFreeQ'), a: t('landing.faqIsItFreeA') },
      { q: t('landing.faqWhoIsItForQ'), a: t('landing.faqWhoIsItForA') },
      { q: t('landing.faqGhostModeQ'), a: t('landing.faqGhostModeA') },
    ],
    [t]
  );

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-16 px-6 relative z-10 scroll-mt-20"
    >
      <div className="max-w-3xl mx-auto">
        <RevealText>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold text-center mb-4"
          >
            {t('landing.faqTitle')}
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">
            {t('landing.faqSubtitle')}
          </p>
        </RevealText>

        <RevealText delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden"
          >
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-border/40 last:border-0"
              >
                <AccordionTrigger className="px-5 text-left text-base font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </RevealText>
      </div>
    </section>
  );
}

/**
 * Returns the FAQ data in plain object form, for JSON-LD generation
 * inside <Helmet>. Keep in sync with the rendered component above.
 */
export function getLandingFaqsForJsonLd(t: (k: string) => string) {
  return [
    { q: t('landing.faqWhatIsItQ'), a: t('landing.faqWhatIsItA') },
    { q: t('landing.faqHowMapWorksQ'), a: t('landing.faqHowMapWorksA') },
    { q: t('landing.faqDataVisibleQ'), a: t('landing.faqDataVisibleA') },
    { q: t('landing.faqIsItFreeQ'), a: t('landing.faqIsItFreeA') },
    { q: t('landing.faqWhoIsItForQ'), a: t('landing.faqWhoIsItForA') },
    { q: t('landing.faqGhostModeQ'), a: t('landing.faqGhostModeA') },
  ];
}
