import { readFileSync } from "node:fs"

export default function invoiceView(o, size, kitchen = false, lang = 'ur') {
  const isEn = lang === 'en';
  const words = JSON.parse(readFileSync(new URL('./urdu.json', import.meta.url), 'utf8'));
  const englishMap = {};
  for (const [k, v] of Object.entries(words)) {
    if (v && typeof v === 'string') englishMap[v.trim()] = k.trim();
  }
  Object.assign(englishMap, {
    "دسترخوان": "Dastarkhwan",
    "دیسی کھانے": "Desi Kitchen",
    "راولپنڈی، پاکستان": "Rawalpindi, Pakistan",
    "تشریف لانے کا شکریہ۔": "Thank you for dining with us.",
    "یہ محفوظ بل ہے۔": "Saved invoice record",
    "عام گاہک": "Walk-in guest",
    "پارسل": "Parcel",
    "کھانا وہیں": "Dine-in",
    "پلیٹ": "Plate",
    "حصہ": "Portion",
    "عدد": "Piece",
    "پیسے باقی ہیں": "Unpaid",
    "پیسے وصول ہو گئے": "Paid",
    "کچھ پیسے ملے": "Partial",
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
    "پرنٹ کریں": "Print",
  });

  const translate = value => {
    if (!value) return '';
    const str = String(value).trim();
    if (isEn) {
      if (englishMap[str]) return englishMap[str];
      if (/^میز \d+$/.test(str)) return "Table " + str.split(" ")[1];
      return str;
    }
    return words[str] || (/^Table \d+$/.test(str) ? 'میز ' + str.split(' ')[1] : str);
  };

  const e = value => String(translate(value) ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
  const money = value => {
    const formatted = ((value || 0) / 100).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return isEn
      ? `<span class="money"><bdi dir="ltr">PKR ${formatted}</bdi></span>`
      : `<span class="money"><bdi dir="ltr">${formatted}</bdi> روپے</span>`;
  };

  const thermal = size === '80mm', r = o.restaurant || {}, phone = r.phone || '';
  const date = new Date(o.created).toLocaleString('en-GB', { timeZone: 'Asia/Karachi', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  const totals = [
    ['Subtotal', o.subtotal],
    ...(o.discount ? [['Discount', -o.discount]] : []),
    ...(o.tax ? [['Tax', o.tax]] : []),
    ...(o.serviceCharge ? [['Service charge', o.serviceCharge]] : []),
    ['Grand total', o.total],
    ['Payments received', o.received || 0],
    ...(o.refunded ? [['Refunds', o.refunded], ['Net received', o.net]] : []),
    ['Outstanding balance', o.balance !== undefined ? o.balance : ((o.total || 0) - (o.received || 0))],
    ...(o.change ? [['Change returned', o.change]] : []),
  ];

  const dir = isEn ? 'ltr' : 'rtl';
  const langAttr = isEn ? 'en' : 'ur';
  const fontFam = isEn ? '"DM Sans", Arial, sans-serif' : 'Urdu, Arial, sans-serif';

  return `<!doctype html><html lang="${langAttr}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(o.number)}</title><style>
  @font-face{font-family:Urdu;src:url('/media/noto-sans-arabic.ttf')}
  *{box-sizing:border-box}
  body{margin:0;background:#e9eeeb;color:#233c32;font:14px/1.8 ${fontFam}}
  .toolbar{position:sticky;top:0;z-index:2;background:#fff;border-bottom:1px solid #d6dfd9;padding:12px 24px;display:flex;justify-content:space-between;align-items:center;gap:12px}
  .toolbar strong{font-size:17px;color:#164b3b}
  .toolbar small{color:#65756c;margin-inline-start:12px}
  .toolbar button{border:0;border-radius:9px;background:#164b3b;color:#fff;padding:8px 24px;min-height:44px;font:15px/1.8 ${fontFam};cursor:pointer;font-weight:bold}
  .paper{width:${thermal ? '80mm' : '210mm'};max-width:calc(100% - 32px);min-height:${thermal ? 'auto' : '297mm'};margin:24px auto;background:white;padding:${thermal ? '5mm' : '12mm'};box-shadow:0 8px 36px #14382a18;border-radius:4px}
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
  th,td{text-align:${isEn ? 'left' : 'right'};padding:10px 12px;vertical-align:top;overflow-wrap:anywhere}
  th:nth-child(2),td:nth-child(2){text-align:center}
  ${kitchen ? '' : `th:nth-child(3),td:nth-child(3),th:last-child,td:last-child{text-align:${isEn ? 'right' : 'left'}}`}
  thead{display:table-header-group;background:#164b3b;color:#fff}
  th{font-size:13px;font-weight:600}
  th:first-child{width:${kitchen ? '70%' : '44%'}}
  tbody tr:nth-child(even){background:#f5f8f4}
  td{border-bottom:1px solid #e1e8e1;font-size:13px}
  td small{display:block;color:#65756c;font-size:11px}
  tr{break-inside:avoid}
  .money{white-space:nowrap}
  .money bdi,.qty{font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}
  .summary{width:65%;margin:${isEn ? '22px 0 0 auto' : '22px auto 0 0'};break-inside:avoid;background:#f0f5f1;border-radius:8px;overflow:hidden}
  .summary-row{display:flex;justify-content:space-between;gap:14px;padding:7px 14px;font-size:13px}
  .summary-row b{font-weight:600}
  .summary-row.total{background:#164b3b;color:#fff;font-size:16px;padding:10px 14px}
  .bill-footer{display:flex;flex-direction:column;gap:10px;border-top:2px solid #c89556;margin-top:22px;padding-top:14px;font-size:13px}
  .footer-primary{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-brand-info{display:flex;align-items:center;gap:10px}
  .footer-co-logo{width:36px;height:36px;object-fit:contain;border-radius:6px;border:1px solid #d7e3da;padding:2px;background:#fff}
  .footer-text-block{text-align:${isEn ? 'left' : 'right'}}
  .footer-thanks{margin:0;font-weight:bold;color:#164b3b;font-size:13px}
  .footer-meta{text-align:${isEn ? 'right' : 'left'}}
  .footer-safe-note{display:block;font-size:11px;color:#65756c}
  .revision{color:#65756c;font-size:11px;margin:2px 0 0}
  .footer-dev-credit{text-align:center;border-top:1px dashed #d7e3da;padding-top:8px;margin-top:10px;font-size:11px;color:#65756c;font-weight:500;width:100%;letter-spacing:0.3px}
  .footer-tech-credit,.footer-phone-text,.footer-phone,.brand-phone{display:none!important}
  ${thermal ? `.paper{min-height:0;box-shadow:none;border:1px dashed #ccc}.brand-header{padding:10px;background:white;color:black;border-bottom:1px solid black;border-radius:0;text-align:center}.brand-header h1{font-size:22px;margin:0 0 4px}.brand-header .brand-badge{display:none}.meta{grid-template-columns:1fr;padding:8px;gap:4px;text-align:${isEn ? 'left' : 'right'}}.invoice-heading{display:block;text-align:center}.invoice-heading h2{font-size:15px}.invoice-heading bdi{font-size:12px}.status{display:inline-block;margin-top:5px}td,th{font-size:10px;padding:6px 3px}td small{font-size:9px}.summary{width:100%;margin-top:12px}.summary-row{font-size:11px;padding:5px 8px}.summary-row.total{font-size:13px}.bill-footer{text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid #000;gap:8px}.footer-primary{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}.footer-brand-info{flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:4px}.footer-text-block{text-align:center}.footer-thanks{font-size:12px}.footer-meta{text-align:center}.footer-dev-credit{font-size:10px;margin-top:6px;padding-top:6px;border-top:1px dashed #999}.money{white-space:normal}` : ''}
  @media(max-width:600px){.toolbar{padding:10px 14px}.toolbar small{display:none}.paper{padding:${thermal ? '5mm' : '18px'};max-width:calc(100% - 16px);margin:12px auto}.brand-header{padding:16px}.brand-header h1{font-size:25px}.meta{grid-template-columns:1fr;gap:6px}.summary{width:100%}td,th{padding:8px 5px;font-size:11px}.money{white-space:normal}.footer-primary{flex-direction:column;align-items:center;text-align:center;gap:8px}.footer-brand-info{flex-direction:column;align-items:center;text-align:center}.footer-text-block{text-align:center}.footer-meta{text-align:center}}
  @page{size:${thermal ? '80mm auto' : 'A4'};margin:${thermal ? '4mm' : '10mm'}}@media print{html,body{background:#fff;margin:0}.toolbar{display:none}.paper{width:100%;max-width:none;min-height:0;margin:0;padding:0;box-shadow:none;border-radius:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}.brand-header,.meta,.invoice-heading,.bill-footer{break-inside:avoid}.brand-header{padding:${thermal ? '8px' : '16px 20px'}}.brand-header h1{font-size:${thermal ? '20px' : '28px'}}.invoice-heading{margin:14px 0 10px}.meta{margin-bottom:14px}td,th{padding:${thermal ? '5px 2px' : '7px 10px'}}.summary{margin-top:16px}.bill-footer{margin-top:16px;break-inside:avoid}}
  </style></head><body><nav class="toolbar"><div><strong>${isEn ? 'Invoice Print Preview' : 'بل کا پرنٹ پیش منظر'}</strong><small>${e(size)} · <bdi>${e(o.number)}</bdi></small></div><button type="button" onclick="window.print()">${isEn ? 'Print' : 'پرنٹ کریں'}</button></nav><main class="paper"><header class="brand-header"><div><h1>${isEn ? (englishMap[r.name] || r.name || 'Dastarkhwan') : e(r.name || 'دسترخوان')}</h1><p>${isEn ? (englishMap[r.tagline] || r.tagline || 'Desi Kitchen') : e(r.tagline || 'دیسی کھانے')}</p><p>${isEn ? (englishMap[r.address] || r.address || 'Rawalpindi, Pakistan') : e(r.address || 'راولپنڈی، پاکستان')}</p></div>${r.logo ? '<img src="' + e(r.logo) + '" alt="Logo">' : '<div class="brand-badge" aria-hidden="true">D</div>'}</header><section class="invoice-heading"><h2>${kitchen ? (isEn ? 'Kitchen Order Ticket' : 'باورچی خانے کا آرڈر') : (isEn ? 'Customer Invoice' : 'گاہک کا بل')} <bdi dir="ltr">${e(o.number)}</bdi></h2>${!kitchen ? '<span class="status">' + e(o.paymentStatus) + '</span>' : ''}</section><section class="meta"><div><small>${isEn ? 'Dining Option' : 'کھانے کا طریقہ'}</small><strong>${e(o.service)} | ${e(o.place)}</strong></div><div><small>${isEn ? 'Customer' : 'گاہک'}</small><strong>${e(o.customer?.name || (isEn ? 'Walk-in guest' : 'عام گاہک'))}${o.customer?.phone ? ' · <bdi dir="ltr">' + e(o.customer.phone) + '</bdi>' : ''}${o.customer?.address ? '<br><small style="font-size:11px;font-weight:normal;color:#456">' + e(o.customer.address) + '</small>' : ''}</strong></div><div><small>${isEn ? 'Date & Time' : 'تاریخ اور وقت'}</small><bdi dir="ltr">${e(date)}</bdi></div></section><table><thead><tr><th>${isEn ? 'Item / Description' : 'کھانے کی تفصیل'}</th><th>${isEn ? 'Qty' : 'تعداد'}</th>${kitchen ? '' : `<th>${isEn ? 'Unit Price' : 'فی عدد قیمت'}</th><th>${isEn ? 'Amount' : 'رقم'}</th>`}</tr></thead><tbody>${o.items.map(i => `<tr><td>${e(i.name)}<small>${e(i.variant)}${kitchen && i.note ? ' - ' + e(i.note) : ''}</small></td><td><bdi class="qty" dir="ltr">${i.qty / 1000}</bdi> ${e(i.unit)}</td>${kitchen ? '' : `<td>${money(i.price)}</td><td>${money(i.amount)}</td>`}</tr>`).join('')}</tbody></table>${kitchen ? '' : '<section class="summary">' + totals.map(([k, v]) => `<div class="summary-row ${k === 'Grand total' ? 'total' : ''}"><span>${e(k)}</span><b>${money(v)}</b></div>`).join('') + '</section>'}<footer class="bill-footer"><div class="footer-primary"><div class="footer-brand-info">${r.logo ? `<img src="${e(r.logo)}" class="footer-co-logo" alt="Logo">` : ''}<div class="footer-text-block"><p class="footer-thanks">${isEn ? (englishMap[r.footer] || r.footer || 'Thank you for dining with us.') : e(r.footer || 'تشریف لانے کا شکریہ۔')}</p></div></div><div class="footer-meta"><small class="footer-safe-note">${isEn ? 'Saved invoice record' : 'یہ محفوظ بل ہے۔'}</small><p class="revision">${isEn ? 'Revision' : 'نسخہ'} ${o.revision} · <bdi dir="ltr">${e(o.number)}</bdi></p></div></div><div class="footer-dev-credit">Software developed by HH Tech Hub</div></footer></main></body></html>`
}
