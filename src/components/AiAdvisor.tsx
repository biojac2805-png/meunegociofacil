import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  receitas: number;
  custos: number;
  despesas: number;
  margem: number;
  mes: string;
};

export function AiAdvisor({ receitas, custos, despesas, margem, mes }: Props) {
  const [aberto, setAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dicas, setDicas] = useState("");

  async function analisar() {
    if (dicas) { setAberto(!aberto); return; }
    setAberto(true);
    setLoading(true);

    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: { receitas, custos, despesas, margem, mes },
    });

    setLoading(false);
    if (error || !data?.dicas) {
      setDicas("Não foi possível gerar dicas no momento. Tente novamente.");
      return;
    }
    setDicas(data.dicas);
  }

  return (
    <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden">
      <button
        onClick={analisar}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Consultora IA</p>
            <p className="text-xs text-gray-400">Dicas personalizadas para o seu negócio</p>
          </div>
        </div>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
        ) : aberto ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {aberto && (
        <div className="px-5 pb-5 border-t border-purple-100">
          {loading ? (
            <div className="flex items-center gap-2 py-6 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
              <span className="text-sm text-gray-500">Analisando seu negócio...</span>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {dicas.split("\n").filter(l => l.trim()).map((linha, i) => (
                <p key={i} className="text-sm text-gray-700 leading-relaxed">{linha}</p>
              ))}
              <button
                onClick={() => { setDicas(""); setLoading(false); analisar(); }}
                className="mt-3 text-xs text-purple-600 hover:underline"
              >
                Gerar novas dicas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
