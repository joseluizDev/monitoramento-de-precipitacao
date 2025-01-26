import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Calendar, CloudRain, Droplets, Loader2, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { utils, writeFile } from "xlsx";

export default function PluviometroApp() {
  const [pluviometro, setPluviometro] = useState("");
  const [dados, setDados] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  interface HistoricoItem {
    id: number;
    nome: string;
    dados: string;
    data: string;
  }

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pluviometros')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      setHistorico(data.map(item => ({
        id: item.id,
        nome: item.nome,
        dados: `${item.dados} mm`,
        data: item.data
      })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do servidor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarDados = async () => {
    if (pluviometro && dados && data) {
      try {
        setSaving(true);
        const { error } = await supabase
          .from('pluviometros')
          .insert([
            {
              nome: pluviometro,
              dados: parseFloat(dados),
              data: data
            }
          ]);

        if (error) throw error;

        toast({
          title: "Dados salvos",
          description: "Os dados foram salvos com sucesso.",
        });

        setPluviometro("");
        setDados("");
        setData(new Date().toISOString().split("T")[0]);
        carregarDados();
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar os dados.",
          variant: "destructive"
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const excluirDados = async (id: any) => {
    try {
      const { error } = await supabase
        .from('pluviometros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Dados excluídos",
        description: "Os dados foram excluídos com sucesso.",
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir dados:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir os dados.",
        variant: "destructive"
      });
    }
  };

  const historicoFiltrado = filtro
    ? historico.filter((item) =>
        item.nome.toLowerCase().includes(filtro.toLowerCase())
      )
    : historico;

  const nomesPluviometros = [...new Set(historico.map((item) => item.nome))];

  const exportarDados = () => {

    const workbook = utils.book_new();
    const result = utils.json_to_sheet(historicoFiltrado.map(item => ({
      ...item,
      dados: item.dados.replace(' mm', '')
    })));
    utils.book_append_sheet(workbook, result, "Histórico");
    writeFile(workbook, "historico_precipitacoes.xlsx");
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-100 to-blue-200 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col items-center justify-center mb-8 space-y-3 md:space-y-0 md:space-x-3 md:flex-row">
            <CloudRain className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 tracking-tight text-center">
              Monitoramento de Precipitação
            </h1>
          </div>

          <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-4 md:p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Droplets className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-blue-800">Adicionar Dados</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-blue-700">
                      Nome do Pluviômetro
                    </label>
                    <Input
                      value={pluviometro}
                      onChange={(e) => setPluviometro(e.target.value)}
                      placeholder="Digite o nome do pluviômetro"
                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-blue-700">
                      Dados de Precipitação (mm)
                    </label>
                    <Input
                      value={dados}
                      onChange={(e) => setDados(e.target.value)}
                      placeholder="Digite os dados de precipitação"
                      type="number"
                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-blue-700">
                      Data da Medição
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                      <Input
                        type="date"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={adicionarDados}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Dados"
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-4 md:p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Search className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl md:text-2xl font-bold text-blue-800">Filtrar</h2>
                </div>
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-blue-200 focus:border-blue-400 focus:ring focus:ring-blue-200 bg-white text-blue-800 font-medium shadow-sm"
                  disabled={loading}
                >
                  <option value="">Todos os Pluviômetros</option>
                  {nomesPluviometros.map((nome, index) => (
                    <option key={index} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6"
          >
            <Card className="p-4 md:p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-blue-800">Histórico de Precipitações</h2>
                <Button
                  onClick={exportarDados}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Exportar para Excel
                </Button>
              </div>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-blue-600">Carregando dados...</p>
                </div>
              ) : historicoFiltrado.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-blue-100">
                  <Table>
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-500 to-blue-600">
                        <th className="py-3 px-4 text-left text-white font-semibold">Pluviômetro</th>
                        <th className="py-3 px-4 text-left text-white font-semibold">Precipitação</th>
                        <th className="py-3 px-4 text-left text-white font-semibold">Data</th>
                        <th className="py-3 px-4 text-left text-white font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoFiltrado.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors duration-150"
                        >
                          <td className="py-3 px-4 text-blue-800">{item.nome}</td>
                          <td className="py-3 px-4 text-blue-800 font-medium">{item.dados}</td>
                          <td className="py-3 px-4 text-blue-800">{item.data}</td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => excluirDados(item.id)}
                              variant="destructive"
                              size="sm"
                              className="hover:bg-red-600 transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-blue-600">
                  <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Nenhum dado encontrado para o filtro aplicado.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
      <Toaster />
    </>
  );
}