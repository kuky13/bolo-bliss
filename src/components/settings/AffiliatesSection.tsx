import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, TrendingUp, RotateCcw, Trash2, Edit, Copy, CheckCircle2, Wallet, Award, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Affiliate } from "@/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export const AffiliatesSection = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [deleteAffiliate, setDeleteAffiliate] = useState<Affiliate | null>(null);
  const [resetAffiliate, setResetAffiliate] = useState<Affiliate | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    commissionRate: 0,
    active: true,
  });

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedAffiliates: Affiliate[] = data.map((affiliate) => ({
        id: affiliate.id,
        code: affiliate.code,
        name: affiliate.name,
        email: affiliate.email,
        commissionRate: affiliate.commission_rate || 0,
        active: affiliate.active,
        points: affiliate.points,
        totalSales: affiliate.total_sales,
        salesCount: affiliate.sales_count,
        storeId: affiliate.store_id,
        createdAt: affiliate.created_at,
        updatedAt: affiliate.updated_at,
        userId: affiliate.user_id,
        valedoceBalance: affiliate.valedoce_balance || 0,
      }));

      setAffiliates(mappedAffiliates);
    } catch (error) {
      console.error("Erro ao carregar afiliados:", error);
      toast.error("Erro ao carregar afiliados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const affiliateData = {
        code: formData.code.toLowerCase().trim(),
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        commission_rate: formData.commissionRate,
        active: formData.active,
        store_id: null,
      };

      if (editingAffiliate) {
        const { error } = await supabase
          .from("affiliates")
          .update(affiliateData)
          .eq("id", editingAffiliate.id);

        if (error) throw error;
        toast.success("Afiliado atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("affiliates")
          .insert([affiliateData]);

        if (error) throw error;
        toast.success("Afiliado criado com sucesso!");
      }

      setShowForm(false);
      resetForm();
      loadAffiliates();
    } catch (error: any) {
      console.error("Erro ao salvar afiliado:", error);
      if (error.code === "23505") {
        toast.error("Código já existe. Escolha um código único.");
      } else {
        toast.error("Erro ao salvar afiliado");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      code: affiliate.code,
      name: affiliate.name,
      email: affiliate.email || "",
      commissionRate: affiliate.commissionRate,
      active: affiliate.active,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteAffiliate) return;

    try {
      const { error } = await supabase
        .from("affiliates")
        .delete()
        .eq("id", deleteAffiliate.id);

      if (error) throw error;

      toast.success("Afiliado removido com sucesso!");
      setDeleteAffiliate(null);
      loadAffiliates();
    } catch (error) {
      console.error("Erro ao remover afiliado:", error);
      toast.error("Erro ao remover afiliado");
    }
  };

  const handleResetPoints = async () => {
    if (!resetAffiliate) return;

    try {
      const { error } = await supabase
        .from("affiliates")
        .update({ points: 0 })
        .eq("id", resetAffiliate.id);

      if (error) throw error;

      toast.success("Pontos resetados com sucesso!");
      setResetAffiliate(null);
      loadAffiliates();
    } catch (error) {
      console.error("Erro ao resetar pontos:", error);
      toast.error("Erro ao resetar pontos");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      email: "",
      commissionRate: 0,
      active: true,
    });
    setEditingAffiliate(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  const totalStats = affiliates.reduce(
    (acc, affiliate) => ({
      totalSales: acc.totalSales + affiliate.totalSales,
      totalPoints: acc.totalPoints + affiliate.points,
      totalAffiliates: acc.totalAffiliates + 1,
    }),
    { totalSales: 0, totalPoints: 0, totalAffiliates: 0 }
  );

  return (
    <TooltipProvider>
      <div className="space-y-8 p-1 animate-in fade-in zoom-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Sistema de Afiliados
            </h2>
            <p className="text-muted-foreground mt-1">
              Gerencie seus parceiros e acompanhe o desempenho.
            </p>
          </div>
          <Button onClick={handleCreateNew} className="btn-pop shadow-lg bg-[#FF1B8D] hover:opacity-90 text-white rounded-xl">
            <Plus className="w-5 h-5 mr-2" />
            Novo Afiliado
          </Button>
        </div>

        {/* Dialog Principal (Criação e Edição) */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[500px] glass-morphism border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {editingAffiliate ? "Editar Afiliado" : "Novo Afiliado"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="code" className="text-sm font-medium">Código do Afiliado *</Label>
                  <div className="relative">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: joao123"
                      required
                      className="pl-10 rounded-lg border-primary/20 focus:border-primary focus:ring-primary/20 bg-white/50"
                    />
                    <Award className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  {editingAffiliate && (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded text-xs mt-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Atenção: alterar o código quebrará links existentes.</span>
                    </div>
                  )}
                  {formData.code && !editingAffiliate && (
                    <p className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
                      <span className="font-semibold text-primary">URL:</span> {window.location.origin}/afiliado/{formData.code}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do afiliado"
                    required
                    className="rounded-lg border-primary/20 focus:border-primary focus:ring-primary/20 bg-white/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="rounded-lg border-primary/20 focus:border-primary focus:ring-primary/20 bg-white/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="commission">Taxa de Comissão (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="rounded-lg border-primary/20 focus:border-primary focus:ring-primary/20 bg-white/50"
                  />
                </div>

                <div className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-lg border border-border/50">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active" className="cursor-pointer">Afiliado Ativo</Label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all">
                  {editingAffiliate ? "Salvar Alterações" : "Criar Afiliado"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-morphism border-t-4 border-t-primary rounded-xl hover:translate-y-[-5px] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total de Afiliados</p>
                  <h3 className="text-3xl font-bold text-foreground">{totalStats.totalAffiliates}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-t-4 border-t-green-500 rounded-xl hover:translate-y-[-5px] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Vendas Totais</p>
                  <h3 className="text-3xl font-bold text-green-600">R$ {totalStats.totalSales.toFixed(2)}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-t-4 border-t-blue-500 rounded-xl hover:translate-y-[-5px] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Pontos Totais</p>
                  <h3 className="text-3xl font-bold text-blue-600">{totalStats.totalPoints}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Afiliados - Versão Mobile (Cards) */}
        <div className="md:hidden space-y-4">
          {affiliates.map((affiliate) => (
            <Card key={affiliate.id} className="glass-morphism overflow-hidden rounded-xl border border-secondary">
              <div className={cn("h-2 w-full", affiliate.active ? "bg-green-500" : "bg-gray-300")} />
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold truncate pr-2 flex-1">{affiliate.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-full transition-colors" onClick={() => handleEdit(affiliate)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Badge variant={affiliate.active ? "default" : "secondary"} className={cn("shrink-0", affiliate.active ? "bg-green-500/15 text-green-700 hover:bg-green-500/25" : "")}>
                    {affiliate.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between items-center mb-4 bg-secondary/50 p-2 rounded-lg">
                  <code className="text-sm font-mono text-primary font-bold">#{affiliate.code}</code>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(`${window.location.origin}/afiliado/${affiliate.code}`)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-secondary/30 p-2 rounded">
                    <span className="text-muted-foreground block text-xs">Vendas</span>
                    <span className="font-semibold">{affiliate.salesCount}</span>
                  </div>
                  <div className="bg-secondary/30 p-2 rounded">
                    <span className="text-muted-foreground block text-xs">Total</span>
                    <span className="font-semibold text-green-600">R$ {affiliate.totalSales.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    {affiliate.points} pts
                  </span>
                  <span>{affiliate.commissionRate}% Com.</span>
                </div>

                <div className="flex gap-2 border-t pt-3">
                  <Button variant="default" size="sm" className="flex-1 bg-primary text-white hover:bg-primary/90" onClick={() => handleEdit(affiliate)}>
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn("shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50", affiliate.points === 0 && "opacity-50")}
                    onClick={() => setResetAffiliate(affiliate)}
                    disabled={affiliate.points === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => setDeleteAffiliate(affiliate)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {affiliates.length === 0 && !isLoading && (
            <div className="text-center py-12 glass-morphism rounded-xl">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">Nenhum afiliado cadastrado.</p>
            </div>
          )}
        </div>

        {/* Tabela de Afiliados - Versão Desktop */}
        <Card className="hidden md:block glass-morphism overflow-hidden border-none shadow-xl rounded-2xl">
          <CardHeader className="bg-secondary/20 border-b border-border/50">
            <CardTitle>Listagem de Parceiros</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Total (R$)</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map((affiliate) => (
                  <TableRow key={affiliate.id} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono bg-background/50">{affiliate.code}</Badge>
                        <button onClick={() => copyToClipboard(`${window.location.origin}/afiliado/${affiliate.code}`)} className="text-muted-foreground hover:text-primary transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{affiliate.name}</div>
                      <div className="text-xs text-muted-foreground">{affiliate.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={affiliate.active ? "default" : "secondary"} className={cn(
                        affiliate.active ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : ""
                      )}>
                        {affiliate.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-medium">
                        <Award className="w-4 h-4 text-yellow-500" />
                        {affiliate.points}
                      </div>
                    </TableCell>
                    <TableCell>{affiliate.salesCount}</TableCell>
                    <TableCell className="font-medium text-green-600">R$ {affiliate.totalSales.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-primary/10 hover:text-primary rounded-full h-8 w-8"
                              onClick={() => handleEdit(affiliate)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Afiliado</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-blue-100 hover:text-blue-600 rounded-full h-8 w-8"
                              onClick={() => setResetAffiliate(affiliate)}
                              disabled={affiliate.points === 0}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Resetar Pontos</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-100 hover:text-destructive rounded-full h-8 w-8"
                              onClick={() => setDeleteAffiliate(affiliate)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remover Afiliado</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {affiliates.length === 0 && !isLoading && (
              <div className="text-center py-12 text-muted-foreground bg-white/30">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                Nenhum afiliado cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs de Confirmação */}
        <AlertDialog open={!!resetAffiliate} onOpenChange={() => setResetAffiliate(null)}>
          <AlertDialogContent className="glass-morphism border-none">
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar Pontos</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja resetar os pontos do afiliado "{resetAffiliate?.name}"?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPoints} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                Resetar Pontos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deleteAffiliate} onOpenChange={() => setDeleteAffiliate(null)}>
          <AlertDialogContent className="glass-morphism border-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">Remover Afiliado</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o afiliado "{deleteAffiliate?.name}"?
                Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};