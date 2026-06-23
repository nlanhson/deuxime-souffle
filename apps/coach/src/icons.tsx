/**
 * Icon set — Lucide (`lucide-react-native`), the house icon system.
 *
 * The web apps (admin, ehpad) use `lucide-react`; the coach app uses
 * `lucide-react-native`, so all three share one icon language. Every glyph
 * takes Lucide's { size, color, strokeWidth, ...SvgProps } API, so call sites
 * use `<Bell size={20} color={...} strokeWidth={...} />` unchanged.
 *
 * This file is the single seam: screens import from '../icons', never from the
 * library directly. Swap or add a glyph here and the whole app follows.
 *
 * CaretDownSolid is the one custom glyph — a filled, rounded dropdown caret
 * with no Lucide equivalent (Lucide's ChevronDown is an open stroke).
 */
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import Svg, { Path, Circle } from 'react-native-svg';

export type LucideIcon = ComponentType<
  SvgProps & { size?: number; color?: string; strokeWidth?: number }
>;

export {
  // --- navigation / chrome ---
  Home,
  Calendar,
  CalendarDays,
  Search,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Map,
  Navigation,
  LayoutList,
  SlidersHorizontal,
  Settings,

  // --- actions / controls ---
  X,
  Check,
  CheckCircle2,
  Minus,
  Plus,
  Send,
  Copy,
  Download,
  Trash2,
  Edit3,
  Camera,
  Eye,
  EyeOff,

  // --- status / feedback ---
  AlertTriangle,
  TriangleAlert,
  Info,
  CircleHelp,
  Ban,
  Star,
  Sparkles,
  Smile,
  Lightbulb,
  Heart,

  // --- content / documents ---
  FileText,
  Receipt,
  ScrollText,
  StickyNote,
  ClipboardList,
  MessageSquare,

  // --- calendar / time ---
  CalendarX,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  AlarmClock,
  Hourglass,

  // --- people / identity ---
  Users,
  User,
  UserRound,
  CircleUserRound,
  Hand,
  ShieldCheck,
  GraduationCap,
  IdCard,
  Briefcase,
  KeyRound,
  Lock,

  // --- place / movement ---
  MapPin,
  MapPinOff,
  Target,
  DoorOpen,
  Car,
  Bike,
  Bus,
  Footprints,
  Activity,

  // --- money / progress ---
  Wallet,
  Banknote,
  Euro,
  TrendingUp,
  TrendingDown,
  Trophy,
  Flame,
  // tier-ladder medals (Bronze → Argent → Or → Platine → Diamant)
  Medal,
  Award,
  Crown,
  Gem,

  // --- org / contact / meta ---
  Building2,
  Mail,
  Phone,
  Languages,
  LogOut,
} from 'lucide-react-native';

// Filled rounded down-triangle — the dropdown "caret" (e.g. the calendar Week/Month switch). No
// Lucide equivalent (its ChevronDown is an open stroke); rounded corners come from a same-colour
// round line-join over the filled triangle. Matches the { size, color, style } icon API.
export function CaretDownSolid({ size = 24, color = '#000', style }: { size?: number; color?: string; style?: SvgProps['style'] }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path d="M7 9.5 L12 15.5 L17 9.5 Z" fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

// Scooter (the "2 roues" transport mode, mockup screen 3) — Lucide has no moped/scooter glyph, so
// this is a custom line drawing in the same stroke language (24×24, round caps/joins): two wheels,
// a floorboard rising to the handlebar, and a seat hump over the rear wheel. Typed like a Lucide
// icon so it's interchangeable in the transport grid.
export function Scooter({ size = 24, color = '#000', strokeWidth = 2, ...rest }: SvgProps & { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx="6" cy="17" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Circle cx="18" cy="17" r="3" stroke={color} strokeWidth={strokeWidth} />
      <Path d="M9 17h5l3-8h2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 17c0-4-2.4-6-6-5.6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
