import BottomNav from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-28">{children}</main>
      <BottomNav />
    </>
  );
}
