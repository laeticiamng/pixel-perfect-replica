import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <PageLayout className="pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Conditions d'utilisation</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground text-sm">
            Dernière mise à jour : Janvier 2026
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptation des conditions</h2>
            <p className="text-muted-foreground">
              En utilisant EASY, vous acceptez d'être lié par ces conditions d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Description du service</h2>
            <p className="text-muted-foreground">
              EASY est une application permettant aux utilisateurs de signaler leur disponibilité 
              pour des interactions sociales dans leur environnement proche. L'application utilise 
              la géolocalisation pour afficher les signaux des utilisateurs à proximité.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Compte utilisateur</h2>
            <p className="text-muted-foreground">
              Vous devez créer un compte pour utiliser EASY. Vous êtes responsable de maintenir 
              la confidentialité de vos identifiants et de toutes les activités sur votre compte.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Comportement acceptable</h2>
            <p className="text-muted-foreground">
              Vous vous engagez à utiliser EASY de manière respectueuse. Sont interdits :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Le harcèlement ou l'intimidation d'autres utilisateurs</li>
              <li>L'usurpation d'identité</li>
              <li>Le partage de contenu offensant ou illégal</li>
              <li>L'utilisation à des fins commerciales non autorisées</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              EASY et tout son contenu sont protégés par les droits d'auteur et autres droits 
              de propriété intellectuelle. Vous n'êtes pas autorisé à copier, modifier ou distribuer 
              le contenu de l'application sans autorisation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Limitation de responsabilité</h2>
            <p className="text-muted-foreground">
              EASY est fourni "tel quel". Nous ne garantissons pas que l'application sera 
              disponible en permanence ou sans erreur. Nous ne sommes pas responsables des 
              interactions entre utilisateurs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Modification des conditions</h2>
            <p className="text-muted-foreground">
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications seront effectives dès leur publication dans l'application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant ces conditions, contactez-nous à : 
              <a href="mailto:legal@easy-app.fr" className="text-coral ml-1">legal@easy-app.fr</a>
            </p>
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 EASY. Tous droits réservés.
        </p>
      </div>
    </PageLayout>
  );
}