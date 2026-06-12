import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, FilePlus2, ListFilter, Pencil, RefreshCw, Send } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useAuth } from '@/context/AuthContext';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { capitalize, formatDate } from '@/lib/format';
import { contractStatusChip, unitLabel } from '@/lib/status';
import {
  Button,
  ButtonLink,
  Card,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  Select,
  SkeletonCards,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import type { Contract, ContractStatus } from '@/types/models';
import { PlanSessionModal } from '@/screens/dashboard/PlanSessionModal';
import styles from './contracts.module.css';

const ALL_STATUSES: ContractStatus[] = [
  'active',
  'a_renouveler',
  'en_attente_validation',
  'expire',
  'rejete',
  'modification_en_attente',
  'non_renouvele',
];

/** CON-03 — liste des contrats (les 7 statuts, actions conditionnelles). */
export default function ContractsScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [planContract, setPlanContract] = useState<string | null>(null);

  const state = useAsync(() => api.listContracts(), [version]);

  const filtered = useMemo(() => {
    if (!state.data) return [];
    return statusFilter === 'all' ? state.data : state.data.filter((c) => c.status === statusFilter);
  }, [state.data, statusFilter]);

  const gateReason = isAdmin ? undefined : fr.common.adminOnly;

  const ContractCard = ({ contract }: { contract: Contract }) => (
    // Une carte « à renouveler » appelle une action : elle porte l'accent bleu.
    <Card className={styles.contractCard} accent={contract.status === 'a_renouveler'}>
      <div className={styles.cardHead}>
        <p className={styles.reference}>{contract.reference}</p>
        <StatusChip spec={contractStatusChip(contract.status)} />
      </div>

      {contract.status === 'rejete' && contract.rejectionReason && (
        <InlineAlert variant="warning" title={fr.contracts.detail.rejectionTitle}>
          {contract.rejectionReason}
        </InlineAlert>
      )}

      <dl className={styles.fieldGrid}>
        <div>
          <dt>{fr.contracts.card.units}</dt>
          <dd>{contract.units.map(unitLabel).join(', ')}</dd>
        </div>
        <div>
          <dt>{fr.contracts.card.frequency}</dt>
          <dd>{fr.frequency[contract.frequency]}</dd>
        </div>
        <div>
          <dt>{fr.contracts.card.start}</dt>
          <dd>{capitalize(formatDate(contract.startDate))}</dd>
        </div>
        <div>
          <dt>{fr.contracts.card.end}</dt>
          <dd>{capitalize(formatDate(contract.endDate))}</dd>
        </div>
        <div>
          <dt>{fr.contracts.card.generated}</dt>
          <dd>{contract.generatedSessionCount}</dd>
        </div>
        <div>
          <dt>{fr.contracts.card.completed}</dt>
          <dd>{contract.completedSessionCount}</dd>
        </div>
        {contract.availabilityNotes && (
          <div className={styles.fieldSpan}>
            <dt>{fr.contracts.card.notes}</dt>
            <dd>{contract.availabilityNotes}</dd>
          </div>
        )}
      </dl>

      <div className={styles.cardActions}>
        <ButtonLink size="md" to={`/contrats/${contract.id}`}>
          {fr.contracts.actions.detail}
        </ButtonLink>
        {contract.status === 'active' && (
          <Button size="md" variant="ghost" icon={CalendarPlus} onClick={() => setPlanContract(contract.id)}>
            {fr.contracts.actions.oneOff}
          </Button>
        )}
        {contract.status === 'a_renouveler' && (
          <Button
            size="md"
            variant="accent"
            icon={RefreshCw}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate(`/contrats/${contract.id}/renouveler`)}
          >
            {fr.contracts.actions.renew}
          </Button>
        )}
        {(contract.status === 'active' || contract.status === 'a_renouveler') && (
          <Button
            size="md"
            variant="ghost"
            icon={Pencil}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate(`/contrats/${contract.id}/modifier`)}
          >
            {fr.contracts.actions.edit}
          </Button>
        )}
        {contract.status === 'rejete' && (
          <Button
            size="md"
            variant="ghost"
            icon={Send}
            disabled={!isAdmin}
            disabledReason={gateReason}
            onClick={() => navigate(`/contrats/${contract.id}/resoumettre`)}
          >
            {fr.contracts.actions.resubmit}
          </Button>
        )}
      </div>
    </Card>
  );

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
      </div>

      {state.loading && (
        <SkeletonGroup>
          <SkeletonCards count={4} height={260} />
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
          action={<Button onClick={() => setStatusFilter('all')}>{fr.common.clearFilters}</Button>}
        />
      )}

      {filtered.length > 0 && (
        <div className={styles.cardGrid}>
          {filtered.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
        </div>
      )}

      <PlanSessionModal
        open={planContract !== null}
        onClose={() => setPlanContract(null)}
        contracts={state.data ?? []}
        userName=""
        initialContractId={planContract ?? undefined}
      />
    </>
  );
}
