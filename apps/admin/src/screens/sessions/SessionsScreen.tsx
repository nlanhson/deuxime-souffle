import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function SessionsScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.sessions} />;
}
