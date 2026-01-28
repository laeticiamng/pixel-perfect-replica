import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, Mail, MessageCircle, Bug, FileText, Shield } from 'lucide-react';

export default function HelpPage() {
  const navigate = useNavigate();

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
  ];

  const supportLinks = [
    { icon: <Mail className="h-5 w-5" />, label: 'Nous contacter', href: 'mailto:support@signal-app.fr' },
    { icon: <MessageCircle className="h-5 w-5" />, label: 'Discord', href: '#' },
    { icon: <FileText className="h-5 w-5" />, label: 'Conditions d\'utilisation', href: '#' },
    { icon: <Shield className="h-5 w-5" />, label: 'Politique de confidentialité', href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-radial pb-8">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Aide & FAQ</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* FAQ Section */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Questions fréquentes
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`p-4 ${index !== faqs.length - 1 ? 'border-b border-border' : ''}`}
              >
                <p className="font-medium text-foreground mb-2">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Links */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Support
          </h2>
          <div className="glass rounded-xl overflow-hidden">
            {supportLinks.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors ${
                  index !== supportLinks.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span className="text-muted-foreground">{link.icon}</span>
                <span className="flex-1 text-foreground">{link.label}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            ))}
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
