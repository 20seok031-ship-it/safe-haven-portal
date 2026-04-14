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
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RiskResult {
  no: number;
  hazard: string;
  measure: string;
  frequency: number;
  severity: number;
  grade: string;
}

export default function SiteInfoForm() {
  const [assessType, setAssessType] = useState("");
  const [assessTarget, setAssessTarget] = useState("");
  const [department, setDepartment] = useState("");
  const [processName, setProcessName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<RiskResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/") && uploadedImages.length < 2) {
      const reader = new FileReader();
      reader.onload = (e) =>
        setUploadedImages((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && uploadedImages.length < 2) handleImageUpload(file);
    },
    [uploadedImages.length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/") && uploadedImages.length < 2) {
          const file = item.getAsFile();
          if (file) handleImageUpload(file);
        }
      }
    },
    [uploadedImages.length]
  );

  const handleReset = () => {
    setAssessType("");
    setAssessTarget("");
    setDepartment("");
    setProcessName("");
    setTaskName("");
    setUploadedImages([]);
    setResults([]);
  };

  const handleAnalyze = async () => {
    if (uploadedImages.length === 0) {
      toast.error("현장 이미지를 최소 1장 업로드해주세요.");
      return;
    }
    if (!assessType || !assessTarget || !department || !processName || !taskName) {
      toast.error("모든 입력 항목을 채워주세요.");
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-risk", {
        body: {
          companyName: department,
          siteName: assessTarget,
          companyType: assessType,
          industry: "",
          region: "",
          processName,
          taskName,
          imageBase64: uploadedImages[0],
        },
      });

      if (error) throw error;

      if (data?.results && data.results.length > 0) {
        setResults(data.results);
        toast.success(`${data.results.length}개의 위험요인이 식별되었습니다.`);
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

  const getGradeColor = (grade: string) => {
    if (grade.includes("매우")) return "bg-red-100 text-red-800";
    if (grade.includes("고")) return "bg-orange-100 text-orange-800";
    if (grade.includes("중")) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">수시 위험성평가</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                "위험 식별"
              )}
            </Button>
            <Button variant="outline" className="rounded-full px-6">결과 저장</Button>
            <Button variant="outline" className="rounded-full px-6" onClick={handleReset}>결과 초기화</Button>
            <Button variant="outline" className="rounded-full px-6">PDF 보고서</Button>
          </div>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              실시유형 <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-sm font-semibold text-foreground mb-2">
              평가대상 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예시 : 산업재해명, 신규 장비명, 신규 공정명"
              value={assessTarget}
              onChange={(e) => setAssessTarget(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              소속 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예시 : 생산 O팀 OOO직"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              공정명 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예: 프레스 가공"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              작업명 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예: 금형 교체 작업"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
            />
          </div>
        </div>

        {/* Image Upload - full width below form */}
        <div className="mt-8">
          <label className="block text-sm font-semibold text-foreground mb-1">
            현장 이미지 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            현장 사진 최대 2장까지 업로드할 수 있습니다. 위험요인과 권고 조치안을 생성합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uploaded images */}
            {uploadedImages.map((img, i) => (
              <div
                key={i}
                className="relative border-2 border-slate-200 rounded-xl flex items-center justify-center min-h-[220px] bg-slate-50/50"
              >
                <img src={img} alt={`현장 이미지 ${i + 1}`} className="max-h-[200px] object-contain rounded-lg" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            ))}

            {/* Upload placeholder(s) */}
            {uploadedImages.length < 2 && (
              <div
                className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors min-h-[220px] bg-slate-50/50"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">클릭, 붙여넣기(Ctrl+V), 또는 드래그</p>
                <p className="text-xs text-muted-foreground">PNG, JPG 등 이미지 파일 지원</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">위험성 평가 결과</h2>
              <p className="text-sm text-muted-foreground">AI가 식별한 {results.length}개의 위험요인</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">No.</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">위험요인</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">감소대책</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 w-20">빈도</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 w-20">강도</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700 w-28">위험등급</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-medium">{r.no}</td>
                    <td className="py-3 px-4 text-slate-800">{r.hazard}</td>
                    <td className="py-3 px-4 text-slate-800">{r.measure}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{r.frequency}</td>
                    <td className="py-3 px-4 text-center font-medium text-slate-700">{r.severity}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getGradeColor(r.grade)}`}>
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-12 max-w-[1200px] mx-auto flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
          <p className="text-sm text-muted-foreground">AI가 현장 사진을 분석하고 있습니다...</p>
          <p className="text-xs text-muted-foreground">약 10~30초 소요됩니다.</p>
        </div>
      )}
    </div>
  );
}
