import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import SiteInfoForm from "@/components/portal/SiteInfoForm";

export default function Index() {
  return (
    <div className="min-h-screen flex bg-[hsl(220_15%_95%)]">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader />
        <main className="flex-1 overflow-auto p-6">
          <SiteInfoForm />
        </main>
      </div>
    </div>
  );
}
