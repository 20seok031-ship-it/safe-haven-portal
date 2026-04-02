import {
  Home,
  Briefcase,
  CheckSquare,
  Users,
  LayoutGrid,
  User,
  Settings,
  ShieldAlert,
  FileWarning,
  QrCode,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "HOME", active: true },
  { icon: ShieldAlert, label: "위험성평가" },
  { icon: User, label: "My Page" },
  { icon: Settings, label: "Edit widget" },
];

export default function PortalSidebar() {
  return (
    <aside className="w-[200px] min-h-screen bg-primary flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-primary-foreground/20">
        <h1 className="text-primary-foreground font-bold text-lg tracking-tight">
          SafetyPortal
        </h1>
        <p className="text-primary-foreground/70 text-[10px] tracking-widest mt-0.5">
          SAFETY FIRST
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors cursor-pointer ${
              item.active
                ? "bg-primary-foreground/15 text-primary-foreground font-semibold"
                : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-left text-xs">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile EP QRCode button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground text-xs font-medium py-2.5 rounded transition-colors cursor-pointer">
          <QrCode className="w-4 h-4" />
          Mobile EP QRCode
        </button>
      </div>
    </aside>
  );
}
