import fs from "node:fs";

const FIRESTORE_API_KEY = "AIzaSyClV6nJvgoFdS6il18CJj3wWuysPdehRww";
const FIRESTORE_BASE = "https://firestore.googleapis.com/v1/projects/dastarkhwanerp/databases/(default)/documents";

async function testRender() {
  console.log("Fetching live data from Firestore...");
  const url = `${FIRESTORE_BASE}/restaurant/state?key=${FIRESTORE_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  const raw = json.fields?.stateJson?.stringValue;
  const data = JSON.parse(raw);

  console.log("Data loaded. Testing ownerAccounts useMemo...");
  const today = new Date().toISOString().slice(0, 10);
  const isUrdu = true;
  const fromDate = "";
  const toDate = "";
  const selectedOwnerId = "all";

  let ownerAccounts;
  if (data?.ownerAccounts && Array.isArray(data.ownerAccounts) && data.ownerAccounts.length > 0) {
    ownerAccounts = data.ownerAccounts;
  } else {
    ownerAccounts = [
      {
        id: 1,
        name: data?.settings?.ownerName || (isUrdu ? "مرکزی مالک" : "Main Owner"),
        sharePercentage: 100,
        openingBalance: 0,
        description: "Primary Account",
        created: today,
      },
    ];
  }
  console.log("ownerAccounts:", ownerAccounts);

  console.log("Testing ownerStats computation...");
  let periodRevenue = 0;
  let allTimeRevenue = 0;
  (data.orders || []).forEach((o) => {
    if (o.state === "cancelled") return;
    const amt = Number(o.total || 0);
    const oDate = (o.created || o.business_date || today).slice(0, 10);
    allTimeRevenue += amt;
    if ((!fromDate || oDate >= fromDate) && (!toDate || oDate <= toDate)) {
      periodRevenue += amt;
    }
  });

  let periodPurchases = 0;
  let allTimePurchases = 0;
  (data.purchases || []).forEach((p) => {
    const amt = Number(p.total || 0);
    const pDate = (p.created || p.business_date || today).slice(0, 10);
    allTimePurchases += amt;
    if ((!fromDate || pDate >= fromDate) && (!toDate || pDate <= toDate)) {
      periodPurchases += amt;
    }
  });

  let periodExpenses = 0;
  let allTimeExpenses = 0;
  (data.expenses || []).forEach((e) => {
    const amt = Number(e.amount || 0);
    const eDate = (e.created || (e.date && e.date.length > 10 ? e.date : null) || e.businessDate || e.date || today).slice(0, 10);
    allTimeExpenses += amt;
    if ((!fromDate || eDate >= fromDate) && (!toDate || eDate <= toDate)) {
      periodExpenses += amt;
    }
  });

  const periodNetProfit = periodRevenue - periodPurchases - periodExpenses;
  const allTimeNetProfit = allTimeRevenue - allTimePurchases - allTimeExpenses;

  const allOwnerRecords = (data.ownerDrawings || []).map((od) => {
    const ownerId = Number(od.ownerAccountId || 1);
    const acc = ownerAccounts.find((a) => a.id === ownerId);
    return {
      ...od,
      ownerAccountId: ownerId,
      ownerName: acc?.name || (isUrdu ? "مالک" : "Owner"),
      numericAmount: Number(od.amount || 0),
      rawDate: od.created || (od.date && od.date.length > 10 ? od.date : null) || od.businessDate || od.date || today,
    };
  });

  console.log("allOwnerRecords count:", allOwnerRecords.length);

  const ownerBalancesMap = {};
  let allOwnersTotalBalance = 0;

  ownerAccounts.forEach((acc) => {
    const ratio = (Number(acc.sharePercentage) || 100) / 100;
    const allocProfit = Math.round(allTimeNetProfit * ratio);
    let drawings = 0;
    let deposits = 0;
    allOwnerRecords.forEach((od) => {
      if (od.ownerAccountId === acc.id) {
        if (od.type === "draw") drawings += od.numericAmount;
        else deposits += od.numericAmount;
      }
    });
    const bal = allocProfit + deposits - drawings + Number(acc.openingBalance || 0);
    ownerBalancesMap[acc.id] = bal;
    allOwnersTotalBalance += bal;
  });

  console.log("ownerBalancesMap:", ownerBalancesMap);
  console.log("allOwnersTotalBalance:", allOwnersTotalBalance);

  console.log("✔ ownerStats computed successfully!");
}

testRender().catch(console.error);
