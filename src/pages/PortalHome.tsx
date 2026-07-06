import PortalCard from "@/components/portal/PortalCard";

export default function PortalHome() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero with blue → white gradient */}
      <section className="relative bg-gradient-to-b from-blue-100 via-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-blue-600">
            EHS AI assistant
          </h1>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PortalCard
            title="수시 위험성평가"
            description="현장 작업 정보와 사진을 바탕으로 안전보건 공단 표준 가이드를 적용하여 위험 요인, 개선 대책 및 TBM 체크리스트를 도출합니다."
            badge="위험방지"
            badgeTone="blue"
            href="/risk-assessment"
          />
          <PortalCard
            title="현장 위험요인 분석"
            description="현장 사진을 올리면 보이는 위험요인과 제거부터 PPE까지의 위험 계층 구조별 개선대책을 초안으로 정리합니다."
            badge="사진점검"
            badgeTone="mint"
            href="/hazard-analysis"
          />
          <PortalCard
            title="준비중"
            description="새로운 안전 솔루션을 준비하고 있습니다. 곧 만나보실 수 있습니다."
            badge="Coming Soon"
            badgeTone="muted"
            disabled
          />
        </div>
      </section>
    </main>
  );
}
