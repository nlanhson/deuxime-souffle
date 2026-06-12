import { useStrings } from '@/i18n';
import { ButtonLink, EmptyState } from '@/components';

export default function NotFoundScreen() {
  const fr = useStrings();
  return (
    <>
      {/* h1 masqué : l'EmptyState porte le titre visible — pas de doublon à l'écran. */}
      <h1 className="sr-only">{fr.common.notFound}</h1>
      <EmptyState
        title={fr.common.notFound}
        body={fr.common.notFoundBody}
        action={<ButtonLink to="/">{fr.common.backHome}</ButtonLink>}
      />
    </>
  );
}
