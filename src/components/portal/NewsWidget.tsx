import news1 from "@/assets/news-1.jpg";
import news2 from "@/assets/news-2.jpg";
import news3 from "@/assets/news-3.jpg";
import news4 from "@/assets/news-4.jpg";
import { Eye, Heart } from "lucide-react";

const newsItems = [
  {
    image: news1,
    title: "'안전관리 x 현장점검 월간 뉴스레터' 3월호 발행",
    date: "2026-03-30 09:18",
    author: "박정민",
    views: 1083,
    likes: 12,
    desc: "안녕하세요, 안전관리팀 임직원 여러분, '안전관리 월간 뉴스레터' 3월호(창간호) 발행해 알려드립니다...",
  },
  {
    image: news2,
    title: "[안전장비 스토리] 보호구 1만대 씩쓸이한 IT 거인의 배팅... 유니바디 안전모 만든 해결",
    date: "2026-03-23 10:55",
    author: "안전 커뮤니케이션실",
    views: 973,
    likes: 24,
    desc: "안전장비 스토리는 보호구와 장비를 활용하여 세계의 안전을 바꾼 이야기를 다룹니다...",
  },
  {
    image: news3,
    title: "안전관리팀, 상반기 신입사원 교육... 25일부터 서류접수",
    date: "2026-03-18 14:49",
    author: "김혁준",
    views: 1414,
    likes: 9,
    desc: "올해도 안전관리팀의 새로운 얼굴이 될 신입사원 교육을 실시합니다. 모집 대상은 사무직, 기술직...",
  },
  {
    image: news4,
    title: "[안전교육 스토리] 타이거 우즈의 프로 메이저 대회 15승을 달성케 한 안전 기술력",
    date: "2026-03-13 10:31",
    author: "김혁준",
    views: 971,
    likes: 17,
    desc: "안전교육 스토리는 보호구와 장비를 활용하여 세계의 안전 판도를 바꾼 이야기를 다룹니다...",
  },
];

export default function NewsWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="portal-section-title">안전 소식 & 자료</h3>
        <span className="portal-more-link">more</span>
      </div>
      <div className="space-y-4">
        {newsItems.map((item, i) => (
          <div key={i} className="flex gap-3 cursor-pointer hover:bg-accent/30 p-1 rounded transition-colors">
            <img
              src={item.image}
              alt={item.title}
              className="w-28 h-20 object-cover rounded shrink-0"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                <span>{item.date}</span>
                <span>{item.author}</span>
                <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> 조회수 ({item.views.toLocaleString()})</span>
                <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> 좋아요 ({item.likes})</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
