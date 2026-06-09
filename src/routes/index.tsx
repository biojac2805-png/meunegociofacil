import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  TrendingUp, TrendingDown, Wallet, ChefHat, Scissors,
  Briefcase, Wrench, CheckCircle, ArrowRight, Zap, BarChart2, ShieldCheck, Download,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 shadow-sm">
              <span className="text-sm font-extrabold text-white">R$</span>
            </div>
            <span className="text-lg font-bold text-green-700">Meu Negócio Fácil</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors">
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-white px-6 py-24 text-center overflow-hidden">
        {/* Marca d'água — gráfico de barras */}
        <svg
          viewBox="0 0 800 400"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[
            { x: 40,  h: 120 },
            { x: 140, h: 200 },
            { x: 240, h: 160 },
            { x: 340, h: 280 },
            { x: 440, h: 220 },
            { x: 540, h: 320 },
            { x: 640, h: 260 },
            { x: 740, h: 380 },
          ].map(({ x, h }, i) => (
            <rect key={i} x={x} y={400 - h} width="70" height={h} rx="8" fill="#16a34a" opacity="0.06" />
          ))}
        </svg>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-700">
            <Zap className="h-4 w-4" /> Gratuito para autônomos e MEIs
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Seu negócio organizado,<br />
            <span className="text-green-600">seu lucro visível</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Anote suas receitas, custos e despesas em segundos. Veja seu saldo na hora. Sem planilha, sem complicação.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/cadastro"
              className="rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              Começar agora — é grátis
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Já tenho conta
            </Link>
            {!installed && installPrompt && (
              <button
                onClick={handleInstall}
                className="rounded-xl border border-green-300 bg-green-50 px-8 py-4 text-lg font-semibold text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" /> Instalar app
              </button>
            )}
            {installed && (
              <p className="self-center text-sm text-green-600 font-medium">App instalado!</p>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-400">
            No iPhone: toque em <span className="font-medium">Compartilhar</span> → <span className="font-medium">Adicionar à Tela de Início</span>
          </p>
        </div>
      </section>

      {/* Para quem é */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">Para quem é</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
            Feito para quem trabalha por conta própria
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <AudienceCard icon={<ChefHat className="h-8 w-8" />} label="Quem vende comida" example="Quentinhas, doces, salgados" />
            <AudienceCard icon={<Scissors className="h-8 w-8" />} label="Beleza & estética" example="Manicure, cabelereiro, depilação" />
            <AudienceCard icon={<Wrench className="h-8 w-8" />} label="Serviços gerais" example="Eletricista, diarista, pintor" />
            <AudienceCard icon={<Briefcase className="h-8 w-8" />} label="Profissional liberal" example="Freelancer, consultor, MEI" />
          </div>
        </div>
      </section>

      {/* Problema x Solução */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">Você se identifica?</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">Situações que acontecem todo dia</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <ProblemCard
              problem="Vendeu bastante no mês mas não sabe quanto sobrou"
              solution="Veja seu saldo atualizado em tempo real"
            />
            <ProblemCard
              problem="Mistura o dinheiro do negócio com o pessoal"
              solution="Separa receitas, custos e despesas por categoria"
            />
            <ProblemCard
              problem="Abre planilha mas abandona depois de alguns dias"
              solution="Lança em segundos pelo celular ou computador"
            />
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">Como funciona</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-14">Simples assim</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <StepCard
              number="1"
              title="Cadastre-se grátis"
              description="Crie sua conta em menos de 1 minuto. Sem cartão de crédito."
            />
            <StepCard
              number="2"
              title="Lance seus movimentos"
              description="Receitas de vendas, custos com ingredientes, despesas do negócio."
            />
            <StepCard
              number="3"
              title="Veja onde está seu dinheiro"
              description="Dashboard atualizado na hora com saldo, totais e histórico."
            />
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="px-6 py-20 bg-green-50">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-green-600 mb-3">Funcionalidades</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">Tudo que você precisa, nada que atrapalha</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              title="Receitas"
              description="Registre cada venda com categoria, valor e data. Veja o total do período."
            />
            <FeatureCard
              icon={<TrendingDown className="h-6 w-6 text-orange-500" />}
              title="Custos e despesas"
              description="Separe o que gasta para produzir (custo) do que gasta para operar (despesa)."
            />
            <FeatureCard
              icon={<Wallet className="h-6 w-6 text-blue-600" />}
              title="Saldo em tempo real"
              description="Saiba exatamente quanto sobrou: receitas menos custos e despesas."
            />
            <FeatureCard
              icon={<BarChart2 className="h-6 w-6 text-green-600" />}
              title="Categorias prontas"
              description="Ingredientes, embalagens, aluguel, energia — tudo organizado para você."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-orange-500" />}
              title="Calculadora integrada"
              description="Vendeu 70 quentinhas a R$ 12? Digite a quantidade e o preço, pronto."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-blue-600" />}
              title="Dados seguros"
              description="Seus dados ficam na nuvem, acessíveis de qualquer dispositivo."
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-24 bg-green-600 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Comece a controlar seu negócio hoje
          </h2>
          <p className="mt-4 text-lg text-green-100">
            Gratuito, simples e feito para quem trabalha por conta própria.
          </p>
          <Link
            to="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-green-700 hover:bg-green-50 transition-colors shadow-sm"
          >
            Criar conta grátis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Meu Negócio Fácil · Para autônomos e MEIs
      </footer>

    </div>
  );
}

function AudienceCard({ icon, label, example }: { icon: React.ReactNode; label: string; example: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 flex justify-center text-green-600">{icon}</div>
      <p className="font-semibold text-gray-900 text-sm">{label}</p>
      <p className="mt-1 text-xs text-gray-400">{example}</p>
    </div>
  );
}

function ProblemCard({ problem, solution }: { problem: string; solution: string }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
      <p className="text-sm text-gray-500 leading-relaxed">"{problem}"</p>
      <div className="mt-4 flex items-start gap-2">
        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
        <p className="text-sm font-semibold text-gray-800">{solution}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white text-xl font-bold">
        {number}
      </div>
      <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-green-100">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
