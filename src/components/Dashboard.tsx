"use client";

import React, { useContext, useMemo } from 'react';
import { AppContext } from '@/components/AppProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from 'date-fns';

export function Dashboard() {
  const { state } = useContext(AppContext);
  const { transactions } = state;

   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
   };

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expenses += t.amount;
      }
    });
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const monthlySummary = useMemo(() => {
     if (transactions.length === 0) return [];

     const sortedTransactions = [...transactions].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
     const firstDate = parseISO(sortedTransactions[0].date);
     const lastDate = parseISO(sortedTransactions[sortedTransactions.length - 1].date);

     const months = eachMonthOfInterval({
         start: startOfMonth(firstDate),
         end: endOfMonth(lastDate)
     });

     return months.map(monthStart => {
         const monthEnd = endOfMonth(monthStart);
         const monthName = format(monthStart, 'MMM yyyy');
         let income = 0;
         let expenses = 0;

         transactions.forEach(t => {
             const transactionDate = parseISO(t.date);
             if (transactionDate >= monthStart && transactionDate <= monthEnd) {
                 if (t.type === 'income') {
                     income += t.amount;
                 } else {
                     expenses += t.amount;
                 }
             }
         });
         return { name: monthName, income, expenses };
     });

  }, [transactions]);

  const pieChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    expenseByCategory.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`, // Cycle through chart colors
      };
    });
    return config;
  }, [expenseByCategory]);

   const barChartConfig = {
        income: { label: "Income", color: "hsl(var(--chart-1))" },
        expenses: { label: "Expenses", color: "hsl(var(--chart-2))" },
   } satisfies ChartConfig;



  // Define colors for the pie chart explicitly
  const COLORS = expenseByCategory.map((_, index) => `hsl(var(--chart-${(index % 5) + 1}))`);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</div>
          {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
          {/* <p className="text-xs text-muted-foreground">+180.1% from last month</p> */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(balance)}
          </div>
          {/* <p className="text-xs text-muted-foreground">Current account balance</p> */}
        </CardContent>
      </Card>

       <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
           <CardDescription>Distribution of your spending across categories.</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
           {expenseByCategory.length > 0 ? (
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[300px]">
                 <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel formatter={(value, name) => [`${formatCurrency(value as number)}`, name]} />} // Format tooltip value
                    />
                    <Pie
                        data={expenseByCategory}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                         {expenseByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                    </Pie>
                    <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                     />
                 </PieChart>
            </ChartContainer>
           ) : (
             <p className="text-center text-muted-foreground">No expense data available.</p>
           )}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Income vs. Expenses over the past months.</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlySummary.length > 0 ? (
            <ChartContainer config={barChartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={monthlySummary} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  // tickFormatter={(value) => value.slice(0, 3)} // Shorten month names if needed
                />
                 <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" formatter={(value) => formatCurrency(value as number)} />} // Format tooltip value
                 />
                 <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
             <p className="text-center text-muted-foreground">No transaction data available for monthly summary.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
