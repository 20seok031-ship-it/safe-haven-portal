import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function HazardAnalysis() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> 메인으로
        </Link>
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">현장 위험요인 분석</h1>
          <p className="text-sm text-slate-500">이 기능은 곧 제공될 예정입니다.</p>
        </div>
      </div>
    </main>
  );
}
