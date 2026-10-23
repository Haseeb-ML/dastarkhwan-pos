import test from 'node:test';
import assert from 'node:assert/strict';
import { openERP } from '../erp.mjs';
import { dataManagement } from '../data_management.mjs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Setup mock browser localStorage environment to also test browserDb logic
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
  get length() { return storage.size; },
  key: (i) => Array.from(storage.keys())[i] || null,
};
globalThis.window = {
  location: { hostname: "localhost", protocol: "http:" },
};
// Mock fetch for Firestore so offline tests don't fail on network
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({ ok: true }),
  headers: { get: () => "application/json" },
});

// Import browserDb after mock is established
const { handleStandaloneRequest, getLocalState, saveLocalState, setCurrentUser } = await import('../browserDb.ts');

test('Data Management Backend (SQLite): Export, Delete All Data, and Restore', () => {
  const root = mkdtempSync(join(tmpdir(), 'dastarkhwan-backup-test-'));
  const file = join(root, 'test.sqlite');
  let app = openERP(file, { seed: true });
  const owner = app.one("SELECT * FROM users WHERE role='Owner'");
  const cashier = app.one("SELECT * FROM users WHERE role='Cashier'");
  const m = dataManagement(app, { root });

  // Verify access control
  assert.throws(() => m.handle('maintenance/delete_all', { confirm: 'delete_all' }, cashier), /Access restricted/);
  assert.throws(() => m.handle('maintenance/delete_all', {}, owner), /Confirmation required/);

  // 1. Test Export (maintenance/backup)
  const backupRes = m.handle('maintenance/backup', {}, owner);
  assert.equal(backupRes.ok, true);
  assert(backupRes.backup, 'backup object should be returned');
  assert.equal(backupRes.backup.appName, 'Dastarkhwan ERP');
  assert(Array.isArray(backupRes.backup.data.menu), 'menu should be present in exported data');
  assert(backupRes.backup.data.menu.length > 0, 'menu should contain items');
  const initialMenuCount = backupRes.backup.data.menu.length;

  // 2. Test Delete All Data (maintenance/delete_all)
  const wipeRes = m.handle('maintenance/delete_all', { confirm: 'delete_all' }, owner);
  assert.equal(wipeRes.ok, true);

  // All menu items and orders must now be 0
  assert.equal(app.all('SELECT * FROM menu').length, 0);
  assert.equal(app.all('SELECT * FROM orders').length, 0);
  assert.equal(app.all('SELECT * FROM customers').length, 0);

  // 3. Test Restore (maintenance/restore)
  assert.throws(() => m.handle('maintenance/restore', {}, owner), /Invalid backup data/);
  const restoreRes = m.handle('maintenance/restore', { data: backupRes.backup.data }, owner);
  assert.equal(restoreRes.ok, true);

  // Verification after restore
  const restoredMenu = app.all('SELECT * FROM menu');
  assert.equal(restoredMenu.length, initialMenuCount, 'Restored menu count matches backup');

  app.db.close();
});

test('Standalone Browser DB: Full Backup Export, Delete All Data, and Restore Round-Trip', () => {
  // Set current logged in user as Owner
  setCurrentUser({ id: 1, name: "Owner", role: "Owner", username: "owner" });

  // Get initial state
  const initial = getLocalState();
  assert(Array.isArray(initial.menu) && initial.menu.length > 0, "Initial menu should not be empty");

  // Add dummy test order to ensure state has orders
  initial.orders = initial.orders || [];
  initial.orders.push({
    id: 9999,
    number: "ORD-9999",
    total: 250000,
    balance: 0,
    state: "closed",
    items: [],
  });
  saveLocalState(initial);

  // 1. TEST EXPORT (maintenance/backup)
  const backupExport = handleStandaloneRequest("maintenance/backup");
  assert.equal(backupExport.ok, true);
  assert(backupExport.backup, "Backup payload must be generated");
  assert.equal(backupExport.backup.appName, "Dastarkhwan ERP");
  assert(backupExport.backup.data.orders.some(o => o.id === 9999), "Export includes our order");
  assert(backupExport.backup.data.menu.length > 0, "Export includes menu items");
  assert(backupExport.backup.data.ingredients.length > 0, "Export includes ingredients");
  assert(Array.isArray(backupExport.backup.data.allTables), "Export includes allTables");

  const exportedData = backupExport.backup.data;
  const exportedDishesCount = exportedData.menu.length;
  const exportedIngredientsCount = exportedData.ingredients.length;

  // 2. TEST DELETE ALL DATA (maintenance/delete_all)
  // Rejection without confirmation
  assert.throws(() => {
    handleStandaloneRequest("maintenance/delete_all", {});
  }, /Confirmation required/);

  // Execution with confirmation
  const wipeResult = handleStandaloneRequest("maintenance/delete_all", { confirm: "delete_all" });
  assert.equal(wipeResult.ok, true);
  assert.equal(wipeResult.cleared, true);

  // Check wiped state
  const stateAfterWipe = getLocalState();
  assert.equal(stateAfterWipe.orders.length, 0, "Orders must be 0 after delete all");
  assert.equal(stateAfterWipe.menu.length, 0, "Menu dishes must be 0 after delete all");
  assert.equal(stateAfterWipe.ingredients.length, 0, "Ingredients must be 0 after delete all");
  assert.equal(stateAfterWipe.customers.length, 0, "Customers must be 0 after delete all");
  assert.equal(stateAfterWipe.suppliers.length, 0, "Suppliers must be 0 after delete all");
  assert.equal(stateAfterWipe.expenses.length, 0, "Expenses must be 0 after delete all");
  assert.equal(stateAfterWipe.isDataWiped, true, "isDataWiped flag must be true");
  assert.equal(stateAfterWipe.dummyCleared, true, "dummyCleared flag must be true");

  // Verify that reloading local state preserves the wiped empty state without reviving defaultState
  const reloadedWipedState = getLocalState();
  assert.equal(reloadedWipedState.menu.length, 0, "Reloading does NOT re-inject seed data");
  assert.equal(reloadedWipedState.orders.length, 0, "Reloading does NOT re-inject orders");

  // 3. TEST RESTORE (maintenance/restore)
  assert.throws(() => {
    handleStandaloneRequest("maintenance/restore", { data: "invalid_string" });
  }, /Invalid backup/);

  const restoreResult = handleStandaloneRequest("maintenance/restore", {
    data: exportedData,
  });
  assert.equal(restoreResult.ok, true);

  // Check restored state
  const stateAfterRestore = getLocalState();
  assert.equal(stateAfterRestore.menu.length, exportedDishesCount, "Menu dishes restored exactly");
  assert.equal(stateAfterRestore.ingredients.length, exportedIngredientsCount, "Ingredients restored exactly");
  assert(stateAfterRestore.orders.some(o => o.id === 9999), "Order 9999 restored");
  assert.equal(stateAfterRestore.dummyCleared, false, "dummyCleared is reset to false after restore");
  assert.equal(stateAfterRestore.isRestored, true, "isRestored is set to true");
  assert.equal(stateAfterRestore.isDataWiped, false, "isDataWiped is set to false");

  // Verify that reloading local state preserves the restored state without overwriting
  const reloadedRestoredState = getLocalState();
  assert.equal(reloadedRestoredState.menu.length, exportedDishesCount, "Reloading preserves restored menu");
  assert(reloadedRestoredState.orders.some(o => o.id === 9999), "Reloading preserves restored order");
});

test('Staff module: rename, role/username edit, add, duplicate username, session sync', () => {
  // fresh known state
  handleStandaloneRequest("maintenance/fill", { confirm: "fill" });
  const st0 = getLocalState();
  st0.staff = [
    { id: 1, name: "Ali Khan", username: "owner", role: "Owner", password: "owner", active: 1 },
    { id: 2, name: "Cashier", username: "cashier", role: "Cashier", password: "123456", active: 1 },
  ];
  saveLocalState(st0);

  // Login as owner -> session carries the OLD name
  const session = handleStandaloneRequest("auth/login", { username: "owner", password: "owner" });
  assert.equal(session.name, "Ali Khan");
  assert.equal(handleStandaloneRequest("bootstrap").user.name, "Ali Khan");

  // Rename the owner (what the Staff > Edit access form sends)
  handleStandaloneRequest("staff", { id: 1, name: "Malik Ashraf", username: "owner", role: "Owner", active: 1, password: "owner" });
  const afterRename = handleStandaloneRequest("bootstrap");
  assert.equal(afterRename.staff.find(s => s.id === 1).name, "Malik Ashraf", "staff list updated");
  assert.equal(afterRename.user.name, "Malik Ashraf", "sidebar/profile user updated immediately");
  assert.equal(JSON.parse(localStorage.getItem("dastarkhwan_auth_session")).name, "Malik Ashraf", "session persisted");

  // Rename survives reload (state read back from storage)
  assert.equal(getLocalState().staff.find(s => s.id === 1).name, "Malik Ashraf");

  // Blank password on edit keeps the old password; login still works
  handleStandaloneRequest("staff", { id: 2, name: "Hamza", username: "cashier", role: "Cashier", active: 1, password: "" });
  assert.equal(getLocalState().staff.find(s => s.id === 2).password, "123456");
  assert.equal(getLocalState().staff.find(s => s.id === 2).name, "Hamza");

  // Add new staff
  handleStandaloneRequest("staff", { name: "New Kitchen", username: "Kitchen2", role: "Kitchen", active: 1, password: "abcd" });
  const added = getLocalState().staff.find(s => s.username === "kitchen2");
  assert(added && added.id === 3 && added.name === "New Kitchen");

  // Validation: empty name and duplicate username are rejected
  assert.throws(() => handleStandaloneRequest("staff", { id: 2, name: "  ", username: "cashier", role: "Cashier" }), /name is required/);
  assert.throws(() => handleStandaloneRequest("staff", { id: 2, name: "Hamza", username: "owner", role: "Cashier" }), /already used/);

  // Disabling the logged-in account ends the session
  handleStandaloneRequest("staff", { id: 1, name: "Malik Ashraf", username: "owner", role: "Owner", active: 0 });
  assert.throws(() => handleStandaloneRequest("bootstrap"), /Session expired/);
});
