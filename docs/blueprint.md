# **App Name**: Local Ledger

## Core Features:

- Transaction Input: Form to input transactions (income/expenses) with fields: amount, category, date, description and type. Support both one-time and recurring transactions. Store data locally (JSON file).
- Dashboard Summary: Display total income, expenses, and balance. Provide category-wise expense breakdown using a pie chart and monthly/weekly summaries using bar graphs (using Chart.js).
- Budget & Filter: Set monthly budget for each category and trigger an alert (visual cue) when spending exceeds the budget. Filter transactions by date range, category and description keywords. Allow export of transactions to CSV.

## Style Guidelines:

- Primary color: Neutral gray (#F5F5F5) for background and white for content areas.
- Secondary color: Soft blue (#E3F2FD) for interactive elements.
- Accent: Teal (#4DB6AC) for highlighting key information and calls to action.
- Clean, sans-serif font for all text elements to ensure readability.
- Simple, outlined icons for categories and actions.
- Clean and spaced layout for all screen sizes

## Original User Request:
Build a personal expense tracker web application using React (frontend) and Node.js with Express (backend) without using any external API keys. The app should be basic, user-friendly, and support local development with simple local storage (like a JSON file or lowdb).

 Features to include:

1. Add/Track Expenses
Form to enter expense with fields: amount, category, date, description

Support both one-time and recurring expenses

2. Income Tracking
Form to enter income with fields: source, amount, category, date, description

Categories like salary, freelance, bonus, etc.

3. Categorization of Transactions
Predefined categories (e.g. food, travel, bills)

Allow adding custom categories

4. Expense Summary & Dashboard
View total income, total expenses, balance

Pie chart for category-wise expenses

Bar graph for monthly or weekly summaries

5. Budget Management
Set monthly budget for each category

Alert when spending exceeds the budget

6. Search & Filter
Search and filter by:

Date range

Category

Keywords in description

7. Export Data
Export transactions (income + expenses) to CSV, Excel, or PDF

 Technical Notes:

Use React (with hooks + context or Redux if needed)

Use Node.js + Express for backend

Use a simple local JSON file as database

Use Chart.js or similar for pie/bar graphs (no API keys)

No user authentication or API integrations

Clean, responsive UI with basic CSS or Tailwind
  