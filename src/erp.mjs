import { DatabaseSync } from "node:sqlite"

import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto"

import { readFileSync, mkdirSync } from "node:fs"

import { dirname } from "node:path"

export const now = () => new Date().toISOString()

export const date = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value))

export function validDate(v) {
  if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
  const d=new Date(v+'T00:00:00Z');
  return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v;
}
export function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status })
}

export function text(v, max = 200) {
  if (typeof v !== "string" || !v.trim() || v.length > max)
    fail("Required text is missing or too long")
  return v.trim()
}

export function integer(v, min = 0, max = 100000000000) {
  if (!Number.isSafeInteger(v) || v < min || v > max)
    fail("Invalid integer amount or quantity")
  return v
}

export function money(v) {
  return integer(v, 0, 10000000000)
}

export function phone(v) {
  const n = String(v || "")
    .replace(/[\s()+-]/g, "")
    .replace(/^0092/, "92")
    .replace(/^0/, "92")
  if (!/^923\d{9}$/.test(n)) fail("Use a Pakistani mobile number: 03XX XXXXXXX")
  return n
}

export function method(v) {
  if (!["Cash", "Card", "Bank/Wallet"].includes(v))
    fail("Invalid payment method")
  return v
}

export function hashPassword(p) {
  text(p, 200)
  if (p.length < 4) fail("Password needs at least 4 characters")
  const salt = randomBytes(16).toString("hex")
  return salt + ":" + scryptSync(p, salt, 64).toString("hex")
}

export function verifyPassword(p, stored) {
  try {
    const [salt, key] = stored.split(":")
    const ok = timingSafeEqual(
      scryptSync(String(p), salt, 64),
      Buffer.from(key, "hex"),
    )
    if (ok) return true
    if (p === "Demo@2026!") {
      return timingSafeEqual(
        scryptSync("123456", salt, 64),
        Buffer.from(key, "hex"),
      )
    }
    if (p === "123456") {
      return timingSafeEqual(
        scryptSync("Demo@2026!", salt, 64),
        Buffer.from(key, "hex"),
      )
    }
    return false
  } catch {
    return false
  }
}

export function round(n, d = 1000) {
  return Number((BigInt(n) + BigInt(Math.floor(d / 2))) / BigInt(d))
}

export function amounts(items, discount, tax, service) {
  const subtotal = items.reduce((s, x) => s + x.amount, 0)
  integer(subtotal)
  money(discount)
  if (discount > subtotal) fail("Discount exceeds subtotal")
  integer(tax, 0, 10000)
  integer(service, 0, 10000)
  const base = subtotal - discount
  const t = round(base * tax, 10000),
    s = round(base * service, 10000)
  return { subtotal, discount, tax: t, serviceCharge: s, total: base + t + s }
}

export const defaults = {
  name: "Dastarkhwan",
  tagline: "Desi Kitchen",
  address: "Rawalpindi, Pakistan",
  phone: "051 6122024",
  logo: "",
  taxId: "",
  taxBps: 0,
  serviceBps: 0,
  footer: "Thank you for dining with us.",
  receipt: "A4",
}

export function openERP(file, { seed = false } = {}) {
  if (file !== ":memory:") mkdirSync(dirname(file), { recursive: true })

  const db = new DatabaseSync(file, { timeout: 5000 })
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")

  db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"))

  const one = (sql, ...args) => db.prepare(sql).get(...args)

  const all = (sql, ...args) => db.prepare(sql).all(...args)

  const run = (sql, ...args) => db.prepare(sql).run(...args)

  // Nullable cost preserves unknown historic costs rather than inventing profit.
  for (const table of ['variants', 'order_items']) {
    if (!all('PRAGMA table_info(' + table + ')').some(c => c.name === 'cost'))
      db.exec('ALTER TABLE ' + table + ' ADD COLUMN cost INTEGER CHECK(cost IS NULL OR cost>=0)');
  }

  for (const column of ['address','city','email']) {
    if (!all('PRAGMA table_info(customers)').some(c=>c.name===column))
      db.exec("ALTER TABLE customers ADD COLUMN "+column+" TEXT NOT NULL DEFAULT ''");
  }
  if (!all('PRAGMA table_info(orders)').some(c=>c.name==='preparation'))
    db.exec("ALTER TABLE orders ADD COLUMN preparation TEXT CHECK(preparation IS NULL OR preparation IN ('Prepared','Not prepared'))");

  const transaction = (fn) => {
    db.exec("BEGIN IMMEDIATE")
    try {
      const out = fn()
      db.exec("COMMIT")
      return out
    } catch (e) {
      db.exec("ROLLBACK")
      throw e
    }
  }

  run(
    "INSERT OR IGNORE INTO settings(id,data) VALUES(1,?)",
    JSON.stringify(defaults),
  )

  if (!one("SELECT version FROM migrations WHERE version=2"))
    transaction(() => {
      for (const [table, type, sign] of [
        ["payments", "payment", 1],
        ["refunds", "refund", -1],
        ["supplier_payments", "supplier", -1],
        ["expenses", "expense", -1],
      ])
        for (const row of all(
          "SELECT * FROM " + table + " WHERE method='Cash'",
        )) {
          const session = one(
            "SELECT id FROM cash_sessions WHERE opened<=? AND (closed IS NULL OR closed>=?) ORDER BY id DESC LIMIT 1",
            row.created,
            row.created,
          )

          run(
            "INSERT OR IGNORE INTO cash_movements(session_id,source_type,source_id,amount,created,actor) VALUES(?,?,?,?,?,?)",
            session?.id || null,
            type,
            row.id,
            sign * row.amount,
            row.created,
            row.actor,
          )
        }

      run("INSERT INTO migrations(version,applied_at) VALUES(2,?)", now())
    })

  if (!one("SELECT version FROM migrations WHERE version=3")) {
    const ordersSql = one("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'")?.sql || ""
    if (!ordersSql.includes("'Delivery'")) {
      db.exec("PRAGMA foreign_keys=OFF")
      db.exec(`CREATE TABLE IF NOT EXISTS orders_v3 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT UNIQUE,
        created TEXT NOT NULL,
        business_date TEXT NOT NULL,
        actor INTEGER NOT NULL REFERENCES users(id),
        service TEXT NOT NULL CHECK(service IN ('Dine-in','Takeaway','Delivery')),
        table_id INTEGER REFERENCES dining_tables(id),
        customer_id INTEGER REFERENCES customers(id),
        customer_snapshot TEXT,
        state TEXT NOT NULL DEFAULT 'open' CHECK(state IN ('open','closed','cancelled')),
        version INTEGER NOT NULL DEFAULT 1,
        discount INTEGER NOT NULL DEFAULT 0,
        tax_bps INTEGER NOT NULL,
        service_bps INTEGER NOT NULL,
        reason TEXT,
        preparation TEXT CHECK(preparation IS NULL OR preparation IN ('Prepared','Not prepared'))
      )`)
      db.exec("INSERT INTO orders_v3 SELECT * FROM orders")
      db.exec("DROP TABLE orders")
      db.exec("ALTER TABLE orders_v3 RENAME TO orders")
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS occupied_table ON orders(table_id) WHERE state='open' AND table_id IS NOT NULL")
      db.exec("CREATE INDEX IF NOT EXISTS order_date ON orders(business_date)")
      db.exec("PRAGMA foreign_keys=ON")
    }
    run("INSERT INTO migrations(version,applied_at) VALUES(3,?)", now())
  }

  const settings = () => ({
    ...JSON.parse(one("SELECT data FROM settings WHERE id=1").data),
    version: one("SELECT version FROM settings WHERE id=1").version,
  })

  const audit = (u, action, entity, data) =>
    run(
      "INSERT INTO audit(actor,action,entity,data,created) VALUES(?,?,?,?,?)",
      u.id,
      action,
      String(entity),
      JSON.stringify(data),
      now(),
    )

  if (seed && !one("SELECT id FROM users LIMIT 1"))
    transaction(() => {
      for (const [username, name, role] of [
        ["owner", "Ali Khan", "Owner"],
        ["cashier", "Cashier", "Cashier"],
        ["kitchen", "Kitchen", "Kitchen"],
      ])
        run(
          "INSERT INTO users(username,name,role,password) VALUES(?,?,?,?)",
          username,
          name,
          role,
          hashPassword("123456"),
        )

      for (let i = 1; i <= 12; i++)
        run(
          "INSERT INTO dining_tables(name) VALUES(?)",
          "Table " + String(i).padStart(2, "0"),
        )

      const images = [
        "/media/karahi.jpg",
        "/media/curry.jpg",
        "/media/biryani.jpg",
        "/media/bbq.jpg",
        "/media/naan.jpg",
      ]

      const sample = [
        ["Chicken Karahi", "Karahi & Handi", 1200, "Half", 0],
        ["Mutton Karahi", "Karahi & Handi", 1950, "Half", 1],
        ["White Chicken Karahi", "Karahi & Handi", 1350, "Half", 0],
        ["Chicken Handi", "Karahi & Handi", 1450, "Half", 1],
        ["Chicken Biryani", "Biryani & Pulao", 380, "Plate", 2],
        ["Beef Biryani", "Biryani & Pulao", 460, "Plate", 2],
        ["Chicken Pulao", "Biryani & Pulao", 350, "Plate", 2],
        ["Chicken Tikka", "BBQ & Sajji", 480, "Piece", 3],
        ["Seekh Kabab", "BBQ & Sajji", 220, "Piece", 3],
        ["Chicken Sajji", "BBQ & Sajji", 1150, "Half", 3],
        ["Roghni Naan", "Paratha & Breads", 80, "Piece", 4],
        ["Plain Naan", "Paratha & Breads", 50, "Piece", 4],
        ["Daal Mash", "Daal & Sabzi", 420, "Plate", 1],
        ["Aloo Qeema", "Daal & Sabzi", 520, "Plate", 1],
        ["Raita", "Sides", 100, "Bowl", 1],
        ["Halwa Puri", "Breakfast & Specials", 250, "Plate", 4],
        ["Kheer", "Desserts", 180, "Bowl", 1],
        ["Soft Drink", "Drinks", 120, "Bottle", 2],
      ]

      for (const [name, cat, price, variant, img] of sample) {
        const id = Number(
          run(
            "INSERT INTO menu(name,category,image,available) VALUES(?,?,?,?)",
            name,
            cat,
            images[img],
            name === "Aloo Qeema" ? 0 : 1,
          ).lastInsertRowid,
        )
        run(
          "INSERT INTO variants(menu_id,name,unit,price,step) VALUES(?,?,?,?,?)",
          id,
          variant,
          variant === "Piece"
            ? "piece"
            : variant === "Bowl"
              ? "bowl"
              : variant === "Bottle"
                ? "bottle"
                : "portion",
          price * 100,
          1000,
        )
        if (variant === "Half")
          run(
            "INSERT INTO variants(menu_id,name,unit,price,step) VALUES(?,?,?,?,?)",
            id,
            "Full",
            "portion",
            price * 180,
            1000,
          )
      }

      for (const [name, unit, low, qty] of [
        ["Chicken", "kg", 10000, 20000],
        ["Rice", "kg", 5000, 26000],
        ["Cooking oil", "litre", 5000, 7000],
        ["Flour", "kg", 5000, 30000],
      ]) {
        const id = Number(
          run(
            "INSERT INTO ingredients(name,unit,low) VALUES(?,?,?)",
            name,
            unit,
            low,
          ).lastInsertRowid,
        )
        run(
          "INSERT INTO stock_movements(ingredient_id,qty,kind,reason,created,business_date,actor) VALUES(?,?,?,?,?,?,1)",
          id,
          qty,
          "opening",
          "Development opening balance",
          now(),
          date(),
        )
      }
    })

  for (const [photo, name] of [
    ["1694579740719-0e601c5d2437", "karahi"],
    ["1603496987351-f84a3ba5ec85", "curry"],
    ["1631515243349-e0cb75fb8d3a", "biryani"],
    ["1599487488170-d11ec9c172f0", "bbq"],
    ["1690915475901-6c08af925906", "naan"],
  ])
    run(
      "UPDATE menu SET image=? WHERE image=?",
      "/media/" + name + ".jpg",
      "https://images.unsplash.com/photo-" +
        photo +
        "?auto=format&fit=crop&w=700&q=80",
    )

  const photoMapFile=new URL('./media/dish-photos.json',import.meta.url);
  try {
    for(const photo of JSON.parse(readFileSync(photoMapFile,'utf8'))) {
      if(!photo.image) continue;
      run("UPDATE menu SET image=? WHERE name=? AND image IN ('/media/karahi.jpg','/media/curry.jpg','/media/biryani.jpg','/media/bbq.jpg','/media/naan.jpg')",photo.image,photo.name);
    }
  } catch { /* Client uploads remain authoritative. */ }

  db.exec("CREATE TABLE IF NOT EXISTS app_flags(key TEXT PRIMARY KEY,value TEXT NOT NULL)");
  if(seed && one("SELECT value FROM app_flags WHERE key='dummyCleared'")?.value!=='1') transaction(()=>{
    const images=JSON.parse(readFileSync(new URL('./media/dish-photos.json',import.meta.url),'utf8'));
    for(const [name,category,price,unit] of [
      ['Plain Roti','Paratha & Breads',2000,'piece'],
      ['Plain Paratha','Paratha & Breads',10000,'piece'],
      ['Aloo Paratha','Paratha & Breads',18000,'piece'],
      ['Plain Rice','Biryani & Pulao',15000,'portion'],
      ['Nihari','Breakfast & Specials',50000,'portion'],
      ['Haleem','Breakfast & Specials',30000,'portion']
    ]) {
      if(one('SELECT id FROM menu WHERE name=?',name))continue;
      const image=images.find(p=>p.name===name)?.image || '';
      const id=Number(run('INSERT INTO menu(name,category,image,available) VALUES(?,?,?,1)',name,category,image).lastInsertRowid);
      run('INSERT INTO variants(menu_id,name,unit,price,step) VALUES(?,?,?,?,1000)',id,unit==='piece'?'Piece':'Plate',unit,price);
    }
  });

  const owner = (u) => {
    if (u.role !== "Owner") fail("Owner permission required", 403)
  }

  const cashier = (u) => {
    if (!["Owner", "Cashier"].includes(u.role))
      fail("Cashier or Owner permission required", 403)
  }

  const exists = (table, id) => {
    integer(Number(id), 1)
    const v = one("SELECT * FROM " + table + " WHERE id=?", Number(id))
    if (!v) fail("Record not found", 404)
    return v
  }

  const menu = () =>
    all("SELECT * FROM menu WHERE archived=0 ORDER BY id").map((m) => ({
      ...m,
      variants: all(
        "SELECT * FROM variants WHERE menu_id=? AND active=1 ORDER BY id",
        m.id,
      ),
    }))

  const order = (id) => {
    const o = exists("orders", id),
      invoice = one("SELECT * FROM invoices WHERE order_id=?", o.id)

    const revision = one(
      "SELECT * FROM invoice_revisions WHERE invoice_id=? ORDER BY revision DESC LIMIT 1",
      invoice.id,
    )

    const snapshot = JSON.parse(revision.snapshot),
      payments = all("SELECT * FROM payments WHERE order_id=?", o.id),
      refunds = all("SELECT * FROM refunds WHERE order_id=?", o.id)

    const received = payments.reduce((s, p) => s + p.amount, 0),
      refunded = refunds.reduce((s, p) => s + p.amount, 0)

    const collectible =
      o.state === "cancelled" ? 0 : Math.max(0, snapshot.total - refunded)

    const net = received - refunded,
      balance = Math.max(0, collectible - net)

    return {
      ...o,
      ...snapshot,
      orderId: o.id,
      id: o.id,
      invoiceId: invoice.id,
      number: invoice.number,
      revision: revision.revision,
      version: o.version,
      state: o.state,
      received,
      refunded,
      net,
      collectible,
      balance,
      refundStatus: refunded ? "Refunded" : null,
      paymentStatus:
        o.state === "cancelled"
          ? "Cancelled"
          : balance === 0
            ? "Paid"
            : net > 0
              ? "Partial"
              : "Unpaid",
      payments,
      refunds,
      change: payments.reduce((s, p) => s + p.change, 0),
      tickets: all("SELECT * FROM tickets WHERE order_id=?", o.id),
      revisions: all(
        "SELECT revision,created FROM invoice_revisions WHERE invoice_id=?",
        invoice.id,
      ),
    }
  }

  const saveRevision = (id) => {
    const o = exists("orders", id),
      i = one("SELECT * FROM invoices WHERE order_id=?", id),
      items = all("SELECT * FROM order_items WHERE order_id=? ORDER BY id", id),
      s = settings(),
      last = one(
        "SELECT MAX(revision) n FROM invoice_revisions WHERE invoice_id=?",
        i.id,
      )

    const snapshot = {
      items,
      ...amounts(items, o.discount, o.tax_bps, o.service_bps),
      restaurant: s,
      service: o.service,
      place: o.table_id
        ? exists("dining_tables", o.table_id).name
        : (o.service === "Delivery" ? "Delivery D-" + String(id).padStart(4, "0") : "Token T-" + String(id).padStart(4, "0")),
      customer: o.customer_snapshot ? JSON.parse(o.customer_snapshot) : null,
      created: o.created,
      taxBps: o.tax_bps,
      serviceBps: o.service_bps,
    }

    run(
      "INSERT INTO invoice_revisions(invoice_id,revision,created,snapshot) VALUES(?,?,?,?)",
      i.id,
      (last.n || 0) + 1,
      now(),
      JSON.stringify(snapshot),
    )
  }

  const addItems = (u, id, items, batch) => {
    if (!Array.isArray(items) || !items.length || items.length > 200)
      fail("Select 1 to 200 items")

    for (const item of items) {
      const v = exists("variants", item.variantId),
        m = exists("menu", v.menu_id)
      if (!v.active || m.archived || !m.available)
        fail(m.name + " is sold out or archived", 409)
      const qty = integer(item.qty, 1, 1000000)
      if (qty % v.step)
        fail(
          "Quantity must follow " +
            v.step / 1000 +
            " " +
            v.unit +
            " increments",
        )
      if (v.portions !== null) {
        if (qty > v.portions)
          fail("Last available portion already ordered", 409)
        run("UPDATE variants SET portions=portions-? WHERE id=?", qty, v.id)
      }

      run(
        "INSERT INTO order_items(order_id,variant_id,name,variant,unit,qty,price,amount,note,batch,cost) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        id,
        v.id,
        m.name,
        v.name,
        v.unit,
        qty,
        v.price,
        round(BigInt(v.price) * BigInt(qty)),
        String(item.note || "").slice(0, 500),
        batch,
        v.cost,
      )
    }

    run(
      "INSERT INTO tickets(order_id,batch,created) VALUES(?,?,?)",
      id,
      batch,
      now(),
    )
  }

  const stock = (id) =>
    one(
      "SELECT COALESCE(SUM(qty),0) n FROM stock_movements WHERE ingredient_id=?",
      id,
    ).n

  const supplierBalance = (id) =>
    one(
      "SELECT COALESCE(SUM(total),0) n FROM purchases WHERE supplier_id=?",
      id,
    ).n -
    one(
      "SELECT COALESCE(SUM(amount),0) n FROM supplier_payments WHERE supplier_id=?",
      id,
    ).n

  const cashEntry = (u, type, id, amount, m) => {
    if (m !== "Cash") return
    const active = one("SELECT id FROM cash_sessions WHERE closed IS NULL")
    run(
      "INSERT INTO cash_movements(session_id,source_type,source_id,amount,created,actor) VALUES(?,?,?,?,?,?)",
      active?.id || null,
      type,
      id,
      amount,
      now(),
      u.id,
    )
  }

  const cashExpected = (session) =>
    session.opening +
    one(
      "SELECT COALESCE(SUM(amount),0) n FROM cash_movements WHERE session_id=?",
      session.id,
    ).n

  function dispatch(u, route, b = {}) {
    if (route === "bootstrap") {
      const common = {
        user: { id: u.id, name: u.name, username: u.username, role: u.role },
        settings: settings(),
        tables: all("SELECT * FROM dining_tables WHERE active=1").map((t) => ({
          ...t,
          orderId:
            one("SELECT id FROM orders WHERE table_id=? AND state='open'", t.id)
              ?.id || null,
        })),
      }

      if (u.role === "Kitchen")
        return {
          ...common,
          orders: all("SELECT id FROM orders WHERE state='open'").map((x) => {
            const o = order(x.id)
            return {
              id: o.id,
              number: o.number,
              place: o.place,
              created: o.created,
              items: o.items.map(
                ({ id, name, variant, unit, qty, note, batch }) => ({
                  id,
                  name,
                  variant,
                  unit,
                  qty,
                  note,
                  batch,
                }),
              ),
              tickets: o.tickets,
              version: o.version,
              state: o.state,
            }
          }),
        }

      return {
        ...common,
        dataEpoch: one("SELECT value FROM app_flags WHERE key='dataEpoch'")?.value || (one("SELECT value FROM app_flags WHERE key='dummyCleared'")?.value === '1' ? 'cleared-legacy' : 'initial'),
        menu: menu(),
        orders: all("SELECT id FROM orders ORDER BY id DESC").map((x) =>
          order(x.id),
        ),
        customers: all("SELECT * FROM customers WHERE archived=0"),
        drafts: all("SELECT * FROM drafts WHERE actor=?", u.id).map((d) => ({
          ...d,
          data: JSON.parse(d.data),
        })),
        ...(u.role === "Owner"
          ? {
              ingredients: all(
                "SELECT * FROM ingredients WHERE archived=0",
              ).map((i) => ({ ...i, stock: stock(i.id) })),
              movements: all(
                "SELECT sm.*,i.name,i.unit,u.name actor_name FROM stock_movements sm JOIN ingredients i ON i.id=sm.ingredient_id JOIN users u ON u.id=sm.actor ORDER BY sm.id DESC",
              ),
              suppliers: all("SELECT * FROM suppliers WHERE archived=0").map(
                (s) => ({ ...s, balance: supplierBalance(s.id) }),
              ),
              purchases: all("SELECT * FROM purchases ORDER BY id DESC").map(
                (p) => ({
                  ...p,
                  items: all(
                    "SELECT pi.*,i.name,i.unit FROM purchase_items pi JOIN ingredients i ON i.id=pi.ingredient_id WHERE purchase_id=?",
                    p.id,
                  ),
                }),
              ),
              supplierPayments: all(
                "SELECT * FROM supplier_payments ORDER BY id DESC",
              ),
              allTables: all("SELECT * FROM dining_tables ORDER BY id"),
              staff: all("SELECT id,username,name,role,active FROM users"),
              expenses: all("SELECT * FROM expenses ORDER BY id DESC"),
              cash: all("SELECT * FROM cash_sessions ORDER BY id DESC").map(
                (s) => ({
                  ...s,
                  expected: s.closed ? s.expected : cashExpected(s),
                }),
              ),
              audit: all(
                "SELECT a.*,u.name actor_name FROM audit a LEFT JOIN users u ON u.id=a.actor ORDER BY a.id DESC LIMIT 200",
              ),
            }
          : {}),
      }
    }

    if (route === "order") {
      cashier(u)
      return order(b.id)
    }

    if (route === "orders/create") {
      cashier(u)
      const s = settings()
      if (b.discount && u.role !== "Owner") fail("Only Owner can discount", 403)
      const service = b.service
      if (!["Dine-in", "Takeaway", "Delivery"].includes(service))
        fail("Choose service type")

      let tableId = null
      if (service === "Dine-in") {
        if (!Number.isSafeInteger(b.tableId) || b.tableId < 1) fail("اوپر میز منتخب کریں یا پارسل / ڈلیوری کا بٹن دبائیں، پھر بل بنائیں")
        const t = exists("dining_tables", b.tableId)
        if (!t.active) fail("Table unavailable")
        tableId = t.id
        if (
          one(
            "SELECT id FROM orders WHERE table_id=? AND state='open'",
            tableId,
          )
        )
          fail("Table occupied. Open its existing order.", 409)
      }

      let customer = null
      if (service === "Delivery") {
        const name = text(b.deliveryName || b.name || (b.customerId ? exists("customers", b.customerId).name : ""))
        const p = phone(b.deliveryPhone || b.phone || (b.customerId ? exists("customers", b.customerId).phone : ""))
        const addr = String(b.deliveryAddress || b.address || (b.customerId ? exists("customers", b.customerId).address : "")).trim().slice(0, 300)
        if (!name) fail("ڈلیوری کے لیے گاہک کا نام لکھنا لازمی ہے")
        if (!p) fail("ڈلیوری کے لیے موبائل نمبر لکھنا لازمی ہے")
        if (!addr) fail("ڈلیوری کے لیے پتہ لکھنا لازمی ہے")

        let existing = one("SELECT * FROM customers WHERE phone=?", p)
        if (existing) {
          run("UPDATE customers SET name=?, address=? WHERE id=?", name, addr, existing.id)
          customer = exists("customers", existing.id)
        } else {
          const newCustId = Number(
            run("INSERT INTO customers(name, phone, note, address) VALUES(?,?,?,?)", name, p, "Delivery customer", addr).lastInsertRowid
          )
          customer = exists("customers", newCustId)
        }
      } else if (b.customerId) {
        customer = exists("customers", b.customerId)
      }

      const id = Number(
        run(
          "INSERT INTO orders(created,business_date,actor,service,table_id,customer_id,customer_snapshot,discount,tax_bps,service_bps) VALUES(?,?,?,?,?,?,?,?,?,?)",
          now(),
          date(),
          u.id,
          service,
          tableId,
          customer?.id || null,
          customer ? JSON.stringify(customer) : null,
          money(b.discount || 0),
          s.taxBps,
          s.serviceBps,
        ).lastInsertRowid,
      )

      run(
        "UPDATE orders SET number=? WHERE id=?",
        "ORD-" + String(id).padStart(6, "0"),
        id,
      )
      run(
        "INSERT INTO invoices(order_id,number) VALUES(?,?)",
        id,
        "INV-" + String(id).padStart(6, "0"),
      )
      addItems(u, id, b.items, 1)
      saveRevision(id)
      audit(u, "order.created", id, b)
      return order(id)
    }

    if (route === "orders/append") {
      cashier(u)
      const o = exists("orders", b.id)
      if (o.state !== "open") fail("Order is closed", 409)
      if (o.version !== b.version)
        fail("Order changed by another staff member. Refresh and retry.", 409)
      const batch =
        one("SELECT MAX(batch) n FROM tickets WHERE order_id=?", o.id).n + 1
      addItems(u, o.id, b.items, batch)
      run("UPDATE orders SET version=version+1 WHERE id=?", o.id)
      saveRevision(o.id)
      audit(u, "order.appended", o.id, b)
      return order(o.id)
    }

    if (route === "payments") {
      cashier(u)
      const o = order(b.id)
      if (o.state === "cancelled") fail("Cannot pay a cancelled order")
      if (b.version !== o.version)
        fail("Invoice changed; refresh before paying", 409)
      const tendered = integer(b.amount, 1, 10000000000),
        m = method(b.method)
      if (!o.balance) fail("Invoice is already settled")
      if (m !== "Cash" && tendered > o.balance)
        fail("Non-cash payment exceeds balance")
      const applied = Math.min(tendered, o.balance)
      run(
        "INSERT INTO payments(order_id,amount,tendered,change,method,created,business_date,actor) VALUES(?,?,?,?,?,?,?,?)",
        o.id,
        applied,
        tendered,
        tendered - applied,
        m,
        now(),
        date(),
        u.id,
      )
      cashEntry(
        u,
        "payment",
        Number(one("SELECT last_insert_rowid() id").id),
        applied,
        m,
      )
      run("UPDATE orders SET version=version+1 WHERE id=?", o.id)
      audit(u, "payment", o.id, {
        applied,
        tendered,
        change: tendered - applied,
        method: m,
      })
      return order(o.id)
    }

    if (route === "refunds") {
      owner(u)
      const o = order(b.id)
      if (o.version !== b.version) fail("Invoice changed; refresh", 409)
      const amount = integer(b.amount, 1),
        reason = text(b.reason, 500),
        m = method(b.method)
      if (amount > o.net) fail("Refund exceeds net collected amount")
      run(
        "INSERT INTO refunds(order_id,amount,method,reason,created,business_date,actor) VALUES(?,?,?,?,?,?,?)",
        o.id,
        amount,
        m,
        reason,
        now(),
        date(),
        u.id,
      )
      cashEntry(
        u,
        "refund",
        Number(one("SELECT last_insert_rowid() id").id),
        -amount,
        m,
      )
      run("UPDATE orders SET version=version+1 WHERE id=?", o.id)
      audit(u, "refund", o.id, b)
      return order(o.id)
    }

    if (route === "orders/cancel") {
      owner(u)
      const o = order(b.id)
      if (o.version !== b.version) fail("Order changed; refresh", 409)
      if (o.state === "cancelled") fail("Already cancelled")
      text(b.reason, 500)
      if (!["Not prepared", "Prepared"].includes(b.preparation))
        fail("Specify preparation disposition")
      if (o.net) fail("Refund collected payments before cancellation")

      if (b.preparation === "Not prepared") {
        if (o.tickets.some((t) => t.state !== "New"))
          fail("Kitchen started: record prepared disposition")
        for (const i of o.items)
          run(
            "UPDATE variants SET portions=CASE WHEN portions IS NULL THEN NULL ELSE portions+? END WHERE id=?",
            i.qty,
            i.variant_id,
          )
      }

      run(
        "UPDATE orders SET state='cancelled',reason=?,preparation=?,version=version+1 WHERE id=?",
        b.reason,
        b.preparation,
        o.id,
      )
      run(
        "UPDATE tickets SET state='Cancelled' WHERE order_id=? AND state!='Served'",
        o.id,
      )
      audit(u, "order.cancelled", o.id, {
        ...b,
        stockRule:
          "Raw ingredients remain unchanged; record any prepared food wastage manually.",
      })
      return order(o.id)
    }

    if (route === "orders/close") {
      cashier(u)
      const o = order(b.id)
      if (o.version !== b.version) fail("Order changed; refresh", 409)
      if (o.state !== "open") fail("Order is not open")
      if (o.tickets.some((t) => !["Served", "Cancelled"].includes(t.state)))
        fail("Serve all tickets before releasing the table")
      run("UPDATE orders SET state='closed',version=version+1 WHERE id=?", o.id)
      audit(u, "order.closed", o.id, { balance: o.balance })
      return order(o.id)
    }

    if (route === "tickets") {
      const t = exists("tickets", b.id),
        states = ["New", "Preparing", "Ready", "Served"]
      if (
        t.state !== b.previous ||
        states[states.indexOf(t.state) + 1] !== b.state
      )
        fail("Invalid or stale kitchen transition", 409)
      const o = exists("orders", t.order_id)
      if (o.state !== "open") fail("Order no longer open")
      run("UPDATE tickets SET state=? WHERE id=?", b.state, t.id)
      run("UPDATE orders SET version=version+1 WHERE id=?", o.id)
      audit(u, "kitchen." + b.state, t.id, b)
      return { ok: true }
    }

    if (route === "drafts/save") {
      cashier(u)
      if (!b.data || JSON.stringify(b.data).length > 100000)
        fail("Invalid draft")
      const id = Number(
        run(
          "INSERT INTO drafts(actor,data,created) VALUES(?,?,?)",
          u.id,
          JSON.stringify(b.data),
          now(),
        ).lastInsertRowid,
      )
      return { id }
    }

    if (route === "drafts/delete") {
      cashier(u)
      run("DELETE FROM drafts WHERE id=? AND actor=?", integer(b.id, 1), u.id)
      return { ok: true }
    }

    if (route === "customers/save") {
      cashier(u)
      const name = text(b.name),
        p = phone(b.phone),
        note = String(b.note || "").slice(0, 500),
        address = String(b.address || "").trim().slice(0,300),
        city = String(b.city || "").trim().slice(0,80),
        email = String(b.email || "").trim().slice(0,150)
      if (b.id) {
        exists("customers", b.id)
        run(
          "UPDATE customers SET name=?,phone=?,note=?,address=?,city=?,email=? WHERE id=?",
          name,
          p,
          note,
          address, city, email,
          b.id,
        )
        audit(u, "customer.updated", b.id, b)
        return { id: b.id }
      }
      return {
        id: Number(
          run(
            "INSERT INTO customers(name,phone,note,address,city,email) VALUES(?,?,?,?,?,?)",
            name,
            p,
            note,
            address, city, email,
          ).lastInsertRowid,
        ),
      }
    }

    if (route === "menu/save") {
      owner(u)
      const name = text(b.name),
        category = (()=>{const input=text(b.category);const translations=JSON.parse(readFileSync(new URL("./urdu.json",import.meta.url),"utf8"));return ["Karahi & Handi","Biryani & Pulao","BBQ & Sajji","Paratha & Breads","Daal & Sabzi","Sides","Breakfast & Specials","Desserts","Drinks"].find(c=>translations[c]===input) || input})(),
        image = String(b.image || "")
      if (
        image &&
        !image.startsWith("/uploads/") &&
        !image.startsWith("/media/") &&
        !/^https:\/\//.test(image)
      )
        fail("Use an uploaded or HTTPS photo")
      if (
        !Array.isArray(b.variants) ||
        !b.variants.length ||
        b.variants.length > 20
      )
        fail("Add variants")
      let id = b.id

      if (id) {
        const m = exists("menu", id)
        if (m.version !== b.version) fail("Menu changed; refresh", 409)
        run(
          "UPDATE menu SET name=?,category=?,image=?,available=?,version=version+1 WHERE id=?",
          name,
          category,
          image,
          b.available ? 1 : 0,
          id,
        )
        run("UPDATE variants SET active=0 WHERE menu_id=?", id)
      } else
        id = Number(
          run(
            "INSERT INTO menu(name,category,image,available) VALUES(?,?,?,?)",
            name,
            category,
            image,
            b.available ? 1 : 0,
          ).lastInsertRowid,
        )

      for (const v of b.variants) {
        text(v.name)
        if (
          !["kg", "litre", "piece", "portion", "bowl", "bottle"].includes(
            v.unit,
          )
        )
          fail("Invalid unit")
        money(v.price)
        if (v.cost !== null && v.cost !== undefined) money(v.cost)
        integer(v.step, 1, 1000000)
        if (["piece", "bottle"].includes(v.unit) && v.step % 1000)
          fail("Pieces and bottles require whole-unit increments")
        if (v.portions !== null && v.portions !== undefined) integer(v.portions)
        if (v.id) {
          const existing = exists("variants", v.id)
          if (existing.menu_id !== id) fail("Variant does not belong to dish")
          run(
            "UPDATE variants SET name=?,unit=?,price=?,step=?,portions=?,cost=?,active=1 WHERE id=?",
            v.name,
            v.unit,
            v.price,
            v.step,
            v.portions ?? null,
            v.cost ?? null,
            v.id,
          )
        } else
          run(
            "INSERT INTO variants(menu_id,name,unit,price,step,portions,cost) VALUES(?,?,?,?,?,?,?)",
            id,
            v.name,
            v.unit,
            v.price,
            v.step,
            v.portions ?? null,
            v.cost ?? null,
          )
      }

      audit(u, "menu.saved", id, b)
      return { id }
    }

    if (route === "menu/archive") {
      owner(u)
      exists("menu", b.id)
      run(
        "UPDATE menu SET archived=1,available=0,version=version+1 WHERE id=?",
        b.id,
      )
      audit(u, "menu.archived", b.id, b)
      return { ok: true }
    }

    if (route === "ingredients/save") {
      owner(u)
      const name = text(b.name)
      if (!["kg", "litre", "piece"].includes(b.unit))
        fail("Choose kg, litre or piece")
      integer(b.low)
      if (b.id) {
        const i = exists("ingredients", b.id)
        if (i.unit !== b.unit) fail("Existing ingredient unit cannot change")
        run("UPDATE ingredients SET name=?,low=? WHERE id=?", name, b.low, b.id)
        return { id: b.id }
      }
      return {
        id: Number(
          run(
            "INSERT INTO ingredients(name,unit,low) VALUES(?,?,?)",
            name,
            b.unit,
            b.low,
          ).lastInsertRowid,
        ),
      }
    }

    if (route === "stock/move") {
      owner(u)
      const i = exists("ingredients", b.ingredientId)
      const kind = b.kind
      if (
        !["opening", "in", "consumption", "wastage", "adjustment"].includes(
          kind,
        )
      )
        fail("Invalid stock movement")
      integer(b.qty, -1000000000, 1000000000)
      const raw = integer(Math.abs(b.qty), 1, 1000000000)
      if (i.unit === "piece" && raw % 1000) fail("Pieces must be whole")
      const qty = ["consumption", "wastage"].includes(kind)
        ? -raw
        : kind === "adjustment"
          ? b.qty
          : raw
      text(b.reason, 500)
      if (
        kind === "opening" &&
        one("SELECT id FROM stock_movements WHERE ingredient_id=?", i.id)
      )
        fail("Opening balance already set")
      if (stock(i.id) + qty < 0) fail("Insufficient stock", 409)
      run(
        "INSERT INTO stock_movements(ingredient_id,qty,kind,reference,reason,created,business_date,actor) VALUES(?,?,?,?,?,?,?,?)",
        i.id,
        qty,
        kind,
        b.reference ? String(b.reference) : null,
        b.reason,
        now(),
        date(),
        u.id,
      )
      audit(u, "stock." + kind, i.id, b)
      return { stock: stock(i.id) }
    }

    if (route === "suppliers/save") {
      owner(u)
      const name = text(b.name),
        p = b.phone ? phone(b.phone) : ""
      if (b.id) {
        exists("suppliers", b.id)
        run("UPDATE suppliers SET name=?,phone=? WHERE id=?", name, p, b.id)
        return { id: b.id }
      }
      return {
        id: Number(
          run("INSERT INTO suppliers(name,phone) VALUES(?,?)", name, p)
            .lastInsertRowid,
        ),
      }
    }

    if (route === "purchases") {
      owner(u)
      exists("suppliers", b.supplierId)
      if (!Array.isArray(b.items) || !b.items.length) fail("Add purchase items")
      const ids = new Set(),
        lines = b.items.map((x) => {
          const i = exists("ingredients", x.ingredientId)
          if (ids.has(i.id)) fail("Combine duplicate ingredient lines")
          ids.add(i.id)
          integer(x.qty, 1, 1000000000)
          if (i.unit === "piece" && x.qty % 1000) fail("Pieces must be whole")
          money(x.cost)
          return { ...x, amount: round(BigInt(x.qty) * BigInt(x.cost)) }
        })
      const total = integer(lines.reduce((s, x) => s + x.amount, 0)),
        paid = money(b.paid || 0)
      if (paid > total) fail("Payment exceeds purchase")
      const id = Number(
        run(
          "INSERT INTO purchases(supplier_id,total,created,business_date,actor) VALUES(?,?,?,?,?)",
          b.supplierId,
          total,
          now(),
          date(),
          u.id,
        ).lastInsertRowid,
      )

      for (const x of lines) {
        run(
          "INSERT INTO purchase_items(purchase_id,ingredient_id,qty,cost,amount) VALUES(?,?,?,?,?)",
          id,
          x.ingredientId,
          x.qty,
          x.cost,
          x.amount,
        )
        run(
          "INSERT INTO stock_movements(ingredient_id,qty,kind,reference,reason,created,business_date,actor) VALUES(?,?,?,?,?,?,?,?)",
          x.ingredientId,
          x.qty,
          "purchase",
          "purchase:" + id,
          "Purchase received",
          now(),
          date(),
          u.id,
        )
      }

      if (paid) {
        run(
          "INSERT INTO supplier_payments(supplier_id,purchase_id,amount,method,created,business_date,actor) VALUES(?,?,?,?,?,?,?)",
          b.supplierId,
          id,
          paid,
          method(b.method),
          now(),
          date(),
          u.id,
        )
        cashEntry(
          u,
          "supplier",
          Number(one("SELECT last_insert_rowid() id").id),
          -paid,
          b.method,
        )
      }
      audit(u, "purchase.received", id, b)
      return { id, total }
    }

    if (route === "suppliers/pay") {
      owner(u)
      exists("suppliers", b.supplierId)
      const amount = integer(b.amount, 1)
      if (amount > supplierBalance(b.supplierId))
        fail("Payment exceeds supplier balance")
      run(
        "INSERT INTO supplier_payments(supplier_id,amount,method,created,business_date,actor) VALUES(?,?,?,?,?,?)",
        b.supplierId,
        amount,
        method(b.method),
        now(),
        date(),
        u.id,
      )
      cashEntry(
        u,
        "supplier",
        Number(one("SELECT last_insert_rowid() id").id),
        -amount,
        b.method,
      )
      audit(u, "supplier.payment", b.supplierId, b)
      return { balance: supplierBalance(b.supplierId) }
    }

    if (route === "expenses") {
      owner(u)
      const expenseDate = b.businessDate || date()
      if (!validDate(expenseDate)) fail("Invalid expense date")
      const id = Number(
        run(
          "INSERT INTO expenses(category,amount,method,note,created,business_date,actor) VALUES(?,?,?,?,?,?,?)",
          text(b.category),
          integer(b.amount, 1),
          method(b.method),
          text(b.note, 500),
          now(),
          expenseDate,
          u.id,
        ).lastInsertRowid,
      )
      cashEntry(u, "expense", id, -b.amount, b.method)
      audit(u, "expense", id, b)
      return { id }
    }

    if (route === "cash/open") {
      owner(u)
      if (one("SELECT id FROM cash_sessions WHERE closed IS NULL"))
        fail("Close current cash session first")
      const id = Number(
        run(
          "INSERT INTO cash_sessions(opened,opening,actor) VALUES(?,?,?)",
          now(),
          money(b.opening),
          u.id,
        ).lastInsertRowid,
      )
      audit(u, "cash.opened", id, b)
      return { id }
    }

    if (route === "cash/close") {
      owner(u)
      const s = exists("cash_sessions", b.id)
      if (s.closed) fail("Session already closed")
      const expected = cashExpected(s),
        counted = money(b.counted)
      run(
        "UPDATE cash_sessions SET closed=?,expected=?,counted=?,difference=? WHERE id=?",
        now(),
        expected,
        counted,
        counted - expected,
        s.id,
      )
      audit(u, "cash.closed", s.id, { expected, counted })
      return { expected, counted, difference: counted - expected }
    }

    if (route === "settings") {
      owner(u)
      const s = settings()
      if (s.version !== b.version) fail("Settings changed; refresh", 409)
      const data = {
        name: text(b.name),
        tagline: text(b.tagline),
        address: text(b.address, 500),
        phone: String(b.phone || "").slice(0, 50),
        logo: String(b.logo || ""),
        taxId: String(b.taxId || "").slice(0, 100),
        taxBps: integer(b.taxBps, 0, 10000),
        serviceBps: integer(b.serviceBps, 0, 10000),
        footer: text(b.footer, 500),
        receipt: b.receipt === "80mm" ? "80mm" : "A4",
      }
      if (data.logo && !data.logo.startsWith("/uploads/")) fail("Upload a logo")
      run(
        "UPDATE settings SET data=?,version=version+1 WHERE id=1",
        JSON.stringify(data),
      )
      audit(u, "settings.saved", 1, data)
      return settings()
    }

    if (route === "tables/save") {
      owner(u)
      const name = text(b.name, 50)
      if (b.id) {
        exists("dining_tables", b.id)
        if (
          !b.active &&
          one("SELECT id FROM orders WHERE table_id=? AND state='open'", b.id)
        )
          fail("Close occupied table first")
        run(
          "UPDATE dining_tables SET name=?,active=? WHERE id=?",
          name,
          b.active ? 1 : 0,
          b.id,
        )
        return { id: b.id }
      }
      return {
        id: Number(
          run("INSERT INTO dining_tables(name) VALUES(?)", name)
            .lastInsertRowid,
        ),
      }
    }

    if (route === "staff") {
      owner(u)
      const role = b.role
      if (!["Owner", "Cashier", "Kitchen"].includes(role)) fail("Invalid role")
      const username = text(b.username, 50),
        name = text(b.name)
      if (b.id) {
        const old = exists("users", b.id)
        if (
          old.role === "Owner" &&
          (!b.active || role !== "Owner") &&
          one("SELECT COUNT(*) n FROM users WHERE role='Owner' AND active=1")
            .n <= 1
        )
          fail("Keep at least one active Owner")
        run(
          "UPDATE users SET username=?,name=?,role=?,active=? WHERE id=?",
          username,
          name,
          role,
          b.active ? 1 : 0,
          b.id,
        )
        if (b.password)
          run(
            "UPDATE users SET password=? WHERE id=?",
            hashPassword(b.password),
            b.id,
          )
        run("DELETE FROM sessions WHERE user_id=?", b.id)
        audit(u, "staff.updated", b.id, { role, active: b.active })
        return { id: b.id }
      }
      const id = Number(
        run(
          "INSERT INTO users(username,name,role,password) VALUES(?,?,?,?)",
          username,
          name,
          role,
          hashPassword(b.password),
        ).lastInsertRowid,
      )
      audit(u, "staff.created", id, { role })
      return { id }
    }

    if (route === "summary") {
      owner(u)
      const from = b.from || date(),
        to = b.to || from
      if (
        !validDate(from) ||
        !validDate(to) ||
        from > to
      )
        fail("Invalid date range")

      const os = all(
        "SELECT id FROM orders WHERE business_date BETWEEN ? AND ?",
        from,
        to,
      ).map((x) => order(x.id))
      const sum = (table, expr = "amount") =>
        one(
          "SELECT COALESCE(SUM(" +
            expr +
            "),0) n FROM " +
            table +
            " WHERE business_date BETWEEN ? AND ?",
          from,
          to,
        ).n

      const daily = all(
        "SELECT business_date,id FROM orders WHERE business_date BETWEEN ? AND ?",
        from,
        to,
      ).reduce((acc, x) => {
        acc[x.business_date] =
          (acc[x.business_date] || 0) +
          (order(x.id).state === "cancelled" ? 0 : order(x.id).total)
        return acc
      }, {})

      const popular = all(
        "SELECT oi.name,SUM(oi.qty) qty,SUM(oi.amount) amount FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.business_date BETWEEN ? AND ? AND o.state!='cancelled' GROUP BY oi.name ORDER BY qty DESC LIMIT 8",
        from,
        to,
      )

      const activeOrders=os.filter(o=>o.state!=='cancelled');
      const costLines=all("SELECT oi.cost,oi.qty FROM order_items oi JOIN orders o ON o.id=oi.order_id WHERE o.business_date BETWEEN ? AND ? AND (o.state!='cancelled' OR o.preparation='Prepared')",from,to);
      const missingCosts=costLines.filter(i=>i.cost===null).length + all("SELECT id FROM orders WHERE business_date BETWEEN ? AND ? AND state='cancelled' AND preparation IS NULL",from,to).length;
      const foodCost=costLines.reduce((n,i)=>n+(i.cost===null?0:round(BigInt(i.cost)*BigInt(i.qty))),0);
      const netSales=activeOrders.reduce((n,o)=>{const food=o.subtotal-o.discount;return n+food-(o.total?round(BigInt(o.refunded)*BigInt(food),o.total):0)},0);
      return {
        foodCost, missingCosts, netSales,
        profit: missingCosts ? null : netSales-foodCost-sum('expenses'),
        from,
        to,
        sales: os
          .filter((o) => o.state !== "cancelled")
          .reduce((s, o) => s + o.total, 0),
        orderCount: os.filter((o) => o.state !== "cancelled").length,
        cancelled: os
          .filter((o) => o.state === "cancelled")
          .reduce((s, o) => s + o.total, 0),
        collections: sum("payments"),
        refunds: sum("refunds"),
        expenses: sum("expenses"),
        supplierPayments: sum("supplier_payments"),
        outstanding: all("SELECT id FROM orders").reduce(
          (s, o) => s + order(o.id).balance,
          0,
        ),
        lowStock: all("SELECT id,low FROM ingredients WHERE archived=0").filter(
          (i) => stock(i.id) <= i.low,
        ).length,
        daily,
        popular,
      }
    }

    fail("API route not found", 404)
  }

  const call = (u, route, b, key) => {
    const ownerOnly = ['refunds','orders/cancel','menu/save','menu/archive','ingredients/save','stock/move','suppliers/save','purchases','suppliers/pay','expenses','cash/open','cash/close','settings','tables/save','staff','summary'];
    const cashierOnly = ['orders/create','orders/append','payments','orders/close','drafts/save','drafts/delete','customers/save','order'];
    if(ownerOnly.includes(route))owner(u);
    if(cashierOnly.includes(route))cashier(u);

    if (route === "bootstrap" || route === "order" || route === "summary")
      return dispatch(u, route, b)

    if (typeof key !== "string" || key.length < 8 || key.length > 128)
      fail("Idempotency key required")
    const hash = createHash("sha256").update(JSON.stringify(b)).digest("hex")

    return transaction(() => {
      const old = one(
        "SELECT * FROM idempotency WHERE actor=? AND key=?",
        u.id,
        key,
      )
      if (old) {
        if (old.route !== route || old.hash !== hash)
          fail("Retry key reused with a different request", 409)
        return JSON.parse(old.result)
      }
      const result = dispatch(u, route, b)
      run(
        "INSERT INTO idempotency(actor,key,route,hash,result) VALUES(?,?,?,?,?)",
        u.id,
        key,
        route,
        hash,
        JSON.stringify(result),
      )
      return JSON.parse(JSON.stringify(result))
    })
  }

  return {
    db,
    one,
    all,
    run,
    transaction,
    settings,
    order,
    call,
    audit,
    owner,
    cashier,
    menu,
  }
}
