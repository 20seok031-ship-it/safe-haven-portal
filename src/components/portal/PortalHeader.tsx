import { HelpCircle, ChevronDown } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

export default function PortalHeader() {
  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-bold text-foreground text-base tracking-tight">
          SafetyPortal
        </span>
        <span className="text-muted-foreground text-xs tracking-widest ml-2">
          SAFETY FIRST™
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1.5 border border-primary rounded-full px-3 py-1 text-primary text-xs font-medium hover:bg-accent transition-colors cursor-pointer">
          <HelpCircle className="w-3.5 h-3.5" />
          Help
        </button>
        <button className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
          My Links <ChevronDown className="w-3 h-3 inline" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <img
            src={profilePhoto}
            alt="프로필"
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          <div className="text-xs">
            <span className="text-foreground font-medium">안전관리팀 김영석</span>
            <ChevronDown className="w-3 h-3 inline ml-1 text-muted-foreground" />
          </div>
        </div>
      </div>
    </header>
  );
}
