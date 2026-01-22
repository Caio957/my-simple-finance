import { useState } from "react";
import { Wallet, CreditCard, Receipt, Plus, TrendingUp, AlertTriangle, LogOut, Loader2 } from "lucide-react";
import { SummaryCard } from "@/components/finance/SummaryCard";
import { CreditCardBill } from "@/components/finance/CreditCardBill";
import { ExpenseItem } from "@/components/finance/ExpenseItem";
import { QuickAddExpense } from "@/components/finance/QuickAddExpense";
import { PeriodSelector } from "@/components/finance/PeriodSelector";
import { BankFormDialog } from "@/components/finance/BankFormDialog";
import { SalaryInput } from "@/components/finance/SalaryInput";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFinanceData } from "@/hooks/useFinanceData";
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

const Index = () => {
  const { signOut } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const {
    loading,
    salary,
    creditCards,
    expenses,
    updateSalary,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    toggleBillPaid,
    addExtraValueToBill,
    addBillItem,
    deleteBillItem,
    addExpense,
    deleteExpense,
    calculateBillValue,
    calculateTotalDebt,
    getCurrentInstallment,
  } = useFinanceData(currentMonth, currentYear);

  // Modal states
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<{ id: string; bankName: string } | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  // Cálculos de totais
  const totalBills = creditCards.reduce((sum, card) => sum + calculateBillValue(card), 0);
  const pendingBills = creditCards
    .filter((card) => !card.bill?.is_paid)
    .reduce((sum, card) => sum + calculateBillValue(card), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.value), 0);
  const totalSpent = totalBills + totalExpenses;
  const balance = salary - totalSpent;
  const totalDebtAllCards = creditCards.reduce((sum, card) => sum + calculateTotalDebt(card), 0);

  // Handlers
  const handleAddValueToBill = async (cardId: string, value: number) => {
    await addExtraValueToBill(cardId, value);
  };

  const handleToggleBillStatus = async (cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    const newStatus = !(card?.bill?.is_paid ?? false);
    await toggleBillPaid(cardId, newStatus);
  };

  const handleOpenAddBank = () => {
    setEditingCard(null);
    setIsBankDialogOpen(true);
  };

  const handleEditCard = (cardId: string) => {
    const card = creditCards.find((c) => c.id === cardId);
    if (card) {
      setEditingCard({ id: card.id, bankName: card.bank_name });
      setIsBankDialogOpen(true);
    }
  };

  const handleSaveCard = async (data: { bankName: string; value: number }) => {
    if (editingCard) {
      await updateCreditCard(editingCard.id, data.bankName);
    } else {
      const card = await addCreditCard(data.bankName);
      if (card && data.value > 0) {
        await addExtraValueToBill(card.id, data.value);
      }
    }
    setEditingCard(null);
    setIsBankDialogOpen(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setDeletingCardId(cardId);
  };

  const confirmDeleteCard = async () => {
    if (deletingCardId) {
      await deleteCreditCard(deletingCardId);
      setDeletingCardId(null);
    }
  };

  const handleAddExpense = async (description: string, value: number) => {
    await addExpense(description, value);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId);
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Transform items for CreditCardBill component
  const getCardBillItems = (card: typeof creditCards[0]) => {
    return card.items.map((item) => ({
      id: item.id,
      description: item.description,
      totalValue: Number(item.total_value),
      currentInstallment: getCurrentInstallment(item),
      totalInstallments: item.total_installments,
    }));
  };

  const handleUpdateBillItems = async (
    cardId: string,
    items: Array<{
      id: string;
      description: string;
      totalValue: number;
      currentInstallment: number;
      totalInstallments: number;
    }>
  ) => {
    // Find items to delete (in current card but not in new items)
    const card = creditCards.find((c) => c.id === cardId);
    if (!card) return;

    const currentItemIds = card.items.map((i) => i.id);
    const newItemIds = items.map((i) => i.id);

    // Delete removed items
    for (const itemId of currentItemIds) {
      if (!newItemIds.includes(itemId)) {
        await deleteBillItem(itemId);
      }
    }

    // Add new items (items without a real ID)
    for (const item of items) {
      if (!currentItemIds.includes(item.id)) {
        await addBillItem(cardId, item.description, item.totalValue, item.totalInstallments);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">Meu Financeiro</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  title="Sair"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              <PeriodSelector
                month={currentMonth}
                year={currentYear}
                onPrevious={handlePreviousMonth}
                onNext={handleNextMonth}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 -mb-1">
              <SalaryInput value={salary} onChange={updateSalary} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Summary Cards */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
              title="Saldo Disponível"
              value={balance}
              icon={TrendingUp}
              variant="primary"
            />
            <SummaryCard
              title="Total Gasto"
              value={totalSpent}
              icon={Wallet}
            />
            <SummaryCard
              title="Faturas Pendentes"
              value={pendingBills}
              icon={CreditCard}
              variant="warning"
            />
            <SummaryCard
              title="Avulsos"
              value={totalExpenses}
              icon={Receipt}
            />
            <SummaryCard
              title="Dívida Total"
              value={totalDebtAllCards}
              icon={AlertTriangle}
              variant="warning"
            />
          </div>
        </section>

        {/* Credit Card Bills */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Faturas de Cartão</h2>
              <p className="text-sm text-muted-foreground">
                {creditCards.filter((c) => c.bill?.is_paid).length}/{creditCards.length} pagas
              </p>
            </div>
            <Button onClick={handleOpenAddBank} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Cartão</span>
            </Button>
          </div>
          
          {creditCards.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum cartão cadastrado.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={handleOpenAddBank}
              >
                Adicionar primeiro cartão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creditCards.map((card) => (
                <CreditCardBill
                  key={card.id}
                  id={card.id}
                  bankName={card.bank_name}
                  value={calculateBillValue(card)}
                  isPaid={card.bill?.is_paid ?? false}
                  items={getCardBillItems(card)}
                  totalDebt={calculateTotalDebt(card)}
                  onAddValue={handleAddValueToBill}
                  onToggleStatus={handleToggleBillStatus}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  onUpdateItems={handleUpdateBillItems}
                />
              ))}
            </div>
          )}
        </section>

        {/* Misc Expenses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Lançamentos Avulsos</h2>
            <span className="text-sm text-muted-foreground">
              {expenses.length} itens
            </span>
          </div>
          
          {/* Quick Add Form */}
          <div className="mb-4 p-4 rounded-xl bg-card border border-border shadow-card">
            <QuickAddExpense onAdd={handleAddExpense} />
          </div>

          {/* Expenses List */}
          <div className="space-y-2">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum lançamento avulso ainda.</p>
                <p className="text-sm">Use o formulário acima para adicionar.</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  id={expense.id}
                  description={expense.description}
                  value={Number(expense.value)}
                  onDelete={handleDeleteExpense}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bank Form Dialog */}
      <BankFormDialog
        open={isBankDialogOpen}
        onOpenChange={setIsBankDialogOpen}
        onSave={handleSaveCard}
        editingBill={editingCard ? { id: editingCard.id, bankName: editingCard.bankName, value: 0, isPaid: false } : null}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCardId} onOpenChange={() => setDeletingCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cartão e seu histórico de fatura serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
