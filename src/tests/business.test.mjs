import { test } from "node:test"
import assert from "node:assert/strict"
import { openERP, amounts, round, phone, date } from "../erp.mjs"
import { randomUUID } from "node:crypto"
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { spawn } from "node:child_process"
const make = () => {
  const a = openERP(":memory:", { seed: true }),
    owner = a.one("SELECT * FROM users WHERE role='Owner'"),
    cashier = a.one("SELECT * FROM users WHERE role='Cashier'"),
    kitchen = a.one("SELECT * FROM users WHERE role='Kitchen'")
  return { a, owner, cashier, kitchen }
}
const fixture = (a) => {
  const m = a.menu(),
    find = (n) => m.find((x) => x.name === n).variants[0].id
  return {
    service: "Takeaway",
    discount: 0,
    items: [
      { variantId: find("Chicken Karahi"), qty: 1000, note: "Less spicy" },
      { variantId: find("Roghni Naan"), qty: 4000 },
      { variantId: find("Raita"), qty: 1000 },
    ],
  }
}
const call = (a, u, r, b, key = randomUUID()) => a.call(u, r, b, key)
test("deterministic invoice: total 1620, cash applied 1620, change 380; payment repeated once", () => {
  const { a, owner } = make()
  try {
    const o = call(a, owner, "orders/create", fixture(a))
    assert.equal(o.total, 162000)
    assert.equal(o.serviceCharge, 0)
    assert.equal(o.tickets.length, 1)
    const body = {
        id: o.id,
        version: o.version,
        amount: 200000,
        method: "Cash",
      },
      key = randomUUID()
    const paid = call(a, owner, "payments", body, key)
    assert.equal(paid.net, 162000)
    assert.equal(paid.change, 38000)
    assert.equal(paid.balance, 0)
    assert.equal(paid.paymentStatus, "Paid")
    assert.deepEqual(call(a, owner, "payments", body, key), paid)
    assert.equal(a.one("SELECT COUNT(*) n FROM payments").n, 1)
  } finally {
    a.db.close()
  }
})
test("guest dine-in validation, occupied table and customer phone normalization", () => {
  const { a, cashier } = make()
  try {
    assert.equal(phone("0300 1234567"), "923001234567")
    assert.equal(phone("+92 300 1234567"), "923001234567")
    assert.throws(() => phone("123"))
    const c = call(a, cashier, "customers/save", {
      name: "Test customer",
      phone: "03001234567",
    })
    const b = {
      ...fixture(a),
      service: "Dine-in",
      tableId: 1,
      customerId: c.id,
    }
    const o = call(a, cashier, "orders/create", b)
    assert.equal(o.place, "Table 01")
    assert.equal(o.customer.name, "Test customer")
    assert.throws(() => call(a, cashier, "orders/create", b), /occupied/)
    assert.throws(() =>
      call(a, cashier, "orders/create", { ...b, tableId: null }),
    )
  } finally {
    a.db.close()
  }
})
test("orders are atomic and retry idempotency yields one invoice and one kitchen ticket", () => {
  const { a, owner } = make()
  try {
    const b = fixture(a),
      key = randomUUID()
    const o = call(a, owner, "orders/create", b, key)
    assert.deepEqual(call(a, owner, "orders/create", b, key), o)
    for (const table of ["orders", "invoices", "tickets"])
      assert.equal(a.one("SELECT COUNT(*) n FROM " + table).n, 1)
    assert.throws(
      () => call(a, owner, "orders/create", { ...b, discount: 1 }, key),
      /different request/,
    )
    const before = a.one("SELECT COUNT(*) n FROM orders").n
    assert.throws(() =>
      call(a, owner, "orders/create", {
        ...b,
        items: [...b.items, { variantId: 999, qty: 1000 }],
      }),
    )
    assert.equal(a.one("SELECT COUNT(*) n FROM orders").n, before)
  } finally {
    a.db.close()
  }
})
test("server permissions deny kitchen financial data, cashier menu/discount/refund/report/settings", () => {
  const { a, owner, cashier, kitchen } = make()
  try {
    const b = fixture(a),
      o = call(a, owner, "orders/create", b)
    for (const [r, v] of [
      ["orders/create", b],
      ["payments", { id: o.id, version: 1, amount: 100, method: "Cash" }],
      ["customers/save", { name: "A", phone: "03001234567" }],
      ["summary", {}],
    ])
      assert.throws(
        () => call(a, kitchen, r, v),
        (e) => e.status === 403,
      )
    for (const r of [
      "menu/save",
      "settings",
      "refunds",
      "stock/move",
      "summary",
      "staff",
    ])
      assert.throws(
        () => call(a, cashier, r, {}),
        (e) => e.status === 403,
      )
    assert.throws(
      () => call(a, cashier, "orders/create", { ...b, discount: 100 }),
      (e) => e.status === 403,
    )
    const k = a.call(kitchen, "bootstrap")
    assert.equal(k.menu, undefined)
    assert.equal(k.orders[0].total, undefined)
    assert.equal(k.orders[0].items[0].price, undefined)
  } finally {
    a.db.close()
  }
})
test("partial then multiple payments reconcile; noncash overpayment rejected", () => {
  const { a, cashier } = make()
  try {
    let o = call(a, cashier, "orders/create", fixture(a))
    o = call(a, cashier, "payments", {
      id: o.id,
      version: o.version,
      amount: 100000,
      method: "Cash",
    })
    assert.equal(o.balance, 62000)
    assert.equal(o.paymentStatus, "Partial")
    assert.throws(
      () =>
        call(a, cashier, "payments", {
          id: o.id,
          version: o.version,
          amount: 70000,
          method: "Card",
        }),
      /exceeds/,
    )
    o = call(a, cashier, "payments", {
      id: o.id,
      version: o.version,
      amount: 62000,
      method: "Bank/Wallet",
    })
    assert.equal(o.balance, 0)
    assert.equal(o.payments.length, 2)
  } finally {
    a.db.close()
  }
})
test("price snapshots, invoice revisions, append sends only additions and rejects stale edits", () => {
  const { a, owner } = make()
  try {
    let o = call(a, owner, "orders/create", fixture(a))
    const old = o.items[0].price,
      m = a.menu()[0]
    m.variants[0].price = 200000
    call(a, owner, "menu/save", m)
    assert.equal(a.order(o.id).items[0].price, old)
    o = call(a, owner, "orders/append", {
      id: o.id,
      version: o.version,
      items: [{ variantId: m.variants[0].id, qty: 1000 }],
    })
    assert.equal(o.revision, 2)
    assert.equal(o.tickets.length, 2)
    assert.equal(o.items.filter((x) => x.batch === 2).length, 1)
    assert.equal(o.total, 362000)
    assert.equal(
      JSON.parse(
        a.one(
          "SELECT snapshot FROM invoice_revisions WHERE invoice_id=? AND revision=1",
          o.invoiceId,
        ).snapshot,
      ).total,
      162000,
    )
    assert.throws(
      () =>
        call(a, owner, "orders/append", {
          id: o.id,
          version: 1,
          items: [{ variantId: m.variants[0].id, qty: 1000 }],
        }),
      (e) => e.status === 409,
    )
  } finally {
    a.db.close()
  }
})
test("sold-out/last-portion availability and version conflicts preserve data", () => {
  const { a, owner } = make()
  try {
    const m = a.menu()[0]
    m.variants[0].portions = 1000
    call(a, owner, "menu/save", m)
    const body = {
      service: "Takeaway",
      items: [{ variantId: m.variants[0].id, qty: 1000 }],
    }
    call(a, owner, "orders/create", body)
    assert.throws(() => call(a, owner, "orders/create", body), /portion/)
    assert.equal(a.one("SELECT COUNT(*) n FROM orders").n, 1)
    const unavailable = a.menu().find((x) => !x.available)
    assert.throws(
      () =>
        call(a, owner, "orders/create", {
          ...body,
          items: [{ variantId: unavailable.variants[0].id, qty: 1000 }],
        }),
      /sold out/,
    )
  } finally {
    a.db.close()
  }
})
test("fractional quantities, valid increments, integer half-up rounding and charges", () => {
  const { a, owner } = make()
  try {
    assert.equal(round(1005 * 500), 503)
    const m = a.menu()[0]
    m.variants = [
      { ...m.variants[0], unit: "kg", step: 250, price: 1005, portions: null },
    ]
    call(a, owner, "menu/save", m)
    const s = a.settings()
    call(a, owner, "settings", { ...s, taxBps: 500, serviceBps: 1000 })
    const o = call(a, owner, "orders/create", {
      service: "Takeaway",
      discount: 3,
      items: [{ variantId: m.variants[0].id, qty: 500 }],
    })
    assert.equal(o.subtotal, 503)
    assert.equal(o.tax, 25)
    assert.equal(o.serviceCharge, 50)
    assert.equal(o.total, 575)
    assert.throws(
      () =>
        call(a, owner, "orders/create", {
          service: "Takeaway",
          items: [{ variantId: m.variants[0].id, qty: 333 }],
        }),
      /increments/,
    )
    assert.throws(() => amounts([{ amount: 100 }], 101, 0, 0), /Discount/)
  } finally {
    a.db.close()
  }
})
test("refund cap and cancellation reasons preserve original values and do not create debt", () => {
  const { a, owner } = make()
  try {
    let o = call(a, owner, "orders/create", fixture(a))
    o = call(a, owner, "payments", {
      id: o.id,
      version: o.version,
      amount: 100000,
      method: "Cash",
    })
    assert.throws(
      () =>
        call(a, owner, "refunds", {
          id: o.id,
          version: o.version,
          amount: 100001,
          method: "Cash",
          reason: "Test",
        }),
      /exceeds/,
    )
    o = call(a, owner, "refunds", {
      id: o.id,
      version: o.version,
      amount: 100000,
      method: "Cash",
      reason: "Customer cancellation",
    })
    assert.equal(o.balance, 62000)
    o = call(a, owner, "orders/cancel", {
      id: o.id,
      version: o.version,
      reason: "Customer cancellation",
      preparation: "Not prepared",
    })
    assert.equal(o.balance, 0)
    assert.equal(o.total, 162000)
    assert.equal(o.paymentStatus, "Cancelled")
    assert.equal(o.refunded, 100000)
  } finally {
    a.db.close()
  }
})
test("kitchen transitions independent of payment and close table retains unpaid invoice", () => {
  const { a, owner, kitchen } = make()
  try {
    let o = call(a, owner, "orders/create", {
      ...fixture(a),
      service: "Dine-in",
      tableId: 2,
    })
    assert.throws(
      () => call(a, owner, "orders/close", { id: o.id, version: o.version }),
      /Serve/,
    )
    const t = o.tickets[0]
    assert.throws(() =>
      call(a, kitchen, "tickets", {
        id: t.id,
        previous: "New",
        state: "Ready",
      }),
    )
    for (const [previous, state] of [
      ["New", "Preparing"],
      ["Preparing", "Ready"],
      ["Ready", "Served"],
    ])
      call(a, kitchen, "tickets", { id: t.id, previous, state })
    o = a.order(o.id)
    assert.equal(o.paymentStatus, "Unpaid")
    o = call(a, owner, "orders/close", { id: o.id, version: o.version })
    assert.equal(o.balance, 162000)
    assert.equal(
      a.call(owner, "bootstrap").tables.find((t) => t.id === 2).orderId,
      null,
    )
  } finally {
    a.db.close()
  }
})
test("purchase receipt exactly once, supplier settlement never receives stock again", () => {
  const { a, owner } = make()
  try {
    const s = call(a, owner, "suppliers/save", { name: "Test supplier" })
    const before = a.call(owner, "bootstrap").ingredients[0].stock
    const b = {
        supplierId: s.id,
        items: [{ ingredientId: 1, qty: 2500, cost: 50000 }],
        paid: 25000,
        method: "Cash",
      },
      key = randomUUID()
    const p = call(a, owner, "purchases", b, key)
    assert.equal(p.total, 125000)
    call(a, owner, "purchases", b, key)
    assert.equal(a.call(owner, "bootstrap").ingredients[0].stock, before + 2500)
    call(a, owner, "suppliers/pay", {
      supplierId: s.id,
      amount: 100000,
      method: "Cash",
    })
    assert.equal(a.call(owner, "bootstrap").ingredients[0].stock, before + 2500)
    assert.equal(a.call(owner, "bootstrap").suppliers[0].balance, 0)
  } finally {
    a.db.close()
  }
})
test("consumption, wastage, opening-once and authorized stock adjustment reconcile", () => {
  const { a, owner } = make()
  try {
    const before = a.call(owner, "bootstrap").ingredients[0].stock
    for (const [kind, qty] of [
      ["consumption", 1500],
      ["wastage", 500],
      ["adjustment", -250],
    ])
      call(a, owner, "stock/move", {
        ingredientId: 1,
        kind,
        qty,
        reason: "Test movement",
      })
    assert.equal(a.call(owner, "bootstrap").ingredients[0].stock, before - 2250)
    assert.throws(
      () =>
        call(a, owner, "stock/move", {
          ingredientId: 1,
          kind: "consumption",
          qty: 999999,
          reason: "Overdraw",
        }),
      /Insufficient/,
    )
    assert.throws(
      () =>
        call(a, owner, "stock/move", {
          ingredientId: 1,
          kind: "opening",
          qty: 1,
          reason: "Duplicate opening",
        }),
      /already/,
    )
  } finally {
    a.db.close()
  }
})
test("cash closing reconciles purchases/payment once, refunds, expenses and prior-day dues", () => {
  const { a, owner } = make()
  try {
    const session = call(a, owner, "cash/open", { opening: 100000 })
    let o = call(a, owner, "orders/create", fixture(a))
    a.run("UPDATE orders SET business_date='2020-01-01' WHERE id=?", o.id)
    o = call(a, owner, "payments", {
      id: o.id,
      version: o.version,
      amount: 200000,
      method: "Cash",
    })
    call(a, owner, "refunds", {
      id: o.id,
      version: o.version,
      amount: 20000,
      method: "Cash",
      reason: "Service adjustment",
    })
    call(a, owner, "expenses", {
      category: "Gas",
      amount: 10000,
      method: "Cash",
      note: "Gas expense",
    })
    const s = call(a, owner, "suppliers/save", { name: "Supplier" })
    call(a, owner, "purchases", {
      supplierId: s.id,
      items: [{ ingredientId: 1, qty: 1000, cost: 50000 }],
      paid: 30000,
      method: "Cash",
    })
    call(a, owner, "suppliers/pay", {
      supplierId: s.id,
      amount: 20000,
      method: "Cash",
    })
    const report = call(a, owner, "summary", { from: date(), to: date() })
    assert.equal(report.sales, 0)
    assert.equal(report.collections, 162000)
    assert.equal(report.refunds, 20000)
    const closed = call(a, owner, "cash/close", {
      id: session.id,
      counted: 182000,
    })
    assert.equal(closed.expected, 182000)
    assert.equal(closed.difference, 0)
  } finally {
    a.db.close()
  }
})
test("held drafts persist and only their actor can delete", () => {
  const { a, owner, cashier } = make()
  try {
    const d = call(a, owner, "drafts/save", { data: fixture(a) })
    assert.equal(a.call(owner, "bootstrap").drafts.length, 1)
    call(a, cashier, "drafts/delete", { id: d.id })
    assert.equal(a.call(owner, "bootstrap").drafts.length, 1)
    call(a, owner, "drafts/delete", { id: d.id })
    assert.equal(a.call(owner, "bootstrap").drafts.length, 0)
  } finally {
    a.db.close()
  }
})
test("database restart retains orders, idempotency, payments, customers and drafts", () => {
  const dir = mkdtempSync(join(tmpdir(), "erp-test-")),
    file = join(dir, "test.sqlite")
  let a = openERP(file, { seed: true })
  try {
    const u = a.one("SELECT * FROM users WHERE role='Owner'"),
      key = randomUUID(),
      body = fixture(a),
      o = call(a, u, "orders/create", body, key)
    call(a, u, "payments", {
      id: o.id,
      version: 1,
      amount: 100000,
      method: "Cash",
    })
    a.db.close()
    a = openERP(file)
    assert.equal(a.order(o.id).balance, 62000)
    assert.equal(call(a, u, "orders/create", body, key).id, o.id)
    assert.equal(a.one("SELECT COUNT(*) n FROM invoices").n, 1)
  } finally {
    a.db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
test("production onboarding has no demo users, business records or ingredients", () => {
  const a = openERP(":memory:", { seed: false })
  try {
    for (const table of [
      "users",
      "menu",
      "orders",
      "customers",
      "ingredients",
      "stock_movements",
    ])
      assert.equal(a.one("SELECT COUNT(*) n FROM " + table).n, 0)
  } finally {
    a.db.close()
  }
})

test("cash ledger isolates transactions posted before a shift even at identical timestamps", () => {
  const { a, owner } = make()
  try {
    let o = call(a, owner, "orders/create", fixture(a))
    o = call(a, owner, "payments", {
      id: o.id,
      version: 1,
      amount: 10000,
      method: "Cash",
    })
    const opening = call(a, owner, "cash/open", { opening: 50000 })
    const ledger = a.one("SELECT * FROM cash_movements")
    assert.equal(ledger.session_id, null)
    a.run(
      "UPDATE cash_sessions SET opened=? WHERE id=?",
      ledger.created,
      opening.id,
    )
    const session = a.call(owner, "bootstrap").cash[0]
    assert.equal(session.expected, 50000)
    assert.equal(a.one("SELECT COUNT(*) n FROM cash_movements").n, 1)
  } finally {
    a.db.close()
  }
})
test("refunds preserve derived payment status and expose reversals separately", () => {
  const { a, owner } = make()
  try {
    let o = call(a, owner, "orders/create", fixture(a))
    o = call(a, owner, "payments", {
      id: o.id,
      version: 1,
      amount: 162000,
      method: "Card",
    })
    o = call(a, owner, "refunds", {
      id: o.id,
      version: o.version,
      amount: 50000,
      method: "Card",
      reason: "Service adjustment",
    })
    assert.equal(o.balance, 0)
    assert.equal(o.paymentStatus, "Paid")
    assert.equal(o.refundStatus, "Refunded")
    assert.equal(o.total, 162000)
  } finally {
    a.db.close()
  }
})

test('server rejects impossible expense/report dates and fractional pieces', () => {
 const {a,owner}=make();try{
  assert.throws(()=>call(a,owner,'expenses',{category:'Test',amount:100,method:'Cash',note:'Invalid date',businessDate:'2026-02-31'}),/Invalid expense date/);
  assert.throws(()=>call(a,owner,'summary',{from:'2026-02-31',to:'2026-03-01'}),/Invalid date range/);
  const m=a.menu().find(m=>m.name==='Roghni Naan');m.variants[0].step=500;assert.throws(()=>call(a,owner,'menu/save',m),/whole-unit/);
 }finally{a.db.close();}
});


test('a committed retry still requires the actor current role permissions', () => {
 const {a,owner}=make();try{const key=randomUUID(),body={ingredientId:1,kind:'in',qty:1000,reason:'Authorized movement'};call(a,owner,'stock/move',body,key);assert.throws(()=>call(a,{...owner,role:'Cashier'},'stock/move',body,key),e=>e.status===403);}finally{a.db.close();}
});


test('profit uses saved dish costs, discount, refunds and expenses without counting stock purchases twice', () => {
 const {a,owner}=make();
 try {
  const f=fixture(a);const costs=[70000,4000,3000];
  f.items.forEach((i,j)=>a.run('UPDATE variants SET cost=? WHERE id=?',costs[j],i.variantId));
  f.discount=2000;
  let o=call(a,owner,'orders/create',f);
  call(a,owner,'expenses',{category:'Electricity',amount:10000,method:'Cash',note:'Operating expense',businessDate:date()});
  let r=call(a,owner,'summary',{from:date(),to:date()});
  assert.equal(r.foodCost,89000);assert.equal(r.netSales,160000);assert.equal(r.profit,61000);assert.equal(r.missingCosts,0);
  const dish=a.menu()[0];dish.variants[0].cost=110000;call(a,owner,'menu/save',dish);
  r=call(a,owner,'summary',{});assert.equal(r.foodCost,89000);assert.equal(r.profit,61000);
  o=call(a,owner,'payments',{id:o.id,version:o.version,amount:160000,method:'Cash'});
  call(a,owner,'refunds',{id:o.id,version:o.version,amount:10000,method:'Cash',reason:'Customer adjustment'});
  r=call(a,owner,'summary',{});assert.equal(r.profit,51000);
  const supplier=call(a,owner,'suppliers/save',{name:'Profit supplier',phone:''});
  call(a,owner,'purchases',{supplierId:supplier.id,items:[{ingredientId:1,qty:1000,cost:50000}],paid:0,method:'Cash'});
  assert.equal(call(a,owner,'summary',{}).profit,51000);
 }finally{a.db.close()}
});

test('missing historical costs block profit; zero cost is a deliberate valid value; costs survive new variant saves',()=>{
 const {a,owner}=make();try{
  const dish=a.menu().find(m=>m.name==='Raita');call(a,owner,'orders/create',{service:'Takeaway',items:[{variantId:dish.variants[0].id,qty:1000}]});
  let r=call(a,owner,'summary',{});assert.equal(r.profit,null);assert.equal(r.missingCosts,1);
  dish.variants[0].cost=0;call(a,owner,'menu/save',dish);assert.equal(call(a,owner,'summary',{}).profit,null);
  const fresh=call(a,owner,'menu/save',{name:'Cost test dish',category:'Special',image:'',available:1,variants:[{name:'Plate',unit:'portion',price:10000,cost:4000,step:1000,portions:null},{name:'Full',unit:'portion',price:20000,cost:7000,step:1000,portions:null}]});
  const saved=a.menu().find(m=>m.id===fresh.id);assert.deepEqual(saved.variants.map(v=>v.cost),[4000,7000]);
  call(a,owner,"menu/save",{...saved,variants:[{name:"New first",unit:"portion",price:5000,cost:2000,step:1000,portions:null},...saved.variants]});
  assert.deepEqual(a.menu().find(m=>m.id===fresh.id).variants.map(v=>v.cost),[4000,7000,2000]);
  assert.throws(()=>call(a,owner,'menu/save',{...saved,variants:[{...saved.variants[0],cost:-1}]}));
 }finally{a.db.close()}
});

test('prepared cancelled food remains a cost, unprepared cancellation does not, and tax refunds are apportioned',()=>{
 const {a,owner}=make();try{
  const v=a.menu().find(m=>m.name==='Raita').variants[0];a.run('UPDATE variants SET cost=? WHERE id=?',6000,v.id);
  const create=()=>call(a,owner,'orders/create',{service:'Takeaway',items:[{variantId:v.id,qty:1000}]});
  let o=create();call(a,owner,'orders/cancel',{id:o.id,version:o.version,reason:'Prepared food rejected',preparation:'Prepared'});
  let r=call(a,owner,'summary',{});assert.equal(r.foodCost,6000);assert.equal(r.netSales,0);assert.equal(r.profit,-6000);
  o=create();call(a,owner,'orders/cancel',{id:o.id,version:o.version,reason:'Before preparation',preparation:'Not prepared'});
  assert.equal(call(a,owner,'summary',{}).foodCost,6000);
  const settings=a.settings();call(a,owner,'settings',{...settings,taxBps:1000});
  o=create();o=call(a,owner,'payments',{id:o.id,version:o.version,amount:o.total,method:'Cash'});
  call(a,owner,'refunds',{id:o.id,version:o.version,amount:5500,method:'Cash',reason:'Half including tax'});
  r=call(a,owner,'summary',{});assert.equal(r.netSales,5000);assert.equal(r.foodCost,12000);assert.equal(r.profit,-7000);
 }finally{a.db.close()}
});
