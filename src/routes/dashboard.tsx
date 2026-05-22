import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, TrendingUp, TrendingDown, ShoppingBag, X, MoreVertical, Pencil, Trash2, UserCircle, ChevronDown, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type TransactionType = "receita" | "custo" | "despesa";

type Category = {
  id: string;
  name: string;
  type: TransactionType;
};

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  category_id: string | null;
  categories: { name: string } | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>("receita");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [useCalc, setUseCalc] = useState(false);
  const [qty, setQty] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [amountValue, setAmountValue] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single()
      .then(({ data }) => { if (data) setProfileName(data.name); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, currentDate]);

  function mesAnterior() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function mesSeguinte() {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
  };

  const mesLabel = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  async function loadData() {
    setLoadingData(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const [{ data: txs }, { data: cats }] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, categories(name)")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setTransactions((txs as Transaction[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setLoadingData(false);
  }

  function openNew() {
    setEditingTx(null);
    setSelectedType("receita");
    setUseCalc(false);
    setQty("");
    setUnitPrice("");
    setAmountValue("");
    setShowModal(true);
  }

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setSelectedType(tx.type);
    setUseCalc(false);
    setQty("");
    setUnitPrice("");
    setAmountValue(String(tx.amount));
    setOpenMenuId(null);
    setShowModal(true);
  }

  function handleCalcChange(newQty: string, newUnitPrice: string) {
    setQty(newQty);
    setUnitPrice(newUnitPrice);
    const q = parseFloat(newQty);
    const p = parseFloat(newUnitPrice.replace(",", "."));
    if (!isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setAmountValue((q * p).toFixed(2));
    } else {
      setAmountValue("");
    }
  }

  async function handleDelete(id: string) {
    setOpenMenuId(null);
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Lançamento excluído");
    loadData();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = parseFloat((fd.get("amount") as string).replace(",", "."));
    const description = (fd.get("description") as string).trim();
    const category_id = fd.get("category_id") as string;
    const date = fd.get("date") as string;

    if (isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    setSaving(true);
    let error;

    if (editingTx) {
      ({ error } = await supabase.from("transactions").update({
        type: selectedType,
        amount,
        description: description || null,
        category_id: category_id || null,
        date,
      }).eq("id", editingTx.id));
    } else {
      ({ error } = await supabase.from("transactions").insert({
        user_id: user!.id,
        type: selectedType,
        amount,
        description: description || null,
        category_id: category_id || null,
        date,
      }));
    }

    setSaving(false);
    if (error) { toast.error("Erro ao salvar lançamento"); return; }
    toast.success(editingTx ? "Lançamento atualizado!" : "Lançamento salvo!");
    setShowModal(false);
    setEditingTx(null);
    loadData();
  }

  const totals = {
    receita: transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0),
    custo:   transactions.filter(t => t.type === "custo").reduce((s, t) => s + t.amount, 0),
    despesa: transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
  };
  const saldo = totals.receita - totals.custo - totals.despesa;
  const margem = totals.receita > 0 ? (saldo / totals.receita) * 100 : 0;
  const filteredCategories = categories.filter(c => c.type === selectedType);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => setOpenMenuId(null)}>
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-green-700">Meu Negócio Fácil</h1>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            <UserCircle className="h-5 w-5 text-green-600" />
            <span>{profileName || user.email}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border bg-white shadow-lg py-1">
              <Link
                to="/perfil"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <UserCircle className="h-4 w-4 text-gray-400" /> Meu Perfil
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Seletor de mês */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <button onClick={mesAnterior} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-gray-700 capitalize">{mesLabel}</span>
          <button onClick={mesSeguinte} disabled={isCurrentMonth()} className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Receitas" value={totals.receita} color="green"  icon={<TrendingUp   className="h-5 w-5" />} />
          <SummaryCard label="Custos"   value={totals.custo}   color="orange" icon={<ShoppingBag  className="h-5 w-5" />} />
          <SummaryCard label="Despesas" value={totals.despesa} color="red"    icon={<TrendingDown className="h-5 w-5" />} />
          <SaldoMargemCard saldo={saldo} margem={margem} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Lançamentos</h2>
          <button
            onClick={e => { e.stopPropagation(); openNew(); }}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Novo
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <p className="text-sm text-gray-400">Nenhum lançamento ainda.</p>
            <button onClick={openNew} className="mt-3 text-sm font-semibold text-green-600 hover:underline">
              Adicionar o primeiro
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["receita", "custo", "despesa"] as TransactionType[]).map(type => {
              const group = transactions.filter(t => t.type === type);
              const columnStyle = {
                receita: { border: "border-green-200",  header: "bg-green-50 text-green-700",  badge: "bg-green-100 text-green-700"  },
                custo:   { border: "border-orange-200", header: "bg-orange-50 text-orange-700", badge: "bg-orange-100 text-orange-700" },
                despesa: { border: "border-red-200",    header: "bg-red-50 text-red-600",       badge: "bg-red-100 text-red-600"      },
              }[type];
              const label = { receita: "Receitas", custo: "Custos", despesa: "Despesas" }[type];

              return (
                <div key={type} className={`rounded-xl border ${columnStyle.border} bg-white overflow-hidden`}>
                  <div className={`px-4 py-2.5 ${columnStyle.header} font-semibold text-sm`}>
                    {label}
                  </div>
                  {group.length === 0 ? (
                    <p className="px-4 py-6 text-xs text-gray-400 text-center">Nenhum lançamento</p>
                  ) : (
                    <div className="divide-y">
                      {group.map(tx => (
                        <TransactionRow
                          key={tx.id}
                          tx={tx}
                          menuOpen={openMenuId === tx.id}
                          onToggleMenu={e => { e.stopPropagation(); setOpenMenuId(openMenuId === tx.id ? null : tx.id); }}
                          onEdit={() => openEdit(tx)}
                          onDelete={() => handleDelete(tx.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">
                {editingTx ? "Editar lançamento" : "Novo lançamento"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditingTx(null); }}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form key={editingTx?.id ?? "new"} onSubmit={handleSubmit} className="space-y-4">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                {(["receita", "custo", "despesa"] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedType(t)}
                    className={`flex-1 py-2 capitalize transition-colors ${
                      selectedType === t
                        ? t === "receita" ? "bg-green-600 text-white"
                          : t === "custo" ? "bg-orange-500 text-white"
                          : "bg-red-500 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                  <button
                    type="button"
                    onClick={() => { setUseCalc(!useCalc); setQty(""); setUnitPrice(""); setAmountValue(editingTx ? String(editingTx.amount) : ""); }}
                    className="text-xs text-green-600 hover:underline"
                  >
                    {useCalc ? "Digitar valor direto" : "Calcular por quantidade"}
                  </button>
                </div>

                {useCalc ? (
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={qty}
                          onChange={e => handleCalcChange(e.target.value, unitPrice)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <p className="mt-0.5 text-xs text-gray-400">Quantidade</p>
                      </div>
                      <div className="flex items-start pt-2 text-gray-400 font-bold">×</div>
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0,00"
                          value={unitPrice}
                          onChange={e => handleCalcChange(qty, e.target.value)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <p className="mt-0.5 text-xs text-gray-400">Valor unitário</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm font-bold text-green-700">
                        {amountValue ? formatBRL(parseFloat(amountValue)) : "—"}
                      </span>
                    </div>
                    <input type="hidden" name="amount" value={amountValue} />
                  </div>
                ) : (
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amountValue}
                    onChange={e => setAmountValue(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Descrição <span className="text-gray-400">(opcional)</span></label>
                <input
                  name="description"
                  type="text"
                  placeholder="Ex: Pagamento cliente X"
                  defaultValue={editingTx?.description ?? ""}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <select
                  name="category_id"
                  defaultValue={editingTx?.category_id ?? ""}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Sem categoria</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Data</label>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={editingTx?.date ?? new Date().toISOString().split("T")[0]}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTx ? "Salvar alterações" : "Salvar"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const colorMap = {
  green:  { bg: "bg-green-50",  text: "text-green-700",  icon: "text-green-500"  },
  orange: { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-500" },
  red:    { bg: "bg-red-50",    text: "text-red-600",    icon: "text-red-500"    },
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   icon: "text-blue-500"   },
};

function SummaryCard({ label, value, color, icon }: {
  label: string;
  value: number;
  color: keyof typeof colorMap;
  icon: React.ReactNode;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl p-4 ${c.bg}`}>
      <div className={`mb-2 ${c.icon}`}>{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-bold ${c.text} truncate`}>{formatBRL(value)}</p>
    </div>
  );
}

function SaldoMargemCard({ saldo, margem }: { saldo: number; margem: number }) {
  const positivo   = saldo >= 0;
  const bg         = positivo ? "bg-blue-50"          : "bg-red-50";
  const textMain   = positivo ? "text-blue-700"        : "text-red-600";
  const iconColor  = positivo ? "text-blue-500"        : "text-red-500";
  const badgeColor = positivo ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600";
  const Seta       = positivo ? TrendingUp             : TrendingDown;
  return (
    <div className={`rounded-xl p-4 ${bg}`}>
      <div className={`mb-2 ${iconColor}`}><Seta className="h-5 w-5" /></div>
      <p className="text-xs text-gray-500">Saldo</p>
      <p className={`text-base font-bold ${textMain} truncate`}>{formatBRL(saldo)}</p>
      <span className={`mt-1 inline-block text-xs font-medium px-1.5 py-0.5 rounded-full ${badgeColor}`}>
        Margem {margem.toFixed(1)}%
      </span>
    </div>
  );
}


function TransactionRow({ tx, menuOpen, onToggleMenu, onEdit, onDelete }: {
  tx: Transaction;
  menuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const date = new Date(tx.date + "T12:00:00").toLocaleDateString("pt-BR");
  const title = tx.description || tx.categories?.name || "—";

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-gray-50">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        <p className="text-xs text-gray-400">{tx.categories?.name ? `${tx.categories.name} · ` : ""}{date}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <p className={`text-sm font-bold ${tx.type === "receita" ? "text-green-600" : "text-red-500"}`}>
          {tx.type === "receita" ? "+" : "-"}{formatBRL(tx.amount)}
        </p>

        <div className="relative">
          <button
            onClick={onToggleMenu}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-36 rounded-lg border bg-white shadow-lg py-1">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-400" /> Editar
              </button>
              <button
                onClick={onDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
