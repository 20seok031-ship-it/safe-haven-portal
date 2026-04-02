import React, { useState, useRef, useCallback } from "react";
import { FileText, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [companyName, setCompanyName] = useState("");
  const [siteName, setSiteName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [processName, setProcessName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [rememberInfo, setRememberInfo] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<RiskResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
      }
    }
  }, []);

  const handleReset = () => {
    setCompanyName("");
    setSiteName("");
    setCompanyType("");
    setIndustry("");
    setRegion("");
    setProcessName("");
    setTaskName("");
    setUploadedImage(null);
    setResults([]);
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) {
      toast.error("현장 이미지를 업로드해주세요.");
      return;
    }
    if (!companyName || !siteName || !processName || !taskName || !companyType || !region) {
      toast.error("필수 항목(*)을 모두 입력해주세요.");
      return;
    }

    setIsAnalyzing(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-risk", {
        body: {
          companyName,
          siteName,
          companyType,
          industry,
          region,
          processName,
          taskName,
          imageBase64: uploadedImage,
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
      <div className="bg-white rounded-xl border border-border shadow-sm p-8 max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">현장 정보 입력</h2>
          </div>
          <div className="flex items-center gap-2">
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
            <Button variant="outline" className="rounded-full px-6">
              결과 저장
            </Button>
            <Button variant="outline" className="rounded-full px-6" onClick={handleReset}>
              결과 초기화
            </Button>
            <Button variant="outline" className="rounded-full px-6">
              PDF 보고서
            </Button>
          </div>
        </div>

        {/* Body: form + image upload */}
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-x-8 gap-y-6">
          {/* Row 1 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              업체명 또는 협력사명 <span className="text-red-500">*</span>
            </label>
            <Input placeholder="예: ○○중공업" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              현장명 또는 사업장명 <span className="text-red-500">*</span>
            </label>
            <Input placeholder="예: 평택 2공장, A동 증축현장" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div className="row-span-4">
            <label className="block text-sm font-semibold text-foreground mb-1">
              현장 이미지 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              현장 사진 1장만으로 위험요인과 권고 조치안을 생성합니다.
            </p>
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors min-h-[280px] bg-slate-50/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              {uploadedImage ? (
                <img src={uploadedImage} alt="현장 이미지" className="max-h-[260px] object-contain rounded-lg" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">클릭, 붙여넣기(Ctrl+V), 또는 드래그</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG 등 이미지 파일 지원</p>
                </>
              )}
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
          </div>

          {/* Row 2 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              업체 유형 <span className="text-red-500">*</span>
            </label>
            <Select value={companyType} onValueChange={setCompanyType}>
              <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manufacturer">제조업</SelectItem>
                <SelectItem value="construction">건설업</SelectItem>
                <SelectItem value="service">서비스업</SelectItem>
                <SelectItem value="etc">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">업종</label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="metal">금속가공</SelectItem>
                <SelectItem value="chemical">화학</SelectItem>
                <SelectItem value="food">식품</SelectItem>
                <SelectItem value="electronics">전자</SelectItem>
                <SelectItem value="etc">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              지역 <span className="text-red-500">*</span>
            </label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="seoul">서울</SelectItem>
                <SelectItem value="gyeonggi">경기</SelectItem>
                <SelectItem value="incheon">인천</SelectItem>
                <SelectItem value="busan">부산</SelectItem>
                <SelectItem value="daegu">대구</SelectItem>
                <SelectItem value="gwangju">광주</SelectItem>
                <SelectItem value="daejeon">대전</SelectItem>
                <SelectItem value="ulsan">울산</SelectItem>
                <SelectItem value="sejong">세종</SelectItem>
                <SelectItem value="chungnam">충남</SelectItem>
                <SelectItem value="chungbuk">충북</SelectItem>
                <SelectItem value="jeonnam">전남</SelectItem>
                <SelectItem value="jeonbuk">전북</SelectItem>
                <SelectItem value="gyeongnam">경남</SelectItem>
                <SelectItem value="gyeongbuk">경북</SelectItem>
                <SelectItem value="gangwon">강원</SelectItem>
                <SelectItem value="jeju">제주</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">기억 옵션</label>
            <div className="flex items-start gap-2 mt-1">
              <Checkbox id="remember" checked={rememberInfo} onCheckedChange={(v) => setRememberInfo(v as boolean)} className="mt-0.5" />
              <div>
                <label htmlFor="remember" className="text-sm font-medium cursor-pointer">다음 방문에도 업체 정보를 자동 입력</label>
                <p className="text-xs text-muted-foreground mt-0.5">이 정보는 현재 브라우저에만 저장됩니다.</p>
              </div>
            </div>
          </div>

          {/* Row 4 */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              공정명 <span className="text-red-500">*</span>
            </label>
            <Input placeholder="예: 프레스 가공" value={processName} onChange={(e) => setProcessName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              작업명 <span className="text-red-500">*</span>
            </label>
            <Input placeholder="예: 금형 교체 작업" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-8 max-w-[1200px] mx-auto">
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

      {/* Loading overlay */}
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
