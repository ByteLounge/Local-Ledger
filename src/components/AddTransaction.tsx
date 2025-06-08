"use client";

import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AppContext } from '@/components/AppProvider';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import type { Transaction } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define Zod schema for validation
const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: "Transaction type is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be positive." }), // Coerce to number
  category: z.string().min(1, { message: "Category is required." }),
  newCategory: z.string().optional(), // Optional field for new category input
  date: z.date({ required_error: "Date is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  isRecurring: z.boolean().optional().default(false),
});

// Infer the type from the schema
type TransactionFormData = z.infer<typeof transactionSchema>;

export function AddTransaction() {
  const { state, dispatch } = useContext(AppContext);
  const { categories } = state;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense', // Default to expense
      amount: undefined, // Use undefined initially
      category: '',
      newCategory: '',
      date: new Date(), // Default to today
      description: '',
      isRecurring: false,
    },
  });

 const selectedCategory = form.watch("category");

  // Handle form submission
  const onSubmit = (data: TransactionFormData) => {
    const finalCategory = data.category === '__addNew__' ? data.newCategory : data.category;

     if (!finalCategory || finalCategory.trim() === '') {
        form.setError("category", { type: "manual", message: "Category cannot be empty." });
        if (data.category === '__addNew__') {
            form.setError("newCategory", { type: "manual", message: "New category name cannot be empty." });
        }
        return; // Prevent submission
    }


    const newTransaction: Transaction = {
      id: uuidv4(), // Generate a unique ID
      type: data.type,
      amount: data.amount,
      category: finalCategory,
      date: data.date.toISOString(), // Store date as ISO string
      description: data.description,
      isRecurring: data.isRecurring,
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });

    // Add the new category to the global state if it was just created
    if (data.category === '__addNew__' && finalCategory && !categories.includes(finalCategory)) {
       dispatch({ type: 'ADD_CATEGORY', payload: finalCategory });
    }


    toast({
      title: "Transaction Added",
      description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} of ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.amount)} added successfully.`,
    });

    form.reset(); // Reset form fields
    setShowNewCategoryInput(false); // Hide new category input
    setOpen(false); // Close the dialog
  };

  // Handle category change
    const handleCategoryChange = (value: string) => {
        if (value === '__addNew__') {
            setShowNewCategoryInput(true);
            form.setValue('category', value); // Keep the value to track selection
        } else {
            setShowNewCategoryInput(false);
            form.setValue('category', value);
             form.clearErrors("category"); // Clear category error if a valid selection is made
        }
        form.clearErrors("newCategory"); // Always clear newCategory error on change
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your income or expense below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            {/* Transaction Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Transaction Type</FormLabel>
                   <FormControl>
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-4"
                        >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem value="income" id="income" />
                            </FormControl>
                            <FormLabel htmlFor="income" className="font-normal">Income</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                             <FormControl>
                                <RadioGroupItem value="expense" id="expense" />
                            </FormControl>
                            <FormLabel htmlFor="expense" className="font-normal">Expense</FormLabel>
                            </FormItem>
                        </RadioGroup>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="amount">Amount</FormLabel>
                  <FormControl>
                    <Input id="amount" type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
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
                        <FormLabel htmlFor="newCategory">New Category Name</FormLabel>
                        <FormControl>
                            <Input
                                id="newCategory"
                                placeholder="Enter new category name"
                                {...field}
                                onChange={(e) => {
                                    field.onChange(e); // Update field value
                                    // If user types, clear the main category error
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


            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Textarea id="description" placeholder="e.g., Coffee, Monthly Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Recurring */}
             <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            Recurring Transaction
                            </FormLabel>
                            <FormDescription>
                            Mark this if it's a recurring income or expense.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
              />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? "Adding..." : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to ensure category exists or add it (example, needs integration with context/reducer)
function ensureCategoryExists(category: string, existingCategories: string[], addCategoryAction: (cat: string) => void) {
  if (category && !existingCategories.includes(category)) {
    addCategoryAction(category);
    return true; // Indicates a new category was added
  }
  return false;
}

// Generate a simple UUID (replace with a more robust library like `uuid` in a real app)
// function simpleUUID() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// }

// Use uuid library instead
import { v4 as uuidv4_import } from 'uuid';
if (typeof window !== 'undefined') {
  // Make uuid available globally or attach to window if needed, though direct import is preferred
}
