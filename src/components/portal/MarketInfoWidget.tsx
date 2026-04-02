const items = [
  { title: "[안내] 장터+생활 정보 게시판 이용 안내", date: "2026-04-01" },
  { title: "[홍보] 예산 아 수원에서 만든 점가를 없는 리...", date: "2026-03-27" },
  { title: "[공유] 휴대폰 케이스 온라인 쇼핑몰 추대여...", date: "2026-03-27" },
  { title: "안전관리팀 전용혜택 휴대폰 할인행사(갤...", date: "2026-03-04" },
  { title: "10년간 고객 신뢰를 쌓아온 기아자동차 딜러...", date: "2026-02-03" },
  { title: "그랜드 머큐어 앰배서더 창원 안내", date: "2026-01-20" },
  { title: "2026 거제삼성호텔 임직원 제휴 안내", date: "2026-01-12" },
  { title: "(웨딩&신부팀) 2026년 1~2월 안전 SOLU...", date: "2025-12-18" },
  { title: "2026 그랜드시티호텔 장원 제휴 안내", date: "2025-12-09" },
  { title: "부산 센텀비즈니스 호텔 & 해운대 르블러스...", date: "2025-12-08" },
];

export default function MarketInfoWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="portal-section-title">장터+생활 정보</h3>
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
