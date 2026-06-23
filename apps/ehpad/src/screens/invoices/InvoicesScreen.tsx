import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, Hourglass, Timer, TriangleAlert, Wallet } from 'lucide-react';
import { useStrings } from '@/i18n';
import * as api from '@/data/api';
import { useDataVersion } from '@/context/DataContext';
import { useAsync } from '@/hooks/useAsync';
import { addDays } from '@/lib/calendar';
import {
  capitalize,
  formatDate,
  formatEuro,
  formatMonthYear,
  formatShortDateYear,
  formatShortMonthYear,
  parseDate,
  toIso,
} from '@/lib/format';
import { invoiceStatusChip } from '@/lib/status';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  EmptyState,
  InlineAlert,
  LoadError,
  PageHeader,
  SearchInput,
  Skeleton,
  SkeletonGroup,
  StatusChip,
} from '@/components';
import type { Column } from '@/components';
import type { Invoice } from '@/types/models';
import styles from './invoices.module.css';

/** Seuils de gravité du retard — calage « plancher/plafond » comme la fraîcheur des
 *  contacts. En deçà : une ligne discrète sous le bandeau. Au-delà : la bannière
 *  ambre reprend la voix, en tête de page. Réglables d'une ligne. */
const OVERDUE_SEVERE_DAYS = 30; // > un cycle net-30 complet dépassé (2e échéance ouverte)
const OVERDUE_SEVERE_AMOUNT_HT = 1000; // ~ deux factures (le barème va de 455 à 650)
const OVERDUE_SEVERE_COUNT = 3; // une pile de petites factures fraîches

/** Pagination de la table — même grammaire que les contrats (pied : flèches
 *  « précédent / suivant » + « Page X sur Y », appoint « N factures » à droite). */
const INVOICES_PER_PAGE = 6;

/** BILL-01 — factures : retard à deux niveaux (ligne discrète par défaut, bannière
 *  ambre seulement si c'est sérieux), KPI factuels en bandeau éditorial, table triée
 *  par période décroissante, recherche libre. Tout est HT. */
export default function InvoicesScreen() {
  const fr = useStrings();
  const version = useDataVersion();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const state = useAsync(() => api.listInvoices(), [version]);

  const computed = useMemo(() => {
    const invoices = state.data ?? [];
    const overdue = invoices.filter((i) => i.status === 'en_retard');
    const unpaid = invoices.filter((i) => i.status !== 'payee');
    const unpaidTotal = unpaid.reduce((sum, i) => sum + i.amountHT, 0);
    const awaiting = invoices.filter((i) => i.status === 'en_attente').length;
    const paid = invoices.filter((i) => i.status === 'payee' && i.paymentDate);
    const avgDelay =
      paid.length > 0
        ? Math.round(
            paid.reduce((sum, i) => {
              const issued = addDays(parseDate(i.dueDate), -30);
              const paidAt = parseDate(i.paymentDate ?? i.dueDate);
              return sum + Math.max(0, (paidAt.getTime() - issued.getTime()) / 86_400_000);
            }, 0) / paid.length,
          )
        : null;
    const today = toIso(new Date());
    const nextDue = unpaid
      .filter((i) => i.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
    // Retard : montant total + ancienneté du plus vieux, d'où le niveau de gravité.
    const overdueAmount = overdue.reduce((sum, i) => sum + i.amountHT, 0);
    const oldestDaysPastDue = overdue.length
      ? Math.max(
          ...overdue.map((i) =>
            Math.floor((parseDate(today).getTime() - parseDate(i.dueDate).getTime()) / 86_400_000),
          ),
        )
      : 0;
    const severity: 'none' | 'mild' | 'severe' =
      overdue.length === 0
        ? 'none'
        : oldestDaysPastDue > OVERDUE_SEVERE_DAYS ||
            overdueAmount >= OVERDUE_SEVERE_AMOUNT_HT ||
            overdue.length >= OVERDUE_SEVERE_COUNT
          ? 'severe'
          : 'mild';
    return { overdue, overdueAmount, oldestDaysPastDue, severity, unpaidTotal, awaiting, avgDelay, nextDue };
  }, [state.data]);

  // Recherche libre sur tout ce que la ligne affiche : numéro, période, montant,
  // nombre de séances, statut, date de paiement. Le numéro (exigence WBS BILL-01)
  // reste couvert ; les autres champs ne font qu'élargir, jamais restreindre.
  const rows = useMemo(() => {
    const invoices = state.data ?? [];
    const q = search.trim().toLowerCase();
    if (q === '') return invoices;
    return invoices.filter((i) => {
      const haystack = [
        i.number,
        capitalize(formatMonthYear(parseDate(i.period))),
        formatEuro(i.amountHT),
        String(i.sessionCount),
        invoiceStatusChip(i.status).label,
        i.paymentDate ? formatDate(i.paymentDate) : '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
    // `fr` : libellé de statut + formats lisent la langue active → recalcul au switch.
  }, [state.data, search, fr]);

  // Toutes les colonnes alignées à GAUCHE et dimensionnées « contenu + une part
  // ÉGALE de marge ». Avec un alignement uniforme, l'écart entre la fin d'une
  // colonne et le début de la suivante vaut (largeur − contenu) : on le rend donc
  // constant sur les cinq intervalles en donnant à chaque colonne sa largeur de
  // contenu + la même marge. (Le right-align des nombres a été abandonné : il
  // collait le contenu au bord droit et creusait un grand vide DEVANT la colonne,
  // d'où des écarts inégaux.) Dates abrégées pour tenir sans retour à la ligne.
  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: fr.invoices.table.number,
      width: '18%',
      sortValue: (i) => i.number,
      render: (i) => (
        <Link to={`/factures/${i.id}`} className={styles.numberLink}>
          {i.number}
        </Link>
      ),
    },
    {
      key: 'period',
      header: fr.invoices.table.period,
      width: '17%',
      sortValue: (i) => i.dueDate,
      render: (i) => capitalize(formatShortMonthYear(parseDate(i.period))),
    },
    {
      key: 'sessions',
      header: fr.invoices.table.sessionsShort,
      width: '11%',
      render: (i) => i.sessionCount,
    },
    {
      key: 'amount',
      header: fr.invoices.table.amount,
      width: '16%',
      sortValue: (i) => i.amountHT,
      render: (i) => formatEuro(i.amountHT),
    },
    {
      key: 'status',
      header: fr.invoices.table.status,
      width: '20%',
      // Puce uniforme : toutes les pastilles ont la même taille.
      render: (i) => (
        <span className={styles.statusCell}>
          <StatusChip spec={invoiceStatusChip(i.status)} />
        </span>
      ),
    },
    {
      key: 'payment',
      header: fr.invoices.table.paymentDate,
      width: '18%',
      render: (i) => (i.paymentDate ? formatShortDateYear(i.paymentDate) : '—'),
    },
  ];

  return (
    <>
      <PageHeader title={fr.invoices.title} />

      {state.loading && (
        <SkeletonGroup>
          {/* Vue d'ensemble : LE bandeau éditorial réel (UNE feuille bordée à filets
              internes), pas quatre cartes flottantes — réutilise .statBand/.stat pour
              hériter exactement de la grille 4→2 colonnes (≤719px) et des filets. */}
          <div className={styles.statBand}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.stat}>
                <Skeleton height={28} width={28} radius="var(--radius-sm)" />
                <Skeleton height={12} width="60%" radius="var(--radius-pill)" />
                <Skeleton height={28} width="75%" radius="var(--radius-md)" />
              </div>
            ))}
          </div>
          {/* Bloc table : reprend .tableBlock pour l'air « de section » (~40px) au-dessus
              du tableau. Barre d'outils (.tableTop) : note HT à gauche, pilule de
              recherche à droite — puis la table à la forme réelle. */}
          <div className={styles.tableBlock}>
            <div className={styles.tableTop}>
              <Skeleton height={14} width={140} radius="var(--radius-pill)" />
              <Skeleton height={36} width={220} radius="var(--radius-pill)" />
            </div>
            {/* Table à la forme réelle (panneau bordé, en-tête, lignes 52px) — même
                composant partagé que les contrats, calé sur les vraies colonnes. */}
            <DataTableSkeleton columns={columns} rows={INVOICES_PER_PAGE} />
          </div>
        </SkeletonGroup>
      )}
      {state.error && <LoadError onRetry={state.retry} />}

      {state.data && state.data.length === 0 && (
        <EmptyState title={fr.invoices.empty} body={fr.invoices.emptyBody} />
      )}

      {state.data && state.data.length > 0 && (
        <div className={styles.pageBody}>
          {/* Retard sérieux uniquement (≥30 j, ≥1000 € ou ≥3 factures) : la bannière
              ambre reprend la voix, en tête. Le cas courant passe en ligne discrète
              sous le bandeau (plus bas) — l'utilisateur venu lire son total impayé
              n'est plus « percuté » par une alerte pour une facture en léger retard. */}
          {computed.severity === 'severe' && (
            <InlineAlert
              variant="warning"
              banner
              title={fr.invoices.overdueTitle}
              action={
                <Button size="md" onClick={() => navigate('/contact?sujet=facture')}>
                  {fr.invoices.contactDs}
                </Button>
              }
            >
              {fr.invoices.overdueBanner(computed.overdue.length, formatEuro(computed.overdueAmount))}
            </InlineAlert>
          )}

          {/* Vue d'ensemble — même bandeau éditorial que l'Accueil : UN objet, filets
              internes, chiffres « display » (pas quatre cartes flottantes). Le total
              impayé ouvre la bande = la réponse à « dois-je quelque chose ? ». */}
          <div className={styles.statBand}>
            <div className={styles.stat}>
              <span className={styles.statIcon} data-accent="red" aria-hidden>
                <Wallet />
              </span>
              <p className={styles.statEyebrow}>{fr.invoices.kpi.unpaid}</p>
              <p className={styles.statNumber}>{formatEuro(computed.unpaidTotal)}</p>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon} data-accent="gold" aria-hidden>
                <Hourglass />
              </span>
              <p className={styles.statEyebrow}>{fr.invoices.kpi.awaiting}</p>
              <p className={styles.statNumber}>{computed.awaiting}</p>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon} data-accent="blue" aria-hidden>
                <Timer />
              </span>
              <p className={styles.statEyebrow}>{fr.invoices.kpi.avgDelay}</p>
              <p className={styles.statNumber}>
                {computed.avgDelay ?? '—'}
                {computed.avgDelay !== null && (
                  <span className={styles.statUnit}>{fr.invoices.kpi.days}</span>
                )}
              </p>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon} data-accent="green" aria-hidden>
                <CalendarClock />
              </span>
              <p className={styles.statEyebrow}>{fr.invoices.kpi.nextDue}</p>
              <p className={styles.statNumber}>
                {computed.nextDue ? formatDate(computed.nextDue.dueDate) : fr.invoices.kpi.none}
              </p>
            </div>
          </div>

          {/* Retard, niveau discret : footnote du bandeau (le bandeau reste le
              premier contenu → le total impayé répond d'emblée à « dois-je quelque
              chose ? »). Porte les 3 données WBS : nombre + montant en retard +
              accès « Contacter l'équipe DS ». Le mot « en retard » porte le sens,
              pas la couleur (indépendance à la couleur). */}
          {computed.severity === 'mild' && (
            <p className={styles.overdueNote} role="status">
              <TriangleAlert aria-hidden />
              <span>
                {/* « · » + montant forment un bloc insécable (white-space:nowrap sur
                    .overdueNoteAmount) : la coupure ne tombe qu'avant le « · », qui
                    ne traîne donc jamais seul en fin de ligne quand la note se replie. */}
                {fr.invoices.overdueMild(computed.overdue.length)}{' '}
                <span className={styles.overdueNoteAmount}>
                  · {formatEuro(computed.overdueAmount)} {fr.invoices.vatShort}
                </span>
              </span>
              <Link to="/contact?sujet=facture" className={styles.overdueNoteAction}>
                {fr.invoices.contactDs}
              </Link>
            </p>
          )}

          {/* Barre d'outils de la table : note HT à gauche, recherche tertiaire à
              droite — la pilule se cale au coin haut-droit, juste au-dessus du
              tableau (même pilule que les contrats). Le bloc est toujours monté :
              la recherche reste visible (et effaçable) même sans résultat. Le
              compteur est annoncé aux lecteurs d'écran sans alourdir l'écran. */}
          <div className={styles.tableBlock}>
            <div className={styles.tableTop}>
              <p className={styles.htNote}>{fr.invoices.htNote}</p>
              <div className={styles.tableSearch}>
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  ariaLabel={fr.invoices.searchLabel}
                  placeholder={fr.invoices.searchPlaceholder}
                />
                <span className="sr-only" role="status" aria-live="polite">
                  {rows.length > 0 ? fr.invoices.count(rows.length) : fr.invoices.noResults}
                </span>
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                variant="no-results"
                title={fr.invoices.noResults}
                action={<Button onClick={() => setSearch('')}>{fr.invoices.clearSearch}</Button>}
              />
            ) : (
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(i) => i.id}
                caption={fr.invoices.title}
                defaultSort="-period"
                onRowClick={(i) => navigate(`/factures/${i.id}`)}
                fillHeight
                pageSize={INVOICES_PER_PAGE}
                summary={fr.invoices.count(rows.length)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
