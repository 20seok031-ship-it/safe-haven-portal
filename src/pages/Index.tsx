import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import SiteInfoForm from "@/components/portal/SiteInfoForm";

export default function Index() {
  return (
    <div className="flex min-h-screen w-full">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader />
        <main className="flex-1 p-6 overflow-auto bg-slate-50">
          <SiteInfoForm />
        </main>
      </div>
    </div>
  );
}
