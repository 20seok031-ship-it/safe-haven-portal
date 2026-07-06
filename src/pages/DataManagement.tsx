import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, LogOut, Database, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { extractFileText } from "@/lib/fileExtract";

const ALLOWED_USERNAME = "i0215130";

type Material = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

export default function DataManagement() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<Material[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const email = data.user?.email ?? "";
      const uname = email.split("@")[0];
      if (!data.user || uname !== ALLOWED_USERNAME) {
        toast.error("접근 권한이 없습니다.");
        await supabase.auth.signOut();
        navigate("/login", { replace: true });
        return;
      }
      setChecking(false);
      loadItems();
    })();
  }, [navigate]);

  const loadItems = async () => {
    const { data, error } = await supabase
      .from("reference_materials")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Material[]);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("제목을 입력하세요.");
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;

      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let extractedText = "";
      if (file) {
        // Try to parse text from PDF/Excel/text file so AI can RAG over it.
        toast.info("파일 텍스트 추출 중...");
        extractedText = await extractFileText(file);

        const path = `${uid}/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("reference-materials").upload(path, file);
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from("reference-materials").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        fileUrl = signed?.signedUrl ?? null;
        fileName = file.name;
      }

      // Merge user-typed content with file-extracted text so both feed the AI context.
      const mergedContent = [content.trim(), extractedText.trim() ? `\n\n[첨부파일 추출 텍스트: ${fileName}]\n${extractedText.trim()}` : ""]
        .filter(Boolean)
        .join("");

      const { error } = await supabase.from("reference_materials").insert({
        uploaded_by: uid,
        title: title.trim(),
        description: description.trim() || null,
        content: mergedContent || null,
        file_url: fileUrl,
        file_name: fileName,
      });
      if (error) throw error;

      toast.success("데이터가 업로드되었습니다.");
      setTitle(""); setDescription(""); setContent(""); setFile(null);
      loadItems();
    } catch (err: any) {
      toast.error(err.message ?? "업로드 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const { error } = await supabase.from("reference_materials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("삭제되었습니다.");
    loadItems();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  if (checking) return <main className="min-h-screen flex items-center justify-center">확인 중...</main>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to="/risk-assessment" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900">
            <ArrowLeft className="w-4 h-4" /> 위험성평가로
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> 로그아웃
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">데이터 관리</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            여기 업로드한 자료(제목·설명·본문 텍스트)는 이후 <b>수시 위험성평가</b>의 위험식별 시 AI 분석의 참고자료로 활용됩니다.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">제목 *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 프레스 가공 안전 지침" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">간단 설명</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자료 요약" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">본문 내용 (AI가 참고할 텍스트)</label>
              <Textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="법규, 사내 규정, 사고 사례, 체크리스트 등 AI에 참조시킬 텍스트를 붙여넣으세요." />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">첨부 파일 (선택)</label>
              <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-1" /> {saving ? "업로드 중..." : "업로드"}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">업로드된 자료 ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 업로드된 자료가 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="font-semibold text-slate-800 truncate">{it.title}</h3>
                    </div>
                    {it.description && <p className="text-sm text-muted-foreground mt-1">{it.description}</p>}
                    {it.content && <p className="text-xs text-slate-500 mt-2 line-clamp-3 whitespace-pre-wrap">{it.content}</p>}
                    <div className="text-xs text-slate-400 mt-2 flex gap-3">
                      <span>{new Date(it.created_at).toLocaleString("ko-KR")}</span>
                      {it.file_url && <a href={it.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{it.file_name ?? "파일"}</a>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(it.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
