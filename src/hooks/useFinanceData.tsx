import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

export type CreditCard = Tables<"credit_cards">;
export type CreditCardBill = Tables<"credit_card_bills">;
export type BillItem = Tables<"bill_items">;
export type Expense = Tables<"expenses">;
export type Profile = Tables<"profiles">;

export interface CreditCardWithDetails extends CreditCard {
  bill?: CreditCardBill;
  items: BillItem[];
}

export function useFinanceData(month: number, year: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [salary, setSalaryState] = useState(0);
  const [creditCards, setCreditCards] = useState<CreditCardWithDetails[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profile (salary)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (profile) {
        setSalaryState(Number(profile.salary));
      }

      // Fetch credit cards
      const { data: cards, error: cardsError } = await supabase
        .from("credit_cards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (cardsError) throw cardsError;

      // Fetch bills for current month/year
      const { data: bills, error: billsError } = await supabase
        .from("credit_card_bills")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month + 1) // month is 0-indexed in JS
        .eq("year", year);

      if (billsError) throw billsError;

      // Fetch all bill items for user's cards
      const { data: items, error: itemsError } = await supabase
        .from("bill_items")
        .select("*")
        .eq("user_id", user.id);

      if (itemsError) throw itemsError;

      // Combine cards with their bills and items
      const cardsWithDetails: CreditCardWithDetails[] = (cards || []).map(card => {
        const cardBill = bills?.find(b => b.credit_card_id === card.id);
        const cardItems = (items || []).filter(item => {
          if (item.credit_card_id !== card.id) return false;
          // Check if item is active in current month
          const startDate = new Date(item.start_year, item.start_month - 1);
          const currentDate = new Date(year, month);
          const endDate = new Date(item.start_year, item.start_month - 1 + item.total_installments - 1);
          return currentDate >= startDate && currentDate <= endDate;
        });
        
        return {
          ...card,
          bill: cardBill,
          items: cardItems,
        };
      });

      setCreditCards(cardsWithDetails);

      // Fetch expenses for current month/year
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month + 1)
        .eq("year", year)
        .order("created_at", { ascending: false });

      if (expensesError) throw expensesError;
      setExpenses(expensesData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, month, year, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update salary
  const updateSalary = async (newSalary: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ salary: newSalary })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o salário.",
        variant: "destructive",
      });
      return;
    }
    
    setSalaryState(newSalary);
  };

  // Add credit card
  const addCreditCard = async (bankName: string) => {
    if (!user) return null;

    const { data: card, error } = await supabase
      .from("credit_cards")
      .insert({ bank_name: bankName, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cartão.",
        variant: "destructive",
      });
      return null;
    }

    await fetchData();
    return card;
  };

  // Update credit card
  const updateCreditCard = async (cardId: string, bankName: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("credit_cards")
      .update({ bank_name: bankName })
      .eq("id", cardId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cartão.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Delete credit card
  const deleteCreditCard = async (cardId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("credit_cards")
      .delete()
      .eq("id", cardId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cartão.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Toggle bill paid status
  const toggleBillPaid = async (cardId: string, isPaid: boolean) => {
    if (!user) return;

    // Check if bill exists for this month
    const existingBill = creditCards.find(c => c.id === cardId)?.bill;

    if (existingBill) {
      const { error } = await supabase
        .from("credit_card_bills")
        .update({ is_paid: isPaid })
        .eq("id", existingBill.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Create bill for this month
      const { error } = await supabase
        .from("credit_card_bills")
        .insert({
          credit_card_id: cardId,
          user_id: user.id,
          month: month + 1,
          year: year,
          is_paid: isPaid,
          extra_value: 0,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a fatura.",
          variant: "destructive",
        });
        return;
      }
    }

    await fetchData();
  };

  // Add extra value to bill
  const addExtraValueToBill = async (cardId: string, value: number) => {
    if (!user) return;

    const existingBill = creditCards.find(c => c.id === cardId)?.bill;

    if (existingBill) {
      const { error } = await supabase
        .from("credit_card_bills")
        .update({ extra_value: Number(existingBill.extra_value) + value })
        .eq("id", existingBill.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o valor.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from("credit_card_bills")
        .insert({
          credit_card_id: cardId,
          user_id: user.id,
          month: month + 1,
          year: year,
          is_paid: false,
          extra_value: value,
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar a fatura.",
          variant: "destructive",
        });
        return;
      }
    }

    await fetchData();
  };

  // Add bill item (installment purchase)
  const addBillItem = async (
    cardId: string,
    description: string,
    totalValue: number,
    totalInstallments: number
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from("bill_items")
      .insert({
        credit_card_id: cardId,
        user_id: user.id,
        description,
        total_value: totalValue,
        total_installments: totalInstallments,
        current_installment: 1,
        start_month: month + 1,
        start_year: year,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Delete bill item
  const deleteBillItem = async (itemId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("bill_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Add expense
  const addExpense = async (description: string, value: number) => {
    if (!user) return;

    const { error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        description,
        value,
        month: month + 1,
        year: year,
      });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a despesa.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Delete expense
  const deleteExpense = async (expenseId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a despesa.",
        variant: "destructive",
      });
      return;
    }

    await fetchData();
  };

  // Calculate bill value (items + extra)
  const calculateBillValue = (card: CreditCardWithDetails) => {
    const itemsValue = card.items.reduce((sum, item) => {
      // Calculate which installment we're on for this item
      const startDate = new Date(item.start_year, item.start_month - 1);
      const currentDate = new Date(year, month);
      const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - startDate.getMonth());
      const currentInstallment = monthsDiff + 1;
      
      if (currentInstallment >= 1 && currentInstallment <= item.total_installments) {
        return sum + (Number(item.total_value) / item.total_installments);
      }
      return sum;
    }, 0);
    
    const extraValue = Number(card.bill?.extra_value || 0);
    return itemsValue + extraValue;
  };

  // Calculate total debt for a card
  const calculateTotalDebt = (card: CreditCardWithDetails) => {
    return card.items.reduce((sum, item) => {
      const startDate = new Date(item.start_year, item.start_month - 1);
      const currentDate = new Date(year, month);
      const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - startDate.getMonth());
      const currentInstallment = monthsDiff + 1;
      
      if (currentInstallment >= 1 && currentInstallment <= item.total_installments) {
        const remainingInstallments = item.total_installments - currentInstallment + 1;
        const installmentValue = Number(item.total_value) / item.total_installments;
        return sum + (installmentValue * remainingInstallments);
      }
      return sum;
    }, 0);
  };

  // Get current installment number for an item
  const getCurrentInstallment = (item: BillItem) => {
    const startDate = new Date(item.start_year, item.start_month - 1);
    const currentDate = new Date(year, month);
    const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                       (currentDate.getMonth() - startDate.getMonth());
    return monthsDiff + 1;
  };

  return {
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
    refetch: fetchData,
  };
}
