const announcements = [
  { title: "직원 안전교육 안내", date: "2026-04-01" },
  { title: "[공지] 통합 안전점검 시스템 운영 안내(창원/서울)", date: "2026-03-31" },
  { title: "[안내] 26년 4월 기념일 안전점검 신청_안내", date: "2026-03-26" },
  { title: "[Job Posting] 안전관리 전문인력 모집 안내(연구기관...)", date: "2026-03-26" },
  { title: "[안내] 2026년 상반기 신입사원 안전교육 안내", date: "2026-03-25" },
  { title: "[공지] SafetyPortal | 2026 안전보건 정규 시즌...", date: "2026-03-24" },
  { title: "[장애출동] 서비스 콜센터 시스템 전화연결...", date: "2026-03-21" },
  { title: "[IT서비스 장애] 서비스 콜센터 시스템 전화...", date: "2026-03-21" },
  { title: "2026년 기술직 승진 인사발령", date: "2026-03-18" },
  { title: "2026년 사무직 승진 인사발령", date: "2026-03-18" },
];

export default function AnnouncementsWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="portal-section-title">ANNOUNCEMENTS</h3>
        <span className="portal-more-link">more</span>
      </div>
      <div className="space-y-0">
        {announcements.map((a, i) => (
          <div key={i} className="portal-list-item">
            <span className="text-foreground truncate flex-1 mr-2">{a.title}</span>
            <span className="text-muted-foreground whitespace-nowrap">{a.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
