import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, Mail, MessageCircle, FileText, Shield, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: "Comment fonctionne SIGNAL ?",
      answer: "SIGNAL te permet de signaler que tu es ouvert à l'interaction dans un lieu. Les autres utilisateurs peuvent voir ton signal et venir te parler avec un icebreaker suggéré."
    },
    {
      question: "Ma position est-elle stockée ?",
      answer: "Non, ta position n'est jamais stockée sur nos serveurs. Elle est utilisée uniquement en temps réel pour afficher les signaux autour de toi."
    },
    {
      question: "Qu'est-ce que le mode fantôme ?",
      answer: "Le mode fantôme (Premium) te permet de voir les signaux des autres sans que les tiens soient visibles. Parfait pour observer avant de te lancer !"
    },
    {
      question: "Comment signaler un comportement inapproprié ?",
      answer: "Tu peux signaler un problème via le menu Support dans ton profil. Notre équipe traitera ta demande rapidement."
    },
    {
      question: "Comment supprimer mon compte ?",
      answer: "Va dans Paramètres, puis clique sur 'Supprimer mon compte'. Tu devras confirmer en tapant SUPPRIMER."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, nous utilisons le chiffrement et des politiques de sécurité strictes. Tu peux exporter tes données depuis les paramètres de confidentialité."
    },
    {
      question: "Qu'est-ce que la distance de visibilité ?",
      answer: "C'est le rayon maximum dans lequel tu verras les autres signaux. Tu peux l'ajuster de 50m à 500m dans les paramètres."
    },
    {
      question: "Comment fonctionne le rating ?",
      answer: "Après chaque interaction, les utilisateurs peuvent laisser un feedback positif ou négatif. Ton rating moyen reflète la qualité de tes échanges."
    },
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const supportLinks = [
    { icon: <Mail className="h-5 w-5" />, label: 'Nous contacter', href: 'mailto:support@signal-app.fr' },
    { icon: <MessageCircle className="h-5 w-5" />, label: 'Communauté', href: 'https://discord.gg', external: true },
    { icon: <FileText className="h-5 w-5" />, label: 'Conditions d\'utilisation', href: '/terms' },
    { icon: <Shield className="h-5 w-5" />, label: 'Politique de confidentialité', href: '/privacy' },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Aide & FAQ</h1>
        <span className="ml-auto px-2 py-1 text-xs font-medium bg-coral/20 text-coral rounded-lg">
          {faqs.length} questions
        </span>
      </header>

      <div className="px-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground rounded-xl"
          />
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Questions fréquentes {searchQuery && `(${filteredFaqs.length} résultats)`}
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`p-4 ${index !== filteredFaqs.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <p className="font-medium text-foreground mb-2">{faq.question}</p>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">Aucune question trouvée</p>
                <p className="text-sm text-muted-foreground mt-1">Essaie avec d'autres mots-clés</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Links */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Support
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {supportLinks.map((link, index) => {
              const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
              
              if (isExternal) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className={`flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                      index !== supportLinks.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="text-muted-foreground">{link.icon}</span>
                    <span className="flex-1 text-foreground">{link.label}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                );
              }
              
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.href)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                    index !== supportLinks.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="text-muted-foreground">{link.icon}</span>
                  <span className="flex-1 text-left text-foreground">{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">SIGNAL v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">Made with ❤️ in Paris</p>
        </div>
      </div>
    </div>
  );
}
