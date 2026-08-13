// The tab bar lives in the jar/[jarId] layout — the picker page has no tabs.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-28">{children}</main>;
}
