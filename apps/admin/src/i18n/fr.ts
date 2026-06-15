/** Dictionnaire français — source de vérité de la forme `Copy`.
 *  `en.ts` doit satisfaire ce même type. */

export interface Capability {
  title: string;
  detail: string;
}

export interface DomainCopy {
  title: string;
  subtitle: string;
  source: string;
  capabilities: Capability[];
}

export interface NavEntry {
  label: string;
  gloss: string;
}

/** Clés de navigation — partagées par le routeur, la barre latérale et la barre du haut. */
export type NavKey =
  | 'dashboard'
  | 'assignments'
  | 'sessions'
  | 'contracts'
  | 'establishments'
  | 'coaches'
  | 'billing'
  | 'settings';

/** Domaines avec écran « à venir » (tout sauf le tableau de bord). */
export type DomainKey = Exclude<NavKey, 'dashboard'>;

export type KpiId =
  | 'sessionsWeek'
  | 'coverage'
  | 'pendingAssignments'
  | 'contractsToValidate'
  | 'monthlyBilling'
  | 'avgTrust';

export type QueueId = 'assignments' | 'contracts' | 'coaches' | 'sessions';

export interface KpiCopy {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
}

export interface QueueCopy {
  label: string;
  note: string;
}

export interface ActivityCopy {
  text: string;
  time: string;
}

export interface Copy {
  app: {
    brandName: string;
    consoleName: string;
    /** Nom accessible du groupe de boutons de langue. */
    language: string;
  };
  topbar: {
    searchPlaceholder: string;
    searchLabel: string;
    notifications: string;
    logout: string;
  };
  sidebar: {
    mainNav: string;
    /** Libellé accessible du badge de file d'attente. */
    pending: (n: number) => string;
    version: string;
  };
  shell: {
    skipToContent: string;
  };
  placeholder: {
    comingSoon: string;
    scope: (source: string) => string;
  };
  notFound: {
    title: string;
    subtitle: string;
    back: string;
  };
  login: {
    brandTag: string;
    title: string;
    emailLabel: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    hintBefore: string;
    hintAfter: string;
  };
  dashboard: {
    greeting: (firstName: string) => string;
    subtitle: string;
    runAssignments: string;
    kpiAria: string;
    queueTitle: string;
    queueMeta: string;
    activityTitle: string;
    activityMeta: string;
    kpis: Record<KpiId, KpiCopy>;
    queue: Record<QueueId, QueueCopy>;
    /** Quatre entrées, dans l'ordre d'affichage. */
    activity: [ActivityCopy, ActivityCopy, ActivityCopy, ActivityCopy];
  };
  nav: Record<NavKey, NavEntry>;
  screens: Record<DomainKey, DomainCopy>;
}

export const fr: Copy = {
  app: {
    brandName: 'Deuxième Souffle',
    consoleName: 'Console DS',
    language: 'Langue',
  },
  topbar: {
    searchPlaceholder: 'Rechercher un coach, un EHPAD, une séance…',
    searchLabel: 'Recherche globale',
    notifications: 'Notifications',
    logout: 'Se déconnecter',
  },
  sidebar: {
    mainNav: 'Navigation principale',
    pending: (n) => `${n} en attente`,
    version: 'v0.1 · prototype',
  },
  shell: {
    skipToContent: 'Aller au contenu',
  },
  placeholder: {
    comingSoon: 'Écran à venir',
    scope: (source) => `Portée — ${source}`,
  },
  notFound: {
    title: 'Page introuvable',
    subtitle: 'Cette page n’existe pas ou a été déplacée.',
    back: 'Retour au tableau de bord',
  },
  login: {
    brandTag: 'Console DS — back-office opérations',
    title: 'Connexion',
    emailLabel: 'Adresse e-mail',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'n’importe lequel (démo)',
    submit: 'Se connecter',
    hintBefore:
      'Prototype sur données simulées — n’importe quel mot de passe fonctionne. Astuce : ajoutez ',
    hintAfter: ' à l’URL pour entrer directement.',
  },
  dashboard: {
    greeting: (firstName) => `Bonjour, ${firstName}`,
    subtitle:
      'Vue d’ensemble opérationnelle — affectations, séances, contrats et facturation en temps réel.',
    runAssignments: 'Lancer les affectations',
    kpiAria: 'Indicateurs clés',
    queueTitle: 'File opérationnelle',
    queueMeta: 'Ce qui attend une action',
    activityTitle: 'Activité récente',
    activityMeta: 'Journal opérationnel',
    kpis: {
      sessionsWeek: { label: 'Séances cette semaine', value: '142', hint: '38 aujourd’hui', trend: '+12 %' },
      coverage: { label: 'Taux de couverture', value: '94 %', trend: '+3 pts' },
      pendingAssignments: { label: 'Affectations en attente', value: '6', hint: 'à valider', trend: 'stable' },
      contractsToValidate: { label: 'Contrats à valider', value: '4', hint: '2 prioritaires' },
      monthlyBilling: { label: 'Facturation du mois', value: '38 200 €', hint: 'HT · brouillon Pennylane' },
      avgTrust: { label: 'Indice de confiance moyen', value: '4,6', hint: 'sur 5 · 87 coachs actifs' },
    },
    queue: {
      assignments: { label: 'Affectations à valider', note: 'séances sans coach assigné' },
      contracts: { label: 'Contrats en attente de validation', note: 'dont 2 modifications majeures' },
      coaches: { label: 'Profils coachs à valider', note: 'inscriptions en attente d’approbation' },
      sessions: { label: 'Incidents & retards', note: 'coach en retard signalé' },
    },
    activity: [
      { text: 'Karim B. a validé son check-in à l’EHPAD Les Tilleuls', time: 'il y a 8 min' },
      { text: 'Nouveau contrat soumis — Résidence Bellevue (2×/sem.)', time: 'il y a 24 min' },
      { text: 'Retard signalé — séance 14:00 à La Roseraie', time: 'il y a 41 min' },
      { text: 'Affectation auto proposée pour 12 séances de la semaine 25', time: 'il y a 1 h' },
    ],
  },
  nav: {
    dashboard: {
      label: 'Tableau de bord',
      gloss: "Santé opérationnelle, activité, revenus et couverture en un coup d'œil.",
    },
    assignments: {
      label: 'Affectations',
      gloss: 'Algorithme de matching, calendrier d’attribution, override manuel, mode urgence.',
    },
    sessions: {
      label: 'Séances',
      gloss: 'Suivi des séances, check-in géolocalisé, rapports, incidents et retards.',
    },
    contracts: {
      label: 'Contrats',
      gloss: 'File de validation, cycle de vie complet, créneaux suggérés, renouvellements.',
    },
    establishments: {
      label: 'Établissements',
      gloss: 'Profils EHPAD, contacts, hiérarchie de groupes et gestion tarifaire.',
    },
    coaches: {
      label: 'Coachs',
      gloss: 'Profils coachs, indice de confiance, coefficients d’évaluation, validations.',
    },
    billing: {
      label: 'Facturation',
      gloss: 'Génération mensuelle, tableau des factures, ajustements, synchro Pennylane.',
    },
    settings: {
      label: 'Paramètres',
      gloss: 'Coefficients de score, règles métier, modèles de notification, paramètres globaux.',
    },
  },
  screens: {
    assignments: {
      title: 'Affectations',
      subtitle:
        'Le cœur du back-office : assigner le bon coach à chaque séance, vite et de façon auditable.',
      source: 'PRD §4 · Smart Assignment (must-have MVP)',
      capabilities: [
        {
          title: 'Algorithme de matching à score composite',
          detail:
            'Classement des coachs éligibles par score : auto-positionnement, équité, fiabilité et proximité.',
        },
        {
          title: 'Calendrier d’attribution',
          detail: 'Vue des séances à pourvoir par zone et par semaine, avec suggestions de coach.',
        },
        {
          title: 'Validation & override manuel',
          detail: 'Valider le coach suggéré ou forcer un autre choix, avec piste d’audit complète.',
        },
        {
          title: 'Mode urgence',
          detail: 'Remplacement express en cas d’absence ou de no-show de dernière minute.',
        },
        {
          title: 'Critères de score configurables',
          detail: 'Pondérer chaque composante du score depuis les paramètres globaux.',
        },
      ],
    },
    sessions: {
      title: 'Séances',
      subtitle:
        'Suivre l’exécution des séances, du check-in géolocalisé au rapport, et traiter les incidents.',
      source: 'PRD §4 · Sessions & Reports',
      capabilities: [
        {
          title: 'Suivi des séances',
          detail: 'Toutes les séances et leur statut : à venir, en cours, terminée, annulée.',
        },
        {
          title: 'Check-in géolocalisé',
          detail: 'Validation d’arrivée dans la fenêtre horaire et le rayon géographique configurés.',
        },
        {
          title: 'Rapport post-séance (6 étapes)',
          detail: 'Consultation des rapports structurés remontés par les coachs après chaque séance.',
        },
        {
          title: 'Incidents & retards',
          detail: 'Détection automatique des no-show, alertes de retard, journal des événements.',
        },
        {
          title: 'Notes inter-séances',
          detail: 'Transmissions entre coachs pour assurer la continuité de l’accompagnement.',
        },
      ],
    },
    contracts: {
      title: 'Contrats',
      subtitle:
        'Valider, suivre et faire évoluer les contrats commerciaux qui génèrent les séances.',
      source: 'PRD §4 · Contracts · WBS CON-01 → CON-16',
      capabilities: [
        {
          title: 'File de validation',
          detail: 'Approuver ou rejeter les contrats « En attente de validation », avec motif de rejet.',
        },
        {
          title: 'Cycle de vie complet',
          detail: 'Créer, éditer, prolonger, clôturer ; génération automatique des séances par récurrence.',
        },
        {
          title: 'Créneaux suggérés (CON-08)',
          detail: 'Top créneaux récurrents selon les disponibilités coach et les contraintes EHPAD.',
        },
        {
          title: 'Modifications majeures',
          detail: 'Valider les changements de fréquence, créneaux, type d’unité ou période contractuelle.',
        },
        {
          title: 'Renouvellements',
          detail: 'Relances configurables (90 / 60 / 30 jours) et suivi des non-renouvellements.',
        },
      ],
    },
    establishments: {
      title: 'Établissements',
      subtitle:
        'Gérer les EHPAD clients, leurs contacts, leur rattachement de groupe et leur tarification.',
      source: 'PRD §4 · Establishments & Groups · WBS EST / AUTH-21',
      capabilities: [
        {
          title: 'Profils EHPAD',
          detail: 'Raison sociale, SIRET, TVA, adresses, unités prises en charge et catégorie.',
        },
        {
          title: 'Contacts',
          detail: 'Contact principal et contacts additionnels, rôles, relances de mise à jour.',
        },
        {
          title: 'Hiérarchie de groupes',
          detail: 'Rattachement commercial des établissements à un groupe, filtrage par groupe.',
        },
        {
          title: 'Gestion tarifaire',
          detail: 'Tarif de séance par défaut et marqueurs appliqués par établissement.',
        },
      ],
    },
    coaches: {
      title: 'Coachs',
      subtitle:
        'Valider les inscriptions, suivre les profils et piloter l’indice de confiance des coachs.',
      source: 'PRD §4 · Coach Management & Evaluation',
      capabilities: [
        {
          title: 'Profils coachs',
          detail: 'Identité, documents (CV, URSSAF, assurance, diplôme APA), zone et disponibilités.',
        },
        {
          title: 'Validation d’inscription',
          detail: 'Approuver les coachs en attente après auto-inscription (e-mail / Google).',
        },
        {
          title: 'Indice de confiance',
          detail: 'Suivi dynamique alimenté par les évaluations remontées par les EHPAD.',
        },
        {
          title: 'Coefficients d’évaluation',
          detail: 'Configurer les critères et pondérations de notation des coachs.',
        },
        {
          title: 'Tableau financier coach',
          detail: 'Revenus et volume de séances par coach sur la période.',
        },
      ],
    },
    billing: {
      title: 'Facturation',
      subtitle: 'Générer, ajuster et synchroniser la facturation mensuelle vers Pennylane.',
      source: 'PRD §4 · Billing & Pennylane (must-have MVP)',
      capabilities: [
        {
          title: 'Génération mensuelle',
          detail: 'Une facture brouillon par établissement au 1er du mois, depuis les séances terminées.',
        },
        {
          title: 'Tableau des factures',
          detail: 'Suivi consolidé : statuts, montants HT, historique par établissement.',
        },
        {
          title: 'Ajustements',
          detail: 'Corrections et régularisations avant validation et envoi.',
        },
        {
          title: 'Synchro Pennylane',
          detail: 'Pousser les factures vers Pennylane — intégration critique du MVP.',
        },
      ],
    },
    settings: {
      title: 'Paramètres',
      subtitle:
        'Les leviers de configuration globale qui pilotent le matching, les règles métier et les notifications.',
      source: 'PRD §4 · transverse (matching, évaluation, notifications)',
      capabilities: [
        {
          title: 'Coefficients de score',
          detail: 'Pondérer auto-positionnement, équité, fiabilité et proximité dans le matching.',
        },
        {
          title: 'Règles métier',
          detail: 'Fenêtre de check-in, rayon géographique, politique d’annulation, seuils de retard.',
        },
        {
          title: 'Modèles de notification',
          detail: 'Gabarits e-mail / SMS / push configurables (rappels, alertes, attributions).',
        },
        {
          title: 'Évaluation',
          detail: 'Critères et coefficients de notation alimentant l’indice de confiance.',
        },
        {
          title: 'Paramètres globaux',
          detail: 'Tarifs par défaut, types d’unités, jours fériés et exceptions de planification.',
        },
      ],
    },
  },
};
