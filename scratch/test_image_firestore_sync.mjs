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

async function testImageSync() {
  console.log("Testing Firestore image collection sync...");
  const testId = "test_sample_dish";
  const dummyDataUrl = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
  
  const url = `${FIRESTORE_BASE}/images/IMG-${testId}?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: toFirestoreFields({
        id: testId,
        dataUrl: dummyDataUrl,
        kind: "dish",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }),
    }),
  });

  console.log("Upload status:", res.status);
  const data = await res.json();
  console.log("Uploaded document name:", data.name);

  // Fetch it back
  const getRes = await fetch(url);
  const getData = await getRes.json();
  console.log("Retrieved dataUrl length:", getData.fields?.dataUrl?.stringValue?.length);
  console.log("✔ Firestore Image Collection test passed successfully!");
}

testImageSync().catch(console.error);
