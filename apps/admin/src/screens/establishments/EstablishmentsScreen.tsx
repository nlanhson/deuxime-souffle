import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function EstablishmentsScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.establishments} />;
}
