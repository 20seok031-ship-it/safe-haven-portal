import { ExternalLink } from "lucide-react";

const quickLinks = [
  { label: "안전보건교육", url: "#" },
  { label: "교육시스템\n두런두런", url: "#" },
  { label: "우리사주조합", url: "#" },
];

export default function QuickLinksWidget() {
  return (
    <div className="flex gap-2">
      {quickLinks.map((link) => (
        <button
          key={link.label}
          className="flex-1 flex items-center justify-center gap-1.5 bg-card border border-border rounded px-3 py-2.5 text-xs font-medium text-foreground hover:bg-accent transition-colors cursor-pointer whitespace-pre-line text-center"
        >
          {link.label}
          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
        </button>
      ))}
    </div>
  );
}
