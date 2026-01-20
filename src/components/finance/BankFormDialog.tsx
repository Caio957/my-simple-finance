import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Bill {
  id: string;
  bankName: string;
  value: number;
  isPaid: boolean;
}

interface BankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { bankName: string; value: number }) => void;
  editingBill?: Bill | null;
}

const BANK_OPTIONS = [
  "Nubank",
  "Inter",
  "Itaú",
  "Bradesco",
  "C6 Bank",
  "Santander",
  "Banco do Brasil",
  "Caixa",
  "BTG Pactual",
  "XP",
  "Outro",
];

export function BankFormDialog({
  open,
  onOpenChange,
  onSave,
  editingBill,
}: BankFormDialogProps) {
  const [bankName, setBankName] = useState("");
  const [customBankName, setCustomBankName] = useState("");
  const [value, setValue] = useState("");

  const isEditing = !!editingBill;

  useEffect(() => {
    if (editingBill) {
      const isPreset = BANK_OPTIONS.includes(editingBill.bankName);
      setBankName(isPreset ? editingBill.bankName : "Outro");
      setCustomBankName(isPreset ? "" : editingBill.bankName);
      setValue(editingBill.value.toFixed(2).replace(".", ","));
    } else {
      setBankName("");
      setCustomBankName("");
      setValue("");
    }
  }, [editingBill, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankName = bankName === "Outro" ? customBankName.trim() : bankName;
    const numValue = parseFloat(value.replace(",", "."));

    if (finalBankName && !isNaN(numValue) && numValue >= 0) {
      onSave({ bankName: finalBankName, value: numValue });
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cartão" : "Novo Cartão de Crédito"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger id="bank">
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {BANK_OPTIONS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getBankColor(bank)}`} />
                      {bank}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {bankName === "Outro" && (
            <div className="space-y-2">
              <Label htmlFor="customBank">Nome do Banco</Label>
              <Input
                id="customBank"
                type="text"
                placeholder="Digite o nome do banco"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="value">Valor da Fatura</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                R$
              </span>
              <Input
                id="value"
                type="text"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Preview */}
          {bankName && (
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${getBankColor(bankName === "Outro" ? customBankName : bankName)}`}>
                  <CreditCard className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-foreground">
                  {bankName === "Outro" ? customBankName || "Nome do banco" : bankName}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? "Salvar Alterações" : "Adicionar Cartão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
