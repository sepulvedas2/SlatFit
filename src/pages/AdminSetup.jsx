import React, { useState } from "react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle, Database } from "lucide-react";

export default function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const seedExercises = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await api.functions.invoke('seedExercises', {});
      
      if (response.data?.success) {
        setResult(response.data);
      } else {
        setError(response.data?.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err.message || 'Erro ao popular exercícios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuração do Sistema</h1>
          <p className="text-gray-400">Popule os dados permanentes do aplicativo</p>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Exercícios Permanentes
            </CardTitle>
            <CardDescription className="text-gray-400">
              Cria os exercícios padrão do aplicativo no banco de dados Supabase.
              Esses dados persistem permanentemente e ficam disponíveis para todos os usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={seedExercises} 
              disabled={loading}
              className="w-full"
              style={{ background: "linear-gradient(135deg, #FFFDEE 0%, #E3EF26 100%)", color: "#080626" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Populando exercícios...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Popular Exercícios no Banco
                </>
              )}
            </Button>

            {result && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-400 font-semibold">{result.message}</p>
                    <p className="text-green-300 text-sm mt-1">
                      Total de exercícios: {result.count}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-semibold">Erro</p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                <strong>Importante:</strong> Execute esta operação apenas uma vez. 
                Se os exercícios já existirem, esta função não fará nada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}