import { Sidebar } from "@/components/sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="max-w-[1080px] flex-1 px-10 py-9">{children}</main>
    </div>
  );
}
