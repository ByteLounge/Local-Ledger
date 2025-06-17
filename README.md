

---

💸 Local Ledger

A simple, offline personal expense tracker built with Next.js (React) + TypeScript + Tailwind CSS on the frontend and Node.js + Express on the backend, using a local JSON file as a lightweight database via lowdb.

This app helps users manage income, expenses, budgets, and view helpful summaries — all without the need for external APIs or API keys.

---

Features

Expense Tracking

* Add and manage expenses
* Support for one-time and recurring entries
* Fields: Amount, Category, Date, Description

Income Tracking

* Track multiple income sources (salary, freelance, etc.)
* Categorize income with custom or predefined tags

Categorization

* Use built-in categories (Food, Transport, Bills, etc.)
* Add custom categories for both income and expenses

Dashboard and Summary

* Visualize income, expenses, and balance
* Charts:

  * Pie Chart: Category-wise expense distribution
  * Bar Graph: Weekly/Monthly summaries

Budget Management

* Set monthly budgets for each category
* Receive alerts when spending exceeds budgeted limits

Search and Filter

* Filter by:

  * Date Range
  * Category
  * Keywords in description

Export Options

* Export financial data as:

  * CSV
  * Excel (.xlsx)
  * PDF

---

Tech Stack

Frontend: Next.js (React), TypeScript, Tailwind CSS
Backend: Node.js, Express
Storage: lowdb (JSON file-based database)
Charts: Chart.js or Recharts

---

Local Development Setup

1. Clone the Repository

git clone [https://github.com/your-username/expense-tracker.git](https://github.com/your-username/expense-tracker.git)
cd expense-tracker


2. Install Frontend Dependencies

cd frontend
npm install


3. Install Backend Dependencies

cd ../backend
npm install


4. Start the Backend Server

npx ts-node server.ts

Note: If ts-node is not installed, install it globally using:
npm install -g ts-node


5. Start the Frontend Dev Server
   
cd ../frontend
npm run dev

---

Access the App

Frontend: [http://localhost:3000](http://localhost:3000)
Backend: [http://localhost:5000](http://localhost:5000)

Make sure the frontend is configured to send API requests to port 5000.

---

Data Export

You can export all transaction data via the dashboard to:

* CSV
* Excel
* PDF

No external API or cloud service is used.

---

Privacy and Security

* No external services or API keys
* All data is stored locally using db.json
* Fully functional offline

---

Requirements

* Node.js version 18 or later
* npm
* ts-node (for running backend TypeScript server)

---

Optional Future Features

* Dark mode
* User login system
* Cloud sync and data backup

---

License

This project is licensed under the MIT License.

---

Credits

* Next.js
* TypeScript
* Tailwind CSS
* lowdb
* Chart.js or Recharts

---


UI/UX:

![Screenshot 2025-06-17 130856](https://github.com/user-attachments/assets/3847e248-74e9-48d6-a96e-7afaa5de2473)

![Screenshot 2025-06-17 130915](https://github.com/user-attachments/assets/95cd8e48-5273-4a52-a391-137294aa146e)

![Screenshot 2025-06-17 130929](https://github.com/user-attachments/assets/9341b5c9-dc9e-45a2-8d10-0b0ce84fe63b)

![Screenshot 2025-06-17 130945](https://github.com/user-attachments/assets/7234b47b-f3d5-4acc-be77-96f53283e794)

![Screenshot 2025-06-17 131001](https://github.com/user-attachments/assets/3ef10875-fefe-4ff8-9796-d2dc8789e6d8)


