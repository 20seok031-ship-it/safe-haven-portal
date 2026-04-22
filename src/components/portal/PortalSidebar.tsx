import {
  Home,
  Briefcase,
  CheckSquare,
  HelpCircle,
  Network,
  User,
  QrCode,
  ShieldAlert,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "HOME", active: false },
  { icon: Briefcase, label: "WORKPLACE" },
  { icon: CheckSquare, label: "APPROVAL" },
  { icon: HelpCircle, label: "EMPLOYEE SERVICE" },
  { icon: ShieldAlert, label: "위험성평가", active: true },
];

const subItems = [
  { icon: Network, label: "Organization Chart" },
  { icon: User, label: "My Page" },
];

export default function PortalSidebar() {
  return (
    <aside className="w-[220px] min-h-screen flex flex-col shrink-0" style={{ backgroundColor: "hsl(220 90% 30%)" }}>
      {/* Logo */}
      <div className="px-5 py-5">
        <div className="text-white font-extrabold text-xl tracking-tight leading-tight">
          DN <span className="font-light">SOLUTIONS</span>
        </div>
        <div className="mt-1 text-white/80 text-[10px] font-semibold tracking-[0.15em]">
          MACHINE GREATNESS™
        </div>
      </div>

      {/* Main menu */}
      <nav className="flex-1 py-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors cursor-pointer ${
              item.active
                ? "bg-white/15 text-white font-bold border-l-4 border-white"
                : "text-white/85 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-left text-[12px] font-semibold tracking-wide">{item.label}</span>
          </button>
        ))}

        <div className="my-3 mx-5 border-t border-white/15" />

        {subItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="text-left text-[12px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* QR button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold py-2.5 rounded-md transition-colors cursor-pointer border border-white/20">
          <QrCode className="w-3.5 h-3.5" />
          Mobile EP QRCode
        </button>
      </div>
    </aside>
  );
}
