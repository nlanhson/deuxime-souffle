/**
 * Icon set — Heroicons (outline), exposed under the names the app already uses.
 *
 * Drop-in shim for the former `lucide-react-native` imports: every call site
 * keeps working with `<Bell size={20} color={...} strokeWidth={...} />`.
 * Heroicons outline render `stroke="currentColor"`, and react-native-svg
 * resolves `currentColor` from the `color` prop, so Lucide's
 * { size, color, strokeWidth } API maps over cleanly.
 *
 * Most names are exact matches. A handful of Lucide glyphs have no Heroicon
 * equivalent (Heroicons has no calendar-x, alarm-clock, car, footprints,
 * map-pin-off, sticky-note); those fall back to the nearest match, flagged
 * with `// ~`. To switch to the filled style, change the import below to
 * 'react-native-heroicons/solid'.
 */
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import {
  HomeIcon,
  CalendarIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
  DocumentTextIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PencilSquareIcon,
  UsersIcon,
  UserIcon,
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  NoSymbolIcon,
  FaceSmileIcon,
  WalletIcon,
  ArrowTrendingUpIcon,
  HandRaisedIcon,
  SparklesIcon,
  QueueListIcon,
  AdjustmentsHorizontalIcon,
  DocumentDuplicateIcon,
  BuildingOffice2Icon,
  ArrowRightEndOnRectangleIcon,
  ArrowRightStartOnRectangleIcon,
  TruckIcon,
  MapIcon,
  BoltIcon,
  ViewfinderCircleIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  KeyIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  CameraIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PhoneIcon,
  IdentificationIcon,
  BriefcaseIcon,
  LightBulbIcon,
  InformationCircleIcon,
  TrophyIcon,
  FireIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
} from 'react-native-heroicons/outline';

export type LucideIcon = ComponentType<
  SvgProps & { size?: number; color?: string; strokeWidth?: number }
>;

// --- exact matches ---
export const Home = HomeIcon;
export const Calendar = CalendarIcon;
export const CalendarDays = CalendarDaysIcon;
export const Search = MagnifyingGlassIcon;
export const X = XMarkIcon;
export const Check = CheckIcon;
export const CheckCircle2 = CheckCircleIcon;
export const Minus = MinusIcon;
export const Plus = PlusIcon;
export const Star = StarIcon;
export const FileText = DocumentTextIcon;
export const MapPin = MapPinIcon;
export const AlertTriangle = ExclamationTriangleIcon;
export const TriangleAlert = ExclamationTriangleIcon;
export const Edit3 = PencilIcon;
export const Users = UsersIcon;
export const User = UserIcon;
export const Bell = BellIcon;
export const Clock = ClockIcon;
export const ChevronDown = ChevronDownIcon;
export const ChevronUp = ChevronUpIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronLeft = ChevronLeftIcon;
export const Ban = NoSymbolIcon;
export const Send = PaperAirplaneIcon;
export const Smile = FaceSmileIcon;
export const Wallet = WalletIcon;
export const TrendingUp = ArrowTrendingUpIcon;
export const Hand = HandRaisedIcon;
export const Sparkles = SparklesIcon;
export const SlidersHorizontal = AdjustmentsHorizontalIcon;
export const Copy = DocumentDuplicateIcon;
export const Building2 = BuildingOffice2Icon;

// --- nearest match (no exact Heroicon) ---
export const Navigation = PaperAirplaneIcon; // ~ directions arrow
export const CalendarX = CalendarDaysIcon; // ~ no calendar-x
export const CalendarCheck = CalendarDaysIcon; // ~ no calendar-check
export const StickyNote = PencilSquareIcon; // ~ note
export const Activity = BoltIcon; // ~ activity/effort
export const AlarmClock = ClockIcon; // ~ no alarm clock
export const LayoutList = QueueListIcon; // ~ list layout
export const DoorOpen = ArrowRightEndOnRectangleIcon; // ~ door
export const UserRound = UserCircleIcon; // ~ round user
export const Car = TruckIcon; // ~ no car glyph
export const Footprints = MapIcon; // ~ walking → map
export const Bike = BoltIcon; // ~ no bicycle → bolt (two-wheel / speed)
export const MapPinOff = MapPinIcon; // ~ no map-pin-off

// --- profile / revenue / notification screens ---
export const Map = MapIcon;
export const ShieldCheck = ShieldCheckIcon;
export const GraduationCap = AcademicCapIcon;
export const KeyRound = KeyIcon;
export const CircleHelp = QuestionMarkCircleIcon;
export const Mail = EnvelopeIcon;
export const Camera = CameraIcon;
export const TrendingDown = ArrowTrendingDownIcon;
export const Download = ArrowDownTrayIcon;
export const Banknote = BanknotesIcon;
export const LogOut = ArrowRightStartOnRectangleIcon;

// --- auth / onboarding ---
export const Eye = EyeIcon;
export const EyeOff = EyeSlashIcon;
export const Lock = LockClosedIcon;
export const Phone = PhoneIcon;
export const IdCard = IdentificationIcon;
export const Target = ViewfinderCircleIcon; // ~ no bullseye → viewfinder
export const ScrollText = DocumentTextIcon; // ~ scroll → document
export const CalendarClock = CalendarDaysIcon; // ~ no calendar-clock
export const CalendarPlus = CalendarDaysIcon; // ~ no calendar-plus
export const Hourglass = ClockIcon; // ~ no hourglass → clock
export const Briefcase = BriefcaseIcon;
export const Lightbulb = LightBulbIcon;
export const Info = InformationCircleIcon;
export const Trophy = TrophyIcon;
export const Flame = FireIcon;
export const Trash2 = TrashIcon;
export const MessageSquare = ChatBubbleLeftRightIcon;
export const ClipboardList = ClipboardDocumentListIcon;
