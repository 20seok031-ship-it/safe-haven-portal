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
      return next.filter(Boolean).length === 0 ? [] : next;
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent, slot: number) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file, slot);
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          const slot = uploadedImages[0] ? 1 : 0;
          if (file && slot < 2) handleImageUpload(file, slot);
        }
      }
    },
    [uploadedImages]
  );

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
          industry: "",
          region: "",
          processName: processCategory,
          taskName: taskDescription,
          imageBase64: validImages[0],
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

  const handleUpdateResult = (index: number, field: keyof RiskResult, value: string | number) => {
    setResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const renderUploadSlot = (slot: number) => {
    const img = uploadedImages[slot];
    if (img) {
      return (
        <div className="relative border-2 border-slate-200 rounded-xl flex items-center justify-center min-h-[200px] bg-slate-50/50">
          <img src={img} alt={`현장 이미지 ${slot + 1}`} className="max-h-[180px] object-contain rounded-lg" />
          <button
            onClick={() => removeImage(slot)}
            className="absolute top-2 right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
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

        {/* Row 1: 실시유형 + 평가대상 */}
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

        {/* Row 2: 평가일시 + 평가직 + 평가자 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 mt-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              평가일시
            </label>
            <div className="relative">
              <Input
                type="date"
                value={assessDate}
                onChange={(e) => setAssessDate(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              평가직 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예시 : 생산 O팀, OOO직"
              value={assessRole}
              onChange={(e) => setAssessRole(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              평가자 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예시 : OOO 직장 외 O명"
              value={assessor}
              onChange={(e) => setAssessor(e.target.value)}
            />
          </div>
        </div>

        {/* Row 3: 공정구분 + 작업내용 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-x-8 gap-y-5 mt-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              공정구분 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예시 : 연마, Base 등"
              value={processCategory}
              onChange={(e) => setProcessCategory(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              작업내용
            </label>
            <Input
              placeholder="예시 : 금형 교체 작업, 프레스 가공 등"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-8">
          <label className="block text-sm font-semibold text-foreground mb-1">
            현장 이미지 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            현장 사진 2장을 각각 1장씩 업로드할 수 있습니다. 위험요인과 권고 조치안을 생성합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderUploadSlot(0)}
            {renderUploadSlot(1)}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <RiskResultsTable
          results={results}
          formInfo={{ assessRole, processCategory, assessDate, assessor, assessTarget }}
          onUpdateResult={handleUpdateResult}
        />
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
