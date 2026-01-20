import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpenseItemProps {
  id: string;
  description: string;
  value: number;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ id, description, value, onDelete }: ExpenseItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">
          {formatCurrency(value)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
