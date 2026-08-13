import BottomNav from "@/components/BottomNav";
import { getJars } from "@/lib/queries";

// Prerender every known jar's pages at build so navigation stays instant;
// jars created later stream on first visit and are cached from then on.
export async function generateStaticParams() {
  const jars = await getJars().catch(() => []);
  return jars.length > 0
    ? jars.map((j) => ({ jarId: j.id }))
    : // With cacheComponents, generateStaticParams must return ≥1 param —
      // this placeholder renders as notFound().
      [{ jarId: "00000000-0000-0000-0000-000000000000" }];
}

// Deliberately static: awaiting params here would block prerendering the
// whole segment. BottomNav derives the jar from the pathname client-side.
export default function JarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
