import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PortalCardProps {
  title: string;
  description: string;
  badge: string;
  badgeTone: "blue" | "mint" | "muted";
  href?: string;
  disabled?: boolean;
}

const toneStyles: Record<PortalCardProps["badgeTone"], string> = {
  blue: "bg-blue-50 text-blue-700",
  mint: "bg-teal-50 text-teal-700",
  muted: "bg-slate-100 text-slate-500",
};

const accentStyles: Record<PortalCardProps["badgeTone"], string> = {
  blue: "before:bg-blue-500",
  mint: "before:bg-teal-400",
  muted: "before:bg-slate-300",
};

export default function PortalCard({
  title,
  description,
  badge,
  badgeTone,
  href,
  disabled,
}: PortalCardProps) {
  const inner = (
    <div
      className={`relative h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-7 flex flex-col before:absolute before:top-0 before:left-6 before:right-6 before:h-[3px] before:rounded-b-full ${accentStyles[badgeTone]} ${disabled ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${toneStyles[badgeTone]}`}>
          {badge}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-8 flex-1">{description}</p>
      <div
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${
          disabled
            ? "border-slate-200 text-slate-400 cursor-not-allowed"
            : "border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {disabled ? "준비중" : "바로가기"}
        {!disabled && <ArrowRight className="w-4 h-4" />}
      </div>
    </div>
  );

  if (disabled || !href) return inner;
  return (
    <Link to={href} className="block h-full">
      {inner}
    </Link>
  );
}
