import PortalCard from "@/components/portal/PortalCard";

export default function PortalHome() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero with blue → white gradient */}
      <section className="relative bg-gradient-to-b from-blue-100 via-blue-50 to-white">
        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-blue-600">
            EHS AI Assistant
          </h1>
          <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            인공지능 기술로 실현하는 산업안전보건의 미래. 현장 위험성평가부터 위험요인
            분석까지 모든 안전업무를 지능형 AI 솔루션으로 쉽고 빠르게 해결하세요.
          </p>
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
