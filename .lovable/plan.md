
# Audit Final + Corrections Pre-Publication

## Problemes identifies

### 1. BUG: ClusterMarker -- Warning React forwardRef (console)
Le composant `ClusterMarker` est passe comme enfant a un `Marker` de react-map-gl qui tente de lui passer un `ref`, mais le composant n'utilise pas `React.forwardRef()`. Cela genere un warning visible dans la console a chaque chargement de `/map`.

**Correction** : Convertir `ClusterMarker` en composant avec `forwardRef`.

### 2. UX: Formulation "dating app" dans la section Probleme
La phrase `landing.youWantToMeet` = "Tu veux rencontrer quelqu'un" est interpretee comme une appli de rencontre amoureuse. Les beta testeurs ont confirme cette confusion. Le badge "NOT a dating app" est present mais la section Problem en dessous re-cree la confusion.

**Correction** : Reformuler pour parler d'activites et non de "rencontrer quelqu'un".
- FR: "Tu veux faire du sport, reviser, manger... mais pas seul."
- EN: "You want to work out, study, eat... but not alone."
- Reformuler aussi `butYouNeverKnow` et `wantsToBeApproached` pour rester sur le theme activites.

### 3. UX: Section Signal -- "ouvert a l'interaction" reste vague
La phrase "Je suis ouvert a l'interaction" ne dit pas concretement ce que fait l'app.

**Correction** : Reformuler pour etre concret :
- FR: "Je suis dispo pour une activite"
- EN: "I'm available for an activity"

### 4. CLEANUP: Traduction `motivationGroups` inutilisee
La cle `motivationGroups` contient "amour..." mais n'est utilisee nulle part dans le code. A supprimer pour eviter toute confusion future.

### 5. UX: Le titre principal "Vois qui est ouvert a l'interaction" reste abstrait
Pour un utilisateur qui scanne en 3 secondes, "ouvert a l'interaction" ne communique pas assez clairement.

**Correction** : Reformuler en :
- FR: "Vois qui est dispo" / "pres de toi, maintenant."
- EN: "See who's available" / "near you, right now."

---

## Details techniques

### Fichiers modifies

1. **`src/components/map/ClusterMarker.tsx`**
   - Wrapper avec `React.forwardRef` pour eliminer le warning console

2. **`src/lib/i18n/translations.ts`**
   - `landing.seeWhoIsOpen` : "See who's" / "Vois qui est"
   - `landing.openToInteract` : "available near you." / "dispo pres de toi."
   - `landing.youWantToMeet` : "You want to work out, study, eat..." / "Tu veux faire du sport, reviser, manger..."
   - `landing.butYouNeverKnow` : "But you never know who's up for it around you." / "Mais tu ne sais jamais qui est partant autour de toi."
   - `landing.wantsToBeApproached` : "EASY shows you who is." / "EASY te le montre."
   - `landing.iAmOpenToInteract` : "I'm available for an activity" / "Je suis dispo pour une activite"
   - Supprimer `landing.motivationGroups` (inutilise)

3. **`src/test/LandingPage.test.tsx`**
   - Mettre a jour les assertions pour correspondre aux nouveaux textes FR

### Aucun changement backend
Tous les correctifs sont frontend uniquement (wording + forwardRef).
