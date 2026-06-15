import { Link } from 'react-router-dom';
import { PageHeader, Button } from '@/components';
import { useStrings } from '@/i18n';

export function NotFoundScreen() {
  const fr = useStrings();
  return (
    <>
      <PageHeader title={fr.notFound.title} subtitle={fr.notFound.subtitle} />
      <Link to="/">
        <Button variant="secondary">{fr.notFound.back}</Button>
      </Link>
    </>
  );
}
