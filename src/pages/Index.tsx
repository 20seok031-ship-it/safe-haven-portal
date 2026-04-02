import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";

export default function Index() {
  return (
    <div className="flex min-h-screen w-full">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader />
        <main className="flex-1 p-6 overflow-auto bg-background">
          {/* 새로운 입력 폼을 위한 빈 공간 */}
        </main>
      </div>
    </div>
  );
}
