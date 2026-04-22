import { HelpCircle, ChevronDown } from "lucide-react";

export default function PortalHeader() {
  return (
    <header
      className="h-16 flex items-center justify-between px-6 shrink-0 border-b border-blue-200"
      style={{ backgroundColor: "hsl(214 90% 92%)" }}
    >
      {/* Left: empty (logo lives in sidebar) */}
      <div />

      {/* Right: actions + profile */}
      <div className="flex items-center gap-5">
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm text-blue-700 font-semibold shadow-sm hover:bg-blue-50 transition-colors">
          <HelpCircle className="w-4 h-4" />
          Help
        </button>

        <button className="flex items-center gap-1 text-sm text-slate-700 font-semibold hover:text-slate-900 transition-colors">
          My Links
          <ChevronDown className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 pl-4 border-l border-blue-300/60">
          <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center overflow-hidden border border-white shadow-sm">
            <svg className="w-7 h-7 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div className="text-sm text-slate-800 font-semibold whitespace-nowrap">
            DN솔루션즈 노사/EHS Part 이영석
          </div>
          <ChevronDown className="w-4 h-4 text-slate-600" />
        </div>
      </div>
    </header>
  );
}
