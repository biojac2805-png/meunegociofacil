import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, ChevronUp } from "lucide-react";

type Transaction = {
  id: string;
  type: "receita" | "custo" | "despesa";
  amount: number;
  description: string | null;
  date: string;
  categories: { name: string } | null;
};

type MonthData = {
  mes: string;
  mesLabel: string;
  ano: number;
  receita: number;
  custo: number;
  despesa: number;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function VisaoGeral({ userId }: { userId: string }) {
  const [chartData, setChartData] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [lancamentosMes, setLancamentosMes] = useState<Transaction[]>([]);
  const [loadingMes, setLoadingMes] = useState(false);

  useEffect(() => {
    loadChartData();
  }, [userId]);

  async function loadChartData() {
    setLoading(true);
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
    const startStr = inicio.toISOString().split("T")[0];

    const { data } = await supabase
      .from("transactions")
      .select("type, amount, date")
      .gte("date", startStr)
      .order("date", { ascending: true });

    if (!data) { setLoading(false); return; }

    // Agrupa por mês
    const map: Record<string, MonthData> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = { mes: key, mesLabel: `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`, ano: d.getFullYear(), receita: 0, custo: 0, despesa: 0 };
    }

    for (const tx of data) {
      const key = tx.date.slice(0, 7);
      if (map[key]) {
        if (tx.type === "receita") map[key].receita += tx.amount;
        else if (tx.type === "custo") map[key].custo += tx.amount;
        else map[key].despesa += tx.amount;
      }
    }

    setChartData(Object.values(map));
    setLoading(false);
  }

  async function handleBarClick(mesKey: string) {
    if (mesSelecionado === mesKey) { setMesSelecionado(null); return; }
    setMesSelecionado(mesKey);
    setLoadingMes(true);

    const [year, month] = mesKey.split("-");
    const start = `${year}-${month}-01`;
    const end = new Date(parseInt(year), parseInt(month), 0).toISOString().split("T")[0];

    const { data } = await supabase
      .from("transactions")
      .select("*, categories(name)")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false });

    setLancamentosMes((data as Transaction[]) ?? []);
    setLoadingMes(false);
  }

  const mesAtivo = chartData.find(m => m.mes === mesSelecionado);
  const totalMes = mesAtivo ? {
    receita: mesAtivo.receita,
    custo: mesAtivo.custo,
    despesa: mesAtivo.despesa,
    saldo: mesAtivo.receita - mesAtivo.custo - mesAtivo.despesa,
  } : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border bg-white shadow-lg p-3 text-xs space-y-1">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-gray-500">{p.name}:</span>
            <span className="font-medium">{formatBRL(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-5 w-5 animate-spin text-green-600" />
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 text-center">Clique numa barra para ver os lançamentos do mês</p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barGap={2} onClick={(e) => { if (e?.activeLabel) { const item = chartData.find(m => m.mesLabel === e.activeLabel); if (item) handleBarClick(item.mes); }}}>
          <XAxis dataKey="mesLabel" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)", radius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="receita" name="Receitas" fill="#16a34a" radius={[4,4,0,0]} />
          <Bar dataKey="custo"   name="Custos"   fill="#f97316" radius={[4,4,0,0]} />
          <Bar dataKey="despesa" name="Despesas" fill="#ef4444" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Fatura do mês selecionado */}
      {mesSelecionado && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {/* Header da fatura */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b">
            <div>
              <p className="text-sm font-bold text-gray-800">
                Lançamentos — {mesAtivo?.mesLabel}
              </p>
              {totalMes && (
                <div className="flex gap-4 mt-1 text-xs text-gray-500">
                  <span className="text-green-600 font-medium">+{formatBRL(totalMes.receita)}</span>
                  <span className="text-orange-500 font-medium">-{formatBRL(totalMes.custo)}</span>
                  <span className="text-red-500 font-medium">-{formatBRL(totalMes.despesa)}</span>
                  <span className={`font-bold ${totalMes.saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    Saldo: {formatBRL(totalMes.saldo)}
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => setMesSelecionado(null)} className="text-gray-400 hover:text-gray-600">
              <ChevronUp className="h-5 w-5" />
            </button>
          </div>

          {/* Lista de lançamentos */}
          {loadingMes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-green-600" />
            </div>
          ) : lancamentosMes.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Nenhum lançamento neste mês</p>
          ) : (
            <div className="divide-y max-h-72 overflow-y-auto">
              {lancamentosMes.map(tx => {
                const badgeColor = tx.type === "receita" ? "bg-green-100 text-green-700" : tx.type === "custo" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-600";
                const typeLabel = tx.type === "receita" ? "Receita" : tx.type === "custo" ? "Custo" : "Despesa";
                const date = new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR");
                const title = tx.description || tx.categories?.name || "—";
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>{typeLabel}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
                        <p className="text-xs text-gray-400">{tx.categories?.name ? `${tx.categories.name} · ` : ""}{date}</p>
                      </div>
                    </div>
                    <p className={`shrink-0 ml-4 text-sm font-bold ${tx.type === "receita" ? "text-green-600" : "text-red-500"}`}>
                      {tx.type === "receita" ? "+" : "-"}{formatBRL(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
