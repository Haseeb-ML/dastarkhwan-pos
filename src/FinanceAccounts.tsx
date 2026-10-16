// @ts-nocheck
import React, { useState, useMemo } from "react";
import "./finance.css";
import { ui, languageDirection } from "./LanguageCore";
import { urdu } from "./Urdu";
import UrduInput from "./UrduKeyboard";
import BottomClose from "./BottomClose";

// Helper for formatting PKR currency from paise
const formatPkr = (paise: number) => {
  const rs = (paise || 0) / 100;
  return "PKR " + rs.toLocaleString("en-PK", { maximumFractionDigits: 2 });
};

// Format date in Asia/Karachi
const formatDate = (isoString?: string) => {
  if (!isoString) return "-";
  try {
    return new Date(isoString).toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(isoString);
  }
};

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function FinanceAccounts({
  data,
  api,
  mutate,
  notice,
  navigate,
}: any) {
  const [activeTab, setActiveTab] = useState<"ledger" | "accounts" | "expenses">("ledger");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("all");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all" | "custom">("month");
  
  const today = getTodayStr();
  const [fromDate, setFromDate] = useState<string>(() => {
    // Default to start of current month
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "دکان کا کرایہ (Rent)",
    customCategory: "",
    amount: "",
    method: "Cash",
    note: "",
    date: today,
  });
  const [isExpenseBusy, setIsExpenseBusy] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    code: "",
    name: "",
    english: "",
    category: "Assets",
    openingBalance: "0",
    description: "",
  });
  const [isAccountBusy, setIsAccountBusy] = useState(false);

  // Period change handler
  const handlePeriodChange = (newPeriod: "today" | "week" | "month" | "all" | "custom") => {
    setPeriod(newPeriod);
    const now = new Date();
    if (newPeriod === "today") {
      setFromDate(today);
      setToDate(today);
    } else if (newPeriod === "week") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(today);
    } else if (newPeriod === "month") {
      const d = new Date();
      d.setDate(1);
      setFromDate(d.toISOString().slice(0, 10));
      setToDate(today);
    } else if (newPeriod === "all") {
      setFromDate("2020-01-01");
      setToDate(today);
    }
  };

  // 1. COMPOSE GENERAL LEDGER TRANSACTIONS
  const allTransactions = useMemo(() => {
    if (!data) return [];
    const entries: any[] = [];

    // A. Cash Drawer Opening Balance
    (data.cash || []).forEach((c: any) => {
      if (c && Number(c.opening) > 0) {
        entries.push({
          id: `CASH-${c.id}`,
          date: c.created || c.business_date || today,
          ref: `CASH-${c.id}`,
          type: "cash",
          account: "Cash in Hand (دراز نقد)",
          accountCode: "1010",
          particulars: "دراز کی ابتدائی رقم (Cash Session Opening)",
          method: "Cash",
          debit: Number(c.opening),
          credit: 0,
        });
      }
    });

    // B. Order Payments (Customer sales collections)
    (data.orders || []).forEach((o: any) => {
      if (!o || o.state === "cancelled") return;
      (o.payments || []).forEach((p: any) => {
        if (!p || Number(p.amount) <= 0) return;
        const method = p.method || "Cash";
        const account = method === "Cash" ? "Cash in Hand (دراز نقد)" : "Bank / Digital Wallet (بینک / والٹ)";
        const accountCode = method === "Cash" ? "1010" : "1020";
        entries.push({
          id: `PAY-${p.id || o.id}`,
          date: p.created || o.created || today,
          ref: o.number || `INV-${o.id}`,
          type: "order",
          account: account,
          accountCode: accountCode,
          particulars: `آرڈر وصولی: ${o.number || o.id} (${o.place || "Dine-in"}${o.customer?.name ? " · " + o.customer.name : ""})`,
          method: method,
          debit: Number(p.amount),
          credit: 0,
        });
      });

      // Refunds
      (o.refunds || []).forEach((r: any) => {
        if (!r || Number(r.amount) <= 0) return;
        entries.push({
          id: `REF-${r.id || o.id}`,
          date: r.created || o.created || today,
          ref: `REF-${o.number || o.id}`,
          type: "refund",
          account: "Sales Returns & Refunds (واپسی بل)",
          accountCode: "4030",
          particulars: `رقم واپسی آرڈر #${o.number || o.id}: ${r.reason || "Refund"}`,
          method: r.method || "Cash",
          debit: 0,
          credit: Number(r.amount),
        });
      });
    });

    // C. Purchases (Inventory/Stock received)
    (data.purchases || []).forEach((p: any) => {
      if (!p || Number(p.total) <= 0) return;
      const sup = (data.suppliers || []).find((s: any) => s.id === p.supplier_id);
      const supName = sup ? sup.name : `Supplier #${p.supplier_id}`;
      entries.push({
        id: `PUR-${p.id}`,
        date: p.created || p.business_date || today,
        ref: `PUR-${p.id}`,
        type: "purchase",
        account: "Cost of Goods / Purchases (خریداری)",
        accountCode: "5010",
        particulars: `سامان کی خریداری #${p.id} (${supName}) - ${p.items?.length || 0} اقسام`,
        method: "Invoice",
        debit: 0,
        credit: Number(p.total),
      });
    });

    // D. Supplier Payments
    (data.supplierPayments || []).forEach((sp: any) => {
      if (!sp || Number(sp.amount) <= 0) return;
      const sup = (data.suppliers || []).find((s: any) => s.id === sp.supplier_id);
      const supName = sup ? sup.name : `Supplier #${sp.supplier_id}`;
      const method = sp.method || "Cash";
      const account = method === "Cash" ? "Cash in Hand (دراز نقد)" : "Bank / Digital Wallet (بینک / والٹ)";
      const accountCode = method === "Cash" ? "1010" : "1020";
      entries.push({
        id: `SPAY-${sp.id}`,
        date: sp.created || sp.business_date || today,
        ref: `SPAY-${sp.id}`,
        type: "supplier-payment",
        account: account,
        accountCode: accountCode,
        particulars: `سپلائر ادائیگی: ${supName}`,
        method: method,
        debit: 0,
        credit: Number(sp.amount),
      });
    });

    // E. Operating Expenses
    (data.expenses || []).forEach((exp: any) => {
      if (!exp || Number(exp.amount) <= 0) return;
      const method = exp.method || "Cash";
      const account = `Operating Expense - ${exp.category || "عام خرچہ"}`;
      entries.push({
        id: `EXP-${exp.id}`,
        date: exp.date || exp.businessDate || exp.created || today,
        ref: `EXP-${exp.id}`,
        type: "expense",
        account: account,
        accountCode: "6000",
        particulars: `${exp.category || "خرچہ"}: ${exp.note || "کاروباری اخراجات"}`,
        method: method,
        debit: 0,
        credit: Number(exp.amount),
      });
    });

    // Sort chronologically ascending to compute running balance
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = 0;
    entries.forEach((entry) => {
      running += (entry.debit || 0) - (entry.credit || 0);
      entry.balance = running;
    });

    // Return in reverse chronological order for table viewing (newest first)
    return entries.reverse();
  }, [data, today]);

  // Filtered transactions for the Ledger tab
  const filteredLedger = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = (tx.date || "").slice(0, 10);
      if (fromDate && txDate < fromDate) return false;
      if (toDate && txDate > toDate) return false;

      if (selectedAccountFilter !== "all") {
        if (selectedAccountFilter === "1010" && !tx.account.includes("Cash in Hand")) return false;
        if (selectedAccountFilter === "1020" && !tx.account.includes("Bank")) return false;
        if (selectedAccountFilter === "5010" && !tx.account.includes("Purchases")) return false;
        if (selectedAccountFilter === "6000" && !tx.account.includes("Expense")) return false;
        if (selectedAccountFilter === "4030" && !tx.account.includes("Refund")) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = String(tx.ref || "").toLowerCase().includes(q);
        const partMatch = String(tx.particulars || "").toLowerCase().includes(q);
        const accMatch = String(tx.account || "").toLowerCase().includes(q);
        if (!refMatch && !partMatch && !accMatch) return false;
      }

      return true;
    });
  }, [allTransactions, fromDate, toDate, selectedAccountFilter, searchQuery]);

  // Summary figures for filtered ledger
  const ledgerTotals = useMemo(() => {
    let debits = 0;
    let credits = 0;
    filteredLedger.forEach((tx) => {
      debits += tx.debit || 0;
      credits += tx.credit || 0;
    });
    return {
      debits,
      credits,
      net: debits - credits,
      count: filteredLedger.length,
    };
  }, [filteredLedger]);

  // 2. CHART OF ACCOUNTS CALCULATIONS
  const chartOfAccounts = useMemo(() => {
    if (!data) return { groups: [], summary: {} };

    // A. Cash in Hand (1010)
    let cashDebit = 0;
    let cashCredit = 0;
    (data.cash || []).forEach((c: any) => { cashDebit += Number(c.opening || 0); });
    (data.orders || []).forEach((o: any) => {
      if (o.state === "cancelled") return;
      (o.payments || []).forEach((p: any) => {
        if ((p.method || "Cash") === "Cash") cashDebit += Number(p.amount || 0);
      });
      (o.refunds || []).forEach((r: any) => {
        if ((r.method || "Cash") === "Cash") cashCredit += Number(r.amount || 0);
      });
    });
    (data.supplierPayments || []).forEach((sp: any) => {
      if ((sp.method || "Cash") === "Cash") cashCredit += Number(sp.amount || 0);
    });
    (data.expenses || []).forEach((e: any) => {
      if ((e.method || "Cash") === "Cash") cashCredit += Number(e.amount || 0);
    });
    const cashInHandBalance = cashDebit - cashCredit;

    // B. Bank Account / Digital Wallet (1020)
    let bankDebit = 0;
    let bankCredit = 0;
    (data.orders || []).forEach((o: any) => {
      if (o.state === "cancelled") return;
      (o.payments || []).forEach((p: any) => {
        if (p.method === "Card" || p.method === "Bank/Wallet") bankDebit += Number(p.amount || 0);
      });
      (o.refunds || []).forEach((r: any) => {
        if (r.method === "Card" || r.method === "Bank/Wallet") bankCredit += Number(r.amount || 0);
      });
    });
    (data.supplierPayments || []).forEach((sp: any) => {
      if (sp.method === "Card" || sp.method === "Bank/Wallet") bankCredit += Number(sp.amount || 0);
    });
    (data.expenses || []).forEach((e: any) => {
      if (e.method === "Card" || e.method === "Bank/Wallet") bankCredit += Number(e.amount || 0);
    });
    const bankBalance = bankDebit - bankCredit;

    // C. Accounts Receivable / Customers (1030)
    const receivables = (data.orders || [])
      .filter((o: any) => o.state !== "cancelled" && Number(o.balance) > 0)
      .reduce((sum: number, o: any) => sum + Number(o.balance || 0), 0);

    // D. Inventory Value (1040)
    const inventoryVal = (data.ingredients || []).reduce((sum: number, ing: any) => {
      const stock = Math.max(0, Number(ing.stock || 0));
      return sum + Math.round((stock * 35000) / 1000); // estimated valuation
    }, 0);

    // E. Accounts Payable / Suppliers (2010)
    const payables = (data.suppliers || []).reduce(
      (sum: number, s: any) => sum + Math.max(0, Number(s.balance || 0)),
      0
    );

    // F. Sales Revenue (4010)
    const salesRevenue = (data.orders || [])
      .filter((o: any) => o.state !== "cancelled")
      .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    // G. Purchases / COGS (5010)
    const purchasesTotal = (data.purchases || []).reduce(
      (sum: number, p: any) => sum + Number(p.total || 0),
      0
    );

    // H. Operating Expenses Breakdown (6010-6080)
    const expenseGroups: Record<string, number> = {};
    (data.expenses || []).forEach((e: any) => {
      const cat = e.category || "متفرق اخراجات";
      expenseGroups[cat] = (expenseGroups[cat] || 0) + Number(e.amount || 0);
    });
    const totalOperatingExpenses = (data.expenses || []).reduce(
      (sum: number, e: any) => sum + Number(e.amount || 0),
      0
    );

    // I. Net Equity / Capital
    const netRetained = salesRevenue - purchasesTotal - totalOperatingExpenses;
    const totalAssets = Math.max(0, cashInHandBalance) + Math.max(0, bankBalance) + receivables + inventoryVal;

    const groups = [
      {
        category: "اثاثہ جات (Assets)",
        type: "asset",
        accounts: [
          {
            code: "1010",
            name: "دراز میں نقد رقم",
            english: "Cash in Hand / Drawer",
            balance: cashInHandBalance,
            filterCode: "1010",
          },
          {
            code: "1020",
            name: "بینک اکاؤنٹ / والٹ",
            english: "Bank & Digital Wallet",
            balance: bankBalance,
            filterCode: "1020",
          },
          {
            code: "1030",
            name: "گاہکوں کا ادھار (وصول طلب)",
            english: "Accounts Receivable",
            balance: receivables,
            filterCode: "all",
          },
          {
            code: "1040",
            name: "موجودہ خام مال و اسٹاک",
            english: "Inventory & Stock Value",
            balance: inventoryVal,
            filterCode: "5010",
          },
        ],
      },
      {
        category: "واجبات (Liabilities)",
        type: "liability",
        accounts: [
          {
            code: "2010",
            name: "سپلائرز کے واجبات (ادائیگی طلب)",
            english: "Accounts Payable (Suppliers)",
            balance: payables,
            filterCode: "5010",
          },
        ],
      },
      {
        category: "سرمایہ (Equity)",
        type: "equity",
        accounts: [
          {
            code: "3010",
            name: "خالص کاروباری بچت و منافع",
            english: "Retained Earnings & Capital",
            balance: netRetained,
            filterCode: "all",
          },
        ],
      },
      {
        category: "آمدنی (Revenue)",
        type: "income",
        accounts: [
          {
            code: "4010",
            name: "کھانوں و مشروبات کی فروخت",
            english: "Food & Beverage Sales",
            balance: salesRevenue,
            filterCode: "all",
          },
        ],
      },
      {
        category: "لاگت و اخراجات (Costs & Expenses)",
        type: "expense",
        accounts: [
          {
            code: "5010",
            name: "خام مال و سامان کی خریداری",
            english: "Cost of Goods / Purchases",
            balance: purchasesTotal,
            filterCode: "5010",
          },
          ...Object.entries(expenseGroups).map(([cat, amount], idx) => ({
            code: `60${10 + idx * 10}`,
            name: cat,
            english: "Operating Expense",
            balance: amount,
            filterCode: "6000",
          })),
        ],
      },
    ];

    // Append custom accounts if any
    if (data.accounts?.length) {
      groups[0].accounts.push(
        ...data.accounts.map((ca: any) => ({
          code: ca.code || "1090",
          name: ca.name,
          english: ca.english || "Custom Account",
          balance: Number(ca.openingBalance || 0),
          filterCode: "all",
        }))
      );
    }

    return {
      groups,
      summary: {
        totalAssets,
        payables,
        salesRevenue,
        totalExpenses: purchasesTotal + totalOperatingExpenses,
        netRetained,
      },
    };
  }, [data]);

  // 3. EXPENSES VIEW CALCULATIONS
  const expenseStats = useMemo(() => {
    if (!data || !data.expenses) {
      return { todayTotal: 0, monthTotal: 0, cashTotal: 0, bankTotal: 0, categories: [], list: [] };
    }
    const currentMonth = today.slice(0, 7);
    let todayTotal = 0;
    let monthTotal = 0;
    let cashTotal = 0;
    let bankTotal = 0;
    const catMap: Record<string, number> = {};

    data.expenses.forEach((e: any) => {
      const eDate = (e.date || e.businessDate || e.created || "").slice(0, 10);
      const amt = Number(e.amount || 0);

      if (eDate === today) todayTotal += amt;
      if (eDate.startsWith(currentMonth)) monthTotal += amt;
      if ((e.method || "Cash") === "Cash") cashTotal += amt;
      else bankTotal += amt;

      const c = e.category || "عام خرچہ";
      catMap[c] = (catMap[c] || 0) + amt;
    });

    const categoryColors = [
      "#d56a2d", "#164b3b", "#2980b9", "#8e44ad", "#f39c12", "#27ae60", "#d35400", "#7f8c8d"
    ];

    const catList = Object.entries(catMap)
      .map(([name, amount], i) => ({
        name,
        amount,
        percentage: monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0,
        color: categoryColors[i % categoryColors.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      todayTotal,
      monthTotal,
      cashTotal,
      bankTotal,
      categories: catList,
      list: [...data.expenses].sort(
        (a, b) => new Date(b.date || b.created).getTime() - new Date(a.date || a.created).getTime()
      ),
    };
  }, [data, today]);

  // Add Expense submission
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      expenseForm.category === "دیگر (Other)"
        ? expenseForm.customCategory.trim() || "متفرق خرچہ"
        : expenseForm.category;

    const amtInRs = parseFloat(expenseForm.amount);
    if (!amtInRs || isNaN(amtInRs) || amtInRs <= 0) {
      setExpenseError("برائے مہربانی درست رقم لکھیں۔");
      return;
    }

    setIsExpenseBusy(true);
    setExpenseError("");
    try {
      const paise = Math.round(amtInRs * 100);
      await mutate("expenses", {
        category: finalCategory,
        amount: paise,
        method: expenseForm.method,
        note: expenseForm.note.trim(),
        businessDate: expenseForm.date,
        date: expenseForm.date,
      });
      setIsAddExpenseOpen(false);
      setExpenseForm({
        category: "دکان کا کرایہ (Rent)",
        customCategory: "",
        amount: "",
        method: "Cash",
        note: "",
        date: today,
      });
      notice("نیا خرچہ کامیابی سے محفوظ ہو گیا ہے۔");
    } catch (err: any) {
      setExpenseError(err.message || "خرچہ محفوظ کرنے میں خرابی ہوئی۔");
    } finally {
      setIsExpenseBusy(false);
    }
  };

  // Add Account submission
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name.trim()) return;
    setIsAccountBusy(true);
    try {
      const opening = Math.round(parseFloat(accountForm.openingBalance || "0") * 100);
      await mutate("accounts/save", {
        code: accountForm.code || `10${Math.floor(10 + Math.random() * 80)}`,
        name: accountForm.name.trim(),
        english: accountForm.english.trim(),
        category: accountForm.category,
        openingBalance: opening,
        description: accountForm.description.trim(),
      });
      setIsAddAccountOpen(false);
      setAccountForm({
        code: "",
        name: "",
        english: "",
        category: "Assets",
        openingBalance: "0",
        description: "",
      });
      notice("نیا کھاتہ محفوظ ہو گیا ہے۔");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAccountBusy(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: number) => {
    if (!window.confirm("کیا آپ واقعی یہ خرچہ حذف کرنا چاہتے ہیں؟")) return;
    try {
      await mutate("expenses/delete", { id });
      notice("خرچہ حذف کر دیا گیا ہے۔");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Print ledger function
  const handlePrintLedger = () => {
    window.print();
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ["Date", "Voucher", "Account", "Particulars", "Method", "Debit_PKR", "Credit_PKR", "Balance_PKR"];
    const rows = filteredLedger.map((tx) => [
      `"${tx.date}"`,
      `"${tx.ref}"`,
      `"${tx.account}"`,
      `"${(tx.particulars || "").replace(/"/g, '""')}"`,
      `"${tx.method}"`,
      tx.debit ? (tx.debit / 100).toFixed(2) : "0",
      tx.credit ? (tx.credit / 100).toFixed(2) : "0",
      ((tx.balance || 0) / 100).toFixed(2),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `General_Ledger_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="finance-workspace" dir={languageDirection()}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h2>{ui("فنانس اور اکاؤنٹس (Finance & Accounts)")}</h2>
          <p>{ui("جنرل لیجر، کھاتے، اور روزانہ کے اخراجات کا مکمل مالیاتی نظام")}</p>
        </div>
        <div className="row-actions">
          <button
            className="primary compact"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            + {ui("نیا خرچہ درج کریں (Add Expense)")}
          </button>
          <button
            className="secondary compact"
            onClick={() => setIsAddAccountOpen(true)}
          >
            + {ui("نیا کھاتہ (Add Account)")}
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="subnav">
        <button
          className={activeTab === "ledger" ? "active" : ""}
          onClick={() => setActiveTab("ledger")}
        >
          📖 {ui("جنرل لیجر (General Ledger)")}
        </button>
        <button
          className={activeTab === "accounts" ? "active" : ""}
          onClick={() => setActiveTab("accounts")}
        >
          🏛️ {ui("کھاتے (Chart of Accounts)")}
        </button>
        <button
          className={activeTab === "expenses" ? "active" : ""}
          onClick={() => setActiveTab("expenses")}
        >
          💸 {ui("اخراجات کا انتظام (Expenses)")}
        </button>
      </div>

      {/* TAB 1: GENERAL LEDGER */}
      {activeTab === "ledger" && (
        <section className="ledger-section">
          {/* Summary Metric Cards */}
          <div className="finance-metrics">
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل ڈیبٹ / آمد")}</span>
                <span className="card-icon income">📥</span>
              </div>
              <strong className="card-value green">{formatPkr(ledgerTotals.debits)}</strong>
              <small className="card-subtitle">{ui("وصول شدہ نقد و ڈیجیٹل رقوم")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل کریڈٹ / اخراجات")}</span>
                <span className="card-icon expense">📤</span>
              </div>
              <strong className="card-value red">{formatPkr(ledgerTotals.credits)}</strong>
              <small className="card-subtitle">{ui("خریداری و ادائیگی شدہ اخراجات")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("خالص لیجر فرق (Net)")}</span>
                <span className="card-icon asset">⚖️</span>
              </div>
              <strong className={`card-value ${ledgerTotals.net >= 0 ? "green" : "red"}`}>
                {formatPkr(ledgerTotals.net)}
              </strong>
              <small className="card-subtitle">{ui("ڈیبٹ اور کریڈٹ کا توازن")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل ٹرانزیکشنز")}</span>
                <span className="card-icon liability">📋</span>
              </div>
              <strong className="card-value">{ledgerTotals.count}</strong>
              <small className="card-subtitle">{ui("منتخب مدت کے اندراجات")}</small>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="finance-controls-bar">
            <div className="finance-filter-group">
              <button
                className={`finance-period-btn ${period === "today" ? "active" : ""}`}
                onClick={() => handlePeriodChange("today")}
              >
                {ui("آج (Today)")}
              </button>
              <button
                className={`finance-period-btn ${period === "week" ? "active" : ""}`}
                onClick={() => handlePeriodChange("week")}
              >
                {ui("اس ہفتے (Week)")}
              </button>
              <button
                className={`finance-period-btn ${period === "month" ? "active" : ""}`}
                onClick={() => handlePeriodChange("month")}
              >
                {ui("اس مہینے (Month)")}
              </button>
              <button
                className={`finance-period-btn ${period === "all" ? "active" : ""}`}
                onClick={() => handlePeriodChange("all")}
              >
                {ui("تمام (All Time)")}
              </button>

              <div className="finance-date-inputs">
                <span>{ui("از:")}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setPeriod("custom");
                    setFromDate(e.target.value);
                  }}
                />
                <span>{ui("تا:")}</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setPeriod("custom");
                    setToDate(e.target.value);
                  }}
                />
              </div>

              <select
                className="finance-select"
                value={selectedAccountFilter}
                onChange={(e) => setSelectedAccountFilter(e.target.value)}
              >
                <option value="all">{ui("تمام کھاتے (All Accounts)")}</option>
                <option value="1010">{ui("دراز میں کیش (Cash in Hand)")}</option>
                <option value="1020">{ui("بینک / والٹ (Bank / Wallet)")}</option>
                <option value="5010">{ui("خریداری (Purchases)")}</option>
                <option value="6000">{ui("کاروباری اخراجات (Operating Expenses)")}</option>
                <option value="4030">{ui("واپسی بل (Refunds)")}</option>
              </select>
            </div>

            <div className="finance-filter-group">
              <UrduInput
                className="finance-search-input"
                placeholder={ui("واؤچر یا تفصیل تلاش کریں…")}
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
              <button className="finance-btn secondary" onClick={handlePrintLedger} title="Print Ledger">
                🖨️ {ui("پرنٹ")}
              </button>
              <button className="finance-btn secondary" onClick={handleExportCsv} title="Export CSV">
                📥 {ui("CSV ڈاؤن لوڈ")}
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="ledger-table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>{ui("تاریخ و وقت")}</th>
                  <th>{ui("واؤچر / ریفرنس")}</th>
                  <th>{ui("کھاتہ (Account)")}</th>
                  <th>{ui("تفصیل (Particulars)")}</th>
                  <th>{ui("طریقہ")}</th>
                  <th>{ui("ڈیبٹ (آمد PKR)")}</th>
                  <th>{ui("کریڈٹ (خرچ PKR)")}</th>
                  <th>{ui("خالص بیلنس (PKR)")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      {ui("اس مدت میں کوئی مالیاتی اندراج موجود نہیں ہے۔")}
                    </td>
                  </tr>
                ) : (
                  filteredLedger.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>{formatDate(tx.date)}</td>
                      <td>
                        <span className={`ledger-ref-badge badge-${tx.type}`}>{tx.ref}</span>
                      </td>
                      <td>
                        <strong>{tx.account}</strong>
                      </td>
                      <td>{tx.particulars}</td>
                      <td>
                        <span style={{ fontSize: "11px", color: "var(--muted)" }}>{tx.method}</span>
                      </td>
                      <td className="amount-debit">{tx.debit ? formatPkr(tx.debit) : "-"}</td>
                      <td className="amount-credit">{tx.credit ? formatPkr(tx.credit) : "-"}</td>
                      <td className="amount-balance">{formatPkr(tx.balance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: CHART OF ACCOUNTS */}
      {activeTab === "accounts" && (
        <section className="coa-section">
          {/* Summary Metric Cards */}
          <div className="finance-metrics">
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل اثاثہ جات (Total Assets)")}</span>
                <span className="card-icon asset">🏛️</span>
              </div>
              <strong className="card-value green">{formatPkr(chartOfAccounts.summary.totalAssets)}</strong>
              <small className="card-subtitle">{ui("کیش، بینک، ادھار، اور اسٹاک کی مالیت")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل واجبات (Total Liabilities)")}</span>
                <span className="card-icon liability">⚠️</span>
              </div>
              <strong className="card-value red">{formatPkr(chartOfAccounts.summary.payables)}</strong>
              <small className="card-subtitle">{ui("سپلائرز کے واجب الادا بقایا جات")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل فروخت (Total Revenue)")}</span>
                <span className="card-icon income">📈</span>
              </div>
              <strong className="card-value green">{formatPkr(chartOfAccounts.summary.salesRevenue)}</strong>
              <small className="card-subtitle">{ui("کھانوں اور مشروبات کی مجموعی فروخت")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("کل اخراجات و لاگت")}</span>
                <span className="card-icon expense">📉</span>
              </div>
              <strong className="card-value red">{formatPkr(chartOfAccounts.summary.totalExpenses)}</strong>
              <small className="card-subtitle">{ui("خام مال خریداری اور تمام کاروباری اخراجات")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("خالص سرمایہ و بچت (Equity)")}</span>
                <span className="card-icon asset">💰</span>
              </div>
              <strong className={`card-value ${chartOfAccounts.summary.netRetained >= 0 ? "green" : "red"}`}>
                {formatPkr(chartOfAccounts.summary.netRetained)}
              </strong>
              <small className="card-subtitle">{ui("خالص کاروباری منافع")}</small>
            </div>
          </div>

          {/* Accounts Grouped List */}
          {chartOfAccounts.groups.map((group) => (
            <div key={group.category} style={{ marginBottom: "28px" }}>
              <div className="coa-section-header">
                <h3>{ui(group.category)}</h3>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {group.accounts.length} {ui("کھاتے")}
                </span>
              </div>

              <div className="coa-account-grid">
                {group.accounts.map((acc: any) => (
                  <div key={acc.code + acc.name} className="coa-account-card">
                    <div className="coa-account-top">
                      <div>
                        <span className="coa-account-code">{acc.code}</span>
                        <h4 className="coa-account-name">{ui(acc.name)}</h4>
                        <span className="coa-account-english">{acc.english}</span>
                      </div>
                    </div>

                    <div className="coa-account-bottom">
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                          {ui("موجودہ بیلنس:")}
                        </span>
                        <strong className={`coa-account-balance ${acc.balance >= 0 ? "positive" : "negative"}`}>
                          {formatPkr(acc.balance)}
                        </strong>
                      </div>

                      <button
                        className="coa-view-ledger-btn"
                        onClick={() => {
                          setSelectedAccountFilter(acc.filterCode || "all");
                          setActiveTab("ledger");
                        }}
                      >
                        {ui("لیجر دیکھیں ←")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* TAB 3: EXPENSES MANAGEMENT */}
      {activeTab === "expenses" && (
        <section className="expenses-section">
          {/* Summary Metric Cards */}
          <div className="finance-metrics">
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("آج کے اخراجات (Today)")}</span>
                <span className="card-icon expense">📅</span>
              </div>
              <strong className="card-value red">{formatPkr(expenseStats.todayTotal)}</strong>
              <small className="card-subtitle">{ui("آج کی تاریخ میں درج شدہ خرچے")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("اس مہینے کے اخراجات")}</span>
                <span className="card-icon expense">🗓️</span>
              </div>
              <strong className="card-value red">{formatPkr(expenseStats.monthTotal)}</strong>
              <small className="card-subtitle">{ui("رواں ماہ کا کل خرچہ")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("نقد اخراجات (Cash)")}</span>
                <span className="card-icon liability">💵</span>
              </div>
              <strong className="card-value">{formatPkr(expenseStats.cashTotal)}</strong>
              <small className="card-subtitle">{ui("دراز سے کی گئی ادائیگیاں")}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{ui("بینک / کارڈ اخراجات")}</span>
                <span className="card-icon asset">💳</span>
              </div>
              <strong className="card-value">{formatPkr(expenseStats.bankTotal)}</strong>
              <small className="card-subtitle">{ui("بینک یا والٹ سے ادائیگی")}</small>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          {expenseStats.categories.length > 0 && (
            <div className="expense-breakdown-card">
              <h3>{ui("اخراجات کی تفصیل بلحاظ شعبہ (Category Breakdown)")}</h3>
              <div className="expense-progress-bar">
                {expenseStats.categories.map((c) => (
                  <div
                    key={c.name}
                    className="expense-progress-seg"
                    style={{ width: `${c.percentage}%`, background: c.color }}
                    title={`${c.name}: ${formatPkr(c.amount)} (${c.percentage}%)`}
                  />
                ))}
              </div>

              <div className="expense-chips-grid">
                {expenseStats.categories.map((c) => (
                  <div key={c.name} className="expense-chip">
                    <span className="expense-chip-color" style={{ background: c.color }} />
                    <strong>{ui(c.name)}:</strong>
                    <span>{formatPkr(c.amount)}</span>
                    <small style={{ color: "var(--muted)" }}>({c.percentage}%)</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense History Table */}
          <div className="ledger-table-wrap">
            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>{ui("تمام درج شدہ اخراجات کی فہرست")}</h3>
              <button className="primary compact" onClick={() => setIsAddExpenseOpen(true)}>
                + {ui("نیا خرچہ شامل کریں")}
              </button>
            </div>

            <table className="ledger-table">
              <thead>
                <tr>
                  <th>{ui("تاریخ")}</th>
                  <th>{ui("کیٹیگری (شعبہ)")}</th>
                  <th>{ui("طریقہ ادائیگی")}</th>
                  <th>{ui("تفصیل / کس کو ادائیگی ہوئی")}</th>
                  <th>{ui("رقم (PKR)")}</th>
                  <th>{ui("عمل (Action)")}</th>
                </tr>
              </thead>
              <tbody>
                {expenseStats.list.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                      {ui("ابھی تک کوئی خرچہ درج نہیں کیا گیا ہے۔")}
                    </td>
                  </tr>
                ) : (
                  expenseStats.list.map((exp: any) => (
                    <tr key={exp.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{exp.date || exp.businessDate || formatDate(exp.created)}</td>
                      <td>
                        <strong style={{ color: "var(--ink)" }}>{ui(exp.category)}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", padding: "3px 8px", background: "#f2f4f1", borderRadius: "6px" }}>
                          {exp.method || "Cash"}
                        </span>
                      </td>
                      <td>{exp.note || "-"}</td>
                      <td className="amount-credit">{formatPkr(exp.amount)}</td>
                      <td>
                        <button
                          type="button"
                          className="finance-btn secondary"
                          style={{ padding: "4px 8px", fontSize: "11px", color: "#c0392b" }}
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          🗑️ {ui("حذف")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL 1: ADD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="نیا خرچہ درج کریں">
            <header>
              <h2>{ui("نیا خرچہ درج کریں (Add Expense)")}</h2>
              <button onClick={() => setIsAddExpenseOpen(false)} disabled={isExpenseBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveExpense}>
              <label className="field">
                <span>{ui("تاریخ (Date)")}</span>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("خرچے کی قسم / کیٹیگری")}</span>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  <option value="دکان کا کرایہ (Rent)">{ui("دکان کا کرایہ (Rent)")}</option>
                  <option value="ملازمین کی تنخواہیں (Salaries)">{ui("ملازمین کی تنخواہیں (Salaries)")}</option>
                  <option value="بجلی، گیس، پانی کے بل (Utilities)">{ui("بجلی، گیس، پانی کے بل (Utilities)")}</option>
                  <option value="کریانہ و کچن سامان (Kitchen Supplies)">{ui("کریانہ و کچن سامان (Kitchen Supplies)")}</option>
                  <option value="ایندھن و ٹرانسپورٹ (Fuel & Delivery)">{ui("ایندھن و ٹرانسپورٹ (Fuel & Delivery)")}</option>
                  <option value="مرمت و دیکھ بھال (Maintenance)">{ui("مرمت و دیکھ بھال (Maintenance)")}</option>
                  <option value="مارکیٹنگ و اشتہار (Marketing)">{ui("مارکیٹنگ و اشتہار (Marketing)")}</option>
                  <option value="متفرق اخراجات (Miscellaneous)">{ui("متفرق اخراجات (Miscellaneous)")}</option>
                  <option value="دیگر (Other)">{ui("دیگر (Other)...")}</option>
                </select>
              </label>

              {expenseForm.category === "دیگر (Other)" && (
                <label className="field">
                  <span>{ui("کیٹیگری کا نام لکھیں")}</span>
                  <UrduInput
                    required
                    placeholder={ui("مثلاً پیکنگ میٹریل")}
                    value={expenseForm.customCategory}
                    onChange={(e: any) => setExpenseForm({ ...expenseForm, customCategory: e.target.value })}
                  />
                </label>
              )}

              <label className="field">
                <span>{ui("رقم (Amount in PKR)")}</span>
                <UrduInput
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder={ui("مثلاً 5000")}
                  value={expenseForm.amount}
                  onChange={(e: any) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("ادائیگی کا طریقہ (Payment Method)")}</span>
                <select
                  value={expenseForm.method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                >
                  <option value="Cash">{ui("نقد دراز سے (Cash)")}</option>
                  <option value="Bank/Wallet">{ui("بینک / ایزی پیسہ / جاز کیش (Bank/Wallet)")}</option>
                  <option value="Card">{ui("کارڈ (Card)")}</option>
                </select>
              </label>

              <label className="field">
                <span>{ui("تفصیل یا کس کو ادائیگی کی گئی (Note / Reason)")}</span>
                <UrduInput
                  placeholder={ui("مثلاً بجلی کا بل جمع کروایا")}
                  value={expenseForm.note}
                  onChange={(e: any) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                />
              </label>

              {expenseError && <p className="error">{expenseError}</p>}

              <button className="primary wide" type="submit" disabled={isExpenseBusy}>
                {ui(isExpenseBusy ? "محفوظ ہو رہا ہے…" : "خرچہ محفوظ کریں")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddExpenseOpen(false)} disabled={isExpenseBusy} />
          </section>
        </div>
      )}

      {/* MODAL 2: ADD ACCOUNT */}
      {isAddAccountOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label="نیا کھاتہ بنائیں">
            <header>
              <h2>{ui("نیا کھاتہ شامل کریں (Add Account)")}</h2>
              <button onClick={() => setIsAddAccountOpen(false)} disabled={isAccountBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveAccount}>
              <label className="field">
                <span>{ui("کھاتے کا کوڈ (Account Code)")}</span>
                <input
                  type="text"
                  placeholder="مثلاً 1050 یا 6090"
                  value={accountForm.code}
                  onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("کھاتے کا نام (اردو میں)")}</span>
                <UrduInput
                  required
                  placeholder={ui("مثلاً میزان بینک اکاؤنٹ")}
                  value={accountForm.name}
                  onChange={(e: any) => setAccountForm({ ...accountForm, name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("کھاتے کا نام (انگریزی میں)")}</span>
                <input
                  placeholder="e.g. Meezan Bank Current Account"
                  value={accountForm.english}
                  onChange={(e) => setAccountForm({ ...accountForm, english: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("کھاتے کی قسم (Category)")}</span>
                <select
                  value={accountForm.category}
                  onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
                >
                  <option value="Assets">{ui("اثاثہ جات (Assets - کیش، بینک وغیرہ)")}</option>
                  <option value="Liabilities">{ui("واجبات (Liabilities - ادھار وغیرہ)")}</option>
                  <option value="Equity">{ui("سرمایہ (Equity)")}</option>
                  <option value="Revenue">{ui("آمدنی (Revenue)")}</option>
                  <option value="Expenses">{ui("اخراجات (Expenses)")}</option>
                </select>
              </label>

              <label className="field">
                <span>{ui("ابتدائی بیلنس PKR (Opening Balance)")}</span>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.openingBalance}
                  onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{ui("تفصیل (Description)")}</span>
                <UrduInput
                  placeholder={ui("اکاؤنٹ نمبر یا نوٹس")}
                  value={accountForm.description}
                  onChange={(e: any) => setAccountForm({ ...accountForm, description: e.target.value })}
                />
              </label>

              <button className="primary wide" type="submit" disabled={isAccountBusy}>
                {ui(isAccountBusy ? "محفوظ ہو رہا ہے…" : "کھاتہ محفوظ کریں")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddAccountOpen(false)} disabled={isAccountBusy} />
          </section>
        </div>
      )}
    </div>
  );
}
