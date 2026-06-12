import { Select } from '@/components/Select';
import { formatTime } from '@/lib/format';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  error?: string | null | undefined;
  required?: boolean | undefined;
  helper?: string | undefined;
}

const SLOTS: string[] = [];
for (let h = 8; h <= 18; h += 1) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 18) SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

/** Heure par créneaux de 30 min (8 h – 18 h) — liste fermée, pas de saisie libre. */
export function TimePicker({ label, value, onChange, error, required, helper }: TimePickerProps) {
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={SLOTS.map((slot) => ({ value: slot, label: formatTime(slot) }))}
      {...(error !== undefined ? { error } : {})}
      {...(required !== undefined ? { required } : {})}
      {...(helper !== undefined ? { helper } : {})}
    />
  );
}
