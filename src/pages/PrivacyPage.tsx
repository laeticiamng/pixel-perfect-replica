import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Bell, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-radial pb-8 safe-bottom">
      {/* Header */}
      <header className="safe-top px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Politique de confidentialité</h1>
      </header>

      <div className="px-6 space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <p className="text-muted-foreground text-sm">
            Dernière mise à jour : Janvier 2026
          </p>

          <p className="text-foreground">
            Chez SIGNAL, nous prenons votre vie privée très au sérieux. Cette politique 
            explique comment nous collectons, utilisons et protégeons vos données.
          </p>

          {/* Key Points */}
          <div className="grid gap-4 my-6">
            <div className="flex items-start gap-4 p-4 bg-signal-green/10 rounded-xl">
              <MapPin className="h-6 w-6 text-signal-green shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Position non stockée</p>
                <p className="text-sm text-muted-foreground">
                  Votre position GPS n'est jamais stockée sur nos serveurs. Elle est utilisée 
                  uniquement en temps réel et supprimée dès la désactivation de votre signal.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-coral/10 rounded-xl">
              <User className="h-6 w-6 text-coral shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Données minimales</p>
                <p className="text-sm text-muted-foreground">
                  Nous ne collectons que les données essentielles au fonctionnement : 
                  prénom, email et université (optionnel).
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-signal-yellow/10 rounded-xl">
              <Shield className="h-6 w-6 text-signal-yellow shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Données chiffrées</p>
                <p className="text-sm text-muted-foreground">
                  Toutes vos données sont chiffrées en transit et au repos. 
                  Nous utilisons les meilleurs standards de sécurité.
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Données collectées</h2>
            <p className="text-muted-foreground">Nous collectons :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Informations de profil : prénom, email, université</li>
              <li>Données d'utilisation : activités signalées, interactions</li>
              <li>Position GPS : uniquement quand votre signal est actif</li>
              <li>Feedback et signalements que vous soumettez</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Utilisation des données</h2>
            <p className="text-muted-foreground">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Afficher votre signal aux autres utilisateurs à proximité</li>
              <li>Améliorer l'expérience utilisateur</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Vous envoyer des notifications (avec votre consentement)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Partage des données</h2>
            <p className="text-muted-foreground">
              Nous ne vendons jamais vos données. Seul votre prénom et votre activité sont 
              visibles par les autres utilisateurs quand votre signal est actif. Votre email 
              n'est jamais partagé.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Vos droits (RGPD)</h2>
            <p className="text-muted-foreground">
              Conformément au RGPD, vous avez le droit de :
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données</li>
              <li>Supprimer votre compte et vos données</li>
              <li>Exporter vos données (portabilité)</li>
              <li>Retirer votre consentement à tout moment</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Conservation des données</h2>
            <p className="text-muted-foreground">
              Vos données de profil sont conservées tant que votre compte est actif. 
              Les données de localisation des interactions sont automatiquement supprimées 
              après 7 jours. La suppression de votre compte entraîne la suppression 
              immédiate de toutes vos données.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
            <p className="text-muted-foreground">
              SIGNAL utilise uniquement des cookies techniques essentiels au fonctionnement 
              de l'application (session, authentification). Nous n'utilisons pas de cookies 
              de tracking ou publicitaires.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Contact DPO</h2>
            <p className="text-muted-foreground">
              Pour exercer vos droits ou toute question relative à vos données :
              <a href="mailto:dpo@signal-app.fr" className="text-coral ml-1">dpo@signal-app.fr</a>
            </p>
          </section>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 SIGNAL. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}