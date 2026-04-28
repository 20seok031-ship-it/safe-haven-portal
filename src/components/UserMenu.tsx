import { useNavigate } from "react-router-dom";
import { ChevronDown, ClipboardList, FileBarChart2, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    navigate("/", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-sm">
          <User className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-800 hidden sm:inline">
          DN솔루션즈 노사/EHS Part 이영석
        </span>
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">이영석</span>
            <span className="text-xs text-slate-500 font-normal">DN솔루션즈 노사/EHS Part</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/assessment")} className="cursor-pointer">
          <ClipboardList className="w-4 h-4 mr-2" />
          수시 위험성평가
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/results")} className="cursor-pointer">
          <FileBarChart2 className="w-4 h-4 mr-2" />
          실시결과
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
