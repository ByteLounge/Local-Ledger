
"use client";

import React from 'react';
import { AddTransaction } from '@/components/AddTransaction';
import { TransactionList } from '@/components/TransactionList';
import { Dashboard as DashboardSummary } from '@/components/Dashboard'; // Renamed import to avoid conflict
import { BudgetManagement } from '@/components/BudgetManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, List, Target, WalletCards } from 'lucide-react';

export default function DashboardPage() {
  // In a real app, you'd check for authentication status here
  // and redirect to login if not authenticated.
  // For this demo, we assume the user is "logged in".

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
             <Landmark className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Local Ledger</h1>
          </div>
          <AddTransaction />
          {/* Optional: Add User menu/logout button here */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="dashboard">
               <WalletCards className="mr-2 h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions">
               <List className="mr-2 h-4 w-4" /> Transactions
            </TabsTrigger>
            <TabsTrigger value="budgets">
              <Target className="mr-2 h-4 w-4" /> Budgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardSummary />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionList />
          </TabsContent>
           <TabsContent value="budgets">
             <BudgetManagement />
           </TabsContent>
        </Tabs>
      </main>

       {/* Footer */}
       <footer className="py-4 border-t bg-background/50 mt-auto">
          <div className="container text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Local Ledger. All rights reserved.
          </div>
       </footer>
    </div>
  );
}
