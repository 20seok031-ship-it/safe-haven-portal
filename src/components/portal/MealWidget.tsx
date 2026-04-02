import { UtensilsCrossed } from "lucide-react";

export default function MealWidget() {
  return (
    <div className="flex items-center justify-center p-4">
      <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
        <UtensilsCrossed className="w-10 h-10" />
        <span className="text-xs font-medium">식단표</span>
      </button>
    </div>
  );
}
