import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Loader2, Eye, EyeOff, TrendingUp, TrendingDown, Wallet, ArrowUpRight, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
  }

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
    <div className="flex min-h-screen">

      {/* Lado esquerdo — visual */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 left-1/3 h-80 w-80 rounded-full bg-white/5" />

        <div>
          <span className="text-2xl font-extrabold text-white">Meu Negócio Fácil</span>
          <p className="mt-2 text-green-200 text-sm">Para autônomos e MEIs</p>
        </div>

        <div className="space-y-4 z-10">
          <p className="text-white/70 text-xs uppercase tracking-widest font-semibold mb-6">Visão do seu negócio em tempo real</p>
          <div className="grid grid-cols-2 gap-3">
            <MockCard icon={<TrendingUp className="h-4 w-4" />} label="Receitas" value="R$ 3.840,00" color="bg-white/15" />
            <MockCard icon={<TrendingDown className="h-4 w-4" />} label="Custos" value="R$ 1.250,00" color="bg-white/15" />
            <MockCard icon={<Wallet className="h-4 w-4" />} label="Despesas" value="R$ 480,00" color="bg-white/15" />
            <MockCard icon={<ArrowUpRight className="h-4 w-4" />} label="Margem" value="54,4%" color="bg-emerald-500/30" highlight />
          </div>
          <div className="mt-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-white/60 mb-3">Lançamentos do mês</p>
            <div className="space-y-2">
              <MockRow label="Quentinhas · 70 un." value="+R$ 840,00" positive />
              <MockRow label="Ingredientes" value="-R$ 423,61" positive={false} />
              <MockRow label="Embalagens" value="-R$ 57,43" positive={false} />
            </div>
          </div>
        </div>

        <p className="text-white/60 text-sm z-10 italic">
          "Pare de perder dinheiro sem saber por quê."
        </p>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="mb-8 lg:hidden text-center">
            <span className="text-2xl font-extrabold text-green-700">Meu Negócio Fácil</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Bem-vinda de volta!</h1>
          <p className="mt-2 text-sm text-gray-500">Entre para acessar seu negócio</p>

          {/* Sobre o app */}
          <div className="mt-5 rounded-xl bg-green-50 border border-green-100 px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-green-700">O que é o Meu Negócio Fácil?</p>
            <p className="text-xs text-gray-500">Controle suas receitas, custos e despesas em segundos. Veja sua margem de lucro e saldo do mês sem planilhas.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <Link to="/recuperar-senha" className="text-xs text-green-600 hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-semibold text-green-600 hover:underline">Cadastre-se grátis</Link>
          </p>

          {/* Instalar app */}
          {!installed && installPrompt && (
            <button
              onClick={handleInstall}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 py-3 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
            >
              <Download className="h-4 w-4" /> Instalar app no dispositivo
            </button>
          )}

          {installed && (
            <p className="mt-6 text-center text-xs text-green-600 font-medium">App instalado com sucesso!</p>
          )}

          {/* Instrução manual para iOS */}
          <p className="mt-4 text-center text-xs text-gray-400">
            No iPhone: toque em <span className="font-medium">Compartilhar</span> → <span className="font-medium">Adicionar à Tela de Início</span>
          </p>

        </div>
      </div>
    </div>
  );
}

function MockCard({ icon, label, value, color, highlight = false }: {
  icon: React.ReactNode; label: string; value: string; color: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <div className="flex items-center gap-1.5 text-white/70 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-sm font-bold ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</p>
    </div>
  );
}

function MockRow({ label, value, positive }: { label: string; value: string; positive: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white/70">{label}</span>
      <span className={`text-xs font-semibold ${positive ? "text-emerald-300" : "text-red-300"}`}>{value}</span>
    </div>
  );
}
