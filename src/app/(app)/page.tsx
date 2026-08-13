import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import FloatingSmoke from "@/components/FloatingSmoke";
import JarDeleteButton from "@/components/JarDeleteButton";
import JarForm from "@/components/JarForm";
import { stashGrams } from "@/lib/calc";
import { grams, inr } from "@/lib/format";
import { getEverything, getJars } from "@/lib/queries";

export default async function JarPicker() {
  "use cache";
  cacheLife("days");
  cacheTag("jar");
  const [jars, { purchases, seshes, sales }] = await Promise.all([
    getJars(),
    getEverything(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="relative overflow-hidden -mx-4 px-4 py-2">
        <FloatingSmoke />
        <div className="relative">
          <h1 className="font-display text-3xl font-extrabold">
            G-Tracker <span className="inline-block animate-bob">🍃</span>
          </h1>
          <p className="text-muted text-sm mt-1">pick a jar, any jar</p>
        </div>
      </header>

      {jars.length === 0 ? (
        <div className="rounded-3xl bg-surface border-2 border-edge shadow-sticker p-6 text-center">
          <div className="text-4xl mb-2 inline-block animate-bob">🫙</div>
          <p className="font-display font-bold">No jars yet</p>
          <p className="text-muted text-sm mt-1">every collection starts with one — name it below</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {jars.map((jar, i) => {
            const jp = purchases.filter((p) => p.jar_id === jar.id);
            const js = seshes.filter((s) => s.jar_id === jar.id);
            const jsl = sales.filter((s) => s.jar_id === jar.id);
            const stash = stashGrams(jp, js, jsl);
            const spent = jp.reduce((s, p) => s + p.total_cost, 0);
            return (
              <li
                key={jar.id}
                className={`rounded-3xl bg-surface border-2 border-edge shadow-sticker ${
                  i % 2 === 0 ? "rotate-1" : "-rotate-1"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-4">
                  <Link href={`/jar/${jar.id}`} className="flex flex-1 min-w-0 items-center gap-3">
                    <span className="text-3xl">{jar.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-lg truncate">{jar.name}</p>
                      <p className="text-xs text-muted">
                        {grams(stash)} inside · {js.length} sesh{js.length === 1 ? "" : "es"} ·{" "}
                        {inr(spent)} lifetime
                      </p>
                    </div>
                  </Link>
                  <JarDeleteButton id={jar.id} name={jar.name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <JarForm />
    </div>
  );
}
