import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SiteInfoForm from "@/components/portal/SiteInfoForm";

export default function Index() {
  return (
    <main className="min-h-screen p-6 overflow-auto bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-[1200px] mx-auto [&_form]:bg-white [&_form]:shadow-sm [&_form]:rounded-xl">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 mb-4 print:hidden"
        >
          <ArrowLeft className="w-4 h-4" /> 메인으로
        </Link>
        <SiteInfoForm />
      </div>
    </main>
  );
}
