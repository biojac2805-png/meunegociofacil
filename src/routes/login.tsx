import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("E-mail ou senha incorretos"); return; }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Entrar</h1>
        <p className="mt-1 text-sm text-gray-500">Acesse seu negócio</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input name="password" type="password" required className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold text-green-600 hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
