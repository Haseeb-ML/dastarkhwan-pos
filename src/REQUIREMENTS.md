# Delivery checklist

Final continuation audit: 7 October 2026, Asia/Karachi. All core Mini ERP functionality is implemented. TypeScript and production build passed; 25 business/document/production tests and 15 Chromium workflow tests passed. Detailed evidence and external-device limitations: output/VERIFICATION.md.

| Requirement | Screen / API | Status and evidence |
|---|---|---|
| Authentication, roles | Login, Settings; auth/staff | Verified: unauthorized direct requests and role views |
| Menu, POS | New Order, Menu; menu/orders/drafts | Verified: variants, quantities, availability, guest/customer flows |
| Atomic order, amendments | Orders; orders/append | Verified: idempotency, snapshots, revisions, tickets, conflicts |
| Payments, refunds | Invoice; payments/cancel/refunds | Verified: fixture/change/partial/dues/refund caps |
| Documents | Invoice; document/PDF | Verified: saved revisions, A4/thermal/long/Urdu PDF and visual review |
| WhatsApp sharing | Invoice sharing dialog | Desktop preparation/download fallback verified; real phone/share sheet pending |
| Physical printing | A4/80mm print/PDF | Print view verified; actual printer/device pending |
| Kitchen/tables | Orders; tickets/close | Verified: independent kitchen/payment, table release/history |
| CRM | Customers; customers | Verified: normalized phones, invoice-derived dues |
| Stock/suppliers | Stock & Purchases | Verified: movements, receive once, supplier settlement |
| Reporting/cash | Daily Summary | Verified: sales/collections and cash reconciliation |
| Identity/staff/tables | Settings | Verified: persistence, permissions, production owner setup |
| Responsive/recovery | All | Verified: 1440/1024/390/360 px and network/lost-response workflows |
| Onboarding/backup/test | README, tests | Delivered: isolated fixtures, clean production and backup/restore guidance |

Defaults: manual consumption; PKR paise; quantities in thousandths; charges zero; Asia/Karachi business dates; supplied design. Optional recipe consumption disabled. No payment gateway or WhatsApp confirmed-delivery claim. Client identity, actual menu/prices and dish-specific photos must be configured before launch. Public hosting requires deployment details.
