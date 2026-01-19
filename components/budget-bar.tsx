"use client"

import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BudgetCategory {
  name: string
  allocated: number
  spent: number
  color: string
}

interface Sponsor {
  name: string
  amount: number
  logo?: string
}

interface BudgetBarProps {
  totalBudget: number
  totalSpent: number
  categories: BudgetCategory[]
  sponsors: Sponsor[]
}

export function BudgetBar({
  totalBudget,
  totalSpent,
  categories,
  sponsors,
}: BudgetBarProps) {
  const remaining = totalBudget - totalSpent
  const percentUsed = (totalSpent / totalBudget) * 100
  const isOverBudget = percentUsed > 100
  const isWarning = percentUsed > 80 && !isOverBudget

  return (
    <div className="space-y-6">
      {/* Main Budget Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Budget Overview
            </CardTitle>
            <Badge
              className={
                isOverBudget
                  ? "bg-destructive/20 text-destructive"
                  : isWarning
                  ? "bg-warning/20 text-warning"
                  : "bg-success/20 text-success"
              }
            >
              {isOverBudget ? (
                <>
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Over Budget
                </>
              ) : (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  On Track
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-medium">
                ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverBudget
                    ? "bg-destructive"
                    : isWarning
                    ? "bg-warning"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{percentUsed.toFixed(1)}% used</span>
              <span>${remaining.toLocaleString()} remaining</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium">By Category</h4>
            {categories.map((category) => {
              const catPercent = (category.spent / category.allocated) * 100
              return (
                <div key={category.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{category.name}</span>
                    <span>
                      ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(catPercent, 100)}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sponsors Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Sponsors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      color: "white",
                    }}
                  >
                    {sponsor.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium">{sponsor.name}</span>
                </div>
                <Badge variant="secondary" className="font-mono">
                  ${sponsor.amount.toLocaleString()}
                </Badge>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Sponsorship</span>
                <span className="font-semibold text-primary">
                  ${sponsors.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
