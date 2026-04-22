import React, { useState, useRef, useCallback } from "react";
import { FileText, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import RiskResultsTable, { type RiskResult } from "./RiskResultsTable";

export default function SiteInfoForm() {
  const [assessType, setAssessType] = useState("");
  const [assessTarget, setAssessTarget] = useState("");
  const [assessDate, setAssessDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessRole, setAssessRole] = useState("");
  const [assessor, setAssessor] = useState("");
  const [processCategory, setProcessCategory] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<RiskResult[]>([]);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleImageUpload = (file: File, slot: number) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImages((prev) => {
          const next = [...prev];
          next[slot] = e.target?.result as string;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent, slot: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file, slot);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        const slot = uploadedImages[0] ? 1 : 0;
        if (file && slot < 2) handleImageUpload(file, slot);
      }
    }
  }, [uploadedImages]);

  const handleReset = () => {
    setAssessType("");
    setAssessTarget("");
    setAssessDate(new Date().toISOString().split("T")[0]);
    setAssessRole("");
    setAssessor("");
    setProcessCategory("");
    setTaskDescription("");
    setUploadedImages([]);
    setResults([]);
    toast.success("모든 입력이 초기화되었습니다.");
  };

  const handleAnalyze = async () => {
    const validImages = uploadedImages.filter(Boolean);
    if (validImages.length === 0) {
      toast.error("현장 이미지를 최소 1장 업로드해주세요.");
      return;
    }
    if (!assessType || !assessTarget || !assessRole || !assessor || !processCategory) {
      toast.error("모든 필수 항목을 채워주세요.");
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-risk", {
        body: {
          companyName: assessRole,
          siteName: assessTarget,
          companyType: assessType,
          processName: processCategory,
          taskName: taskDescription,
          imageBase64: validImages[0],
        },
      });

      if (error) throw error;

      if (data?.results && data.results.length > 0) {
        // Group by category: preserve first-seen order, then bring all same-category rows together
        const categoryOrder: string[] = [];
        const buckets = new Map<string, RiskResult[]>();
        for (const r of data.results as RiskResult[]) {
          const key = r.category || "기타";
          if (!buckets.has(key)) {
            buckets.set(key, []);
            categoryOrder.push(key);
          }
          buckets.get(key)!.push(r);
        }
        const grouped = categoryOrder.flatMap((k) => buckets.get(k)!);
        setResults(grouped);
        toast.success(`${grouped.length}개의 위험요인이 식별되었습니다.`);
      } else {
        toast.warning("분석 결과를 파싱하지 못했습니다. 다시 시도해주세요.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast.error(err.message || "위험 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateResult = (index: number, field: keyof RiskResult, value: string | number) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handlePrint = () => {
    if (results.length === 0) {
      toast.error("출력할 분석 결과가 없습니다.");
      return;
    }
    const report = document.getElementById("risk-report");
    if (!report) { window.print(); return; }

    const textareas = Array.from(report.querySelectorAll("textarea")) as HTMLTextAreaElement[];
    const origTextareaStyles = textareas.map((el) => ({
      height: el.style.height,
      overflow: el.style.overflow,
      minHeight: el.style.minHeight,
      maxHeight: el.style.maxHeight,
    }));
    textareas.forEach((el) => {
      el.style.overflow = "visible";
      el.style.minHeight = "0";
      el.style.maxHeight = "none";
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });

    const spinners = Array.from(report.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    const origTypes = spinners.map((el) => el.type);
    spinners.forEach((el) => { el.type = "text"; });

    const restore = () => {
      textareas.forEach((el, i) => {
        el.style.height = origTextareaStyles[i].height;
        el.style.overflow = origTextareaStyles[i].overflow;
        el.style.minHeight = origTextareaStyles[i].minHeight;
        el.style.maxHeight = origTextareaStyles[i].maxHeight;
      });
      spinners.forEach((el, i) => { el.type = origTypes[i]; });
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);

    requestAnimationFrame(() => {
      window.print();
    });
  };

  const assessTypeLabel = assessType === "industrial_accident" ? "산업재해 발생"
    : assessType === "new_equipment" ? "신규 장비 설치"
    : assessType === "new_process" ? "신규 공정 도입" : assessType;

  const handleExportExcel = async () => {
    if (results.length === 0) {
      toast.error("저장할 분석 결과가 없습니다.");
      return;
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("위험성평가");

    // Column widths
    ws.columns = [
      { width: 10 }, // A: 평가구분
      { width: 12 }, // B: 유해위험원인
      { width: 30 }, // C: 위험요인
      { width: 28 }, // D: 현재 안전 조치
      { width: 6 },  // E: 빈도
      { width: 6 },  // F: 강도
      { width: 8 },  // G: 위험도
      { width: 28 }, // H: 개선 대책
      { width: 6 },  // I: 빈도
      { width: 6 },  // J: 강도
      { width: 8 },  // K: 위험도
    ];

    const hdrFill: ExcelJS.FillPattern = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    const hdrFont: Partial<ExcelJS.Font> = { bold: true, size: 9 };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" }
    };
    const centerAlign: Partial<ExcelJS.Alignment> = { horizontal: "center", vertical: "middle", wrapText: true };

    // Row 1: Header info
    ws.mergeCells("A1:B1");
    ws.getCell("A1").value = `평가직: ${assessRole}`;
    ws.mergeCells("C1:H1");
    ws.getCell("C1").value = `수시 위험성평가 (${assessTypeLabel} : ${assessTarget})`;
    ws.getCell("C1").alignment = { horizontal: "center", vertical: "middle" };
    ws.getCell("C1").font = { bold: true, size: 14 };
    ws.mergeCells("I1:K1");
    ws.getCell("I1").value = `평가자: ${assessor}`;

    // Row 2
    ws.mergeCells("A2:B2");
    ws.getCell("A2").value = `공정구분: ${processCategory}`;
    ws.mergeCells("I2:K2");
    const curAvg = results.length > 0 ? (results.reduce((a, r) => a + r.currentFrequency * r.currentSeverity, 0) / results.length).toFixed(2) : "0";
    const impAvg = results.length > 0 ? (results.reduce((a, r) => a + r.improvedFrequency * r.improvedSeverity, 0) / results.length).toFixed(2) : "0";
    ws.getCell("I2").value = `평균위험도 현재:${curAvg} / 개선후:${impAvg}`;

    // Row 3
    ws.mergeCells("A3:B3");
    ws.getCell("A3").value = `평가일시: ${assessDate}`;

    // Style rows 1-3
    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 11; c++) {
        const cell = ws.getCell(r, c);
        cell.border = thinBorder;
        cell.font = cell.font?.bold ? cell.font : { size: 9 };
      }
    }

    // Row 4-5: Table headers
    const headers1 = ["평가구분", "유해위험원인", "위험요인 및 재해형태", "현재 안전 조치", "현재 위험도", "", "", "개선 대책", "개선후위험도", "", ""];
    const headers2 = ["", "", "", "", "빈도", "강도", "위험도", "", "빈도", "강도", "위험도"];

    ws.addRow(headers1);
    ws.addRow(headers2);

    // Merge header cells
    ws.mergeCells("A4:A5"); ws.mergeCells("B4:B5"); ws.mergeCells("C4:C5"); ws.mergeCells("D4:D5");
    ws.mergeCells("E4:G4"); ws.mergeCells("H4:H5"); ws.mergeCells("I4:K4");

    for (let r = 4; r <= 5; r++) {
      for (let c = 1; c <= 11; c++) {
        const cell = ws.getCell(r, c);
        cell.fill = hdrFill;
        cell.font = hdrFont;
        cell.alignment = centerAlign;
        cell.border = thinBorder;
      }
    }

    // Data rows with category merging
    let dataStartRow = 6;
    let i = 0;
    while (i < results.length) {
      let j = i + 1;
      while (j < results.length && results[j].category === results[i].category) j++;
      const spanCount = j - i;

      for (let k = i; k < j; k++) {
        const r = results[k];
        const curRisk = r.currentFrequency * r.currentSeverity;
        const impRisk = r.improvedFrequency * r.improvedSeverity;
        const row = ws.addRow([
          k === i ? r.category : "",
          r.riskType,
          r.hazardDescription,
          r.currentMeasure,
          r.currentFrequency,
          r.currentSeverity,
          curRisk,
          r.improvementMeasure,
          r.improvedFrequency,
          r.improvedSeverity,
          impRisk,
        ]);

        for (let c = 1; c <= 11; c++) {
          const cell = row.getCell(c);
          cell.border = thinBorder;
          cell.font = { size: 9 };
          cell.alignment = c <= 2 || (c >= 5 && c <= 7) || (c >= 9 && c <= 11) ? centerAlign : { vertical: "middle", wrapText: true };
        }

        // Color-code risk cells
        const colorRisk = (cell: ExcelJS.Cell, score: number) => {
          if (score >= 9) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEF4444" } };
          else if (score >= 5) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFACC15" } };
          else cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF22C55E" } };
          cell.font = { size: 9, bold: true, color: { argb: score >= 5 && score < 9 ? "FF1E293B" : "FFFFFFFF" } };
        };
        colorRisk(row.getCell(7), curRisk);
        colorRisk(row.getCell(11), impRisk);
      }

      if (spanCount > 1) {
        const startR = dataStartRow + i;
        ws.mergeCells(startR, 1, startR + spanCount - 1, 1);
      }
      i = j;
    }

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `위험성평가_${assessDate}.xlsx`);
    toast.success("Excel 파일이 다운로드되었습니다.");
  };

  const renderUploadSlot = (slot: number) => {
    const img = uploadedImages[slot];
    if (img) {
      return (
        <div className="relative border-2 border-slate-200 rounded-xl flex items-center justify-center min-h-[200px] bg-slate-50/50">
          <img src={img} alt={`현장 이미지 ${slot + 1}`} className="max-h-[180px] object-contain rounded-lg" />
          <button
            onClick={() => removeImage(slot)}
            className="absolute top-2 right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors print:hidden"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      );
    }
    return (
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors min-h-[200px] bg-slate-50/50"
        onClick={() => fileInputRefs[slot].current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, slot)}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Upload className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">클릭, 붙여넣기(Ctrl+V), 또는 드래그</p>
        <p className="text-xs text-muted-foreground">PNG, JPG 등 이미지 파일 지원</p>
        <input
          ref={fileInputRefs[slot]}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file, slot);
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto" onPaste={handlePaste}>
      <div className="bg-white rounded-lg border border-blue-100 shadow-sm print:hidden">
        {/* Card title bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-blue-100 bg-[hsl(214_90%_97%)] rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 rounded-sm bg-blue-700" />
            <h2 className="text-base font-bold text-slate-800">수시 위험성평가</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white rounded-md px-4 h-8 text-xs font-semibold" onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (<><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />분석 중...</>) : "위험 식별"}
            </Button>
            <Button size="sm" variant="outline" className="rounded-md px-4 h-8 text-xs border-blue-200 text-slate-700 hover:bg-blue-50" onClick={handleExportExcel}>결과 저장</Button>
            <Button size="sm" variant="outline" className="rounded-md px-4 h-8 text-xs border-blue-200 text-slate-700 hover:bg-blue-50" onClick={handleReset}>결과 초기화</Button>
            <Button size="sm" variant="outline" className="rounded-md px-4 h-8 text-xs border-blue-200 text-slate-700 hover:bg-blue-50" onClick={handlePrint}>PDF 보고서</Button>
          </div>
        </div>

        <div className="p-6 md:p-8">

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">실시유형 <span className="text-red-500">*</span></label>
            <Select value={assessType} onValueChange={setAssessType}>
              <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="industrial_accident">산업재해 발생</SelectItem>
                <SelectItem value="new_equipment">신규 장비 설치</SelectItem>
                <SelectItem value="new_process">신규 공정 도입</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">평가대상 <span className="text-red-500">*</span></label>
            <Input placeholder="예시 : 산업재해명, 신규 장비명, 신규 공정명" value={assessTarget} onChange={(e) => setAssessTarget(e.target.value)} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">평가일시</label>
            <Input type="date" value={assessDate} onChange={(e) => setAssessDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">평가직 <span className="text-red-500">*</span></label>
            <Input placeholder="예시 : 생산 O팀, OOO직" value={assessRole} onChange={(e) => setAssessRole(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">평가자 <span className="text-red-500">*</span></label>
            <Input placeholder="예시 : OOO 직장 외 O명" value={assessor} onChange={(e) => setAssessor(e.target.value)} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-8 gap-y-5 mt-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">공정구분 <span className="text-red-500">*</span></label>
            <Input placeholder="예시 : 연마, Base 등" value={processCategory} onChange={(e) => setProcessCategory(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">작업내용</label>
            <Input placeholder="예시 : 금형 교체 작업, 프레스 가공 등" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-8">
          <label className="block text-sm font-semibold text-foreground mb-1">현장 이미지 <span className="text-red-500">*</span></label>
          <p className="text-xs text-muted-foreground mb-3">현장 사진 2장을 각각 1장씩 업로드할 수 있습니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderUploadSlot(0)}
            {renderUploadSlot(1)}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <RiskResultsTable
          results={results}
          formInfo={{ assessRole, processCategory, assessDate, assessor, assessTarget, assessType }}
          uploadedImages={uploadedImages}
          onUpdateResult={handleUpdateResult}
        />
      )}

      {isAnalyzing && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-12 max-w-[1200px] mx-auto flex flex-col items-center gap-4 print:hidden">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-sm text-muted-foreground">AI가 현장 사진을 분석하고 있습니다...</p>
          <p className="text-xs text-muted-foreground">약 10~30초 소요됩니다.</p>
        </div>
      )}
    </div>
  );
}
