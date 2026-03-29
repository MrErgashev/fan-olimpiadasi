import { ICON_3D_URLS, type IconName } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Icon3DProps {
  name: IconName;
  className?: string;
  alt?: string;
}

export const Icon3D = forwardRef<HTMLImageElement, Icon3DProps>(
  ({ name, className, alt }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={ICON_3D_URLS[name]}
      alt={alt ?? name}
      className={cn("object-contain", className)}
      loading="lazy"
      draggable={false}
    />
  )
);
Icon3D.displayName = "Icon3D";

function createIcon(name: IconName, defaultAlt: string) {
  const Component = forwardRef<HTMLImageElement, { className?: string }>(
    ({ className }, ref) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        ref={ref}
        src={ICON_3D_URLS[name]}
        alt={defaultAlt}
        className={cn("object-contain", className)}
        loading="lazy"
        draggable={false}
      />
    )
  );
  Component.displayName = `Icon3D_${defaultAlt}`;
  return Component;
}

// Admin sidebar & dashboard icons
export const DashboardIcon = createIcon("dashboard", "Dashboard");
export const QuestionIcon = createIcon("question", "Savollar");
export const ClipboardIcon = createIcon("clipboard", "Testlar");
export const UsersIcon = createIcon("users", "Foydalanuvchilar");
export const TrophyIcon = createIcon("trophy", "Natijalar");
export const KeyIcon = createIcon("key", "Kalit");
export const ShieldIcon = createIcon("shield", "Xavfsizlik");
export const GearIcon = createIcon("gear", "Sozlamalar");
export const LogoutIcon = createIcon("logout", "Chiqish");
export const ChartIcon = createIcon("chart", "Statistika");
export const TrendingIcon = createIcon("trending", "O'sish");

// Student & test icons
export const ClockIcon = createIcon("clock", "Soat");
export const DocumentIcon = createIcon("document", "Hujjat");
export const WarningIcon = createIcon("warning", "Ogohlantirish");
export const BookIcon = createIcon("book", "Kitob");
export const TargetIcon = createIcon("target", "Nishon");
export const MedalIcon = createIcon("medal", "Medal");

// Landing page icons
export const PersonIcon = createIcon("person", "Shaxs");
export const AwardIcon = createIcon("award", "Mukofot");
export const SendIcon = createIcon("send", "Yuborish");
export const PinIcon = createIcon("pin", "Joylashuv");
export const PhoneIcon = createIcon("phone", "Telefon");
export const CrownIcon = createIcon("crown", "Toj");
export const GraduationIcon = createIcon("graduation", "Bitiruvchi");
export const StarIcon = createIcon("star", "Yulduz");
export const CalendarIcon = createIcon("calendar", "Taqvim");
export const BuildingIcon = createIcon("building", "Bino");
export const SparklesIcon = createIcon("sparkles", "Uchqunlar");

// Subject icons (for Footer ICON_MAP replacement)
export const CalculatorIcon = createIcon("calculator", "Matematika");
export const MonitorIcon = createIcon("monitor", "Informatika");
export const GlobeIcon = createIcon("globe", "Ingliz tili");
export const DnaIcon = createIcon("dna", "Biologiya");
export const BooksIcon = createIcon("books", "Adabiyot");
export const RunningIcon = createIcon("running", "Jismoniy tarbiya");
export const LaptopIcon = createIcon("laptop", "Noutbuk");
export const SmartphoneIcon = createIcon("smartphone", "Smartfon");
