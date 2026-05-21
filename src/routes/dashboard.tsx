import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-700">Meu Negócio Fácil</h1>
        <button onClick={() => signOut()} className="text-sm text-gray-500 hover:text-gray-800">Sair</button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-gray-500">Dashboard em construção... 🚧</p>
      </main>
    </div>
  );
}
