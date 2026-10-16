// @ts-nocheck
import urduTranslations from "./urdu.json";
import HH_TECH_HUB_LOGO from "./hh_tech_logo";

export function generateInvoiceHtml(o: any, size: string = "A4", kitchen: boolean = false): string {
  const words: Record<string, string> = urduTranslations as any;
  const translate = (value: any) =>
    words[String(value ?? "")] ||
    (/^Table \d+$/.test(String(value)) ? "میز " + String(value).split(" ")[1] : value);
  const e = (value: any) =>
    String(translate(value) ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c)
    );
  const money = (value: any) =>
    `<span class="money"><bdi dir="ltr">${((value || 0) / 100).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}</bdi> روپے</span>`;

  const thermal = size === "80mm";
  const r = o.restaurant || {};
  const phone = r.phone || "051 6122024";
  const date = new Date(o.created || Date.now()).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const totals = [
    ["Subtotal", o.subtotal],
    ...(o.discount ? [["Discount", -o.discount]] : []),
    ...(o.tax ? [["Tax", o.tax]] : []),
    ...(o.serviceCharge ? [["Service charge", o.serviceCharge]] : []),
    ["Grand total", o.total],
    ["Payments received", o.received || 0],
    ...(o.refunded ? [["Refunds", o.refunded], ["Net received", o.net]] : []),
    ["Outstanding balance", o.balance !== undefined ? o.balance : (o.total - (o.received || 0))],
    ...(o.change ? [["Change returned", o.change]] : []),
  ];

  return `<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(o.number || 'Invoice')}</title><style>
@font-face{font-family:Urdu;src:url('/media/noto-sans-arabic.ttf')}*{box-sizing:border-box}body{margin:0;background:#e9eeeb;color:#233c32;font:14px/1.9 Urdu,Arial,sans-serif}
.toolbar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #d6dfd9;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.toolbar strong{font-size:17px;color:#164b3b}
.toolbar small{color:#65756c;margin-right:12px}
.toolbar .actions{display:flex;gap:10px}
.toolbar button{border:0;border-radius:8px;background:#164b3b;color:#fff;padding:8px 20px;min-height:40px;font:14px/1.8 Urdu,Arial,sans-serif;cursor:pointer;font-weight:bold}
.toolbar button.secondary{background:#e2e8f0;color:#1e293b}
.paper{width:${thermal ? "80mm" : "210mm"};max-width:calc(100% - 32px);min-height:${thermal ? "auto" : "297mm"};margin:24px auto;background:white;padding:${thermal ? "5mm" : "12mm"};box-shadow:0 8px 36px rgba(20,56,42,0.1);border-radius:6px}
.brand-header{display:flex;justify-content:space-between;align-items:center;gap:20px;background:#164b3b;color:#fff;border-bottom:4px solid #c89556;border-radius:10px;padding:22px 24px}
.brand-header h1{margin:0;font-size:32px;line-height:1.8}
.brand-header p{margin:0;font-size:12px;opacity:.85}
.brand-header img{width:56px;height:56px;object-fit:contain}
.brand-badge{width:58px;height:58px;border:2px solid #c89556;border-radius:50%;display:grid;place-items:center;font:24px/1 Georgia,serif;color:#ecd2ac;flex-shrink:0}
.invoice-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:20px 0 14px}
.invoice-heading h2{font-size:21px;margin:0}
.invoice-heading bdi{font:600 18px/1.4 Arial,sans-serif}
.status{border:1px solid #d7e3da;background:#eff6f1;color:#164b3b;border-radius:20px;padding:3px 14px;font-size:12px;white-space:nowrap}
.meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:14px 16px;background:#f0f5f1;border-radius:8px;margin-bottom:20px}
.meta small{display:block;font-size:11px;color:#65756c}
.meta strong{font-weight:500;font-size:13px}
.meta bdi{font:13px/1.8 Arial,sans-serif}
table{width:100%;border-collapse:collapse;table-layout:fixed}
th,td{text-align:right;padding:10px 12px;vertical-align:top;overflow-wrap:anywhere}
thead{display:table-header-group;background:#164b3b;color:#fff}
th{font-size:13px;font-weight:500}
th:first-child{width:${kitchen ? "70%" : "44%"}}
tbody tr:nth-child(even){background:#f5f8f4}
td{border-bottom:1px solid #e1e8e1;font-size:13px}
td small{display:block;color:#65756c;font-size:11px}
tr{break-inside:avoid}
.money{white-space:nowrap}
.money bdi,.qty{font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}
.summary{width:65%;margin:22px 0 0 auto;break-inside:avoid;background:#f0f5f1;border-radius:8px;overflow:hidden}
.summary-row{display:flex;justify-content:space-between;gap:14px;padding:7px 14px;font-size:13px}
.summary-row b{font-weight:600}
.summary-row.total{background:#164b3b;color:#fff;font-size:16px;padding:10px 14px}
.bill-footer{display:flex;flex-direction:column;gap:10px;border-top:2px solid #c89556;margin-top:22px;padding-top:14px;font-size:13px}
.footer-primary{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-brand-info{display:flex;align-items:center;gap:10px}
.footer-co-logo{width:36px;height:36px;object-fit:contain;border-radius:6px;border:1px solid #d7e3da;padding:2px;background:#fff}
.footer-text-block{text-align:right}
.footer-thanks{margin:0;font-weight:bold;color:#164b3b;font-size:13px}
.footer-phone{margin:2px 0 0;font-size:13px;color:#233c32}
.footer-phone strong{font-weight:bold;color:#0b3d2e}
.footer-meta{text-align:left}
.footer-safe-note{display:block;font-size:11px;color:#65756c}
.revision{color:#65756c;font-size:11px;margin:2px 0 0}
.footer-software-credit{display:flex;align-items:center;justify-content:space-between;border-top:1px dashed #d7e3da;padding-top:8px;gap:8px;flex-wrap:wrap}
.credit-label{font-size:11px;color:#65756c}
.credit-pill{display:inline-flex;align-items:center;gap:8px;background:#f4f7f5;border:1px solid #d2dfd6;border-radius:6px;padding:3px 10px}
.hh-tech-logo{height:24px;max-width:120px;width:auto;object-fit:contain;display:block}
.hh-tech-name{font-family:Arial,sans-serif;font-weight:bold;font-size:12px;color:#222;letter-spacing:0.5px}
${
  thermal
    ? `.paper{min-height:0;box-shadow:none;border:1px dashed #ccc}
.brand-header{padding:10px;background:white;color:black;border-bottom:1px solid black;border-radius:0;text-align:center}
.brand-header h1{font-size:22px;margin:0 0 4px}
.brand-phone{font-size:13px!important;font-weight:bold;margin:4px 0!important}
.brand-header .brand-badge{display:none}
.meta{grid-template-columns:1fr;padding:8px;gap:4px}
.invoice-heading{display:block;text-align:center}
.invoice-heading h2{font-size:15px}
.invoice-heading bdi{font-size:12px}
.status{display:inline-block;margin-top:5px}
td,th{font-size:11px;padding:6px 3px}
td small{font-size:9px}
.summary{width:100%}
.summary-row{font-size:11px;padding:5px 8px}
.summary-row.total{font-size:13px}
.bill-footer{text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid #000;gap:8px}
.footer-primary{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}
.footer-brand-info{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}
.footer-text-block{text-align:center}
.footer-thanks{font-size:12px}
.footer-phone{font-size:13px!important;font-weight:bold;margin:3px 0!important}
.footer-meta{text-align:center}
.footer-software-credit{flex-direction:column;justify-content:center;align-items:center;border-top:1px dashed #999;padding-top:6px;gap:4px}
.credit-pill{background:transparent;border:none;padding:0;justify-content:center}
.hh-tech-logo{height:22px;max-width:110px}
.hh-tech-name{font-size:11px}
.money{white-space:normal}`
    : ""
}
@page{size:${thermal ? "80mm auto" : "A4"};margin:${thermal ? "4mm" : "10mm"}}
@media print{
html,body{background:#fff;margin:0}
.toolbar{display:none}
.paper{width:100%;max-width:none;min-height:0;margin:0;padding:0;box-shadow:none;border-radius:0;border:none}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.brand-header,.meta,.invoice-heading,.bill-footer{break-inside:avoid}
.brand-header{padding:${thermal ? "8px" : "16px 20px"}}
.brand-header h1{font-size:${thermal ? "20px" : "28px"}}
.invoice-heading{margin:14px 0 10px}
.meta{margin-bottom:14px}
td,th{padding:${thermal ? "5px 2px" : "7px 10px"}}
.summary{margin-top:16px}
.bill-footer{margin-top:16px;break-inside:avoid}
.hh-tech-logo{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
</style></head><body>
<nav class="toolbar">
  <div><strong>بل کا پرنٹ پیش منظر</strong><small>${e(size)} · <bdi>${e(o.number)}</bdi></small></div>
  <div class="actions">
    <button type="button" onclick="window.print()">پرنٹ کریں / PDF محفوظ کریں</button>
    <button type="button" class="secondary" onclick="window.close()">بند کریں</button>
  </div>
</nav>
<main class="paper">
<header class="brand-header">
  <div>
    <h1>${e(r.name || "Dastarkhwan")}</h1>
    <p>${e(r.tagline || "Desi Kitchen")}</p>
    <p>${e(r.address || "Rawalpindi, Pakistan")}</p>
    <p class="brand-phone" style="margin-top:4px;font-size:13px;"><strong>فون نمبر: <bdi dir="ltr">${e(phone)}</bdi></strong></p>
    ${r.taxId ? "<p>کاروباری نمبر: " + e(r.taxId) + "</p>" : ""}
  </div>
  ${r.logo ? '<img src="' + e(r.logo) + '" alt="لوگو">' : '<div class="brand-badge" aria-hidden="true">D</div>'}
</header>
<section class="invoice-heading">
  <h2>${kitchen ? "باورچی خانے کا آرڈر" : "گاہک کا بل"} <bdi dir="ltr">${e(o.number)}</bdi></h2>
  ${!kitchen ? '<span class="status">' + e(o.paymentStatus) + "</span>" : ""}
</section>
<section class="meta">
  <div><small>کھانے کا طریقہ</small><strong>${e(o.service)} | ${e(o.place)}</strong></div>
  <div><small>گاہک</small><strong>${e(o.customer?.name || "Walk-in guest")}${o.customer?.phone ? " · <bdi dir=\"ltr\">" + e(o.customer.phone) + "</bdi>" : ""}${o.customer?.address ? '<br><small style="font-size:11px;font-weight:normal;color:#456">' + e(o.customer.address) + "</small>" : ""}</strong></div>
  <div><small>تاریخ اور وقت</small><bdi dir="ltr">${e(date)}</bdi></div>
</section>
<table>
  <thead>
    <tr>
      <th>کھانے کی تفصیل</th>
      <th>تعداد</th>
      ${kitchen ? "" : "<th>فی عدد قیمت</th><th>رقم</th>"}
    </tr>
  </thead>
  <tbody>
    ${(o.items || []).map((i: any) => `<tr>
      <td>${e(i.name)}<small>${e(i.variant)}${kitchen && i.note ? " - " + e(i.note) : ""}</small></td>
      <td><bdi class="qty" dir="ltr">${(i.qty || 1000) / 1000}</bdi> ${e(i.unit)}</td>
      ${kitchen ? "" : `<td>${money(i.price)}</td><td>${money(i.amount)}</td>`}
    </tr>`).join("")}
  </tbody>
</table>
${
  kitchen
    ? ""
    : '<section class="summary">' +
      totals
        .map(
          ([k, v]) =>
            `<div class="summary-row ${k === "Grand total" ? "total" : ""}"><span>${e(k)}</span><b>${money(v)}</b></div>`
        )
        .join("") +
      "</section>"
}
<footer class="bill-footer">
  <div class="footer-primary">
    <div class="footer-brand-info">
      ${r.logo ? `<img src="${e(r.logo)}" class="footer-co-logo" alt="لوگو">` : ""}
      <div class="footer-text-block">
        <p class="footer-thanks">${e(r.footer || "تشریف لانے کا شکریہ۔")}</p>
        <p class="footer-phone"><strong>فون نمبر: <bdi dir="ltr">${e(phone)}</bdi></strong></p>
      </div>
    </div>
    <div class="footer-meta">
      <small class="footer-safe-note">یہ محفوظ بل ہے۔</small>
      <p class="revision">نسخہ ${o.revision || 1} · <bdi dir="ltr">${e(o.number)}</bdi></p>
    </div>
  </div>
  <div class="footer-software-credit">
    <span class="credit-label">سافٹ ویئر برائے ریسٹورنٹ:</span>
    <div class="credit-pill">
      <img src="${HH_TECH_HUB_LOGO}" class="hh-tech-logo" alt="HH Tech Hub">
      <span class="hh-tech-name">HH TECH HUB</span>
    </div>
  </div>
</footer>
</main>
<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>
</body></html>`;
}

export function printInvoice(order: any, size: string = "A4", kitchen: boolean = false) {
  const html = generateInvoiceHtml(order, size, kitchen);
  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  }
}
