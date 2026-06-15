import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function ContractsScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.contracts} />;
}
