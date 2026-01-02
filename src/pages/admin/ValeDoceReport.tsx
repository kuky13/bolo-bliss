import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Candy, TrendingUp, TrendingDown, Users, RefreshCw, ArrowUpDown, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { IOSCard, IOSCardHeader, IOSListItem } from "@/components/ui/IOSCard";
import IOSStatCard from "@/components/ui/IOSStatCard";
import IOSSearchBar from "@/components/ui/IOSSearchBar";
import { cn } from "@/lib/utils";
import { PageTransition, staggerContainer, staggerItem, StaggerContainer, StaggerItem } from "@/components/layout/PageTransition";
import { motion } from "framer-motion";

interface TransactionWithAffiliate {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
  affiliate: {
    id: string;
    name: string;
    code: string;
    email: string | null;
  } | null;
}

interface AffiliateBalance {
  id: string;
  name: string;
  code: string;
  email: string | null;
  valedoce_balance: number;
  total_earned: number;
  total_spent: number;
  user_id: string | null;
}

const ValeDoceReport = () => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<TransactionWithAffiliate[]>([]);
  const [affiliateBalances, setAffiliateBalances] = useState<AffiliateBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [affiliateToDelete, setAffiliateToDelete] = useState<AffiliateBalance | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("valedoce_transactions")
        .select(`
          id,
          amount,
          type,
          description,
          created_at,
          affiliate:affiliates!valedoce_transactions_affiliate_id_fkey (
            id,
            name,
            code,
            email
          )
        `)
        .order("created_at", { ascending: sortOrder === "asc" });

      if (transactionsError) throw transactionsError;

      const { data: affiliatesData, error: affiliatesError } = await supabase
        .from("affiliates")
        .select("id, name, code, email, valedoce_balance, user_id");

      if (affiliatesError) throw affiliatesError;

      const affiliateStats = await Promise.all(
        (affiliatesData || []).map(async (affiliate) => {
          const { data: stats } = await supabase
            .from("valedoce_transactions")
            .select("amount, type")
            .eq("affiliate_id", affiliate.id);

          const totalEarned = (stats || [])
            .filter(t => t.type === "earned")
            .reduce((sum, t) => sum + t.amount, 0);

          const totalSpent = (stats || [])
            .filter(t => t.type === "spent")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

          return {
            ...affiliate,
            total_earned: totalEarned,
            total_spent: totalSpent
          };
        })
      );

      setTransactions(transactionsData || []);
      setAffiliateBalances(affiliateStats);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sortOrder]);

  const handleDeleteClick = (affiliate: AffiliateBalance) => {
    setAffiliateToDelete(affiliate);
    setAdminPassword("");
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!affiliateToDelete || !adminPassword || !currentUser?.email) {
      toast.error("Dados incompletos para exclusão");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await supabase.functions.invoke("delete-affiliate", {
        body: {
          affiliateId: affiliateToDelete.id,
          adminPassword: adminPassword,
          adminEmail: currentUser.email
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success(response.data?.message || "Afiliado deletado com sucesso!");
      setDeleteDialogOpen(false);
      setAffiliateToDelete(null);
      setAdminPassword("");
      loadData();
    } catch (error: any) {
      console.error("Erro ao deletar:", error);
      toast.error(error.message || "Erro ao deletar afiliado");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.affiliate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.affiliate?.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalEarned = transactions
    .filter(t => t.type === "earned")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === "spent")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBalance = affiliateBalances.reduce((sum, a) => sum + a.valedoce_balance, 0);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "earned":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">Ganho</Badge>;
      case "spent":
        return <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg">Gasto</Badge>;
      case "adjustment":
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">Ajuste</Badge>;
      default:
        return <Badge variant="secondary" className="rounded-lg">{type}</Badge>;
    }
  };

  return (
    <AdminLayout title="ValeDoce">
      <PageTransition>
        <StaggerContainer
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="space-y-5"
        >
          {/* Summary Stats - iOS Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <IOSStatCard
            icon={Candy}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-100 dark:bg-pink-900/30"
            title="Circulação"
            value={totalBalance}
            subtitle="ValeDoce ativos"
            delay={0}
          />

          <IOSStatCard
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            title="Distribuído"
            value={totalEarned}
            subtitle="total ganhos"
            delay={50}
          />

          <IOSStatCard
            icon={TrendingDown}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100 dark:bg-amber-900/30"
            title="Resgatado"
            value={totalSpent}
            subtitle="utilizados"
            delay={100}
          />

          <IOSStatCard
            icon={Users}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            title="Afiliados"
            value={affiliateBalances.length}
            subtitle="com ValeDoce"
            delay={150}
          />
        </div>

        {/* Affiliate Balances */}
        <IOSCard className="animate-fade-in-up overflow-hidden" style={{ animationDelay: "200ms" }}>
          <IOSCardHeader
            icon={<Users className="h-5 w-5 text-primary" />}
            title="Saldos por Afiliado"
            description="Visão geral de cada afiliado"
          />
          
          {affiliateBalances.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum afiliado com ValeDoce encontrado.
            </div>
          ) : isMobile ? (
            <div className="divide-y">
              {affiliateBalances
                .sort((a, b) => b.valedoce_balance - a.valedoce_balance)
                .map((affiliate) => (
                  <div key={affiliate.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{affiliate.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="rounded-lg text-xs">{affiliate.code}</Badge>
                          {affiliate.user_id && (
                            <Badge variant="secondary" className="rounded-lg text-xs">Com conta</Badge>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg font-bold">
                        {affiliate.valedoce_balance}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-emerald-600">+{affiliate.total_earned}</span>
                        <span className="text-amber-600">-{affiliate.total_spent}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => handleDeleteClick(affiliate)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Ganhos</TableHead>
                    <TableHead className="text-right">Gastos</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateBalances
                    .sort((a, b) => b.valedoce_balance - a.valedoce_balance)
                    .map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{affiliate.name}</p>
                            {affiliate.email && (
                              <p className="text-xs text-muted-foreground">{affiliate.email}</p>
                            )}
                            {affiliate.user_id && (
                              <Badge variant="secondary" className="text-[10px] mt-1 rounded-lg">
                                Com conta
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-lg">{affiliate.code}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          +{affiliate.total_earned}
                        </TableCell>
                        <TableCell className="text-right text-amber-600 font-medium">
                          -{affiliate.total_spent}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-lg font-bold">
                            {affiliate.valedoce_balance}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleDeleteClick(affiliate)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </IOSCard>

        {/* Transactions History */}
        <IOSCard className="animate-fade-in-up overflow-hidden" style={{ animationDelay: "250ms" }}>
          <IOSCardHeader
            icon={<Candy className="h-5 w-5 text-pink-500" />}
            title="Histórico"
            description="Todas as transações"
            action={
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={loadData}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </div>
            }
          />

          {/* Filters */}
          <div className="px-4 pb-4 space-y-3">
            <IOSSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por afiliado..."
            />
            
            {/* Filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {["all", "earned", "spent", "adjustment"].map((type) => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-xl shrink-0",
                    typeFilter === type && "shadow-md"
                  )}
                  onClick={() => setTypeFilter(type)}
                >
                  {type === "all" ? "Todos" : type === "earned" ? "Ganhos" : type === "spent" ? "Gastos" : "Ajustes"}
                </Button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {isLoading ? "Carregando..." : "Nenhuma transação encontrada."}
            </div>
          ) : isMobile ? (
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{transaction.affiliate?.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <span className={cn(
                      "font-bold",
                      transaction.amount > 0 ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {getTypeBadge(transaction.type)}
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.affiliate?.name || "N/A"}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.affiliate?.code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          "font-bold",
                          transaction.amount > 0 ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </IOSCard>
        </StaggerContainer>
      </PageTransition>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-destructive text-sm">
                <strong>ATENÇÃO:</strong> Esta ação é irreversível!
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Dados de <strong>"{affiliateToDelete?.name}"</strong></li>
                  <li>Transações ValeDoce</li>
                  <li>Histórico de vendas</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha de administrador:</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Sua senha"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={isDeleting}
                  className="rounded-xl"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!adminPassword || isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ValeDoceReport;
