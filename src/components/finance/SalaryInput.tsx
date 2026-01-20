import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SalaryInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function SalaryInput({ value, onChange }: SalaryInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleStartEdit = () => {
    setInputValue(value > 0 ? value.toFixed(2).replace(".", ",") : "");
    setIsEditing(true);
  };

  const handleSave = () => {
    const numValue = parseFloat(inputValue.replace(",", "."));
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Salário Líquido:</span>
      
      {isEditing ? (
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              R$
            </span>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-32 h-8 pl-8 text-sm"
              autoFocus
              placeholder="0,00"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary hover:text-primary"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          onClick={handleStartEdit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors group"
        >
          <span className="font-semibold text-foreground">
            {value > 0 ? formatCurrency(value) : "Definir"}
          </span>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      )}
    </div>
  );
}
