"use client";

import React, { useContext, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from '@/components/AppProvider';
import type { Budget, Transaction } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trash2, PlusCircle, AlertTriangle, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod schema for budget form validation
const budgetSchema = z.object({
  category: z.string().min(1, { message: "Category is required." }),
  newCategory: z.string().optional(), // For adding a new category via budget form
  limit: z.coerce.number().positive({ message: "Budget limit must be a positive number." }),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export function BudgetManagement() {
  const { state, dispatch } = useContext(AppContext);
  const { budgets, transactions, categories } = state;
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      newCategory: '',
      limit: undefined,
    },
  });

   const editForm = useForm<BudgetFormData>({
      resolver: zodResolver(budgetSchema),
      // Default values will be set when opening the dialog
    });


  // Calculate current spending for each budget category for the current month
  const budgetsWithSpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return budgets.map(budget => {
      const spending = transactions
        .filter(t => t.type === 'expense' &&
                     t.category === budget.category &&
                     new Date(t.date).getMonth() === currentMonth &&
                     new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...budget, currentSpending: spending };
    });
  }, [budgets, transactions]);

  // Handle adding a new budget
  const handleAddBudget = (data: BudgetFormData) => {
     const finalCategory = data.category === '__addNew__' ? data.newCategory : data.category;

     if (!finalCategory || finalCategory.trim() === '') {
        form.setError("category", { type: "manual", message: "Category cannot be empty." });
        if (data.category === '__addNew__') {
            form.setError("newCategory", { type: "manual", message: "New category name cannot be empty." });
        }
        return; // Prevent submission
     }

     // Check if budget for this category already exists
     if (budgets.some(b => b.category === finalCategory)) {
         toast({
            title: "Budget Exists",
            description: `A budget for the category "${finalCategory}" already exists.`,
            variant: "destructive",
         });
         return;
     }


    const newBudget: Budget = {
      id: uuidv4(),
      category: finalCategory,
      limit: data.limit,
    };

     dispatch({ type: 'ADD_BUDGET', payload: newBudget });

     // Add the new category to the global state if it was just created
     if (data.category === '__addNew__' && finalCategory && !categories.includes(finalCategory)) {
        dispatch({ type: 'ADD_CATEGORY', payload: finalCategory });
     }


    toast({
      title: "Budget Added",
      description: `Budget for ${finalCategory} set to ${formatCurrency(data.limit)}.`,
    });
    form.reset();
    setShowNewCategoryInput(false);
    setIsAddDialogOpen(false);
  };

   // Handle updating an existing budget
    const handleUpdateBudget = (data: BudgetFormData) => {
        if (!editingBudget) return;

        // Category cannot be changed during edit in this implementation
        // If category needs to be changeable, logic would be more complex (delete old, add new)

        const updatedBudget: Budget = {
            ...editingBudget,
            limit: data.limit,
            // category remains the same as editingBudget.category
        };

        dispatch({ type: 'UPDATE_BUDGET', payload: updatedBudget });

        toast({
            title: "Budget Updated",
            description: `Budget for ${updatedBudget.category} updated to ${formatCurrency(data.limit)}.`,
        });
        editForm.reset();
        setEditingBudget(null);
        setIsEditDialogOpen(false);
    };

    // Handle deleting a budget
    const handleDeleteBudget = (id: string) => {
        const budget = budgets.find(b => b.id === id);
        dispatch({ type: 'DELETE_BUDGET', payload: id });
        toast({
            title: "Budget Deleted",
            description: `Budget for ${budget?.category || 'the category'} has been removed.`,
            variant: "destructive",
        });
        setBudgetToDelete(null);
    };

    const openEditDialog = (budget: Budget) => {
        setEditingBudget(budget);
        editForm.reset({ // Reset form with the budget's current values
            category: budget.category, // Keep category display, but it's not editable
            limit: budget.limit,
            newCategory: '', // Reset new category field
        });
         setShowNewCategoryInput(false); // Ensure new category input is hidden in edit mode
        setIsEditDialogOpen(true);
    };

     // Handle category change in the Add form
    const handleCategoryChangeAdd = (value: string) => {
        if (value === '__addNew__') {
            setShowNewCategoryInput(true);
            form.setValue('category', value); // Keep track of selection
        } else {
            setShowNewCategoryInput(false);
            form.setValue('category', value);
            form.clearErrors("category"); // Clear validation error if a valid category is selected
        }
         form.clearErrors("newCategory"); // Always clear new category error
    };


  // Available categories for the dropdown (excluding those already with a budget)
  const availableCategories = categories.filter(cat => !budgets.some(b => b.category === cat));


  return (
    <div className="space-y-6">
      <Card>
         <CardHeader className="flex flex-row items-center justify-between">
             <div>
                <CardTitle>Manage Budgets</CardTitle>
                <CardDescription>Set and track your monthly spending limits for different categories.</CardDescription>
             </div>
            {/* Add New Budget Dialog Trigger */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button> <PlusCircle className="mr-2 h-4 w-4" /> Add Budget</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Budget</DialogTitle>
                        <DialogDescription>Set a monthly spending limit for a category.</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddBudget)} className="space-y-4">
                             {/* Category Select/Input */}
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={handleCategoryChangeAdd} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                         {availableCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                         ))}
                                        <SelectItem value="__addNew__">-- Add New Category --</SelectItem>
                                        </SelectContent>
                                    </Select>
                                     <FormMessage />
                                    </FormItem>
                                )}
                             />
                            {/* New Category Input (Conditional) */}
                             {showNewCategoryInput && (
                                <FormField
                                    control={form.control}
                                    name="newCategory"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>New Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter new category name" {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    if (form.formState.errors.category?.message === "Category cannot be empty.") {
                                                        form.clearErrors("category");
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                         <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             )}

                             {/* Budget Limit */}
                            <FormField
                                control={form.control}
                                name="limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Limit</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Adding..." : "Add Budget"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
         </CardHeader>
        <CardContent>
            {budgetsWithSpending.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {budgetsWithSpending.map((budget) => {
                        const spendingPercentage = budget.limit > 0 ? (budget.currentSpending / budget.limit) * 100 : 0;
                        const overBudget = spendingPercentage > 100;
                        const progressColor = overBudget ? "hsl(var(--destructive))" : "hsl(var(--primary))";

                        return (
                            <Card key={budget.id} className={`border ${overBudget ? 'border-destructive bg-destructive/10' : ''}`}>
                                <CardHeader className='pb-2'>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{budget.category}</CardTitle>
                                            <CardDescription>Limit: {formatCurrency(budget.limit)}</CardDescription>
                                        </div>
                                        <div className="flex gap-1">
                                             {/* Edit Button/Dialog */}
                                            <Dialog open={isEditDialogOpen && editingBudget?.id === budget.id} onOpenChange={(isOpen) => { if (!isOpen) { setIsEditDialogOpen(false); setEditingBudget(null); } }}>
                                                <DialogTrigger asChild>
                                                     <Button variant="ghost" size="icon" onClick={() => openEditDialog(budget)}>
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit Budget</span>
                                                     </Button>
                                                </DialogTrigger>
                                                {editingBudget && editingBudget.id === budget.id && ( // Ensure content renders only for the correct budget
                                                <DialogContent>
                                                    <DialogHeader>
                                                    <DialogTitle>Edit Budget: {editingBudget.category}</DialogTitle>
                                                    <DialogDescription>Update the monthly spending limit.</DialogDescription>
                                                    </DialogHeader>
                                                    <Form {...editForm}>
                                                    <form onSubmit={editForm.handleSubmit(handleUpdateBudget)} className="space-y-4">
                                                        <FormField
                                                            control={editForm.control}
                                                            name="limit"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                <FormLabel>Monthly Limit</FormLabel>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                                </FormItem>
                                                            )}
                                                            />
                                                        <DialogFooter>
                                                            <Button type="button" variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingBudget(null); }}>Cancel</Button>
                                                            <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                                                {editForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                    </Form>
                                                </DialogContent>
                                                )}
                                            </Dialog>


                                            {/* Delete Button/Dialog */}
                                            <AlertDialog open={budgetToDelete === budget.id} onOpenChange={(isOpen) => !isOpen && setBudgetToDelete(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => setBudgetToDelete(budget.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Delete Budget</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Budget: {budget.category}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. Are you sure you want to remove this budget?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteBudget(budget.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-2 flex justify-between text-sm">
                                        <span>Spent: {formatCurrency(budget.currentSpending)}</span>
                                        <span className={`${overBudget ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                                            {formatCurrency(budget.limit - budget.currentSpending)} {budget.limit >= budget.currentSpending ? 'left' : 'over'}
                                         </span>
                                    </div>
                                    <Progress value={Math.min(spendingPercentage, 100)} className="h-2 [&>div]:bg-[--progress-color]" style={{ '--progress-color': progressColor } as React.CSSProperties} />
                                    {overBudget && (
                                        <div className="mt-2 flex items-center text-xs text-destructive">
                                            <AlertTriangle className="mr-1 h-4 w-4" />
                                            You've exceeded the budget for this category!
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-8">No budgets set yet. Click "Add Budget" to get started.</p>
            )}
        </CardContent>
      </Card>

       {/* Dialog for Editing Budget (Placed outside the map to avoid issues) */}
        {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Edit Budget: {editingBudget?.category}</DialogTitle>
                <DialogDescription>Update the monthly spending limit.</DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleUpdateBudget)} className="space-y-4">
                    <FormField
                        control={editForm.control}
                        name="limit"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Monthly Limit</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={editForm.formState.isSubmitting}>
                            {editForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
                </Form>
            </DialogContent>
        </Dialog> */}
    </div>
  );
}
