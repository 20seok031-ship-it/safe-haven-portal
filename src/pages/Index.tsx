import SiteInfoForm from "@/components/portal/SiteInfoForm";
import UserMenu from "@/components/UserMenu";

export default function Index() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Header Bar */}
      <header className="bg-blue-50/80 border-b border-blue-100 print:hidden">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 tracking-tight">DN SOLUTIONS</span>
            <span className="text-[10px] tracking-[0.25em] text-slate-500">EHS PORTAL</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="p-6 overflow-auto flex justify-center">
        <div className="w-full max-w-[1200px]">
          <SiteInfoForm />
        </div>
      </div>
    </main>
  );
}
