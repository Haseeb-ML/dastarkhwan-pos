// @ts-nocheck
const FIRESTORE_API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const FIRESTORE_DOC_URL =
  "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents/restaurant/state?key=" +
  FIRESTORE_API_KEY;

export async function fetchFirestoreState(): Promise<any | null> {
  try {
    const res = await fetch(FIRESTORE_DOC_URL);
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json.fields?.stateJson?.stringValue;
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Firestore fetch error:", e);
  }
  return null;
}

export async function saveFirestoreState(state: any): Promise<boolean> {
  try {
    const payload = {
      fields: {
        stateJson: { stringValue: JSON.stringify(state) },
        updated: { stringValue: new Date().toISOString() },
        orderCount: { integerValue: String(state.orders?.length || 0) },
      },
    };
    const res = await fetch(FIRESTORE_DOC_URL, {
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
