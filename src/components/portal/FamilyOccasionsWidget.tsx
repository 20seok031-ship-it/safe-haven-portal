const items = [
  { tag: "부고", tagColor: "text-foreground", title: "CS본부 Technology팀 Call Center ...", date: "2026-04-02" },
  { tag: "출산", tagColor: "text-portal-calendar-red", title: "🎉 축탄생🎉 재무기획실 원가기획 p...", date: "2026-03-30" },
  { tag: "부고", tagColor: "text-foreground", title: "제어개발팀 백인제 매니저님 조모...", date: "2026-03-28" },
  { tag: "축결혼", tagColor: "text-portal-calendar-red", title: "🎉 축결혼 🎉 품질본부 품질관리Part 박기...", date: "2026-03-27" },
  { tag: "출산", tagColor: "text-portal-calendar-red", title: "🎉 축탄생🎉 CS본부 FE2part 박기...", date: "2026-03-27" },
  { tag: "축결혼", tagColor: "text-portal-calendar-red", title: "🎉 축결혼 🎉 품질본부 제품품질팀 문병찬...", date: "2026-03-26" },
  { tag: "부고", tagColor: "text-foreground", title: "구매본부 구매팀 노승한 주무상...", date: "2026-03-26" },
  { tag: "축결혼", tagColor: "text-portal-calendar-red", title: "🎉 축결혼 🎉 마케팅실 & KA/한국영업본부...", date: "2026-03-24" },
  { tag: "축결혼", tagColor: "text-portal-calendar-red", title: "🎉 축결혼 🎉 생산1팀 정밀가공직 류근칠 기...", date: "2026-03-24" },
  { tag: "부고", tagColor: "text-foreground", title: "제어개발팀 양정덕 매니저님 외조상...", date: "2026-03-22" },
];

export default function FamilyOccasionsWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="portal-section-title">FAMILY OCCASIONS</h3>
        <span className="portal-more-link">more</span>
      </div>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div key={i} className="portal-list-item">
            <span className={`${item.tagColor} text-[10px] font-medium mr-1 shrink-0`}>[{item.tag}]</span>
            <span className="text-foreground truncate flex-1 mr-2">{item.title}</span>
            <span className="text-muted-foreground whitespace-nowrap">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
