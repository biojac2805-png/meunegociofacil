import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { TrendingUp, PieChart, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
          <Zap className="h-4 w-4" /> Para autônomos e MEIs
        </div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-gray-900">
          Meu Negócio <span className="text-green-600">Fácil</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          Controle financeiro simples para quem trabalha por conta própria. Entenda seus custos, despesas e lucros sem complicação.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/cadastro"
            className="rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Começar agora — é grátis
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm text-left">
            <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Lançamentos simples</h3>
            <p className="mt-1 text-sm text-gray-500">Registre receitas, custos e despesas em segundos.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm text-left">
            <PieChart className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Dashboard visual</h3>
            <p className="mt-1 text-sm text-gray-500">Veja para onde vai seu dinheiro com gráficos claros.</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm text-left">
            <Zap className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Feito para você</h3>
            <p className="mt-1 text-sm text-gray-500">Sem planilhas, sem complicação. Só o essencial.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
