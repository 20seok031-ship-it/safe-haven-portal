import PortalSidebar from "@/components/portal/PortalSidebar";
import PortalHeader from "@/components/portal/PortalHeader";
import ProfileWidget from "@/components/portal/ProfileWidget";
import AnnouncementsWidget from "@/components/portal/AnnouncementsWidget";
import CalendarWidget from "@/components/portal/CalendarWidget";
import NewsWidget from "@/components/portal/NewsWidget";
import OpenCommunicationWidget from "@/components/portal/OpenCommunicationWidget";
import QuickLinksWidget from "@/components/portal/QuickLinksWidget";
import FamilyOccasionsWidget from "@/components/portal/FamilyOccasionsWidget";
import MarketInfoWidget from "@/components/portal/MarketInfoWidget";
import MealWidget from "@/components/portal/MealWidget";
import safetyBg from "@/assets/safety-bg-pattern.jpg";

export default function Index() {
  return (
    <div className="flex min-h-screen w-full">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader />
        <main
          className="flex-1 p-4 overflow-auto"
          style={{
            backgroundImage: `url(${safetyBg})`,
            backgroundRepeat: "repeat",
            backgroundSize: "400px",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-4 max-w-[1400px] mx-auto">
            {/* Left Column */}
            <div className="space-y-4">
              <ProfileWidget />
              <AnnouncementsWidget />
              <CalendarWidget />
            </div>

            {/* Center Column */}
            <div className="space-y-4">
              <NewsWidget />
              <OpenCommunicationWidget />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <QuickLinksWidget />
              <FamilyOccasionsWidget />
              <MarketInfoWidget />
              <MealWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
