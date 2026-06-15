import { DomainPlaceholder } from '@/screens/DomainPlaceholder';
import { useStrings } from '@/i18n';

export function SettingsScreen() {
  const fr = useStrings();
  return <DomainPlaceholder {...fr.screens.settings} />;
}
