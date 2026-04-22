import {
  Home,
  Briefcase,
  CheckSquare,
  HelpCircle,
  IdCard,
  SlidersHorizontal,
} from "lucide-react";
import sidebarMachine from "@/assets/sidebar-machine.jpg";

const mainItems = [
  { icon: Home, label: "HOME", active: false },
  { icon: Briefcase, label: "WORKPLACE", active: false },
  { icon: CheckSquare, label: "APPROVAL", active: true },
  { icon: HelpCircle, label: "EMPLOYEE SERVICE", active: false },
];

const subItems = [
  { icon: IdCard, label: "Organization Chart" },
  { icon: SlidersHorizontal, label: "My Page" },
];

export default function PortalSidebar() {
  return (
    <aside
      className="w-[220px] min-h-screen flex flex-col shrink-0 relative overflow-hidden"
      style={{ backgroundColor: "hsl(222 85% 45%)" }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 relative z-10">
        <div className="text-white font-extrabold text-[22px] tracking-tight leading-none">
          DN <span className="font-light">SOLUTIONS</span>
        </div>
      </div>

      {/* Main menu */}
      <nav className="relative z-10">
        {mainItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer ${
              item.active
                ? "bg-[hsl(222_80%_55%)] text-white font-bold"
                : "text-white hover:bg-white/10"
            }`}
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2.2} />
            <span className="text-left text-[13px] font-bold tracking-wide">{item.label}</span>
          </button>
        ))}

        <div className="mx-5 my-3 border-t border-white/25" />

        {subItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-white/95 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            <span className="text-left text-[13px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* QR button */}
      <div className="px-5 mt-8 relative z-10">
        <button className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/15 text-white text-[13px] font-bold py-2.5 rounded-full transition-colors cursor-pointer border border-white/70">
          Mobile EP QRCode
        </button>
      </div>

      {/* Bottom machine image */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] bg-cover bg-bottom opacity-90 pointer-events-none"
        style={{ backgroundImage: `url(${sidebarMachine})` }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, hsl(222 85% 45%) 0%, hsl(222 85% 45% / 0.5) 25%, transparent 60%)" }}
      />
    </aside>
  );
}
