# Dastarkhwan Mini ERP

The approved React/Vite design now runs with a Node.js HTTP API, SQLite database, authenticated staff sessions, transaction-safe business operations and ReportLab PDF output. This folder is the runnable ERP package; the original frontend toolchain remains in the parent project.

## Local installation and run

Prerequisites: Node.js 24 or newer, npm, Python 3.10 or newer.

From the parent restaurant folder:

```powershell
npm install
cd src
npm install
python -m pip install -r requirements.txt
npm start
```

Open **http://localhost:5173/**. The local server serves the staff-facing Roman Urdu order workflow.

Development accounts: **owner**, **cashier**, **kitchen**; password **Demo@2026!**. Owner has all seven sections. Accounts have real password hashes and real server permissions; a role cannot be changed by clicking the profile. Change staff credentials in Settings before using client records.

Development seeds contain sample dishes, prices, tables, staff and clearly described opening stock. There are no sample customers, invoices, orders, payments or expenses. Safe client test actions persist in `data/development.sqlite`. Browser tests use separate `data/test/browser-*.sqlite` files, and business/document tests use isolated databases. Never rename the development database as the production database.

## Commands

Run these from this folder:

```powershell
npm start
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run build
node backup.mjs
```

The production build is written inside `src/build`. The backend serves this build when `NODE_ENV=production`; do not serve the frontend alone, because saved records and invoice documents require the API.

## Clean production onboarding

Environment variables are documented in `.env.example`; the process reads actual environment variables (it does not automatically load a .env file).

```powershell
$env:NODE_ENV = 'production'
$env:ERP_PORT = '5173'
$env:ERP_SETUP_TOKEN = '<a long private random installation token>'
npm start
```

Production defaults to a fresh **data/production.sqlite**, with **no demo users, menu, opening stock or business transactions**. The sign-in page offers Initial Owner setup. Enter the private installation token, your Owner name, username and a password of at least 10 characters. Initial setup is disabled as soon as an account exists. After setup, remove the token from the runtime environment.

Configure restaurant identity/logo/contact, charges, tables and staff in Settings. Add the client's actual dishes/variants and ingredients, record opening stock with a reason, add suppliers and open a cash session. Taxes and service charges remain zero until the Owner configures them. Development sample prices are examples only.

For a second device on the same network, bind `ERP_HOST=0.0.0.0` and use the computer's LAN IP with port 5173; users sign in separately to the same database. For deployed use, put the Node service behind an HTTPS reverse proxy, set `ERP_SECURE=1`, preserve the public Host header and set persistent storage for the database, uploads and backups. Install Python requirements on that host and provide process supervision. WebSocket forwarding supports development hot reload; saved records synchronize using 5-second polling. This is one single-location SQLite service, not multiple independent database copies.

## Database, migrations and backups

`schema.sql` and the versioned cash-ledger migration in `erp.mjs` run on startup. SQLite uses foreign keys, WAL, unique invoice numbers, a unique open order per table, unique kitchen batches, stock receipt references and idempotency constraints.

`node backup.mjs` uses SQLite's online backup API, so committed WAL records are included. Copy `data/uploads` alongside the snapshot; retain the bundled `media` assets. Backups contain staff password hashes and business records and should be stored privately.

To restore: stop the ERP process, preserve a backup of the current database/uploads, ensure no process still has the target database open, restore the chosen snapshot to the configured `ERP_DB` path and restore the matching uploads. Remove only stale `-wal`/`-shm` files for that exact closed target database, then start the service and verify Settings, a known invoice and stock totals. Restore first to a separate staging database if possible. Never copy a live SQLite file directly without its WAL; use the backup command.

## Business rules

- PKR amounts are integer **paise**; quantities are integer **thousandths** of kg/litre/piece/portion. BigInt multiplication protects authoritative line rounding. Half-paise rounds up. Each line is rounded, discount is subtracted, tax and service percentages are each calculated on the discounted subtotal, then added. Charge rates are integer basis points.
- Only the server supplies prices, invoice numbers, bill totals and availability checks. Order, snapshot, invoice revision and kitchen ticket commit atomically. The browser clears a draft only after a confirmed result.
- Idempotency is scoped to the authenticated actor and request key. A different body cannot reuse a committed key. Pending requests survive reload; an uncertain save retrieves the existing operation before replaying the same key.
- Existing order additions require the current version, keep existing price snapshots, create a new invoice revision and only send the added batch to the kitchen.
- Dine-in requires an active table; an occupied table opens its existing order. Serve all batches before closing/releasing a table. Closing does not delete its invoice or outstanding amount.
- Payments apply up to the balance. Cash tender minus amount applied is returned change; non-cash excess is rejected. Multiple payments and customer dues collections use the same flow. Kitchen state is independent from payment state.
- Refunds require Owner permission, a reason and a cap against net collected funds. Refunds reduce collectible value without creating fresh debt. Original invoice totals and reversals remain visible. Cancellation requires collected funds to be refunded first and a preparation disposition.
- Stock consumption is **manual**. Recipe estimates are disabled. Opening stock is entered once; stock in, consumption, wastage and adjustments are traceable. Piece movements are whole units. Overdraw is rejected inside the transaction.
- Cancelling food does not reverse raw ingredient consumption. Record prepared-food wastage manually with an order reference. Unprepared cancellation can return limited prepared menu portions only while all tickets are still New.
- Receiving a purchase increases stock once. Paying its supplier balance changes payments and cash only.
- Cash movements are recorded once and linked to the open cash session. Expected cash = opening + cash applied to bills - cash refunds - cash expenses - cash supplier payments. Transactions before a session never enter it through a timestamp boundary. Expenses can have a business date different from their actual cash posting time.
- Sales follow original business dates; collections follow payment posting dates. Profit uses saved per-size dish cost snapshots and operating expenses. Refunds are apportioned to food revenue and attributed to the original sale date for profit; tax/service are excluded. Prepared cancellations retain their dish costs, unprepared cancellations do not. Stock purchases are not deducted again because their food cost is already included in dish costs. Missing historical costs block profit rather than inventing it.
- Invoice A4/80mm PDFs and print views use saved revisions; payments/refunds shown with an older revision are the current ledger. Choose the latest revision for payments/refunds.
- Card/bank/wallet are recorded tenders, not a payment processor. WhatsApp uses deliberate PDF preparation, recipient confirmation and native sharing where supported, with download/message/attachment fallback. Handoff is never marked as delivery.

## Evidence and acceptance

See `REQUIREMENTS.md`, `output/VERIFICATION.md`, `output/browser-report/index.html`, `output/evidence` and `output/pdf`.

Client acceptance:
1. Sign in as Owner; verify identity/menu/table and open cash with the actual float.
2. Create a guest Dine-in order: Half Chicken Karahi x1, Roghni Naan x4, Raita x1. With development prices and zero charges the total is **PKR 1,620**.
3. Receive **PKR 2,000 Cash**; confirm applied **1,620**, change **380**, Paid state, saved invoice, PDF and print view. For partial payment, apply **1,000**, balance **620**.
4. Sign in as Kitchen on another browser/device, progress New -> Preparing -> Ready -> Served. Owner releases the table; invoice history remains.
5. Open another active order, add a dish and confirm same invoice identity, revision increment and separate new kitchen batch.
6. Add a customer, collect an outstanding balance through their invoice. Refresh/re-login and confirm records remain.
7. Receive a supplier purchase, verify stock in; pay the remaining supplier balance and confirm stock stays unchanged. Record consumption/wastage with reasons.
8. Record an expense, count cash and close the session. Verify Sales versus Collections and the closing difference.
9. Test actual A4/80mm printers and WhatsApp PDF attachment on the client's phone. Automated Chromium viewport testing does not certify a physical printer, iOS/Android share sheet or WhatsApp delivery.

## Source assets and technical references

Branding, UI tokens and photography came from the supplied project. Food JPEGs and Google font files are cached locally; font OFL licenses are in `media`. Original photography URLs are retained in `ASSETS.md`. Uploaded photos are resized in the browser and stored as bounded raster files.

Implementation reference: [Node SQLite API](https://nodejs.org/api/sqlite.html), [MDN native file sharing](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share).

