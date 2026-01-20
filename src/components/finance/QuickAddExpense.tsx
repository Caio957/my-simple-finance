import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuickAddExpenseProps {
  onAdd: (description: string, value: number) => void;
}

export function QuickAddExpense({ onAdd }: QuickAddExpenseProps) {
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value.replace(",", "."));
    if (description.trim() && !isNaN(numValue) && numValue > 0) {
      onAdd(description.trim(), numValue);
      setDescription("");
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <Input
        type="text"
        placeholder="Descrição do gasto..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-3">
        <div className="relative flex-1 sm:w-32">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            R$
          </span>
          <Input
            type="text"
            placeholder="0,00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar</span>
        </Button>
      </div>
    </form>
  );
}
