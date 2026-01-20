import { useState, useEffect } from "react";
import { CreditCard, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface BillItem {
  id: string;
  description: string;
  totalValue: number;
  currentInstallment: number;
  totalInstallments: number;
}

interface BillDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankName: string;
  items: BillItem[];
  onUpdateItems: (items: BillItem[]) => void;
}

export function BillDetailsDialog({
  open,
  onOpenChange,
  bankName,
  items,
  onUpdateItems,
}: BillDetailsDialogProps) {
  const [localItems, setLocalItems] = useState<BillItem[]>(items);
  const [newDescription, setNewDescription] = useState("");
  const [newTotalValue, setNewTotalValue] = useState("");
  const [newCurrentInstallment, setNewCurrentInstallment] = useState("1");
  const [newTotalInstallments, setNewTotalInstallments] = useState("1");

  useEffect(() => {
    setLocalItems(items);
  }, [items, open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateInstallmentValue = (item: BillItem) => {
    return item.totalValue / item.totalInstallments;
  };

  const calculateRemainingDebt = (item: BillItem) => {
    const remainingInstallments = item.totalInstallments - item.currentInstallment + 1;
    return (item.totalValue / item.totalInstallments) * remainingInstallments;
  };

  const calculateTotalMonthlyValue = () => {
    return localItems.reduce((sum, item) => sum + calculateInstallmentValue(item), 0);
  };

  const calculateTotalDebt = () => {
    return localItems.reduce((sum, item) => sum + calculateRemainingDebt(item), 0);
  };

  const handleAddItem = () => {
    const totalValue = parseFloat(newTotalValue.replace(",", "."));
    const currentInstallment = parseInt(newCurrentInstallment);
    const totalInstallments = parseInt(newTotalInstallments);

    if (
      newDescription.trim() &&
      !isNaN(totalValue) &&
      totalValue > 0 &&
      currentInstallment > 0 &&
      totalInstallments > 0 &&
      currentInstallment <= totalInstallments
    ) {
      const newItem: BillItem = {
        id: Date.now().toString(),
        description: newDescription.trim(),
        totalValue,
        currentInstallment,
        totalInstallments,
      };
      const updatedItems = [...localItems, newItem];
      setLocalItems(updatedItems);
      onUpdateItems(updatedItems);
      
      // Reset form
      setNewDescription("");
      setNewTotalValue("");
      setNewCurrentInstallment("1");
      setNewTotalInstallments("1");
    }
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = localItems.filter((item) => item.id !== itemId);
    setLocalItems(updatedItems);
    onUpdateItems(updatedItems);
  };

  const getBankColor = (bank: string) => {
    const colors: Record<string, string> = {
      Nubank: "bg-purple-500",
      Inter: "bg-orange-500",
      Itaú: "bg-blue-600",
      Bradesco: "bg-red-500",
      "C6 Bank": "bg-gray-800",
      Santander: "bg-red-600",
      "Banco do Brasil": "bg-yellow-500",
      Caixa: "bg-blue-500",
      "BTG Pactual": "bg-blue-900",
      XP: "bg-yellow-400",
    };
    return colors[bank] || "bg-primary";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getBankColor(bankName)}`}>
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            Detalhes - {bankName}
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Valor deste mês</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(calculateTotalMonthlyValue())}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Dívida total restante</p>
            <p className="text-xl font-semibold text-primary">
              {formatCurrency(calculateTotalDebt())}
            </p>
          </div>
        </div>

        {/* Items List */}
        <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
          <div className="space-y-2">
            {localItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum item cadastrado.</p>
                <p className="text-xs">Adicione compras parceladas abaixo.</p>
              </div>
            ) : (
              localItems.map((item) => {
                const installmentValue = calculateInstallmentValue(item);
                const remainingDebt = calculateRemainingDebt(item);
                const remainingInstallments = item.totalInstallments - item.currentInstallment + 1;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                          <span className="text-sm text-muted-foreground">
                            Parcela{" "}
                            <span className="font-medium text-foreground">
                              {item.currentInstallment}/{item.totalInstallments}
                            </span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Restam{" "}
                            <span className="font-medium text-foreground">
                              {remainingInstallments}x
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-foreground">
                          {formatCurrency(installmentValue)}
                          <span className="text-xs font-normal text-muted-foreground">/mês</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Restante: {formatCurrency(remainingDebt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Add New Item Form */}
        <div className="border-t border-border pt-4 mt-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Adicionar compra parcelada</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label htmlFor="description" className="text-xs text-muted-foreground">
                Descrição
              </Label>
              <Input
                id="description"
                placeholder="Ex: iPhone 15, Geladeira..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="mt-1"
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="totalValue" className="text-xs text-muted-foreground">
                Valor total da compra
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R$
                </span>
                <Input
                  id="totalValue"
                  placeholder="0,00"
                  value={newTotalValue}
                  onChange={(e) => setNewTotalValue(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="currentInstallment" className="text-xs text-muted-foreground">
                  Parcela atual
                </Label>
                <Input
                  id="currentInstallment"
                  type="number"
                  min="1"
                  value={newCurrentInstallment}
                  onChange={(e) => setNewCurrentInstallment(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="totalInstallments" className="text-xs text-muted-foreground">
                  Total de parcelas
                </Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  min="1"
                  value={newTotalInstallments}
                  onChange={(e) => setNewTotalInstallments(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {newDescription && newTotalValue && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">Parcela mensal: </span>
              <span className="font-medium text-foreground">
                {formatCurrency(
                  parseFloat(newTotalValue.replace(",", ".") || "0") /
                    parseInt(newTotalInstallments || "1")
                )}
              </span>
            </div>
          )}

          <Button onClick={handleAddItem} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
