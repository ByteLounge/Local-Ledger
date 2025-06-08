
"use client";

import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useState } from 'react';
import type { AppState, AppAction, Transaction, Budget } from '@/types';
import { produce } from 'immer'; // Using immer for easier state updates
import { SplashScreen } from './SplashScreen'; // Import splash screen for loading state

// Default categories
const defaultCategories = ['Food', 'Travel', 'Bills', 'Salary', 'Freelance', 'Bonus', 'Groceries', 'Entertainment', 'Utilities'];

// Initial state structure
const initialState: AppState = {
  transactions: [],
  budgets: [],
  categories: defaultCategories,
};

// Reducer function to handle state changes
const appReducer = produce((draft: AppState, action: AppAction) => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      draft.transactions.push(action.payload);
      // Add category if it's new and not empty
      if (action.payload.category && !draft.categories.includes(action.payload.category)) {
        draft.categories.push(action.payload.category);
      }
      break;
    case 'DELETE_TRANSACTION':
      draft.transactions = draft.transactions.filter(t => t.id !== action.payload);
      break;
    case 'ADD_BUDGET':
       // Check if budget for category already exists
       const existingBudgetIndex = draft.budgets.findIndex(b => b.category === action.payload.category);
       if (existingBudgetIndex === -1) {
           draft.budgets.push(action.payload);
       } else {
           // Optionally update existing budget or notify user
           console.warn(`Budget for category "${action.payload.category}" already exists.`);
           // draft.budgets[existingBudgetIndex] = action.payload; // Uncomment to update instead
       }
       // Add category if it's new and not empty
       if (action.payload.category && !draft.categories.includes(action.payload.category)) {
         draft.categories.push(action.payload.category);
       }
       break;
    case 'UPDATE_BUDGET':
      const budgetIndex = draft.budgets.findIndex(b => b.id === action.payload.id);
      if (budgetIndex !== -1) {
        draft.budgets[budgetIndex] = action.payload;
         // Add category if it's new and not empty
        if (action.payload.category && !draft.categories.includes(action.payload.category)) {
            draft.categories.push(action.payload.category);
        }
      }
      break;
    case 'DELETE_BUDGET':
       draft.budgets = draft.budgets.filter(b => b.id !== action.payload);
      break;
    case 'ADD_CATEGORY':
      if (action.payload && !draft.categories.includes(action.payload)) {
        draft.categories.push(action.payload);
      }
      break;
    case 'SET_TRANSACTIONS':
       // Ensure payload is always an array, even if localStorage is empty/invalid
      draft.transactions = Array.isArray(action.payload) ? action.payload : [];
      break;
    case 'SET_BUDGETS':
       // Ensure payload is always an array
       draft.budgets = Array.isArray(action.payload) ? action.payload : [];
       break;
    case 'SET_CATEGORIES':
        // Merge default and loaded categories, removing duplicates and empty strings
        const loadedCategories = Array.isArray(action.payload) ? action.payload : [];
        // Ensure default categories are always present
        const mergedCategories = [...new Set([...defaultCategories, ...loadedCategories])];
        draft.categories = mergedCategories.filter(cat => cat && typeof cat === 'string'); // Ensure only non-empty strings
        break;
    default:
        // If the action type is unrecognized, ensure the state shape remains valid
        // This requires asserting the action type to avoid TS errors, or using a more robust check
        // For simplicity, we'll assume valid actions for now, but in a real app, handle unknown actions.
      break;
  }
}, initialState); // Pass initial state directly


// Create the context
export const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> }>({
  state: initialState,
  dispatch: () => null,
});

// Create the provider component
const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization

  // Load state from localStorage on initial client mount AFTER hydration
  useEffect(() => {
    // This effect runs only on the client after mount
    if (typeof window !== 'undefined') {
        let loadedState = { ...initialState }; // Start with initial state
        try {
            const localTransactions = localStorage.getItem('localLedgerTransactions');
            const localBudgets = localStorage.getItem('localLedgerBudgets');
            const localCategories = localStorage.getItem('localLedgerCategories');

            if (localTransactions) {
                loadedState.transactions = JSON.parse(localTransactions);
                dispatch({ type: 'SET_TRANSACTIONS', payload: loadedState.transactions });
            }
            if (localBudgets) {
                 loadedState.budgets = JSON.parse(localBudgets);
                 dispatch({ type: 'SET_BUDGETS', payload: loadedState.budgets });
            }
             // Load categories and ensure defaults are merged
            const parsedCategories = localCategories ? JSON.parse(localCategories) : [];
            // Use SET_CATEGORIES action which handles merging and defaults
            dispatch({ type: 'SET_CATEGORIES', payload: parsedCategories });


        } catch (error) {
            console.error("Failed to load state from localStorage:", error);
            // Fallback to initial state values if loading fails
            dispatch({ type: 'SET_TRANSACTIONS', payload: initialState.transactions });
            dispatch({ type: 'SET_BUDGETS', payload: initialState.budgets });
            dispatch({ type: 'SET_CATEGORIES', payload: initialState.categories });
        } finally {
            setIsInitialized(true); // Mark as initialized after loading attempt
        }

    } else {
        // Should not happen with useEffect, but good practice
         setIsInitialized(true);
    }
  }, []); // Empty dependency array ensures this runs only once on client mount

  // Save state to localStorage whenever it changes, but only after initial load
  useEffect(() => {
     // Only save after initialization and on the client
     if (typeof window !== 'undefined' && isInitialized) {
        try {
            localStorage.setItem('localLedgerTransactions', JSON.stringify(state.transactions));
            localStorage.setItem('localLedgerBudgets', JSON.stringify(state.budgets));
            localStorage.setItem('localLedgerCategories', JSON.stringify(state.categories));
        } catch (error) {
             console.error("Failed to save state to localStorage:", error);
        }
     }
  }, [state, isInitialized]); // Re-run when state changes or initialization completes

  // Prevent rendering children until the state is initialized from localStorage
  // This avoids hydration mismatches caused by client-side localStorage access
   if (!isInitialized) {
     // Optionally show a loading indicator or the splash screen here
     // Returning null might cause layout shifts, a splash screen is better
     return <SplashScreen />;
   }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
