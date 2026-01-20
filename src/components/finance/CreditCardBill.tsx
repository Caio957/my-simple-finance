import { useState } from "react";
import { Plus, CreditCard, Check, Clock } from "lucide-react";
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

interface CreditCardBillProps {
  id: string;
  bankName: string;
  value: number;
  isPaid: boolean;
  onAddValue: (id: string, value: number) => void;
  onToggleStatus: (id: string) => void;
}

export function CreditCardBill({
  id,
  bankName,
  value,
  isPaid,
  onAddValue,
  onToggleStatus,
}: CreditCardBillProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
      setIsOpen(false);
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
    };
    return colors[bank] || "bg-primary";
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-200 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getBankColor(bankName)}`}>
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-foreground">{bankName}</span>
          </div>
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
        </div>

        <p className="text-2xl font-semibold text-foreground mb-4">
          {formatCurrency(value)}
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-foreground hover:border-primary hover:bg-primary/5"
            >
              <Plus className="h-4 w-4" />
              Adicionar Valor
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
      </CardContent>
    </Card>
  );
}
