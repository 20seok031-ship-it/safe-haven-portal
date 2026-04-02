import profilePhoto from "@/assets/profile-photo.jpg";

const stats = [
  { label: "기안진행", count: 0, color: "bg-portal-badge-blue" },
  { label: "결재대기", count: 0, color: "bg-portal-badge-red" },
  { label: "수신접수", count: 0, color: "bg-portal-badge-green" },
];

export default function ProfileWidget() {
  return (
    <div className="bg-card rounded border border-border p-4">
      <p className="text-xs font-bold text-foreground mb-3">
        <span className="text-primary">[김영석 매니저]</span> 안전관리팀 EHS Part
      </p>
      <div className="flex gap-4 items-center">
        <img
          src={profilePhoto}
          alt="프로필"
          className="w-20 h-20 rounded object-cover border border-border"
        />
        <div className="flex-1 space-y-2">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{s.label}</span>
              <div className="flex items-center gap-1">
                <span className={`portal-badge ${s.color}`}>{s.count}</span>
                <span className="text-muted-foreground">건</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
