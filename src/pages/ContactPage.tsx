import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/PageLayout';
import { useTranslation } from '@/lib/i18n';
import { SUPPORT_EMAIL } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '@/lib/constants';
import { z } from 'zod';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'required').max(100),
  email: z.string().trim().email('invalid').max(255),
  message: z.string().trim().min(10, 'tooShort').max(2000),
});

export default function ContactPage() {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const { profile } = useAuth();

  const [name, setName] = useState(profile?.first_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse({ name, email, message });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    // Open mailto with pre-filled content
    const subjectText = t('contact.mailSubject').replace('{name}', name);
    const subject = encodeURIComponent(subjectText);
    const nameLabel = t('contact.mailBodyName');
    const emailLabel = t('contact.mailBodyEmail');
    const body = encodeURIComponent(`${nameLabel} : ${name}\n${emailLabel} : ${email}\n\n${message}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    setSent(true);
    toast.success(t('contact.sent'));
  };

  return (
    <PageLayout className="pb-16">
      <Helmet>
        <title>{locale === 'fr' ? 'Contact — NEARVITY' : 'Contact — NEARVITY'}</title>
        <meta name="description" content={locale === 'fr'
          ? 'Contacte l\'équipe NEARVITY. Une question, un bug, une suggestion ? Écris-nous !'
          : 'Contact the NEARVITY team. Question, bug, suggestion? Write to us!'
        } />
        <link rel="canonical" href={`${SITE_URL}/contact`} />
      </Helmet>

      <header className="safe-top px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors" aria-label={t('back')}>
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('contact.title')}</h1>
      </header>

      <motion.div
        className="px-4 sm:px-6 max-w-lg mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm">{t('contact.subtitle')}</p>

        {/* Direct email link */}
        <Card className="glass border-border/50">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral/20 flex items-center justify-center">
              <Mail className="h-5 w-5 text-coral" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{t('contact.emailDirect')}</p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-coral hover:underline">{SUPPORT_EMAIL}</a>
            </div>
          </CardContent>
        </Card>

        {/* Contact form */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <CheckCircle className="h-16 w-16 text-signal-green mx-auto" />
              <h2 className="text-xl font-bold text-foreground">{t('contact.thankYou')}</h2>
              <p className="text-muted-foreground text-sm">{t('contact.thankYouDesc')}</p>
              <Button variant="outline" onClick={() => navigate('/')}>{t('common.back')}</Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <Card className="glass border-border/50">
                <CardContent className="py-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-coral" />
                    <h2 className="font-semibold text-foreground">{t('contact.formTitle')}</h2>
                  </div>

                  <div>
                    <label htmlFor="contact-name" className="text-sm font-medium text-foreground mb-1 block">{t('contact.nameLabel')}</label>
                    <Input
                      id="contact-name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('contact.namePlaceholder')}
                      className="bg-muted"
                      maxLength={100}
                      autoComplete="name"
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <p id="contact-name-error" className="text-xs text-destructive mt-1" role="alert">{t('contact.nameRequired')}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="text-sm font-medium text-foreground mb-1 block">{t('contact.emailLabel')}</label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('contact.emailPlaceholder')}
                      className="bg-muted"
                      maxLength={255}
                      autoComplete="email"
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && <p id="contact-email-error" className="text-xs text-destructive mt-1" role="alert">{t('contact.emailInvalid')}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="text-sm font-medium text-foreground mb-1 block">{t('contact.messageLabel')}</label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t('contact.messagePlaceholder')}
                      className="bg-muted min-h-[120px]"
                      maxLength={2000}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      aria-invalid={!!errors.message}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">{message.length}/2000</p>
                    {errors.message && <p id="contact-message-error" className="text-xs text-destructive mt-1" role="alert">{t('contact.messageTooShort')}</p>}
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-coral to-coral-light hover:from-coral-dark hover:to-coral">
                <Send className="h-4 w-4 mr-2" />
                {t('contact.send')}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </PageLayout>
  );
}
