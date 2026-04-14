import React from "react";
import { Input } from "@/components/ui/input";

export interface RiskResult {
  category: string;
  riskType: string;
  hazardDescription: string;
  currentMeasure: string;
  currentFrequency: number;
  currentSeverity: number;
  improvementMeasure: string;
  improvedFrequency: number;
  improvedSeverity: number;
}

interface FormInfo {
  assessRole: string;
  processCategory: string;
  assessDate: string;
  assessor: string;
  assessTarget: string;
}

interface RiskResultsTableProps {
  results: RiskResult[];
  formInfo: FormInfo;
  onUpdateResult: (index: number, field: keyof RiskResult, value: string | number) => void;
}

function getRiskGrade(score: number) {
  if (score >= 13) return "매우높음";
  if (score >= 9) return "고";
  if (score >= 5) return "중";
  return "저";
}

function getGradeColor(score: number) {
  if (score >= 13) return "bg-red-600 text-white";
  if (score >= 9) return "bg-orange-500 text-white";
  if (score >= 5) return "bg-yellow-400 text-slate-900";
  return "bg-green-500 text-white";
}

function calcAvg(results: RiskResult[], type: "current" | "improved") {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => {
    const f = type === "current" ? r.currentFrequency : r.improvedFrequency;
    const s = type === "current" ? r.currentSeverity : r.improvedSeverity;
    return acc + f * s;
  }, 0);
  return (sum / results.length).toFixed(2);
}

export default function RiskResultsTable({ results, formInfo, onUpdateResult }: RiskResultsTableProps) {
  const thClass = "border border-slate-300 py-2 px-2 text-xs font-bold text-center bg-slate-100 text-slate-800";
  const tdClass = "border border-slate-300 py-1.5 px-2 text-xs text-slate-800";
  const tdCenter = `${tdClass} text-center`;
  const inputClass = "h-7 text-xs text-center border-0 bg-transparent p-0 w-full focus-visible:ring-1 focus-visible:ring-slate-400";
  const textInputClass = "h-auto min-h-[28px] text-xs border-0 bg-transparent p-1 w-full focus-visible:ring-1 focus-visible:ring-slate-400 resize-none";

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 md:p-6 max-w-[1200px] mx-auto overflow-x-auto">
      {/* Header Section */}
      <table className="w-full border-collapse border border-slate-300 mb-0">
        <tbody>
          <tr>
            <td className={`${thClass} w-20`}>평가직</td>
            <td className={`${tdClass} w-32`}>{formInfo.assessRole || "-"}</td>
            <td className={`${thClass} w-20`}>공정구분</td>
            <td className={`${tdClass} w-32`}>{formInfo.processCategory || "-"}</td>
            <td rowSpan={3} className="border border-slate-300 text-center align-middle px-4">
              <div className="text-lg font-bold text-slate-900">수시 위험성평가</div>
              <div className="text-sm text-slate-600 mt-1">({formInfo.assessTarget || "-"})</div>
            </td>
            <td className={`${thClass} w-20`}>평가자</td>
            <td className={`${tdClass} w-36`}>{formInfo.assessor || "-"}</td>
          </tr>
          <tr>
            <td className={thClass}>평가일시</td>
            <td className={tdClass}>{formInfo.assessDate || "-"}</td>
            <td className={thClass} colSpan={2} rowSpan={2}></td>
            <td className={thClass} rowSpan={2}>평균<br/>위험도</td>
            <td className={tdCenter} rowSpan={2}>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="text-[10px] text-slate-500">현재</div>
                  <div className="font-bold text-base">{calcAvg(results, "current")}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">개선 후</div>
                  <div className="font-bold text-base">{calcAvg(results, "improved")}</div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className={thClass} colSpan={2}></td>
          </tr>
        </tbody>
      </table>

      {/* Main Results Table */}
      <table className="w-full border-collapse border border-slate-300">
        <thead>
          <tr>
            <th rowSpan={2} className={`${thClass} w-16`}>평가<br/>구분</th>
            <th rowSpan={2} className={`${thClass} w-16`}>유해위험<br/>요인</th>
            <th rowSpan={2} className={`${thClass} min-w-[160px]`}>위험요인 및 재해형태</th>
            <th rowSpan={2} className={`${thClass} min-w-[140px]`}>현재 안전 조치</th>
            <th colSpan={3} className={thClass}>현재 위험도</th>
            <th rowSpan={2} className={`${thClass} min-w-[140px]`}>개선 대책</th>
            <th colSpan={3} className={thClass}>개선후위험도</th>
          </tr>
          <tr>
            <th className={`${thClass} w-12`}>빈도</th>
            <th className={`${thClass} w-12`}>강도</th>
            <th className={`${thClass} w-14`}>위험도</th>
            <th className={`${thClass} w-12`}>빈도</th>
            <th className={`${thClass} w-12`}>강도</th>
            <th className={`${thClass} w-14`}>위험도</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const currentRisk = r.currentFrequency * r.currentSeverity;
            const improvedRisk = r.improvedFrequency * r.improvedSeverity;
            return (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className={tdCenter}>
                  <input
                    className={inputClass}
                    value={r.category}
                    onChange={(e) => onUpdateResult(i, "category", e.target.value)}
                  />
                </td>
                <td className={tdCenter}>
                  <input
                    className={inputClass}
                    value={r.riskType}
                    onChange={(e) => onUpdateResult(i, "riskType", e.target.value)}
                  />
                </td>
                <td className={tdClass}>
                  <textarea
                    className={textInputClass}
                    value={r.hazardDescription}
                    onChange={(e) => onUpdateResult(i, "hazardDescription", e.target.value)}
                    rows={2}
                  />
                </td>
                <td className={tdClass}>
                  <textarea
                    className={textInputClass}
                    value={r.currentMeasure}
                    onChange={(e) => onUpdateResult(i, "currentMeasure", e.target.value)}
                    rows={2}
                  />
                </td>
                <td className={tdCenter}>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    className={inputClass}
                    value={r.currentFrequency}
                    onChange={(e) => onUpdateResult(i, "currentFrequency", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </td>
                <td className={tdCenter}>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    className={inputClass}
                    value={r.currentSeverity}
                    onChange={(e) => onUpdateResult(i, "currentSeverity", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </td>
                <td className={tdCenter}>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getGradeColor(currentRisk)}`}>
                    {currentRisk}
                  </span>
                </td>
                <td className={tdClass}>
                  <textarea
                    className={textInputClass}
                    value={r.improvementMeasure}
                    onChange={(e) => onUpdateResult(i, "improvementMeasure", e.target.value)}
                    rows={2}
                  />
                </td>
                <td className={tdCenter}>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    className={inputClass}
                    value={r.improvedFrequency}
                    onChange={(e) => onUpdateResult(i, "improvedFrequency", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </td>
                <td className={tdCenter}>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    className={inputClass}
                    value={r.improvedSeverity}
                    onChange={(e) => onUpdateResult(i, "improvedSeverity", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                </td>
                <td className={tdCenter}>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getGradeColor(improvedRisk)}`}>
                    {improvedRisk}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
