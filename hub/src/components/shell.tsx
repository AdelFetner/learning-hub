import { Sidebar } from "@/components/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="max-w-[1080px] flex-1 px-5 py-6 md:px-10 md:py-9">{children}</main>
    </div>
  );
}
