import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, UserCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    supabase.from("profiles").select("name, document").eq("id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setName(data.name ?? "");
          setDocument(data.document ?? "");
        }
        setLoadingData(false);
      });
  }, [user]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 2) { toast.error("Informe seu nome"); return; }

    setSaving(true);

    const [profileResult, emailResult] = await Promise.all([
      supabase.from("profiles").update({
        name: name.trim(),
        document: document.trim() || null,
      }).eq("id", user!.id),
      email.trim() !== user!.email
        ? supabase.auth.updateUser({ email: email.trim() })
        : Promise.resolve({ error: null }),
    ]);

    setSaving(false);

    if (profileResult.error) { toast.error("Erro ao salvar perfil"); return; }
    if (emailResult.error) { toast.error("Erro ao atualizar e-mail"); return; }

    if (email.trim() !== user!.email) {
      toast.success("Perfil salvo! Verifique o novo e-mail para confirmar a troca.");
    } else {
      toast.success("Perfil atualizado!");
    }
  }

  if (loading || loadingData) {
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
      </header>

      <main className="mx-auto max-w-md px-4 py-10">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
        </Link>

        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <UserCircle className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                CPF ou CNPJ <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={document}
                onChange={e => setDocument(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
              />
              <p className="mt-1 text-xs text-gray-400">Atualize caso tenha aberto um CNPJ</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-400">Se alterar, enviaremos um link de confirmação para o novo e-mail</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
