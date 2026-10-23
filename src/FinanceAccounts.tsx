import React, { useState, useMemo, useEffect } from "react";
import "./finance.css";
import { languageDirection } from "./LanguageCore";
import { useLanguage } from "./LanguageSwitch";
import UrduInput from "./UrduKeyboard";
import BottomClose from "./BottomClose";
import {
  printLedgerReport,
  downloadLedgerCsv,
  printOwnerAccountReport,
  downloadOwnerAccountCsv,
} from "./ledgerReportRenderer";

const getTodayStr = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Helper for formatting PKR currency from paise
const formatPkr = (paise?: number | null) => {
  const rs = (Number(paise) || 0) / 100;
  return "PKR " + rs.toLocaleString("en-PK", { maximumFractionDigits: 2 });
};

// Safe date string extractor (returns YYYY-MM-DD)
const safeDateStr = (d: any, fallback = getTodayStr()): string => {
  if (d === null || d === undefined || d === "") return fallback;
  try {
    if (typeof d === "object") {
      if (typeof d.toDate === "function") {
        const dt = d.toDate();
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Karachi",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(dt);
      }
      if (typeof d.seconds === "number") {
        const dt = new Date(d.seconds * 1000);
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Karachi",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(dt);
      }
    }
    if (typeof d === "number") {
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        return new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Karachi",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(dt);
      }
      return fallback;
    }
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.slice(0, 10);
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(parsed);
    }
    return str.slice(0, 10) || fallback;
  } catch {
    return fallback;
  }
};

// Format date in Asia/Karachi
const formatDate = (isoString?: any) => {
  if (!isoString) return "-";
  try {
    if (typeof isoString === "object" && isoString !== null) {
      if (typeof isoString.toDate === "function") {
        return isoString.toDate().toLocaleString("en-PK", {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        });
      }
      if (typeof isoString.seconds === "number") {
        return new Date(isoString.seconds * 1000).toLocaleString("en-PK", {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        });
      }
    }
    if (typeof isoString === "number") {
      return new Date(isoString).toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
    const trimmed = String(isoString).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split("-").map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString("en-PK", {
        dateStyle: "medium",
      });
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
    return trimmed;
  } catch {
    return String(isoString);
  }
};

const EXPENSE_CATEGORIES = [
  { id: "Rent", ur: "دکان کا کرایہ", en: "Shop Rent" },
  { id: "Salaries", ur: "ملازمین کی تنخواہیں", en: "Staff Salaries" },
  { id: "Utilities", ur: "بجلی، گیس، پانی کے بل", en: "Utilities (Bills)" },
  { id: "Kitchen Supplies", ur: "کریانہ و کچن سامان", en: "Kitchen Supplies" },
  { id: "Fuel & Delivery", ur: "ایندھن و ٹرانسپورٹ", en: "Fuel & Delivery" },
  { id: "Maintenance", ur: "مرمت و دیکھ بھال", en: "Maintenance" },
  { id: "Marketing", ur: "مارکیٹنگ و اشتہار", en: "Marketing" },
  { id: "Miscellaneous", ur: "متفرق اخراجات", en: "Miscellaneous" },
  { id: "Other", ur: "دیگر", en: "Other" },
];

const getCategoryLabel = (cat: string, isUr: boolean) => {
  if (!cat) return isUr ? "متفرق اخراجات" : "Miscellaneous";
  const lower = String(cat).toLowerCase();
  if (lower.includes("rent") || lower.includes("کرایہ")) return isUr ? "دکان کا کرایہ" : "Shop Rent";
  if (lower.includes("salar") || lower.includes("تنخواہ")) return isUr ? "ملازمین کی تنخواہیں" : "Staff Salaries";
  if (lower.includes("util") || lower.includes("بجلی") || lower.includes("گیس") || lower.includes("پانی")) return isUr ? "بجلی، گیس، پانی کے بل" : "Utilities (Bills)";
  if (lower.includes("suppl") || lower.includes("کریانہ") || lower.includes("کچن")) return isUr ? "کریانہ و کچن سامان" : "Kitchen Supplies";
  if (lower.includes("fuel") || lower.includes("delivery") || lower.includes("ایندھن") || lower.includes("ٹرانسپورٹ")) return isUr ? "ایندھن و ٹرانسپورٹ" : "Fuel & Delivery";
  if (lower.includes("maint") || lower.includes("مرمت") || lower.includes("دیکھ بھال")) return isUr ? "مرمت و دیکھ بھال" : "Maintenance";
  if (lower.includes("market") || lower.includes("اشتہار")) return isUr ? "مارکیٹنگ و اشتہار" : "Marketing";
  if (lower.includes("other") || lower.includes("دیگر")) return isUr ? "دیگر" : "Other";
  if (lower.includes("misc") || lower.includes("متفرق") || lower.includes("عام")) return isUr ? "متفرق اخراجات" : "Miscellaneous";
  return cat;
};

const getMethodLabel = (method: string, isUr: boolean) => {
  if (!method) return isUr ? "نقد" : "Cash";
  const lower = String(method).toLowerCase();
  if (lower.includes("cash") || lower.includes("نقد")) return isUr ? "نقد" : "Cash";
  if (lower.includes("bank") || lower.includes("wallet") || lower.includes("والٹ") || lower.includes("بینک")) return isUr ? "بینک / والٹ" : "Bank / Wallet";
  if (lower.includes("card") || lower.includes("کارڈ")) return isUr ? "کارڈ" : "Card";
  if (lower.includes("invoice") || lower.includes("انوائس")) return isUr ? "انوائس" : "Invoice";
  return method;
};

// Reusable Pagination Component with bilingual support
function PaginationControl({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isUrdu,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  isUrdu: boolean;
}) {
  if (totalItems === 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  return (
    <div className="finance-pagination">
      <div className="finance-pagination-info">
        <span>
          {isUrdu
            ? `${totalItems} میں سے ${startItem} تا ${endItem} اندراجات`
            : `Showing ${startItem} to ${endItem} of ${totalItems} entries`}
        </span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span>{isUrdu ? "فی صفحہ:" : "Rows:"}</span>
          <select
            className="finance-page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="finance-pagination-nav">
        <button
          type="button"
          className="finance-page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          title={isUrdu ? "پہلا صفحہ" : "First Page"}
        >
          {isUrdu ? "»" : "«"}
        </button>
        <button
          type="button"
          className="finance-page-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          title={isUrdu ? "پچھلا صفحہ" : "Previous Page"}
        >
          {isUrdu ? "›" : "‹"}
        </button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              type="button"
              key={`page-${p}`}
              className={`finance-page-btn ${currentPage === p ? "active" : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="finance-page-ellipsis">
              …
            </span>
          )
        )}

        <button
          type="button"
          className="finance-page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title={isUrdu ? "اگلا صفحہ" : "Next Page"}
        >
          {isUrdu ? "‹" : "›"}
        </button>
        <button
          type="button"
          className="finance-page-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title={isUrdu ? "آخری صفحہ" : "Last Page"}
        >
          {isUrdu ? "«" : "»"}
        </button>
      </div>
    </div>
  );
}

export default function FinanceAccounts({
  data,
  api,
  mutate,
  notice,
  navigate,
}: any) {
  const language = useLanguage();
  const isUrdu = language === "ur";

  const [activeTab, setActiveTab] = useState<"ledger" | "accounts" | "expenses" | "personal">("ledger");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("all");
  const [period, setPeriod] = useState<"today" | "week" | "month" | "all" | "custom">("month");
  
  const today = getTodayStr();
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states for General Ledger
  const [ledgerPage, setLedgerPage] = useState<number>(1);
  const [ledgerPageSize, setLedgerPageSize] = useState<number>(10);

  // Pagination states for Expenses
  const [expensePage, setExpensePage] = useState<number>(1);
  const [expensePageSize, setExpensePageSize] = useState<number>(10);

  // Pagination states for Owner Personal Account
  const [ownerPage, setOwnerPage] = useState<number>(1);
  const [ownerPageSize, setOwnerPageSize] = useState<number>(10);

  // Reset pagination when filters change
  useEffect(() => {
    setLedgerPage(1);
  }, [period, fromDate, toDate, selectedAccountFilter, searchQuery]);

  useEffect(() => {
    setExpensePage(1);
  }, [period, fromDate, toDate]);

  useEffect(() => {
    setOwnerPage(1);
  }, [period, fromDate, toDate]);

  // Modals state
  // Report Preview Modal (PDF / Printable View)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    title: string;
    subtitle: string;
    debitLabel: string;
    creditLabel: string;
    netLabel: string;
    totals: { debits: number; credits: number; net: number; count: number };
    rows: any[];
    printFn?: () => void;
    copyText: string;
  }>({
    title: "",
    subtitle: "",
    debitLabel: "",
    creditLabel: "",
    netLabel: "",
    totals: { debits: 0, credits: 0, net: 0, count: 0 },
    rows: [],
    copyText: "",
  });

  // Excel / CSV Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalData, setExportModalData] = useState<{
    filename: string;
    rowCount: number;
    csvContent: string;
    shareText: string;
    downloadFn?: () => void;
  }>({
    filename: "",
    rowCount: 0,
    csvContent: "",
    shareText: "",
  });

  const shareToWhatsApp = (text: string) => {
    try {
      if ((window as any).FlutterApp && typeof (window as any).FlutterApp.postMessage === 'function') {
        (window as any).FlutterApp.postMessage(JSON.stringify({ action: "whatsapp", text }));
        return;
      }
      const encoded = encodeURIComponent(text);
      const waScheme = "whatsapp://send?text=" + encoded;
      const waWeb = "https://api.whatsapp.com/send?text=" + encoded;
      try {
        window.location.href = waScheme;
        setTimeout(() => {
          window.open(waWeb, "_blank");
        }, 600);
      } catch (_) {
        window.open(waWeb, "_blank");
      }
    } catch (_) {
      try {
        window.location.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
      } catch (_) {}
    }
  };

  const shareNativeOrWhatsApp = (title: string, text: string) => {
    try {
      if ((window as any).FlutterApp) {
        (window as any).FlutterApp.postMessage(JSON.stringify({ action: "share", text }));
        return;
      }
      if (navigator.share) {
        navigator.share({ title, text }).catch(() => {
          shareToWhatsApp(text);
        });
        return;
      }
      shareToWhatsApp(text);
    } catch (_) {
      shareToWhatsApp(text);
    }
  };

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "Rent",
    customCategory: "",
    amount: "",
    method: "Cash",
    note: "",
    date: today,
  });
  const [isExpenseBusy, setIsExpenseBusy] = useState(false);
  const [expenseError, setExpenseError] = useState("");

  // Owner Personal Account Modals & State
  const [selectedOwnerId, setSelectedOwnerId] = useState<number | "all">("all");
  const [isAddDrawingOpen, setIsAddDrawingOpen] = useState(false);
  const [isAddDepositOpen, setIsAddDepositOpen] = useState(false);
  const [isAddOwnerAccountOpen, setIsAddOwnerAccountOpen] = useState(false);
  const [ownerAccountForm, setOwnerAccountForm] = useState<{
    id: number | null;
    name: string;
    sharePercentage: string;
    openingBalance: string;
    phone: string;
    description: string;
  }>({
    id: null,
    name: "",
    sharePercentage: "100",
    openingBalance: "0",
    phone: "",
    description: "",
  });
  const [isOwnerAccountBusy, setIsOwnerAccountBusy] = useState(false);
  const [ownerAccountError, setOwnerAccountError] = useState("");

  const [drawingForm, setDrawingForm] = useState({
    amount: "",
    method: "Cash",
    note: "",
    date: today,
    ownerAccountId: 1,
  });
  const [depositForm, setDepositForm] = useState({
    amount: "",
    method: "Cash",
    note: "",
    date: today,
    ownerAccountId: 1,
  });
  const [isOwnerBusy, setIsOwnerBusy] = useState(false);
  const [ownerError, setOwnerError] = useState("");

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: "",
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
          numericId: Number(c.id) || 0,
          date: c.created || c.business_date || today,
          ref: `CASH-${c.id}`,
          type: "cash",
          accountCode: "1010",
          account: "Cash in Hand",
          particulars: "Cash Session Opening",
          method: "Cash",
          debit: Number(c.opening),
          credit: 0,
        });
      }
    });

    // B. Order Payments (Customer sales collections)
    (data.orders || []).forEach((o: any) => {
      if (!o || o.state === "cancelled") return;
      if (o.payments && o.payments.length > 0) {
        o.payments.forEach((p: any, idx: number) => {
          if (!p || Number(p.amount) <= 0) return;
          const method = p.method || "Cash";
          const accountCode = method === "Cash" ? "1010" : "1020";
          entries.push({
            id: `PAY-${p.id || o.id}-${idx}`,
            numericId: (Number(o.id) || 0) * 1000 + idx,
            date: p.created || o.created || today,
            ref: o.number || `INV-${o.id}`,
            type: "order",
            place: o.place || "Dine-in",
            customerName: o.customer?.name || "",
            accountCode: accountCode,
            account: method === "Cash" ? "Cash in Hand" : "Bank & Digital Wallet",
            particulars: `Order Collection: ${o.number || o.id}`,
            method: method,
            debit: Number(p.amount),
            credit: 0,
          });
        });
      } else if (Number(o.received || 0) > 0 || o.paymentStatus === "Paid" || o.state === "closed") {
        const recAmount = Number(o.received || 0) || Number(o.total || 0);
        if (recAmount > 0) {
          entries.push({
            id: `PAY-REC-${o.id}`,
            numericId: (Number(o.id) || 0) * 1000,
            date: o.created || o.business_date || today,
            ref: o.number || `INV-${o.id}`,
            type: "order",
            place: o.place || "Dine-in",
            customerName: o.customer?.name || "",
            accountCode: "1010",
            account: "Cash in Hand",
            particulars: `Order Collection: ${o.number || o.id}`,
            method: "Cash",
            debit: recAmount,
            credit: 0,
          });
        }
      }

      // Refunds
      (o.refunds || []).forEach((r: any, rIdx: number) => {
        if (!r || Number(r.amount) <= 0) return;
        entries.push({
          id: `REF-${r.id || o.id}-${rIdx}`,
          numericId: (Number(o.id) || 0) * 1000 + 500 + rIdx,
          date: r.created || o.created || today,
          ref: `REF-${o.number || o.id}`,
          type: "refund",
          reason: r.reason || "",
          accountCode: "4030",
          account: "Sales Returns & Refunds",
          particulars: `Refund Order #${o.number || o.id}`,
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
        numericId: Number(p.id) || 0,
        purchaseId: p.id,
        supplierName: supName,
        itemCount: p.items?.length || 0,
        date: p.created || p.business_date || today,
        ref: `PUR-${p.id}`,
        type: "purchase",
        accountCode: "5010",
        account: "Cost of Goods / Purchases",
        particulars: `Purchase Order #${p.id} (${supName})`,
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
      const accountCode = method === "Cash" ? "1010" : "1020";
      entries.push({
        id: `SPAY-${sp.id}`,
        numericId: Number(sp.id) || 0,
        supplierName: supName,
        date: sp.created || sp.business_date || today,
        ref: `SPAY-${sp.id}`,
        type: "supplier-payment",
        accountCode: accountCode,
        account: method === "Cash" ? "Cash in Hand" : "Bank & Digital Wallet",
        particulars: `Supplier Payment: ${supName}`,
        method: method,
        debit: 0,
        credit: Number(sp.amount),
      });
    });

    // E. Operating Expenses
    (data.expenses || []).forEach((exp: any) => {
      if (!exp || Number(exp.amount) <= 0) return;
      const method = exp.method || "Cash";
      const expDate = exp.created || exp.date || exp.businessDate || today;
      entries.push({
        id: `EXP-${exp.id}`,
        numericId: Number(exp.id) || 0,
        category: exp.category || "Miscellaneous",
        note: exp.note || "",
        date: expDate,
        created: exp.created,
        ref: `EXP-${exp.id}`,
        type: "expense",
        accountCode: "6000",
        account: `Operating Expense - ${exp.category || "Miscellaneous"}`,
        particulars: `${exp.category || "Expense"}: ${exp.note || ""}`,
        method: method,
        debit: 0,
        credit: Number(exp.amount),
      });
    });

    // F. Owner Drawings & Capital Injections (Personal Account)
    (data.ownerDrawings || []).forEach((od: any) => {
      if (!od || Number(od.amount) <= 0) return;
      const isDraw = od.type === "draw";
      const method = od.method || "Cash";
      const odFullDate = od.created || od.date || od.businessDate || today;
      const ownerAcc = (data.ownerAccounts || []).find((a: any) => a.id === (od.ownerAccountId || 1));
      const ownerName = ownerAcc?.name || "";

      if (isDraw) {
        entries.push({
          id: `OD-${od.id}`,
          numericId: Number(od.id) || 0,
          date: odFullDate,
          created: od.created,
          ref: `OD-${od.id}`,
          type: "owner-drawing",
          note: od.note || "",
          ownerAccountId: od.ownerAccountId || 1,
          ownerName,
          accountCode: "3020",
          account: "Owner Personal Drawings",
          particulars: ownerName
            ? `${ownerName}: ${od.note || "Personal Drawing"}`
            : (od.note ? `Owner Drawing: ${od.note}` : "Personal Drawing (from Profit)"),
          method: method,
          debit: 0,
          credit: Number(od.amount),
        });
      } else {
        entries.push({
          id: `OI-${od.id}`,
          numericId: Number(od.id) || 0,
          date: odFullDate,
          created: od.created,
          ref: `OI-${od.id}`,
          type: "owner-capital",
          note: od.note || "",
          ownerAccountId: od.ownerAccountId || 1,
          ownerName,
          accountCode: "3010",
          account: "Owner Capital",
          particulars: ownerName
            ? `${ownerName}: ${od.note || "Capital Inflow"}`
            : (od.note ? `Capital Inflow: ${od.note}` : "Owner Capital Injection"),
          method: method,
          debit: Number(od.amount),
          credit: 0,
        });
      }
    });

    // G. Custom Accounts Opening Balances
    (data.accounts || []).forEach((ca: any) => {
      const ob = Number(ca.openingBalance || 0);
      if (ob > 0) {
        const isAssetOrExp = ca.category === "Assets" || ca.category === "Expenses";
        entries.push({
          id: `ACC-OP-${ca.id || ca.code}`,
          numericId: Number(ca.id || 0) * 1000,
          date: ca.updated || ca.created || "2020-01-01T00:00:00.000Z",
          created: ca.created,
          ref: `OP-${ca.code || ca.id}`,
          type: "account-opening",
          accountCode: ca.code || "1090",
          account: ca.name || ca.english || "Custom Account",
          particulars: isUrdu ? `ابتدائی بیلنس (Opening Balance): ${ca.name}` : `Opening Balance: ${ca.name}`,
          method: "Balance",
          debit: isAssetOrExp ? ob : 0,
          credit: !isAssetOrExp ? ob : 0,
        });
      }
    });

    // Helper to get reliable epoch time for sorting (chronologically asc for running balance, then reversed)
    const getEntryTime = (entry: any): number => {
      if (!entry) return 0;
      const dStr = String(entry.date || entry.created || "").trim();
      if (!dStr) return 0;
      if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
        if (entry.created && String(entry.created).includes("T")) {
          const c = new Date(entry.created).getTime();
          if (!isNaN(c)) return c;
        }
        if (entry.type === "cash" || entry.type === "account-opening") {
          return new Date(`${dStr}T00:00:00`).getTime();
        }
        return new Date(`${dStr}T23:59:59`).getTime();
      }
      const t = new Date(dStr).getTime();
      return !isNaN(t) ? t : 0;
    };

    // Sort chronologically ascending to compute running balance
    entries.sort((a, b) => {
      const timeA = getEntryTime(a);
      const timeB = getEntryTime(b);
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      const numA = a.numericId || 0;
      const numB = b.numericId || 0;
      if (numA !== numB) {
        return numA - numB;
      }
      return String(a.id || "").localeCompare(String(b.id || ""));
    });

    let running = 0;
    entries.forEach((entry) => {
      running += (entry.debit || 0) - (entry.credit || 0);
      entry.balance = running;
    });

    // Return in reverse chronological order for table viewing (newest first on top)
    return entries.reverse();
  }, [data, today]);

  // Account display helper for ledger
  const getAccountDisplayName = (tx: any, isUr: boolean) => {
    if (tx.accountCode === "1010") return isUr ? "دراز میں نقد رقم" : "Cash in Hand";
    if (tx.accountCode === "1020") return isUr ? "بینک اکاؤنٹ / والٹ" : "Bank & Digital Wallet";
    if (tx.accountCode === "3010") return isUr ? "مالک کا سرمایہ (ان پٹ)" : "Owner Capital";
    if (tx.accountCode === "3020") return isUr ? "مالک کی ذاتی نکلوائی (ڈرانگ)" : "Owner Personal Drawings";
    if (tx.accountCode === "4030") return isUr ? "واپسی بل (ریفنڈ)" : "Sales Returns & Refunds";
    if (tx.accountCode === "5010") return isUr ? "خام مال و سامان کی خریداری" : "Cost of Goods / Purchases";
    if (tx.accountCode === "6000") {
      const cat = getCategoryLabel(tx.category || "", isUr);
      return isUr ? `کاروباری خرچہ - ${cat}` : `Operating Expense - ${cat}`;
    }
    return tx.account;
  };

  // Particulars display helper for ledger
  const getParticularsDisplay = (tx: any, isUr: boolean) => {
    if (tx.type === "cash") {
      return isUr ? "دراز کی ابتدائی رقم" : "Cash Session Opening";
    }
    if (tx.type === "order") {
      const placeLabel = tx.place === "Takeaway" 
        ? (isUr ? "پارسل" : "Takeaway") 
        : (tx.place === "Delivery" ? (isUr ? "ڈلیوری" : "Delivery") : (isUr ? "ڈائن ان" : "Dine-in"));
      return isUr
        ? `آرڈر وصولی: ${tx.ref} (${placeLabel}${tx.customerName ? " · " + tx.customerName : ""})`
        : `Order Collection: ${tx.ref} (${placeLabel}${tx.customerName ? " · " + tx.customerName : ""})`;
    }
    if (tx.type === "refund") {
      return isUr
        ? `رقم واپسی آرڈر #${tx.ref}${tx.reason ? ": " + tx.reason : ""}`
        : `Refund Order #${tx.ref}${tx.reason ? ": " + tx.reason : ""}`;
    }
    if (tx.type === "purchase") {
      return isUr
        ? `سامان کی خریداری #${tx.purchaseId} (${tx.supplierName}) - ${tx.itemCount} اقسام`
        : `Purchase Order #${tx.purchaseId} (${tx.supplierName}) - ${tx.itemCount} items`;
    }
    if (tx.type === "supplier-payment") {
      return isUr
        ? `سپلائر ادائیگی: ${tx.supplierName}`
        : `Supplier Payment: ${tx.supplierName}`;
    }
    if (tx.type === "owner-drawing") {
      return isUr
        ? `ذاتی نکلوائی (منافع سے)${tx.note ? ": " + tx.note : ""}`
        : `Personal Drawing (from Profit)${tx.note ? ": " + tx.note : ""}`;
    }
    if (tx.type === "owner-capital") {
      return isUr
        ? `ذاتی سرمایہ جمع کروایا${tx.note ? ": " + tx.note : ""}`
        : `Personal Capital Added${tx.note ? ": " + tx.note : ""}`;
    }
    if (tx.type === "expense") {
      const cat = getCategoryLabel(tx.category, isUr);
      return isUr
        ? `${cat}${tx.note ? ": " + tx.note : ""}`
        : `${cat}${tx.note ? ": " + tx.note : ""}`;
    }
    return tx.particulars;
  };

  // Filtered transactions for the Ledger tab
  const filteredLedger = useMemo(() => {
    return allTransactions.filter((tx) => {
      const txDate = safeDateStr(tx.date);
      if (selectedAccountFilter !== "all") {
        if (selectedAccountFilter === "6000") {
          if (!String(tx.accountCode).startsWith("60")) return false;
        } else if (selectedAccountFilter === "1010") {
          const isCash = tx.accountCode === "1010" || (tx.method === "Cash" && (tx.type === "owner-drawing" || tx.type === "owner-capital"));
          if (!isCash) return false;
        } else if (selectedAccountFilter === "1020") {
          const isBank = tx.accountCode === "1020" || (["Card", "Bank/Wallet", "Bank", "Wallet"].includes(tx.method) && (tx.type === "owner-drawing" || tx.type === "owner-capital"));
          if (!isBank) return false;
        } else if (tx.accountCode !== selectedAccountFilter) {
          return false;
        }
      }

      // If user selected a specific account, include its opening balance
      const isAccountOpening = tx.type === "account-opening" && tx.accountCode === selectedAccountFilter;
      if (!isAccountOpening) {
        if (fromDate && txDate < fromDate) return false;
        if (toDate && txDate > toDate) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = String(tx.ref || "").toLowerCase().includes(q);
        const partMatch = String(getParticularsDisplay(tx, isUrdu)).toLowerCase().includes(q) ||
                          String(getParticularsDisplay(tx, false)).toLowerCase().includes(q);
        const accMatch = String(getAccountDisplayName(tx, isUrdu)).toLowerCase().includes(q) ||
                         String(getAccountDisplayName(tx, false)).toLowerCase().includes(q);
        if (!refMatch && !partMatch && !accMatch) return false;
      }

      return true;
    });
  }, [allTransactions, fromDate, toDate, selectedAccountFilter, searchQuery, isUrdu]);

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

  // Paginated transactions for Ledger table view
  const totalLedgerCount = filteredLedger.length;
  const totalLedgerPages = Math.max(1, Math.ceil(totalLedgerCount / ledgerPageSize));
  const safeLedgerPage = Math.min(Math.max(1, ledgerPage), totalLedgerPages);
  const paginatedLedger = useMemo(() => {
    const start = (safeLedgerPage - 1) * ledgerPageSize;
    return filteredLedger.slice(start, start + ledgerPageSize);
  }, [filteredLedger, safeLedgerPage, ledgerPageSize]);

  // 2. CHART OF ACCOUNTS CALCULATIONS
  const chartOfAccounts = useMemo(() => {
    if (!data) {
      return {
        groups: [],
        summary: {
          totalAssets: 0,
          payables: 0,
          salesRevenue: 0,
          totalExpenses: 0,
          netRetained: 0,
        },
      };
    }

    // Cash in Hand (1010) & Bank & Digital Wallet (1020)
    let cashDebit = 0;
    let cashCredit = 0;
    let bankDebit = 0;
    let bankCredit = 0;

    (data.cash || []).forEach((c: any) => { cashDebit += Number(c.opening || 0); });
    (data.orders || []).forEach((o: any) => {
      if (o.state === "cancelled") return;
      (o.payments || []).forEach((p: any) => {
        if ((p.method || "Cash") === "Cash") cashDebit += Number(p.amount || 0);
        else bankDebit += Number(p.amount || 0);
      });
      (o.refunds || []).forEach((r: any) => {
        if ((r.method || "Cash") === "Cash") cashCredit += Number(r.amount || 0);
        else bankCredit += Number(r.amount || 0);
      });
    });
    (data.expenses || []).forEach((e: any) => {
      if ((e.method || "Cash") === "Cash") cashCredit += Number(e.amount || 0);
      else bankCredit += Number(e.amount || 0);
    });
    (data.supplierPayments || []).forEach((sp: any) => {
      if ((sp.method || "Cash") === "Cash") cashCredit += Number(sp.amount || 0);
      else bankCredit += Number(sp.amount || 0);
    });

    // Owner Drawings & Capital Injections
    let totalOwnerDrawings = 0;
    let totalOwnerDeposits = 0;
    (data.ownerDrawings || []).forEach((od: any) => {
      const amt = Number(od.amount || 0);
      const isCash = (od.method || "Cash") === "Cash";
      if (od.type === "draw") {
        totalOwnerDrawings += amt;
        if (isCash) cashCredit += amt;
        else bankCredit += amt;
      } else {
        totalOwnerDeposits += amt;
        if (isCash) cashDebit += amt;
        else bankDebit += amt;
      }
    });

    const cashInHandBalance = cashDebit - cashCredit;
    const bankBalance = bankDebit - bankCredit;

    // C. Accounts Receivable (1030)
    const receivables = (data.customers || []).reduce(
      (sum: number, c: any) => sum + Math.max(0, Number(c.balance || 0)),
      0
    );

    // D. Inventory Value (1040)
    const inventoryVal = (data.ingredients || []).reduce(
      (sum: number, ing: any) => sum + Math.round((Number(ing.stock || 0) / 1000) * Number(ing.cost || 0)),
      0
    );

    // E. Accounts Payable (2010)
    const totalPurchasesAmount = (data.purchases || []).reduce(
      (sum: number, p: any) => sum + Number(p.total || 0),
      0
    );
    const totalSupplierPayments = (data.supplierPayments || []).reduce(
      (sum: number, sp: any) => sum + Number(sp.amount || 0),
      0
    );
    const payables = Math.max(0, totalPurchasesAmount - totalSupplierPayments);

    // F. Food Sales Revenue (4010)
    const salesRevenue = (data.orders || []).reduce((sum: number, o: any) => {
      if (o.state === "cancelled") return sum;
      return sum + Number(o.total || 0);
    }, 0);

    // G. Purchases / COGS (5010)
    const purchasesTotal = (data.purchases || []).reduce(
      (sum: number, p: any) => sum + Number(p.total || 0),
      0
    );

    // H. Operating Expenses Breakdown (6010-6080)
    const expenseGroups: Record<string, number> = {};
    (data.expenses || []).forEach((e: any) => {
      const cat = e.category || "Miscellaneous";
      expenseGroups[cat] = (expenseGroups[cat] || 0) + Number(e.amount || 0);
    });
    const totalOperatingExpenses = (data.expenses || []).reduce(
      (sum: number, e: any) => sum + Number(e.amount || 0),
      0
    );

    // I. Net Equity / Capital
    const netRetained = salesRevenue - purchasesTotal - totalOperatingExpenses;
    const totalAssets = Math.max(0, cashInHandBalance) + Math.max(0, bankBalance) + receivables + inventoryVal;

    const groups: any[] = [
      {
        category: isUrdu ? "اثاثہ جات" : "Assets",
        type: "asset",
        accounts: [
          {
            code: "1010",
            name: isUrdu ? "دراز میں نقد رقم" : "Cash in Hand / Drawer",
            english: "Cash in Hand / Drawer",
            balance: cashInHandBalance,
            filterCode: "1010",
          },
          {
            code: "1020",
            name: isUrdu ? "بینک اکاؤنٹ / والٹ" : "Bank & Digital Wallet",
            english: "Bank & Digital Wallet",
            balance: bankBalance,
            filterCode: "1020",
          },
          {
            code: "1030",
            name: isUrdu ? "گاہکوں کا ادھار (وصول طلب)" : "Accounts Receivable",
            english: "Accounts Receivable",
            balance: receivables,
            filterCode: "all",
          },
          {
            code: "1040",
            name: isUrdu ? "موجودہ خام مال و اسٹاک" : "Inventory & Stock Value",
            english: "Inventory & Stock Value",
            balance: inventoryVal,
            filterCode: "5010",
          },
        ],
      },
      {
        category: isUrdu ? "واجبات" : "Liabilities",
        type: "liability",
        accounts: [
          {
            code: "2010",
            name: isUrdu ? "سپلائرز کے واجبات (ادائیگی طلب)" : "Accounts Payable (Suppliers)",
            english: "Accounts Payable (Suppliers)",
            balance: payables,
            filterCode: "5010",
          },
        ],
      },
      {
        category: isUrdu ? "سرمایہ" : "Equity",
        type: "equity",
        accounts: [
          {
            code: "3010",
            name: isUrdu ? "مالک کا سرمایہ (Capital Inflow)" : "Owner Capital Inflow",
            english: "Owner Capital Inflow",
            balance: totalOwnerDeposits,
            filterCode: "3010",
          },
          {
            code: "3020",
            name: isUrdu ? "مالک کی ذاتی نکلوائی (Drawings)" : "Owner Drawings from Profit",
            english: "Owner Drawings from Profit",
            balance: totalOwnerDrawings,
            filterCode: "3020",
          },
          {
            code: "3030",
            name: isUrdu ? "خالص کاروباری بچت و منافع" : "Retained Earnings & Profit",
            english: "Retained Earnings & Profit",
            balance: netRetained,
            filterCode: "all",
          },
        ],
      },
      {
        category: isUrdu ? "آمدنی" : "Revenue",
        type: "income",
        accounts: [
          {
            code: "4010",
            name: isUrdu ? "کھانوں و مشروبات کی فروخت" : "Food & Beverage Sales",
            english: "Food & Beverage Sales",
            balance: salesRevenue,
            filterCode: "all",
          },
        ],
      },
      {
        category: isUrdu ? "لاگت و اخراجات" : "Costs & Expenses",
        type: "expense",
        accounts: [
          {
            code: "5010",
            name: isUrdu ? "خام مال و سامان کی خریداری" : "Cost of Goods / Purchases",
            english: "Cost of Goods / Purchases",
            balance: purchasesTotal,
            filterCode: "5010",
          },
          ...Object.entries(expenseGroups).map(([cat, amount], idx) => ({
            code: `60${10 + idx * 10}`,
            name: getCategoryLabel(cat, isUrdu),
            english: getCategoryLabel(cat, false),
            balance: amount,
            filterCode: "6000",
          })),
        ],
      },
    ];

    // Append custom accounts if any
    if (data.accounts?.length) {
      data.accounts.forEach((ca: any) => {
        const catName = String(ca.category || "Assets").toLowerCase();
        let targetGroup = groups.find((g) => 
          g.type === catName || 
          g.category.toLowerCase().includes(catName)
        );
        if (!targetGroup) targetGroup = groups[0];
        targetGroup.accounts.push({
          id: ca.id,
          code: ca.code || "1090",
          name: isUrdu ? (ca.name || ca.english) : (ca.english || ca.name),
          english: ca.english || "Custom Account",
          balance: Number(ca.openingBalance || 0),
          filterCode: ca.code || "1090",
          isCustom: true,
        });
      });
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
  }, [data, isUrdu]);

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
      const eDate = safeDateStr(e.date || e.businessDate || e.created);
      const amt = Number(e.amount || 0);

      if (eDate === today) todayTotal += amt;
      if (eDate.startsWith(currentMonth)) monthTotal += amt;
      if ((e.method || "Cash") === "Cash") cashTotal += amt;
      else bankTotal += amt;

      const c = e.category || "Miscellaneous";
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
      list: [...data.expenses].sort((a, b) => {
        const timeB = new Date(b.created || b.date || b.businessDate || "").getTime() || 0;
        const timeA = new Date(a.created || a.date || a.businessDate || "").getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      }),
    };
  }, [data, today]);

  // Paginated expenses for Expenses table view
  const totalExpenseCount = expenseStats.list.length;
  const totalExpensePages = Math.max(1, Math.ceil(totalExpenseCount / expensePageSize));
  const safeExpensePage = Math.min(Math.max(1, expensePage), totalExpensePages);
  const paginatedExpenses = useMemo(() => {
    const start = (safeExpensePage - 1) * expensePageSize;
    return expenseStats.list.slice(start, start + expensePageSize);
  }, [expenseStats.list, safeExpensePage, expensePageSize]);

  // Add Expense submission
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      expenseForm.category === "Other"
        ? expenseForm.customCategory.trim() || (isUrdu ? "متفرق خرچہ" : "Miscellaneous")
        : expenseForm.category;

    const amtInRs = parseFloat(expenseForm.amount);
    if (!amtInRs || isNaN(amtInRs) || amtInRs <= 0) {
      setExpenseError(isUrdu ? "برائے مہربانی درست رقم لکھیں۔" : "Please enter a valid amount.");
      return;
    }

    setIsExpenseBusy(true);
    setExpenseError("");
    try {
      const paise = Math.round(amtInRs * 100);
      const nowIso = new Date().toISOString();
      await mutate("expenses", {
        category: finalCategory,
        amount: paise,
        method: expenseForm.method,
        note: expenseForm.note.trim(),
        businessDate: expenseForm.date,
        date: expenseForm.date === today ? nowIso : expenseForm.date,
        created: nowIso,
      });
      setIsAddExpenseOpen(false);
      setExpenseForm({
        category: "Rent",
        customCategory: "",
        amount: "",
        method: "Cash",
        note: "",
        date: today,
      });
      notice(isUrdu ? "نیا خرچہ کامیابی سے محفوظ ہو گیا ہے۔" : "New expense saved successfully.");
    } catch (err: any) {
      setExpenseError(err.message || (isUrdu ? "خرچہ محفوظ کرنے میں خرابی ہوئی۔" : "Failed to save expense."));
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
      const prefixMap: Record<string, string> = {
        Assets: "10",
        Liabilities: "20",
        Equity: "30",
        Revenue: "40",
        Expenses: "60",
      };
      const prefix = prefixMap[accountForm.category] || "10";
      const randomSuffix = Math.floor(10 + Math.random() * 89);
      const autoCode = `${prefix}${randomSuffix}`;

      await mutate("accounts/save", {
        code: autoCode,
        name: accountForm.name.trim(),
        english: accountForm.name.trim(),
        category: accountForm.category,
        openingBalance: opening,
        description: (accountForm.description || "").trim(),
      });
      setIsAddAccountOpen(false);
      setAccountForm({
        name: "",
        category: "Assets",
        openingBalance: "0",
        description: "",
      });
      notice(isUrdu ? "نیا کھاتہ محفوظ ہو گیا ہے۔" : "New account saved successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAccountBusy(false);
    }
  };

  // Delete Custom Account from Chart of Accounts
  const handleDeleteCustomAccount = async (id: number) => {
    const confirmMsg = isUrdu
      ? "کیا آپ واقعی یہ کھاتہ حذف کرنا چاہتے ہیں؟"
      : "Are you sure you want to delete this custom account?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await mutate("accounts/delete", { id });
      notice(isUrdu ? "کھاتہ کامیابی سے حذف ہو گیا۔" : "Account deleted successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: number) => {
    const confirmMsg = isUrdu ? "کیا آپ واقعی یہ خرچہ حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this expense?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await mutate("expenses/delete", { id });
      notice(isUrdu ? "خرچہ حذف کر دیا گیا ہے۔" : "Expense deleted successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Print ledger function (with interactive modal & direct print)
  const handlePrintLedger = () => {
    const accOption =
      selectedAccountFilter === "all"
        ? (isUrdu ? "تمام کھاتے (All Accounts)" : "All Accounts")
        : (chartOfAccounts?.groups?.flatMap((g: any) => g.accounts)?.find((a: any) => a.code === selectedAccountFilter)?.name || selectedAccountFilter);

    const textLines = [
      data?.settings?.name || "Dastarkhwan",
      isUrdu ? "جنرل لیجر اسٹیٹمنٹ رپورٹ" : "General Ledger Statement Report",
      (isUrdu ? "مدت: " : "Period: ") + fromDate + " - " + toDate,
      (isUrdu ? "کھاتہ: " : "Account: ") + accOption,
      "------------------------------------------",
      (isUrdu ? "کل ڈیبٹ: " : "Total Debits: ") + formatPkr(ledgerTotals.debits),
      (isUrdu ? "کل کریڈٹ: " : "Total Credits: ") + formatPkr(ledgerTotals.credits),
      (isUrdu ? "خالص بیلنس: " : "Net Balance: ") + formatPkr(ledgerTotals.net),
      (isUrdu ? "کل اندراجات: " : "Total Count: ") + ledgerTotals.count,
      "==========================================",
      ...filteredLedger.map((e: any) =>
        formatDate(e.date) + " | " + (e.voucherNo || "-") + " | " + (e.debit ? "DR: " + formatPkr(e.debit) : "CR: " + formatPkr(e.credit)) + " | " + (e.particulars || "-")
      )
    ];

    setReportModalData({
      title: isUrdu ? "جنرل لیجر اسٹیٹمنٹ (PDF رپورٹ)" : "General Ledger Statement (PDF Report)",
      subtitle: (isUrdu ? "مدت: " : "Period: ") + fromDate + " تا " + toDate + " | " + (isUrdu ? "کھاتہ: " : "Account: ") + accOption,
      debitLabel: isUrdu ? "کل ڈیبٹ (خرچ / ادا)" : "Total Debits",
      creditLabel: isUrdu ? "کل کریڈٹ (آمدن / وصول)" : "Total Credits",
      netLabel: isUrdu ? "خالص بیلنس" : "Net Balance",
      totals: ledgerTotals,
      rows: filteredLedger.map((e: any) => ({
        date: formatDate(e.date),
        account: getAccountDisplayName(e.accountCode),
        particulars: getParticularsDisplay(e),
        debit: e.debit || 0,
        credit: e.credit || 0,
      })),
      printFn: () => {
        printLedgerReport({
          restaurant: data?.settings || {},
          ledger: filteredLedger,
          totals: ledgerTotals,
          fromDate,
          toDate,
          selectedAccountName: accOption,
          searchQuery,
          isUrdu,
          formatDate,
          getAccountDisplayName,
          getParticularsDisplay,
          getMethodLabel,
        });
      },
      copyText: textLines.join("\n"),
    });

    setIsReportModalOpen(true);
  };

  // Export to CSV / Excel (with interactive modal & direct download)
  const handleExportCsv = () => {
    const accOption =
      selectedAccountFilter === "all"
        ? (isUrdu ? "تمام کھاتے (All Accounts)" : "All Accounts")
        : (chartOfAccounts?.groups?.flatMap((g: any) => g.accounts)?.find((a: any) => a.code === selectedAccountFilter)?.name || selectedAccountFilter);

    const res = downloadLedgerCsv({
      restaurant: data?.settings || {},
      ledger: filteredLedger,
      totals: ledgerTotals,
      fromDate,
      toDate,
      selectedAccountName: accOption,
      isUrdu,
      formatDate,
      getAccountDisplayName,
      getParticularsDisplay,
      getMethodLabel,
      triggerDownload: false,
    });

    const waTextLines = [
      "📊 " + (data?.settings?.name || "Dastarkhwan") + " - " + (isUrdu ? "جنرل لیجر ایکسل رپورٹ" : "General Ledger Report"),
      (isUrdu ? "مدت: " : "Period: ") + fromDate + " تا " + toDate,
      (isUrdu ? "کھاتہ: " : "Account: ") + accOption,
      "------------------------------------------",
      (isUrdu ? "کل ڈیبٹ: " : "Total Debits: ") + formatPkr(ledgerTotals.debits),
      (isUrdu ? "کل کریڈٹ: " : "Total Credits: ") + formatPkr(ledgerTotals.credits),
      (isUrdu ? "خالص بیلنس: " : "Net Balance: ") + formatPkr(ledgerTotals.net),
      (isUrdu ? "کل اندراجات: " : "Total Records: ") + filteredLedger.length,
      "==========================================",
      ...filteredLedger.slice(0, 30).map((e: any) =>
        formatDate(e.date) + " | " + (e.voucherNo || "-") + " | " + (e.debit ? "DR " + formatPkr(e.debit) : "CR " + formatPkr(e.credit)) + " | " + (e.particulars || "-")
      )
    ];

    setExportModalData({
      filename: res?.filename || `General_Ledger_${fromDate}_to_${toDate}.csv`,
      rowCount: filteredLedger.length,
      csvContent: res?.csvContent || "",
      shareText: waTextLines.join("\n"),
      downloadFn: () => {
        downloadLedgerCsv({
          restaurant: data?.settings || {},
          ledger: filteredLedger,
          totals: ledgerTotals,
          fromDate,
          toDate,
          selectedAccountName: accOption,
          isUrdu,
          formatDate,
          getAccountDisplayName,
          getParticularsDisplay,
          getMethodLabel,
          triggerDownload: true,
        });
      },
    });

    setIsExportModalOpen(true);
  };

  // List of Owner / Partner Accounts
  const ownerAccounts = useMemo(() => {
    if (data?.ownerAccounts && Array.isArray(data.ownerAccounts) && data.ownerAccounts.length > 0) {
      return data.ownerAccounts;
    }
    return [
      {
        id: 1,
        name: data?.settings?.ownerName || (isUrdu ? "مرکزی مالک" : "Main Owner"),
        sharePercentage: 100,
        openingBalance: 0,
        description: "Primary Account",
        created: today,
      },
    ];
  }, [data?.ownerAccounts, data?.settings?.ownerName, isUrdu, today]);

  // 4. OWNER'S PERSONAL ACCOUNT CALCULATIONS (Multi-Owner & Partner Support)
  const ownerStats = useMemo(() => {
    if (!data) {
      return {
        periodRevenue: 0,
        periodPurchases: 0,
        periodExpenses: 0,
        periodNetProfit: 0,
        allTimeNetProfit: 0,
        periodDrawings: 0,
        allTimeDrawings: 0,
        periodDeposits: 0,
        allTimeDeposits: 0,
        netAvailableProfit: 0,
        allOwnersTotalBalance: 0,
        ownerBalancesMap: {},
        selectedOwnerName: "",
        filteredList: [],
      };
    }

    // 1. Calculate Restaurant Sales Revenue, Purchases, and Expenses
    let periodRevenue = 0;
    let allTimeRevenue = 0;
    (data.orders || []).forEach((o: any) => {
      if (o.state === "cancelled") return;
      const amt = Number(o.total || 0);
      const oDate = safeDateStr(o.created || o.business_date);
      allTimeRevenue += amt;
      if ((!fromDate || oDate >= fromDate) && (!toDate || oDate <= toDate)) {
        periodRevenue += amt;
      }
    });

    let periodPurchases = 0;
    let allTimePurchases = 0;
    (data.purchases || []).forEach((p: any) => {
      const amt = Number(p.total || 0);
      const pDate = safeDateStr(p.created || p.business_date);
      allTimePurchases += amt;
      if ((!fromDate || pDate >= fromDate) && (!toDate || pDate <= toDate)) {
        periodPurchases += amt;
      }
    });

    let periodExpenses = 0;
    let allTimeExpenses = 0;
    (data.expenses || []).forEach((e: any) => {
      const amt = Number(e.amount || 0);
      const eDate = safeDateStr(e.created || e.businessDate || e.date);
      allTimeExpenses += amt;
      if ((!fromDate || eDate >= fromDate) && (!toDate || eDate <= toDate)) {
        periodExpenses += amt;
      }
    });

    const periodNetProfit = periodRevenue - periodPurchases - periodExpenses;
    const allTimeNetProfit = allTimeRevenue - allTimePurchases - allTimeExpenses;

    // 2. Map all owner drawing and deposit records
    const allOwnerRecords: any[] = (data.ownerDrawings || []).map((od: any) => {
      const ownerId = Number(od.ownerAccountId || 1);
      const acc = ownerAccounts.find((a: any) => a.id === ownerId);
      const fullDate = od.created || od.date || od.businessDate || today;
      return {
        ...od,
        date: fullDate,
        ownerAccountId: ownerId,
        ownerName: acc?.name || (isUrdu ? "مالک" : "Owner"),
        numericAmount: Number(od.amount || 0),
        rawDate: safeDateStr(fullDate),
      };
    });

    // 3. Compute live balances for each individual owner account
    const ownerBalancesMap: Record<number, number> = {};
    let allOwnersTotalBalance = 0;

    ownerAccounts.forEach((acc: any) => {
      const ratio = (Number(acc.sharePercentage) || 100) / 100;
      const allocProfit = Math.round(allTimeNetProfit * ratio);
      let drawings = 0;
      let deposits = 0;
      allOwnerRecords.forEach((od) => {
        if (od.ownerAccountId === acc.id) {
          if (od.type === "draw") drawings += od.numericAmount;
          else deposits += od.numericAmount;
        }
      });
      const bal = allocProfit + deposits - drawings + Number(acc.openingBalance || 0);
      ownerBalancesMap[acc.id] = bal;
      allOwnersTotalBalance += bal;
    });

    // 4. Compute metrics for the currently selected account view
    const isAll = selectedOwnerId === "all";
    const selectedOwner = !isAll ? ownerAccounts.find((a: any) => a.id === selectedOwnerId) : null;
    const shareRatio = selectedOwner ? (Number(selectedOwner.sharePercentage) || 100) / 100 : 1;
    const initialOpeningBalance = selectedOwner
      ? Number(selectedOwner.openingBalance || 0)
      : ownerAccounts.reduce((sum: number, a: any) => sum + Number(a.openingBalance || 0), 0);

    const allocatedPeriodProfit = isAll ? periodNetProfit : Math.round(periodNetProfit * shareRatio);
    const allocatedAllTimeProfit = isAll ? allTimeNetProfit : Math.round(allTimeNetProfit * shareRatio);

    let periodDrawings = 0;
    let allTimeDrawings = 0;
    let periodDeposits = 0;
    let allTimeDeposits = 0;

    allOwnerRecords.forEach((od) => {
      if (!isAll && od.ownerAccountId !== selectedOwnerId) return;

      const amt = od.numericAmount;
      const odDate = safeDateStr(od.rawDate || od.date);
      const inPeriod = (!fromDate || odDate >= fromDate) && (!toDate || odDate <= toDate);

      if (od.type === "draw") {
        allTimeDrawings += amt;
        if (inPeriod) periodDrawings += amt;
      } else {
        allTimeDeposits += amt;
        if (inPeriod) periodDeposits += amt;
      }
    });

    const netAvailableProfit = isAll
      ? allOwnersTotalBalance
      : allocatedAllTimeProfit + allTimeDeposits - allTimeDrawings + initialOpeningBalance;

    // Filtered list for passbook display sorted newest first
    const filteredList = allOwnerRecords
      .filter((od) => {
        if (!isAll && od.ownerAccountId !== selectedOwnerId) return false;
        const odDate = safeDateStr(od.rawDate || od.date);
        if (fromDate && odDate < fromDate) return false;
        if (toDate && odDate > toDate) return false;
        return true;
      })
      .sort((a, b) => {
        const timeB = new Date(b.date || b.created || b.rawDate).getTime() || 0;
        const timeA = new Date(a.date || a.created || a.rawDate).getTime() || 0;
        if (timeB !== timeA) return timeB - timeA;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });

    return {
      periodRevenue,
      periodPurchases,
      periodExpenses,
      periodNetProfit: allocatedPeriodProfit,
      allTimeNetProfit: allocatedAllTimeProfit,
      periodDrawings,
      allTimeDrawings,
      periodDeposits,
      allTimeDeposits,
      netAvailableProfit,
      allOwnersTotalBalance,
      ownerBalancesMap,
      selectedOwnerName: selectedOwner?.name || (isUrdu ? "تمام مالکان" : "All Owners"),
      filteredList,
    };
  }, [data, fromDate, toDate, today, selectedOwnerId, ownerAccounts, isUrdu]);

  // Paginated Owner Drawings for Passbook table
  const totalOwnerCount = ownerStats.filteredList.length;
  const totalOwnerPages = Math.max(1, Math.ceil(totalOwnerCount / ownerPageSize));
  const safeOwnerPage = Math.min(Math.max(1, ownerPage), totalOwnerPages);
  const paginatedOwnerRecords = useMemo(() => {
    const start = (safeOwnerPage - 1) * ownerPageSize;
    return ownerStats.filteredList.slice(start, start + ownerPageSize);
  }, [ownerStats.filteredList, safeOwnerPage, ownerPageSize]);

  // Save Owner / Partner Account (Add or Edit)
  const handleSaveOwnerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerAccountForm.name.trim()) {
      setOwnerAccountError(isUrdu ? "کھاتے کا نام لکھنا ضروری ہے۔" : "Account title is required.");
      return;
    }
    const share = 100;

    setIsOwnerAccountBusy(true);
    setOwnerAccountError("");
    try {
      const openingPaise = Math.round(parseFloat(ownerAccountForm.openingBalance || "0") * 100);
      const res = await mutate("owner/accounts/save", {
        id: ownerAccountForm.id || undefined,
        name: ownerAccountForm.name.trim(),
        sharePercentage: share,
        openingBalance: openingPaise,
        phone: ownerAccountForm.phone.trim(),
        description: ownerAccountForm.description.trim(),
      });
      setIsAddOwnerAccountOpen(false);
      if (res?.id) setSelectedOwnerId(res.id);
      notice(isUrdu ? "مالک / پارٹنر کا کھاتہ کامیابی سے محفوظ ہو گیا۔" : "Owner account saved successfully.");
    } catch (err: any) {
      setOwnerAccountError(err.message || (isUrdu ? "کھاتہ محفوظ کرنے میں خرابی ہوئی۔" : "Failed to save account."));
    } finally {
      setIsOwnerAccountBusy(false);
    }
  };

  // Delete Owner Account
  const handleDeleteOwnerAccount = async (id: number) => {
    if (ownerAccounts.length <= 1) {
      alert(isUrdu ? "کم از کم ایک کھاتہ ہونا ضروری ہے۔" : "At least one owner account must remain.");
      return;
    }
    const confirmMsg = isUrdu ? "کیا آپ واقعی یہ مالک / پارٹنر کھاتہ حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this owner account?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await mutate("owner/accounts/delete", { id });
      if (selectedOwnerId === id) setSelectedOwnerId("all");
      notice(isUrdu ? "کھاتہ حذف کر دیا گیا ہے۔" : "Owner account deleted successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenAddOwnerAccount = () => {
    setOwnerAccountForm({
      id: null,
      name: "",
      sharePercentage: "100",
      openingBalance: "0",
      phone: "",
      description: "",
    });
    setOwnerAccountError("");
    setIsAddOwnerAccountOpen(true);
  };

  const handleOpenEditOwnerAccount = (acc: any) => {
    setOwnerAccountForm({
      id: acc.id,
      name: acc.name,
      sharePercentage: String(acc.sharePercentage ?? 100),
      openingBalance: String((acc.openingBalance || 0) / 100),
      phone: acc.phone || "",
      description: acc.description || "",
    });
    setOwnerAccountError("");
    setIsAddOwnerAccountOpen(true);
  };

  // Save Owner Personal Drawing
  const handleSaveDrawing = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtInRs = parseFloat(drawingForm.amount);
    if (!amtInRs || isNaN(amtInRs) || amtInRs <= 0) {
      setOwnerError(isUrdu ? "برائے مہربانی درست رقم لکھیں۔" : "Please enter a valid amount.");
      return;
    }

    setIsOwnerBusy(true);
    setOwnerError("");
    try {
      const paise = Math.round(amtInRs * 100);
      const nowIso = new Date().toISOString();
      await mutate("owner/drawings/save", {
        type: "draw",
        amount: paise,
        method: drawingForm.method,
        note: drawingForm.note.trim(),
        ownerAccountId: Number(drawingForm.ownerAccountId || (selectedOwnerId !== "all" ? selectedOwnerId : 1)),
        businessDate: drawingForm.date,
        date: drawingForm.date === today ? nowIso : drawingForm.date,
        created: nowIso,
      });
      setIsAddDrawingOpen(false);
      setDrawingForm({
        amount: "",
        method: "Cash",
        note: "",
        date: today,
        ownerAccountId: selectedOwnerId !== "all" ? selectedOwnerId : 1,
      });
      notice(isUrdu ? "ذاتی نکلوائی کامیابی سے درج ہو گئی۔" : "Owner personal drawing saved successfully.");
    } catch (err: any) {
      setOwnerError(err.message || (isUrdu ? "محفوظ کرنے میں خرابی ہوئی۔" : "Failed to save drawing."));
    } finally {
      setIsOwnerBusy(false);
    }
  };

  // Save Owner Capital Injection
  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtInRs = parseFloat(depositForm.amount);
    if (!amtInRs || isNaN(amtInRs) || amtInRs <= 0) {
      setOwnerError(isUrdu ? "برائے مہربانی درست رقم لکھیں۔" : "Please enter a valid amount.");
      return;
    }

    setIsOwnerBusy(true);
    setOwnerError("");
    try {
      const paise = Math.round(amtInRs * 100);
      const nowIso = new Date().toISOString();
      await mutate("owner/drawings/save", {
        type: "deposit",
        amount: paise,
        method: depositForm.method,
        note: depositForm.note.trim(),
        ownerAccountId: Number(depositForm.ownerAccountId || (selectedOwnerId !== "all" ? selectedOwnerId : 1)),
        businessDate: depositForm.date,
        date: depositForm.date === today ? nowIso : depositForm.date,
        created: nowIso,
      });
      setIsAddDepositOpen(false);
      setDepositForm({
        amount: "",
        method: "Cash",
        note: "",
        date: today,
        ownerAccountId: selectedOwnerId !== "all" ? selectedOwnerId : 1,
      });
      notice(isUrdu ? "ذاتی سرمایہ کامیابی سے جمع درج ہو گیا۔" : "Owner capital deposit saved successfully.");
    } catch (err: any) {
      setOwnerError(err.message || (isUrdu ? "محفوظ کرنے میں خرابی ہوئی۔" : "Failed to save capital deposit."));
    } finally {
      setIsOwnerBusy(false);
    }
  };

  // Delete Owner Drawing / Capital
  const handleDeleteOwnerDrawing = async (id: number) => {
    const confirmMsg = isUrdu ? "کیا آپ واقعی یہ اندراج حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this entry?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await mutate("owner/drawings/delete", { id });
      notice(isUrdu ? "اندراج حذف کر دیا گیا ہے۔" : "Entry deleted successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Print Owner Personal Account Passbook (with modal & print)
  const handlePrintOwnerAccount = () => {
    const textLines = [
      data?.settings?.name || "Dastarkhwan",
      ownerStats.selectedOwnerName + " - " + (isUrdu ? "مالک کا ذاتی کھاتہ اسٹیٹمنٹ" : "Owner Personal Account"),
      (isUrdu ? "مدت: " : "Period: ") + fromDate + " - " + toDate,
      "------------------------------------------",
      (isUrdu ? "کل منافع حصہ: " : "Earned Profit Share: ") + formatPkr(ownerStats.periodNetProfit),
      (isUrdu ? "کل نکلوائی گئی رقم: " : "Total Drawings: ") + formatPkr(ownerStats.periodDrawings),
      (isUrdu ? "کل جمع شدہ رقم: " : "Total Deposits: ") + formatPkr(ownerStats.periodDeposits),
      (isUrdu ? "خالص دستیاب بیلنس: " : "Net Available: ") + formatPkr(ownerStats.netAvailableProfit),
      "==========================================",
      ...ownerStats.filteredList.map((e: any) =>
        formatDate(e.date) + " | " + (e.type === "drawing" ? (isUrdu ? "نکلوائی رقم" : "Drawing") : (isUrdu ? "جمع رقم" : "Deposit")) + " | " + formatPkr(e.amount) + " | " + (e.note || "-")
      )
    ];

    setReportModalData({
      title: ownerStats.selectedOwnerName + " - " + (isUrdu ? "ذاتی پاس بک رپورٹ" : "Personal Passbook Report"),
      subtitle: (isUrdu ? "مدت: " : "Period: ") + fromDate + " تا " + toDate,
      debitLabel: isUrdu ? "کل نکلوائی رقم (Drawings)" : "Total Drawings",
      creditLabel: isUrdu ? "کل جمع رقم (Deposits)" : "Total Deposits",
      netLabel: isUrdu ? "خالص منافع / بیلنس" : "Net Balance",
      totals: {
        debits: ownerStats.periodDrawings,
        credits: ownerStats.periodDeposits,
        net: ownerStats.netAvailableProfit,
        count: ownerStats.filteredList.length,
      },
      rows: ownerStats.filteredList.map((e: any) => ({
        date: formatDate(e.date),
        account: e.type === "drawing" ? (isUrdu ? "ذاتی خرچ / نکالنا" : "Owner Drawing") : (isUrdu ? "ذاتی سرمایہ / جمع" : "Owner Deposit"),
        particulars: (e.method || "Cash") + (e.note ? " - " + e.note : ""),
        debit: e.type === "drawing" ? e.amount : 0,
        credit: e.type === "deposit" ? e.amount : 0,
      })),
      printFn: () => {
        printOwnerAccountReport({
          restaurant: data?.settings || {},
          ownerStats: {
            earnedProfit: ownerStats.periodNetProfit,
            totalDrawings: ownerStats.periodDrawings,
            totalDeposits: ownerStats.periodDeposits,
            netBalance: ownerStats.netAvailableProfit,
            list: ownerStats.filteredList,
          },
          accountTitle: ownerStats.selectedOwnerName,
          fromDate,
          toDate,
          isUrdu,
          formatDate,
        });
      },
      copyText: textLines.join("\n"),
    });

    setIsReportModalOpen(true);
  };

  // Export Owner Personal Account CSV (with modal & download)
  const handleExportOwnerCsv = () => {
    const res = downloadOwnerAccountCsv({
      restaurant: data?.settings || {},
      ownerStats: {
        earnedProfit: ownerStats.periodNetProfit,
        totalDrawings: ownerStats.periodDrawings,
        totalDeposits: ownerStats.periodDeposits,
        netBalance: ownerStats.netAvailableProfit,
        list: ownerStats.filteredList,
      },
      accountTitle: ownerStats.selectedOwnerName,
      fromDate,
      toDate,
      isUrdu,
      formatDate,
      triggerDownload: false,
    });

    const waOwnerLines = [
      "📊 " + (data?.settings?.name || "Dastarkhwan") + " - " + ownerStats.selectedOwnerName,
      (isUrdu ? "مالک کا ذاتی کھاتہ ایکسل رپورٹ" : "Owner Personal Account Report"),
      (isUrdu ? "مدت: " : "Period: ") + fromDate + " تا " + toDate,
      "------------------------------------------",
      (isUrdu ? "کل منافع حصہ: " : "Earned Profit: ") + formatPkr(ownerStats.periodNetProfit),
      (isUrdu ? "کل نکلوائی رقم: " : "Total Drawings: ") + formatPkr(ownerStats.periodDrawings),
      (isUrdu ? "کل جمع رقم: " : "Total Deposits: ") + formatPkr(ownerStats.periodDeposits),
      (isUrdu ? "خالص دستیاب بیلنس: " : "Net Available: ") + formatPkr(ownerStats.netAvailableProfit),
      "==========================================",
      ...ownerStats.filteredList.slice(0, 30).map((e: any) =>
        formatDate(e.date) + " | " + (e.type === "drawing" ? (isUrdu ? "نکلوائی رقم" : "Drawing") : (isUrdu ? "جمع رقم" : "Deposit")) + " | " + formatPkr(e.amount) + " | " + (e.note || "-")
      )
    ];

    setExportModalData({
      filename: res?.filename || `Owner_Account_${fromDate}_to_${toDate}.csv`,
      rowCount: ownerStats.filteredList.length,
      csvContent: res?.csvContent || "",
      shareText: waOwnerLines.join("\n"),
      downloadFn: () => {
        downloadOwnerAccountCsv({
          restaurant: data?.settings || {},
          ownerStats: {
            earnedProfit: ownerStats.periodNetProfit,
            totalDrawings: ownerStats.periodDrawings,
            totalDeposits: ownerStats.periodDeposits,
            netBalance: ownerStats.netAvailableProfit,
            list: ownerStats.filteredList,
          },
          accountTitle: ownerStats.selectedOwnerName,
          fromDate,
          toDate,
          isUrdu,
          formatDate,
          triggerDownload: true,
        });
      },
    });

    setIsExportModalOpen(true);
  };

  return (
    <div className="page-content finance-workspace" dir={languageDirection()}>
      {/* Sub Navigation with Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid var(--line)", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div className="subnav" style={{ borderBottom: 0, margin: 0 }}>
          <button
            className={activeTab === "ledger" ? "active" : ""}
            onClick={() => setActiveTab("ledger")}
          >
            📖 {isUrdu ? "جنرل لیجر" : "General Ledger"}
          </button>
          <button
            className={activeTab === "accounts" ? "active" : ""}
            onClick={() => setActiveTab("accounts")}
          >
            🏛️ {isUrdu ? "کھاتے" : "Chart of Accounts"}
          </button>
          <button
            className={activeTab === "expenses" ? "active" : ""}
            onClick={() => setActiveTab("expenses")}
          >
            💸 {isUrdu ? "اخراجات کا انتظام" : "Expenses"}
          </button>
          <button
            className={activeTab === "personal" ? "active" : ""}
            onClick={() => setActiveTab("personal")}
          >
            👤 {isUrdu ? "مالک کا ذاتی کھاتہ" : "Owner's Personal Account"}
          </button>
        </div>
        {activeTab === "accounts" && (
          <div>
            <button
              className="primary compact"
              onClick={() => setIsAddAccountOpen(true)}
            >
              + {isUrdu ? "نیا کھاتہ شامل کریں" : "Add Account"}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: GENERAL LEDGER */}
      {activeTab === "ledger" && (
        <section className="ledger-section">
          {/* Summary Metric Cards */}
          <div className="finance-metrics">
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل ڈیبٹ / آمد" : "Total Debit / Inflow"}</span>
                <span className="card-icon income">📥</span>
              </div>
              <strong className="card-value green">{formatPkr(ledgerTotals.debits)}</strong>
              <small className="card-subtitle">{isUrdu ? "وصول شدہ نقد و ڈیجیٹل رقوم" : "Cash and digital collections"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل کریڈٹ / اخراجات" : "Total Credit / Outflow"}</span>
                <span className="card-icon expense">📤</span>
              </div>
              <strong className="card-value red">{formatPkr(ledgerTotals.credits)}</strong>
              <small className="card-subtitle">{isUrdu ? "خریداری و ادائیگی شدہ اخراجات" : "Purchases and paid expenses"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "خالص لیجر فرق" : "Net Ledger Difference"}</span>
                <span className="card-icon asset">⚖️</span>
              </div>
              <strong className={`card-value ${ledgerTotals.net >= 0 ? "green" : "red"}`}>
                {formatPkr(ledgerTotals.net)}
              </strong>
              <small className="card-subtitle">{isUrdu ? "ڈیبٹ اور کریڈٹ کا توازن" : "Debit and credit balance"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل ٹرانزیکشنز" : "Total Transactions"}</span>
                <span className="card-icon liability">📋</span>
              </div>
              <strong className="card-value">{ledgerTotals.count}</strong>
              <small className="card-subtitle">{isUrdu ? "منتخب مدت کے اندراجات" : "Entries in selected period"}</small>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="finance-controls-bar">
            <div className="finance-filter-group">
              <button
                className={`finance-period-btn ${period === "today" ? "active" : ""}`}
                onClick={() => handlePeriodChange("today")}
              >
                {isUrdu ? "آج" : "Today"}
              </button>
              <button
                className={`finance-period-btn ${period === "week" ? "active" : ""}`}
                onClick={() => handlePeriodChange("week")}
              >
                {isUrdu ? "اس ہفتے" : "This Week"}
              </button>
              <button
                className={`finance-period-btn ${period === "month" ? "active" : ""}`}
                onClick={() => handlePeriodChange("month")}
              >
                {isUrdu ? "اس مہینے" : "This Month"}
              </button>
              <button
                className={`finance-period-btn ${period === "all" ? "active" : ""}`}
                onClick={() => handlePeriodChange("all")}
              >
                {isUrdu ? "تمام" : "All Time"}
              </button>

              <div className="finance-date-inputs">
                <span>{isUrdu ? "از:" : "From:"}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setPeriod("custom");
                    setFromDate(e.target.value);
                  }}
                />
                <span>{isUrdu ? "تا:" : "To:"}</span>
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
                <option value="all">{isUrdu ? "تمام کھاتے" : "All Accounts"}</option>
                <option value="1010">{isUrdu ? "دراز میں نقد" : "Cash in Hand"}</option>
                <option value="1020">{isUrdu ? "بینک / والٹ" : "Bank & Digital Wallet"}</option>
                <option value="3010">{isUrdu ? "مالک کا سرمایہ (Capital Deposit)" : "Owner Capital Deposit"}</option>
                <option value="3020">{isUrdu ? "مالک کی ذاتی نکلوائی (Drawings)" : "Owner Personal Drawings"}</option>
                <option value="5010">{isUrdu ? "خریداری" : "Purchases"}</option>
                <option value="6000">{isUrdu ? "کاروباری اخراجات" : "Operating Expenses"}</option>
                <option value="4030">{isUrdu ? "واپسی بل (ریفنڈ)" : "Refunds"}</option>
                {(data?.accounts || []).map((ca: any) => (
                  <option key={ca.id || ca.code} value={ca.code}>
                    {ca.name} ({ca.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="finance-actions-group">
              <UrduInput
                className="finance-search-input"
                placeholder={isUrdu ? "واؤچر یا تفصیل تلاش کریں…" : "Search voucher or details…"}
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
              />
              <div className="finance-button-cluster">
                <button
                  type="button"
                  className="finance-btn secondary"
                  onClick={handlePrintLedger}
                  title={isUrdu ? "پرنٹ یا PDF محفوظ کریں" : "Print or Save PDF"}
                >
                  🖨️ {isUrdu ? "پرنٹ / PDF" : "Print / PDF"}
                </button>
                <button
                  type="button"
                  className="finance-btn secondary"
                  onClick={handleExportCsv}
                  title={isUrdu ? "ایکسل شیٹ (CSV) ڈاؤن لوڈ کریں" : "Download Excel (CSV)"}
                >
                  📊 {isUrdu ? "ڈاؤن لوڈ ایکسل" : "Download Excel"}
                </button>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="ledger-table-wrap">
            <div className="ledger-table-scroll custom-scrollbar">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>{isUrdu ? "تاریخ و وقت" : "Date & Time"}</th>
                    <th>{isUrdu ? "واؤچر / ریفرنس" : "Voucher / Ref"}</th>
                    <th>{isUrdu ? "کھاتہ" : "Account"}</th>
                    <th>{isUrdu ? "تفصیل" : "Particulars"}</th>
                    <th>{isUrdu ? "طریقہ" : "Method"}</th>
                    <th>{isUrdu ? "ڈیبٹ (آمد PKR)" : "Debit (In PKR)"}</th>
                    <th>{isUrdu ? "کریڈٹ (خرچ PKR)" : "Credit (Out PKR)"}</th>
                    <th>{isUrdu ? "خالص بیلنس (PKR)" : "Net Balance (PKR)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLedger.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        {isUrdu ? "اس مدت میں کوئی مالیاتی اندراج موجود نہیں ہے۔" : "No financial transactions found for this period."}
                      </td>
                    </tr>
                  ) : (
                    paginatedLedger.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>{formatDate(tx.date)}</td>
                        <td>
                          <span className={`ledger-ref-badge badge-${tx.type}`}>{tx.ref}</span>
                        </td>
                        <td>
                          <strong>{getAccountDisplayName(tx, isUrdu)}</strong>
                        </td>
                        <td>{getParticularsDisplay(tx, isUrdu)}</td>
                        <td>
                          <span style={{ fontSize: "11px", color: "var(--muted)" }}>{getMethodLabel(tx.method, isUrdu)}</span>
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

            <PaginationControl
              currentPage={safeLedgerPage}
              totalPages={totalLedgerPages}
              pageSize={ledgerPageSize}
              totalItems={totalLedgerCount}
              onPageChange={(p) => setLedgerPage(p)}
              onPageSizeChange={(s) => {
                setLedgerPageSize(s);
                setLedgerPage(1);
              }}
              isUrdu={isUrdu}
            />
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
                <span className="card-title">{isUrdu ? "کل اثاثہ جات" : "Total Assets"}</span>
                <span className="card-icon asset">🏛️</span>
              </div>
              <strong className="card-value green">{formatPkr(chartOfAccounts.summary.totalAssets)}</strong>
              <small className="card-subtitle">{isUrdu ? "کیش، بینک، ادھار، اور اسٹاک کی مالیت" : "Cash, bank, receivables & inventory"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل واجبات" : "Total Liabilities"}</span>
                <span className="card-icon liability">⚠️</span>
              </div>
              <strong className="card-value red">{formatPkr(chartOfAccounts.summary.payables)}</strong>
              <small className="card-subtitle">{isUrdu ? "سپلائرز کے واجب الادا بقایا جات" : "Payables due to suppliers"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل فروخت" : "Total Revenue"}</span>
                <span className="card-icon income">📈</span>
              </div>
              <strong className="card-value green">{formatPkr(chartOfAccounts.summary.salesRevenue)}</strong>
              <small className="card-subtitle">{isUrdu ? "کھانوں اور مشروبات کی مجموعی فروخت" : "Total food & beverage sales"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "کل اخراجات و لاگت" : "Total Costs & Expenses"}</span>
                <span className="card-icon expense">📉</span>
              </div>
              <strong className="card-value red">{formatPkr(chartOfAccounts.summary.totalExpenses)}</strong>
              <small className="card-subtitle">{isUrdu ? "خام مال خریداری اور تمام کاروباری اخراجات" : "Raw materials & operating expenses"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "خالص سرمایہ و بچت" : "Net Equity / Capital"}</span>
                <span className="card-icon asset">💰</span>
              </div>
              <strong className={`card-value ${(Number(chartOfAccounts.summary.netRetained) || 0) >= 0 ? "green" : "red"}`}>
                {formatPkr(chartOfAccounts.summary.netRetained)}
              </strong>
              <small className="card-subtitle">{isUrdu ? "خالص کاروباری منافع" : "Net retained business profit"}</small>
            </div>
          </div>

          {/* Accounts Grouped List */}
          {chartOfAccounts.groups.map((group) => (
            <div key={group.category} style={{ marginBottom: "28px" }}>
              <div className="coa-section-header">
                <h3>{group.category}</h3>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {group.accounts.length} {isUrdu ? "کھاتے" : "Accounts"}
                </span>
              </div>

              <div className="coa-account-grid">
                {group.accounts.map((acc: any) => (
                  <div key={acc.code + acc.name} className="coa-account-card">
                    <div className="coa-account-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="coa-account-code">{acc.code}</span>
                        <h4 className="coa-account-name">
                          {isUrdu ? acc.name : (acc.english || acc.name)}
                        </h4>
                        {isUrdu && acc.english && acc.english !== acc.name && (
                          <span className="coa-account-english">{acc.english}</span>
                        )}
                      </div>
                      {acc.isCustom && acc.id && (
                        <button
                          type="button"
                          className="finance-btn secondary compact"
                          style={{ padding: "3px 8px", fontSize: "11px", color: "#c0392b", borderColor: "#fca5a5" }}
                          onClick={() => handleDeleteCustomAccount(acc.id)}
                          title={isUrdu ? "یہ کھاتہ حذف کریں" : "Delete Account"}
                        >
                          🗑️ {isUrdu ? "حذف" : "Delete"}
                        </button>
                      )}
                    </div>

                    <div className="coa-account-bottom">
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted)", display: "block" }}>
                          {isUrdu ? "موجودہ بیلنس:" : "Current Balance:"}
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
                        {isUrdu ? "لیجر دیکھیں ←" : "View Ledger →"}
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
                <span className="card-title">{isUrdu ? "آج کے اخراجات" : "Today's Expenses"}</span>
                <span className="card-icon expense">📅</span>
              </div>
              <strong className="card-value red">{formatPkr(expenseStats.todayTotal)}</strong>
              <small className="card-subtitle">{isUrdu ? "آج کی تاریخ میں درج شدہ خرچے" : "Expenses recorded today"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "اس مہینے کے اخراجات" : "This Month's Expenses"}</span>
                <span className="card-icon expense">🗓️</span>
              </div>
              <strong className="card-value red">{formatPkr(expenseStats.monthTotal)}</strong>
              <small className="card-subtitle">{isUrdu ? "رواں ماہ کا کل خرچہ" : "Total expenses this month"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "نقد اخراجات" : "Cash Expenses"}</span>
                <span className="card-icon liability">💵</span>
              </div>
              <strong className="card-value">{formatPkr(expenseStats.cashTotal)}</strong>
              <small className="card-subtitle">{isUrdu ? "دراز سے کی گئی ادائیگیاں" : "Paid from cash drawer"}</small>
            </div>

            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">{isUrdu ? "بینک / کارڈ اخراجات" : "Bank & Card Expenses"}</span>
                <span className="card-icon asset">💳</span>
              </div>
              <strong className="card-value">{formatPkr(expenseStats.bankTotal)}</strong>
              <small className="card-subtitle">{isUrdu ? "بینک یا والٹ سے ادائیگی" : "Paid via bank or digital wallet"}</small>
            </div>
          </div>

          {/* Expense Category Breakdown */}
          {expenseStats.categories.length > 0 && (
            <div className="expense-breakdown-card">
              <h3>{isUrdu ? "اخراجات کی تفصیل بلحاظ شعبہ" : "Expense Breakdown by Category"}</h3>
              <div className="expense-progress-bar">
                {expenseStats.categories.map((c) => (
                  <div
                    key={c.name}
                    className="expense-progress-seg"
                    style={{ width: `${c.percentage}%`, background: c.color }}
                    title={`${getCategoryLabel(c.name, isUrdu)}: ${formatPkr(c.amount)} (${c.percentage}%)`}
                  />
                ))}
              </div>

              <div className="expense-chips-grid">
                {expenseStats.categories.map((c) => (
                  <div key={c.name} className="expense-chip">
                    <span className="expense-chip-color" style={{ background: c.color }} />
                    <strong>{getCategoryLabel(c.name, isUrdu)}:</strong>
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
              <h3 style={{ margin: 0, fontSize: "16px" }}>{isUrdu ? "تمام درج شدہ اخراجات کی فہرست" : "All Recorded Expenses"}</h3>
              <button className="primary compact" onClick={() => setIsAddExpenseOpen(true)}>
                + {isUrdu ? "نیا خرچہ شامل کریں" : "Add Expense"}
              </button>
            </div>

            <div className="ledger-table-scroll custom-scrollbar">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>{isUrdu ? "تاریخ" : "Date"}</th>
                    <th>{isUrdu ? "شعبہ / کیٹیگری" : "Category"}</th>
                    <th>{isUrdu ? "طریقہ ادائیگی" : "Payment Method"}</th>
                    <th>{isUrdu ? "تفصیل / نوٹس" : "Particulars / Notes"}</th>
                    <th>{isUrdu ? "رقم (PKR)" : "Amount (PKR)"}</th>
                    <th>{isUrdu ? "عمل" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        {isUrdu ? "ابھی تک کوئی خرچہ درج نہیں کیا گیا ہے۔" : "No expenses recorded yet."}
                      </td>
                    </tr>
                  ) : (
                    paginatedExpenses.map((exp: any) => (
                      <tr key={exp.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDate(exp.created || exp.businessDate || exp.date)}
                        </td>
                        <td>
                          <strong style={{ color: "var(--ink)" }}>{getCategoryLabel(exp.category, isUrdu)}</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", padding: "3px 8px", background: "#f2f4f1", borderRadius: "6px" }}>
                            {getMethodLabel(exp.method, isUrdu)}
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
                            🗑️ {isUrdu ? "حذف" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControl
              currentPage={safeExpensePage}
              totalPages={totalExpensePages}
              pageSize={expensePageSize}
              totalItems={totalExpenseCount}
              onPageChange={(p) => setExpensePage(p)}
              onPageSizeChange={(s) => {
                setExpensePageSize(s);
                setExpensePage(1);
              }}
              isUrdu={isUrdu}
            />
          </div>
        </section>
      )}

      {/* TAB 4: OWNER'S PERSONAL ACCOUNT */}
      {activeTab === "personal" && (
        <section className="owner-section">
          {/* Explanation Banner */}
          <div className="owner-info-banner">
            <div className="owner-info-text">
              <span className="owner-info-icon">💡</span>
              <div>
                <h4 className="owner-info-title">
                  {isUrdu ? "مالک کا ذاتی کھاتہ اور نفع کا خودکار نظام" : "Owner's Personal Account & Profit Auto-Link"}
                </h4>
                <p className="owner-info-desc">
                  {isUrdu
                    ? "یہ کھاتہ ریسٹورانٹ کے خالص منافع (Net Profit) کے ساتھ خودکار منسلک ہے۔ مالک کی طرف سے ذاتی استعمال کے لیے نکالی گئی رقوم (Drawings) صرف مالک کے منافع میں سے منہا ہوتی ہیں اور ریسٹورانٹ کے فوڈ مارجن، کچن کے اخراجات یا کھانوں کی لاگت پر کوئی منفی اثر نہیں ڈالتی۔"
                    : "This account is auto-linked to the restaurant's Net Profit. Personal withdrawals (Drawings) reduce only the owner's share of profits, keeping food costs, kitchen expenses, and restaurant operating margins 100% accurate."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="primary compact"
                style={{ background: "#c0392b", borderColor: "#c0392b" }}
                onClick={() => setIsAddDrawingOpen(true)}
              >
                💸 {isUrdu ? "نفع سے رقم نکالیں (Drawings)" : "Withdraw from Profit"}
              </button>
              <button
                type="button"
                className="primary compact"
                style={{ background: "#27ae60", borderColor: "#27ae60" }}
                onClick={() => setIsAddDepositOpen(true)}
              >
                📥 {isUrdu ? "سرمایہ جمع کرائیں (Capital)" : "Add Capital"}
              </button>
            </div>
          </div>

          {/* Owner / Partner Accounts Switcher Bar */}
          <div className="owner-accounts-bar">
            <button
              type="button"
              className={`owner-account-chip ${selectedOwnerId === "all" ? "active" : ""}`}
              onClick={() => setSelectedOwnerId("all")}
            >
              <span className="owner-chip-icon">👥</span>
              <div className="owner-chip-details">
                <span className="owner-chip-name">{isUrdu ? "تمام مالکان (مشترکہ)" : "All Owners (Combined)"}</span>
                <span className="owner-chip-balance">
                  {formatPkr(ownerStats.allOwnersTotalBalance)}
                </span>
              </div>
            </button>

            {ownerAccounts.map((acc: any) => {
              const isSelected = selectedOwnerId === acc.id;
              const accBal = ownerStats.ownerBalancesMap[acc.id] ?? 0;
              return (
                <div
                  key={acc.id}
                  className={`owner-account-chip ${isSelected ? "active" : ""}`}
                  onClick={() => setSelectedOwnerId(acc.id)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="owner-chip-icon">👤</span>
                  <div className="owner-chip-details">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className="owner-chip-name">{acc.name}</span>
                    </div>
                    <span className="owner-chip-balance">
                      {formatPkr(accBal)}
                    </span>
                  </div>
                  <div className="owner-chip-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      title={isUrdu ? "تبدیل کریں" : "Edit"}
                      onClick={() => handleOpenEditOwnerAccount(acc)}
                    >
                      ✏️
                    </button>
                    {ownerAccounts.length > 1 && (
                      <button
                        type="button"
                        title={isUrdu ? "حذف کریں" : "Delete"}
                        onClick={() => handleDeleteOwnerAccount(acc.id)}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="btn-add-owner-acc"
              onClick={handleOpenAddOwnerAccount}
            >
              ➕ {isUrdu ? "نیا مالک / کھاتہ شامل کریں" : "Add Owner Account"}
            </button>
          </div>

          {/* KPI Metrics Cards */}
          <div className="finance-metrics">
            {/* Card 1: Net Profit (Auto-linked) */}
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">
                  {isUrdu ? "کل کمایا گیا خالص منافع" : "Total Net Profit Earned"}
                </span>
                <span className="card-icon income">💰</span>
              </div>
              <strong className={`card-value ${ownerStats.periodNetProfit >= 0 ? "green" : "red"}`}>
                {formatPkr(ownerStats.periodNetProfit)}
              </strong>
              <small className="card-subtitle">
                {isUrdu
                  ? `منتخب مدت: فروخت ${formatPkr(ownerStats.periodRevenue)} - لاگت ${formatPkr(ownerStats.periodExpenses + ownerStats.periodPurchases)}`
                  : `Period Sales ${formatPkr(ownerStats.periodRevenue)} minus Costs`}
              </small>
            </div>

            {/* Card 2: Personal Drawings */}
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">
                  {isUrdu ? "ذاتی نکلوائی (Drawings)" : "Owner Drawings"}
                </span>
                <span className="card-icon expense">📤</span>
              </div>
              <strong className="card-value red">{formatPkr(ownerStats.periodDrawings)}</strong>
              <small className="card-subtitle">
                {isUrdu
                  ? `کل اب تک کی نکلوائی: ${formatPkr(ownerStats.allTimeDrawings)}`
                  : `All-time Drawings: ${formatPkr(ownerStats.allTimeDrawings)}`}
              </small>
            </div>

            {/* Card 3: Capital Inflow */}
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">
                  {isUrdu ? "ہوٹل میں ڈالا گیا سرمایہ" : "Capital Injected"}
                </span>
                <span className="card-icon asset">📥</span>
              </div>
              <strong className="card-value blue">{formatPkr(ownerStats.periodDeposits)}</strong>
              <small className="card-subtitle">
                {isUrdu
                  ? `کل اب تک کا سرمایہ: ${formatPkr(ownerStats.allTimeDeposits)}`
                  : `All-time Capital: ${formatPkr(ownerStats.allTimeDeposits)}`}
              </small>
            </div>

            {/* Card 4: Net Available Profit Balance */}
            <div className="finance-metric-card">
              <div className="card-head">
                <span className="card-title">
                  {isUrdu ? "موجودہ قابلِ نکلوائی منافع" : "Available Profit Balance"}
                </span>
                <span className="card-icon liability">⚖️</span>
              </div>
              <strong className={`card-value ${ownerStats.netAvailableProfit >= 0 ? "green" : "red"}`}>
                {formatPkr(ownerStats.netAvailableProfit)}
              </strong>
              <small className="card-subtitle">
                {isUrdu
                  ? "کل منافع + سرمایہ - ذاتی نکلوائی"
                  : "All-time Profit + Capital - Drawings"}
              </small>
            </div>
          </div>

          {/* Controls & Period Filter Bar */}
          <div className="finance-controls-bar">
            <div className="finance-filter-group">
              <button
                type="button"
                className={`finance-period-btn ${period === "today" ? "active" : ""}`}
                onClick={() => handlePeriodChange("today")}
              >
                {isUrdu ? "آج" : "Today"}
              </button>
              <button
                type="button"
                className={`finance-period-btn ${period === "week" ? "active" : ""}`}
                onClick={() => handlePeriodChange("week")}
              >
                {isUrdu ? "اس ہفتے" : "This Week"}
              </button>
              <button
                type="button"
                className={`finance-period-btn ${period === "month" ? "active" : ""}`}
                onClick={() => handlePeriodChange("month")}
              >
                {isUrdu ? "اس مہینے" : "This Month"}
              </button>
              <button
                type="button"
                className={`finance-period-btn ${period === "all" ? "active" : ""}`}
                onClick={() => handlePeriodChange("all")}
              >
                {isUrdu ? "تمام تاریخیں" : "All Time"}
              </button>
            </div>

            <div className="finance-date-inputs">
              <label>
                <span>{isUrdu ? "سے:" : "From:"}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setPeriod("custom");
                    setFromDate(e.target.value);
                  }}
                />
              </label>
              <label>
                <span>{isUrdu ? "تک:" : "To:"}</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setPeriod("custom");
                    setToDate(e.target.value);
                  }}
                />
              </label>
            </div>
          </div>

          {/* Passbook / Statement Table */}
          <div className="ledger-table-wrap" style={{ marginTop: "24px", width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
                background: "#ffffff",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                  {isUrdu ? "مالک کی پاس بک / اسٹیٹمنٹ" : "Owner's Personal Passbook / Statement"}
                </h3>
                <span className="table-count-badge" style={{ marginTop: "4px", display: "inline-block" }}>
                  {ownerStats.filteredList.length} {isUrdu ? "اندراجات" : "entries"}
                </span>
              </div>
              <div className="finance-button-cluster">
                <button
                  type="button"
                  className="finance-btn secondary"
                  onClick={handlePrintOwnerAccount}
                  title={isUrdu ? "پرنٹ یا پی ڈی ایف ڈاؤن لوڈ کریں" : "Print or save as PDF"}
                >
                  🖨️ {isUrdu ? "پرنٹ / PDF" : "Print / PDF"}
                </button>
                <button
                  type="button"
                  className="finance-btn secondary"
                  onClick={handleExportOwnerCsv}
                  title={isUrdu ? "ایکسل شیٹ ڈاؤن لوڈ کریں" : "Download Excel"}
                >
                  📊 {isUrdu ? "ڈاؤن لوڈ ایکسل" : "Download Excel"}
                </button>
              </div>
            </div>

            <div className="ledger-table-scroll custom-scrollbar" style={{ width: "100%" }}>
              <table className="ledger-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>{isUrdu ? "تاریخ" : "Date"}</th>
                    <th>{isUrdu ? "مالک / کھاتہ" : "Owner / Account"}</th>
                    <th>{isUrdu ? "قسم" : "Type"}</th>
                    <th>{isUrdu ? "ذریعہ (طریقہ)" : "Source / Method"}</th>
                    <th>{isUrdu ? "تفصیل / وجہ" : "Description / Purpose"}</th>
                    <th style={{ textAlign: isUrdu ? "left" : "right" }}>{isUrdu ? "رقم (PKR)" : "Amount (PKR)"}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOwnerRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
                        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📝</div>
                        {isUrdu
                          ? "اس مدت میں مالک کے ذاتی اکاؤنٹ کا کوئی اندراج نہیں ملا۔"
                          : "No owner drawings or capital records found for this period."}
                      </td>
                    </tr>
                  ) : (
                    paginatedOwnerRecords.map((item: any) => {
                      const isDraw = item.type === "draw";
                      return (
                        <tr key={item.id}>
                          <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.date || item.created || item.rawDate)}</td>
                          <td style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                            {item.ownerName || (isUrdu ? "عمومی مالک" : "General Owner")}
                          </td>
                          <td>
                            {isDraw ? (
                              <span className="badge-owner-drawing">
                                📤 {isUrdu ? "ذاتی نکلوائی (Drawings)" : "Drawing"}
                              </span>
                            ) : (
                              <span className="badge-owner-deposit">
                                📥 {isUrdu ? "سرمایہ جمع (Capital)" : "Capital Inflow"}
                              </span>
                            )}
                          </td>
                          <td>{getMethodLabel(item.method, isUrdu)}</td>
                          <td>
                            <strong>{item.note || (isDraw ? (isUrdu ? "ذاتی استعمال کے لیے نکلوائی" : "Personal drawing") : (isUrdu ? "ہوٹل میں سرمایہ جمع کروایا" : "Capital injection"))}</strong>
                          </td>
                          <td
                            style={{
                              textAlign: isUrdu ? "left" : "right",
                              fontWeight: 700,
                              color: isDraw ? "#c0392b" : "#27ae60",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isDraw ? `-${formatPkr(item.numericAmount)}` : `+${formatPkr(item.numericAmount)}`}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <PaginationControl
              currentPage={safeOwnerPage}
              totalPages={totalOwnerPages}
              pageSize={ownerPageSize}
              totalItems={totalOwnerCount}
              onPageChange={(p) => setOwnerPage(p)}
              onPageSizeChange={(s) => {
                setOwnerPageSize(s);
                setOwnerPage(1);
              }}
              isUrdu={isUrdu}
            />
          </div>
        </section>
      )}

      {/* MODAL 1: ADD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={isUrdu ? "نیا خرچہ درج کریں" : "Add Expense"}>
            <header>
              <h2>{isUrdu ? "نیا خرچہ درج کریں" : "Add Expense"}</h2>
              <button onClick={() => setIsAddExpenseOpen(false)} disabled={isExpenseBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveExpense}>
              <label className="field">
                <span>{isUrdu ? "تاریخ" : "Date"}</span>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "خرچے کی قسم / شعبہ" : "Expense Category"}</span>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? c.ur : c.en}
                    </option>
                  ))}
                </select>
              </label>

              {expenseForm.category === "Other" && (
                <label className="field">
                  <span>{isUrdu ? "کیٹیگری کا نام لکھیں" : "Enter Category Name"}</span>
                  <UrduInput
                    required
                    placeholder={isUrdu ? "مثلاً پیکنگ میٹریل" : "e.g. Packaging Material"}
                    value={expenseForm.customCategory}
                    onChange={(e: any) => setExpenseForm({ ...expenseForm, customCategory: e.target.value })}
                  />
                </label>
              )}

              <label className="field">
                <span>{isUrdu ? "رقم (PKR)" : "Amount (PKR)"}</span>
                <UrduInput
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder={isUrdu ? "مثلاً 5000" : "e.g. 5000"}
                  value={expenseForm.amount}
                  onChange={(e: any) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "ادائیگی کا طریقہ" : "Payment Method"}</span>
                <select
                  value={expenseForm.method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                >
                  <option value="Cash">{isUrdu ? "نقد دراز سے" : "Cash (Drawer)"}</option>
                  <option value="Bank/Wallet">{isUrdu ? "بینک / والٹ" : "Bank / Digital Wallet"}</option>
                  <option value="Card">{isUrdu ? "کارڈ" : "Card"}</option>
                </select>
              </label>

              <label className="field">
                <span>{isUrdu ? "تفصیل یا نوٹس" : "Note / Description"}</span>
                <UrduInput
                  placeholder={isUrdu ? "مثلاً بجلی کا بل جمع کروایا" : "e.g. Electricity bill payment"}
                  value={expenseForm.note}
                  onChange={(e: any) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                />
              </label>

              {expenseError && <p className="error">{expenseError}</p>}

              <button className="primary wide" type="submit" disabled={isExpenseBusy}>
                {isUrdu 
                  ? (isExpenseBusy ? "محفوظ ہو رہا ہے…" : "خرچہ محفوظ کریں") 
                  : (isExpenseBusy ? "Saving…" : "Save Expense")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddExpenseOpen(false)} disabled={isExpenseBusy} />
          </section>
        </div>
      )}

      {/* MODAL 2: ADD ACCOUNT */}
      {isAddAccountOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={isUrdu ? "نیا کھاتہ شامل کریں" : "Add New Account"}>
            <header>
              <h2>{isUrdu ? "نیا کھاتہ شامل کریں" : "Add New Account"}</h2>
              <button onClick={() => setIsAddAccountOpen(false)} disabled={isAccountBusy}>
                ✕
              </button>
            </header>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#166534", margin: "16px 20px 8px", lineHeight: "1.5" }}>
              💡 <strong>{isUrdu ? "رہنمائی:" : "Notice:"}</strong>{" "}
              {isUrdu
                ? "یہ عمومی کاروباری کھاتہ ہے۔ اگر آپ ہوٹل کے مالک کا ذاتی کھاتہ (منافع و ذاتی نکلوائی کے ساتھ) بنانا چاہتے ہیں، تو برائے مہربانی 'Owner\'s Personal Account' ٹیب استعمال کریں۔"
                : "This is for business ledger accounts. To add an Owner\'s Personal Account (auto-linked to Net Profit & drawings), please use the 'Owner\'s Personal Account' tab."}
            </div>

            <form onSubmit={handleSaveAccount}>
              {/* 1. Account Title */}
              <label className="field">
                <span>{isUrdu ? "کھاتے کا عنوان / نام" : "Account Title"}</span>
                <UrduInput
                  required
                  placeholder={isUrdu ? "مثلاً میزان بینک، نقد دراز، یا کچن سامان" : "e.g. Meezan Bank Current Account or Petty Cash"}
                  value={accountForm.name}
                  onChange={(e: any) => setAccountForm({ ...accountForm, name: e.target.value })}
                />
              </label>

              {/* 2. Account Category */}
              <label className="field">
                <span>{isUrdu ? "کھاتے کی قسم" : "Account Category"}</span>
                <select
                  value={accountForm.category}
                  onChange={(e) => setAccountForm({ ...accountForm, category: e.target.value })}
                >
                  <option value="Assets">{isUrdu ? "اثاثہ جات (کیش، بینک وغیرہ)" : "Assets (Cash, Bank, etc.)"}</option>
                  <option value="Liabilities">{isUrdu ? "واجبات (ادھار، قرض وغیرہ)" : "Liabilities (Payables, etc.)"}</option>
                  <option value="Equity">{isUrdu ? "سرمایہ" : "Equity (Capital)"}</option>
                  <option value="Revenue">{isUrdu ? "آمدنی" : "Revenue (Sales)"}</option>
                  <option value="Expenses">{isUrdu ? "اخراجات" : "Expenses (Operating)"}</option>
                </select>
              </label>

              {/* 3. Opening Balance (PKR) */}
              <label className="field">
                <span>{isUrdu ? "ابتدائی بیلنس (PKR)" : "Opening Balance (PKR)"}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={accountForm.openingBalance}
                  onChange={(e) => setAccountForm({ ...accountForm, openingBalance: e.target.value })}
                />
              </label>

              {/* 4. Description / Notes (Optional) */}
              <label className="field">
                <span>{isUrdu ? "تفصیل / نوٹس (اختیاری)" : "Description / Notes (Optional)"}</span>
                <UrduInput
                  placeholder={isUrdu ? "اکاؤنٹ نمبر یا نوٹس (اختیاری)" : "Account number or notes (optional)"}
                  value={accountForm.description}
                  onChange={(e: any) => setAccountForm({ ...accountForm, description: e.target.value })}
                />
              </label>

              <button className="primary wide" type="submit" disabled={isAccountBusy}>
                {isUrdu 
                  ? (isAccountBusy ? "محفوظ ہو رہا ہے…" : "کھاتہ محفوظ کریں") 
                  : (isAccountBusy ? "Saving…" : "Save Account")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddAccountOpen(false)} disabled={isAccountBusy} />
          </section>
        </div>
      )}

      {/* MODAL 3: ADD OWNER PERSONAL DRAWING */}
      {isAddDrawingOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={isUrdu ? "نفع سے رقم نکالیں (Drawings)" : "Withdraw from Profit"}>
            <header>
              <h2>{isUrdu ? "نفع سے رقم نکالیں (Drawings)" : "Withdraw from Profit (Personal Drawing)"}</h2>
              <button onClick={() => setIsAddDrawingOpen(false)} disabled={isOwnerBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveDrawing}>
              <div style={{ background: "#fdf2f2", padding: "12px 14px", borderRadius: "8px", border: "1px solid #fadbd8", marginBottom: "16px", fontSize: "12px", color: "#78281f" }}>
                ℹ️ {isUrdu
                  ? "یہ رقم صرف آپ کے کل منافع میں سے منہا ہوگی۔ کچن کے اخراجات یا کھانوں کے مارجن پر اس کا کوئی اثر نہیں پڑے گا۔"
                  : "This amount will only deduct from your accumulated Net Profit without affecting kitchen costs or dish margins."}
              </div>

              {/* Owner / Account Selection */}
              <label className="field">
                <span>{isUrdu ? "مالک / کھاتہ منتخب کریں" : "Select Owner / Account"}</span>
                <select
                  value={drawingForm.ownerAccountId}
                  onChange={(e) => setDrawingForm({ ...drawingForm, ownerAccountId: Number(e.target.value) })}
                >
                  {ownerAccounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>{isUrdu ? "تاریخ" : "Date"}</span>
                <input
                  type="date"
                  required
                  value={drawingForm.date}
                  onChange={(e) => setDrawingForm({ ...drawingForm, date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "نکلوائی جانے والی رقم (PKR)" : "Withdrawal Amount (PKR)"}</span>
                <UrduInput
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder={isUrdu ? "مثلاً 20000" : "e.g. 20000"}
                  value={drawingForm.amount}
                  onChange={(e: any) => setDrawingForm({ ...drawingForm, amount: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "رقم کہاں سے نکالی؟ (طریقہ)" : "Source / Payment Method"}</span>
                <select
                  value={drawingForm.method}
                  onChange={(e) => setDrawingForm({ ...drawingForm, method: e.target.value })}
                >
                  <option value="Cash">{isUrdu ? "نقد دراز سے (Cash Drawer)" : "Cash (Drawer)"}</option>
                  <option value="Bank/Wallet">{isUrdu ? "بینک اکاؤنٹ / والٹ" : "Bank Account / Digital Wallet"}</option>
                </select>
              </label>

              <label className="field">
                <span>{isUrdu ? "تفصیل / وجہ" : "Description / Purpose"}</span>
                <UrduInput
                  placeholder={isUrdu ? "مثلاً گھر کا کرایہ یا ذاتی ضرورت" : "e.g. Home rent or personal expense"}
                  value={drawingForm.note}
                  onChange={(e: any) => setDrawingForm({ ...drawingForm, note: e.target.value })}
                />
              </label>

              {ownerError && <p className="error">{ownerError}</p>}

              <button className="primary wide" type="submit" disabled={isOwnerBusy} style={{ background: "#c0392b", borderColor: "#c0392b" }}>
                {isUrdu
                  ? (isOwnerBusy ? "محفوظ ہو رہا ہے…" : "نکلوائی محفوظ کریں")
                  : (isOwnerBusy ? "Saving…" : "Save Withdrawal")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddDrawingOpen(false)} disabled={isOwnerBusy} />
          </section>
        </div>
      )}

      {/* MODAL 4: ADD OWNER CAPITAL INJECTION */}
      {isAddDepositOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={isUrdu ? "ہوٹل میں ذاتی سرمایہ جمع کرائیں" : "Deposit Personal Capital"}>
            <header>
              <h2>{isUrdu ? "ہوٹل میں ذاتی سرمایہ جمع کرائیں" : "Deposit Personal Capital (Capital Inflow)"}</h2>
              <button onClick={() => setIsAddDepositOpen(false)} disabled={isOwnerBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveDeposit}>
              <div style={{ background: "#eafaf1", padding: "12px 14px", borderRadius: "8px", border: "1px solid #a9dfbf", marginBottom: "16px", fontSize: "12px", color: "#145a32" }}>
                ℹ️ {isUrdu
                  ? "جب آپ اپنی ذاتی جیب یا ذاتی اکاؤنٹ سے ہوٹل کی دراز یا بینک میں رقم ڈالیں گے، تو وہ بطور ذاتی سرمایہ جمع ہوگی۔"
                  : "When you deposit personal funds into the restaurant drawer or bank, it is recorded as your injected equity capital."}
              </div>

              {/* Owner / Account Selection */}
              <label className="field">
                <span>{isUrdu ? "مالک / کھاتہ منتخب کریں" : "Select Owner / Account"}</span>
                <select
                  value={depositForm.ownerAccountId}
                  onChange={(e) => setDepositForm({ ...depositForm, ownerAccountId: Number(e.target.value) })}
                >
                  {ownerAccounts.map((acc: any) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>{isUrdu ? "تاریخ" : "Date"}</span>
                <input
                  type="date"
                  required
                  value={depositForm.date}
                  onChange={(e) => setDepositForm({ ...depositForm, date: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "جمع کرائی جانے والی رقم (PKR)" : "Deposit Amount (PKR)"}</span>
                <UrduInput
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder={isUrdu ? "مثلاً 50000" : "e.g. 50000"}
                  value={depositForm.amount}
                  onChange={(e: any) => setDepositForm({ ...depositForm, amount: e.target.value })}
                />
              </label>

              <label className="field">
                <span>{isUrdu ? "رقم کہاں جمع کرائی؟" : "Destination / Account"}</span>
                <select
                  value={depositForm.method}
                  onChange={(e) => setDepositForm({ ...depositForm, method: e.target.value })}
                >
                  <option value="Cash">{isUrdu ? "نقد دراز میں (Cash Drawer)" : "Cash Drawer"}</option>
                  <option value="Bank/Wallet">{isUrdu ? "بینک اکاؤنٹ / والٹ" : "Bank Account / Digital Wallet"}</option>
                </select>
              </label>

              <label className="field">
                <span>{isUrdu ? "تفصیل / نوٹس" : "Description / Notes"}</span>
                <UrduInput
                  placeholder={isUrdu ? "مثلاً ایمرجنسی کیش یا نئی انویسٹمنٹ" : "e.g. Cash drawer buffer or new investment"}
                  value={depositForm.note}
                  onChange={(e: any) => setDepositForm({ ...depositForm, note: e.target.value })}
                />
              </label>

              {ownerError && <p className="error">{ownerError}</p>}

              <button className="primary wide" type="submit" disabled={isOwnerBusy} style={{ background: "#27ae60", borderColor: "#27ae60" }}>
                {isUrdu
                  ? (isOwnerBusy ? "محفوظ ہو رہا ہے…" : "سرمایہ محفوظ کریں")
                  : (isOwnerBusy ? "Saving…" : "Save Capital Deposit")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddDepositOpen(false)} disabled={isOwnerBusy} />
          </section>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT OWNER / PARTNER ACCOUNT */}
      {isAddOwnerAccountOpen && (
        <div className="modal-backdrop">
          <section className="work-modal" role="dialog" aria-modal="true" aria-label={ownerAccountForm.id ? (isUrdu ? "مالک کا کھاتہ تبدیل کریں" : "Edit Owner Account") : (isUrdu ? "نیا مالک / پارٹنر کھاتہ بنائیں" : "Add Owner / Partner Account")}>
            <header>
              <h2>
                {ownerAccountForm.id
                  ? (isUrdu ? "مالک / پارٹنر کا کھاتہ تبدیل کریں" : "Edit Owner Account")
                  : (isUrdu ? "نیا مالک / پارٹنر کھاتہ شامل کریں" : "Add Owner / Partner Account")}
              </h2>
              <button onClick={() => setIsAddOwnerAccountOpen(false)} disabled={isOwnerAccountBusy}>
                ✕
              </button>
            </header>

            <form onSubmit={handleSaveOwnerAccount}>
              <div style={{ background: "#eef2ff", padding: "12px 14px", borderRadius: "8px", border: "1px solid #c7d2fe", marginBottom: "16px", fontSize: "12px", color: "#312e81" }}>
                ℹ️ {isUrdu
                  ? "آپ ریسٹورانٹ میں 1، 2 یا جتنے چاہیں مالکان / پارٹنرز کے الگ الگ اکاؤنٹس کھول سکتے ہیں۔ ہر کھاتے میں ذاتی نکلوائی اور بیلنس کا الگ ٹریک رکھا جاتا ہے۔"
                  : "You can create as many owner / partner accounts as you want. Each account tracks its own personal withdrawals, capital deposits, and balance."}
              </div>

              {/* 1. Account Name */}
              <label className="field">
                <span>{isUrdu ? "مالک / پارٹنر کا نام" : "Owner / Partner Name"}</span>
                <UrduInput
                  required
                  placeholder={isUrdu ? "مثلاً مالک 1 (یا پارٹنر کا نام)" : "e.g. Partner A or Owner Name"}
                  value={ownerAccountForm.name}
                  onChange={(e: any) => setOwnerAccountForm({ ...ownerAccountForm, name: e.target.value })}
                />
              </label>

              {/* 2. Opening Balance (PKR) */}
              <label className="field">
                <span>{isUrdu ? "ابتدائی بیلنس (PKR)" : "Opening Balance (PKR)"}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={ownerAccountForm.openingBalance}
                  onChange={(e) => setOwnerAccountForm({ ...ownerAccountForm, openingBalance: e.target.value })}
                />
              </label>

              {/* 4. Phone Number */}
              <label className="field">
                <span>{isUrdu ? "فون / رابطہ نمبر (اختیاری)" : "Phone / Contact Number (Optional)"}</span>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={ownerAccountForm.phone}
                  onChange={(e) => setOwnerAccountForm({ ...ownerAccountForm, phone: e.target.value })}
                />
              </label>

              {/* 5. Notes / Description */}
              <label className="field">
                <span>{isUrdu ? "تفصیل / نوٹس (اختیاری)" : "Description / Notes (Optional)"}</span>
                <UrduInput
                  placeholder={isUrdu ? "اضافی تفصیل یا شرائط" : "e.g. Terms or notes"}
                  value={ownerAccountForm.description}
                  onChange={(e: any) => setOwnerAccountForm({ ...ownerAccountForm, description: e.target.value })}
                />
              </label>

              {ownerAccountError && <p className="error">{ownerAccountError}</p>}

              <button className="primary wide" type="submit" disabled={isOwnerAccountBusy}>
                {isUrdu
                  ? (isOwnerAccountBusy ? "محفوظ ہو رہا ہے…" : "کھاتہ محفوظ کریں")
                  : (isOwnerAccountBusy ? "Saving…" : "Save Owner Account")}
              </button>
            </form>

            <BottomClose onClose={() => setIsAddOwnerAccountOpen(false)} disabled={isOwnerAccountBusy} />
          </section>
        </div>
      )}
      {/* COMPACT MODAL: PRINT OR SHARE IN WHATSAPP (NO FULL PAGE TABLE) */}
      {isReportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReportModalOpen(false)}>
          <section
            className="work-modal finance-compact-modal"
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '420px', width: '92vw', padding: '20px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#103f32', fontWeight: 700 }}>
                  🖨️ {isUrdu ? "پرنٹ یا شیئر کریں" : "Print or Share"}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#556b60', lineHeight: 1.4 }}>
                  <strong>{reportModalData.title}</strong>
                  <br />
                  {reportModalData.subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                style={{
                  background: '#f0f4f1',
                  border: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#44554b'
                }}
              >
                ✕
              </button>
            </header>

            {/* ONLY TWO MAIN OPTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
              {/* Option 1: Print / Save as PDF */}
              <button
                type="button"
                className="finance-btn primary"
                style={{
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: '#103f32',
                  color: '#ffffff',
                  boxShadow: '0 3px 10px rgba(16, 63, 50, 0.25)',
                  cursor: 'pointer',
                  border: 0
                }}
                onClick={() => {
                  setIsReportModalOpen(false);
                  if (reportModalData.printFn) {
                    reportModalData.printFn();
                  } else {
                    window.print();
                  }
                }}
              >
                🖨️ {isUrdu ? "پرنٹ / PDF محفوظ کریں" : "Print / Save as PDF"}
              </button>

              {/* Option 2: Share in WhatsApp */}
              <button
                type="button"
                className="finance-btn"
                style={{
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  border: 0,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setIsReportModalOpen(false);
                  shareToWhatsApp(reportModalData.copyText);
                }}
              >
                💬 {isUrdu ? "واٹس ایپ پر شیئر کریں" : "Share in WhatsApp"}
              </button>
            </div>

            {/* Cancel Button */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="finance-btn secondary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '10px',
                  border: '1px solid #dce4dd',
                  background: '#ffffff',
                  color: '#556b60',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => setIsReportModalOpen(false)}
              >
                {isUrdu ? "منسوخ کریں" : "Cancel"}
              </button>
            </div>
            <BottomClose onClose={() => setIsReportModalOpen(false)} />
          </section>
        </div>
      )}

      {/* COMPACT MODAL: EXCEL EXPORT OR WHATSAPP SHARE */}
      {isExportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsExportModalOpen(false)}>
          <section
            className="work-modal finance-compact-modal"
            role="dialog"
            aria-modal="true"
            style={{ maxWidth: '420px', width: '92vw', padding: '20px', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <header style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#103f32', fontWeight: 700 }}>
                  📊 {isUrdu ? "ایکسل شیٹ یا واٹس ایپ" : "Excel Sheet or WhatsApp"}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#556b60', lineHeight: 1.4 }}>
                  <strong>{exportModalData.filename}</strong>
                  <br />
                  {exportModalData.rowCount} {isUrdu ? "ریکارڈز برآمد کے لیے تیار ہیں" : "Records ready to export"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                style={{
                  background: '#f0f4f1',
                  border: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#44554b'
                }}
              >
                ✕
              </button>
            </header>

            {/* ONLY TWO MAIN OPTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
              {/* Option 1: Share to WhatsApp */}
              <button
                type="button"
                className="finance-btn"
                style={{
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  background: '#25D366',
                  color: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  border: 0,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setIsExportModalOpen(false);
                  shareToWhatsApp(exportModalData.shareText || exportModalData.csvContent);
                }}
              >
                💬 {isUrdu ? "واٹس ایپ پر شیئر کریں" : "Share to WhatsApp"}
              </button>

              {/* Option 2: Download Excel (.CSV) */}
              <button
                type="button"
                className="finance-btn primary"
                style={{
                  minHeight: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: '#107c41',
                  color: '#ffffff',
                  boxShadow: '0 3px 10px rgba(16, 124, 65, 0.25)',
                  border: 0,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setIsExportModalOpen(false);
                  if (exportModalData.downloadFn) {
                    exportModalData.downloadFn();
                  }
                }}
              >
                📥 {isUrdu ? "ایکسل فائل ڈاؤن لوڈ کریں (.CSV)" : "Download Excel (.CSV)"}
              </button>
            </div>

            {/* Cancel Button */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="button"
                className="finance-btn secondary"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '10px',
                  border: '1px solid #dce4dd',
                  background: '#ffffff',
                  color: '#556b60',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => setIsExportModalOpen(false)}
              >
                {isUrdu ? "منسوخ کریں" : "Cancel"}
              </button>
            </div>
            <BottomClose onClose={() => setIsExportModalOpen(false)} />
          </section>
        </div>
      )}
    </div>
  );
}