import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function BillingScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.billing} />;
}
