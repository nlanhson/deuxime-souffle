import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePlus2, ListFilter } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { formatDate, formatShortDateYear } from '@/lib/format';
import { contractStatusChip, unitLabel } from '@/lib/status';
import {
  Button,
  type Column,
  DataTable,
  DataTableSkeleton,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  SearchInput,
  Select,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import type { Contract, ContractStatus } from '@/types/models';
import styles from './contracts.module.css';

// « modification_en_attente » n'apparaît plus comme un filtre séparé (décision
// client : il se présente comme « En attente »). Le filtre « En attente » couvre
// les deux (cf. prédicat plus bas).
const ALL_STATUSES: ContractStatus[] = [
  'active',
  'a_renouveler',
  'en_attente_validation',
  'expire',
  'rejete',
  'non_renouvele',
];

/** Ordre de triage par défaut : ce qui réclame une action d'abord, l'archive ensuite. */
const STATUS_RANK: Record<ContractStatus, number> = {
  a_renouveler: 0,
  rejete: 1,
  en_attente_validation: 2,
  modification_en_attente: 3,
  active: 4,
  expire: 5,
  non_renouvele: 6,
};

const completionRatio = (c: Contract) =>
  c.generatedSessionCount > 0 ? c.completedSessionCount / c.generatedSessionCount : 0;

/** Lignes par page — pagination « précédent / suivant » en pied de table. Bas
 *  à dessein : on garde une liste dense scrutable d'un seul regard. Réglable ici. */
const CONTRACTS_PER_PAGE = 6;

/** Barre d'avancement compacte sur une seule ligne — pensée pour une cellule de
 *  table (la version `ProgressBar` empilée vivrait sur la page de détail).
 *  Sans séance générée (max = 0), il n'y a pas de plage déterminée : on n'émet
 *  pas de `progressbar` dégénéré, juste un tiret comme les autres cellules vides. */
function MiniProgress({ value, max, label }: { value: number; max: number; label: string }) {
  if (max === 0) {
    return <span className={styles.miniEmpty}>—</span>;
  }
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={styles.miniProgress}>
      <span
        className={styles.miniTrack}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <span className={styles.miniFill} style={{ width: `${pct}%` }} />
      </span>
      <span className={styles.miniCount}>
        {value}/{max}
      </span>
    </div>
  );
}

/** CON-03 — liste des contrats. Une table à scruter, pas une carte à lire :
 *  chaque ligne tient sur une seule ligne (réf, unité, avancement, échéance,
 *  statut), les colonnes s'alignent au pixel et le détail vit sur sa page. */
export default function ContractsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const state = useAsync(() => api.listContracts(), [version]);

  // Recherche libre : référence, unité(s), date d'échéance/début, libellé de statut.
  const filtered = useMemo(() => {
    if (!state.data) return [];
    const q = search.trim().toLowerCase();
    return state.data.filter((c) => {
      if (statusFilter !== 'all') {
        // « En attente » couvre aussi « modification en attente » (présentés à
        // l'identique côté client).
        const matches =
          c.status === statusFilter ||
          (statusFilter === 'en_attente_validation' && c.status === 'modification_en_attente');
        if (!matches) return false;
      }
      if (q === '') return true;
      const haystack = [
        c.reference,
        ...c.units.map(unitLabel),
        formatShortDateYear(c.endDate),
        formatDate(c.endDate),
        formatDate(c.startDate),
        contractStatusChip(c.status).label,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [state.data, statusFilter, search, fr]);

  const gateReason = isAdmin ? undefined : fr.common.adminOnly;

  // Largeurs ≈ contenu + une part ÉGALE de marge. On dimensionne chaque colonne
  // au plus juste de son contenu (réf. et échéance courtes ; unités, avancement et
  // statut plus larges), si bien que l'espace vide en fin de colonne — l'écart
  // jusqu'au début de la suivante — reste constant d'une colonne à l'autre. La
  // table garde sa pleine largeur (statut calé à droite, puces de taille uniforme).
  const columns: Column<Contract>[] = [
    {
      key: 'reference',
      header: fr.contracts.columns.reference,
      width: '14%',
      sortValue: (c) => c.reference,
      render: (c) => (
        <Link className={styles.refLink} to={`/contrats/${c.id}`}>
          {c.reference}
        </Link>
      ),
    },
    {
      key: 'units',
      header: fr.contracts.columns.units,
      // Élargie (22→28 %) pour qu'une unité seule (« Unité standard (UC) ») tienne
      // sans coupure ; les lignes multi-unités gardent l'info-bulle `title`.
      width: '28%',
      sortValue: (c) => c.units.map(unitLabel).join(', '),
      render: (c) => {
        const label = c.units.map(unitLabel).join(', ');
        return (
          <span className={styles.truncate} title={label}>
            {label}
          </span>
        );
      },
    },
    {
      key: 'progress',
      header: fr.contracts.columns.progress,
      width: '20%',
      sortValue: completionRatio,
      render: (c) => (
        <MiniProgress
          value={c.completedSessionCount}
          max={c.generatedSessionCount}
          label={fr.contracts.progressLabel(c.completedSessionCount, c.generatedSessionCount)}
        />
      ),
    },
    {
      key: 'endDate',
      header: fr.contracts.columns.endDate,
      width: '15%',
      sortValue: (c) => c.endDate,
      render: (c) => (
        <span className={styles.truncate}>
          {/* DT-E5 — contrat sans fin : « Sans fin » plutôt que la date nominale. */}
          {c.openEnded ? fr.contracts.wizard.period.openEndedShort : formatShortDateYear(c.endDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: fr.contracts.card.status,
      width: '23%',
      sortValue: (c) => STATUS_RANK[c.status],
      // Largeur de puce uniforme : toutes les pastilles ont la même taille.
      render: (c) => (
        <span className={styles.statusCell}>
          <StatusChip spec={contractStatusChip(c.status)} />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={fr.contracts.title}
        actions={
          <Button
            variant="primary"
            icon={FilePlus2}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate('/contrats/nouveau')}
          >
            {fr.contracts.newContract}
          </Button>
        }
      />
      {!isAdmin && user && <InlineAlert variant="info">{fr.common.adminOnlyBody}</InlineAlert>}

      <div className={styles.filterRow}>
        <Select
          variant="pill"
          icon={ListFilter}
          label={fr.contracts.filterStatus}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: fr.contracts.allStatuses },
            ...ALL_STATUSES.map((status) => ({
              value: status,
              label: fr.status.contract[status],
            })),
          ]}
        />
        <div className={styles.filterRight}>
          {/* Recherche tertiaire discrète (cf. <SearchInput>) : elle aide sans
              capter l'attention. Le compteur, lui, vit en pied de table. */}
          <SearchInput
            value={search}
            onChange={setSearch}
            ariaLabel={fr.contracts.searchLabel}
            placeholder={fr.contracts.searchPlaceholder}
          />
          {/* Région vivante (toujours montée) : changer le filtre/la recherche annonce le résultat. */}
          <span className="sr-only" role="status" aria-live="polite">
            {state.data
              ? filtered.length > 0
                ? fr.contracts.count(filtered.length)
                : fr.contracts.noResults
              : ''}
          </span>
        </div>
      </div>

      {/* Squelette à la forme de la table (panneau bordé, en-tête, lignes 52px) —
          composant partagé, calé sur les vraies colonnes. */}
      {state.loading && (
        <SkeletonGroup>
          <DataTableSkeleton columns={columns} rows={CONTRACTS_PER_PAGE} footer />
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.length === 0 && (
        <EmptyState
          title={fr.contracts.empty}
          body={fr.contracts.emptyBody}
          action={
            <Button
              variant="primary"
              disabled={!isAdmin}
              disabledReason={gateReason}
              onClick={() => navigate('/contrats/nouveau')}
            >
              {fr.contracts.emptyAction}
            </Button>
          }
        />
      )}

      {state.data && state.data.length > 0 && filtered.length === 0 && (
        <EmptyState
          variant="no-results"
          title={fr.contracts.noResults}
          action={
            <Button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              {fr.common.clearFilters}
            </Button>
          }
        />
      )}

      {filtered.length > 0 && (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          caption={fr.contracts.tableCaption}
          defaultSort="status"
          onRowClick={(c) => navigate(`/contrats/${c.id}`)}
          fillHeight
          pageSize={CONTRACTS_PER_PAGE}
          summary={fr.contracts.count(filtered.length)}
        />
      )}
    </>
  );
}
