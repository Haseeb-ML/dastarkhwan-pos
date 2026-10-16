import fs from 'fs';
import path from 'path';

const file = path.resolve('src/invoice_print.mjs');
let content = fs.readFileSync(file, 'utf8');

// Replace r definition to include phone fallback
content = content.replace(
  "const thermal = size === '80mm', r = o.restaurant",
  "const thermal = size === '80mm', r = o.restaurant || {}, phone = r.phone || '051 6122024'"
);

// Replace thermal styles to format brand-contact
content = content.replace(
  "${thermal?'.paper{min-height:0}.brand-header{padding:10px;background:white;color:black;border-bottom:1px solid black;border-radius:0}.brand-header h1{font-size:20px}",
  "${thermal?'.paper{min-height:0}.brand-header{padding:10px;background:white;color:black;border-bottom:1px solid black;border-radius:0;text-align:center}.brand-header h1{font-size:22px;margin:0 0 4px}.brand-phone{font-size:13px!important;font-weight:bold;margin:4px 0!important}"
);

// Replace header HTML to explicitly show company name and phone number
content = content.replace(
  `<header class="brand-header"><div><h1>\${e(r.name)}</h1><p>\${e(r.tagline)}</p><p>\${e(r.address)}\${r.phone?' | '+e(r.phone):''}</p>\${r.taxId?'<p>کاروباری نمبر: '+e(r.taxId)+'</p>':''}</div>\${r.logo?'<img src="'+e(r.logo)+'" alt="لوگو">':'<div class="brand-badge" aria-hidden="true">D</div>'}</header>`,
  `<header class="brand-header"><div><h1>\${e(r.name || 'Dastarkhwan')}</h1><p>\${e(r.tagline || 'Desi Kitchen')}</p><p>\${e(r.address || 'Rawalpindi, Pakistan')}</p><p class="brand-phone" style="margin-top:4px;font-size:13px;"><strong>فون نمبر: <bdi dir="ltr">\${e(phone)}</bdi></strong></p>\${r.taxId?'<p>کاروباری نمبر: '+e(r.taxId)+'</p>':''}</div>\${r.logo?'<img src="'+e(r.logo)+'" alt="لوگو">':'<div class="brand-badge" aria-hidden="true">D</div>'}</header>`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated src/invoice_print.mjs');
