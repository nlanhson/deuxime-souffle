import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function CoachesScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.coaches} />;
}
