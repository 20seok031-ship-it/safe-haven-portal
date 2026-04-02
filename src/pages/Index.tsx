import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import AnnouncementsWidget from "@/components/portal/AnnouncementsWidget";

export default function Index() {
  return (
    <div className="flex min-h-screen w-full">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader />
        <main className="flex-1 p-6 overflow-auto bg-card">
          <div className="max-w-[900px] mx-auto">
            <AnnouncementsWidget />
          </div>
        </main>
      </div>
    </div>
  );
}
