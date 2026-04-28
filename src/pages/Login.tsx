import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - accept any credentials
    sessionStorage.setItem("isAuthenticated", "true");
    navigate("/assessment");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-10 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">DN SOLUTIONS</h1>
          <p className="text-xs tracking-[0.3em] text-slate-500 mt-1">MACHINE GREATNESS</p>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm text-slate-700">사원번호 (Employee ID)</Label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="사원번호를 입력하세요"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-slate-700">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 mt-6 text-white font-semibold"
              style={{ backgroundColor: "#1E40AF" }}
            >
              로그인
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            © {new Date().getFullYear()} DN SOLUTIONS. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
