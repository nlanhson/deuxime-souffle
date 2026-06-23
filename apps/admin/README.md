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

## État (v0.3 — 11 écrans, flux alignés sur la maquette client)

Les **11 écrans** de la console sont posés en haute-fidélité sur données simulées :
authentification de démo, **AppShell**, le **tableau de bord opérationnel**, puis
les domaines métier — Affectations, Séances, Comptes-rendus, Contrats,
Établissements, Coachs, Couverture, Facturation, Analytics et Paramètres.

La **v0.3** adapte les *fonctionnalités et le flux* de la maquette IA fournie par le
client (les choix visuels — police, couleurs — restent les nôtres). Apports clés :

- **Assistants multi-étapes** (composant `Wizard` partagé) : créer une séance (5 ét.),
  créer un contrat en mode admin (6 ét.), créer un établissement (4 ét.), inviter un
  coach avec KYC (4 ét.).
- **Séances** : vues **Jour / Semaine (densité) / Mois (heatmap)** + détail séance en
  **historique complet** (timeline du cycle de vie).
- **Affectations** : **cascade d’urgence** (J-7 → J-5 → J-3, report + Liste B à appeler),
  **override avec motif obligatoire**, **validation en masse**.
- **Contrats** : file de validation avec **rejet motivé** + assistant de création admin.
- **Nouveaux écrans** : **Analytics** (santé, CA, tarification effective, tops),
  **Couverture** (carte zones × créneaux), **Comptes-rendus** (rapports + évals).
- **Paramètres** : **mode AUTO**, pénalités, comptes admin (2 rôles), modèles de notif.
- **Facturation** : marqueurs **CFPPA / BdC** + filtre, détail facture + synchro Pennylane.

Kit d'UI partagé : `Table`, `Tabs`, `Modal`, `Wizard`, `Form` (`Field`/`RadioCards`/
`CheckboxCards`…), `Toolbar`, `ScoreBar`, `DefinitionList`, `Avatar` — sur les mêmes
tokens que l'app EHPAD.

> Interface **francophone** (langue de travail du produit) ; le sélecteur EN traduit
> le chrome (navigation, barres, tableau de bord). Les corps des écrans métier
> restent en français à ce stade du prototype.

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
| **Affectations** | Matching à score composite, cascade d'urgence (J-7→J-3, report + Liste B), override motivé, validation en masse |
| **Séances** | Vues Jour / Semaine / Mois, assistant « Créer une séance » (5 ét.), détail en historique complet, incidents |
| **Comptes-rendus** | Rapports coachs + évals EHPAD : complétude, délais de rendu, relances |
| **Contrats** | File de validation (rejet motivé), assistant de création admin (6 ét.), créneaux suggérés, renouvellements |
| **Établissements** | Profils EHPAD, contacts, groupes, tarification, assistant de création (4 ét.), marqueurs CFPPA/BdC |
| **Coachs** | Profils, indice de confiance, KYC, assistant d'invitation (4 ét.), retrait de toutes les séances |
| **Couverture** | Carte des disponibilités coachs (zone × créneau), zones saturées / sous-dotées |
| **Facturation** | Génération mensuelle, factures, marqueurs CFPPA/BdC, ajustements, synchro Pennylane |
| **Analytics** | Santé opérationnelle, activité & CA, tarification effective, CA par EHPAD/groupe, tops |
| **Paramètres** | Mode AUTO, coefficients de score, règles métier, pénalités, comptes admin, modèles de notification |

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
