# NEARVITY — Spécification produit (source de vérité)

> Document fondateur rédigé par la fondatrice (septembre 2026). Toute décision produit ou technique doit le respecter.
> La traduction technique du P0 est dans [SPEC-TECHNIQUE-P0.md](./SPEC-TECHNIQUE-P0.md).

## 0. En une phrase

Un réseau social gratuit qui demande **« Qu'est-ce qui rendrait ton moment meilleur ? »**, puis transforme cette intention en quelque chose à vivre immédiatement : sur la plateforme, avec ses proches, avec de nouvelles personnes, ou dans la vraie vie.

On ne maximise pas le temps d'écran. On maximise **les bons moments réellement vécus**.

> Nous ne construisons pas une application destinée à garder les gens devant leur téléphone.
> Nous construisons une application destinée à transformer une intention en moment vécu.

## 1. Ce que nous construisons

**Pas** : un Facebook bis, un TikTok sans vidéos, un Tinder amical, une appli « contre la solitude », une appli médicale ou de psychothérapie, une appli de câlins, un Meetup, un simple chat, un feed.

**Mais** : une plateforme d'orchestration de moments humains. Elle comprend ce que l'utilisateur souhaite maintenant, cherche l'expérience disponible qui y répond, et l'aide à la vivre.

## 2. Promesse

Les autres réseaux sociaux te donnent quelque chose à regarder. Celui-ci te donne quelque chose à vivre.
*Less scrolling. More living.* — *Open → Choose → Make It Happen.*

## 3. Règles produit (non négociables)

1. **Never Empty** — jamais « Aucun résultat » : on descend automatiquement vers une alternative.
2. **No Dead Ends** — chaque écran propose une action suivante.
3. **Under 60 Seconds** — une possibilité concrète en moins d'une minute, sans questionnaire obligatoire.
4. **No Social Performance** — pas de followers publics, compteur d'amis, score de popularité, likes publics, classement humain, top utilisateurs, badge de popularité.
5. **Safety by Default** — on ne promet pas le risque zéro, mais la sécurité maximale raisonnable par défaut.
6. **Life > Screen** — on n'optimise jamais pour la durée de session, les écrans vus, le scroll, les impressions ou l'autoplay.
7. **Better, Not Just More** — compter les expériences ne suffit pas : la personne est-elle contente de l'avoir vécue ?

## 4. Architecture : cinq zones

1. **NOW** — que puis-je vivre maintenant ?
2. **I'M FREE** — je suis disponible.
3. **MY PEOPLE** — les personnes avec qui j'aime passer du temps.
4. **ROOMS / HERE** — ce que je peux vivre sur la plateforme.
5. **PROFILE** — paramètres, préférences, sécurité, historique.

**MAKE IT HAPPEN** est l'action centrale, disponible partout.

## 5–6. NOW

L'ouverture n'affiche pas de feed mais : **What would make now better?**
Intentions : 👥 People · 🎯 Do something · ☕ Go out · 💬 Talk · 🌙 Chill · 🤍 Care · ✨ Surprise me.
Aucune obligation d'expliquer pourquoi (ni tristesse, ni solitude, ni état psychologique).
Deux mondes : **HERE** (sur la plateforme) et **OUT** (hors plateforme). L'utilisateur choisit l'un, l'autre, les deux, ou laisse décider.

## 7–8. HERE et Rooms

HERE n'est pas un feed vidéo. Une expérience HERE a un début, une activité, éventuellement des participants, une durée et une fin.
Formats : Coffee Room (4–8 pers., 30 min), Silent Room, Focus Together (50/10), Listen Together, Talk, Late Night, Reset (respiration, musique, étirement — jamais présenté comme un traitement), Celebrate Something, Game/Quiz.

Une Room est **temporaire** (pas un canal Discord permanent) : type, langue, capacité, heure de début, durée, participants, statut, règles, signalement.
États : `scheduled`, `open`, `full`, `live`, `ended`, `cancelled`.

## 9. OUT

Social (café, promenade, dîner, afterwork, petit groupe) · Activity (sport, atelier, jeux, visite, expo, créatif) · Commercial (événement, cinéma, wellness, partenaire, réservation) · My People (proche disponible, plusieurs proches libres en même temps).

## 10–11. I'M FREE

Durée : 30 min, 1 h, 2 h, cet après-midi, ce soir, personnalisée. Intention : coffee, food, walk, sport, talk, chill, activity, anything.
**La disponibilité expire automatiquement** — jamais de disponibilité oubliée.
Le moteur détecte « 3 personnes compatibles sont libres » → *Want to do something?* → MAKE IT HAPPEN (groupe, activité, heure, lieu, réservation éventuelle).

## 12–13. MY PEOPLE

Graphe social **privé**, pas de followers. Entrée par invitation, ajout après une expérience partagée, ou connexion mutuelle.
Propriétés privées : dernière interaction, expériences partagées, préférences communes, disponibilité si autorisée.
Jamais « Marie possède 428 People ». Le moteur répond : « Emma est libre pendant 1 h », « Trois personnes de ton cercle sont libres jeudi soir ».

## 14–15. MAKE IT HAPPEN

Réduire la logistique au maximum : participants, disponibilité, créneau, activité, lieu, capacité, réservation, confirmation, rappel, suivi de présence.
Exemple : *Coffee* → 3 personnes compatibles dans l'heure → café à 900 m → 19:15 → *Join?* → une validation → plan créé.

## 16–17. CARE

Intentions : I need company, I want to talk, I don't want to be alone, I need quiet, Bad day, I don't know what I need, Take care of me.
Réponses possibles : My People, Room, activité calme, groupe, expérience digitale, professionnel plus tard.
**Jamais présenté comme un diagnostic ou une thérapie.**
Care Hosts (professionnels vérifiés, code de conduite, formation) : **hors MVP**, architecture à prévoir. Pas de « Find someone to cuddle ». Contact physique : toujours séparé du pair-à-pair.

## 18–22. Matching (sans IA générative en V1)

**A. Hard filters** : disponibilité, distance, langue, blocage, bannissement, capacité, expérience terminée, sécurité, âge, budget.
**B. Scoring** (poids configurables dans `matching_weights`, jamais codés en dur) : intention 30 %, horaire 20 %, distance 15 %, préférences sociales 10 %, taille de groupe 10 %, fiabilité 10 %, sérendipité 5 %.
**Sérendipité** : une petite part du classement propose du nouveau (activité, groupe, profil) — pas de bulle.
**Cascade Never Empty** : 1. OUT pertinent → 2. My People disponible → 3. Room HERE live → 4. expérience qui démarre bientôt → 5. créer un plan / trouver des participants → 6. expérience solo. La réponse n'est jamais `[]`.
Solo (fallback) : playlist, activité guidée, petite promenade, mini-défi, relaxation, journal, découverte locale, contenu court — jamais un flux infini.

## 23–25. Feedback, Better Moment, Moments

Après une expérience : **GLAD YOU DID THIS?** 👍 Yes · ➖ Meh · 👎 No. Facultatif : *What made the difference?* people, activity, place, calm, conversation, surprise, other.
**Better Moment** = expérience déclenchée/organisée via la plateforme **+** participation réelle **+** retour positif. Une simple impression de recommandation n'en est pas un.
Moments (secondaire) : *Save this moment?* photo, personnes, lieu, texte court — **privé par défaut**, jamais un post.

## 26. Interdits absolus

Feed infini, Reels, feed vidéo, followers/likes/vues publics, trending users, leaderboard, score humain visible, streak addictif, autoplay, DM ouvert à tous, dating/swipe, « personnes populaires près de toi », mur émotionnel public, pub ciblée selon la vulnérabilité, IA conversationnelle omniprésente, chatbot obligatoire, gamification agressive.
Toute proposition qui y ressemble doit être justifiée explicitement avant développement.

## 27–33. Onboarding, identité, sécurité

Onboarding : 18+ et CGU → téléphone ou e-mail vérifié → prénom/pseudo → ville/zone (jamais la position précise) → langue(s) → quelques préférences optionnelles → **directement NOW**.
Niveaux : 0 compte · 1 téléphone vérifié · 2 identité vérifiée · 3 historique fiable.
**Reliability profile interne, jamais public** (plans confirmés, participation, annulations, no-shows, signalements confirmés, ancienneté, identité) — sert uniquement sécurité, matching, restrictions.
Rencontres physiques MVP : adultes, groupes privilégiés, lieux publics, pas de domicile, coordonnées précises masquées avant confirmation, check-in, signalement/blocage faciles ; le 1:1 physique plus restrictif que le groupe.
**Block** : empêche matchs, messages, invitations, rooms privées communes ; masque l'utilisateur.
**Report** : harassment, sexual behavior, threats, discrimination, spam/scam, no-show, unsafe behavior, other — les cas graves passent en file prioritaire.
**Rooms** : mute, leave, block, report, retrait par l'hôte/modérateur ; pas d'enregistrement par défaut.

## 34–39. Monétisation

Le cœur reste **gratuit** : My People, I'm Free, matching de base, Rooms essentielles, NOW.
Revenus : marketplace (activités, événements, réservations, wellness), compte Pro, B2B (université, entreprise, hôpital, résidence, coworking), Care professionnel plus tard.
Commissions dans `fee_rules` (catégorie, type, valeur), jamais codées en dur, modifiables au back-office.
Checkout transparent (prestation, prix, frais, taxes, total), jamais de marge cachée. Prestataire marketplace, aucune donnée de carte stockée.
Flux : `booking_created → payment_pending → payment_confirmed → experience_confirmed → experience_completed → payout_eligible → payout_completed` + annulation, remboursement, échec, litige.
Portail partenaires en libre-service.

## 40–42. Villes

Statuts : `digital_only`, `growing`, `beta`, `active`, `paused`. Passage en `active` après seuils configurables (City Health : MAU/DAU locaux, personnes dispo, plans, match rate, temps jusqu'au match, offres, partenaires, no-show, satisfaction, incidents, recours au fallback digital).
**HERE est global** : filtré par langue, horaire, préférences — utile même sans communauté locale.

## 43–46. Données

Entités : users, profiles, user_preferences, user_locations, availability, people_connections, blocks, reports, trust_profiles, intent_requests, experiences, rooms, room_participants, plans, plan_participants, venues, partners, partner_offers, bookings, payments, payouts, feedback, moments, cities, city_health, matching_weights, fee_rules, notifications, moderation_cases.
Plan : `draft`, `forming`, `confirmed`, `live`, `completed`, `cancelled`, `failed`.

## 47–49. Algorithme et IA

Recevoir l'intention → options compatibles → hard filters → scores → diversification → top options → sinon fallback → journaliser → action utilisateur → apprentissage.
**Pas de LLM en V1** pour matching, recommandations, routing, groupes, disponibilité ou scoring : SQL, règles, scores, géo.
Une IA future n'entre que si elle améliore mesurablement : Better Moments, matching, coût support, sécurité, conversion ou churn.

## 50–53. Technique, coûts, observabilité, analytics

Services managés raisonnables, sans fournisseur aux coûts explosifs ; consommation mesurée par utilisateur.
Observabilité dès la V1 : erreurs, crashs, latence, requêtes lentes, paiements, rooms, notifications, matching.
Événements : signup_started, signup_completed, now_opened, intent_selected, recommendation_shown, recommendation_opened, recommendation_accepted, im_free_started, im_free_matched, room_joined, room_completed, plan_created, plan_confirmed, plan_checkin, plan_completed, booking_started, booking_paid, feedback_positive, feedback_neutral, feedback_negative, person_added, user_returned, report_created.

## 54–57. KPI

Principal : **Better Moments créés** (par WAU, % d'utilisateurs avec ≥ 1, répétition, HERE vs OUT).
Business : MAU, WAU, activation, rétention J1/J7/J30, match rate, show-up rate, feedback positif, conversion, GMV, take rate, revenu net, marge de contribution, CAC, LTV, rétention partenaires, revenu B2B.
Liquidité : Match Availability Rate, Time to Relevant Option, Time to Confirmed Plan, Fallback Rate.
Sécurité : signalements / 1 000 interactions, incidents graves, taux de blocage, récidive, délai de traitement, no-show.

## 58–64. Back-office, notifications, commerce, données sensibles

Admin : utilisateurs (recherche, suspension, vérification), signalements (file, gravité, actions), villes, rooms, partenaires, poids du matching, frais, analytics.
Notifications = une vraie possibilité (« Ta Room commence dans 10 min »), jamais « Tu nous manques 😢 » ni « Ton streak va disparaître ! ».
Un partenaire payant ne passe pas automatiquement devant une meilleure option gratuite (`relevance_score` ≠ `sponsored_status`, sponsorisé identifiable). **Free answer first.**
Minimisation : pas d'historique psychologique, de diagnostic, de score de dépression ou de solitude, de profil émotionnel publicitaire ; l'état exprimé dans NOW est éphémère.
Localisation : environ 1 km ou quartier avant confirmation ; lieu exact seulement pour un lieu public confirmé.
Publicité : pas au MVP ; plus tard seulement contextuelle, identifiée, jamais fondée sur la vulnérabilité.

## 65–71. MVP et lancement

**P0** : onboarding, profils, NOW, intentions, HERE/OUT, I'm Free, matching, plans, quelques Rooms, My People basique, messages liés aux plans, notifications, feedback, report/block, admin, analytics.
**P1** : paiements, partenaires, offres, réservation, remboursements, city health.
**P2** : B2B, Moments, outils Pro avancés, Care Hosts, IA éventuelle.
**Hors MVP** : feed, vidéo sociale, influenceurs, pub, Care House, domicile, touch therapy, profils publics complexes, réputation visible, gamification, stories, marketplace mondiale, IA générative.
Rooms V1 : Coffee, Silent, Talk, Focus, Late Night, Reset. OUT V1 : coffee, walk, food, drink, activity.
HERE accessible largement ; OUT dans **une ville test**. Concierge mode : une partie de MAKE IT HAPPEN opérée à la main depuis l'admin. Toujours manuel → semi-automatique → automatique.

## 72–76. Validation et économie

MVP validé si les utilisateurs comprennent NOW, trouvent une proposition, acceptent, vivent l'expérience, disent qu'elle valait le coup, reviennent.
Gates : Acquisition → Activation → Liquidity → Execution → Quality → Retention → Monetization → Unit Economics. Pas d'accélération massive avant la gate 8.
Principes : cœur social gratuit ; pas d'IA coûteuse sans ROI ; pas d'immobilier avant preuve ; pas de coûts humains linéaires ; monétiser les transactions, pas la détresse ; tarification configurable ; mesurer la marge de contribution par Better Moment (A gratuit et peu coûteux, B margé, C coûteux → automatiser, facturer, modifier ou supprimer).
Ordre absolu : utile → réellement vécu → apprécié → retour → monétisation naturelle.

## 77. Test avant toute nouvelle fonction

Améliore-t-elle NOW ? MAKE IT HAPPEN ? la qualité, la sécurité ou la rétention d'un Better Moment ? les unit economics ? Si tout est NON : on ne la développe pas.

## 78–81. Parcours de référence

1. Coffee → OUT → 3 personnes dispo → Join → café + heure → Confirm → plan → notification → check-in → expérience → 👍 → Better Moment.
2. Chill → rien de physique → Silent Room · 17 participants → 30 min → 👍 → Better Moment HERE.
3. I'm free tonight → deux My People libres → « You're 3 free tonight » → Yes → restaurant/activité.
4. Bad day → pas de vente automatique : Talk Room, proche disponible, promenade, éventuellement wellness. L'utilisateur choisit.

## 82–88. Garde-fous et arbitrage

Ne jamais optimiser pour plus d'écrans vus, exploiter la vulnérabilité pour la pub, favoriser les partenaires payants sur la qualité, confondre popularité et bon matching, transformer une relation en score public.
Positionnement : pour tout le monde (entouré, seul, heureux, fatigué, nouveau en ville, sociable, introverti).
Si une décision est ambiguë, choisir l'option qui : 1. demande le moins d'effort, 2. provoque le plus vite quelque chose de réel, 3. respecte le plus la sécurité et la vie privée, 4. limite le coût opérationnel, 5. privilégie la qualité sur l'engagement artificiel.

## 89. Definition of Done

Une fonctionnalité est terminée quand : analytics présents, états vides traités, fallback présent, erreurs traitées, permissions traitées, sécurité traitée, testée sur mobile, accessibilité minimale, métriques enregistrées, admin possible si nécessaire.
