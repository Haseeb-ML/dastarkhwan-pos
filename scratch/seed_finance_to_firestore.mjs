const FIRESTORE_API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const FIRESTORE_BASE = "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents";

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number")
      fields[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else fields[k] = { stringValue: JSON.stringify(v) };
  }
  return fields;
}

async function seedFinance() {
  console.log("1. Fetching current Firestore live state...");
  const url = `${FIRESTORE_BASE}/restaurant/state?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Failed to fetch state:", res.status);
    return;
  }
  const json = await res.json();
  const raw = json.fields?.stateJson?.stringValue;
  if (!raw) {
    console.error("No stateJson found!");
    return;
  }
  const state = JSON.parse(raw);

  // 1. Sync accounts to /accounts/
  console.log("2. Syncing Accounts to /accounts collection...");
  for (const acc of state.accounts || []) {
    const docId = `ACC-${acc.id}`;
    const pUrl = `${FIRESTORE_BASE}/accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(pUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: acc.id,
          code: acc.code || "1090",
          name: acc.name || acc.english || "",
          english: acc.english || acc.name || "",
          category: acc.category || "Assets",
          openingBalance: acc.openingBalance || 0,
          description: acc.description || "",
          updated: new Date().toISOString(),
        }),
      }),
    });
    console.log(`  ✔ Synced Account: ${acc.name} (${docId})`);
  }

  // 2. Sync ownerAccounts to /owner_accounts/
  console.log("3. Syncing Owner Accounts to /owner_accounts collection...");
  for (const oacc of state.ownerAccounts || []) {
    const docId = `OWN-${oacc.id}`;
    const pUrl = `${FIRESTORE_BASE}/owner_accounts/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(pUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: oacc.id,
          name: oacc.name,
          sharePercentage: oacc.sharePercentage ?? 100,
          openingBalance: oacc.openingBalance || 0,
          phone: oacc.phone || "",
          description: oacc.description || "",
          created: oacc.created || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
    console.log(`  ✔ Synced Owner Account: ${oacc.name} (${docId})`);
  }

  // 3. Sync ownerDrawings to /owner_drawings/
  console.log("4. Syncing Owner Drawings to /owner_drawings collection...");
  for (const odraw of state.ownerDrawings || []) {
    const docId = `ODRAW-${odraw.id}`;
    const pUrl = `${FIRESTORE_BASE}/owner_drawings/${docId}?key=${FIRESTORE_API_KEY}`;
    await fetch(pUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: toFirestoreFields({
          id: odraw.id,
          ownerAccountId: odraw.ownerAccountId || 1,
          type: odraw.type || "draw",
          amount: odraw.amount || 0,
          method: odraw.method || "Cash",
          note: odraw.note || "",
          date: odraw.date || new Date().toISOString(),
          created: odraw.created || new Date().toISOString(),
          updated: new Date().toISOString(),
        }),
      }),
    });
    console.log(`  ✔ Synced Owner Drawing/Deposit: ${odraw.type} ${odraw.amount / 100} PKR (${docId})`);
  }

  console.log("\nAll Finance & Accounts data successfully synced to dedicated Firebase collections!");
}

seedFinance();
