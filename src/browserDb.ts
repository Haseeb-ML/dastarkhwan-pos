// @ts-nocheck
import defaultState from "./initialState.json";
import {
  fetchFirestoreState,
  saveFirestoreState,
  syncOrderToFirestore,
  syncCustomerToFirestore,
  syncMenuDishToFirestore,
  syncExpenseToFirestore,
} from "./firestoreSync";

const DB_KEY = "dastarkhwan_standalone_db";
const USER_KEY = "dastarkhwan_current_user";

let isSyncing = false;
let lastSyncTime = 0;

export async function syncWithFirestore() {
  if (isSyncing || typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastSyncTime < 5000) return; // limit sync checks to at most once per 5s
  isSyncing = true;
  lastSyncTime = now;
  try {
    const remote = await fetchFirestoreState();
    if (remote && remote.orders) {
      const local = getLocalState();
      const localUpdated = local._updated ? new Date(local._updated).getTime() : 0;
      const remoteUpdated = remote._firestoreUpdated ? new Date(remote._firestoreUpdated).getTime() : 0;
      
      // If remote is newer than local, or if local is just default state
      if (remoteUpdated > localUpdated || !local._updated) {
        localStorage.setItem(DB_KEY, JSON.stringify(remote));
      }
    }
  } catch (e) {
    console.warn("Firestore sync check error:", e);
  } finally {
    isSyncing = false;
  }
}

// Initial sync on startup
if (typeof window !== "undefined") {
  syncWithFirestore().catch(() => {});
}

export function getLocalState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read standalone state:", e);
  }
  const initial = JSON.parse(JSON.stringify(defaultState));
  initial._updated = new Date().toISOString();
  saveLocalState(initial);
  return initial;
}

export function saveLocalState(state: any) {
  try {
    state._updated = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    // Persist full state to Cloud Firestore in background
    saveFirestoreState(state).catch(() => {});
  } catch (e) {
    console.error("Failed to persist standalone state:", e);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaultOwner = { id: 1, name: "Ali Khan (Owner)", username: "owner", role: "Owner" };
  setCurrentUser(defaultOwner);
  return defaultOwner;
}

export function setCurrentUser(user: any) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("erp_token", "standalone_token_" + user.id);
  } else {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("erp_token");
  }
}

export function handleStandaloneRequest(route: string, body?: any): any {
  const state = getLocalState();
  const currentUser = getCurrentUser();

  if (route === "health") {
    return {
      ok: true,
      database: "Google Cloud Firestore",
      mode: "cloud",
      setupRequired: false,
    };
  }

  if (route === "auth/login") {
    const username = String(body?.username || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();

    const allowed = [
      { id: 1, name: "Ali Khan (Owner)", username: "owner", role: "Owner" },
      { id: 2, name: "Hamza (Cashier)", username: "cashier", role: "Cashier" },
      { id: 3, name: "Ustad Rasheed (Kitchen)", username: "kitchen", role: "Kitchen" },
    ];

    const match = allowed.find((u) => u.username === username);
    if (!match || (password !== "123456" && password !== "Demo@2026!" && password !== "owner" && password !== "admin")) {
      const err = new Error("غلط یوزر نیم یا پاس ورڈ (Incorrect username or password)");
      (err as any).status = 401;
      throw err;
    }

    const token = "standalone_jwt_" + match.id + "_" + Date.now();
    const user = { ...match, token };
    setCurrentUser(user);
    return user;
  }

  if (route === "auth/logout") {
    setCurrentUser(null);
    return { ok: true };
  }

  if (route === "bootstrap") {
    if (!currentUser) {
      const err = new Error("Session expired. Please sign in.");
      (err as any).status = 401;
      throw err;
    }

    // Trigger background check for remote updates
    syncWithFirestore().catch(() => {});

    // Sync table occupied status with currently open dine-in orders
    const openOrders = (state.orders || []).filter((o: any) => o.state === "open");
    const updatedTables = (state.tables || []).map((t: any) => {
      const activeOrder = openOrders.find((o: any) => o.table_id === t.id);
      return { ...t, orderId: activeOrder ? activeOrder.id : null };
    });

    return {
      ...state,
      tables: updatedTables,
      user: currentUser,
      dataEpoch: state.dataEpoch || "standalone-1",
    };
  }

  if (route === "order") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body?.id));
    if (!o) {
      const err = new Error("Order not found");
      (err as any).status = 404;
      throw err;
    }
    return o;
  }

function findVariant(state: any, variantId: number) {
  for (const m of state.menu || []) {
    for (const v of m.variants || []) {
      if (Number(v.id) === Number(variantId)) {
        return { dish: m, variant: v };
      }
    }
  }
  return null;
}

  // Handle Order creation
  if (route === "order" || route === "orders/create") {
    const orderData = body;
    const nextId = (state.orders?.length ? Math.max(...state.orders.map((o: any) => o.id || 0)) : 0) + 1;
    const orderNumber = `INV-${String(nextId).padStart(6, "0")}`;

    const items = (orderData.items || []).map((it: any, idx: number) => {
      const vId = Number(it.variantId || it.variant_id || 1);
      const found = findVariant(state, vId);

      const dishName = it.name || found?.dish?.name || "Dish";
      const variantName = it.variant || found?.variant?.name || "Standard";
      const unit = it.unit || found?.variant?.unit || "portion";
      const price = Number(it.price !== undefined && it.price !== null ? it.price : (found?.variant?.price || 0));
      const qty = Number(it.qty || 1000);
      const amount = Math.round((price * qty) / 1000);

      return {
        id: nextId * 100 + idx,
        order_id: nextId,
        variant_id: vId,
        name: dishName,
        variant: variantName,
        unit: unit,
        qty,
        price,
        amount,
        note: it.note || "",
        batch: 1,
        cost: found?.variant?.cost ?? null,
      };
    });

    const subtotal = items.reduce((acc: number, it: any) => acc + it.amount, 0);
    const discount = Number(orderData.discount || 0);
    const taxable = Math.max(0, subtotal - discount);
    const taxBps = Number(state.settings?.taxBps || 0);
    const serviceBps = Number(state.settings?.serviceBps || 0);
    const tax = Math.round((taxable * taxBps) / 10000);
    const serviceCharge = Math.round((taxable * serviceBps) / 10000);
    const total = taxable + tax + serviceCharge;

    let place = "Takeaway";
    if (orderData.service === "Dine-in") {
      const table = (state.tables || []).find((t: any) => String(t.id) === String(orderData.tableId));
      place = table ? table.name : `Table ${orderData.tableId}`;
    } else if (orderData.service === "Delivery") {
      place = `Delivery: ${orderData.deliveryName || "Customer"}`;
    }

    const createdOrder: any = {
      id: nextId,
      number: orderNumber,
      created: new Date().toISOString(),
      business_date: new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
      service: orderData.service || "Dine-in",
      table_id: orderData.service === "Dine-in" ? Number(orderData.tableId) || null : null,
      customer_id: orderData.customerId ? Number(orderData.customerId) : null,
      customer_snapshot: orderData.deliveryName ? JSON.stringify({ name: orderData.deliveryName, phone: orderData.deliveryPhone, address: orderData.deliveryAddress }) : null,
      state: "open",
      version: 1,
      discount,
      tax_bps: taxBps,
      service_bps: serviceBps,
      reason: null,
      preparation: null,
      items,
      subtotal,
      tax,
      serviceCharge,
      total,
      restaurant: state.settings,
      place,
      customer: orderData.deliveryName ? { name: orderData.deliveryName, phone: orderData.deliveryPhone, address: orderData.deliveryAddress } : (orderData.customerId ? (state.customers || []).find((c: any) => c.id === Number(orderData.customerId)) : null),
      taxBps,
      serviceBps,
      orderId: nextId,
      invoiceId: nextId,
      revision: 1,
      received: 0,
      refunded: 0,
      net: 0,
      collectible: total,
      balance: total,
      refundStatus: null,
      paymentStatus: total === 0 ? "Paid" : "Unpaid",
      payments: [],
      refunds: [],
      change: 0,
      tickets: [{ id: nextId * 10, order_id: nextId, batch: 1, created: new Date().toISOString(), state: "New" }],
      revisions: [{ revision: 1, created: new Date().toISOString() }],
    };

    // Update table status
    if (createdOrder.table_id) {
      state.tables = (state.tables || []).map((t: any) =>
        t.id === createdOrder.table_id ? { ...t, orderId: nextId } : t
      );
    }

    // If editing existing held or open order, remove previous
    if (orderData.editId) {
      state.orders = (state.orders || []).filter((o: any) => o.id !== orderData.editId);
    }

    state.orders = [createdOrder, ...(state.orders || [])];
    saveLocalState(state);
    syncOrderToFirestore(createdOrder).catch(() => {});
    return createdOrder;
  }

  // Handle Order Append (adding dishes to open order)
  if (route === "orders/append") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body.id));
    if (!o) {
      const err = new Error("Order not found");
      (err as any).status = 404;
      throw err;
    }

    const currentBatch = Math.max(1, ...(o.tickets || []).map((t: any) => t.batch || 1)) + 1;
    const newItems = (body.items || []).map((it: any, idx: number) => {
      const vId = Number(it.variantId || it.variant_id || 1);
      const found = findVariant(state, vId);

      const dishName = it.name || found?.dish?.name || "Dish";
      const variantName = it.variant || found?.variant?.name || "Standard";
      const unit = it.unit || found?.variant?.unit || "portion";
      const price = Number(it.price !== undefined && it.price !== null ? it.price : (found?.variant?.price || 0));
      const qty = Number(it.qty || 1000);
      const amount = Math.round((price * qty) / 1000);

      return {
        id: o.id * 100 + (o.items?.length || 0) + idx + 1,
        order_id: o.id,
        variant_id: vId,
        name: dishName,
        variant: variantName,
        unit: unit,
        qty,
        price,
        amount,
        note: it.note || "",
        batch: currentBatch,
        cost: found?.variant?.cost ?? null,
      };
    });

    o.items = [...(o.items || []), ...newItems];
    o.subtotal = o.items.reduce((acc: number, it: any) => acc + (it.amount || 0), 0);
    const taxable = Math.max(0, o.subtotal - (o.discount || 0));
    const taxBps = Number(o.taxBps || state.settings?.taxBps || 0);
    const serviceBps = Number(o.serviceBps || state.settings?.serviceBps || 0);
    o.tax = Math.round((taxable * taxBps) / 10000);
    o.serviceCharge = Math.round((taxable * serviceBps) / 10000);
    o.total = taxable + o.tax + o.serviceCharge;
    o.collectible = o.total;
    o.balance = Math.max(0, o.total - (o.received || 0));
    o.paymentStatus = o.balance === 0 ? "Paid" : (o.received > 0 ? "Partial" : "Unpaid");
    o.version = (o.version || 1) + 1;
    o.tickets = [
      ...(o.tickets || []),
      { id: o.id * 10 + currentBatch, order_id: o.id, batch: currentBatch, created: new Date().toISOString(), state: "New" }
    ];

    saveLocalState(state);
    syncOrderToFirestore(o).catch(() => {});
    return o;
  }

  // Handle Payments
  if (route === "payments") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body.id));
    if (!o) {
      const err = new Error("Order not found");
      (err as any).status = 404;
      throw err;
    }

    const tendered = Number(body.amount || 0);
    const applied = Math.min(tendered, o.balance);
    const paymentRecord = {
      id: Date.now(),
      order_id: o.id,
      amount: applied,
      tendered,
      change: Math.max(0, tendered - applied),
      method: body.method || "Cash",
      created: new Date().toISOString(),
      business_date: new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
    };

    o.payments = [...(o.payments || []), paymentRecord];
    o.received = (o.received || 0) + applied;
    o.net = (o.net || 0) + applied;
    o.balance = Math.max(0, o.total - o.received);
    o.paymentStatus = o.balance === 0 ? "Paid" : "Partial";
    o.version = (o.version || 1) + 1;

    saveLocalState(state);
    syncOrderToFirestore(o).catch(() => {});
    return o;
  }

  // Handle Refunds
  if (route === "refunds") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body.id));
    if (!o) throw new Error("Order not found");
    const amount = Number(body.amount || 0);
    const refundRecord = {
      id: Date.now(),
      order_id: o.id,
      amount,
      method: body.method || "Cash",
      reason: body.reason || "",
      created: new Date().toISOString(),
      actor: currentUser?.id || 1,
    };
    o.refunds = [...(o.refunds || []), refundRecord];
    o.refunded = (o.refunded || 0) + amount;
    o.net = Math.max(0, (o.received || 0) - o.refunded);
    o.refundStatus = "Refunded";
    o.version = (o.version || 1) + 1;

    saveLocalState(state);
    syncOrderToFirestore(o).catch(() => {});
    return o;
  }

  // Handle Order Cancel
  if (route === "orders/cancel") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body.id));
    if (!o) throw new Error("Order not found");
    o.state = "cancelled";
    o.paymentStatus = "Cancelled";
    o.reason = body.reason || "Cancelled";
    o.preparation = body.preparation || "Not prepared";
    o.version = (o.version || 1) + 1;

    // Free table
    if (o.table_id) {
      state.tables = (state.tables || []).map((t: any) =>
        t.id === o.table_id ? { ...t, orderId: null } : t
      );
    }

    saveLocalState(state);
    syncOrderToFirestore(o).catch(() => {});
    return o;
  }

  // Handle Order Close
  if (route === "orders/close") {
    const o = (state.orders || []).find((x: any) => x.id === Number(body.id));
    if (!o) throw new Error("Order not found");
    o.state = "closed";
    o.version = (o.version || 1) + 1;

    if (o.table_id) {
      state.tables = (state.tables || []).map((t: any) =>
        t.id === o.table_id ? { ...t, orderId: null } : t
      );
    }

    saveLocalState(state);
    syncOrderToFirestore(o).catch(() => {});
    return o;
  }

  // Handle Kitchen Tickets
  if (route === "tickets") {
    const ticketId = Number(body.id);
    let matchedOrder: any = null;
    for (const ord of state.orders || []) {
      const t = (ord.tickets || []).find((tk: any) => tk.id === ticketId);
      if (t) {
        t.state = body.state;
        ord.version = (ord.version || 1) + 1;
        matchedOrder = ord;
        break;
      }
    }
    saveLocalState(state);
    if (matchedOrder) syncOrderToFirestore(matchedOrder).catch(() => {});
    return { ok: true };
  }

  // Handle Customers Save
  if (route === "customers/save") {
    const custData = body;
    if (custData.id) {
      const cid = Number(custData.id);
      state.customers = (state.customers || []).map((c: any) =>
        c.id === cid
          ? {
              ...c,
              name: custData.name,
              phone: custData.phone,
              address: custData.address || "",
              city: custData.city || "",
              email: custData.email || "",
              note: custData.note || "",
            }
          : c
      );
      const updated = state.customers.find((c: any) => c.id === cid);
      saveLocalState(state);
      if (updated) syncCustomerToFirestore(updated).catch(() => {});
      return { id: cid };
    } else {
      const nextId = (state.customers?.length ? Math.max(...state.customers.map((c: any) => c.id || 0)) : 0) + 1;
      const newCust = {
        id: nextId,
        name: custData.name,
        phone: custData.phone,
        address: custData.address || "",
        city: custData.city || "",
        email: custData.email || "",
        note: custData.note || "",
      };
      state.customers = [newCust, ...(state.customers || [])];
      saveLocalState(state);
      syncCustomerToFirestore(newCust).catch(() => {});
      return { id: nextId };
    }
  }

  // Handle Menu Save
  if (route === "menu/save") {
    const dishData = body;
    if (dishData.id) {
      const did = Number(dishData.id);
      state.menu = (state.menu || []).map((m: any) =>
        m.id === did
          ? {
              ...m,
              name: dishData.name,
              category: dishData.category,
              image: dishData.image || m.image,
              available: dishData.available ? 1 : 0,
              version: (m.version || 1) + 1,
              variants: dishData.variants || m.variants,
            }
          : m
      );
      const updated = state.menu.find((m: any) => m.id === did);
      saveLocalState(state);
      if (updated) syncMenuDishToFirestore(updated).catch(() => {});
      return { id: did };
    } else {
      const nextId = (state.menu?.length ? Math.max(...state.menu.map((m: any) => m.id || 0)) : 0) + 1;
      const newDish = {
        id: nextId,
        name: dishData.name,
        category: dishData.category || "General",
        image: dishData.image || "/media/curry.jpg",
        available: dishData.available !== false ? 1 : 0,
        archived: 0,
        version: 1,
        variants: (dishData.variants || []).map((v: any, idx: number) => ({
          id: nextId * 10 + idx + 1,
          menu_id: nextId,
          name: v.name || "Standard",
          unit: v.unit || "portion",
          price: Number(v.price || 0),
          step: Number(v.step || 1000),
          portions: null,
          cost: v.cost ? Number(v.cost) : null,
          active: 1,
        })),
      };
      state.menu = [newDish, ...(state.menu || [])];
      saveLocalState(state);
      syncMenuDishToFirestore(newDish).catch(() => {});
      return { id: nextId };
    }
  }

  // Handle Menu Archive
  if (route === "menu/archive") {
    const id = Number(body.id);
    state.menu = (state.menu || []).map((m: any) =>
      m.id === id ? { ...m, archived: 1 } : m
    );
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Tables Save
  if (route === "tables/save") {
    if (body.id) {
      state.tables = (state.tables || []).map((t: any) =>
        t.id === Number(body.id) ? { ...t, name: body.name, active: body.active ? 1 : 0 } : t
      );
    } else {
      const nextId = (state.tables?.length ? Math.max(...state.tables.map((t: any) => t.id || 0)) : 0) + 1;
      state.tables = [...(state.tables || []), { id: nextId, name: body.name || `Table ${nextId}`, active: 1, orderId: null }];
    }
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Settings
  if (route === "settings") {
    state.settings = { ...state.settings, ...body };
    saveLocalState(state);
    return state.settings;
  }

  // Handle Drafts Save & Delete
  if (route === "drafts/save") {
    const nextId = (state.drafts?.length ? Math.max(...state.drafts.map((d: any) => d.id || 0)) : 0) + 1;
    const newDraft = {
      id: nextId,
      actor: currentUser?.id || 1,
      data: body.data,
      created: new Date().toISOString(),
    };
    state.drafts = [newDraft, ...(state.drafts || [])];
    saveLocalState(state);
    return { id: nextId };
  }

  if (route === "drafts/delete") {
    state.drafts = (state.drafts || []).filter((d: any) => d.id !== Number(body.id));
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Expenses
  if (route === "expenses") {
    const nextId = (state.expenses?.length ? Math.max(...state.expenses.map((e: any) => e.id || 0)) : 0) + 1;
    const newExp = {
      id: nextId,
      category: body.category || "General",
      amount: Number(body.amount || 0),
      note: body.note || "",
      date: body.date || new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
    };
    state.expenses = [newExp, ...(state.expenses || [])];
    saveLocalState(state);
    syncExpenseToFirestore(newExp).catch(() => {});
    return newExp;
  }

  // Handle Cash session
  if (route === "cash/open" || route === "cash/close") {
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Summary
  if (route === "summary") {
    const today = new Date().toISOString().slice(0, 10);
    const from = (body && body.from) || today;
    const to = (body && body.to) || today;

    const ordersInPeriod = (state.orders || []).filter((o: any) => {
      const bDate = (o.business_date || o.created || "").slice(0, 10);
      return bDate >= from && bDate <= to;
    });
    const activeOrders = ordersInPeriod.filter((o: any) => o.state !== "cancelled");

    const sales = activeOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const cancelled = ordersInPeriod.filter((o: any) => o.state === "cancelled").reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    let collections = 0;
    let refunds = 0;
    (state.orders || []).forEach((o: any) => {
      (o.payments || []).forEach((p: any) => {
        const pDate = (p.created || "").slice(0, 10);
        if (pDate >= from && pDate <= to) collections += (p.amount || 0);
      });
      (o.refunds || []).forEach((r: any) => {
        const rDate = (r.created || "").slice(0, 10);
        if (rDate >= from && rDate <= to) refunds += (r.amount || 0);
      });
    });
    if (collections === 0) {
      collections = activeOrders.reduce((sum: number, o: any) => sum + (o.received || 0), 0);
    }
    if (refunds === 0) {
      refunds = activeOrders.reduce((sum: number, o: any) => sum + (o.refunded || 0), 0);
    }

    const expensesInPeriod = (state.expenses || []).filter((e: any) => {
      const eDate = (e.businessDate || e.created || "").slice(0, 10);
      return eDate >= from && eDate <= to;
    }).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    const daily: Record<string, number> = {};
    activeOrders.forEach((o: any) => {
      const d = (o.business_date || o.created || "").slice(0, 10);
      daily[d] = (daily[d] || 0) + (o.total || 0);
    });

    const dishSales: Record<string, { name: string; qty: number; amount: number }> = {};
    activeOrders.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        const name = it.name || "Dish";
        if (!dishSales[name]) {
          dishSales[name] = { name, qty: 0, amount: 0 };
        }
        dishSales[name].qty += (it.qty || 1000);
        dishSales[name].amount += (it.amount || it.price || 0);
      });
    });
    const popular = Object.values(dishSales).sort((a, b) => b.qty - a.qty).slice(0, 8);

    let foodCost = 0;
    let missingCosts = 0;
    activeOrders.forEach((o: any) => {
      (o.items || []).forEach((it: any) => {
        if (it.cost !== undefined && it.cost !== null) {
          foodCost += Math.round((it.cost * (it.qty || 1000)) / 1000);
        } else {
          const v = findVariant(state, it.variantId);
          if (v && v.cost !== undefined && v.cost !== null) {
            foodCost += Math.round((v.cost * (it.qty || 1000)) / 1000);
          } else {
            missingCosts++;
          }
        }
      });
    });

    const netSales = activeOrders.reduce((n: number, o: any) => {
      const food = (o.subtotal || o.total || 0) - (o.discount || 0);
      return n + food;
    }, 0) - refunds;

    const profit = missingCosts > 0 ? null : (netSales - foodCost - expensesInPeriod);
    const outstanding = (state.orders || []).filter((o: any) => o.state !== "cancelled")
      .reduce((s: number, o: any) => s + (o.balance || 0), 0);
    const lowStock = (state.ingredients || []).filter((ing: any) => !ing.archived && ing.stock <= ing.low).length;
    const supplierPayments = (state.supplierPayments || []).reduce((s: number, sp: any) => s + (sp.amount || 0), 0);

    return {
      foodCost,
      missingCosts,
      netSales: Math.max(0, netSales),
      profit,
      from,
      to,
      sales,
      orderCount: activeOrders.length,
      cancelled,
      collections,
      refunds,
      expenses: expensesInPeriod,
      supplierPayments,
      outstanding,
      lowStock,
      daily,
      popular,
    };
  }

  // Handle invoice data request
  if (route.startsWith("invoices/") && route.endsWith("/data")) {
    const id = Number(route.split("/")[1]);
    const found = state.orders?.find((o: any) => o.id === id);
    if (!found) {
      const err = new Error("Invoice not found");
      (err as any).status = 404;
      throw err;
    }
    return found;
  }

  // Operations recovery
  if (route.startsWith("operations/")) {
    return { found: false };
  }

  if (route === "maintenance/status") {
    return {
      enabled: true,
      lastBackup: "Google Cloud Firestore (Live)",
      demoAvailable: true,
    };
  }

  // Generic fallback: preserve state
  return { ok: true, state };
}

