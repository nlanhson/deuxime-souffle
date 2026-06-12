import { useStrings } from '@/i18n';
import { ButtonLink, EmptyState, PageHeader } from '@/components';

export default function NotFoundScreen() {
  const fr = useStrings();
  return (
    <>
      <PageHeader title={fr.common.notFound} />
      <EmptyState
        title={fr.common.notFound}
        body={fr.common.notFoundBody}
        action={<ButtonLink to="/">{fr.common.backHome}</ButtonLink>}
      />
    </>
  );
}
