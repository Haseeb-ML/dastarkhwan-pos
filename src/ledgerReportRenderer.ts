// @ts-nocheck
/**
 * Professional Ledger and Financial Report Generator for Dastarkhwan ERP
 * Produces clean, publication-grade printable PDF statements (landscape A4)
 * and UTF-8 BOM formatted Excel CSV spreadsheets.
 */

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function formatPkr(val: number): string {
  return "PKR " + ((val || 0) / 100).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatNumber(val: number): string {
  return ((val || 0) / 100).toFixed(2);
}

export function printLedgerReport({
  restaurant = {},
  ledger = [],
  totals = { debits: 0, credits: 0, net: 0, count: 0 },
  fromDate = "",
  toDate = "",
  selectedAccountName = "All Accounts",
  searchQuery = "",
  isUrdu = false,
  formatDate,
  getAccountDisplayName,
  getParticularsDisplay,
  getMethodLabel,
  triggerDownload = true,
}: any) {
  const restName = escapeHtml(restaurant.name || "Dastarkhwan Restaurant");
  const restTagline = escapeHtml(restaurant.tagline || "Desi Kitchen & Restaurant Management");
  const restAddress = escapeHtml(restaurant.address || "Rawalpindi, Pakistan");
  const restPhone = escapeHtml(restaurant.phone || "");
  const restLogo = restaurant.logo || "";

  const title = isUrdu ? "جنرل لیجر اسٹیٹمنٹ (General Ledger Report)" : "General Ledger Statement";
  const printedAt = new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const periodLabel = isUrdu
    ? `مدت: ${fromDate || "شروع"} تا ${toDate || "آج"}`
    : `Period: ${fromDate || "Start"} to ${toDate || "Today"}`;
  const accountLabel = isUrdu ? `کھاتہ: ${selectedAccountName}` : `Account: ${selectedAccountName}`;

  const html = `<!DOCTYPE html>
<html lang="${isUrdu ? "ur" : "en"}" dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<title>${title} · ${restName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1a202c;
    background: #f7fafc;
    padding: 20px;
    font-size: 12px;
    line-height: 1.4;
  }
  .toolbar {
    max-width: 1100px;
    margin: 0 auto 16px auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }
  .toolbar-title { font-weight: bold; font-size: 14px; color: #164b3b; }
  .toolbar-actions { display: flex; gap: 10px; }
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
  }
  .btn-primary { background: #164b3b; color: white; }
  .btn-primary:hover { background: #123e31; }
  .btn-secondary { background: #edf2f7; color: #2d3748; }
  .btn-secondary:hover { background: #e2e8f0; }

  .sheet {
    max-width: 1100px;
    margin: 0 auto;
    background: #ffffff;
    padding: 30px 36px;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }

  /* Header */
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #164b3b;
    padding-bottom: 16px;
    margin-bottom: 18px;
  }
  .brand-block h1 { font-size: 22px; color: #164b3b; margin-bottom: 2px; }
  .brand-block p { color: #718096; font-size: 12px; }
  .brand-logo { max-height: 55px; max-width: 140px; object-fit: contain; }
  .brand-mark {
    width: 44px; height: 44px; background: #164b3b; color: #fff;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: bold;
  }

  .statement-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .statement-title-block h2 { font-size: 17px; color: #2d3748; }
  .statement-subtitle { font-size: 12px; color: #718096; }
  .pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    background: #edf2f7;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }

  /* Summary Cards */
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .kpi-card {
    background: #fcfbf9;
    border: 1px solid #e8e6df;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .kpi-label { font-size: 11px; color: #718096; margin-bottom: 4px; display: block; }
  .kpi-value { font-size: 16px; font-weight: bold; color: #1a202c; }
  .kpi-value.green { color: #2e7d32; }
  .kpi-value.red { color: #c62828; }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 11px;
  }
  th {
    background: #164b3b;
    color: #ffffff;
    text-align: left;
    padding: 9px 10px;
    font-weight: 600;
    border: 1px solid #164b3b;
    white-space: nowrap;
  }
  html[dir="rtl"] th { text-align: right; }
  th.amount-col, td.amount-col { text-align: right; }
  html[dir="rtl"] th.amount-col, html[dir="rtl"] td.amount-col { text-align: left; }
  td {
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    color: #2d3748;
  }
  tbody tr:nth-child(even) { background: #fafaf9; }
  .badge-ref {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    background: #edf2f7;
    color: #4a5568;
    border: 1px solid #cbd5e0;
  }
  .debit-val { color: #2e7d32; font-weight: 600; }
  .credit-val { color: #c62828; font-weight: 600; }
  .balance-val { font-weight: 600; color: #1a202c; }

  tfoot td {
    background: #edf2f7;
    font-weight: bold;
    font-size: 12px;
    border-top: 2px solid #164b3b;
    border-bottom: 2px solid #164b3b;
  }

  /* Signatures */
  .sign-section {
    display: flex;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 24px;
  }
  .sign-box {
    width: 220px;
    border-top: 1px solid #a0aec0;
    text-align: center;
    padding-top: 6px;
    font-size: 11px;
    color: #4a5568;
  }

  /* Footer */
  .report-footer {
    margin-top: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #a0aec0;
  }

  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none !important; }
    .sheet {
      border: none;
      box-shadow: none;
      padding: 0;
      max-width: 100%;
    }
    @page {
      size: A4 landscape;
      margin: 10mm 12mm;
    }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div class="toolbar-title">🖨️ ${isUrdu ? "لیجر پرنٹ و پی ڈی ایف" : "Ledger Print & PDF Preview"}</div>
  <div class="toolbar-actions">
    <button type="button" class="btn btn-primary" onclick="window.print()">
      🖨️ ${isUrdu ? "پرنٹ کریں / PDF بنائیں" : "Print / Save PDF"}
    </button>
    <button type="button" class="btn btn-secondary" onclick="window.close()">
      ✕ ${isUrdu ? "بند کریں" : "Close"}
    </button>
  </div>
</div>

<main class="sheet">
  <header class="report-header">
    <div class="brand-block">
      <h1>${restName}</h1>
      <p>${restTagline}</p>
      <p>${restAddress}${restPhone ? " · " + restPhone : ""}</p>
    </div>
    ${
      restLogo
        ? `<img src="${escapeHtml(restLogo)}" class="brand-logo" alt="Logo">`
        : `<div class="brand-mark">D</div>`
    }
  </header>

  <div class="statement-meta">
    <div class="statement-title-block">
      <h2>${title}</h2>
      <span class="statement-subtitle">${isUrdu ? "طبع شدہ بتاریخ: " : "Generated on: "}${printedAt}</span>
    </div>
    <div class="pills">
      <span class="pill">📅 ${periodLabel}</span>
      <span class="pill">🏛️ ${accountLabel}</span>
      ${searchQuery ? `<span class="pill">🔍 ${escapeHtml(searchQuery)}</span>` : ""}
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "کل ڈیبٹ / آمد" : "Total Debit (Inflow)"}</span>
      <strong class="kpi-value green">${formatPkr(totals.debits)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "کل کریڈٹ / اخراجات" : "Total Credit (Outflow)"}</span>
      <strong class="kpi-value red">${formatPkr(totals.credits)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "خالص فرق (Net)" : "Net Difference"}</span>
      <strong class="kpi-value ${totals.net >= 0 ? "green" : "red"}">${formatPkr(totals.net)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "کل اندراجات" : "Total Transactions"}</span>
      <strong class="kpi-value">${totals.count}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th style="width: 120px;">${isUrdu ? "تاریخ و وقت" : "Date & Time"}</th>
        <th style="width: 90px;">${isUrdu ? "واؤچر / ریفرنس" : "Voucher / Ref"}</th>
        <th style="width: 140px;">${isUrdu ? "کھاتہ" : "Account"}</th>
        <th>${isUrdu ? "تفصیل" : "Particulars"}</th>
        <th style="width: 80px;">${isUrdu ? "طریقہ" : "Method"}</th>
        <th class="amount-col" style="width: 110px;">${isUrdu ? "ڈیبٹ (آمد PKR)" : "Debit (In PKR)"}</th>
        <th class="amount-col" style="width: 110px;">${isUrdu ? "کریڈٹ (خرچ PKR)" : "Credit (Out PKR)"}</th>
        <th class="amount-col" style="width: 110px;">${isUrdu ? "بیلنس (PKR)" : "Balance (PKR)"}</th>
      </tr>
    </thead>
    <tbody>
      ${
        ledger.length === 0
          ? `<tr><td colspan="9" style="text-align:center; padding:30px; color:#718096;">${
              isUrdu ? "کوئی مالیاتی اندراج موجود نہیں ہے۔" : "No transactions found."
            }</td></tr>`
          : ledger
              .map((tx: any, idx: number) => {
                const dateStr = formatDate ? formatDate(tx.date) : tx.date;
                const accName = getAccountDisplayName ? getAccountDisplayName(tx, isUrdu) : tx.accountName;
                const partDesc = getParticularsDisplay ? getParticularsDisplay(tx, isUrdu) : tx.particulars;
                const methodStr = getMethodLabel ? getMethodLabel(tx.method, isUrdu) : tx.method;
                return `<tr>
                  <td>${idx + 1}</td>
                  <td style="white-space:nowrap;">${escapeHtml(dateStr)}</td>
                  <td><span class="badge-ref">${escapeHtml(tx.ref)}</span></td>
                  <td><strong>${escapeHtml(accName)}</strong></td>
                  <td>${escapeHtml(partDesc)}</td>
                  <td>${escapeHtml(methodStr)}</td>
                  <td class="amount-col debit-val">${tx.debit ? formatPkr(tx.debit) : "-"}</td>
                  <td class="amount-col credit-val">${tx.credit ? formatPkr(tx.credit) : "-"}</td>
                  <td class="amount-col balance-val">${formatPkr(tx.balance)}</td>
                </tr>`;
              })
              .join("")
      }
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="text-align: right; padding-right: 15px;">
          ${isUrdu ? "کل میزان (Grand Total):" : "Grand Total:"}
        </td>
        <td class="amount-col debit-val">${formatPkr(totals.debits)}</td>
        <td class="amount-col credit-val">${formatPkr(totals.credits)}</td>
        <td class="amount-col balance-val">${formatPkr(totals.net)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="sign-section">
    <div class="sign-box">${isUrdu ? "تیار کنندہ (Prepared By)" : "Prepared By: Accountant"}</div>
    <div class="sign-box">${isUrdu ? "تصدیق کنندہ (Verified By)" : "Verified By: Manager / Owner"}</div>
  </div>

  <footer class="report-footer">
    <span>Software developed by HH Tech Hub</span>
    <span>Dastarkhwan ERP · Page 1 of 1</span>
  </footer>
</main>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>
</body>
</html>`;

    let opened = false;
  try {
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      opened = true;
    }
  } catch (_) {}

  if (!opened && typeof document !== "undefined") {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.opacity = "0";
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (_) {}
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch (_) {}
          }, 4000);
        }, 500);
      }
    } catch (_) {}
  }
  return { html };
}

/**
 * Download a properly formatted Excel-ready CSV with UTF-8 BOM
 */
export function downloadLedgerCsv({
  restaurant = {},
  ledger = [],
  totals = { debits: 0, credits: 0, net: 0, count: 0 },
  fromDate = "",
  toDate = "",
  selectedAccountName = "All Accounts",
  isUrdu = false,
  formatDate,
  getAccountDisplayName,
  getParticularsDisplay,
  getMethodLabel,
}: any) {
  const restName = restaurant.name || "Dastarkhwan Restaurant";
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];

  // Metadata headers
  lines.push([escapeCsv(restName), escapeCsv(isUrdu ? "جنرل لیجر اسٹیٹمنٹ" : "General Ledger Statement")].join(","));
  lines.push(
    [
      escapeCsv(isUrdu ? `مدت: ${fromDate} تا ${toDate}` : `Period: ${fromDate} to ${toDate}`),
      escapeCsv(isUrdu ? `کھاتہ: ${selectedAccountName}` : `Account: ${selectedAccountName}`),
      escapeCsv(isUrdu ? `تاریخ برآمد: ${today}` : `Export Date: ${today}`),
    ].join(",")
  );
  lines.push(
    [
      escapeCsv(`Total Debit: PKR ${formatNumber(totals.debits)}`),
      escapeCsv(`Total Credit: PKR ${formatNumber(totals.credits)}`),
      escapeCsv(`Net Difference: PKR ${formatNumber(totals.net)}`),
      escapeCsv(`Total Records: ${totals.count}`),
    ].join(",")
  );
  lines.push(""); // empty row

  // Table header
  const headers = [
    isUrdu ? "شمار" : "Sr #",
    isUrdu ? "تاریخ و وقت" : "Date & Time",
    isUrdu ? "واؤچر / ریفرنس" : "Voucher / Ref",
    isUrdu ? "کھاتہ" : "Account",
    isUrdu ? "تفصیل" : "Particulars",
    isUrdu ? "طریقہ ادائیگی" : "Payment Method",
    isUrdu ? "ڈیبٹ (آمد PKR)" : "Debit (In PKR)",
    isUrdu ? "کریڈٹ (خرچ PKR)" : "Credit (Out PKR)",
    isUrdu ? "بیلنس (PKR)" : "Balance (PKR)",
  ];
  lines.push(headers.map(escapeCsv).join(","));

  // Rows
  ledger.forEach((tx: any, idx: number) => {
    const dateStr = formatDate ? formatDate(tx.date) : tx.date;
    const accName = getAccountDisplayName ? getAccountDisplayName(tx, isUrdu) : tx.accountName;
    const partDesc = getParticularsDisplay ? getParticularsDisplay(tx, isUrdu) : tx.particulars;
    const methodStr = getMethodLabel ? getMethodLabel(tx.method, isUrdu) : tx.method;

    const row = [
      idx + 1,
      escapeCsv(dateStr),
      escapeCsv(tx.ref),
      escapeCsv(accName),
      escapeCsv(partDesc),
      escapeCsv(methodStr),
      tx.debit ? formatNumber(tx.debit) : "0.00",
      tx.credit ? formatNumber(tx.credit) : "0.00",
      formatNumber(tx.balance || 0),
    ];
    lines.push(row.join(","));
  });

  // Totals Row
  lines.push(
    [
      escapeCsv("TOTAL"),
      '""',
      '""',
      '""',
      escapeCsv(isUrdu ? "کل میزان" : "Grand Total Debit & Credit"),
      '""',
      formatNumber(totals.debits),
      formatNumber(totals.credits),
      formatNumber(totals.net),
    ].join(",")
  );

  lines.push("");
  lines.push(escapeCsv("Software developed by HH Tech Hub"));

  const csvContent = lines.join("\r\n");

  // UTF-8 BOM byte order mark (0xEF, 0xBB, 0xBF) so Excel correctly recognizes UTF-8
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const filename = `General_Ledger_${fromDate || "start"}_to_${toDate || today}.csv`;
  if (triggerDownload) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 1000);
  }
  return { filename, csvContent, rowCount: ledger.length };
}

export function printOwnerAccountReport({
  restaurant = {},
  ownerStats = { earnedProfit: 0, totalDrawings: 0, totalDeposits: 0, netBalance: 0, list: [] },
  accountTitle = "",
  fromDate = "",
  toDate = "",
  isUrdu = false,
  formatDate,
  triggerDownload = true,
}: any) {
  const restName = escapeHtml(restaurant.name || "Dastarkhwan Restaurant");
  const restTagline = escapeHtml(restaurant.tagline || "Desi Kitchen & Restaurant Management");
  const restAddress = escapeHtml(restaurant.address || "Rawalpindi, Pakistan");
  const restPhone = escapeHtml(restaurant.phone || "");
  const restLogo = restaurant.logo || "";

  const titlePrefix = accountTitle ? `${accountTitle} · ` : "";
  const title = isUrdu
    ? `${titlePrefix}مالک کا ذاتی کھاتہ اسٹیٹمنٹ`
    : `${titlePrefix}Owner's Account Statement`;
  const printedAt = new Date().toLocaleString(isUrdu ? "ur-PK" : "en-PK", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const periodLabel = isUrdu
    ? `مدت: ${fromDate || "شروع"} تا ${toDate || "آج"}`
    : `Period: ${fromDate || "Start"} to ${toDate || "Today"}`;

  const html = `<!DOCTYPE html>
<html lang="${isUrdu ? "ur" : "en"}" dir="${isUrdu ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8">
<title>${title} · ${restName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1a202c;
    background: #f7fafc;
    padding: 20px;
    font-size: 12px;
    line-height: 1.4;
  }
  .toolbar {
    max-width: 1000px;
    margin: 0 auto 16px auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    padding: 12px 20px;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }
  .toolbar-title { font-weight: bold; font-size: 14px; color: #164b3b; }
  .toolbar-actions { display: flex; gap: 10px; }
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  .btn-primary { background: #164b3b; color: white; }
  .btn-secondary { background: #edf2f7; color: #2d3748; }

  .sheet {
    max-width: 1000px;
    margin: 0 auto;
    background: #ffffff;
    padding: 30px 36px;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
  }
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #164b3b;
    padding-bottom: 16px;
    margin-bottom: 18px;
  }
  .brand-block h1 { font-size: 22px; color: #164b3b; margin-bottom: 2px; }
  .brand-block p { color: #718096; font-size: 12px; }
  .brand-logo { max-height: 55px; max-width: 140px; object-fit: contain; }
  .brand-mark {
    width: 44px; height: 44px; background: #164b3b; color: #fff;
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: bold;
  }

  .statement-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .statement-title-block h2 { font-size: 17px; color: #2d3748; }
  .statement-subtitle { font-size: 12px; color: #718096; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
  .kpi-card {
    background: #fcfbf9;
    border: 1px solid #e8e6df;
    border-radius: 8px;
    padding: 10px 14px;
  }
  .kpi-label { font-size: 11px; color: #718096; margin-bottom: 4px; display: block; }
  .kpi-value { font-size: 16px; font-weight: bold; }
  .green { color: #2e7d32; }
  .red { color: #c62828; }
  .blue { color: #1976d2; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 11px;
  }
  th {
    background: #164b3b;
    color: #ffffff;
    text-align: left;
    padding: 9px 10px;
    font-weight: 600;
  }
  html[dir="rtl"] th { text-align: right; }
  th.amount-col, td.amount-col { text-align: right; }
  html[dir="rtl"] th.amount-col, html[dir="rtl"] td.amount-col { text-align: left; }
  td {
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    color: #2d3748;
  }
  tbody tr:nth-child(even) { background: #fafaf9; }
  .badge-ref {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    background: #edf2f7;
    border: 1px solid #cbd5e0;
  }
  .badge-draw { background: #fee2e2; color: #991b1b; }
  .badge-dep { background: #dbeafe; color: #1e40af; }

  tfoot td {
    background: #edf2f7;
    font-weight: bold;
    font-size: 12px;
    border-top: 2px solid #164b3b;
  }

  .sign-section {
    display: flex;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 24px;
  }
  .sign-box {
    width: 220px;
    border-top: 1px solid #a0aec0;
    text-align: center;
    padding-top: 6px;
    font-size: 11px;
    color: #4a5568;
  }

  .report-footer {
    margin-top: 24px;
    border-top: 1px solid #e2e8f0;
    padding-top: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #a0aec0;
  }

  @media print {
    body { background: #fff; padding: 0; }
    .toolbar { display: none !important; }
    .sheet { border: none; box-shadow: none; padding: 0; max-width: 100%; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <div class="toolbar-title">👤 ${title}</div>
  <div class="toolbar-actions">
    <button type="button" class="btn btn-primary" onclick="window.print()">
      🖨️ ${isUrdu ? "پرنٹ / PDF بنائیں" : "Print / Save PDF"}
    </button>
    <button type="button" class="btn btn-secondary" onclick="window.close()">
      ✕ ${isUrdu ? "بند کریں" : "Close"}
    </button>
  </div>
</div>

<main class="sheet">
  <header class="report-header">
    <div class="brand-block">
      <h1>${restName}</h1>
      <p>${restTagline}</p>
      <p>${restAddress}${restPhone ? " · " + restPhone : ""}</p>
    </div>
    ${
      restLogo
        ? `<img src="${escapeHtml(restLogo)}" class="brand-logo" alt="Logo">`
        : `<div class="brand-mark">D</div>`
    }
  </header>

  <div class="statement-meta">
    <div class="statement-title-block">
      <h2>${title}</h2>
      <span class="statement-subtitle">${periodLabel} · ${printedAt}</span>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "کمایا گیا خالص منافع" : "Total Net Profit"}</span>
      <strong class="kpi-value green">${formatPkr(ownerStats.earnedProfit)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "نفع سے ذاتی نکلوائی" : "Personal Drawings"}</span>
      <strong class="kpi-value red">${formatPkr(ownerStats.totalDrawings)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "ذاتی سرمایہ جمع" : "Capital Inflow"}</span>
      <strong class="kpi-value blue">${formatPkr(ownerStats.totalDeposits)}</strong>
    </div>
    <div class="kpi-card">
      <span class="kpi-label">${isUrdu ? "خالص دستیاب بیلنس" : "Net Available Balance"}</span>
      <strong class="kpi-value ${ownerStats.netBalance >= 0 ? "green" : "red"}">${formatPkr(ownerStats.netBalance)}</strong>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 35px;">#</th>
        <th style="width: 110px;">${isUrdu ? "تاریخ و وقت" : "Date & Time"}</th>
        <th style="width: 110px;">${isUrdu ? "مالک / کھاتہ" : "Owner / Account"}</th>
        <th style="width: 75px;">${isUrdu ? "واؤچر" : "Voucher"}</th>
        <th style="width: 100px;">${isUrdu ? "قسم" : "Type"}</th>
        <th style="width: 75px;">${isUrdu ? "طریقہ" : "Method"}</th>
        <th>${isUrdu ? "تفصیل / وجہ" : "Particulars / Reason"}</th>
        <th class="amount-col" style="width: 105px;">${isUrdu ? "سرمایہ آمد (PKR)" : "Capital Inflow (PKR)"}</th>
        <th class="amount-col" style="width: 105px;">${isUrdu ? "ذاتی نکلوائی (PKR)" : "Drawings Out (PKR)"}</th>
      </tr>
    </thead>
    <tbody>
      ${
        ownerStats.list.length === 0
          ? `<tr><td colspan="9" style="text-align:center; padding:30px; color:#718096;">${
              isUrdu ? "اس مدت میں کوئی ذاتی ٹرانزیکشن نہیں ہوئی۔" : "No personal transactions recorded for this period."
            }</td></tr>`
          : ownerStats.list
              .map((item: any, idx: number) => {
                const isDeposit = item.type === "deposit";
                const typeLabel = isDeposit
                  ? (isUrdu ? "سرمایہ جمع" : "Capital Inflow")
                  : (isUrdu ? "نفع سے نکلوائی" : "Personal Drawing");
                return `<tr>
                  <td>${idx + 1}</td>
                  <td style="white-space:nowrap;">${escapeHtml(formatDate ? formatDate(item.date || item.created) : item.date)}</td>
                  <td><strong>${escapeHtml(item.ownerName || "-")}</strong></td>
                  <td><span class="badge-ref">${escapeHtml(isDeposit ? `CAP-${item.id}` : `DRW-${item.id}`)}</span></td>
                  <td><span class="badge-ref ${isDeposit ? "badge-dep" : "badge-draw"}">${typeLabel}</span></td>
                  <td>${escapeHtml(item.method || "Cash")}</td>
                  <td>${escapeHtml(item.note || "-")}</td>
                  <td class="amount-col green">${isDeposit ? formatPkr(item.amount) : "-"}</td>
                  <td class="amount-col red">${!isDeposit ? formatPkr(item.amount) : "-"}</td>
                </tr>`;
              })
              .join("")
      }
    </tbody>
    <tfoot>
      <tr>
        <td colspan="7" style="text-align: right; padding-right: 15px;">
          ${isUrdu ? "کل میزان:" : "Totals:"}
        </td>
        <td class="amount-col green">${formatPkr(ownerStats.totalDeposits)}</td>
        <td class="amount-col red">${formatPkr(ownerStats.totalDrawings)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="sign-section">
    <div class="sign-box">${isUrdu ? "اکاؤنٹنٹ" : "Accountant Signature"}</div>
    <div class="sign-box">${isUrdu ? "مالک کے دستخط" : "Owner Signature"}</div>
  </div>

  <footer class="report-footer">
    <span>Software developed by HH Tech Hub</span>
    <span>Dastarkhwan ERP</span>
  </footer>
</main>

<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>
</body>
</html>`;

    let opened = false;
  try {
    const w = window.open("", "_blank");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      opened = true;
    }
  } catch (_) {}

  if (!opened && typeof document !== "undefined") {
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.opacity = "0";
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (_) {}
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch (_) {}
          }, 4000);
        }, 500);
      }
    } catch (_) {}
  }
  return { html };
}

export function downloadOwnerAccountCsv({
  restaurant = {},
  ownerStats = { earnedProfit: 0, totalDrawings: 0, totalDeposits: 0, netBalance: 0, list: [] },
  accountTitle = "",
  fromDate = "",
  toDate = "",
  isUrdu = false,
  formatDate,
}: any) {
  const restName = restaurant.name || "Dastarkhwan Restaurant";
  const today = new Date().toISOString().slice(0, 10);

  const lines: string[] = [];
  const title = accountTitle
    ? `${accountTitle} - ${isUrdu ? "مالک کا ذاتی کھاتہ اسٹیٹمنٹ" : "Owner's Personal Account Statement"}`
    : (isUrdu ? "مالک کا ذاتی کھاتہ اسٹیٹمنٹ" : "Owner's Personal Account Statement");
  lines.push([escapeCsv(restName), escapeCsv(title)].join(","));
  lines.push(
    [
      escapeCsv(isUrdu ? `مدت: ${fromDate} تا ${toDate}` : `Period: ${fromDate} to ${toDate}`),
      escapeCsv(isUrdu ? `تاریخ برآمد: ${today}` : `Export Date: ${today}`),
    ].join(",")
  );
  lines.push(
    [
      escapeCsv(`Total Net Profit: PKR ${formatNumber(ownerStats.earnedProfit)}`),
      escapeCsv(`Personal Drawings: PKR ${formatNumber(ownerStats.totalDrawings)}`),
      escapeCsv(`Capital Inflow: PKR ${formatNumber(ownerStats.totalDeposits)}`),
      escapeCsv(`Net Available Balance: PKR ${formatNumber(ownerStats.netBalance)}`),
    ].join(",")
  );
  lines.push("");

  const headers = [
    isUrdu ? "شمار" : "Sr #",
    isUrdu ? "تاریخ و وقت" : "Date & Time",
    isUrdu ? "مالک / کھاتہ" : "Owner / Account",
    isUrdu ? "واؤچر" : "Voucher",
    isUrdu ? "قسم" : "Type",
    isUrdu ? "طریقہ" : "Method",
    isUrdu ? "تفصیل / وجہ" : "Particulars / Reason",
    isUrdu ? "سرمایہ جمع (PKR)" : "Capital Inflow (PKR)",
    isUrdu ? "نفع سے نکلوائی (PKR)" : "Drawings Out (PKR)",
  ];
  lines.push(headers.map(escapeCsv).join(","));

  ownerStats.list.forEach((item: any, idx: number) => {
    const isDeposit = item.type === "deposit";
    const typeLabel = isDeposit
      ? (isUrdu ? "سرمایہ جمع" : "Capital Inflow")
      : (isUrdu ? "نفع سے نکلوائی" : "Personal Drawing");
    const dateStr = formatDate ? formatDate(item.date || item.created) : item.date;

    const row = [
      idx + 1,
      escapeCsv(dateStr),
      escapeCsv(item.ownerName || "-"),
      escapeCsv(isDeposit ? `CAP-${item.id}` : `DRW-${item.id}`),
      escapeCsv(typeLabel),
      escapeCsv(item.method || "Cash"),
      escapeCsv(item.note || "-"),
      isDeposit ? formatNumber(item.amount) : "0.00",
      !isDeposit ? formatNumber(item.amount) : "0.00",
    ];
    lines.push(row.join(","));
  });

  lines.push(
    [
      escapeCsv("TOTAL"),
      '""',
      '""',
      '""',
      '""',
      escapeCsv("Totals"),
      formatNumber(ownerStats.totalDeposits),
      formatNumber(ownerStats.totalDrawings),
    ].join(",")
  );
  lines.push("");
  lines.push(escapeCsv("Software developed by HH Tech Hub"));

  const csvContent = lines.join("\r\n");
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const filename = `Owner_Account_${fromDate || "start"}_to_${toDate || today}.csv`;
  if (triggerDownload) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (_) {}
    }, 1000);
  }
  return { filename, csvContent, rowCount: ownerStats?.list?.length || 0 };
}
