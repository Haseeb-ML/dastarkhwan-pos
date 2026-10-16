import { readFileSync } from "fs";

const API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const BASE_URL = "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents";

const state = JSON.parse(readFileSync("./src/initialState.json", "utf8"));

async function saveDoc(collection, docId, data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else fields[k] = { stringValue: JSON.stringify(v) };
  }
  const url = `${BASE_URL}/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  const json = await res.json();
  return json.name ? true : false;
}

async function main() {
  console.log("Seeding orders...");
  for (const o of (state.orders || []).slice(0, 10)) {
    await saveDoc("orders", o.number || `ORD-${o.id}`, {
      id: o.id,
      number: o.number,
      total: o.total,
      balance: o.balance,
      place: o.place,
      service: o.service,
      state: o.state,
      created: o.created,
      items: o.items,
    });
  }

  console.log("Seeding customers...");
  for (const c of (state.customers || [])) {
    await saveDoc("customers", `CUST-${c.id}`, {
      id: c.id,
      name: c.name,
      phone: c.phone,
      address: c.address || "",
      note: c.note || "",
    });
  }

  console.log("Seeding menu...");
  for (const m of (state.menu || []).slice(0, 10)) {
    await saveDoc("menu", `DISH-${m.id}`, {
      id: m.id,
      name: m.name,
      category: m.category,
      available: m.available,
    });
  }

  console.log("Seeding master state...");
  await saveDoc("restaurant", "state", {
    updated: new Date().toISOString(),
    stateJson: JSON.stringify(state),
    orderCount: (state.orders || []).length,
    customerCount: (state.customers || []).length,
  });

  console.log("Seeding complete!");
}

main().catch(console.error);
