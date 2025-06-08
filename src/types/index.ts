// Define the structure for a Transaction
export type Transaction = {
  id: string;
  type: 'income' | 'expense'; // Can be either income or expense
  amount: number;
  category: string;
  date: string; // Store date as ISO string (e.g., "2024-07-29T10:30:00.000Z")
  description: string;
  isRecurring?: boolean; // Optional flag for recurring transactions
};

// Define the structure for a Budget category
export type Budget = {
  id: string; // Unique identifier for the budget category
  category: string; // The category name this budget applies to
  limit: number; // The monthly budget limit for this category
  currentSpending?: number; // Optional: Track current spending in the context, calculated dynamically
};

// Define the structure for the application's state
export type AppState = {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[]; // List of available categories
};

// Define the possible actions for the reducer
export type AppAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string } // payload is the transaction id
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string } // payload is the budget id
  | { type: 'ADD_CATEGORY'; payload: string } // payload is the new category name
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] } // For loading initial data
  | { type: 'SET_BUDGETS'; payload: Budget[] } // For loading initial data
  | { type: 'SET_CATEGORIES'; payload: string[] }; // For loading initial data
