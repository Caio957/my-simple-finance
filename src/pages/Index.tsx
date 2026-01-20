import { useState } from "react";
import { Wallet, CreditCard, Receipt, Plus, TrendingUp } from "lucide-react";
import { SummaryCard } from "@/components/finance/SummaryCard";
import { CreditCardBill } from "@/components/finance/CreditCardBill";
import { ExpenseItem } from "@/components/finance/ExpenseItem";
import { QuickAddExpense } from "@/components/finance/QuickAddExpense";
import { PeriodSelector } from "@/components/finance/PeriodSelector";
import { BankFormDialog } from "@/components/finance/BankFormDialog";
import { SalaryInput } from "@/components/finance/SalaryInput";
import { Button } from "@/components/ui/button";
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

interface Bill {
  id: string;
  bankName: string;
  value: number;
  isPaid: boolean;
}

interface Expense {
  id: string;
  description: string;
  value: number;
}

const initialBills: Bill[] = [
  { id: "1", bankName: "Nubank", value: 1250.00, isPaid: false },
  { id: "2", bankName: "Inter", value: 890.50, isPaid: true },
  { id: "3", bankName: "Itaú", value: 2100.00, isPaid: false },
  { id: "4", bankName: "C6 Bank", value: 450.75, isPaid: false },
];

const initialExpenses: Expense[] = [
  { id: "1", description: "Almoço restaurante", value: 45.90 },
  { id: "2", description: "Uber para o trabalho", value: 28.50 },
  { id: "3", description: "Farmácia", value: 67.80 },
];

const Index = () => {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Salary state
  const [salary, setSalary] = useState(0);

  // Modal states
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  // Cálculos de totais
  const totalBills = bills.reduce((sum, bill) => sum + bill.value, 0);
  const pendingBills = bills
    .filter((bill) => !bill.isPaid)
    .reduce((sum, bill) => sum + bill.value, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const totalSpent = totalBills + totalExpenses;
  const balance = salary - totalSpent;

  // Handlers
  const handleAddValueToBill = (billId: string, value: number) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId ? { ...bill, value: bill.value + value } : bill
      )
    );
  };

  const handleToggleBillStatus = (billId: string) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === billId ? { ...bill, isPaid: !bill.isPaid } : bill
      )
    );
  };

  const handleOpenAddBank = () => {
    setEditingBill(null);
    setIsBankDialogOpen(true);
  };

  const handleEditBill = (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (bill) {
      setEditingBill(bill);
      setIsBankDialogOpen(true);
    }
  };

  const handleSaveBill = (data: { bankName: string; value: number }) => {
    if (editingBill) {
      // Editing existing bill
      setBills((prev) =>
        prev.map((bill) =>
          bill.id === editingBill.id
            ? { ...bill, bankName: data.bankName, value: data.value }
            : bill
        )
      );
    } else {
      // Adding new bill
      const newBill: Bill = {
        id: Date.now().toString(),
        bankName: data.bankName,
        value: data.value,
        isPaid: false,
      };
      setBills((prev) => [...prev, newBill]);
    }
    setEditingBill(null);
  };

  const handleDeleteBill = (billId: string) => {
    setDeletingBillId(billId);
  };

  const confirmDeleteBill = () => {
    if (deletingBillId) {
      setBills((prev) => prev.filter((bill) => bill.id !== deletingBillId));
      setDeletingBillId(null);
    }
  };

  const handleAddExpense = (description: string, value: number) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description,
      value,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-xl font-semibold text-foreground">Meu Financeiro</h1>
              <PeriodSelector
                month={currentMonth}
                year={currentYear}
                onPrevious={handlePreviousMonth}
                onNext={handleNextMonth}
              />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 -mb-1">
              <SalaryInput value={salary} onChange={setSalary} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Summary Cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              title="Lançamentos Avulsos"
              value={totalExpenses}
              icon={Receipt}
            />
          </div>
        </section>

        {/* Credit Card Bills */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Faturas de Cartão</h2>
              <p className="text-sm text-muted-foreground">
                {bills.filter((b) => b.isPaid).length}/{bills.length} pagas
              </p>
            </div>
            <Button onClick={handleOpenAddBank} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Cartão</span>
            </Button>
          </div>
          
          {bills.length === 0 ? (
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
              {bills.map((bill) => (
                <CreditCardBill
                  key={bill.id}
                  id={bill.id}
                  bankName={bill.bankName}
                  value={bill.value}
                  isPaid={bill.isPaid}
                  onAddValue={handleAddValueToBill}
                  onToggleStatus={handleToggleBillStatus}
                  onEdit={handleEditBill}
                  onDelete={handleDeleteBill}
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
                  value={expense.value}
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
        onSave={handleSaveBill}
        editingBill={editingBill}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingBillId} onOpenChange={() => setDeletingBillId(null)}>
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
              onClick={confirmDeleteBill}
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
