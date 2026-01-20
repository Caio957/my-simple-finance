import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "warning";
}

export function SummaryCard({ title, value, icon: Icon, variant = "default" }: SummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const isNegative = value < 0;

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className={`text-2xl font-semibold tracking-tight ${
              isNegative ? "text-destructive" :
              variant === "primary" ? "text-primary" : 
              variant === "warning" ? "text-warning" : 
              "text-foreground"
            }`}>
              {formatCurrency(value)}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl ${
            isNegative ? "bg-destructive/10 text-destructive" :
            variant === "primary" ? "bg-primary/10 text-primary" :
            variant === "warning" ? "bg-warning/10 text-warning" :
            "bg-muted text-muted-foreground"
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
