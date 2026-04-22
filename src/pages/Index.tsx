import SiteInfoForm from "@/components/portal/SiteInfoForm";

export default function Index() {
  return (
    <main className="min-h-screen p-6 overflow-auto bg-slate-50 flex justify-center">
      <div className="w-full max-w-[1200px]">
        <SiteInfoForm />
      </div>
    </main>
  );
}
