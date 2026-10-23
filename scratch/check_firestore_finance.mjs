const FIRESTORE_API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const FIRESTORE_BASE = "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents";

async function check() {
  const url = `${FIRESTORE_BASE}/restaurant/state?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.log("Firestore response not OK:", res.status);
    return;
  }
  const json = await res.json();
  const raw = json.fields?.stateJson?.stringValue;
  if (!raw) {
    console.log("No stateJson found in Firestore!");
    return;
  }
  const state = JSON.parse(raw);
  console.log("--- Firestore Current Live State ---");
  console.log("Accounts count:", state.accounts ? state.accounts.length : "None");
  console.log("Owner Accounts count:", state.ownerAccounts ? state.ownerAccounts.length : "None");
  console.log("Owner Drawings count:", state.ownerDrawings ? state.ownerDrawings.length : "None");
  console.log("Expenses count:", state.expenses ? state.expenses.length : "None");
  console.log("Orders count:", state.orders ? state.orders.length : "None");
  console.log("\nAccounts list:", JSON.stringify(state.accounts || [], null, 2));
  console.log("\nOwner Accounts list:", JSON.stringify(state.ownerAccounts || [], null, 2));
  console.log("\nOwner Drawings list:", JSON.stringify(state.ownerDrawings || [], null, 2));
}

check();
