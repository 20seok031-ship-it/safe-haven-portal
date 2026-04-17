import React, { useState, useEffect, useRef } from "react";

/** Auto-resizing textarea that grows with content from initial render — no click required. */
function AutoTextarea({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(() => {
    resize();
  }, [value]);
  useEffect(() => {
    // Resize after fonts/layout settle
    const id = window.requestAnimationFrame(resize);
    return () => window.cancelAnimationFrame(id);
  }, []);
  return (
    <textarea
      ref={ref}
      className={className}
      value={value}
      rows={1}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", overflow: "hidden" }}
    />
  );
}

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
  assessType: string;
}

interface RiskResultsTableProps {
  results: RiskResult[];
  formInfo: FormInfo;
  uploadedImages: string[];
  onUpdateResult: (index: number, field: keyof RiskResult, value: string | number) => void;
}

function getGradeColor(score: number) {
  if (score >= 9) return "bg-red-500 text-white";
  if (score >= 5) return "bg-yellow-400 text-slate-900";
  return "bg-green-500 text-white";
}

function calcAvg(results: RiskResult[], type: "current" | "improved") {
  if (results.length === 0) return "0.00";
  const sum = results.reduce((acc, r) => {
    const f = type === "current" ? r.currentFrequency : r.improvedFrequency;
    const s = type === "current" ? r.currentSeverity : r.improvedSeverity;
    return acc + f * s;
  }, 0);
  return (sum / results.length).toFixed(2);
}

/** Group consecutive rows by category for rowspan merging */
function getCategorySpans(results: RiskResult[]) {
  const spans: { start: number; count: number }[] = [];
  let i = 0;
  while (i < results.length) {
    let j = i + 1;
    while (j < results.length && results[j].category === results[i].category) j++;
    spans.push({ start: i, count: j - i });
    i = j;
  }
  return spans;
}

const DEFAULT_EDUCATION = `1. 안전사고 발생원인
2. 사고발생원인에 대한 재발방지대책
3. 유해위험요인 재발굴
4. 유사 안전사고 발생사례
5. 안전작업수칙`;

export default function RiskResultsTable({ results, formInfo, uploadedImages, onUpdateResult }: RiskResultsTableProps) {
  const [educationContent, setEducationContent] = useState(DEFAULT_EDUCATION);

  const th = "border border-slate-400 py-1.5 px-2 text-xs font-bold text-center bg-slate-100 text-slate-800 align-middle";
  const td = "border border-slate-400 py-1 px-2 text-xs text-slate-800 align-top whitespace-normal break-words";
  const tdC = `${td} text-center align-middle`;
  const inp = "h-7 text-xs text-center border-0 bg-transparent p-0 w-full focus-visible:ring-1 focus-visible:ring-slate-400";
  const txtInp = "text-xs leading-relaxed border-0 bg-transparent p-1 w-full focus-visible:ring-1 focus-visible:ring-slate-400";

  const assessTypeLabel = formInfo.assessType === "industrial_accident" ? "산업재해 발생"
    : formInfo.assessType === "new_equipment" ? "신규 장비 설치"
    : formInfo.assessType === "new_process" ? "신규 공정 도입" : formInfo.assessType;

  const categorySpans = getCategorySpans(results);
  const spanMap = new Map<number, number>();
  categorySpans.forEach(s => spanMap.set(s.start, s.count));

  const validImages = uploadedImages.filter(Boolean);

  return (
    <div id="risk-report" className="bg-white rounded-xl border border-border shadow-sm p-4 md:p-6 max-w-[1200px] mx-auto overflow-x-auto print:shadow-none print:border-0 print:p-0 print:max-w-none print:rounded-none">
      {/* Header Table */}
      <table className="w-full border-collapse border border-slate-400 mb-0">
        <tbody>
          <tr>
            <td className={`${th} w-[80px]`}>평가직</td>
            <td className={`${td} w-[120px]`}>{formInfo.assessRole || "-"}</td>
            <td rowSpan={3} className="border border-slate-400 text-center align-middle px-4 min-w-[200px]">
              <div className="text-lg font-bold text-slate-900">수시 위험성평가</div>
              <div className="text-sm text-slate-600 mt-1">({assessTypeLabel} : {formInfo.assessTarget || "-"})</div>
            </td>
            <td className={`${th} w-[80px]`}>평가자</td>
            <td className={`${td} w-[140px]`}>{formInfo.assessor || "-"}</td>
          </tr>
          <tr>
            <td className={th}>공정구분</td>
            <td className={td}>{formInfo.processCategory || "-"}</td>
            <td rowSpan={2} className={`${th} w-[80px]`}>평균<br/>위험도</td>
            <td rowSpan={2} className="border border-slate-400 p-0 w-[140px]">
              <div className="flex h-full">
                <div className="flex-1 text-center py-2 bg-slate-100 border-r border-slate-400">
                  <div className="text-[10px] text-slate-500">현 재</div>
                  <div className="font-bold text-base text-slate-800">{calcAvg(results, "current")}</div>
                </div>
                <div className="flex-1 text-center py-2 bg-slate-100">
                  <div className="text-[10px] text-slate-500">개선 후</div>
                  <div className="font-bold text-base text-slate-800">{calcAvg(results, "improved")}</div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td className={th}>평가일시</td>
            <td className={td}>{formInfo.assessDate || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Main Results Table */}
      <table className="w-full border-collapse border border-slate-400 -mt-px">
        <thead>
          <tr>
            <th rowSpan={2} className={`${th} w-[60px]`}>평가<br/>구분</th>
            <th rowSpan={2} className={`${th} w-[70px]`}>유해위험<br/>원인</th>
            <th rowSpan={2} className={`${th} min-w-[160px]`}>위험요인 및 재해형태</th>
            <th rowSpan={2} className={`${th} min-w-[140px]`}>현재 안전 조치</th>
            <th colSpan={3} className={th}>현재 위험도</th>
            <th rowSpan={2} className={`${th} min-w-[140px]`}>개선 대책</th>
            <th colSpan={3} className={th}>개선후위험도</th>
          </tr>
          <tr>
            <th className={`${th} w-[40px]`}>빈도</th>
            <th className={`${th} w-[40px]`}>강도</th>
            <th className={`${th} w-[50px]`}>위험도</th>
            <th className={`${th} w-[40px]`}>빈도</th>
            <th className={`${th} w-[40px]`}>강도</th>
            <th className={`${th} w-[50px]`}>위험도</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const curRisk = r.currentFrequency * r.currentSeverity;
            const impRisk = r.improvedFrequency * r.improvedSeverity;
            const span = spanMap.get(i);
            const isFirst = span !== undefined;
            const isSpanned = !isFirst && categorySpans.some(s => i > s.start && i < s.start + s.count);

            return (
              <tr key={i} className="hover:bg-slate-50/50 print:hover:bg-transparent">
                {/* Merged category cell */}
                {isFirst && (
                  <td className={`${tdC} align-middle font-semibold`} rowSpan={span}>
                    <input className={inp} value={r.category} onChange={(e) => {
                      // Update all rows in this span
                      for (let k = i; k < i + span; k++) onUpdateResult(k, "category", e.target.value);
                    }} />
                  </td>
                )}
                {/* Skip cell for spanned rows */}
                {!isFirst && !isSpanned && (
                  <td className={tdC}>
                    <input className={inp} value={r.category} onChange={(e) => onUpdateResult(i, "category", e.target.value)} />
                  </td>
                )}
                <td className={tdC}>
                  <input className={inp} value={r.riskType} onChange={(e) => onUpdateResult(i, "riskType", e.target.value)} />
                </td>
                <td className={`${td} align-top`}>
                  <AutoTextarea className={txtInp} value={r.hazardDescription} onChange={(v) => onUpdateResult(i, "hazardDescription", v)} />
                </td>
                <td className={`${td} align-top`}>
                  <AutoTextarea className={txtInp} value={r.currentMeasure} onChange={(v) => onUpdateResult(i, "currentMeasure", v)} />
                </td>
                <td className={tdC}>
                  <input type="number" min={1} max={4} className={inp} value={r.currentFrequency} onChange={(e) => onUpdateResult(i, "currentFrequency", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} />
                </td>
                <td className={tdC}>
                  <input type="number" min={1} max={4} className={inp} value={r.currentSeverity} onChange={(e) => onUpdateResult(i, "currentSeverity", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} />
                </td>
                <td className={tdC}>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getGradeColor(curRisk)}`}>{curRisk}</span>
                </td>
                <td className={`${td} align-top`}>
                  <textarea className={txtInp} value={r.improvementMeasure} onChange={(e) => { onUpdateResult(i, "improvementMeasure", e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} onFocus={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }} rows={2} />
                </td>
                <td className={tdC}>
                  <input type="number" min={1} max={4} className={inp} value={r.improvedFrequency} onChange={(e) => onUpdateResult(i, "improvedFrequency", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} />
                </td>
                <td className={tdC}>
                  <input type="number" min={1} max={4} className={inp} value={r.improvedSeverity} onChange={(e) => onUpdateResult(i, "improvedSeverity", Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} />
                </td>
                <td className={tdC}>
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${getGradeColor(impRisk)}`}>{impRisk}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Bottom Section: Photos + Education + Signatures */}
      <table className="w-full border-collapse border border-slate-400 -mt-px">
        <thead>
          <tr>
            <th className={`${th} w-[250px]`}>관련 사진</th>
            <th className={th}>위험성평가 교육 내용</th>
            <th className={`${th} w-[350px]`}>교육 명단</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-400 p-0 align-top">
              <div className={`flex ${validImages.length === 2 ? 'flex-row' : 'flex-col'} min-h-[200px] h-full`}>
                {validImages.length > 0 ? validImages.map((img, i) => (
                  <img key={i} src={img} alt={`현장사진${i + 1}`} className={`${validImages.length === 2 ? 'w-1/2' : 'w-full'} h-[200px] object-cover`} />
                )) : (
                  <div className="text-xs text-slate-400 text-center py-8 w-full flex items-center justify-center">업로드된 사진 없음</div>
                )}
              </div>
            </td>
            <td className="border border-slate-400 p-0 align-top">
              <textarea
                className="w-full h-full min-h-[200px] text-xs p-3 border-0 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                value={educationContent}
                onChange={(e) => setEducationContent(e.target.value)}
              />
            </td>
            <td className="border border-slate-400 p-0 align-top">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">이름</th>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">서명</th>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">이름</th>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">서명</th>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">이름</th>
                    <th className="border border-slate-300 py-1 px-2 text-[10px] font-bold bg-slate-50 w-1/6">서명</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                      <td className="border border-slate-300 py-2 px-2 text-xs">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
