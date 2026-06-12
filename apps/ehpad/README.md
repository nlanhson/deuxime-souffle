# Deuxième Souffle — Espace EHPAD (prototype web)

Application web du responsable d'EHPAD : suivi des séances APA, contrats,
évaluations des coachs, factures et profil de l'établissement.
**Prototype haute-fidélité sur données simulées** — aucun serveur, aucune base
de données : un rechargement de page revient aux données de départ (attendu).

## Lancer l'application

```bash
cd apps/ehpad
npm install
npm run dev      # ouvre http://localhost:5173
```

C'est tout. Le navigateur s'ouvre sur le tableau de bord (après connexion).
L'app est aussi accessible sur le réseau local (pratique pour tester sur tablette —
l'URL « Network » s'affiche dans le terminal).

## Se connecter (comptes de démonstration)

| Rôle | Email | Mot de passe |
|---|---|---|
| **Contact principal** (toutes les actions) | `sophie.mercier@les-tilleuls.fr` | n'importe lequel |
| **Autre contact** (lecture + actions limitées) | `thomas.lefevre@les-tilleuls.fr` | n'importe lequel |

Le contact principal voit toutes les actions d'écriture ; l'autre contact voit
les mêmes données mais les actions réservées sont désactivées avec la mention
« Réservé au contact principal ».

## Changer de rôle rapidement

Ajoutez `?role=` à l'URL — la connexion se fait automatiquement :

- `http://localhost:5173/?role=admin` → Sophie (contact principal)
- `http://localhost:5173/?role=user` → Thomas (autre contact)

(Le choix persiste pour l'onglet en cours ; déconnectez-vous ou changez de
paramètre pour revenir.)

## Changer de langue (FR / EN)

L'interface est **bilingue** : un sélecteur `FR / EN` est présent dans la barre
du haut (et sous la carte des écrans de connexion). Le français reste la langue
par défaut ; le choix est mémorisé (`localStorage`) et la bascule est immédiate.

- Toute la copie d'interface vit dans `src/i18n/fr.ts` (référence) et
  `src/i18n/en.ts` (le type `Copy` garantit la parité des clés à la compilation).
- Les composants lisent la langue active via `useStrings()` ; le code hors React
  (api, seed, libellés de statut) via `getStrings()`.
- **Limite assumée** (prototype à données simulées) : les libellés *déjà gravés*
  dans le magasin au seed (journal d'événements, historique, notifications)
  restent dans la langue de leur création tant qu'on ne recharge pas — le
  rechargement régénère le seed dans la langue choisie. Les **dates et montants**
  restent au format français (`fr-FR`) dans les deux langues.

## Jeu de données vide / riche

- `http://localhost:5173/?state=empty` → établissement tout neuf : zéro séance,
  contrat, facture ou notification (tous les états vides + l'indicateur
  « Non rattaché à un groupe »).
- `http://localhost:5173/?state=rich` → retour au jeu de données riche (défaut).

## États de chargement / d'erreur à la demande

- `http://localhost:5173/?debug=slow` → toutes les requêtes simulées prennent
  2,5 s (pour voir les squelettes de chargement).
- `http://localhost:5173/?debug=error` → toutes les requêtes échouent (pour
  voir les états d'erreur + « Réessayer »). Astuce : combinez avec `&role=admin`
  pour entrer malgré tout.
- `http://localhost:5173/?debug=off` → retour à la normale.

## Liens d'invitation / de réinitialisation (états démontrables)

| URL | État |
|---|---|
| `/activer/invitation-valide` | formulaire d'activation (invite Claire Dubois) |
| `/activer/invitation-expiree` | lien expiré |
| `/activer/invitation-utilisee` | lien déjà utilisé |
| `/reinitialiser/reset-valide` | nouveau mot de passe |
| `/reinitialiser/reset-expire` | lien expiré |
| `/reinitialiser/reset-utilise` | lien déjà utilisé |

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement (la commande à utiliser) |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build de production localement |
| `npm run typecheck` | vérification TypeScript stricte |
| `npm run lint` | ESLint (TypeScript, hooks React, accessibilité JSX) |

## Ce qui est simulé (marqué `// STUB:` dans le code)

Authentification, emails/SMS, génération PDF/Excel, suggestions de créneaux,
validation DS des contrats, alertes de retard coach. Tout est centralisé dans
`src/data/` et `src/lib/` pour brancher un vrai backend proprement plus tard.
