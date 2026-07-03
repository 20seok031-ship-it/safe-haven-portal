import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Sparkles,
  RotateCcw,
  Printer,
  ScanSearch,
  X,
  Loader2,
  Eye,
  Siren,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type RiskLevel = "낮음" | "보통" | "높음" | "매우높음" | string;

interface Controls {
  elimination: string[];
  substitution: string[];
  engineering: string[];
  isolation: string[];
  administrative: string[];
  ppe: string[];
}

interface Hazard {
  title: string;
  riskLevel: RiskLevel;
  frequency: number;
  severity: number;
  evidence: string;
  expectedOutcome: string;
  verification: string;
  controls: Controls;
}

interface Report {
  summary: string;
  observedFacts: string[];
  immediateActions: string[];
  hazards: Hazard[];
  limitations: string[];
  imageNote?: string;
}

interface Meta {
  model?: string;
  generatedAt?: string;
  imageNote?: string;
}

async function shrinkImage(file: File, maxSize = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const emptyControls: Controls = {
  elimination: [],
  substitution: [],
  engineering: [],
  isolation: [],
  administrative: [],
  ppe: [],
};

const CONTROL_STEPS: { key: keyof Controls; label: string }[] = [
  { key: "elimination", label: "1. 제거" },
  { key: "substitution", label: "2. 대체" },
  { key: "engineering", label: "3. 공학적 대책" },
  { key: "isolation", label: "4. 격리" },
  { key: "administrative", label: "5. 관리적 대책" },
  { key: "ppe", label: "6. PPE" },
];

function riskLevelStyle(level: RiskLevel) {
  switch (level) {
    case "매우높음":
      return "bg-red-100 text-red-700 border border-red-200";
    case "높음":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "보통":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "낮음":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

export default function HazardAnalysis() {
  const [imageData, setImageData] = useState<string>("");
  const [siteContext, setSiteContext] = useState<string>("");
  const [report, setReport] = useState<Report | null>(null);
  const [meta, setMeta] = useState<Meta>({});
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const data = await shrinkImage(file);
      setImageData(data);
    } catch {
      toast.error("이미지를 불러오지 못했습니다.");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const reset = () => {
    setImageData("");
    setSiteContext("");
    setReport(null);
    setMeta({});
  };

  const analyze = async () => {
    if (!imageData) {
      toast.error("먼저 현장 사진을 업로드해주세요.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-risk", {
        body: {
          taskName: "현장 사진 위험요인 분석",
          imageBase64: imageData,
          siteContext,
        },
      });
      if (error) throw error;
      const r: Report = {
        summary: data?.report?.summary ?? "",
        observedFacts: data?.report?.observedFacts ?? [],
        immediateActions: data?.report?.immediateActions ?? [],
        hazards: (data?.report?.hazards ?? []).map((h: any) => ({
          title: h.title ?? "",
          riskLevel: h.riskLevel ?? "보통",
          frequency: h.frequency ?? 0,
          severity: h.severity ?? 0,
          evidence: h.evidence ?? "",
          expectedOutcome: h.expectedOutcome ?? "",
          verification: h.verification ?? "",
          controls: { ...emptyControls, ...(h.controls ?? {}) },
        })),
        limitations: data?.report?.limitations ?? [],
        imageNote: data?.report?.imageNote ?? "",
      };
      setReport(r);
      setMeta(data?.meta ?? {});
      if (r.hazards.length === 0) toast.warning("분석 결과가 비어있습니다.");
      else toast.success(`${r.hazards.length}건의 위험요인을 도출했습니다.`);
    } catch (e: any) {
      toast.error(e?.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!report) {
      toast.error("먼저 위험요인 분석을 실행해주세요.");
      return;
    }
    window.print();
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> 메인으로
        </Link>

        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-3">
            사진점검
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            현장 위험요인 분석
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            현장 사진을 업로드하면 AI가 요약·확인된 사실·즉시 조치·6단계 감소대책을 카드 형태로 정리합니다.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-sky-400" />
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-6 md:p-8">
            {/* Input */}
            <section>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
                <ImagePlus className="w-5 h-5 text-blue-600" /> 분석 입력
              </h2>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-blue-200 rounded-xl min-h-[240px] flex items-center justify-center bg-blue-50/40 hover:bg-blue-50 transition relative overflow-hidden"
              >
                {imageData ? (
                  <>
                    <img
                      src={imageData}
                      alt="업로드된 현장 사진"
                      className="max-h-[280px] w-auto object-contain"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageData("");
                      }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow"
                      aria-label="이미지 제거"
                    >
                      <X className="w-4 h-4 text-slate-700" />
                    </button>
                  </>
                ) : (
                  <div className="text-center px-6">
                    <ImagePlus className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <div className="font-semibold text-slate-700">
                      현장 사진을 끌어오거나 클릭해서 선택
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      jpg, png, webp 지원. 업로드 전 자동 축소됩니다.
                    </div>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>

              <div className="mt-4">
                <Label htmlFor="site-context" className="text-sm font-semibold text-slate-800">
                  현장 설명
                </Label>
                <Textarea
                  id="site-context"
                  value={siteContext}
                  onChange={(e) => setSiteContext(e.target.value)}
                  placeholder="예시: 크레인 인양 작업 중, 사용하는 화학물질, 혼재 작업 가능성, 주변 고압선 위치함 등 사진만으로 파악하기 어려운 작업 정보나 위험 요소를 적어주시면 더 정확하게 분석합니다."
                  className="mt-2 min-h-[140px] border-blue-200 focus-visible:ring-blue-400 text-sm leading-relaxed"
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={analyze}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  위험요인 분석
                </Button>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <RotateCcw className="w-4 h-4" /> 초기화
                </Button>
              </div>
            </section>

            {/* Results */}
            <section>
              <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                  분석 결과
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    disabled={!report}
                    className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Printer className="w-3.5 h-3.5" /> 인쇄
                  </Button>
                </div>
              </div>


              {!report ? (
                <div className="border border-blue-100 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center text-center h-[360px] text-slate-400">
                  <ScanSearch className="w-10 h-10 mb-3" />
                  <p className="text-sm">사진을 선택한 뒤 분석을 실행하면 결과가 표시됩니다.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* 요약 */}
              <div id="hazard-print-report">
                {/* Print-only header: 사진 + 현장 설명 */}
                <div className="hidden print:block mb-4">
                  <div className="rounded-xl border border-slate-300 overflow-hidden">
                    <div className="grid grid-cols-2">
                      <div className="p-3 flex items-center justify-center bg-white border-r border-slate-300">
                        {imageData ? (
                          <img
                            src={imageData}
                            alt="현장 사진"
                            className="max-h-[240px] w-full object-contain"
                          />
                        ) : (
                          <div className="text-xs text-slate-400">사진 없음</div>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <div className="text-[11px] font-bold text-blue-700 mb-2">현장 설명</div>
                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {siteContext?.trim() || "(입력 없음)"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {report.summary && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 print:break-inside-avoid">
                    <div className="text-xs font-bold text-blue-800 mb-2">요약</div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {report.summary}
                    </p>
                  </div>
                )}


                  {/* 확인된 사실 */}
                  {report.observedFacts.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <Eye className="w-4 h-4 text-blue-600" /> 사진에서 확인된 사실
                      </h3>
                      <div className="space-y-2">
                        {report.observedFacts.map((f, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
                          >
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 즉시 조치 */}
                  {report.immediateActions.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <Siren className="w-4 h-4 text-red-500" /> 즉시 조치
                      </h3>
                      <div className="space-y-2">
                        {report.immediateActions.map((f, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 rounded-lg bg-white border border-red-100 px-4 py-2.5 text-sm text-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 위험요인 및 개선대책 */}
                  {report.hazards.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> 위험요인 및 개선대책
                      </h3>
                      <div className="space-y-4">
                        {report.hazards.map((h, i) => (
                          <article
                            key={i}
                            className="rounded-xl border border-slate-200 bg-white p-4 md:p-5"
                          >
                            <header className="flex items-start justify-between gap-3 mb-1">
                              <h4 className="text-sm md:text-base font-bold text-slate-900">
                                {i + 1}. {h.title}
                              </h4>
                              <span
                                className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${riskLevelStyle(
                                  h.riskLevel,
                                )}`}
                              >
                                {h.riskLevel}
                              </span>
                            </header>
                            <div className="text-xs text-slate-500 mb-3">
                              위험도 {h.frequency * h.severity} · 빈도 {h.frequency} × 강도 {h.severity}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                              {[
                                { label: "사전 근거", value: h.evidence },
                                { label: "예상 결과", value: h.expectedOutcome },
                                { label: "확인 방법", value: h.verification },
                              ].map((b) => (
                                <div
                                  key={b.label}
                                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
                                >
                                  <div className="text-[11px] font-bold text-slate-500 mb-1">
                                    {b.label}
                                  </div>
                                  <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {b.value || "-"}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {CONTROL_STEPS.map(({ key, label }) => {
                                const items = h.controls[key] ?? [];
                                return (
                                  <div
                                    key={key}
                                    className="rounded-lg border border-blue-100 bg-white p-3"
                                  >
                                    <div className="text-xs font-bold text-blue-700 mb-1.5">
                                      {label}
                                    </div>
                                    <ul className="space-y-1">
                                      {(items.length ? items : ["해당 없음 또는 현장 확인 필요"]).map(
                                        (c, ci) => (
                                          <li
                                            key={ci}
                                            className="text-xs text-slate-700 leading-relaxed pl-3 relative"
                                          >
                                            <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-blue-400" />
                                            {c}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 한계 및 추가 확인 */}
                  {report.limitations.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <Info className="w-4 h-4 text-slate-500" /> 한계 및 추가 확인
                      </h3>
                      <div className="space-y-2">
                        {report.limitations.map((f, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700"
                          >
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="pt-2 text-[11px] text-slate-400 text-right">
                    모델: {meta.model ?? "-"} · 생성:{" "}
                    {meta.generatedAt ? new Date(meta.generatedAt).toLocaleString() : "-"}
                    {meta.imageNote ? ` · 사진 조건: ${meta.imageNote}` : ""}
                  </div>
                </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
