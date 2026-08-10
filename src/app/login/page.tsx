import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <div className="text-7xl mb-4 animate-pulse">🌿</div>
        <h1 className="text-3xl font-bold tracking-tight">G-Tracker</h1>
        <p className="text-muted mt-2">members only. what&apos;s the magic number?</p>
      </div>
      <LoginForm />
    </main>
  );
}
