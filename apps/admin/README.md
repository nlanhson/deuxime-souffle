# Deuxième Souffle — Console DS (back-office, prototype web)

Back-office web de l'équipe **Deuxième Souffle** : affectation des coachs (matching),
suivi des séances, validation des contrats, gestion des établissements et des coachs,
facturation Pennylane et pilotage opérationnel.

C'est la **3ᵉ surface** du produit, aux côtés de l'app Coach (mobile, `apps/coach`)
et de l'Espace EHPAD (web, `apps/ehpad`). Les trois partagent un seul jeu de tokens —
_« une base, trois intensités »_ ; cette console utilise la surface **`admin`**
(canvas blanc, rouge rare réservé à l'élément actif et aux alertes, KPI en or).

**Prototype haute-fidélité, sans serveur.** Les chiffres affichés sont simulés
(marqués `// demo` / `// STUB:` dans le code). Aucune base de données.

## État (v0.1 — squelette navigable)

Posé à ce stade : authentification de démo, **AppShell** (barre latérale + barre du
haut), et un **tableau de bord opérationnel** réel (bandeau de KPI, file
opérationnelle, journal d'activité). Les 7 domaines métier ont chacun un écran qui
**documente honnêtement sa portée** (issue du PRD §4 / WBS) en attendant d'être
construits, domaine par domaine — comme l'a été l'app EHPAD.

## Lancer l'application

```bash
cd apps/admin
npm install
npm run dev      # ouvre http://localhost:5174
```

Le port **5174** est volontairement distinct de l'Espace EHPAD (5173) : les deux
apps web peuvent tourner en parallèle. L'app est aussi servie sur le réseau local
(l'URL « Network » s'affiche dans le terminal).

## Se connecter (démo)

N'importe quelles identifiants fonctionnent — il n'y a pas d'authentification réelle.
Compte de démonstration pré-rempli : `camille.roussel@deuxiemesouffle.fr`.

**Raccourci :** ajoutez `?role=admin` à l'URL pour entrer directement sans passer par
l'écran de connexion (ex. `http://localhost:5174/?role=admin`).

## Navigation (domaines = PRD §4)

| Écran | Contenu |
|---|---|
| **Tableau de bord** | KPI opérationnels, file d'attente, activité récente |
| **Affectations** | Matching à score composite, calendrier d'attribution, override, mode urgence |
| **Séances** | Suivi, check-in géolocalisé, rapports 6 étapes, incidents & retards |
| **Contrats** | File de validation, cycle de vie, créneaux suggérés, renouvellements |
| **Établissements** | Profils EHPAD, contacts, groupes, tarification |
| **Coachs** | Profils, validation d'inscription, indice de confiance, coefficients |
| **Facturation** | Génération mensuelle, tableau des factures, ajustements, synchro Pennylane |
| **Paramètres** | Coefficients de score, règles métier, modèles de notification |

## Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | serveur de développement (→ http://localhost:5174) |
| `npm run build` | build de production dans `dist/` |
| `npm run preview` | sert le build de production localement |
| `npm run typecheck` | vérification TypeScript stricte |
| `npm run lint` | ESLint (TypeScript, hooks React, accessibilité JSX) |

## Stack

Vite 5 · React 18 · TypeScript strict · React Router v6 · CSS Modules sur
`theme/tokens.css` (la surface `admin`). Même socle que `apps/ehpad`. Icônes
`lucide-react`. Police Inter (la hiérarchie tient au poids et à la taille).
