/**
 * AvailableDetailModal — the detail popup for ONE open/available session (C11/C12).
 *
 * A thin wrapper over ActionModal that maps an available-session item to the popup fields, so
 * the Home preview rows and the "See all" list both show an identical detail. No resident
 * count: these are pre-assignment sessions (matching ranks + DS assigns one coach), so the
 * open-session detail deliberately omits headcount — same call as the Disponibles screen.
 */
import React from 'react';
import { MapPin } from '../icons';

import { palette } from '../theme/theme';
import { copy } from '../copy';
import { ActionModal } from './ActionModal';
import { openDirections } from '../lib/openDirections';

export type AvailDetailItem = {
  nm: string;
  date?: string;
  hr: string;
  end?: string;
  dur?: string;
  addr?: string;
};

export function AvailableDetailModal({ item, onClose }: { item: AvailDetailItem | null; onClose: () => void }) {
  return (
    <ActionModal
      visible={!!item}
      onClose={onClose}
      Icon={MapPin}
      accentFg={palette.bleu[300]}
      accentBg="rgba(123,147,199,0.14)"
      eyebrow={item?.date}
      title={item?.nm ?? ''}
      body={item ? `${item.hr} → ${item.end} · ${item.dur}` : ''}
      note={item?.addr}
      primaryLabel={copy.available.apply}
      secondaryLabel={item?.addr ? copy.nextSession.directions : undefined}
      onSecondary={() => { if (item?.addr) openDirections(item.addr); }}
      closeA11y={copy.availableScreen.detail.closeA11y}
    />
  );
}
