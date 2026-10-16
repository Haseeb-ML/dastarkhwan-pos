// @ts-nocheck
import defaultState from "./initialState.json";
import { fetchFirestoreState, saveFirestoreState } from "./firestoreSync";

const DB_KEY = "dastarkhwan_standalone_db";
const USER_KEY = "dastarkhwan_current_user";

export function getLocalState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read standalone state:", e);
  }
  saveLocalState(defaultState);
  return JSON.parse(JSON.stringify(defaultState));
}

export function saveLocalState(state: any) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
    // Sync to Cloud Firestore in background
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
      database: "Standalone / Cloud Storage",
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

    return {
      ...state,
      user: currentUser,
      dataEpoch: state.dataEpoch || "standalone-1",
    };
  }

  // Handle Order creation & updates
  if (route === "order" || route === "orders/create") {
    const orderData = body;
    const nextId = (state.orders?.length ? Math.max(...state.orders.map((o: any) => o.id || 0)) : 0) + 1;
    const orderNumber = `INV-${String(nextId).padStart(6, "0")}`;

    const items = (orderData.items || []).map((it: any, idx: number) => {
      const price = Number(it.price || 0);
      const qty = Number(it.qty || 1000);
      const amount = Math.round((price * qty) / 1000);
      return {
        id: nextId * 100 + idx,
        order_id: nextId,
        variant_id: it.variantId || it.variant_id || 1,
        name: it.name || "Custom Item",
        variant: it.variant || "Standard",
        unit: it.unit || "portion",
        qty,
        price,
        amount,
        note: it.note || "",
        batch: 1,
        cost: null,
      };
    });

    const subtotal = items.reduce((acc: number, it: any) => acc + it.amount, 0);
    const discount = Number(orderData.discount || 0);
    const total = Math.max(0, subtotal - discount);

    let place = "Takeaway";
    if (orderData.service === "Dine-in") {
      const table = state.tables.find((t: any) => String(t.id) === String(orderData.tableId));
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
      tax_bps: 0,
      service_bps: 0,
      reason: null,
      preparation: null,
      items,
      subtotal,
      tax: 0,
      serviceCharge: 0,
      total,
      restaurant: state.settings,
      place,
      customer: orderData.deliveryName ? { name: orderData.deliveryName, phone: orderData.deliveryPhone, address: orderData.deliveryAddress } : null,
      taxBps: 0,
      serviceBps: 0,
      orderId: nextId,
      invoiceId: nextId,
      revision: 1,
      received: 0,
      refunded: 0,
      net: 0,
      collectible: total,
      balance: total,
      refundStatus: null,
      paymentStatus: "Unpaid",
      payments: [],
      refunds: [],
      change: 0,
      tickets: [{ id: nextId * 10, order_id: nextId, batch: 1, created: new Date().toISOString(), state: "New" }],
      revisions: [{ revision: 1, created: new Date().toISOString() }],
    };

    // Update table status
    if (createdOrder.table_id) {
      state.tables = state.tables.map((t: any) =>
        t.id === createdOrder.table_id ? { ...t, orderId: nextId } : t
      );
    }

    // If editing existing held or open order, remove previous
    if (orderData.editId) {
      state.orders = state.orders.filter((o: any) => o.id !== orderData.editId);
    }

    state.orders = [createdOrder, ...(state.orders || [])];
    saveLocalState(state);
    return createdOrder;
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
      lastBackup: "Browser Local Storage (Cloud Mode)",
      demoAvailable: true,
    };
  }

  // Generic fallback: preserve state
  return { ok: true, state };
}
