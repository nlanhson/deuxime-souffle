import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function AssignmentsScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.assignments} />;
}
