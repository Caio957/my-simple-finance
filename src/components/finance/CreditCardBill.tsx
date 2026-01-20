import { useState } from "react";
import { Plus, CreditCard, Check, Clock, Pencil, Trash2, MoreHorizontal, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BillDetailsDialog, BillItem } from "./BillDetailsDialog";

interface CreditCardBillProps {
  id: string;
  bankName: string;
  value: number;
  isPaid: boolean;
  items: BillItem[];
  totalDebt: number;
  onAddValue: (id: string, value: number) => void;
  onToggleStatus: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateItems: (id: string, items: BillItem[]) => void;
}

export function CreditCardBill({
  id,
  bankName,
  value,
  isPaid,
  items,
  totalDebt,
  onAddValue,
  onToggleStatus,
  onEdit,
  onDelete,
  onUpdateItems,
}: CreditCardBillProps) {
  const [inputValue, setInputValue] = useState("");
  const [isAddValueOpen, setIsAddValueOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAddValue = () => {
    const numValue = parseFloat(inputValue.replace(",", "."));
    if (!isNaN(numValue) && numValue > 0) {
      onAddValue(id, numValue);
      setInputValue("");
      setIsAddValueOpen(false);
    }
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

  const hasItems = items.length > 0;

  return (
    <>
      <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${getBankColor(bankName)}`}>
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium text-foreground">{bankName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStatus(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  isPaid
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {isPaid ? (
                  <>
                    <Check className="h-3 w-3" />
                    Pago
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Pendente
                  </>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-semibold text-foreground">
              {formatCurrency(value)}
            </p>
            {totalDebt > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Dívida total: {formatCurrency(totalDebt)}
              </p>
            )}
          </div>

          {hasItems && (
            <div className="mb-3 p-2.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{items.length}</span> compra(s) parcelada(s)
            </div>
          )}

          <div className="flex gap-2">
            <Dialog open={isAddValueOpen} onOpenChange={setIsAddValueOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-4 w-4" />
                  Valor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar à fatura do {bankName}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-3 mt-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      type="text"
                      placeholder="0,00"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                    />
                  </div>
                  <Button onClick={handleAddValue}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5"
              onClick={() => setIsDetailsOpen(true)}
            >
              <List className="h-4 w-4" />
              Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>

      <BillDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        bankName={bankName}
        items={items}
        onUpdateItems={(updatedItems) => onUpdateItems(id, updatedItems)}
      />
    </>
  );
}
