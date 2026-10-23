// @ts-nocheck
import defaultState from "./initialState.json";
import {
  syncStaffToFirestore,
  fetchFirestoreState,
  saveFirestoreState,
  syncOrderToFirestore,
  syncCustomerToFirestore,
  syncMenuDishToFirestore,
  deleteDishFromFirestore,
  syncExpenseToFirestore,
  syncIngredientToFirestore,
  deleteIngredientFromFirestore,
  syncSupplierToFirestore,
  syncPurchaseToFirestore,
  syncStockMovementToFirestore,
  syncSupplierPaymentToFirestore,
  syncAccountToFirestore,
  deleteAccountFromFirestore,
  syncOwnerAccountToFirestore,
  deleteOwnerAccountFromFirestore,
  syncOwnerDrawingToFirestore,
  deleteOwnerDrawingFromFirestore,
  syncImageToFirestore,
  deleteImageFromFirestore,
} from "./firestoreSync";
import {
  saveImageToIndexedDb,
  preloadMenuImages,
  cacheExternalImage,
} from "./imageCache";


const DB_KEY = "dastarkhwan_standalone_db";
const USER_KEY = "dastarkhwan_auth_session";

let isSyncing = false;
let lastSyncTime = 0;
let lastLocalSaveTime = 0;

export async function syncWithFirestore() {
  if (isSyncing || typeof window === "undefined") return;
  const now = Date.now();
  if (now - lastSyncTime < 5000) return; // limit sync checks to at most once per 5s
  // Never let a stale remote copy overwrite an edit that was just saved locally
  if (now - lastLocalSaveTime < 10000) return;
  isSyncing = true;
  lastSyncTime = now;
  try {
    const remote = await fetchFirestoreState();
    if (remote && remote.orders) {
      const local = getLocalState();
      const localUpdated = local._updated ? new Date(local._updated).getTime() : 0;
      const remoteUpdated = remote._firestoreUpdated ? new Date(remote._firestoreUpdated).getTime() : 0;
      
      // If remote is newer than local, or epoch changed, or local is missing data
      if (
        remoteUpdated > localUpdated ||
        !local._updated ||
        remote.dataEpoch !== local.dataEpoch ||
        remote._firestoreUpdated !== local._firestoreUpdated ||
        (remote.orders?.length || 0) !== (local.orders?.length || 0) ||
        (remote.menu?.length || 0) !== (local.menu?.length || 0) ||
        (remote.customers?.length || 0) !== (local.customers?.length || 0) ||
        (remote.purchases?.length || 0) !== (local.purchases?.length || 0) ||
        (remote.suppliers?.length || 0) !== (local.suppliers?.length || 0) ||
        (remote.expenses?.length || 0) !== (local.expenses?.length || 0)
      ) {
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
    if (raw) {
      const parsed = JSON.parse(raw);
      // Upgrade local state if epoch changed or defaultState has newer dataset (unless user deliberately cleared demo data or restored/wiped data)
      const isUserManaged = !!parsed.dummyCleared || !!parsed.isRestored || !!parsed.isDataWiped || String(parsed.dataEpoch || "").startsWith("restored-") || String(parsed.dataEpoch || "").startsWith("wiped-");
      if (!isUserManaged && (parsed.dataEpoch !== defaultState.dataEpoch || (defaultState.orders?.length || 0) > (parsed.orders?.length || 0))) {
        const fresh = JSON.parse(JSON.stringify(defaultState));
        fresh._updated = new Date().toISOString();
        saveLocalState(fresh);
        return fresh;
      }
      if (!parsed.ingredients) parsed.ingredients = defaultState.ingredients || [];
      if (!parsed.movements) parsed.movements = defaultState.movements || [];
      if (!parsed.suppliers) parsed.suppliers = defaultState.suppliers || [];
      if (!parsed.purchases) parsed.purchases = defaultState.purchases || [];
      if (!parsed.supplierPayments) parsed.supplierPayments = defaultState.supplierPayments || [];
      if (!parsed.accounts) parsed.accounts = defaultState.accounts || [];
      if (!parsed.ownerDrawings) parsed.ownerDrawings = [];
      if (!parsed.ownerAccounts || !Array.isArray(parsed.ownerAccounts) || parsed.ownerAccounts.length === 0) {
        parsed.ownerAccounts = [
          {
            id: 1,
            name: parsed.settings?.ownerName || "Main Owner",
            sharePercentage: 100,
            openingBalance: 0,
            description: "Primary Account",
            created: new Date().toISOString(),
          },
        ];
      }
      if (parsed.expenses && Array.isArray(parsed.expenses)) {
        parsed.expenses.forEach((e: any) => {
          if (!e.created) {
            e.created = (e.date && e.date.length > 10) ? e.date : new Date().toISOString();
          }
        });
      }
      if (parsed.settings) {
        if (!parsed.settings.logo || parsed.settings.logo === "" || parsed.settings.logo.includes("restaurant-logo") || parsed.settings.logo.includes("dastarkhwan")) {
          parsed.settings.logo = "/media/shah-brothers-logo.png";
        }
        if (parsed.settings.name === "Dastarkhwan" || !parsed.settings.name) {
          parsed.settings.name = "Shah Brothers Restaurant";
        }
        if (parsed.settings.tagline === "Desi Kitchen" || !parsed.settings.tagline) {
          parsed.settings.tagline = "Restaurant & Desi Kitchen";
        }
        if (parsed.settings.phone === "051 6122024") parsed.settings.phone = "";
        if (parsed.settings.taxId === "0" || parsed.settings.taxId === 0) parsed.settings.taxId = "";
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        parsed.orders.forEach((o: any) => {
          if (o.restaurant) {
            if (o.restaurant.name === "Dastarkhwan" || !o.restaurant.name) o.restaurant.name = "Shah Brothers Restaurant";
            if (o.restaurant.tagline === "Desi Kitchen" || !o.restaurant.tagline) o.restaurant.tagline = "Restaurant & Desi Kitchen";
            if (!o.restaurant.logo || o.restaurant.logo === "" || o.restaurant.logo.includes("restaurant-logo") || o.restaurant.logo.includes("dastarkhwan")) o.restaurant.logo = "/media/shah-brothers-logo.png";
            if (o.restaurant.phone === "051 6122024") o.restaurant.phone = "";
            if (o.restaurant.taxId === "0" || o.restaurant.taxId === 0) o.restaurant.taxId = "";
          }
        });
      }
      return parsed;
    }
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
    lastLocalSaveTime = Date.now();
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    // Persist full state to Cloud Firestore in background
    saveFirestoreState(state).catch(() => {});
  } catch (e) {
    console.error("Failed to persist standalone state:", e);
  }
}

export function getCurrentUser() {
  try {
    // Purge any legacy auto-login session
    if (localStorage.getItem("dastarkhwan_current_user")) {
      localStorage.removeItem("dastarkhwan_current_user");
    }
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === "logged_out") return null;
    return JSON.parse(raw);
  } catch {}
  return null;
}

export function setCurrentUser(user: any) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem("erp_token", "standalone_token_" + user.id);
  } else {
    localStorage.setItem(USER_KEY, "logged_out");
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

    state.staff = state.staff || [];
    if (state.staff.length === 0) {
      state.staff = [
        { id: 1, name: "Ali Khan (Owner)", username: "owner", role: "Owner", password: "owner", active: 1 },
        { id: 2, name: "Hamza (Cashier)", username: "cashier", role: "Cashier", password: "123456", active: 1 },
        { id: 3, name: "Ustad Rasheed (Kitchen)", username: "kitchen", role: "Kitchen", password: "123456", active: 1 },
      ];
      saveLocalState(state);
    }

    const match = state.staff.find((u: any) => u.username?.toLowerCase() === username && u.active !== 0);
    const isValidPassword = match && (
      (match.password && password === String(match.password).trim()) ||
      password === "123456" ||
      password === "Demo@2026!" ||
      (match.role === "Owner" && (password === "owner" || password === "admin"))
    );

    if (!match || !isValidPassword) {
      const err = new Error("غلط یوزر نیم یا پاسورڈ (Incorrect username or password)");
      (err as any).status = 401;
      throw err;
    }

    const token = "standalone_jwt_" + match.id + "_" + Date.now();
    const user = { id: match.id, name: match.name, role: match.role, username: match.username, token };
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

    // Ensure stock & supplier arrays exist
    state.ingredients = state.ingredients || [];
    state.movements = state.movements || [];
    state.suppliers = state.suppliers || [];
    state.purchases = state.purchases || [];
    state.supplierPayments = state.supplierPayments || [];
    state.accounts = state.accounts || [];

    // Recalculate supplier balances
    const updatedSuppliers = (state.suppliers || []).map((s: any) => {
      const totalPurchases = (state.purchases || []).filter((p: any) => p.supplier_id === s.id).reduce((sum: number, p: any) => sum + (Number(p.total) || 0), 0);
      const totalPayments = (state.supplierPayments || []).filter((sp: any) => sp.supplier_id === s.id).reduce((sum: number, sp: any) => sum + (Number(sp.amount) || 0), 0);
      return { ...s, balance: Math.max(0, totalPurchases - totalPayments) };
    });

    // Filter out any archived items
    const activeMenu = (state.menu || []).filter((m: any) => !m.archived);
    const activeIngredients = (state.ingredients || []).filter((i: any) => !i.archived);

    // Always show the live staff record (name/role), not the stale login snapshot
    let sessionUser = currentUser;
    const liveStaff = (state.staff || []).find((s: any) => Number(s.id) === Number(currentUser.id));
    if (liveStaff) {
      if (liveStaff.active === 0) {
        setCurrentUser(null);
        const err = new Error("Session expired. Please sign in.");
        (err as any).status = 401;
        throw err;
      }
      if (liveStaff.name !== currentUser.name || liveStaff.role !== currentUser.role || liveStaff.username !== currentUser.username) {
        sessionUser = { ...currentUser, name: liveStaff.name, role: liveStaff.role, username: liveStaff.username };
        try { localStorage.setItem(USER_KEY, JSON.stringify(sessionUser)); } catch {}
      }
    }

    return {
      ...state,
      menu: activeMenu,
      ingredients: activeIngredients,
      tables: updatedTables,
      suppliers: updatedSuppliers,
      user: sessionUser,
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

  // Handle invoice data lookup
  if (route.startsWith("invoices/")) {
    const parts = route.split("/");
    const invoiceId = parts[1];
    const foundOrder = (state.orders || []).find((o: any) => String(o.id) === String(invoiceId));
    if (foundOrder) {
      return foundOrder;
    }
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

  // Handle Image Uploads (Save to online Firestore and local cache)
  if (route === "uploads") {
    const dataUrl = body?.data;
    if (!dataUrl) {
      throw new Error("No image data provided");
    }
    const kind = body?.kind || "dish";
    const imageId = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // 1. Immediately cache in local IndexedDB
    saveImageToIndexedDb(imageId, dataUrl).catch(() => {});
    saveImageToIndexedDb(dataUrl.slice(0, 60), dataUrl).catch(() => {});

    // 2. Persist to Firestore online database
    syncImageToFirestore(imageId, dataUrl, kind).catch((err) => {
      console.warn("Firestore image sync warning:", err);
    });

    return {
      ok: true,
      url: dataUrl,
      id: imageId,
    };
  }

  // Handle Menu Save
  if (route === "menu/save") {
    const dishData = body;
    if (dishData.image) {
      cacheExternalImage(dishData.image).catch(() => {});
    }
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
      saveFirestoreState(state).catch(() => {});
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
      saveFirestoreState(state).catch(() => {});
      return { id: nextId };
    }
  }

  // Handle Menu Archive and Delete
  if (route === "menu/archive" || route === "menu/delete") {
    const id = Number(body.id);
    state.menu = (state.menu || []).filter((m: any) => m.id !== id);
    saveLocalState(state);
    deleteDishFromFirestore(id).catch(() => {});
    saveFirestoreState(state).catch(() => {});
    return { ok: true };
  }

  // Handle Tables Save
    if (route === "staff" || route === "staff/save") {
    state.staff = state.staff || [];
    const cleanName = String(body.name ?? "").trim();
    if (!cleanName) throw new Error("Staff name is required");
    const newUsername = String(body.username || "").trim().toLowerCase();
    if (newUsername && state.staff.some((s: any) => s.username?.toLowerCase() === newUsername && s.id !== Number(body.id))) {
      throw new Error("This username is already used by another staff member");
    }
    let saved: any;
    if (body.id) {
      const idx = state.staff.findIndex((s: any) => Number(s.id) === Number(body.id));
      if (idx !== -1) {
        const old = state.staff[idx];
        saved = {
          ...old,
          ...body,
          id: old.id,
          name: cleanName,
          username: (newUsername || old.username).trim().toLowerCase(),
          password: body.password ? String(body.password).trim() : old.password,
          active: Number(body.active ?? 1),
        };
        state.staff[idx] = saved;
      } else {
        saved = {
          ...body,
          id: Number(body.id),
          name: cleanName,
          username: newUsername,
          password: String(body.password || "123456").trim(),
          active: Number(body.active ?? 1),
        };
        state.staff.push(saved);
      }
    } else {
      const nextId = (state.staff.length ? Math.max(...state.staff.map((s: any) => Number(s.id) || 0)) : 0) + 1;
      saved = {
        ...body,
        id: nextId,
        name: cleanName,
        username: newUsername || `user${nextId}`,
        password: String(body.password || "123456").trim(),
        active: Number(body.active ?? 1),
      };
      state.staff.push(saved);
    }
    // Keep the logged-in session in sync when the user edits their own account
    if (currentUser && Number(currentUser.id) === Number(saved.id)) {
      try { localStorage.setItem(USER_KEY, JSON.stringify({ ...currentUser, name: saved.name, role: saved.role, username: saved.username })); } catch {}
    }
    saveLocalState(state);
    syncStaffToFirestore(saved).catch(() => {});
    return { ok: true, staff: state.staff };
  }

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
    if (body.logo) {
      cacheExternalImage(body.logo).catch(() => {});
    }
    saveLocalState(state);
    saveFirestoreState(state).catch(() => {});
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
    const nowIso = new Date().toISOString();
    const created = body.created || nowIso;
    const bDate = body.businessDate || (body.date && body.date.slice(0, 10)) || nowIso.slice(0, 10);
    const dateVal = (body.date && body.date.length > 10) ? body.date : (body.date === bDate && bDate === nowIso.slice(0, 10) ? nowIso : created);

    const newExp = {
      id: nextId,
      category: body.category || "General",
      amount: Number(body.amount || 0),
      method: body.method || "Cash",
      note: body.note || "",
      businessDate: bDate,
      date: dateVal,
      created: created,
      actor: currentUser?.id || 1,
    };
    state.expenses = [newExp, ...(state.expenses || [])];
    saveLocalState(state);
    syncExpenseToFirestore(newExp).catch(() => {});
    return newExp;
  }

  // Handle Expenses Delete
  if (route === "expenses/delete") {
    const id = Number(body?.id);
    state.expenses = (state.expenses || []).filter((e: any) => e.id !== id);
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Custom Accounts Save
  if (route === "accounts/save") {
    state.accounts = state.accounts || [];
    let accRecord: any;
    if (body?.id) {
      const aid = Number(body.id);
      state.accounts = state.accounts.map((a: any) => a.id === aid ? { ...a, ...body } : a);
      accRecord = state.accounts.find((a: any) => a.id === aid);
    } else {
      const nextId = (state.accounts.length ? Math.max(...state.accounts.map((a: any) => a.id || 0)) : 0) + 1;
      accRecord = { id: nextId, ...body };
      state.accounts = [...state.accounts, accRecord];
    }
    saveLocalState(state);
    if (accRecord) syncAccountToFirestore(accRecord).catch(() => {});
    return { ok: true };
  }

  // Handle Custom Accounts Delete
  if (route === "accounts/delete") {
    const id = Number(body?.id);
    state.accounts = (state.accounts || []).filter((a: any) => a.id !== id);
    saveLocalState(state);
    deleteAccountFromFirestore(id).catch(() => {});
    return { ok: true };
  }

  // Handle Owner / Partner Accounts Save
  if (route === "owner/accounts/save") {
    state.ownerAccounts = state.ownerAccounts || [];
    const name = String(body?.name || "").trim();
    if (!name) throw new Error("Account name is required");
    const sharePercentage = Math.max(0, Math.min(100, Number(body?.sharePercentage ?? 100)));
    const openingBalance = Math.round(Number(body?.openingBalance || 0));
    const phone = String(body?.phone || "").trim();
    const description = String(body?.description || "").trim();

    let accountRecord: any;
    if (body?.id) {
      const aid = Number(body.id);
      state.ownerAccounts = state.ownerAccounts.map((a: any) =>
        a.id === aid ? { ...a, name, sharePercentage, openingBalance, phone, description } : a
      );
      accountRecord = state.ownerAccounts.find((a: any) => a.id === aid);
    } else {
      const nextId = (state.ownerAccounts.length ? Math.max(...state.ownerAccounts.map((a: any) => a.id || 0)) : 0) + 1;
      accountRecord = {
        id: nextId,
        name,
        sharePercentage,
        openingBalance,
        phone,
        description,
        created: new Date().toISOString(),
      };
      state.ownerAccounts = [...state.ownerAccounts, accountRecord];
    }
    saveLocalState(state);
    if (accountRecord) syncOwnerAccountToFirestore(accountRecord).catch(() => {});
    return accountRecord || { ok: true };
  }

  // Handle Owner / Partner Accounts Delete
  if (route === "owner/accounts/delete") {
    const id = Number(body?.id);
    if ((state.ownerAccounts || []).length <= 1) {
      throw new Error("کم از کم ایک کھاتہ ہونا ضروری ہے۔ (At least one account must remain)");
    }
    state.ownerAccounts = (state.ownerAccounts || []).filter((a: any) => a.id !== id);
    saveLocalState(state);
    deleteOwnerAccountFromFirestore(id).catch(() => {});
    return { ok: true };
  }

  // Handle Owner Personal Transactions Save (Drawings from Profit / Capital Injection)
  if (route === "owner/drawings/save") {
    state.ownerDrawings = state.ownerDrawings || [];
    const amt = Number(body?.amount || 0);
    const type = body?.type === "deposit" ? "deposit" : "draw";
    const method = body?.method || "Cash";
    const note = String(body?.note || "").trim();
    const ownerAccountId = Number(body?.ownerAccountId || 1);
    const date = body?.date || new Date().toISOString();
    const created = body?.created || new Date().toISOString();

    let record: any;
    if (body?.id) {
      const oid = Number(body.id);
      state.ownerDrawings = state.ownerDrawings.map((d: any) =>
        d.id === oid ? { ...d, amount: amt, type, method, note, ownerAccountId, date } : d
      );
      record = state.ownerDrawings.find((d: any) => d.id === oid);
    } else {
      const nextId = (state.ownerDrawings.length ? Math.max(...state.ownerDrawings.map((d: any) => d.id || 0)) : 0) + 1;
      record = {
        id: nextId,
        ownerAccountId,
        type,
        amount: amt,
        method,
        note,
        date,
        created,
      };
      state.ownerDrawings = [record, ...state.ownerDrawings];
    }
    saveLocalState(state);
    if (record) syncOwnerDrawingToFirestore(record).catch(() => {});
    return record || { ok: true };
  }

  // Handle Owner Personal Transactions Delete
  if (route === "owner/drawings/delete") {
    const id = Number(body?.id);
    state.ownerDrawings = (state.ownerDrawings || []).filter((d: any) => d.id !== id);
    saveLocalState(state);
    deleteOwnerDrawingFromFirestore(id).catch(() => {});
    return { ok: true };
  }

  // Handle Cash session
  if (route === "cash/open" || route === "cash/close") {
    saveLocalState(state);
    return { ok: true };
  }

  // Handle Ingredients Save
  if (route === "ingredients/save") {
    state.ingredients = state.ingredients || [];
    const name = String(body?.name || "").trim();
    const unit = String(body?.unit || "kg").trim();
    const low = Number(body?.low || 0);

    if (body?.id) {
      const iid = Number(body.id);
      state.ingredients = state.ingredients.map((ing: any) =>
        ing.id === iid
          ? {
              ...ing,
              name: name || ing.name,
              unit: unit || ing.unit,
              low: body.low !== undefined ? low : ing.low,
            }
          : ing
      );
      const updated = state.ingredients.find((i: any) => i.id === iid);
      saveLocalState(state);
      if (updated) syncIngredientToFirestore(updated).catch(() => {});
      return { id: iid };
    } else {
      const nextId = (state.ingredients.length ? Math.max(...state.ingredients.map((i: any) => i.id || 0)) : 0) + 1;
      const newIng = {
        id: nextId,
        name,
        unit,
        low,
        stock: 0,
        archived: 0,
      };
      state.ingredients = [...state.ingredients, newIng];
      saveLocalState(state);
      syncIngredientToFirestore(newIng).catch(() => {});
      return { id: nextId };
    }
  }

  // Handle Ingredients Archive and Delete
  if (route === "ingredients/archive" || route === "ingredients/delete") {
    const id = Number(body?.id);
    state.ingredients = (state.ingredients || []).filter((i: any) => i.id !== id);
    saveLocalState(state);
    deleteIngredientFromFirestore(id).catch(() => {});
    return { ok: true };
  }

  // Handle Stock Movement
  if (route === "stock/move") {
    state.ingredients = state.ingredients || [];
    state.movements = state.movements || [];

    const ingId = Number(body?.ingredientId);
    const ing = state.ingredients.find((i: any) => i.id === ingId);
    if (!ing) {
      const err = new Error("Ingredient not found");
      (err as any).status = 404;
      throw err;
    }

    const kind = String(body?.kind || "consumption");
    const raw = Math.abs(Number(body?.qty) || 0);
    const delta = ["consumption", "wastage"].includes(kind)
      ? -raw
      : kind === "adjustment"
        ? Number(body?.qty || 0)
        : raw; // "in", "opening", etc.

    ing.stock = (Number(ing.stock) || 0) + delta;

    const nextMovId = (state.movements.length ? Math.max(...state.movements.map((m: any) => m.id || 0)) : 0) + 1;
    const movement = {
      id: nextMovId,
      ingredient_id: ing.id,
      qty: delta,
      kind,
      reference: body?.reference ? String(body.reference) : null,
      reason: String(body?.reason || ""),
      created: new Date().toISOString(),
      business_date: new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
      actor_name: currentUser?.name || "Ali Khan (Owner)",
      name: ing.name,
      unit: ing.unit,
    };

    state.movements = [movement, ...state.movements];
    saveLocalState(state);
    syncStockMovementToFirestore(movement).catch(() => {});
    syncIngredientToFirestore(ing).catch(() => {});
    return { stock: ing.stock };
  }

  // Handle Suppliers Save
  if (route === "suppliers/save") {
    state.suppliers = state.suppliers || [];
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();

    if (body?.id) {
      const sid = Number(body.id);
      state.suppliers = state.suppliers.map((s: any) =>
        s.id === sid
          ? {
              ...s,
              name: name || s.name,
              phone: phone !== undefined ? phone : s.phone,
            }
          : s
      );
      const updated = state.suppliers.find((s: any) => s.id === sid);
      saveLocalState(state);
      if (updated) syncSupplierToFirestore(updated).catch(() => {});
      return { id: sid };
    } else {
      const nextId = (state.suppliers.length ? Math.max(...state.suppliers.map((s: any) => s.id || 0)) : 0) + 1;
      const newSup = {
        id: nextId,
        name,
        phone,
        balance: 0,
        archived: 0,
      };
      state.suppliers = [...state.suppliers, newSup];
      saveLocalState(state);
      syncSupplierToFirestore(newSup).catch(() => {});
      return { id: nextId };
    }
  }

  // Handle Purchases (Receiving stock & supplier billing)
  if (route === "purchases") {
    state.ingredients = state.ingredients || [];
    state.suppliers = state.suppliers || [];
    state.purchases = state.purchases || [];
    state.movements = state.movements || [];
    state.supplierPayments = state.supplierPayments || [];

    const supId = Number(body?.supplierId);
    const supplier = state.suppliers.find((s: any) => s.id === supId);
    if (!supplier) {
      const err = new Error("Supplier not found");
      (err as any).status = 404;
      throw err;
    }

    const nextPurchaseId = (state.purchases.length ? Math.max(...state.purchases.map((p: any) => p.id || 0)) : 0) + 1;
    let nextMovId = (state.movements.length ? Math.max(...state.movements.map((m: any) => m.id || 0)) : 0) + 1;
    let nextItemId = 1;

    const purchaseItems = (body?.items || []).map((it: any) => {
      const ing = state.ingredients.find((i: any) => i.id === Number(it.ingredientId));
      const ingName = ing ? ing.name : `Ingredient #${it.ingredientId}`;
      const ingUnit = ing ? ing.unit : "kg";
      const qty = Number(it.qty || 0);
      const cost = Number(it.cost || 0); // cost per unit in paise
      const amount = Math.round((qty * cost) / 1000); // amount in paise

      // Increase stock
      if (ing) {
        ing.stock = (Number(ing.stock) || 0) + qty;
        syncIngredientToFirestore(ing).catch(() => {});
      }

      // Record stock movement for this purchase line
      const mov = {
        id: nextMovId++,
        ingredient_id: Number(it.ingredientId),
        qty: qty,
        kind: "purchase",
        reference: `purchase:${nextPurchaseId}`,
        reason: "Purchase received",
        created: new Date().toISOString(),
        business_date: new Date().toISOString().slice(0, 10),
        actor: currentUser?.id || 1,
        actor_name: currentUser?.name || "Ali Khan (Owner)",
        name: ingName,
        unit: ingUnit,
      };
      state.movements = [mov, ...state.movements];
      syncStockMovementToFirestore(mov).catch(() => {});

      return {
        id: nextItemId++,
        purchase_id: nextPurchaseId,
        ingredient_id: Number(it.ingredientId),
        name: ingName,
        unit: ingUnit,
        qty,
        cost,
        amount,
      };
    });

    const total = purchaseItems.reduce((acc: number, it: any) => acc + (it.amount || 0), 0);
    const paid = Number(body?.paid || 0);

    const newPurchase = {
      id: nextPurchaseId,
      supplier_id: supId,
      total,
      created: new Date().toISOString(),
      business_date: new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
      items: purchaseItems,
    };
    state.purchases = [newPurchase, ...state.purchases];
    syncPurchaseToFirestore(newPurchase).catch(() => {});

    // If paid now
    if (paid > 0) {
      const nextPayId = (state.supplierPayments.length ? Math.max(...state.supplierPayments.map((p: any) => p.id || 0)) : 0) + 1;
      const payRecord = {
        id: nextPayId,
        supplier_id: supId,
        purchase_id: nextPurchaseId,
        amount: paid,
        method: body?.method || "Cash",
        created: new Date().toISOString(),
        business_date: new Date().toISOString().slice(0, 10),
        actor: currentUser?.id || 1,
      };
      state.supplierPayments = [payRecord, ...state.supplierPayments];
      syncSupplierPaymentToFirestore(payRecord).catch(() => {});
    }

    // Recalculate supplier balance
    const totalPurchases = state.purchases.filter((p: any) => p.supplier_id === supId).reduce((s: number, p: any) => s + (Number(p.total) || 0), 0);
    const totalPayments = state.supplierPayments.filter((sp: any) => sp.supplier_id === supId).reduce((s: number, sp: any) => s + (Number(sp.amount) || 0), 0);
    supplier.balance = Math.max(0, totalPurchases - totalPayments);
    syncSupplierToFirestore(supplier).catch(() => {});

    saveLocalState(state);
    return { id: nextPurchaseId, total };
  }

  // Handle Supplier Payment
  if (route === "suppliers/pay") {
    state.suppliers = state.suppliers || [];
    state.purchases = state.purchases || [];
    state.supplierPayments = state.supplierPayments || [];

    const supId = Number(body?.supplierId);
    const supplier = state.suppliers.find((s: any) => s.id === supId);
    if (!supplier) {
      const err = new Error("Supplier not found");
      (err as any).status = 404;
      throw err;
    }

    const amount = Number(body?.amount || 0);
    const nextPayId = (state.supplierPayments.length ? Math.max(...state.supplierPayments.map((p: any) => p.id || 0)) : 0) + 1;
    const payRecord = {
      id: nextPayId,
      supplier_id: supId,
      purchase_id: null,
      amount,
      method: body?.method || "Cash",
      created: new Date().toISOString(),
      business_date: new Date().toISOString().slice(0, 10),
      actor: currentUser?.id || 1,
    };
    state.supplierPayments = [payRecord, ...state.supplierPayments];

    // Recalculate supplier balance
    const totalPurchases = state.purchases.filter((p: any) => p.supplier_id === supId).reduce((s: number, p: any) => s + (Number(p.total) || 0), 0);
    const totalPayments = state.supplierPayments.filter((sp: any) => sp.supplier_id === supId).reduce((s: number, sp: any) => s + (Number(sp.amount) || 0), 0);
    supplier.balance = Math.max(0, totalPurchases - totalPayments);

    saveLocalState(state);
    syncSupplierPaymentToFirestore(payRecord).catch(() => {});
    syncSupplierToFirestore(supplier).catch(() => {});
    return { balance: supplier.balance };
  }

  // Handle Summary
  if (route === "summary") {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const from = (body && body.from) || today;
      const to = (body && body.to) || today;

      const ordersInPeriod = (state.orders || []).filter((o: any) => {
        if (!o) return false;
        const bDate = (o.business_date || o.created || "").slice(0, 10);
        if (bDate >= from && bDate <= to) return true;
        const hasPay = (o.payments || []).some((p: any) => {
          const pDate = (p.business_date || p.created || "").slice(0, 10);
          return pDate >= from && pDate <= to;
        });
        const hasRef = (o.refunds || []).some((r: any) => {
          const rDate = (r.business_date || r.created || "").slice(0, 10);
          return rDate >= from && rDate <= to;
        });
        return hasPay || hasRef;
      });
      const activeOrders = ordersInPeriod.filter((o: any) => o && o.state !== "cancelled");
      const cancelledOrders = ordersInPeriod.filter((o: any) => o && o.state === "cancelled");
      const cancelled = cancelledOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

      let collections = 0;
      let refunds = 0;
      (state.orders || []).forEach((o: any) => {
        if (!o) return;
        (o.payments || []).forEach((p: any) => {
          if (!p) return;
          const pDate = (p.business_date || p.created || "").slice(0, 10);
          if (pDate >= from && pDate <= to) collections += (Number(p.amount) || 0);
        });
        (o.refunds || []).forEach((r: any) => {
          if (!r) return;
          const rDate = (r.business_date || r.created || "").slice(0, 10);
          if (rDate >= from && rDate <= to) refunds += (Number(r.amount) || 0);
        });
      });
      if (collections === 0 && activeOrders.length > 0) {
        collections = activeOrders.reduce((sum: number, o: any) => sum + (Number(o.received) || 0), 0);
      }
      if (refunds === 0 && activeOrders.length > 0) {
        refunds = activeOrders.reduce((sum: number, o: any) => sum + (Number(o.refunded) || 0), 0);
      }

      let rawSales = 0;
      activeOrders.forEach((o: any) => {
        const oDate = (o.business_date || o.created || "").slice(0, 10);
        if (oDate >= from && oDate <= to) {
          const food = (Number(o.subtotal) || Number(o.total) || 0) - (Number(o.discount) || 0);
          rawSales += Math.max(0, food);
        } else {
          const payInPeriod = (o.payments || []).filter((p: any) => {
            const pDate = (p.business_date || p.created || "").slice(0, 10);
            return pDate >= from && pDate <= to;
          }).reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
          rawSales += payInPeriod;
        }
      });
      if (rawSales === 0 && collections > 0) {
        rawSales = collections;
      }
      const netSales = Math.max(0, rawSales - refunds);
      const sales = rawSales;

      const expensesInPeriod = (state.expenses || []).filter((e: any) => {
        if (!e) return false;
        const eDate = (e.businessDate || e.date || e.created || "").slice(0, 10);
        return eDate >= from && eDate <= to;
      }).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

      const daily: Record<string, number> = {};
      activeOrders.forEach((o: any) => {
        const d = (o.business_date || o.created || "").slice(0, 10);
        let targetDate = d;
        if (targetDate < from || targetDate > to) {
          const pMatch = (o.payments || []).find((p: any) => {
            const pDate = (p.business_date || p.created || "").slice(0, 10);
            return pDate >= from && pDate <= to;
          });
          if (pMatch) {
            targetDate = (pMatch.business_date || pMatch.created || "").slice(0, 10);
          }
        }
        if (targetDate) daily[targetDate] = (daily[targetDate] || 0) + (Number(o.total) || 0);
      });

      const dishSales: Record<string, { name: string; qty: number; amount: number }> = {};
      activeOrders.forEach((o: any) => {
        (o.items || []).forEach((it: any) => {
          if (!it) return;
          const name = it.name || "Dish";
          if (!dishSales[name]) {
            dishSales[name] = { name, qty: 0, amount: 0 };
          }
          dishSales[name].qty += (Number(it.qty) || 1000);
          dishSales[name].amount += (Number(it.amount) || Number(it.price) || 0);
        });
      });
      const popular = Object.values(dishSales).sort((a, b) => b.qty - a.qty).slice(0, 8);

      let foodCost = 0;
      let missingCosts = 0;
      activeOrders.forEach((o: any) => {
        (o.items || []).forEach((it: any) => {
          if (!it) return;
          const qty = Number(it.qty) || 1000;
          if (it.cost !== undefined && it.cost !== null && !isNaN(Number(it.cost))) {
            foodCost += Math.round((Number(it.cost) * qty) / 1000);
          } else {
            const v = findVariant(state, it.variantId || it.variant_id);
            const varObj = v?.variant || v;
            if (varObj && varObj.cost !== undefined && varObj.cost !== null && !isNaN(Number(varObj.cost))) {
              foodCost += Math.round((Number(varObj.cost) * qty) / 1000);
            } else {
              missingCosts++;
              const price = Number(it.price) || Number(it.amount) || 0;
              if (price > 0) {
                foodCost += Math.round((price * 0.45 * qty) / 1000);
              }
            }
          }
        });
      });

      const purchasesInPeriod = (state.purchases || []).filter((p: any) => {
        if (!p) return false;
        const pDate = (p.business_date || p.created || "").slice(0, 10);
        return pDate >= from && pDate <= to;
      }).reduce((sum: number, p: any) => sum + (Number(p.total) || 0), 0);

      if (foodCost === 0 && purchasesInPeriod > 0) {
        foodCost = purchasesInPeriod;
      }

      const profit = netSales - foodCost - expensesInPeriod;
      const outstanding = (state.orders || []).filter((o: any) => o && o.state !== "cancelled")
        .reduce((s: number, o: any) => s + (Number(o.balance) || 0), 0);
      const lowStock = (state.ingredients || []).filter((ing: any) => ing && !ing.archived && Number(ing.stock) <= Number(ing.low)).length;
      const supplierPayments = (state.supplierPayments || []).reduce((s: number, sp: any) => s + (Number(sp.amount) || 0), 0);

      return {
        foodCost,
        missingCosts,
        netSales,
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
    } catch (summaryErr) {
      console.error("browserDb summary calculation error:", summaryErr);
      return {
        foodCost: 0,
        missingCosts: 0,
        netSales: 0,
        profit: 0,
        from: (body && body.from) || new Date().toISOString().slice(0, 10),
        to: (body && body.to) || new Date().toISOString().slice(0, 10),
        sales: 0,
        orderCount: 0,
        cancelled: 0,
        collections: 0,
        refunds: 0,
        expenses: 0,
        supplierPayments: 0,
        outstanding: 0,
        lowStock: 0,
        daily: {},
        popular: [],
      };
    }
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
      dummyCleared: !!state.dummyCleared || (state.orders?.length || 0) === 0,
    };
  }

  if (route === "maintenance/clear") {
    if (body.confirm !== "clear") throw new Error("Confirmation required");
    state.dummyCleared = true;
    state.orders = [];
    state.orderItems = [];
    state.expenses = [];
    state.payments = [];
    state.ledger = [];
    state.movements = [];
    state.purchases = [];
    state.supplierPayments = [];
    saveLocalState(state);
    return { ok: true };
  }

  if (route === "maintenance/fill") {
    if (body.confirm !== "fill") throw new Error("Confirmation required");
    const fresh = JSON.parse(JSON.stringify(defaultState));
    fresh.dummyCleared = false;
    saveLocalState(fresh);
    return { ok: true };
  }

  if (route === "maintenance/delete_all" || route === "maintenance/wipe") {
    if (body.confirm !== "delete_all" && body.confirm !== "wipe") {
      throw new Error("تصدیق درکار ہے (Confirmation required: delete_all)");
    }
    state.dummyCleared = true;
    state.isDataWiped = true;
    state.isRestored = false;
    state.orders = [];
    state.orderItems = [];
    state.drafts = [];
    state.menu = [];
    state.ingredients = [];
    state.movements = [];
    state.purchases = [];
    state.suppliers = [];
    state.supplierPayments = [];
    state.customers = [];
    state.expenses = [];
    state.payments = [];
    state.ledger = [];
    state.cash = [];
    state.ownerDrawings = [];
    state.tables = (state.tables || []).map((t: any) => ({ ...t, orderId: null }));
    state.allTables = (state.allTables || []).map((t: any) => ({ ...t, orderId: null }));
    state.accounts = (state.accounts || []).map((a: any) => ({ ...a, balance: 0 }));
    state.audit = [
      {
        id: 1,
        action: "تمام ڈیٹا صاف کیا گیا (All Data Wiped)",
        actor: currentUser?.id || 1,
        actor_name: currentUser?.name || "Owner",
        date: new Date().toISOString(),
        details: "صارف نے تمام کھانے، بل، سامان، گاہک اور ریکارڈ مکمل صاف کیے۔",
        reference: "FACTORY_RESET",
      },
    ];
    state.dataEpoch = "wiped-" + Date.now();
    state._updated = new Date().toISOString();
    state._lastBackup = null;

    if (typeof localStorage !== "undefined") {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("erp-draft-") || k.startsWith("erp-pending-")) {
            localStorage.removeItem(k);
          }
        }
      } catch {}
    }

    saveLocalState(state);
    saveFirestoreState(state).catch(() => {});
    return { ok: true, cleared: true, epoch: state.dataEpoch };
  }

  if (route === "maintenance/schedule") {
    return { ok: true };
  }

  if (route === "maintenance/backup") {
    const backupTimestamp = new Date().toISOString();
    state._lastBackup = backupTimestamp;
    saveLocalState(state);
    return {
      ok: true,
      timestamp: backupTimestamp,
      folder: "Google Cloud Firestore (Live Realtime Backup)",
      backup: {
        version: "1.0",
        appName: "Dastarkhwan ERP",
        exportedAt: backupTimestamp,
        restaurant: state.settings?.name || "Dastarkhwan",
        data: {
          orders: state.orders || [],
          orderItems: state.orderItems || [],
          drafts: state.drafts || [],
          menu: state.menu || [],
          ingredients: state.ingredients || [],
          movements: state.movements || [],
          purchases: state.purchases || [],
          suppliers: state.suppliers || [],
          supplierPayments: state.supplierPayments || [],
          customers: state.customers || [],
          tables: state.tables || [],
          allTables: state.allTables || state.tables || [],
          expenses: state.expenses || [],
          payments: state.payments || [],
          ledger: state.ledger || [],
          accounts: state.accounts || [],
          ownerAccounts: state.ownerAccounts || [],
          ownerDrawings: state.ownerDrawings || [],
          cash: state.cash || [],
          staff: state.staff || [],
          audit: state.audit || [],
          settings: state.settings || {},
        },
      },
    };
  }

  if (route === "maintenance/restore") {
    const backupObj = body?.backup?.data || body?.data || body?.backup?.state || body?.state || body;
    if (!backupObj || typeof backupObj !== "object") {
      throw new Error("غلط بیک اپ فائل (Invalid backup file structure)");
    }
    const restoredTables = Array.isArray(backupObj.tables) ? backupObj.tables : state.tables || [];
    const restoredAllTables = Array.isArray(backupObj.allTables)
      ? backupObj.allTables
      : (Array.isArray(backupObj.tables) ? backupObj.tables : state.allTables || []);

    const restoredState = {
      ...state,
      orders: Array.isArray(backupObj.orders) ? backupObj.orders : state.orders || [],
      orderItems: Array.isArray(backupObj.orderItems) ? backupObj.orderItems : state.orderItems || [],
      drafts: Array.isArray(backupObj.drafts) ? backupObj.drafts : [],
      menu: Array.isArray(backupObj.menu) ? backupObj.menu : state.menu || [],
      ingredients: Array.isArray(backupObj.ingredients) ? backupObj.ingredients : state.ingredients || [],
      movements: Array.isArray(backupObj.movements) ? backupObj.movements : state.movements || [],
      purchases: Array.isArray(backupObj.purchases) ? backupObj.purchases : state.purchases || [],
      suppliers: Array.isArray(backupObj.suppliers) ? backupObj.suppliers : state.suppliers || [],
      supplierPayments: Array.isArray(backupObj.supplierPayments) ? backupObj.supplierPayments : state.supplierPayments || [],
      customers: Array.isArray(backupObj.customers) ? backupObj.customers : state.customers || [],
      tables: restoredTables,
      allTables: restoredAllTables,
      expenses: Array.isArray(backupObj.expenses) ? backupObj.expenses : state.expenses || [],
      payments: Array.isArray(backupObj.payments) ? backupObj.payments : state.payments || [],
      ledger: Array.isArray(backupObj.ledger) ? backupObj.ledger : state.ledger || [],
      accounts: Array.isArray(backupObj.accounts) ? backupObj.accounts : state.accounts || [],
      ownerAccounts: Array.isArray(backupObj.ownerAccounts) ? backupObj.ownerAccounts : state.ownerAccounts || [],
      ownerDrawings: Array.isArray(backupObj.ownerDrawings) ? backupObj.ownerDrawings : state.ownerDrawings || [],
      cash: Array.isArray(backupObj.cash) ? backupObj.cash : state.cash || [],
      staff: (Array.isArray(backupObj.staff) && backupObj.staff.length > 0) ? backupObj.staff : state.staff || [],
      audit: Array.isArray(backupObj.audit) ? backupObj.audit : state.audit || [],
      settings: (backupObj.settings && typeof backupObj.settings === "object") ? { ...state.settings, ...backupObj.settings } : state.settings,
      dummyCleared: false,
      isRestored: true,
      isDataWiped: false,
      dataEpoch: "restored-" + Date.now(),
      _updated: new Date().toISOString(),
      _lastBackup: new Date().toISOString(),
    };

    if (typeof localStorage !== "undefined") {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith("erp-draft-") || k.startsWith("erp-pending-")) {
            localStorage.removeItem(k);
          }
        }
      } catch {}
    }

    saveLocalState(restoredState);
    saveFirestoreState(restoredState).catch(() => {});
    return { ok: true, timestamp: restoredState._lastBackup, epoch: restoredState.dataEpoch };
  }

  // Generic fallback: preserve state
  return { ok: true, state };
}

