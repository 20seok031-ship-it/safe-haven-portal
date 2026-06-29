import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Sparkles, RotateCcw, ClipboardList, Copy, FileSpreadsheet, ScanSearch, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface HazardItem {
  category: string;
  hazardSource: string;
  hazardFactor: string;
  currentMeasure: string;
  frequency: number;
  severity: number;
  improvementMeasure: string;
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
        canvas.width = w; canvas.height = h;
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

export default function HazardAnalysis() {
  const [imageData, setImageData] = useState<string>("");
  const [items, setItems] = useState<HazardItem[]>([]);
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

  const reset = () => { setImageData(""); setItems([]); };

  const analyze = async () => {
    if (!imageData) { toast.error("먼저 현장 사진을 업로드해주세요."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-risk", {
        body: { taskName: "현장 사진 위험요인 분석", imageBase64: imageData },
      });
      if (error) throw error;
      const mapped: HazardItem[] = (data?.results ?? []).map((r: any) => ({
        category: r.category ?? "",
        hazardSource: r.riskType ?? "",
        hazardFactor: r.hazardDescription ?? "",
        currentMeasure: r.currentMeasure ?? "",
        frequency: r.currentFrequency ?? 0,
        severity: r.currentSeverity ?? 0,
        improvementMeasure: r.improvementMeasure ?? "",
      }));
      setItems(mapped);
      if (mapped.length === 0) toast.warning("분석 결과가 비어있습니다.");
      else toast.success(`${mapped.length}건의 위험요인을 도출했습니다.`);
    } catch (e: any) {
      toast.error(e?.message || "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (items.length === 0) return;
    const head = "평가구분\t유해위험원인\t위험요인 및 재해형태\t현재 안전조치\t빈도\t강도\t위험도\t개선대책";
    const rows = items.map(i => [i.category, i.hazardSource, i.hazardFactor, i.currentMeasure, i.frequency, i.severity, i.frequency * i.severity, i.improvementMeasure].join("\t"));
    await navigator.clipboard.writeText([head, ...rows].join("\n"));
    toast.success("클립보드에 복사했습니다.");
  };

  const exportExcel = async () => {
    if (items.length === 0) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("위험요인");
    ws.columns = [
      { header: "평가구분", key: "category", width: 12 },
      { header: "유해위험원인", key: "hazardSource", width: 16 },
      { header: "위험요인 및 재해형태", key: "hazardFactor", width: 50 },
      { header: "현재 안전조치", key: "currentMeasure", width: 30 },
      { header: "빈도", key: "frequency", width: 6 },
      { header: "강도", key: "severity", width: 6 },
      { header: "위험도", key: "risk", width: 8 },
      { header: "개선대책", key: "improvementMeasure", width: 50 },
    ];
    items.forEach(i => ws.addRow({ ...i, risk: i.frequency * i.severity }));
    ws.getRow(1).font = { bold: true };
    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `현장위험요인_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const riskColor = (r: number) =>
    r >= 9 ? "bg-red-500 text-white" : r >= 5 ? "bg-amber-400 text-slate-900" : "bg-emerald-500 text-white";

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> 메인으로
        </Link>

        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-3">사진점검</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">현장 사진 위험요인 분석</h1>
          <p className="text-sm text-slate-500 mt-2">현장 사진을 촬영하거나 업로드하면 AI가 위험요인과 개선대책을 위험 계층 구조에 따라 정리합니다.</p>
        </div>

        <div className="rounded-2xl bg-white border border-blue-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 via-blue-500 to-sky-400" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Input */}
            <section>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-800 mb-4">
                <ImagePlus className="w-5 h-5 text-blue-600" /> 분석 입력
              </h2>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-blue-200 rounded-xl min-h-[320px] flex items-center justify-center bg-blue-50/40 hover:bg-blue-50 transition relative overflow-hidden"
              >
                {imageData ? (
                  <>
                    <img src={imageData} alt="업로드된 현장 사진" className="max-h-[360px] w-auto object-contain" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImageData(""); }}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 shadow"
                      aria-label="이미지 제거"
                    >
                      <X className="w-4 h-4 text-slate-700" />
                    </button>
                  </>
                ) : (
                  <div className="text-center px-6">
                    <ImagePlus className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                    <div className="font-semibold text-slate-700">현장 사진을 끌어오거나 클릭해서 선택</div>
                    <div className="text-xs text-slate-500 mt-1">jpg, png, webp 지원. 브라우저에서 먼저 모바일 전송용으로 축소합니다.</div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={analyze} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  위험요인 분석
                </Button>
                <Button variant="outline" onClick={reset} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <RotateCcw className="w-4 h-4" /> 초기화
                </Button>
              </div>
            </section>

            {/* Results */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <ClipboardList className="w-5 h-5 text-blue-600" /> 분석 결과
                </h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyText} disabled={items.length === 0} className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Copy className="w-3.5 h-3.5" /> 복사
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportExcel} disabled={items.length === 0} className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                  </Button>
                </div>
              </div>

              <div className="border border-blue-100 rounded-xl bg-blue-50/30 min-h-[360px] p-3">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center h-[340px] text-slate-400">
                    <ScanSearch className="w-10 h-10 mb-3" />
                    <p className="text-sm">사진을 선택한 뒤 분석을 실행하면 결과가 표시됩니다.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-blue-100 text-blue-900">
                          <th className="border border-blue-200 py-1.5 px-2">구분</th>
                          <th className="border border-blue-200 py-1.5 px-2">원인</th>
                          <th className="border border-blue-200 py-1.5 px-2">위험요인 및 재해형태</th>
                          <th className="border border-blue-200 py-1.5 px-2">현재 안전조치</th>
                          <th className="border border-blue-200 py-1.5 px-2">빈도</th>
                          <th className="border border-blue-200 py-1.5 px-2">강도</th>
                          <th className="border border-blue-200 py-1.5 px-2">위험도</th>
                          <th className="border border-blue-200 py-1.5 px-2">개선대책</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((it, i) => {
                          const risk = it.frequency * it.severity;
                          return (
                            <tr key={i} className="bg-white align-top">
                              <td className="border border-blue-100 py-1.5 px-2 text-center font-semibold whitespace-nowrap">{it.category}</td>
                              <td className="border border-blue-100 py-1.5 px-2 whitespace-nowrap">{it.hazardSource}</td>
                              <td className="border border-blue-100 py-1.5 px-2 leading-relaxed">{it.hazardFactor}</td>
                              <td className="border border-blue-100 py-1.5 px-2 leading-relaxed">{it.currentMeasure}</td>
                              <td className="border border-blue-100 py-1.5 px-2 text-center">{it.frequency}</td>
                              <td className="border border-blue-100 py-1.5 px-2 text-center">{it.severity}</td>
                              <td className="border border-blue-100 py-1.5 px-2 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded font-bold ${riskColor(risk)}`}>{risk}</span>
                              </td>
                              <td className="border border-blue-100 py-1.5 px-2 leading-relaxed">{it.improvementMeasure}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
