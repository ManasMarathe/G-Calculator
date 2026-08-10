import FloatingSmoke from "@/components/FloatingSmoke";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative overflow-hidden flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16">
      <FloatingSmoke />
      <div className="relative text-center">
        <div className="text-8xl mb-4 inline-block animate-bob">🍃</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">G-Tracker</h1>
        <p className="text-muted mt-2">members only. what&apos;s the magic number?</p>
      </div>
      <LoginForm />
    </main>
  );
}
