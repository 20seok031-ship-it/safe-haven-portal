const items = [
  { title: "[공지] SafetyPortal | 2026 안전보건 정규 시즌 참관 신청 안내", date: "2026-01-06" },
  { title: "현장 안전의자에서 습득한 봉투를 보관중에 있습니다", date: "2025-03-28" },
  { title: "[안전D리그] 2025 하반기 안전보건 참관신청 안내", date: "2025-03-27" },
  { title: "[보안문화] 설 명절 관련 스미싱 예방 위한 보안 사항 전파", date: "2025-01-20" },
  { title: "[정보 공유] 두런두런 연계 전자도서관_전사원 일괄 등록은 X", date: "2024-10-17" },
];

export default function OpenCommunicationWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="portal-section-title">OPEN COMMUNICATION</h3>
        <span className="portal-more-link">more</span>
      </div>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={i} className="portal-list-item">
            <span className="text-foreground truncate flex-1 mr-2">{item.title}</span>
            <span className="text-muted-foreground whitespace-nowrap">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
