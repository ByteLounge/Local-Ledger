"use client";

import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '@/components/AppProvider';
import type { Transaction } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker"; // Assuming you have this component
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Download, Trash2, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TransactionList() {
  const { state, dispatch } = useContext(AppContext);
  const { transactions, categories } = state;
  const { toast } = useToast();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterKeyword, setFilterKeyword] = useState<string>('');
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(undefined);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
   };


  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesKeyword = filterKeyword === '' || t.description.toLowerCase().includes(filterKeyword.toLowerCase());
      const matchesDate = !filterDateRange || (
        (!filterDateRange.from || transactionDate >= filterDateRange.from) &&
        (!filterDateRange.to || transactionDate <= filterDateRange.to)
      );
      return matchesCategory && matchesKeyword && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }, [transactions, filterCategory, filterKeyword, filterDateRange]);

  const handleDelete = (id: string) => {
     dispatch({ type: 'DELETE_TRANSACTION', payload: id });
     toast({
        title: "Transaction Deleted",
        description: "The transaction has been successfully removed.",
        variant: "destructive"
     });
     setTransactionToDelete(null); // Close the dialog
  };


    const exportToCSV = () => {
        const headers = ["ID", "Type", "Amount", "Category", "Date", "Description", "Recurring"];
        const rows = filteredTransactions.map(t => [
            t.id,
            t.type,
            t.amount,
            t.category,
            format(new Date(t.date), "yyyy-MM-dd"),
            `"${t.description.replace(/"/g, '""')}"`, // Handle quotes in description
            t.isRecurring ? "Yes" : "No"
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `local_ledger_transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link); // Required for FF

        link.click();
        document.body.removeChild(link);

        toast({
            title: "Export Successful",
            description: "Your transactions have been exported to CSV.",
        });
    };


  return (
     <Card>
         <CardHeader>
             <CardTitle>Transaction History</CardTitle>
             <div className="flex flex-col md:flex-row gap-4 my-4 items-center">
                <div className='flex items-center gap-2 w-full md:w-auto'>
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className='font-medium mr-2'>Filters:</span>
                </div>
                {/* Category Filter */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
                </Select>

                {/* Keyword Filter */}
                <Input
                type="text"
                placeholder="Filter by description..."
                value={filterKeyword}
                onChange={e => setFilterKeyword(e.target.value)}
                className="w-full md:w-[250px]"
                />

                {/* Date Range Filter */}
                 <DateRangePicker date={filterDateRange} onDateChange={setFilterDateRange} className="w-full md:w-auto" />


                {/* Export Button */}
                <Button onClick={exportToCSV} variant="outline" className="w-full md:w-auto ml-auto">
                   <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
             </div>
         </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((t) => (
                        <TableRow key={t.id}>
                        <TableCell>
                            <Badge variant={t.type === 'income' ? 'default' : 'secondary'} className={t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                                {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell className={`font-medium ${t.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                            {formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell>{t.category}</TableCell>
                        <TableCell>{format(new Date(t.date), "PPP")}</TableCell>
                        <TableCell>{t.description}</TableCell>
                         <TableCell>{t.isRecurring ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                            <AlertDialog open={transactionToDelete === t.id} onOpenChange={(isOpen) => !isOpen && setTransactionToDelete(null)}>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => setTransactionToDelete(t.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                     <span className="sr-only">Delete Transaction</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the transaction record.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No transactions found matching your filters.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
     </Card>
  );
}
