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

export async function deleteDishFromFirestore(id: number) {
  try {
    const docId = `DISH-${id}`;
    const url = `${FIRESTORE_BASE}/menu/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete dish from Firestore:", e);
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
          date: exp.created || (exp.date && exp.date.length > 10 ? exp.date : null) || exp.date || exp.business_date || new Date().toISOString(),
          created: exp.created || new Date().toISOString(),
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
    console.warn("Firestore fetch error:", e);
  }
  return null;
}

export async function syncIngredientToFirestore(ing: any) {
  try {
    const docId = `ING-${ing.id}`;
    const url = `${FIRESTORE_BASE}/ingredients/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: ing.id,
          name: ing.name,
          unit: ing.unit,
          low: ing.low || 0,
          stock: ing.stock || 0,
          archived: ing.archived || 0,
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync ingredient to Firestore:", e);
  }
}

export async function deleteIngredientFromFirestore(id: number) {
  try {
    const docId = `ING-${id}`;
    const url = `${FIRESTORE_BASE}/ingredients/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete ingredient from Firestore:", e);
  }
}

export async function syncSupplierToFirestore(supplier: any) {
  try {
    const docId = `SUP-${supplier.id}`;
    const url = `${FIRESTORE_BASE}/suppliers/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone || "",
          balance: supplier.balance || 0,
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync supplier to Firestore:", e);
  }
}

export async function syncPurchaseToFirestore(purchase: any) {
  try {
    const docId = `PUR-${purchase.id}`;
    const url = `${FIRESTORE_BASE}/purchases/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: purchase.id,
          supplier_id: purchase.supplier_id,
          total: purchase.total,
          itemsCount: (purchase.items || []).length,
          itemsJson: JSON.stringify(purchase.items || []),
          created: purchase.created || new Date().toISOString(),
          business_date: purchase.business_date || new Date().toISOString().slice(0, 10),
          actor: purchase.actor || 1,
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync purchase to Firestore:", e);
  }
}

export async function syncStockMovementToFirestore(movement: any) {
  try {
    const docId = `MOV-${movement.id}`;
    const url = `${FIRESTORE_BASE}/stock_movements/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: movement.id,
          ingredient_id: movement.ingredient_id,
          qty: movement.qty,
          kind: movement.kind,
          reference: movement.reference || "",
          reason: movement.reason || "",
          created: movement.created || new Date().toISOString(),
          actor: movement.actor || 1,
          actor_name: movement.actor_name || "",
          name: movement.name || "",
          unit: movement.unit || "",
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync stock movement to Firestore:", e);
  }
}

export async function syncSupplierPaymentToFirestore(pay: any) {
  try {
    const docId = `SPAY-${pay.id}`;
    const url = `${FIRESTORE_BASE}/supplier_payments/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: pay.id,
          supplier_id: pay.supplier_id,
          purchase_id: pay.purchase_id || 0,
          amount: pay.amount,
          method: pay.method || "Cash",
          created: pay.created || new Date().toISOString(),
          business_date: pay.business_date || new Date().toISOString().slice(0, 10),
          actor: pay.actor || 1,
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync supplier payment to Firestore:", e);
  }
}

export async function syncAccountToFirestore(account: any) {
  try {
    const docId = `ACC-${account.id}`;
    const url = `${FIRESTORE_BASE}/accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: account.id,
          code: account.code || "1090",
          name: account.name || account.english || "",
          english: account.english || account.name || "",
          category: account.category || "Assets",
          openingBalance: account.openingBalance || 0,
          description: account.description || "",
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync account to Firestore:", e);
  }
}

export async function deleteAccountFromFirestore(id: number) {
  try {
    const docId = `ACC-${id}`;
    const url = `${FIRESTORE_BASE}/accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete account from Firestore:", e);
  }
}

export async function syncOwnerAccountToFirestore(acc: any) {
  try {
    const docId = `OWN-${acc.id}`;
    const url = `${FIRESTORE_BASE}/owner_accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: acc.id,
          name: acc.name,
          sharePercentage: acc.sharePercentage ?? 100,
          openingBalance: acc.openingBalance || 0,
          phone: acc.phone || "",
          description: acc.description || "",
          created: acc.created || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync owner account to Firestore:", e);
  }
}

export async function deleteOwnerAccountFromFirestore(id: number) {
  try {
    const docId = `OWN-${id}`;
    const url = `${FIRESTORE_BASE}/owner_accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete owner account from Firestore:", e);
  }
}

export async function syncOwnerDrawingToFirestore(drawing: any) {
  try {
    const docId = `ODRAW-${drawing.id}`;
    const url = `${FIRESTORE_BASE}/owner_drawings/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: drawing.id,
          ownerAccountId: drawing.ownerAccountId || 1,
          type: drawing.type || "draw",
          amount: drawing.amount || 0,
          method: drawing.method || "Cash",
          note: drawing.note || "",
          date: drawing.date || new Date().toISOString(),
          created: drawing.created || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync owner drawing to Firestore:", e);
  }
}

export async function deleteOwnerDrawingFromFirestore(id: number) {
  try {
    const docId = `ODRAW-${id}`;
    const url = `${FIRESTORE_BASE}/owner_drawings/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete owner drawing from Firestore:", e);
  }
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
        ingredientCount: { integerValue: String(state.ingredients?.length || 0) },
        supplierCount: { integerValue: String(state.suppliers?.length || 0) },
        purchaseCount: { integerValue: String(state.purchases?.length || 0) },
        accountCount: { integerValue: String(state.accounts?.length || 0) },
        ownerAccountCount: { integerValue: String(state.ownerAccounts?.length || 0) },
        ownerDrawingCount: { integerValue: String(state.ownerDrawings?.length || 0) },
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

export async function syncImageToFirestore(id: string, dataUrl: string, kind: string = "dish") {
  try {
    const docId = `IMG-${id}`;
    const url = `${FIRESTORE_BASE}/images/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id,
          dataUrl,
          kind,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
  } catch (e) {
    console.warn("Failed to sync image to Firestore:", e);
  }
}

export async function deleteImageFromFirestore(id: string) {
  try {
    const docId = `IMG-${id}`;
    const url = `${FIRESTORE_BASE}/images/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(url, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete image from Firestore:", e);
  }
}




export async function syncStaffToFirestore(user: any) {
  try {
    const docId = user.docId || `user_${(user.username || user.id || 'staff').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const payload = {
      fields: toFirestoreFields({
        id: user.id,
        name: user.name,
        username: (user.username || '').toLowerCase(),
        role: user.role || 'Cashier',
        password: user.password || '123456',
        active: user.active ?? 1,
        updated: new Date().toISOString(),
      }),
    };

    // Save to users collection
    const usersUrl = `${FIRESTORE_BASE}/users/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(usersUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Also mirror to staff collection
    const staffUrl = `${FIRESTORE_BASE}/staff/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(staffUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.warn("Failed to sync staff user to Firestore:", e);
  }
}

export async function deleteStaffFromFirestore(docId: string) {
  try {
    await fetch(`${FIRESTORE_BASE}/users/${docId}?key=${FIRESTORE_API_KEY}`, { method: "DELETE" });
    await fetch(`${FIRESTORE_BASE}/staff/${docId}?key=${FIRESTORE_API_KEY}`, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete staff from Firestore:", e);
  }
}
