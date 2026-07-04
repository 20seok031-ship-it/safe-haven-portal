import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/data-management", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = `${username.trim()}@app.local`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    toast.success("로그인되었습니다.");
    navigate("/data-management", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white p-6">
      <div className="max-w-md mx-auto">
        <Link to="/risk-assessment" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mb-4">
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </Link>
        <div className="bg-white rounded-xl border border-border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">데이터 관리 로그인</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">아이디</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="아이디" autoComplete="username" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">비밀번호</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
