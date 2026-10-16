// @ts-nocheck
const FIRESTORE_API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const FIRESTORE_BASE =
  "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents";

function toFirestoreFields(obj: any) {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number")
      fields[k] = Number.isInteger(v)
        ? { integerValue: String(v) }
        : { doubleValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else fields[k] = { stringValue: JSON.stringify(v) };
  }
  return fields;
}

export async function syncOrderToFirestore(order: any) {
  try {
    const docId = order.number || `ORD-${order.id}`;
    const url = `${FIRESTORE_BASE}/orders/${docId}?key=${FIRESTORE_API_KEY}`;
    
    let custName = "";
    let custPhone = "";
    if (order.customer && typeof order.customer === "object") {
      custName = order.customer.name || "";
      custPhone = order.customer.phone || "";
    } else if (typeof order.customer_snapshot === "string") {
      try {
        const snap = JSON.parse(order.customer_snapshot);
        custName = snap.name || "";
        custPhone = snap.phone || "";
      } catch {}
    }

    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: order.id,
          number: order.number || `INV-${String(order.id).padStart(6, "0")}`,
          service: order.service || "Dine-in",
          place: order.place || "",
          state: order.state || "open",
          paymentStatus: order.paymentStatus || (order.balance === 0 ? "Paid" : "Unpaid"),
          subtotal: order.subtotal || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          balance: order.balance !== undefined ? order.balance : (order.total || 0),
          customerName: custName,
          customerPhone: custPhone,
          itemsCount: (order.items || []).length,
          itemsJson: JSON.stringify(order.items || []),
          paymentsJson: JSON.stringify(order.payments || []),
          created: order.created || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync order to Firestore:", e);
  }
}

export async function syncCustomerToFirestore(cust: any) {
  try {
    const docId = `CUST-${cust.id}`;
    const url = `${FIRESTORE_BASE}/customers/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: cust.id,
          name: cust.name,
          phone: cust.phone,
          address: cust.address || "",
          city: cust.city || "",
          note: cust.note || "",
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync customer to Firestore:", e);
  }
}

export async function syncMenuDishToFirestore(dish: any) {
  try {
    const docId = `DISH-${dish.id}`;
    const url = `${FIRESTORE_BASE}/menu/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: dish.id,
          name: dish.name,
          category: dish.category || "General",
          available: dish.available ? true : false,
          image: dish.image || "",
          variantsJson: JSON.stringify(dish.variants || []),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync dish to Firestore:", e);
  }
}

export async function syncExpenseToFirestore(exp: any) {
  try {
    const docId = `EXP-${exp.id}`;
    const url = `${FIRESTORE_BASE}/expenses/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: exp.id,
          category: exp.category || "Expense",
          amount: exp.amount || 0,
          note: exp.note || "",
          date: exp.date || exp.business_date || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync expense to Firestore:", e);
  }
}

export async function fetchFirestoreState(): Promise<any | null> {
  try {
    const url = `${FIRESTORE_BASE}/restaurant/state?key=${FIRESTORE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json.fields?.stateJson?.stringValue;
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed._firestoreUpdated = json.fields?.updated?.stringValue || "";
      return parsed;
    }
  } catch (e) {
    console.warn("Firestore fetch error:", e);
  }
  return null;
}

export async function saveFirestoreState(state: any): Promise<boolean> {
  try {
    const url = `${FIRESTORE_BASE}/restaurant/state?key=${FIRESTORE_API_KEY}`;
    const payload = {
      fields: {
        stateJson: { stringValue: JSON.stringify(state) },
        updated: { stringValue: new Date().toISOString() },
        orderCount: { integerValue: String(state.orders?.length || 0) },
        customerCount: { integerValue: String(state.customers?.length || 0) },
        menuCount: { integerValue: String(state.menu?.length || 0) },
      },
    };
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (e) {
    console.warn("Firestore save error:", e);
    return false;
  }
}
