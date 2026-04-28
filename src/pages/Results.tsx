import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, Plus, Trash2, Search, FileBarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserMenu from "@/components/UserMenu";
import {
  loadAssessments,
  deleteAssessment,
  type SavedAssessment,
} from "@/lib/assessmentStore";
import { toast } from "sonner";

function riskBadge(score: number) {
  if (score >= 9) return "bg-red-500 text-white";
  if (score >= 5) return "bg-yellow-400 text-slate-900";
  return "bg-green-500 text-white";
}

export default function Results() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SavedAssessment[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [assessorQuery, setAssessorQuery] = useState("");

  useEffect(() => {
    setItems(loadAssessments());
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (fromDate && it.assessDate < fromDate) return false;
      if (toDate && it.assessDate > toDate) return false;
      if (assessorQuery && !it.assessor.toLowerCase().includes(assessorQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, fromDate, toDate, assessorQuery]);

  const handleDelete = (id: string) => {
    if (!confirm("이 평가를 삭제하시겠습니까?")) return;
    deleteAssessment(id);
    setItems(loadAssessments());
    toast.success("삭제되었습니다.");
  };

  const handleView = (id: string) => {
    navigate(`/assessment?id=${id}`);
  };

  const handlePdf = (id: string) => {
    navigate(`/assessment?id=${id}&print=1`);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-blue-50/80 border-b border-blue-100">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 tracking-tight">DN SOLUTIONS</span>
            <span className="text-[10px] tracking-[0.25em] text-slate-500">EHS PORTAL</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-[1280px] space-y-6">
          {/* Page header */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FileBarChart2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">실시결과</h2>
                  <p className="text-sm text-muted-foreground">위험성평가 실시 이력을 조회하고 관리합니다.</p>
                </div>
              </div>
              <Button
                className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-5"
                onClick={() => navigate("/assessment")}
              >
                <Plus className="w-4 h-4 mr-1" /> 새 평가 작성
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">시작일</label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">종료일</label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">평가자 검색</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="평가자 이름으로 검색"
                    value={assessorQuery}
                    onChange={(e) => setAssessorQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-center font-semibold w-14">번호</th>
                    <th className="px-4 py-3 text-left font-semibold">평가일시</th>
                    <th className="px-4 py-3 text-left font-semibold">평가대상</th>
                    <th className="px-4 py-3 text-left font-semibold">공정구분</th>
                    <th className="px-4 py-3 text-left font-semibold">평가자</th>
                    <th className="px-4 py-3 text-center font-semibold">평균위험도</th>
                    <th className="px-4 py-3 text-center font-semibold">상태</th>
                    <th className="px-4 py-3 text-center font-semibold w-[220px]">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                        저장된 위험성평가가 없습니다.
                      </td>
                    </tr>
                  )}
                  {filtered.map((it, idx) => (
                    <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-600">{filtered.length - idx}</td>
                      <td className="px-4 py-3 text-slate-800">{it.assessDate}</td>
                      <td className="px-4 py-3 text-slate-800">{it.assessTarget || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{it.processCategory || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{it.assessor || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[44px] px-2 py-1 rounded-md text-xs font-bold ${riskBadge(it.averageRisk)}`}>
                          {it.averageRisk.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          it.status === "완료"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {it.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={() => handleView(it.id)}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> 상세보기
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-2.5" onClick={() => handlePdf(it.id)}>
                            <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(it.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> 삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
