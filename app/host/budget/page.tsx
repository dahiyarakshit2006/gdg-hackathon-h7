"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
}

interface BudgetCategory {
  id: string;
  event_id: string;
  category_name: string;
  allocated_amount: number;
  spent_amount: number;
  events?: { title: string };
}

interface Transaction {
  id: string;
  event_id: string;
  category_id: string;
  description: string;
  amount: number;
  transaction_type: "expense" | "income" | "sponsorship";
  created_at: string;
  events?: { title: string };
  budget_categories?: { category_name: string };
}

export default function BudgetPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Form states
  const [newCategory, setNewCategory] = useState({
    event_id: "",
    category_name: "",
    allocated_amount: "",
  });
  const [newTransaction, setNewTransaction] = useState({
    event_id: "",
    category_id: "",
    description: "",
    amount: "",
    transaction_type: "expense" as "expense" | "income" | "sponsorship",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [selectedEvent]);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch events
    const { data: eventsData } = await supabase
      .from("events")
      .select("id, title")
      .eq("host_id", user.id);

    if (eventsData) {
      setEvents(eventsData);
    }

    // Fetch categories
    let categoriesQuery = supabase
      .from("budget_categories")
      .select("*, events(title)")
      .order("created_at", { ascending: false });

    if (selectedEvent !== "all") {
      categoriesQuery = categoriesQuery.eq("event_id", selectedEvent);
    } else if (eventsData) {
      categoriesQuery = categoriesQuery.in(
        "event_id",
        eventsData.map((e) => e.id)
      );
    }

    const { data: categoriesData } = await categoriesQuery;
    if (categoriesData) {
      setCategories(categoriesData);
    }

    // Fetch transactions
    let transactionsQuery = supabase
      .from("budget_transactions")
      .select("*, events(title), budget_categories(category_name)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (selectedEvent !== "all") {
      transactionsQuery = transactionsQuery.eq("event_id", selectedEvent);
    } else if (eventsData) {
      transactionsQuery = transactionsQuery.in(
        "event_id",
        eventsData.map((e) => e.id)
      );
    }

    const { data: transactionsData } = await transactionsQuery;
    if (transactionsData) {
      setTransactions(transactionsData);
    }

    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (
      !newCategory.event_id ||
      !newCategory.category_name ||
      !newCategory.allocated_amount
    )
      return;

    const { error } = await supabase.from("budget_categories").insert({
      event_id: newCategory.event_id,
      category_name: newCategory.category_name,
      allocated_amount: parseFloat(newCategory.allocated_amount),
      spent_amount: 0,
    });

    if (!error) {
      setShowAddCategory(false);
      setNewCategory({ event_id: "", category_name: "", allocated_amount: "" });
      fetchData();
    }
  };

  const handleAddTransaction = async () => {
    if (
      !newTransaction.event_id ||
      !newTransaction.description ||
      !newTransaction.amount
    )
      return;

    const amount = parseFloat(newTransaction.amount);

    const { error } = await supabase.from("budget_transactions").insert({
      event_id: newTransaction.event_id,
      category_id: newTransaction.category_id || null,
      description: newTransaction.description,
      amount,
      transaction_type: newTransaction.transaction_type,
    });

    if (!error) {
      // Update category spent amount if applicable
      if (
        newTransaction.category_id &&
        newTransaction.transaction_type === "expense"
      ) {
        const category = categories.find(
          (c) => c.id === newTransaction.category_id
        );
        if (category) {
          await supabase
            .from("budget_categories")
            .update({ spent_amount: category.spent_amount + amount })
            .eq("id", newTransaction.category_id);
        }
      }

      setShowAddTransaction(false);
      setNewTransaction({
        event_id: "",
        category_id: "",
        description: "",
        amount: "",
        transaction_type: "expense",
      });
      fetchData();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate totals
  const totalAllocated = categories.reduce(
    (sum, c) => sum + c.allocated_amount,
    0
  );
  const totalSpent = categories.reduce((sum, c) => sum + c.spent_amount, 0);
  const totalIncome = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSponsorship = transactions
    .filter((t) => t.transaction_type === "sponsorship")
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budget Manager</h1>
          <p className="text-muted-foreground">
            Track expenses and manage event finances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalAllocated)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full"
                  style={{
                    width: `${totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sponsorships</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(totalSponsorship)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Budget Categories
          </CardTitle>
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select
                    value={newCategory.event_id}
                    onValueChange={(v) =>
                      setNewCategory({ ...newCategory, event_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    placeholder="e.g., Catering, Venue, Marketing"
                    value={newCategory.category_name}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        category_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allocated Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newCategory.allocated_amount}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        allocated_amount: e.target.value,
                      })
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleAddCategory}>
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No budget categories yet</p>
              <p className="text-sm text-muted-foreground">
                Add categories to track expenses
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const percentage =
                  category.allocated_amount > 0
                    ? (category.spent_amount / category.allocated_amount) * 100
                    : 0;
                const isOverBudget = percentage > 100;

                return (
                  <div
                    key={category.id}
                    className="p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{category.category_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.events?.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(category.spent_amount)} /{" "}
                          {formatCurrency(category.allocated_amount)}
                        </p>
                        <Badge
                          variant={isOverBudget ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {percentage.toFixed(0)}% used
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isOverBudget ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
          <Dialog
            open={showAddTransaction}
            onOpenChange={setShowAddTransaction}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select
                    value={newTransaction.event_id}
                    onValueChange={(v) =>
                      setNewTransaction({ ...newTransaction, event_id: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newTransaction.transaction_type}
                    onValueChange={(v) =>
                      setNewTransaction({
                        ...newTransaction,
                        transaction_type: v as
                          | "expense"
                          | "income"
                          | "sponsorship",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="sponsorship">Sponsorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newTransaction.transaction_type === "expense" && (
                  <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select
                      value={newTransaction.category_id}
                      onValueChange={(v) =>
                        setNewTransaction({ ...newTransaction, category_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(
                            (c) => c.event_id === newTransaction.event_id
                          )
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.category_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="e.g., Food for 100 guests"
                    value={newTransaction.description}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleAddTransaction}>
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        {tx.budget_categories?.category_name && (
                          <p className="text-xs text-muted-foreground">
                            {tx.budget_categories.category_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        <Calendar className="w-3 h-3 mr-1" />
                        {tx.events?.title}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          tx.transaction_type === "expense"
                            ? "bg-destructive/10 text-destructive"
                            : tx.transaction_type === "sponsorship"
                              ? "bg-accent/10 text-accent"
                              : "bg-chart-3/10 text-chart-3"
                        }
                      >
                        {tx.transaction_type === "expense" ? (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        )}
                        {tx.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${tx.transaction_type === "expense" ? "text-destructive" : "text-chart-3"}`}
                    >
                      {tx.transaction_type === "expense" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
