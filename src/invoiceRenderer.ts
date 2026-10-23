// @ts-nocheck
import urduTranslations from "./urdu.json";
import { getLanguage } from "./LanguageCore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Inverted dictionary for reverse translation (Urdu -> English)
const englishMap: Record<string, string> = {};
for (const [en, ur] of Object.entries(urduTranslations as Record<string, string>)) {
  if (ur && typeof ur === "string") {
    englishMap[ur.trim()] = en.trim();
  }
}

// Explicit mappings for common POS terms, variants, statuses, and headings
Object.assign(englishMap, {
  "دسترخوان": "Dastarkhwan",
  "دیسی کھانے": "Desi Kitchen",
  "راولپنڈی، پاکستان": "Rawalpindi, Pakistan",
  "تشریف لانے کا شکریہ۔": "Thank you for dining with us.",
  "یہ محفوظ بل ہے۔": "Saved invoice record",
  "عام گاہک": "Walk-in guest",
  "پارسل": "Parcel",
  "کھانا وہیں": "Dine-in",
  "ڈائن ان": "Dine-in",
  "ڈیلیوری": "Delivery",
  "پلیٹ": "Plate",
  "حصہ": "Portion",
  "عدد": "Piece",
  "آدھی": "Half",
  "پوری": "Full",
  "کپ": "Cup",
  "گلاس": "Glass",
  "بوتل": "Bottle",
  "ڈبہ": "Box",
  "کلو": "kg",
  "گرام": "g",
  "لیٹر": "L",
  "نان": "Naan",
  "روٹی": "Roti",
  "سیخ": "Skewer",
  "پیسے باقی ہیں": "Unpaid",
  "پیسے وصول ہو گئے": "Paid",
  "کچھ پیسے ملے": "Partial",
  "واپس": "Refunded",
  "منسوخ": "Cancelled",
  "اوپن": "Open",
  "کھانے کی تفصیل": "Item / Description",
  "تعداد": "Qty",
  "فی عدد قیمت": "Unit Price",
  "رقم": "Amount",
  "کھانوں کی رقم": "Subtotal",
  "Subtotal": "Subtotal",
  "ٹیکس": "Tax",
  "Tax": "Tax",
  "اضافی رقم": "Service Charge",
  "Service charge": "Service Charge",
  "رعایت": "Discount",
  "Discount": "Discount",
  "کل رقم": "Grand Total",
  "Grand total": "Grand Total",
  "وصول رقم": "Payments Received",
  "وصول شدہ رقم": "Payments Received",
  "Payments received": "Payments Received",
  "واپس کی گئی رقم": "Refunds",
  "Refunds": "Refunds",
  "خالص وصول شدہ رقم": "Net Received",
  "Net received": "Net Received",
  "باقی رقم": "Outstanding Balance",
  "Outstanding balance": "Outstanding Balance",
  "گاہک کو واپس کیے گئے پیسے": "Change Returned",
  "Change returned": "Change Returned",
  "کھانے کا طریقہ": "Dining Option",
  "گاہک": "Customer",
  "تاریخ اور وقت": "Date & Time",
  "گاہک کا بل": "Customer Invoice",
  "باورچی خانے کا آرڈر": "Kitchen Order Ticket",
  "نسخہ": "Revision",
  "بل کا پرنٹ پیش منظر": "Invoice Print Preview",
  "پرنٹ کریں / PDF محفوظ کریں": "Print / Save PDF",
  "بند کریں": "Close",
});

export function generateInvoiceHtml(
  o: any,
  size: string = "A4",
  kitchen: boolean = false,
  noAutoPrint: boolean = false,
  langOverride?: string
): string {
  const currentLang = langOverride || (typeof window !== "undefined" ? getLanguage() : "ur");
  const isEn = currentLang === "en";

  const words: Record<string, string> = urduTranslations as any;

  const t = (value: any): string => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    if (isEn) {
      if (englishMap[str]) return englishMap[str];
      if (/^میز \d+$/.test(str)) return "Table " + str.split(" ")[1];
      if (/^Table \d+$/.test(str)) return str;
      return str;
    } else {
      if (words[str]) return words[str];
      if (/^Table \d+$/.test(str)) return "میز " + str.split(" ")[1];
      return str;
    }
  };

  const e = (value: any): string =>
    String(t(value) ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c)
    );

  const money = (value: any) => {
    const formatted = ((value || 0) / 100).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isEn
      ? `<span class="money"><bdi dir="ltr">PKR ${formatted}</bdi></span>`
      : `<span class="money"><bdi dir="ltr">${formatted}</bdi> روپے</span>`;
  };

  const thermal = size === "80mm";
  const r = o.restaurant || {};
  const phone = r.phone || "";
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
    ["Outstanding balance", o.balance !== undefined ? o.balance : ((o.total || 0) - (o.received || 0))],
    ...(o.change ? [["Change returned", o.change]] : []),
  ];

  const dir = isEn ? "ltr" : "rtl";
  const langAttr = isEn ? "en" : "ur";
  const fontFam = isEn
    ? `"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`
    : `Urdu, Arial, sans-serif`;

  return `<!doctype html><html lang="${langAttr}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(o.number || "Invoice")}</title><style>
@font-face{font-family:Urdu;src:url('/media/noto-sans-arabic.ttf')}
*{box-sizing:border-box}
body{margin:0;background:#e9eeeb;color:#233c32;font:14px/1.8 ${fontFam}}
.toolbar{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid #d6dfd9;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.toolbar strong{font-size:17px;color:#164b3b}
.toolbar small{color:#65756c;margin-inline-start:12px}
.toolbar .actions{display:flex;gap:10px}
.toolbar button{border:0;border-radius:8px;background:#164b3b;color:#fff;padding:8px 20px;min-height:40px;font:14px/1.8 ${fontFam};cursor:pointer;font-weight:bold}
.toolbar button.secondary{background:#e2e8f0;color:#1e293b}
.paper{position:relative;overflow:hidden;width:${thermal ? "80mm" : "210mm"};max-width:calc(100% - 32px);min-height:${thermal ? "auto" : "297mm"};margin:24px auto;background:white;padding:${thermal ? "5mm" : "12mm"};box-shadow:0 8px 36px rgba(20,56,42,0.1);border-radius:6px}
.invoice-watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${thermal ? "180px" : "360px"};height:${thermal ? "180px" : "360px"};background-image:url('${e((!r.logo || r.logo.includes("restaurant-logo") || r.logo.includes("dastarkhwan")) ? "/media/shah-brothers-logo.png" : r.logo)}');background-repeat:no-repeat;background-position:center;background-size:contain;opacity:0.07;pointer-events:none;z-index:0}
.brand-header,.invoice-heading,.meta,table,.summary,.bill-footer{position:relative;z-index:1}
.brand-header{display:flex;justify-content:space-between;align-items:center;gap:20px;background:#164b3b;color:#fff;border-bottom:4px solid #c89556;border-radius:10px;padding:22px 24px}
.brand-header h1{margin:0;font-size:28px;line-height:1.6}
.brand-header p{margin:0;font-size:12px;opacity:.85}
.brand-header img{width:56px;height:56px;object-fit:contain}
.brand-badge{width:58px;height:58px;border:2px solid #c89556;border-radius:50%;display:grid;place-items:center;font:24px/1 Georgia,serif;color:#ecd2ac;flex-shrink:0}
.invoice-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:20px 0 14px}
.invoice-heading h2{font-size:20px;margin:0}
.invoice-heading bdi{font:600 18px/1.4 Arial,sans-serif}
.status{border:1px solid #d7e3da;background:#eff6f1;color:#164b3b;border-radius:20px;padding:3px 14px;font-size:12px;white-space:nowrap;font-weight:600}
.meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:14px 16px;background:#f0f5f1;border-radius:8px;margin-bottom:20px}
.meta small{display:block;font-size:11px;color:#65756c}
.meta strong{font-weight:600;font-size:13px}
.meta bdi{font:13px/1.8 Arial,sans-serif}
table{width:100%;border-collapse:collapse;table-layout:fixed}
th,td{text-align:${isEn ? "left" : "right"};padding:10px 12px;vertical-align:top;overflow-wrap:anywhere}
th:nth-child(2),td:nth-child(2){text-align:center}
${kitchen ? "" : `th:nth-child(3),td:nth-child(3),th:last-child,td:last-child{text-align:${isEn ? "right" : "left"}}`}
thead{display:table-header-group;background:#164b3b;color:#fff}
th{font-size:13px;font-weight:600}
th:first-child{width:${kitchen ? "70%" : "44%"}}
tbody tr:nth-child(even){background:#f5f8f4}
td{border-bottom:1px solid #e1e8e1;font-size:13px}
td small{display:block;color:#65756c;font-size:11px}
tr{break-inside:avoid}
.money{white-space:nowrap}
.money bdi,.qty{font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}
.summary{width:65%;margin:${isEn ? "22px 0 0 auto" : "22px auto 0 0"};break-inside:avoid;background:#f0f5f1;border-radius:8px;overflow:hidden}
.summary-row{display:flex;justify-content:space-between;gap:14px;padding:7px 14px;font-size:13px}
.summary-row b{font-weight:600}
.summary-row.total{background:#164b3b;color:#fff;font-size:16px;padding:10px 14px}
.bill-footer{display:flex;flex-direction:column;gap:10px;border-top:2px solid #c89556;margin-top:22px;padding-top:14px;font-size:13px}
.footer-primary{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.footer-brand-info{display:flex;align-items:center;gap:10px}
.footer-co-logo{width:36px;height:36px;object-fit:contain;border-radius:6px;border:1px solid #d7e3da;padding:2px;background:#fff}
.footer-text-block{text-align:${isEn ? "left" : "right"}}
.footer-thanks{margin:0;font-weight:bold;color:#164b3b;font-size:13px}
.footer-meta{text-align:${isEn ? "right" : "left"}}
.footer-safe-note{display:block;font-size:11px;color:#65756c}
.revision{color:#65756c;font-size:11px;margin:2px 0 0}
.footer-dev-credit{text-align:center;border-top:1px dashed #d7e3da;padding-top:8px;margin-top:10px;font-size:11px;color:#65756c;font-weight:500;width:100%;letter-spacing:0.3px}
.footer-tech-credit,.footer-phone-text,.footer-phone,.brand-phone{display:none!important}
${noAutoPrint ? ".toolbar{display:none!important}" : ""}
${
  thermal
    ? `.paper{min-height:0;box-shadow:none;border:1px dashed #ccc}
.brand-header{padding:10px;background:white;color:black;border-bottom:1px solid black;border-radius:0;text-align:center}
.brand-header h1{font-size:22px;margin:0 0 4px}
.brand-header .brand-badge{display:none}
.meta{grid-template-columns:1fr;padding:8px;gap:4px;text-align:${isEn ? "left" : "right"}}
.invoice-heading{display:block;text-align:center}
.invoice-heading h2{font-size:15px}
.invoice-heading bdi{font-size:12px}
.status{display:inline-block;margin-top:5px}
td,th{font-size:11px;padding:6px 3px}
td small{font-size:9px}
.summary{width:100%;margin-top:12px}
.summary-row{font-size:11px;padding:5px 8px}
.summary-row.total{font-size:13px}
.bill-footer{text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid #000;gap:8px}
.footer-primary{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}
.footer-brand-info{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}
.footer-text-block{text-align:center}
.footer-thanks{font-size:12px}
.footer-meta{text-align:center}
.footer-dev-credit{font-size:10px;margin-top:6px;padding-top:6px;border-top:1px dashed #999}
.money{white-space:normal}`
    : ""
}
@page{size:${thermal ? "80mm auto" : "A4"};margin:${thermal ? "4mm" : "10mm"}}
@media print{
html,body{background:#fff;margin:0}
.toolbar{display:none}
.paper{position:relative;overflow:hidden;width:100%;max-width:none;min-height:0;margin:0;padding:0;box-shadow:none;border-radius:0;border:none}
.invoice-watermark{opacity:0.07!important;display:block!important}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
.brand-header,.meta,.invoice-heading,.bill-footer{break-inside:avoid}
.brand-header{padding:${thermal ? "8px" : "16px 20px"}}
.brand-header h1{font-size:${thermal ? "20px" : "28px"}}
.invoice-heading{margin:14px 0 10px}
.meta{margin-bottom:14px}
td,th{padding:${thermal ? "5px 2px" : "7px 10px"}}
.summary{margin-top:16px}
.bill-footer{margin-top:16px;break-inside:avoid}
}
</style></head><body>
${noAutoPrint ? "" : `<nav class="toolbar">
  <div><strong>${isEn ? "Invoice Print Preview" : "بل کا پرنٹ پیش منظر"}</strong><small>${e(size)} · <bdi>${e(o.number)}</bdi></small></div>
  <div class="actions">
    <button type="button" onclick="window.print()">${isEn ? "Print / Save PDF" : "پرنٹ کریں / PDF محفوظ کریں"}</button>
    <button type="button" class="secondary" onclick="window.close()">${isEn ? "Close" : "بند کریں"}</button>
  </div>
</nav>`}
<main class="paper">
<div class="invoice-watermark" aria-hidden="true"></div>
<header class="brand-header">
  <div>
    <h1>${isEn ? ((r.name && r.name !== "Dastarkhwan" && r.name !== "دسترخوان" && englishMap[r.name]) || (r.name && r.name !== "Dastarkhwan" && r.name !== "دسترخوان" ? r.name : "Shah Brothers Restaurant")) : (r.name && r.name !== "Dastarkhwan" && r.name !== "دسترخوان" ? e(r.name) : "شاہ برادرز ریسٹورنٹ")}</h1>
    <p>${isEn ? ((r.tagline && r.tagline !== "Desi Kitchen" && r.tagline !== "دیسی کھانے" && englishMap[r.tagline]) || (r.tagline && r.tagline !== "Desi Kitchen" && r.tagline !== "دیسی کھانے" ? r.tagline : "Restaurant & Desi Kitchen")) : (r.tagline && r.tagline !== "Desi Kitchen" && r.tagline !== "دیسی کھانے" ? e(r.tagline) : "ریسٹورنٹ اور دیسی کچن")}</p>
    <p>${isEn ? (englishMap[r.address] || r.address || "Rawalpindi, Pakistan") : e(r.address || "راولپنڈی، پاکستان")}</p>
  </div>
  <img src="${e((!r.logo || r.logo.includes("restaurant-logo") || r.logo.includes("dastarkhwan")) ? "/media/shah-brothers-logo.png" : r.logo)}" alt="Logo" style="width:60px;height:60px;object-fit:contain;border-radius:10px;background:#ffffff;padding:3px;box-shadow:0 2px 5px rgba(0,0,0,0.15);flex-shrink:0;">
</header>
<section class="invoice-heading">
  <h2>${kitchen ? (isEn ? "Kitchen Order Ticket" : "باورچی خانے کا آرڈر") : (isEn ? "Customer Invoice" : "گاہک کا بل")} <bdi dir="ltr">${e(o.number)}</bdi></h2>
  ${!kitchen ? '<span class="status">' + e(o.paymentStatus) + "</span>" : ""}
</section>
<section class="meta">
  <div><small>${isEn ? "Dining Option" : "کھانے کا طریقہ"}</small><strong>${e(o.service)} | ${e(o.place)}</strong></div>
  <div><small>${isEn ? "Customer" : "گاہک"}</small><strong>${e(o.customer?.name || (isEn ? "Walk-in guest" : "عام گاہک"))}${o.customer?.phone ? " · <bdi dir=\"ltr\">" + e(o.customer.phone) + "</bdi>" : ""}${o.customer?.address ? '<br><small style="font-size:11px;font-weight:normal;color:#456">' + e(o.customer.address) + "</small>" : ""}</strong></div>
  <div><small>${isEn ? "Date & Time" : "تاریخ اور وقت"}</small><bdi dir="ltr">${e(date)}</bdi></div>
</section>
<table>
  <thead>
    <tr>
      <th>${isEn ? "Item / Description" : "کھانے کی تفصیل"}</th>
      <th>${isEn ? "Qty" : "تعداد"}</th>
      ${kitchen ? "" : `<th>${isEn ? "Unit Price" : "فی عدد قیمت"}</th><th>${isEn ? "Amount" : "رقم"}</th>`}
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
      ${r.logo ? `<img src="${e(r.logo)}" class="footer-co-logo" alt="Logo">` : ""}
      <div class="footer-text-block">
        <p class="footer-thanks">${isEn ? (englishMap[r.footer] || r.footer || "Thank you for dining with us.") : e(r.footer || "تشریف لانے کا شکریہ۔")}</p>
      </div>
    </div>
    <div class="footer-meta">
      <small class="footer-safe-note">${isEn ? "Saved invoice record" : "یہ محفوظ بل ہے۔"}</small>
      <p class="revision">${isEn ? "Revision" : "نسخہ"} ${o.revision || 1} · <bdi dir="ltr">${e(o.number)}</bdi></p>
    </div>
  </div>
  <div class="footer-dev-credit">
    <span>Software developed by HH Tech Hub</span>
  </div>
</footer>
</main>
${noAutoPrint ? "" : `<script>
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 400);
  });
</script>`}
</body></html>`;
}

const flutterBridge = (): any => (typeof window !== "undefined" ? (window as any).FlutterApp : null);

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function sendPdfToFlutter(blob: Blob, fileName: string, text = "") {
  const bridge = flutterBridge();
  if (!bridge || typeof bridge.postMessage !== "function") return false;
  const base64 = await blobToBase64(blob);
  bridge.postMessage(JSON.stringify({ action: "pdf", fileName, base64, text }));
  return true;
}

// Android WebView has no navigator.share(files) support: route it through the Flutter app.
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  const w = window as any;
  if (w.FlutterApp && typeof w.FlutterApp.postMessage === "function" && !(navigator as any).__flutterShareShim) {
    (navigator as any).__flutterShareShim = true;
    (navigator as any).canShare = () => true;
    (navigator as any).share = async (data: any) => {
      const files: File[] = data?.files || [];
      if (files.length) {
        await sendPdfToFlutter(files[0], files[0].name, data?.text || "");
      } else {
        w.FlutterApp.postMessage(JSON.stringify({ action: "share", text: [data?.title, data?.text, data?.url].filter(Boolean).join("\n") }));
      }
    };
  }
}

export function printInvoice(order: any, size: string = "A4", kitchen: boolean = false, lang?: string) {
  const currentLang = lang || (typeof window !== "undefined" ? getLanguage() : "ur");
  if (flutterBridge()) {
    // window.open()/window.print() do not work inside the Flutter WebView; build a PDF and hand it to the app.
    downloadInvoicePdf(order, size, currentLang, kitchen).catch((err) => console.error("Flutter print error:", err));
    return;
  }
  const html = generateInvoiceHtml(order, size, kitchen, false, currentLang);
  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  }
}

/**
 * Directly downloads the invoice as a PDF file without opening the browser's print dialog.
 */
export async function downloadInvoicePdf(order: any, size: string = "A4", lang?: string, kitchen: boolean = false): Promise<File | null> {
  const currentLang = lang || (typeof window !== "undefined" ? getLanguage() : "ur");
  return new Promise((resolve, reject) => {
    try {
      const isThermal = size === "80mm";
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = isThermal ? "400px" : "850px";
      iframe.style.height = "1600px";
      iframe.style.border = "none";
      iframe.style.opacity = "0.01";
      iframe.style.zIndex = "-9999";

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        if (iframe.parentNode) document.body.removeChild(iframe);
        reject(new Error("Unable to create document context for PDF"));
        return;
      }

      const html = generateInvoiceHtml(order, size, kitchen, true, currentLang); // true = noAutoPrint, no toolbar
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(async () => {
        try {
          const paper = (doc.querySelector(".paper") as HTMLElement) || doc.body;

          const canvas = await html2canvas(paper, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png");
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;

          let pdf: jsPDF;
          const fileName = `${order.number || "Invoice"}-${kitchen ? "Kitchen-Ticket" : `Revision-${order.revision || 1}`}.pdf`;

          if (isThermal) {
            const pdfWidth = 80;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: [pdfWidth, Math.max(pdfHeight, 80)],
            });
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          } else {
            pdf = new jsPDF({
              orientation: "portrait",
              unit: "mm",
              format: "a4",
            });
            const pdfWidth = 210;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(pdfHeight, 297));
          }

          const pdfBlob = pdf.output("blob");

          if (!(await sendPdfToFlutter(pdfBlob, fileName))) {
            let shared = false;
            try {
              const fileObj = new File([pdfBlob], fileName, { type: "application/pdf" });
              if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [fileObj] })) {
                await navigator.share({
                  files: [fileObj],
                  title: fileName,
                  text: `${order?.number || "Invoice"} - ${order?.restaurant?.name || "Restaurant"}`
                });
                shared = true;
              }
            } catch (_) {}

            if (!shared) {
              const downloadUrl = URL.createObjectURL(pdfBlob);
              const link = document.createElement("a");
              link.href = downloadUrl;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();

              setTimeout(() => {
                if (link.parentNode) document.body.removeChild(link);
                URL.revokeObjectURL(downloadUrl);
              }, 300);
            }
          }

          if (iframe.parentNode) document.body.removeChild(iframe);

          const file = new File([pdfBlob], fileName, { type: "application/pdf" });
          resolve(file);
        } catch (err) {
          if (iframe.parentNode) document.body.removeChild(iframe);
          reject(err);
        }
      }, 500);
    } catch (err) {
      reject(err);
    }
  });
}
