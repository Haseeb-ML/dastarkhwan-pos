// @ts-nocheck
import TablePicker from "./TablePicker";
import AppZoom from "./AppZoom";
import SidebarMore from "./SidebarMore";
import LanguageSwitch, {useLanguage} from "./LanguageSwitch";
import {getLanguage, languageDirection} from "./LanguageCore";
import CustomerForm from "./CustomerForm"
import DataControls, {AuditLog} from "./DataControls"
import IngredientEditor from "./IngredientEditor"
import BottomClose from "./BottomClose"
import { Dashboard, ProfitReport, TablesPage } from "./EasyOverview";
import DishCatalog from "./DishCatalog";
import ImageUpload from "./ImageUpload";
import PaymentHistory from "./PaymentHistory";
import UrduInput from "./UrduKeyboard";
import { urdu } from "./Urdu";
import HH_TECH_HUB_LOGO from "./hh_tech_logo";
import { apiUrl } from "./apiConfig";
import ConnectionSettings from "./ConnectionSettings";
import { handleStandaloneRequest } from "./browserDb";
import * as b from "react";
import * as x from "react/jsx-runtime";
function S({ name: e, size: t = 18 }) { let n = { grid: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("rect", { x: `3`, y: `3`, width: `7`, height: `7`, rx: `2` }), (0, x.jsx)("rect", { x: `14`, y: `3`, width: `7`, height: `7`, rx: `2` }), (0, x.jsx)("rect", { x: `3`, y: `14`, width: `7`, height: `7`, rx: `2` }), (0, x.jsx)("rect", { x: `14`, y: `14`, width: `7`, height: `7`, rx: `2` })]) }), orders: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("path", { d: `M6 3h12v18H6z` }), (0, x.jsx)("path", { d: `M9 8h6M9 12h6M9 16h4` })]) }), menu: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M4 6h16M4 12h16M4 18h16` })) }), users: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("circle", { cx: `9`, cy: `8`, r: `3` }), (0, x.jsx)("path", { d: `M3 20c0-4 2-6 6-6s6 2 6 6M16 5c3 0 4 4 1 6M17 14c3 .5 4 2 4 5` })]) }), stock: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M4 7l8-4 8 4-8 4zM4 7v10l8 4 8-4V7M12 11v10` })) }), chart: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M4 20V10M10 20V4M16 20v-7M22 20H2` })) }), settings: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("circle", { cx: `12`, cy: `12`, r: `3` }), (0, x.jsx)("path", { d: `M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.5 3h-5l-.3 3a8 8 0 0 0-1.7 1l-2.4-1-2 3.4L5.1 11a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.3 3h5l.3-3a8 8 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1z` })]) }), search: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("circle", { cx: `11`, cy: `11`, r: `7` }), (0, x.jsx)("path", { d: `M20 20l-4-4` })]) }), plus: (0, x.jsx)("path", { d: `M12 5v14M5 12h14` }), minus: (0, x.jsx)("path", { d: `M5 12h14` }), check: (0, x.jsx)("path", { d: `M5 12l4 4L19 6` }), clock: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("circle", { cx: `12`, cy: `12`, r: `9` }), (0, x.jsx)("path", { d: `M12 7v5l3 2` })]) }), table: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M4 10h16M6 10V7h12v3M6 10v9M18 10v9` })) }), wifi: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("path", { d: `M4 10a12 12 0 0 1 16 0M7 14a8 8 0 0 1 10 0M10 18a3 3 0 0 1 4 0` }), (0, x.jsx)("circle", { cx: `12`, cy: `20`, r: `.5` })]) }), printer: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M7 8V3h10v5M7 17H4V9h16v8h-3M7 14h10v7H7z` })) }), download: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M12 3v12M7 10l5 5 5-5M4 21h16` })) }), send: (0, x.jsx)(x.Fragment, { children: urdu((0, x.jsx)("path", { d: `M22 2L9 15M22 2l-7 20-4-9-9-4z` })) }), card: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("rect", { x: `2`, y: `5`, width: `20`, height: `14`, rx: `2` }), (0, x.jsx)("path", { d: `M2 10h20` })]) }), cash: (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("rect", { x: `2`, y: `6`, width: `20`, height: `13`, rx: `2` }), (0, x.jsx)("circle", { cx: `12`, cy: `12.5`, r: `3` }), (0, x.jsx)("path", { d: `M5 9h.1M19 16h.1` })]) }), arrow: (0, x.jsx)("path", { d: `M9 18l6-6-6-6` }), close: (0, x.jsx)("path", { d: `M6 6l12 12M18 6L6 18` }) }; return (0, x.jsx)("svg", { width: t, height: t, viewBox: `0 0 24 24`, fill: `none`, stroke: `currentColor`, strokeWidth: `1.8`, strokeLinecap: `round`, strokeLinejoin: `round`, "aria-hidden": `true`, children: urdu(n[e]) }); }
var C = { karahi: `/media/karahi.jpg`, curry: `/media/curry.jpg`, biryani: `https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=700&q=85`, rice: `https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=700&q=85`, bbq: `https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=700&q=85`, kebab: `https://images.unsplash.com/photo-1649295948526-fd64e7248754?auto=format&fit=crop&w=700&q=85`, naan: `https://images.unsplash.com/photo-1690915475901-6c08af925906?auto=format&fit=crop&w=700&q=85`, daal: `https://images.unsplash.com/photo-1788601988466-9f361c34c6cb?auto=format&fit=crop&w=700&q=85` }, w = [[`Dashboard`, `chart`], [`New Order`, `grid`], [`Orders & Kitchen`, `orders`], [`Tables`, `table`], [`Menu`, `menu`], [`Customers`, `users`], [`Stock & Purchases`, `stock`], [`Daily Summary`, `chart`], [`Settings`, `settings`]];
function ee({ name: e = `Dastarkhwan`, tagline: t = `Desi Kitchen` }) { return (0, x.jsxs)("div", { className: `brand`, children: urdu([(0, x.jsx)("div", { className: `brand-mark`, children: urdu(e[0]) }), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(e) }), (0, x.jsx)("span", { children: urdu(t.toUpperCase()) })]) })]) }); }
var te = (0, b.createContext)(null), ne = () => (0, b.useContext)(te), T = { Dashboard: "ڈیش بورڈ", Tables: "میزیں", "New Order": `Naya Order`, "Orders & Kitchen": `Orders / Rasoi`, Menu: `Khanay / Rates`, Customers: `Gahak / Udhaar`, "Stock & Purchases": `Stock / Khareed`, "Daily Summary": `منافع اور نقصان`, Settings: `Setting` }, E = e => `PKR ` + ((e || 0) / 100).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 }), re = () => new Intl.DateTimeFormat(`en-CA`, { timeZone: `Asia/Karachi`, year: `numeric`, month: `2-digit`, day: `2-digit` }).format(new Date), D = e => new Date(e).toLocaleString("en-PK", { timeZone: `Asia/Karachi` }), O = e => {
    let t = String(e);
    if (!/^\d+(\.\d{1,2})?$/.test(t))
        throw Error(`Enter a positive amount with up to two decimal places`);
    let n = Math.round(Number(t) * 100);
    if (!Number.isSafeInteger(n) || n > 1e10)
        throw Error(`Amount is outside the supported range`);
    return n;
}, ie = e => {
    let t = String(e);
    if (!/^-?\d+(\.\d{1,3})?$/.test(t))
        throw Error(`Quantity supports up to three decimal places`);
    let n = Math.round(Number(t) * 1e3);
    if (!Number.isSafeInteger(n) || Math.abs(n) > 1e9)
        throw Error(`Quantity is outside the supported range`);
    return n;
};
var k: any = null;
const safeUUID = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        try { return crypto.randomUUID(); } catch {}
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        let r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
};
function ae() {
    try {
        return JSON.parse(localStorage.getItem(`erp-pending-` + k) || `{}`);
    }
    catch {
        return {};
    }
}
function A(e) { localStorage.setItem(`erp-pending-` + k, JSON.stringify(e)); }
async function j(e, t, n) {
    const isCloudHosted = typeof window !== "undefined" && (
        window.location.hostname.endsWith(".web.app") ||
        window.location.hostname.endsWith(".firebaseapp.com") ||
        window.location.hostname.endsWith(".github.io")
    );
    const hasCustomBackend = typeof localStorage !== "undefined" && !!localStorage.getItem("dastarkhwan_api_url");

    // Fast-path for Cloud Firestore on Firebase Hosting
    if (isCloudHosted && !hasCustomBackend) {
        const res = handleStandaloneRequest(e, t);
        if (e === `bootstrap` && res?.user?.id) k = res.user.id;
        if (e === `auth/login` && res?.id) {
            k = res.id;
            if (res.token) localStorage.setItem("erp_token", res.token);
        }
        if (e === `auth/logout`) {
            k = null;
            localStorage.removeItem("erp_token");
        }
        return res;
    }

    let r = ae(), i = e + JSON.stringify(t || {}), a = [`summary`, `order`].includes(e), o = !!t && !e.startsWith(`auth/`) && !a && e !== `uploads`, s = !1, c = i;
    if (o) {
        let i = e => String(e.id ?? e.supplierId ?? e.ingredientId ?? `new`);
        if (!n) {
            let a = Object.entries(r).find(([, n]) => n.route === e && i(n.body) === i(t));
            a && (c = a[0], t = a[1].body, n = a[1].key, s = !0);
        }
        if (n ||= safeUUID(), e !== `tickets`) {
            try {
                let op = await fetch(apiUrl(`api/operations/` + encodeURIComponent(n)), { credentials: `include` });
                const ct = op.headers?.get("content-type");
                if (op.ok && ct && ct.includes("application/json")) {
                    let opJson = await op.json();
                    if (opJson.found)
                        return delete r[c], A(r), { ...opJson.result, _recovered: !0 };
                }
            } catch {
                // Ignore operations recovery check failure
            }
        }
        r[c] = { route: e, body: t, key: n }, A(r);
    }
    let l;
    try {
        const token = typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null;
        const reqHeaders = {
            ...(t ? { "Content-Type": `application/json`, "Idempotency-Key": n || safeUUID() } : {}),
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };
        l = await fetch(apiUrl(`api/` + e), { method: t ? `POST` : `GET`, credentials: `include`, headers: reqHeaders, body: t ? JSON.stringify(t) : void 0 });
        const ct = l.headers?.get("content-type");
        if (!ct || !ct.includes("application/json")) {
            return handleStandaloneRequest(e, t);
        }
    }
    catch {
        return handleStandaloneRequest(e, t);
    }
    let u;
    try {
        u = await l.json();
    }
    catch {
        return handleStandaloneRequest(e, t);
    }
    if (!l.ok) {
        if (l.status === 404 || l.status >= 500) {
            return handleStandaloneRequest(e, t);
        }
        throw l.status < 500 && (delete r[c], A(r)), Object.assign(Error(u.error || `Request failed`), { status: l.status });
    }
    if (e === `bootstrap` && u?.user?.id) k = u.user.id;
    if (e === `auth/login` && u?.id) {
        k = u.id;
        if (u.token) localStorage.setItem("erp_token", u.token);
    }
    if (e === `auth/logout`) {
        k = null;
        localStorage.removeItem("erp_token");
    }
    return o && (delete r[c], A(r)), s ? { ...u, _recovered: !0 } : u;
}
function oe({ value: e }) { return (0, x.jsx)("span", { className: `status ` + String(e).toLowerCase(), children: urdu(e) }); }
function se({ title: e, onClose: t, children: n, className: customClass = "" }) { return (0, x.jsx)("div", { className: `modal-backdrop`, children: urdu((0, x.jsxs)("section", { className: `work-modal ${customClass}`, role: `dialog`, "aria-modal": `true`, "aria-label": e, children: urdu([(0, x.jsxs)("header", { children: urdu([(0, x.jsx)("h2", { children: urdu(e) }), (0, x.jsx)("button", { type: `button`, className: `icon-button`, onClick: t, "aria-label": `Close`, children: urdu((0, x.jsx)(S, { name: "close", size: 22 })) })]) }), n, (0, x.jsx)(BottomClose, { onClose: t })]) })) }); }
function ce({ fields: e, initial: t = {}, submit: n, label: r = `Save`, children: i }) {
    useLanguage();
    let [a, o] = (0, b.useState)(t), [s, c] = (0, b.useState)(``), [l, u] = (0, b.useState)(!1), d = (0, b.useRef)(!1);
    return (0, x.jsxs)("form", { onSubmit: async (e) => {
            if (e.preventDefault(), !d.current) {
                d.current = !0, u(!0), c(``);
                try {
                    await n(a);
                }
                catch (e) {
                    c(e.message);
                }
                finally {
                    d.current = !1, u(!1);
                }
            }
        }, children: urdu([e.map(e => (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(e.label) }), e.options ? (0, x.jsxs)("select", { "aria-label": e.label, value: a[e.name] ?? ``, required: e.required !== !1, onChange: t => o({ ...a, [e.name]: t.target.value }), children: urdu([(0, x.jsx)("option", { value: ``, children: urdu(`Choose…`) }), e.options.map(e => (0, x.jsx)("option", { value: e.value, children: urdu(e.label) }, e.value))]) }) : e.type === `textarea` ? (0, x.jsx)(UrduInput, { as: "textarea", "aria-label": e.label, value: a[e.name] ?? ``, required: e.required !== !1, maxLength: 500, onChange: t => o({ ...a, [e.name]: t.target.value }) }) : (0, x.jsx)(UrduInput, { "aria-label": e.label, type: e.type || `text`, step: e.step || `any`, value: a[e.name] ?? ``, required: e.required !== !1, onChange: t => o({ ...a, [e.name]: t.target.value }) }), ` `, e.help && (0, x.jsx)("small", { children: urdu(e.help) })]) }, e.name)), i, s && (0, x.jsx)("p", { className: `error`, role: `alert`, children: urdu(s) }), (0, x.jsx)("button", { className: `primary wide`, disabled: l, children: urdu(l ? `Saving…` : r) })]) });
}
var le = (e, t = e => e.name) => e.map(e => ({ value: e.id, label: t(e) }));
function M(props) { const { mutate } = ne(); return (0, x.jsx)(ImageUpload, { ...props, mutate }); }
function N({ onLogin: e }) { useLanguage(); let [t, n] = (0, b.useState)(``), [r, i] = (0, b.useState)(!1); return (0, b.useEffect)(() => { j(`health`).then(e => { n(e.mode), i(e.setupRequired); }).catch(() => { }); }, []), (0, x.jsxs)("div", { className: `login-page`, children: urdu([(0, x.jsxs)("div", { className: `login-visual`, children: urdu([(0, x.jsx)(ee, {}), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { className: `eyebrow`, children: urdu(`RESTAURANT OPERATIONS, SIMPLIFIED`) }), (0, x.jsxs)("h1", { children: urdu([`From first tap`, (0, x.jsx)("br", {}), `to final bill.`]) }), (0, x.jsx)("p", { children: urdu(`Orders, a calm kitchen, and clear numbers for your whole team.`) }), (0, x.jsxs)("div", { className: `login-food`, children: urdu([(0, x.jsx)("img", { src: C.karahi, alt: `Chicken karahi` }), (0, x.jsx)("span", { children: urdu(`Built for busy desi kitchens`) })]) })]) }), (0, x.jsx)("small", { children: urdu(`Rawalpindi, Pakistan`) })]) }), (0, x.jsx)("main", { className: `login-form`, children: urdu((0, x.jsxs)("div", { children: urdu([(0, x.jsxs)("div", { className: "login-form-top", children: urdu([(0, x.jsx)(ee, {}), (0, x.jsx)("div", { className: "login-language", children: urdu((0, x.jsx)(LanguageSwitch, {})) })]) }), (0, x.jsx)("span", { className: `eyebrow`, children: urdu(`WELCOME BACK`) }), (0, x.jsx)("h2", { children: urdu(r ? `Initial Owner setup` : `Sign in to Dastarkhwan`) }), (0, x.jsx)("p", { children: urdu(`Your staff account determines workspace access.`) }), (0, x.jsx)(ce, { fields: [...r ? [{ name: `setupToken`, label: `Installation setup token` }, { name: `name`, label: `Owner name` }] : [], { name: `username`, label: `Username` }, { name: `password`, label: `Password`, type: `password` }], initial: { username: `owner` }, submit: async (t) => { r && await j(`auth/setup`, t), await j("auth/login", { username: t.username, password: t.password }), await e(); }, label: r ? `Create Owner account` : `Sign in` }), t === `development` && (0, x.jsxs)("p", { className: `login-help`, children: urdu([`Local development: owner / 123456`, (0, x.jsx)("br", {}), `Cashier: cashier · Kitchen: kitchen`]) })]) })) })]), dir: languageDirection(), lang: getLanguage() }); }
var ue = (e, t) => Number((BigInt(e) * BigInt(t) + 500n) / 1000n), de = () => ({ items: [], service: `Dine-in`, tableId: ``, customerId: ``, deliveryName: ``, deliveryPhone: ``, deliveryAddress: ``, discount: `0`, key: safeUUID() });
function fe({ editing: e, resume: t, onSaved: n }) {
    let { data: r, mutate: i, openInvoice: a, editOrder: o, notice: s } = ne(), c = `erp-draft-` + r.user.id, [l, u] = (0, b.useState)(() => {
        try {
            const draft=JSON.parse(localStorage.getItem(c) || `null`);
            if(!draft)return de();
            const variantIds=new Set(r.menu.flatMap(item=>item.variants.map(v=>v.id)));
            if((draft.editId&&!r.orders.some(order=>order.id===draft.editId)) || draft.items?.some(item=>!variantIds.has(item.variantId))) {localStorage.removeItem(c);return de();}
            return draft;
        }
        catch {
            return de();
        }
    }), [d, f] = (0, b.useState)(`All`), [p, m] = (0, b.useState)(``), [h, g] = (0, b.useState)(null), [_, v] = (0, b.useState)(!1), [y, w] = (0, b.useState)(!1), [ee, te] = (0, b.useState)(!1), [T, re] = (0, b.useState)(``), [mobileView, setMobileView] = (0, b.useState)(`catalog`), D = (0, b.useRef)(!1);
    (0, b.useEffect)(() => { if (e) { setMobileView(`order`); u(t => t.editId === e.id ? { ...t, version: e.version } : { ...de(), items: t.items, service: e.service, tableId: String(e.table_id || ``), customerId: String(e.customer_id || ``), deliveryName: e.customer?.name || ``, deliveryPhone: e.customer?.phone || ``, deliveryAddress: e.customer?.address || ``, editId: e.id, version: e.version }); } }, [e]), (0, b.useEffect)(() => { t && u({ ...t.data, key: safeUUID(), heldId: t.id }); }, [t]), (0, b.useEffect)(() => { localStorage.setItem(c, JSON.stringify(l)); }, [l, c]);
    let k = e => {
        if (l.pending) {
            re(`Previous save outcome is uncertain. Press Order & Bill to recover it before editing.`);
            return;
        }
        re(``), u(t => ({ ...t, ...e, key: safeUUID() }));
    }, ae = r.menu || [], A = [`All`, ...new Set(ae.map(e => e.category))], j = ae.filter(e => (d === `All` || e.category === d) && e.name.toLowerCase().includes(p.toLowerCase())), oe = l.items.reduce((e, t) => e + ue(t.price, t.qty), 0), le = (() => {
        try {
            return O(l.discount);
        }
        catch {
            return 0;
        }
    })(), M = Math.max(0, oe - le), N = l.editId ? r.orders.find(e => e.id === l.editId)?.taxBps || 0 : r.settings.taxBps, fe = l.editId ? r.orders.find(e => e.id === l.editId)?.serviceBps || 0 : r.settings.serviceBps, me = Math.round(M * N / 1e4), he = Math.round(M * fe / 1e4), ge = M + me + he, _e = (e, t) => { k({ items: l.items.find(e => e.variantId === t.id) ? l.items.filter(e => e.variantId !== t.id) : [...l.items, { variantId: t.id, name: e.name, image: e.image, variant: t.name, unit: t.unit, step: t.step, qty: t.step, price: t.price, note: `` }] }), g(null); }, ve = async (e = !1) => {
        if (!D.current) {
            D.current = !0, w(!0), re(``);
            try {
                if (!l.items.length) {
                    setMobileView(`catalog`);
                    throw Error(`پہلے کم از کم ایک کھانا منتخب کریں`);
                }
                if (!e && !l.pending && !l.editId && l.service === `Dine-in` && !Number(l.tableId)) {
                    setMobileView(`order`);
                    (document.querySelector(`.desktop-order .order-body`) || document.querySelector(`.mobile-sheet.open .order-body`))?.scrollTo({ top: 0, behavior: `smooth` });
                    throw Error(`اوپر میز منتخب کریں یا پارسل / ڈلیوری کا بٹن دبائیں، پھر بل بنائیں`);
                }
                if (!e && !l.pending && !l.editId && l.service === `Delivery`) {
                    let name = (l.deliveryName || '').trim();
                    let phone = (l.deliveryPhone || '').trim();
                    let address = (l.deliveryAddress || '').trim();
                    if (l.customerId && (!name || !phone || !address)) {
                        let cust = r.customers.find(c => c.id === Number(l.customerId));
                        if (cust) {
                            name = name || cust.name;
                            phone = phone || cust.phone;
                            address = address || cust.address;
                        }
                    }
                    if (!name) {
                        setMobileView(`order`);
                        (document.querySelector(`.desktop-order .order-body`) || document.querySelector(`.mobile-sheet.open .order-body`))?.scrollTo({ top: 0, behavior: `smooth` });
                        throw Error(`ڈلیوری کے لیے گاہک کا نام لکھنا لازمی ہے`);
                    }
                    if (!phone) {
                        setMobileView(`order`);
                        (document.querySelector(`.desktop-order .order-body`) || document.querySelector(`.mobile-sheet.open .order-body`))?.scrollTo({ top: 0, behavior: `smooth` });
                        throw Error(`ڈلیوری کے لیے موبائل نمبر لکھنا لازمی ہے`);
                    }
                    if (!address) {
                        setMobileView(`order`);
                        (document.querySelector(`.desktop-order .order-body`) || document.querySelector(`.mobile-sheet.open .order-body`))?.scrollTo({ top: 0, behavior: `smooth` });
                        throw Error(`ڈلیوری کے لیے پتہ لکھنا لازمی ہے`);
                    }
                }
                if (e)
                    await i("drafts/save", { data: l }, l.key), u(de()), s(`Draft held in Orders & Kitchen`);
                else {
                    let e = l.pending?.body || (l.editId ? { id: l.editId, version: l.version, items: l.items.map(({ variantId: e, qty: t, note: n }) => ({ variantId: e, qty: t, note: n })) } : { service: l.service, tableId: Number(l.tableId) || null, customerId: Number(l.customerId) || null, deliveryName: l.deliveryName || '', deliveryPhone: l.deliveryPhone || '', deliveryAddress: l.deliveryAddress || '', discount: O(l.discount), items: l.items.map(({ variantId: e, qty: t, note: n }) => ({ variantId: e, qty: t, note: n })) }), t = l.pending?.route || (l.editId ? `orders/append` : `orders/create`), r = l.pending?.key || l.key, o = { ...l, pending: { route: t, body: e, key: r } };
                    localStorage.setItem(c, JSON.stringify(o)), u(o);
                    let s = await i(t, e, r);
                    l.heldId && await i("drafts/delete", { id: l.heldId }), u(de()), v(!1), setMobileView(`catalog`), n(), a(s.id);
                }
            }
            catch (e) {
                e.status && e.status < 500 && u(e => ({ ...e, pending: void 0 })), re(e.message + (e.status === 409 ? ` Your draft is retained. Open the current order to review its version.` : ``));
            }
            finally {
                D.current = !1, w(!1);
            }
        }
    }, ye = (0, x.jsxs)("aside", { className: `order-panel`, children: urdu([
      (0, x.jsx)("div", { className: "mobile-order-back-bar", children: urdu((0, x.jsxs)("button", { type: "button", className: "mobile-back-to-menu-btn", onClick: () => setMobileView("catalog"), children: urdu(["← ", getLanguage() === "ur" ? "مزید کھانا منتخب کریں (کھانوں کی لسٹ)" : "Add more dishes (Menu)"]) })) }),
      (0, x.jsxs)("div", { className: `order-head`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("p", { children: urdu(`1. Khana chunein → 2. Miqdaar → 3. Bill banayein`) }), (0, x.jsxs)("h2", { children: urdu([l.editId ? `Add to order #` + l.editId : `Aap ka order`, ` `, (0, x.jsxs)("span", { children: urdu([l.items.length, ` khanay`]) })]) })]) }), (0, x.jsx)("button", { disabled: y || !!l.pending, onClick: () => { u(de()), n(); }, children: urdu(`Saaf karein`) })]) }), x.jsxs("div", { className: "order-body", children: urdu([(0, x.jsx)("div", { className: `service-toggle`, children: urdu([`Dine-in`, `Takeaway`, `Delivery`].map(e => (0, x.jsx)("button", { "aria-label": e, disabled: !!l.editId || y, className: l.service === e ? `active` : ``, onClick: () => k({ service: e }), children: urdu(e === `Dine-in` ? `Yahin khana` : e === `Takeaway` ? `Parcel` : `Delivery`) }, e))) }), (0, x.jsxs)("div", { className: `draft-fields`, children: urdu([l.service === `Dine-in` && (0, x.jsxs)("label", { children: urdu([`Table`, (0, x.jsx)(TablePicker, { tables: r.tables, disabled: !!l.editId || y, value: l.tableId, onChange: e => { let t = r.tables.find(t => t.id === Number(e.target.value)); t?.orderId ? (o(r.orders.find(e => e.id === t.orderId)), s(`Opened occupied table. Additions go to its existing invoice.`)) : k({ tableId: e.target.value }); } })]) }), l.service === `Takeaway` && (0, x.jsx)("p", { children: urdu(`Parcel ka number bill par ayega`) }), l.service !== `Delivery` ? (0, x.jsxs)("div", { className: `optional-customer`, children: urdu([(0, x.jsx)("span", { children: urdu(`گاہک کا نام، اگر ضرورت ہو (اختیاری)`) }), (0, x.jsxs)("label", { children: urdu([`Customer (optional)`, (0, x.jsxs)("select", { disabled: !!l.editId || y, value: l.customerId, onChange: e => k({ customerId: e.target.value }), children: urdu([(0, x.jsx)("option", { value: ``, children: urdu(`عام گاہک (اختیاری)`) }), r.customers.map(e => (0, x.jsxs)("option", { value: e.id, children: urdu([e.name, ` · `, e.phone]) }, e.id))]) })]) }), (0, x.jsx)("button", { className: `text-button`, type: `button`, onClick: () => te(!0), children: urdu(`+ Add customer`) })]) }) : (0, x.jsxs)("div", { className: `delivery-box`, children: urdu([(0, x.jsx)("p", { className: `delivery-token-hint`, children: urdu(`Delivery ka number bill par ayega`) }), (0, x.jsxs)("div", { className: `delivery-fields-grid`, children: urdu([r.customers.length > 0 && (0, x.jsxs)("label", { className: `delivery-input-field select-existing`, children: urdu([(0, x.jsx)("span", { children: urdu(`پہلے سے موجود گاہک منتخب کریں (اختیاری)`) }), (0, x.jsxs)("select", { disabled: !!l.editId || y, value: l.customerId, onChange: e => { let val = e.target.value, cust = r.customers.find(c => c.id === Number(val)); cust ? k({ customerId: val, deliveryName: cust.name, deliveryPhone: cust.phone, deliveryAddress: cust.address || l.deliveryAddress || `` }) : k({ customerId: `` }); }, children: urdu([(0, x.jsx)("option", { value: ``, children: urdu(`نیا گاہک یا لسٹ سے منتخب کریں…`) }), r.customers.map(e => (0, x.jsxs)("option", { value: e.id, children: urdu([e.name, ` · `, e.phone]) }, e.id))]) })]) }), (0, x.jsxs)("label", { className: `delivery-input-field required-field`, children: urdu([(0, x.jsx)("span", { children: urdu(`گاہک کا نام (لازمی)`) }), (0, x.jsx)(UrduInput, { required: !0, "aria-label": "Customer name", placeholder: urdu(`مثلاً محمد علی`), value: l.deliveryName || ``, disabled: !!l.editId || y, onChange: e => k({ deliveryName: e.target.value }) })]) }), (0, x.jsxs)("label", { className: `delivery-input-field required-field`, children: urdu([(0, x.jsx)("span", { children: urdu(`موبائل نمبر (لازمی)`) }), (0, x.jsx)(UrduInput, { required: !0, type: `tel`, dir: `ltr`, "aria-label": "Pakistani mobile", placeholder: "03001234567", value: l.deliveryPhone || ``, disabled: !!l.editId || y, onChange: e => k({ deliveryPhone: e.target.value }) })]) }), (0, x.jsxs)("label", { className: `delivery-input-field required-field delivery-address-full`, children: urdu([(0, x.jsx)("span", { children: urdu(`ڈلیوری کا پتہ (لازمی)`) }), (0, x.jsx)(UrduInput, { as: "textarea", rows: 2, required: !0, "aria-label": "Delivery address", placeholder: urdu(`مکان / گلی / سیکٹر / پتہ درج کریں`), value: l.deliveryAddress || ``, disabled: !!l.editId || y, onChange: e => k({ deliveryAddress: e.target.value }) })]) })].filter(Boolean)) })]) })].filter(Boolean)) }), (0, x.jsxs)("div", { className: `order-items`, children: urdu([!l.items.length && (0, x.jsxs)("div", { className: `empty-order`, children: urdu([(0, x.jsx)("strong", { children: urdu(`Your order is empty`) }), (0, x.jsx)("span", { children: urdu(`Select dishes from the menu.`) })]) }), l.items.map(e => (0, x.jsxs)("div", { className: `order-row`, children: urdu([(0, x.jsx)("img", { src: e.image || C.curry, alt: `` }), (0, x.jsxs)("div", { className: `order-copy`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(e.name) }), (0, x.jsx)("button", { disabled: y, onClick: () => k({ items: l.items.filter(t => t.variantId !== e.variantId) }), "aria-label": `Remove ` + e.name, children: urdu((0, x.jsx)(S, { name: "close", size: 22 })) })]) }), (0, x.jsxs)("span", { children: urdu([e.variant, ` · `, e.unit]) }), (0, x.jsxs)("small", { children: urdu([E(e.price), ` / `, e.unit]) }), (0, x.jsxs)("div", { className: `row-bottom`, children: urdu([(0, x.jsxs)("div", { className: `qty`, children: urdu([(0, x.jsx)("button", { disabled: y || e.qty <= e.step, onClick: () => k({ items: l.items.map(t => t.variantId === e.variantId ? { ...t, qty: t.qty - t.step } : t) }), "aria-label": `Reduce ` + e.name, children: urdu((0, x.jsx)(S, { name: "minus", size: 20 })) }), (0, x.jsx)(UrduInput, { "aria-label": `Quantity ` + e.name + ` ` + e.variant, type: `number`, step: e.step / 1e3, min: e.step / 1e3, value: e.qty / 1e3, onChange: t => {
                                                                    try {
                                                                        let n = ie(t.target.value);
                                                                        n > 0 && k({ items: l.items.map(t => t.variantId === e.variantId ? { ...t, qty: n } : t) });
                                                                    }
                                                                    catch { }
                                                                } }), (0, x.jsx)("button", { disabled: y, onClick: () => k({ items: l.items.map(t => t.variantId === e.variantId ? { ...t, qty: t.qty + t.step } : t) }), "aria-label": `Increase ` + e.name, children: urdu((0, x.jsx)(S, { name: "plus", size: 20 })) })]) }), (0, x.jsx)("b", { children: urdu(E(ue(e.price, e.qty))) })]) }), (0, x.jsxs)("div", { className: `kitchen-note`, children: urdu([(0, x.jsx)("span", { children: urdu(`Rasoi ko hidayat`) }), (0, x.jsx)(UrduInput, { className: `note-input`, "aria-label": `Kitchen note ` + e.name, placeholder: urdu("\u0645\u062B\u0644\u0627\u064B \u0645\u0631\u0686 \u06A9\u0645 \u0631\u06A9\u06BE\u06CC\u06BA"), maxLength: 500, value: e.note, onChange: t => k({ items: l.items.map(n => n.variantId === e.variantId ? { ...n, note: t.target.value } : n) }) })]) })]) })]) }, e.variantId))]) })]) }), x.jsxs("footer", { className: "order-footer", children: urdu([(0, x.jsxs)("div", { className: `totals`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { children: urdu(`Subtotal`) }), (0, x.jsx)("strong", { children: urdu(E(oe)) })]) }), r.user.role === `Owner` && !l.editId && (0, x.jsxs)("div", { className: `optional-discount`, children: urdu([(0, x.jsx)("span", { children: urdu(`Discount dein`) }), (0, x.jsxs)("label", { className: `discount-field`, children: urdu([`Discount PKR`, (0, x.jsx)(UrduInput, { type: `number`, min: `0`, step: `.01`, value: l.discount, onChange: e => k({ discount: e.target.value }) })]) })]) }), me + he > 0 && (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { children: urdu(`Tax & service`) }), (0, x.jsx)("strong", { children: urdu(E(me + he)) })]) }), (0, x.jsxs)("div", { className: `grand`, children: urdu([(0, x.jsx)("span", { children: urdu(l.editId ? `Additions total` : `Total`) }), (0, x.jsx)("strong", { children: urdu(E(ge)) })]) })]) }), (0, x.jsxs)("div", { className: `order-actions`, children: urdu([T && (0, x.jsx)("p", { className: `error`, role: `alert`, children: urdu(T) }), (0, x.jsx)("button", { className: `hold`, disabled: y || !!l.editId, onClick: () => ve(!0), children: urdu(`Order rok dein`) }), (0, x.jsxs)("button", { className: `primary`, "aria-label": l.editId ? `Save additions` : `Order & Bill`, disabled: y || !l.items.length, onClick: () => ve(), children: urdu([y ? `Saving…` : l.editId ? `Save additions` : `Order & Bill`, ` `, (0, x.jsx)("span", { children: urdu(E(ge)) })]) }), (0, x.jsx)("strong", { className: `bill-hint`, children: urdu(`بل بنائیں اور پیسے وصول کریں`) })]) })]) })]) });
    return (0, x.jsxs)("div", { className: `pos-layout mobile-view-` + mobileView, children: urdu([
      (0, x.jsxs)("div", { className: "mobile-pos-nav-switcher", children: urdu([
        (0, x.jsxs)("button", {
          type: "button",
          className: "mobile-pos-nav-btn " + (mobileView === "catalog" ? "active" : ""),
          onClick: () => setMobileView("catalog"),
          children: urdu([
            "🍲 ",
            getLanguage() === "ur" ? "کھانوں کی لسٹ" : "Menu"
          ])
        }),
        (0, x.jsxs)("button", {
          type: "button",
          className: "mobile-pos-nav-btn " + (mobileView === "order" ? "active" : ""),
          onClick: () => setMobileView("order"),
          children: urdu([
            "📝 ",
            getLanguage() === "ur" ? "آپ کا آرڈر و بل" : "Order & Bill",
            l.items.length > 0 ? (0, x.jsxs)("span", { className: "mobile-nav-count-badge", children: urdu(l.items.length) }) : null
          ])
        })
      ]) }),
      (0, x.jsxs)("main", { className: `catalog`, children: urdu([
        (0, x.jsxs)("div", { className: "mobile-service-header", children: urdu([
          (0, x.jsx)("div", { className: "mobile-service-pills", children: urdu([`Dine-in`, `Takeaway`, `Delivery`].map(e => (0, x.jsxs)("button", { type: "button", disabled: !!l.editId || y, className: `mobile-service-btn ` + (l.service === e ? "active" : ""), onClick: () => k({ service: e }), children: urdu([e === "Dine-in" ? "🍽️ " : e === "Takeaway" ? "🛍️ " : "🛵 ", e === "Dine-in" ? "Yahin khana" : e === "Takeaway" ? "Parcel" : "Delivery"]) }, e))) }),
          l.service === "Delivery" && (0, x.jsxs)("button", { type: "button", className: "mobile-delivery-status-pill", onClick: () => setMobileView("order"), children: urdu([(0, x.jsx)("span", { children: "🛵" }), (0, x.jsxs)("span", { className: "delivery-status-text", children: urdu([l.deliveryName ? `ڈلیوری برائے: ${l.deliveryName}` : "ڈلیوری کا پتہ اور گاہک لکھیں →"]) }), (0, x.jsx)("span", { className: "delivery-status-tag", children: urdu("لازمی") })]) }),
          l.service === "Takeaway" && (0, x.jsxs)("div", { className: "mobile-takeaway-hint", children: urdu([(0, x.jsx)("span", { children: urdu("🛍️ پارسل آرڈر: گاہک کا نام اختیاری ہے") })]) })
        ]) }),
        (0, x.jsxs)("label", { className: `search`, children: urdu([(0, x.jsx)(S, { name: `search` }), (0, x.jsx)(UrduInput, { value: p, onChange: e => m(e.target.value), placeholder: urdu("\u06A9\u06BE\u0627\u0646\u06D2 \u06A9\u0627 \u0646\u0627\u0645 \u0644\u06A9\u06BE\u06CC\u06BA\u2026") })]) }), (0, x.jsx)("div", { className: `categories`, children: urdu(A.map(e => (0, x.jsx)("button", { className: d === e ? `active` : ``, onClick: () => f(e), children: urdu(e) }, e))) }), (0, x.jsxs)("div", { className: `section-title`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h2", { children: urdu(d === `All` ? `Kya order lena hai?` : d) }), (0, x.jsx)("p", { children: urdu(`Photo dabayein. Half / Full chunein. Bill banayein.`) })]) }), (0, x.jsxs)("span", { children: urdu([j.length, ` dishes`]) })]) }), (0, x.jsx)("div", { className: `food-grid`, children: urdu(j.map(e => { let t = l.items.filter(t => e.variants.some(e => e.id === t.variantId)), n = !e.available || !e.variants.some(e => e.portions === null || e.portions >= e.step); return (0, x.jsxs)("article", { onClick: () => !n && !y && (e.variants.length === 1 ? _e(e, e.variants[0]) : g(e)), className: `food-card ` + (t.length ? `selected ` : ``) + (n ? `sold` : ``), children: urdu([(0, x.jsxs)("div", { className: `food-photo`, children: urdu([e.image ? (0, x.jsx)("img", { src: e.image, alt: e.name, loading: `lazy` }) : (0, x.jsxs)("div", { className: `no-dish-photo`, children: urdu([(0, x.jsx)(S, { name: `menu`, size: 38 }), (0, x.jsx)("span", { children: urdu(`Apni photo add karein`) })]) }), (0, x.jsx)("button", { className: `checkbox`, disabled: n || y, "aria-label": `Select ` + e.name, onClick: t => { t.stopPropagation(), e.variants.length === 1 ? _e(e, e.variants[0]) : g(e); }, children: urdu(t.length ? (0, x.jsx)(S, { name: `check` }) : null) }), n && (0, x.jsx)("span", { className: `sold-label`, children: urdu(`Aaj khatam`) })]) }), (0, x.jsxs)("button", { className: `food-info food-select`, disabled: n || y, onClick: t => { t.stopPropagation(), e.variants.length === 1 ? _e(e, e.variants[0]) : g(e); }, children: urdu([(0, x.jsx)("h3", { children: urdu(e.name) }), (0, x.jsx)("strong", { children: urdu(E(Math.min(...e.variants.map(e => e.price)))) }), (0, x.jsx)("small", { children: urdu(n ? `Aaj khatam` : `+ Order mein dalein`) })]) })]) }, e.id); })) }), !j.length && (0, x.jsx)("p", { className: `empty-state`, children: urdu(`No dishes match your search.`) })]) }), 
      (0, x.jsx)("div", { className: `desktop-order`, children: urdu(ye) }), 
      (0, x.jsxs)("button", { className: `mobile-cart`, onClick: () => setMobileView("order"), children: urdu([
        (0, x.jsxs)("div", { className: "mobile-cart-info", children: urdu([
          (0, x.jsx)("span", { className: "mobile-cart-badge", children: urdu(l.service === "Dine-in" ? "🍽️ یہیں" : l.service === "Takeaway" ? "🛍️ پارسل" : "🛵 ڈلیوری") }),
          (0, x.jsxs)("span", { className: "mobile-cart-count", children: urdu([l.items.length, " khanay · ", E(ge)]) })
        ]) }),
        (0, x.jsx)("span", { className: "mobile-cart-btn-label", children: urdu("آرڈر اور بل دیکھیں →") })
      ]) }), h && (0, x.jsx)(se, { className: "portion-dialog", title: urdu(`Choose variant · ` + h.name), onClose: () => g(null), children: urdu((0, x.jsx)("div", { className: `variant-list`, children: urdu(h.variants.map(e => (0, x.jsxs)("button", { className: l.items.some(t => t.variantId === e.id) ? "portion-selected" : "", "aria-pressed": l.items.some(t => t.variantId === e.id), disabled: e.portions !== null && e.portions < e.step, onClick: () => _e(h, e), children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(e.name) }), (0, x.jsxs)("small", { children: urdu([getLanguage()==="ur" ? `ایک بار میں ${e.step / 1e3} ${urdu(e.unit)}` : `${e.step / 1e3} ${e.unit} per selection`, e.portions === null ? `` : (getLanguage()==="ur" ? ` · باقی: ${e.portions / 1e3}` : ` · ${e.portions / 1e3} available`)]) })]) }), (0, x.jsxs)("b", { children: urdu([E(e.price), ` `, l.items.some(t => t.variantId === e.id) ? (getLanguage()==="ur" ? ` ✓ ہٹائیں` : ` ✓ Remove`) : (getLanguage()==="ur" ? ` + شامل کریں` : ` + Add`)]) })]) }, e.id))) })) }), ee && (0, x.jsx)(se, { className: "customer-editor-dialog", title: urdu("\u0646\u06CC\u0627 \u06AF\u0627\u06C1\u06A9"), onClose: () => te(!1), children: urdu((0, x.jsx)(CustomerForm, { onSave: async (e) => { let t = await i(`customers/save`, e); k({ customerId: String(t.id) }), te(!1); } })) })]) });
}
var pe = [{ name: `name`, label: `Customer name` }, { name: `phone`, label: `Pakistani mobile`, help: `03XX XXXXXXX or +923XX XXXXXXX` }, { name: `note`, label: `Note`, required: !1, type: `textarea` }];
function me({ onResume: e }) { let { data: t, mutate: n, openInvoice: r, editOrder: i, notice: a } = ne(), [o, s] = (0, b.useState)(t.user.role === `Kitchen` ? `Kitchen board` : `Active orders`), [c, l] = (0, b.useState)(``), [u, d] = (0, b.useState)(`All`), [f, p] = (0, b.useState)(``), [m, h] = (0, b.useState)(``), [g, _] = (0, b.useState)(null), v = t.user.role === `Kitchen`, y = (t.orders || []).filter(e => (e.number + ` ` + e.place + ` ` + (e.customer?.phone || ``) + ` ` + (e.customer?.name || ``) + ` ` + e.created + ` ` + (e.business_date || ``)).toLowerCase().includes(c.toLowerCase()) && (u === `All` || (u === `Refunded` ? e.refunded > 0 : e.paymentStatus === u)) && (!f || e.business_date >= f) && (!m || e.business_date <= m)); return (0, x.jsxs)("div", { className: `page-content orders-workspace`, children: urdu([(0, x.jsx)("div", { className: `subnav`, children: urdu((v ? [`Kitchen board`] : [`Kitchen board`, `Active orders`, `Tables`, `Order history`, `Invoices`, `Held drafts`]).map(e => (0, x.jsx)("button", { "aria-label": e, className: o === e ? `active` : ``, onClick: () => s(e), children: urdu({ "Kitchen board": `Rasoi ke orders`, "Active orders": `Chaltay orders`, Tables: `Tables`, "Order history": `Purane orders`, Invoices: `Bills`, "Held drafts": `Rokay huay orders` }[e] || e) }, e))) }), (0, x.jsx)("div", { className: `page-heading`, children: urdu((0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h2", { children: urdu(o) }), (0, x.jsx)("p", { children: urdu(`Shared records · refreshed every 5 seconds`) })]) })) }), o !== `Held drafts` && o !== `Tables` && (0, x.jsxs)("div", { className: `table-tools`, "aria-label": "Order filters", children: urdu([(0, x.jsxs)("label", { className: `search`, children: urdu([(0, x.jsx)(S, { name: `search` }), (0, x.jsx)(UrduInput, { value: c, onChange: e => l(e.target.value), placeholder: urdu("\u0628\u0644\u060C \u0645\u06CC\u0632 \u06CC\u0627 \u06AF\u0627\u06C1\u06A9 \u06A9\u0627 \u0645\u0648\u0628\u0627\u0626\u0644\u2026") })]) }), !v && (0, x.jsx)("select", { "aria-label": "Payment status filter", value: u, onChange: e => d(e.target.value), children: urdu([`All`, `Unpaid`, `Partial`, `Paid`, `Refunded`, `Cancelled`].map(e => (0, x.jsx)("option", { value: e, children: urdu(e) }, e))) })]) }), !v && [`Active orders`, `Order history`, `Invoices`].includes(o) && (0, x.jsxs)("div", { className: `date-filter`, children: urdu([(0, x.jsxs)("label", { children: urdu([`From date`, (0, x.jsx)(UrduInput, { "aria-label": "Orders from date", type: `date`, value: f, onChange: e => p(e.target.value) })]) }), (0, x.jsxs)("label", { children: urdu([`To date`, (0, x.jsx)(UrduInput, { "aria-label": "Orders to date", type: `date`, value: m, onChange: e => h(e.target.value) })]) })]) }), o === `Kitchen board` ? (0, x.jsx)("div", { className: `kitchen-grid`, children: urdu(y.filter(e => e.state === `open`).flatMap(e => e.tickets.filter(e => ![`Served`, `Cancelled`].includes(e.state)).map(t => (0, x.jsxs)("article", { className: `kitchen-card kitchen-ticket`, "data-state": t.state, children: urdu([(0, x.jsxs)("div", { className: `kitchen-head`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h3", { children: urdu(e.number) }), (0, x.jsxs)("span", { children: urdu([e.place, getLanguage()==="ur" ? ` · کھانے کی پرچی ` : ` · Batch `, t.batch]) })]) }), (0, x.jsxs)("strong", { className: `timer`, children: urdu([Math.max(0, Math.floor((Date.now() - new Date(t.created).getTime()) / 6e4)), ` `, getLanguage()==="ur" ? `منٹ` : `min`]) })]) }), (0, x.jsxs)("div", { className: `independent`, children: urdu([(0, x.jsx)(oe, { value: t.state }), !v && (0, x.jsx)(oe, { value: e.paymentStatus })]) }), (0, x.jsx)("ul", { children: urdu(e.items.filter(e => e.batch === t.batch).map(e => (0, x.jsxs)("li", { children: urdu([e.name, ` · `, e.variant, ` × `, e.qty / 1e3, ` `, e.unit, e.note && (0, x.jsx)("div", { className: `kitchen-note`, children: urdu(e.note) })]) }, e.id))) }), (0, x.jsx)(he, { onClick: async () => { await n("tickets", { id: t.id, previous: t.state, state: { New: `Preparing`, Preparing: `Ready`, Ready: `Served` }[t.state] }); }, children: urdu(t.state === `New` ? `Start preparing` : t.state === `Preparing` ? `Mark ready` : `Mark served`) }), !v && (0, x.jsx)("button", { className: `secondary`, onClick: () => window.open(`/api/invoices/` + e.id + `/kitchen?size=80mm`, `_blank`), children: urdu(`Print kitchen ticket`) })]) }, t.id)))) }) : o === `Tables` ? (0, x.jsx)("div", { className: `kitchen-grid`, children: urdu(t.tables.map(e => (0, x.jsxs)("article", { className: `kitchen-card table-status-card`, "data-occupied": !!e.orderId, children: urdu([(0, x.jsx)(S, {name:"table",size:30}), (0, x.jsx)("h3", { children: urdu(e.name) }), (0, x.jsx)("p", { children: urdu(e.orderId ? (getLanguage()==="ur" ? `مصروف میز · آرڈر نمبر ` : `Occupied · Order #`) + e.orderId : (getLanguage()==="ur" ? `خالی میز` : `Free table`)) }), e.orderId && (0, x.jsx)("button", { className: `primary compact`, onClick: () => r(e.orderId), children: urdu(`Open order`) })]) }, e.id))) }) : o === `Held drafts` ? (0, x.jsx)("div", { className: `kitchen-grid`, children: urdu((t.drafts || []).map(t => (0, x.jsxs)("article", { className: `kitchen-card held-order-card`, children: urdu([(0, x.jsx)(S, {name:"receipt",size:30}), (0, x.jsxs)("h3", { children: urdu([getLanguage()==="ur" ? `روکا ہوا آرڈر نمبر ` : `Held order #`, t.id]) }), (0, x.jsxs)("p", { children: urdu([D(t.created)]) }), (0, x.jsxs)("p", {className:"held-order-count",children:urdu([t.data.items.length,getLanguage()==="ur" ? ` کھانے` : ` dishes`])}), (0, x.jsx)("button", { className: `primary compact`, onClick: () => e(t), children: urdu(`Resume draft`) }), (0, x.jsx)(he, { secondary: !0, onClick: () => n("drafts/delete", { id: t.id }), children: urdu(`Delete held draft`) })]) }, t.id))) }) : (0, x.jsx)("div", { className: `data-card table-wrap`, children: urdu((0, x.jsxs)("table", { className: `business-table`, children: urdu([(0, x.jsx)("thead", { children: urdu((0, x.jsx)("tr", { children: urdu([...(getLanguage()==="ur" ? [`بل اور تاریخ`, `میز اور گاہک`, `کل رقم`, `پیسے ملے یا باقی ہیں؟`, `کیا کرنا ہے؟`] : [`Invoice / Date`, `Table / Customer`, `Total`, `Payment / Balance`, `Actions`])].map(e => (0, x.jsx)("th", { children: urdu(e) }, e))) })) }), (0, x.jsx)("tbody", { children: urdu(y.filter(e => o !== `Active orders` || e.state === `open`).map(e => (0, x.jsxs)("tr", { children: urdu([(0, x.jsxs)("td", { children: urdu([(0, x.jsx)("strong", { children: urdu(e.number) }), (0, x.jsx)("div", { className: `ordered-foods`, children: urdu(e.items.map(e => (0, x.jsxs)("span", { children: urdu([e.qty / 1e3, ` × `, e.name, ` (`, e.variant, `)`]) }, e.id))) }), (0, x.jsxs)("small", { children: urdu([D(e.created), ` · `, e.state]) })]) }), (0, x.jsxs)("td", { children: urdu([e.place, (0, x.jsx)("small", { children: urdu(e.customer?.name || `Walk-in guest`) })]) }), (0, x.jsx)("td", { children: urdu(E(e.total)) }), (0, x.jsxs)("td", { children: urdu([(0, x.jsx)(oe, { value: e.paymentStatus }), e.refunded > 0 && (0, x.jsx)(oe, { value: `Refunded` }), (0, x.jsxs)("small", { children: urdu([getLanguage()==="ur" ? `باقی رقم: ` : `Balance: `, E(e.balance)]) })]) }), (0, x.jsx)("td", { children: urdu((0, x.jsxs)("div", { className: `row-actions`, children: urdu([(0, x.jsx)("button", { onClick: () => r(e.id), children: urdu(`Invoice / Pay`) }), e.state === `open` && (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("button", { onClick: () => i(e), children: urdu(`Add items`) }), (0, x.jsx)("button", { onClick: () => _({ kind: `close`, order: e }), children: urdu(`Release table / Close`) })]) }), t.user.role === `Owner` && e.state !== `cancelled` && (0, x.jsx)("button", { onClick: () => _({ kind: `cancel`, order: e }), children: urdu(`Cancel`) })]) })) })]) }, e.id))) })]) })) }), !y.length && o !== `Tables` && (0, x.jsx)("p", { className: `empty-state`, children: urdu(`No saved orders yet. Create a guest order to get started.`) }), g && (0, x.jsx)(se, { title: urdu(g.kind === `close` ? `آرڈر ختم کریں` : `آرڈر منسوخ کریں`), onClose: () => _(null), children: urdu(g.kind === `close` ? (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsxs)("div", { className: `easy-close-help`, children: urdu([
 (0, x.jsx)("p", { children: urdu(`پہلے گاہک کو سارا کھانا دے دیں۔`) }),
 g.order.balance > 0 ? (0, x.jsxs)("p", { children: urdu([`گاہک سے ابھی `, (0, x.jsx)("strong", { children: urdu(E(g.order.balance)) }), ` لینے ہیں۔ آرڈر ختم کرنے کے بعد بھی یہ پیسے بل میں باقی رہیں گے۔`]) }) : (0, x.jsx)("p", { children: urdu(`اس بل کے سارے پیسے مل گئے ہیں۔`) }),
 g.order.table_id && (0, x.jsx)("p", { children: urdu(`یہ میز اگلے گاہک کے لیے خالی ہو جائے گی۔`) })
]) }), (0, x.jsx)(he, { onClick: async () => { await n("orders/close", { id: g.order.id, version: g.order.version }), _(null), a(`آرڈر ختم ہو گیا۔ بل اور باقی پیسے محفوظ ہیں۔`); }, children: urdu(`ہاں، آرڈر ختم کریں`) })]) }) : (0, x.jsx)(ce, { fields: [{ name: `reason`, label: `Cancellation reason`, type: `textarea` }, { name: `preparation`, label: `Food preparation`, options: [{ value: `Not prepared`, label: `Not prepared (all tickets still New)` }, { value: `Prepared`, label: `Prepared (ingredients retained; record wastage manually)` }] }], submit: async (e) => { await n("orders/cancel", { ...e, id: g.order.id, version: g.order.version }), _(null); }, children: urdu((0, x.jsx)("p", { children: urdu(`Refund all collected funds first through the invoice. Raw ingredient consumption is manual and is never automatically reversed.`) })) })) })]) }); }
function he({ onClick: e, children: t, secondary: n = !1 }) {
    let [r, i] = (0, b.useState)(!1), [a, o] = (0, b.useState)(``), s = (0, b.useRef)(!1);
    return (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("button", { type: `button`, className: n ? `secondary` : `primary compact`, disabled: r, onClick: async () => {
                    if (!s.current) {
                        s.current = !0, i(!0), o(``);
                        try {
                            await e();
                        }
                        catch (e) {
                            o(e.message);
                        }
                        finally {
                            s.current = !1, i(!1);
                        }
                    }
                }, children: urdu(r ? `Working…` : t) }), a && (0, x.jsx)("p", { className: `error`, role: `alert`, children: urdu(a) })]) });
}
function ge({ id: e, onClose: t }) {
    let { data: n, mutate: r } = ne(), i = n.orders.find(t => t.id === e), [a, o] = (0, b.useState)(i), [s, c] = (0, b.useState)(`invoice`), [l, u] = (0, b.useState)(``), [d, f] = (0, b.useState)(`Cash`), [p, m] = (0, b.useState)(i?.customer?.phone || ``), [h, g] = (0, b.useState)(null), [_, v] = (0, b.useState)(``), [y, C] = (0, b.useState)(n.settings.receipt), [w, ee] = (0, b.useState)(i?.revision), [te, re] = (0, b.useState)(!1);
    (0, b.useEffect)(() => {
        let t = !0;
        if (i) {
            if (w == null) {
                o(i), ee(i.revision);
                return;
            }
            if (w === i.revision) {
                o(i);
                return;
            }
            const isCloudHosted = typeof window !== "undefined" && (
                window.location.hostname.endsWith(".web.app") ||
                window.location.hostname.endsWith(".firebaseapp.com") ||
                window.location.hostname.endsWith(".github.io")
            );
            const hasCustomBackend = typeof localStorage !== "undefined" && !!localStorage.getItem("dastarkhwan_api_url");

            if (isCloudHosted && !hasCustomBackend) {
                try {
                    const fallback = handleStandaloneRequest(`invoices/${e}/data`);
                    if (fallback && t) o(fallback);
                } catch (err) {
                    if (t) v(err.message);
                }
                return;
            }

            return fetch(apiUrl(`api/invoices/` + e + `/data?revision=` + w), { credentials: `include` }).then(async (res) => {
                const ct = res.headers.get("content-type");
                if (!res.ok || !ct || !ct.includes("application/json")) {
                    const fallback = handleStandaloneRequest(`invoices/${e}/data`);
                    if (fallback) return fallback;
                    throw Error("Failed to load invoice data");
                }
                return res.json();
            }).then(e => { t && o(e); }).catch(err => {
                try {
                    const fallback = handleStandaloneRequest(`invoices/${e}/data`);
                    if (fallback) { t && o(fallback); return; }
                } catch {}
                t && v(err.message);
            }), () => { t = !1; };
        }
    }, [w, i?.version]);
    let ie = t => apiUrl(`api/invoices/` + e + `/` + t + `?size=` + y + `&revision=` + w);
    async function k() {
        re(!0), v(``);
        try {
            let e = await fetch(ie(`pdf`), { credentials: `include` });
            if (!e.ok)
                throw Error((await e.json()).error);
            let t = new File([await e.blob()], a.number + `-r` + w + `.pdf`, { type: `application/pdf` });
            g(t);
            let n = URL.createObjectURL(t), r = document.createElement(`a`);
            r.href = n, r.download = t.name, r.click(), setTimeout(() => URL.revokeObjectURL(n), 3e4);
        }
        catch (e) {
            window.print();
        }
        finally {
            re(!1);
        }
    }
    return a ? (0, x.jsx)("div", { className: `modal-backdrop invoice-bg`, children: urdu((0, x.jsxs)("div", { className: `invoice-modal premium-invoice`, role: `dialog`, "aria-modal": `true`, "aria-label": `Invoice ` + a.number, children: urdu([(0, x.jsxs)("header", { children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("span", { className: `success-icon`, children: urdu((0, x.jsx)(S, { name: `check` })) }), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("small", { children: urdu(`SAVED INVOICE`) }), (0, x.jsx)("h2", { children: urdu(a.number) }), (0, x.jsxs)("p", { children: urdu([`Revision `, a.revision, ` · `, a.state]) })]) })]) }), (0, x.jsx)("button", { "aria-label": `Close invoice`, onClick: t, children: urdu((0, x.jsx)(S, { name: "close", size: 22 })) })]) }), (0, x.jsxs)("div", { className: `invoice-layout`, children: urdu([(0, x.jsxs)("section", { className: `receipt-preview`, "data-payment": a.paymentStatus, children: urdu([(0, x.jsxs)("div", { className: `receipt-brand`, children: urdu([(0, x.jsxs)("div", { children: urdu([a.restaurant.logo && (0, x.jsx)("img", { className: `logo-preview`, src: a.restaurant.logo, alt: `Restaurant logo` }), (0, x.jsx)("h2", { children: urdu(a.restaurant.name) }), (0, x.jsx)("small", { children: urdu(a.restaurant.tagline) }), (0, x.jsxs)("p", { children: urdu([a.restaurant.address || "Rawalpindi, Pakistan", (0, x.jsx)("br", {}), (0, x.jsxs)("strong", { children: ["فون نمبر: ", a.restaurant.phone || "051 6122024"] })]) }), a.restaurant.taxId && (0, x.jsx)("small", { children: urdu(a.restaurant.taxId) })]) }), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(`INVOICE`) }), (0, x.jsx)("span", { children: urdu(a.number) })]) })]) }), (0, x.jsxs)("div", { className: `receipt-meta`, children: urdu([(0, x.jsxs)("span", { children: urdu([(0, x.jsx)("small", { children: urdu(`DATE & TIME`) }), (0, x.jsx)("b", { children: urdu(D(a.created)) })]) }), (0, x.jsxs)("span", { children: urdu([(0, x.jsx)("small", { children: urdu(`SERVICE`) }), (0, x.jsxs)("b", { children: urdu([a.service, ` · `, a.place]) })]) }), (0, x.jsxs)("span", { children: urdu([(0, x.jsx)("small", { children: urdu(`CUSTOMER`) }), (0, x.jsx)("b", { children: urdu(a.customer?.name || `Walk-in guest`) })]) }), (0, x.jsxs)("span", { children: urdu([(0, x.jsx)("small", { children: urdu(`PAYMENT`) }), (0, x.jsx)(oe, { value: a.paymentStatus })]) })]) }), <div className="invoice-money-summary"><article><span>{urdu("کل رقم")}</span><strong>{urdu(E(a.total))}</strong></article><article><span>{urdu("حاصل شدہ رقم")}</span><strong>{urdu(E(a.net))}</strong></article><article className={a.balance>0?"balance-due":"balance-paid"}><span>{urdu("باقی رقم")}</span><strong>{urdu(E(a.balance))}</strong></article></div>, (0, x.jsxs)("div", { className: `receipt-lines`, children: urdu([(0, x.jsxs)("div", { className: `line-head`, children: urdu([(0, x.jsx)("span", { children: urdu(`ITEM / VARIANT`) }), (0, x.jsx)("span", { children: urdu(`QTY`) }), (0, x.jsx)("span", { children: urdu(`RATE`) }), (0, x.jsx)("span", { children: urdu(`AMOUNT`) })]) }), a.items.map(e => (0, x.jsxs)("div", { children: urdu([(0, x.jsxs)("span", { children: urdu([(0, x.jsx)("strong", { children: urdu(e.name) }), (0, x.jsxs)("small", { children: urdu([e.variant, ` · `, e.unit]) })]) }), (0, x.jsx)("span", { children: urdu(e.qty / 1e3) }), (0, x.jsx)("span", { children: urdu(E(e.price)) }), (0, x.jsx)("b", { children: urdu(E(e.amount)) })]) }, e.id))]) }), (0, x.jsx)("div", { className: `receipt-total`, children: urdu([[`Subtotal`, a.subtotal], [`Discount`, -a.discount], [`Tax`, a.tax], [`Service charge`, a.serviceCharge], [`Grand total`, a.total], [`Payments received`, a.received], [`Refunds`, a.refunded], [`Net received`, a.net], [`Outstanding`, a.balance], [`Change returned`, a.change]].map(([e, t]) => (0, x.jsxs)("div", { "data-total": e, children: urdu([(0, x.jsx)("span", { children: urdu(T[e] || e) }), (0, x.jsx)("b", { children: urdu(E(t)) })]) }, e))) }), (0, x.jsxs)("footer", { className: `app-receipt-footer`, children: urdu([(0, x.jsxs)("div", { className: `footer-top-details`, children: [(0, x.jsxs)("div", { className: `footer-company-block`, children: [a.restaurant.logo && (0, x.jsx)("img", { src: a.restaurant.logo, className: `footer-company-img`, alt: `Logo` }), (0, x.jsxs)("div", { children: [(0, x.jsx)("p", { className: `footer-thanks-text`, children: urdu(a.restaurant.footer || "تشریف لانے کا شکریہ۔") }), (0, x.jsxs)("p", { className: `footer-phone-text`, children: [(0, x.jsx)("strong", { children: urdu("فون نمبر: ") }), (0, x.jsx)("bdi", { dir: `ltr`, children: a.restaurant.phone || "051 6122024" })] })] })] }), (0, x.jsxs)("div", { className: `footer-meta-block`, children: [(0, x.jsx)("small", { children: urdu("یہ محفوظ بل ہے۔") }), (0, x.jsxs)("small", { children: [urdu("نسخہ "), a.revision, ` · `, a.number] })] })] }), (0, x.jsxs)("div", { className: `footer-tech-credit`, children: [(0, x.jsx)("span", { children: urdu("سافٹ ویئر برائے ریسٹورنٹ:") }), (0, x.jsxs)("div", { className: `tech-badge`, children: [(0, x.jsx)("img", { src: HH_TECH_HUB_LOGO, className: `hh-tech-logo-img`, alt: `HH Tech Hub` }), (0, x.jsx)("strong", { children: `HH TECH HUB` })] })] })]) }), (0, x.jsx)(PaymentHistory, { payments: a.payments, refunds: a.refunds })]) }), (0, x.jsxs)("aside", { className: `invoice-actions`, "data-panel": s, children: urdu([s === `invoice` ? (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("span", { className: `eyebrow`, children: urdu(`NEXT STEP`) }), (0, x.jsx)("h3", { children: urdu(a.balance ? `Receive payment now or later` : `Invoice settled`) }), (0, x.jsx)("p", { children: urdu(a.balance > 0 ? "آرڈر باورچی خانے کو بھیج دیا گیا ہے۔ گاہک سے باقی رقم وصول کریں۔" : "اس بل کی پوری رقم وصول ہو گئی ہے۔ اب بل پرنٹ کریں یا گاہک کو بھیج دیں۔") }), w !== i.revision && (0, x.jsx)("p", { className: `external-note`, children: urdu(`Historical invoice revision. Choose the latest revision to receive payment or refund. Payment figures show the current ledger.`) }), w === i.revision && a.balance > 0 && a.state !== `cancelled` && (0, x.jsx)("button", { className: `primary big`, onClick: () => { c(`payment`), u(String(a.balance / 100)); }, children: urdu(`Receive Payment / Paisay lein`) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Receipt format`) }), (0, x.jsxs)("select", { value: y, onChange: e => { C(e.target.value), g(null); }, children: urdu([(0, x.jsx)("option", { children: urdu(`A4`) }), (0, x.jsx)("option", { value: `80mm`, children: urdu(`80 mm thermal`) })]) })]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Saved revision for print / download`) }), (0, x.jsx)("select", { value: w, onChange: e => { ee(Number(e.target.value)), g(null); }, children: urdu(a.revisions.map(e => (0, x.jsxs)("option", { value: e.revision, children: urdu([`Revision `, e.revision, ` · `, D(e.created)]) }, e.revision))) })]) }), (0, x.jsxs)("div", { className: `action-grid`, children: urdu([(0, x.jsxs)("button", { disabled: w !== a.revision, onClick: () => c(`share`), children: urdu([(0, x.jsx)(S, { name: `send` }), (0, x.jsx)("strong", { children: urdu(`WhatsApp sharing`) })]) }), (0, x.jsxs)("button", { onClick: () => window.open(ie(`print`), `_blank`), children: urdu([(0, x.jsx)(S, { name: `printer` }), (0, x.jsxs)("strong", { children: urdu([`Print `, y]) })]) }), (0, x.jsxs)("button", { disabled: te, onClick: k, children: urdu([(0, x.jsx)(S, { name: `download` }), (0, x.jsx)("strong", { children: urdu(te ? `Preparing PDF…` : `Download PDF`) })]) }), (0, x.jsx)("button", { onClick: () => window.open(`/api/invoices/` + e + `/kitchen?size=80mm`, `_blank`), children: urdu(`Print kitchen ticket`) })]) }), w === i.revision && n.user.role === `Owner` && a.net > 0 && (0, x.jsx)("button", { className: `secondary`, onClick: () => c(`refund`), children: urdu(`Issue authorized refund`) }), (0, x.jsx)("button", { className: `secondary`, onClick: t, children: urdu(`Done`) })]) }) : s === `payment` ? (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("button", { className: `back-link`, onClick: () => c(`invoice`), children: urdu(`← Back`) }), (0, x.jsxs)("h3", { children: urdu([`Outstanding `, E(a.balance)]) }), (0, x.jsx)("div", { className: `pay-methods`, children: urdu([`Cash`, `Card`, `Bank/Wallet`].map(e => (0, x.jsx)("button", { className: d === e ? `active` : ``, onClick: () => f(e), children: urdu(e) }, e))) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(d === `Cash` ? `Cash tendered (PKR)` : `Amount received (PKR)`) }), (0, x.jsx)(UrduInput, { type: `number`, step: `.01`, min: `.01`, value: l, onChange: e => u(e.target.value) })]) }), (0, x.jsxs)("div", { className: `change-box`, children: urdu([(0, x.jsx)("span", { children: urdu(`Change returned`) }), (0, x.jsx)("strong", { children: urdu(E(d === `Cash` ? Math.max(0, Math.round(Number(l) * 100) - a.balance) : 0)) })]) }), (0, x.jsx)(he, { onClick: async () => { o(await r("payments", { id: e, version: a.version, amount: O(l), method: d })), c(`invoice`), g(null); }, children: urdu(`Record payment`) }), (0, x.jsx)("p", { children: urdu(`Cash, card and bank/wallet are recorded tenders.`) })]) }) : s === `refund` ? (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("button", { className: `back-link`, onClick: () => c(`invoice`), children: urdu(`← Back`) }), (0, x.jsxs)("h3", { children: urdu([`Refundable `, E(a.net)]) }), (0, x.jsx)(ce, { fields: [{ name: `amount`, label: `Refund PKR`, type: `number` }, { name: `method`, label: `Refund method`, options: [`Cash`, `Card`, `Bank/Wallet`].map(e => ({ value: e, label: e })) }, { name: `reason`, label: `Reason`, type: `textarea` }], submit: async (t) => { o(await r("refunds", { ...t, id: e, version: a.version, amount: O(t.amount) })), c(`invoice`), g(null); } }), (0, x.jsx)("p", { children: urdu(`Refund lowers the collectible value; it does not create new customer debt.`) })]) }) : (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("button", { className: `back-link`, onClick: () => c(`invoice`), children: urdu(`← Back`) }), (0, x.jsxs)("h3", { children: urdu([`Share `, a.number, ` · r`, w]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Confirm recipient mobile`) }), (0, x.jsx)(UrduInput, { value: p, placeholder: urdu(`03XX XXXXXXX`), onChange: e => m(e.target.value) })]) }), (0, x.jsxs)("p", { children: urdu([`Bill total `, E(a.total), ` · Balance `, E(a.balance)]) }), (0, x.jsx)("button", { className: `secondary`, disabled: te, onClick: k, children: urdu(te ? `Preparing PDF…` : `1. Prepare & download PDF`) }), h && (0, x.jsxs)(x.Fragment, { children: urdu([(0, x.jsx)("p", { className: `success`, children: urdu(`PDF prepared. Confirm the recipient inside your sharing app.`) }), navigator.canShare?.({ files: [h] }) && (0, x.jsx)(he, { onClick: async () => { await navigator.share({ files: [h], title: urdu(a.number), text: `Invoice for ` + p }); }, children: urdu(`Share PDF through device`) }), (0, x.jsx)(he, { secondary: !0, onClick: async () => {
                                                        let e = p.replace(/[\s()+-]/g, ``).replace(/^0092/, `92`).replace(/^0/, `92`);
                                                        if (!/^923\d{9}$/.test(e))
                                                            throw Error(`Confirm a Pakistani mobile number`);
                                                        let t = (a.restaurant.name || "Dastarkhwan") + `
Phone: ` + (a.restaurant.phone || "051 6122024") + `
Invoice ` + a.number + ` revision ` + w + `
` + a.items.map(e => e.name + ` ` + e.variant + ` × ` + e.qty / 1e3 + ` = ` + E(e.amount)).join(`
`) + `
Total: ` + E(a.total) + `
Net received: ` + E(a.net) + `
Balance: ` + E(a.balance) + `
Please see attached complete invoice PDF.`;
                                                        window.open(`https://wa.me/` + e + `?text=` + encodeURIComponent(t), `_blank`, `noopener`);
                                                    }, children: urdu(`2. Open WhatsApp with bill message`) })]) }), (0, x.jsx)("p", { className: `external-note`, children: urdu(`On desktop, attach the downloaded PDF in WhatsApp before sending. Handoff is not confirmed delivery.`) })]) }), _ && (0, x.jsx)("p", { className: `error`, role: `alert`, children: urdu(_) })]) })]) }), (0, x.jsx)(BottomClose, { onClose: t })]) })) }) : (0, x.jsx)(se, { title: urdu("\u0628\u0644 \u06A9\u06BE\u0644 \u0631\u06C1\u0627 \u06C1\u06D2"), onClose: t, children: urdu((0, x.jsx)("p", { children: urdu(`Waiting for shared records to reconnect...`) })) });
}
function _e() { let { data: e, mutate: t, notice: n } = ne(), [r, i] = (0, b.useState)(``), [a, o] = (0, b.useState)(null); return (0, x.jsxs)("div", { className: `page-content menu-workspace`, children: urdu([(0, x.jsxs)("div", { className: `page-heading`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h2", { children: urdu(`Food menu`) }), (0, x.jsx)("p", { children: urdu(`کھانے، تصاویر، قیمتیں اور دستیابی ایک جگہ سنبھالیں۔`) })]) }), (0, x.jsx)("button", { className: `primary compact`, onClick: () => o({ name: ``, category: `Karahi & Handi`, image: ``, available: 1, variants: [{ name: `Regular`, unit: `portion`, price: 0, step: 1e3, portions: null }] }), children: urdu(`+ Apna khana add karein`) })]) }), <div className="menu-overview"><article><span>{urdu("کل کھانے")}</span><bdi>{e.menu.length}</bdi></article><article><span>{urdu("موجود کھانے")}</span><bdi>{e.menu.filter((dish:any)=>dish.available).length}</bdi></article><article><span>{urdu("ختم شدہ کھانے")}</span><bdi>{e.menu.filter((dish:any)=>!dish.available).length}</bdi></article></div>, (0, x.jsx)("div", { className: "catalog-menu-entry", children: urdu((0, x.jsx)(DishCatalog, { menu: e.menu, allowEdit: true, onPick: o })) }), (0, x.jsxs)("label", { className: `search`, children: urdu([(0, x.jsx)(S, { name: `search` }), (0, x.jsx)(UrduInput, { placeholder: urdu("\u06A9\u06BE\u0627\u0646\u06D2 \u06A9\u0627 \u0646\u0627\u0645 \u0644\u06A9\u06BE\u06CC\u06BA\u2026"), value: r, onChange: e => i(e.target.value) })]) }), (0, x.jsx)("div", { className: `food-grid managed-menu`, children: urdu(e.menu.filter(e => [e.name, String(urdu(e.name))].some(name => name.toLowerCase().includes(r.trim().toLowerCase()))).map(e => (0, x.jsxs)("article", { className: `food-card`, "data-available": Boolean(e.available), children: urdu([(0, x.jsx)("div", { className: `food-photo`, children: urdu((0, x.jsx)("img", { src: e.image || C.curry, alt: e.name, loading: `lazy` })) }), (0, x.jsxs)("div", { className: `food-info`, children: urdu([(0, x.jsx)("h3", { children: urdu(e.name) }), (0, x.jsx)("small", { className: "menu-category", children: urdu(e.category) }), e.variants.map(e => (0, x.jsxs)("p", { className: "menu-price-line", children: urdu([e.name, ` · `, E(e.price), ` / `, e.unit, e.portions === null ? `` : ` · ` + e.portions / 1e3 + ` remaining`]) }, e.id)), (0, x.jsx)(oe, { value: e.available ? `Available` : `Sold out` }), (0, x.jsxs)("div", { className: `row-actions`, children: urdu([(0, x.jsx)("button", { onClick: () => o(structuredClone(e)), children: urdu(`Edit dish`) }), (0, x.jsxs)(he, { secondary: !0, onClick: async () => { await t("menu/save", { ...e, available: !e.available }); }, children: urdu([` `, e.available ? `Mark sold out` : `Make available`]) })]) })]) })]) }, e.id))) }), (0, x.jsxs)("p", { className: `muted`, children: urdu([(0, x.jsx)("a", { href: `/media/photo-credits.html`, target: `_blank`, rel: `noreferrer`, children: urdu(`Dish photo credits`) }), ` اپنی تصویر لگانے کے لیے «کھانا بدلیں» دبائیں۔`]) }), a && (0, x.jsx)(se, { className: "dish-editor-dialog", title: urdu(a.id ? `Edit dish` : `Add dish`), onClose: () => o(null), children: urdu((0, x.jsx)(ve, { item: a, onSave: async (e) => { await t(`menu/save`, e), o(null), n(`Menu saved. Existing invoice prices retained.`); }, onArchive: a.id ? async () => { await t("menu/archive", { id: a.id }), o(null); } : void 0 })) })]) }); }
const dishSizes = ["Half", "Full", "Regular", "Piece", "Small", "Medium", "Large"];
const sizeKey = (name: string) => { const key=String(name).trim().toLowerCase(); const aliases:Record<string,string>={"آدھا":"half","آدھی":"half","پورا":"full","پوری":"full","ایک پلیٹ":"regular"}; return aliases[key]||key; };
function DishSizeSelect({value,others,onChange}:any){
 const [custom,setCustom]=b.useState(!dishSizes.some(size=>sizeKey(size)===sizeKey(value)));
 const selected=dishSizes.find(size=>sizeKey(size)===sizeKey(value));
 return <div className="dish-size-select"><select aria-label="Portion size" value={custom?"custom":selected||""} onChange={event=>{const next=event.target.value;setCustom(next==="custom");onChange(next==="custom"?"":next)}}><option value="" disabled>{urdu("مقدار منتخب کریں")}</option>{dishSizes.map(size=><option key={size} value={size} disabled={others.some((name:string)=>sizeKey(name)===sizeKey(size))}>{urdu(size)}</option>)}<option value="custom">{urdu("اپنی مقدار لکھیں")}</option></select>{custom&&<UrduInput required aria-label="Custom portion size" placeholder={urdu("مثلاً فیملی پلیٹر")} value={value} onChange={(event:any)=>onChange(event.target.value)}/>}</div>;
}

function ve({ item: e, onSave: t, onArchive: n }) {
    const { data: catalogData } = ne();
    let [r, i] = (0, b.useState)(e), [a, o] = (0, b.useState)(``), [s, c] = (0, b.useState)(!1), l = (0, b.useRef)(!1);
    return (0, x.jsxs)("form", { className: `menu-edit-form`, onSubmit: async (e) => {
            if (e.preventDefault(), !l.current) {
                const names=r.variants.map(variant=>sizeKey(variant.name));
                if(names.some(name=>!name)||new Set(names).size!==names.length){o("ہر مقدار کا الگ نام منتخب کریں۔ ایک ہی مقدار دوبارہ شامل نہیں ہو سکتی۔");return;}
                l.current = !0, c(!0), o(``);
                try {
                    await t({ ...r, variants: r.variants.map(e => ({ ...e, price: O(e.priceInput ?? String(e.price / 100)), cost: e.costInput === `` ? null : e.costInput === void 0 ? e.cost ?? null : O(e.costInput), step: ie(e.stepInput ?? String(e.step / 1e3)), portions: e.portionsInput === `` ? null : e.portionsInput === void 0 ? e.portions : ie(e.portionsInput) })) });
                }
                catch (e) {
                    o(e.message);
                }
                finally {
                    l.current = !1, c(!1);
                }
            }
        }, children: urdu([!r.id && (0, x.jsx)("div", { className: "catalog-form-entry", children: urdu((0, x.jsx)(DishCatalog, { menu: catalogData.menu, onPick: i })) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu("کھانے کا نام") }), (0, x.jsx)(UrduInput, { required: !0, placeholder: urdu("\u0645\u062B\u0644\u0627\u064B \u0686\u06A9\u0646 \u06A9\u0691\u0627\u06C1\u06CC"), value: urdu(r.name), onChange: e => i({ ...r, name: e.target.value }) })]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Khanay ki category`) }), (0, x.jsx)(UrduInput, { required: !0, list: `dish-categories`, value: urdu(r.category), onChange: e => i({ ...r, category: e.target.value }) }), (0, x.jsx)("datalist", { id: `dish-categories`, children: urdu([`Karahi & Handi`, `Biryani & Pulao`, `BBQ & Sajji`, `Paratha & Breads`, `Daal & Sabzi`, `Sides`, `Breakfast & Specials`, `Desserts`, `Drinks`].map(e => (0, x.jsx)("option", { children: urdu(e) }, e))) })]) }), (0, x.jsx)(M, { onUpload: e => i(t => ({ ...t, image: e, catalogPhoto: false })), current: r.image }), r.image && (0, x.jsx)("img", { className: `dish-upload-preview`, src: r.image, alt: `Dish photo` }), r.catalogPhoto && (0, x.jsx)("p", { className: `catalog-image-hint`, children: urdu(`یہ نمونے کی تصویر ہے۔ اپنی تصویر لگانے کے لیے «تصویر تبدیل کریں» دبائیں۔`) }), (0, x.jsxs)("label", { className: `check-field`, children: urdu([(0, x.jsx)(UrduInput, { type: `checkbox`, checked: !!r.available, onChange: e => i({ ...r, available: e.target.checked }) }), ` Aaj yeh khana mil raha hai`]) }), (0, x.jsx)("h3", { children: urdu(`Plate / Half / Full ka rate aur lagat`) }), (0, x.jsx)("p", { className: `muted`, children: urdu(`Lagat mein gosht, masala, oil aur doosray ingredients ka kharcha dalein. Salary, rent, bijli alag Kharchay mein dalein.`) }), r.variants.map((e, t) => { let n = (e, n) => i({ ...r, variants: r.variants.map((r, i) => t === i ? { ...r, [e]: n } : r) }); return (0, x.jsxs)("div", { className: `variant-editor`, children: urdu([(0, x.jsxs)("div", { className: `simple-price-fields`, children: urdu([(0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Size / plate`) }), (0, x.jsx)(DishSizeSelect, {value:e.name, others:r.variants.filter((_,index)=>index!==t).map(variant=>variant.name), onChange:value=>n(`name`,value)})]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Bechnay ka rate PKR`) }), (0, x.jsx)(UrduInput, { required: !0, type: `number`, min: `0`, step: `0.01`, value: e.priceInput ?? e.price / 100, onChange: e => n(`priceInput`, e.target.value) })]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Banane ki lagat PKR`) }), (0, x.jsx)(UrduInput, { type: `number`, min: `0`, step: `0.01`, placeholder: urdu(`Munafa ke liye zaroori`), value: e.costInput ?? (e.cost == null ? `` : e.cost / 100), onChange: e => n(`costInput`, e.target.value) })]) })]) }), (0, x.jsxs)("details", { className: "dish-stock-settings", children: urdu([(0, x.jsx)("summary", { children: urdu(`Wazan / stock ki mazeed setting`) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Unit`) }), (0, x.jsx)("select", { value: e.unit, onChange: e => n(`unit`, e.target.value), children: urdu([`portion`, `piece`, `kg`, `litre`, `bowl`, `bottle`].map(e => (0, x.jsx)("option", { children: urdu(e) }, e))) })]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Quantity increment`) }), (0, x.jsx)(UrduInput, { type: "number", min: "0.001", step: "0.001", value: e.stepInput ?? e.step / 1e3, onChange: e => n(`stepInput`, e.target.value) })]) }), (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Kitni tayyar hain? (khali = limit nahi)`) }), (0, x.jsx)(UrduInput, { type: "number", min: "0", step: "0.001", value: e.portionsInput ?? (e.portions == null ? `` : e.portions / 1e3), onChange: e => n(`portionsInput`, e.target.value) })]) })]) }), r.variants.length > 1 && (0, x.jsx)("button", { type: `button`, className: `text-button`, onClick: () => i({ ...r, variants: r.variants.filter((e, n) => t !== n) }), children: urdu(`Yeh size hata dein`) })]) }, t); }), (0, x.jsx)("button", { type: `button`, className: `secondary`, onClick: () => i({ ...r, variants: [...r.variants, { name: dishSizes.find(size=>!r.variants.some(variant=>sizeKey(variant.name)===sizeKey(size))) || "", unit: `portion`, price: 0, step: 1e3, portions: null }] }), children: urdu(`+ Half / Full ya doosra size add karein`) }), a && (0, x.jsx)("p", { className: `error`, children: urdu(a) }), (0, x.jsx)("button", { className: `primary wide`, disabled: s, children: urdu(`Khana save karein`) }), n && (0, x.jsx)(he, { secondary: !0, onClick: n, children: urdu(`Archive dish (history retained)`) })]) });
}
function ye() { let { data: e, mutate: t, openInvoice: n } = ne(), [r, i] = (0, b.useState)(``), [a, o] = (0, b.useState)(null), [s, c] = (0, b.useState)(null), l = e.customers.filter(e => (e.name + ` ` + e.phone).toLowerCase().includes(r.replace(/[+\s-]/g, ``).replace(/^0/, `92`).toLowerCase()) || e.name.toLowerCase().includes(r.toLowerCase())), u = t => e.orders.filter(e => e.customer_id === t.id); return (0, x.jsxs)("div", { className: `page-content customers-workspace`, children: urdu([(0, x.jsxs)("div", { className: `page-heading`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h2", { children: urdu(`Customers`) }), (0, x.jsx)("p", { children: urdu(`Visits, purchase history and outstanding invoices`) })]) }), (0, x.jsx)("button", { className: `primary compact`, onClick: () => o({}), children: urdu(`+ Add customer`) })]) }), <div className="customer-overview"><article><span>{urdu("کل گاہک")}</span><bdi>{e.customers.length}</bdi></article><article><span>{urdu("باقی رقم والے گاہک")}</span><bdi>{e.customers.filter(customer=>u(customer).some(order=>order.balance>0)).length}</bdi></article><article className="due"><span>{urdu("کل باقی رقم")}</span><strong>{urdu(E(e.customers.reduce((sum,customer)=>sum+u(customer).reduce((amount,order)=>amount+order.balance,0),0)))}</strong></article></div>, (0, x.jsxs)("label", { className: `search`, children: urdu([(0, x.jsx)(S, { name: `search` }), (0, x.jsx)(UrduInput, { value: r, onChange: e => i(e.target.value), placeholder: urdu("\u0646\u0627\u0645 \u06CC\u0627 \u0645\u0648\u0628\u0627\u0626\u0644 \u0646\u0645\u0628\u0631\u2026") })]) }), (0, x.jsxs)("div", { className: `data-card table-wrap`, children: urdu([(0, x.jsxs)("table", { className: `business-table`, children: urdu([(0, x.jsx)("thead", { children: urdu((0, x.jsxs)("tr", { children: urdu([(0, x.jsx)("th", { children: urdu(`Customer`) }), (0, x.jsx)("th", { children: urdu(`Visits / Last visit`) }), (0, x.jsx)("th", { children: urdu(`Purchases`) }), (0, x.jsx)("th", { children: urdu(`Outstanding`) }), (0, x.jsx)("th", { children: urdu(`Actions`) })]) })) }), (0, x.jsx)("tbody", { children: urdu(l.map(e => { let t = u(e); return (0, x.jsxs)("tr", { children: urdu([(0, x.jsxs)("td", { children: urdu([e.name, <small className="customer-phone"><bdi dir="ltr">+{e.phone}</bdi></small>]) }), (0, x.jsxs)("td", { children: urdu([t.length, (0, x.jsx)("small", { children: urdu(t[0] ? D(t[0].created) : `No visits yet`) })]) }), (0, x.jsx)("td", { children: urdu(E(t.filter(e => e.state !== `cancelled`).reduce((e, t) => e + t.total - t.refunded, 0))) }), (0, x.jsx)("td", { className: t.some(order=>order.balance>0)?"customer-due":"customer-settled", children: urdu(E(t.reduce((e, t) => e + t.balance, 0))) }), (0, x.jsx)("td", { children: urdu((0, x.jsxs)("div", { className: `row-actions`, children: urdu([(0, x.jsx)("button", { onClick: () => c(e), children: urdu(`History / Collect`) }), (0, x.jsx)("button", { onClick: () => o(e), children: urdu(`Edit`) })]) })) })]) }, e.id); })) })]) }), !l.length && (0, x.jsx)("p", { className: `empty-state`, children: urdu(`No customers. Guest orders remain available.`) })]) }), a && (0, x.jsx)(se, { className: "customer-editor-dialog", title: urdu(a.id ? `Edit customer` : `Add customer`), onClose: () => o(null), children: urdu((0, x.jsx)(CustomerForm, { initial: a, onSave: async (e) => { await t(`customers/save`, e), o(null); } })) }), s && (0, x.jsxs)(se, { className: "customer-history-dialog", title: urdu(s.name + ` · Order history`), onClose: () => c(null), children: urdu([(0, x.jsxs)("p", { children: urdu([`+`, s.phone, ` · `, s.note]) }), u(s).map(e => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([e.number, (0, x.jsx)("small", { children: urdu(D(e.created)) })]) }), (0, x.jsxs)("strong", { children: urdu([E(e.balance), ` due`]) }), (0, x.jsx)("button", { className: `secondary`, onClick: () => { c(null), n(e.id); }, children: urdu(`Invoice / Collect`) })]) }, e.id))]) })]) }); }
function be() { let { data: e, mutate: t } = ne(), [n, r] = (0, b.useState)(`Ingredients`), [i, a] = (0, b.useState)(null), o = le(e.ingredients, e => e.name + ` · ` + e.unit + ` · ` + e.stock / 1e3 + ` available`); le(e.suppliers); let s = { ingredient: [{ name: `name`, label: `Ingredient name` }, { name: `unit`, label: `Base unit`, options: [`kg`, `litre`, `piece`].map(e => ({ value: e, label: e })) }, { name: `low`, label: `Low stock threshold`, type: `number`, step: `.001` }], movement: [{ name: `ingredientId`, label: `Ingredient`, options: o }, { name: `kind`, label: `Movement type`, options: [{ value: `opening`, label: `Opening balance (once)` }, { value: `in`, label: `Stock in` }, { value: `consumption`, label: `Manual consumption` }, { value: `wastage`, label: `Wastage` }, { value: `adjustment`, label: `Adjustment (+/-)` }] }, { name: `qty`, label: `Quantity in base unit`, type: `number`, step: `.001` }, { name: `reference`, label: `Order / source reference (optional)`, required: !1 }, { name: `reason`, label: `Reason / traceability`, type: `textarea` }], supplier: [{ name: `name`, label: `Supplier name` }, { name: `phone`, label: `Pakistani mobile (optional)`, required: !1 }], payment: [{ name: `supplierId`, label: `Supplier`, options: le(e.suppliers, e => e.name + ` · ` + E(e.balance) + ` due`) }, { name: `amount`, label: `Amount PKR`, type: `number` }, { name: `method`, label: `Method`, options: [`Cash`, `Card`, `Bank/Wallet`].map(e => ({ value: e, label: e })) }] }; return (0, x.jsxs)("div", { className: `page-content stock-workspace`, children: urdu([(0, x.jsx)("div", { className: `subnav`, children: urdu([`Ingredients`, `Movement history`, `Purchases`, `Suppliers`].map(e => (0, x.jsx)("button", { className: n === e ? `active` : ``, onClick: () => r(e), children: urdu({Ingredients:"سامان", "Movement history":"آمد و استعمال", Purchases:"خریداری", Suppliers:"سپلائرز"}[e] || e) }, e))) }), (0, x.jsxs)("div", { className: `page-heading`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)("h2", { children: urdu(`Stock & Purchases`) }), (0, x.jsx)("p", { children: urdu(`Manual consumption · quantities stored to 0.001 base unit`) })]) }), (0, x.jsxs)("div", { className: `row-actions`, children: urdu([(0, x.jsx)("button", { onClick: () => a({ kind: `ingredient`, value: {} }), children: urdu(`+ Ingredient`) }), (0, x.jsx)("button", { onClick: () => a({ kind: `movement`, value: {} }), children: urdu(`Stock movement`) }), (0, x.jsx)("button", { onClick: () => a({ kind: `purchase`, value: {} }), children: urdu(`Receive purchase`) }), (0, x.jsx)("button", { onClick: () => a({ kind: `supplier`, value: {} }), children: urdu(`+ Supplier`) })]) })]) }), <div className="stock-overview"><article><span>{urdu("سامان کی اقسام")}</span><bdi>{e.ingredients.length}</bdi></article><article><span>{urdu("مناسب اسٹاک")}</span><bdi>{e.ingredients.filter(item=>item.stock>item.low).length}</bdi></article><article className="low"><span>{urdu("کم اسٹاک")}</span><bdi>{e.ingredients.filter(item=>item.stock<=item.low).length}</bdi></article><article><span>{urdu("سپلائرز")}</span><bdi>{e.suppliers.length}</bdi></article></div>, n === `Ingredients` && (0, x.jsx)("div", { className: `kitchen-grid`, children: urdu(e.ingredients.map(e => (0, x.jsxs)("article", { className: `kitchen-card stock-item`, "data-low":e.stock<=e.low, children: urdu([(0, x.jsx)(S,{name:"stock",size:24}),(0, x.jsx)("h3", { children: urdu(e.name) }), (0, x.jsxs)("h2", { children: urdu([e.stock / 1e3, ` `, e.unit]) }), (0, x.jsx)(oe, { value: e.stock <= e.low ? `Low stock` : `Healthy` }), (0, x.jsxs)("p", { children: urdu([`Alert threshold `, e.low / 1e3, ` `, e.unit]) }), (0, x.jsx)("button", { className: `secondary`, onClick: () => a({ kind: `movement`, value: { ingredientId: e.id, kind: `consumption` } }), children: urdu(`Record movement`) }), (0, x.jsx)("button", { className: `text-button`, onClick: () => a({ kind: `ingredient`, value: { ...e, low: e.low / 1e3 } }), children: urdu(`Edit threshold`) })]) }, e.id))) }), n === `Movement history` && (0, x.jsx)("div", { className: `data-card table-wrap`, children: urdu((0, x.jsxs)("table", { className: `business-table`, children: urdu([(0, x.jsx)("thead", { children: urdu((0, x.jsx)("tr", { children: urdu([`Time / actor`, `Ingredient`, `Movement`, `Quantity`, `Reference / reason`].map(e => (0, x.jsx)("th", { children: urdu(e) }, e))) })) }), (0, x.jsx)("tbody", { children: urdu(e.movements.map(e => (0, x.jsxs)("tr", { children: urdu([(0, x.jsxs)("td", { children: urdu([D(e.created), (0, x.jsx)("small", { children: urdu(e.actor_name) })]) }), (0, x.jsx)("td", { children: urdu(e.name) }), (0, x.jsx)("td", { children: urdu(e.kind) }), (0, x.jsxs)("td", { children: urdu([e.qty / 1e3, ` `, e.unit]) }), (0, x.jsxs)("td", { children: urdu([e.reference, (0, x.jsx)("small", { children: urdu(e.reason) })]) })]) }, e.id))) })]) })) }), n === `Purchases` && (0, x.jsx)("div", { className: `data-card`, children: urdu(e.purchases.map(t => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([(0, x.jsxs)("strong", { children: urdu([`Purchase #`, t.id, ` ·`, ` `, e.suppliers.find(e => e.id === t.supplier_id)?.name]) }), (0, x.jsx)("small", { children: urdu(D(t.created)) }), t.items.map(e => (0, x.jsxs)("small", { children: urdu([e.name, ` · `, e.qty / 1e3, ` `, e.unit, ` @ `, E(e.cost)]) }, e.id))]) }), (0, x.jsx)("b", { children: urdu(E(t.total)) })]) }, t.id))) }), n === `Suppliers` && (0, x.jsx)("div", { className: `kitchen-grid`, children: urdu(e.suppliers.map(t => (0, x.jsxs)("article", { className: `kitchen-card`, children: urdu([(0, x.jsx)("h3", { children: urdu(t.name) }), (0, x.jsx)("p", { children: urdu(t.phone) }), (0, x.jsxs)("p", { children: urdu([`Outstanding `, E(t.balance)]) }), (0, x.jsx)("button", { className: `secondary`, onClick: () => a({ kind: `payment`, value: { supplierId: t.id, method: `Cash` } }), children: urdu(`Pay existing balance`) }), (0, x.jsx)("button", { className: `text-button`, onClick: () => a({ kind: `supplier`, value: t }), children: urdu(`Edit supplier`) }), (0, x.jsx)("h4", { children: urdu(`Purchases`) }), e.purchases.filter(e => e.supplier_id === t.id).map(e => (0, x.jsxs)("small", { className: `block`, children: urdu([`Purchase #`, e.id, ` · `, D(e.created), ` ·`, ` `, E(e.total)]) }, e.id)), (0, x.jsx)("h4", { children: urdu(`Payments`) }), e.supplierPayments.filter(e => e.supplier_id === t.id).map(e => (0, x.jsxs)("small", { className: `block`, children: urdu([D(e.created), ` · `, e.method, ` · `, E(e.amount)]) }, e.id))]) }, t.id))) }), i && (0, x.jsx)(se, { className: "stock-editor-dialog", title: urdu({ ingredient: `Ingredient`, movement: `Record stock movement`, purchase: `Receive purchase`, supplier: `Supplier`, payment: `Supplier payment` }[i.kind] || ``), onClose: () => a(null), children: urdu(i.kind === `purchase` ? (0, x.jsx)(xe, { data: e, submit: async (e) => { await t(`purchases`, e), a(null); } }) : (0, x.jsx)(i.kind === `ingredient` ? IngredientEditor : ce, { Form: ce, ingredients: e.ingredients, fields: s[i.kind], initial: i.value, submit: async (e) => { let n = { ingredient: `ingredients/save`, movement: `stock/move`, supplier: `suppliers/save`, payment: `suppliers/pay` }, r = { ...e }; i.kind === `ingredient` && (r.low = ie(e.low)), i.kind === `movement` && (r.ingredientId = Number(e.ingredientId), r.qty = ie(e.qty)), i.kind === `payment` && (r.supplierId = Number(e.supplierId), r.amount = O(e.amount)), await t(n[i.kind], r), a(null); } })) })]) }); }
function xe({ data: e, submit: t }) { let [n, r] = (0, b.useState)([{ ingredientId: ``, qty: ``, cost: `` }]); return (0, x.jsxs)(ce, { fields: [{ name: `supplierId`, label: `Supplier`, options: le(e.suppliers) }, { name: `paid`, label: `Amount paid now PKR`, type: `number` }, { name: `method`, label: `Payment method`, options: [`Cash`, `Card`, `Bank/Wallet`].map(e => ({ value: e, label: e })) }], initial: { paid: `0`, method: `Cash` }, submit: async (e) => { await t({ ...e, supplierId: Number(e.supplierId), paid: O(e.paid), items: n.map(e => ({ ingredientId: Number(e.ingredientId), qty: ie(e.qty), cost: O(e.cost) })) }); }, label: `Receive purchase once`, children: urdu([(0, x.jsx)("h3", { children: urdu(`Purchase items`) }), n.map((t, i) => (0, x.jsxs)("div", { className: `variant-editor`, children: urdu([(0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(`Ingredient / base unit`) }), (0, x.jsxs)("select", { "aria-label": `Ingredient / base unit`, required: !0, value: t.ingredientId, onChange: e => r(t => t.map((t, n) => n === i ? { ...t, ingredientId: e.target.value } : t)), children: urdu([(0, x.jsx)("option", { value: ``, children: urdu(`Choose…`) }), e.ingredients.map(e => (0, x.jsxs)("option", { value: e.id, children: urdu([e.name, ` · `, e.unit]) }, e.id))]) })]) }), [`qty`, `cost`].map(e => (0, x.jsxs)("label", { className: `field`, children: urdu([(0, x.jsx)("span", { children: urdu(e === `qty` ? `Quantity (base unit)` : `Unit cost PKR`) }), (0, x.jsx)(UrduInput, { type: `number`, step: e === `qty` ? `.001` : `.01`, required: !0, value: t[e], onChange: t => r(n => n.map((n, r) => r === i ? { ...n, [e]: t.target.value } : n)) })]) }, e)), (0, x.jsx)("button", { type: `button`, className: `text-button`, onClick: () => r(n.filter((e, t) => t !== i)), children: urdu(`Remove line`) })]) }, i)), (0, x.jsx)("button", { type: `button`, className: `secondary`, onClick: () => r([...n, { ingredientId: ``, qty: ``, cost: `` }]), children: urdu(`+ Add ingredient`) }), (0, x.jsx)("p", { children: urdu(`Receiving increases stock once. Later supplier payments do not receive stock again.`) })]) }); }
function Se() { let { data: e, mutate: t, navigate } = ne(), [n, r] = (0, b.useState)(re()), [i, a] = (0, b.useState)(re()), [o, s] = (0, b.useState)(null), [c, l] = (0, b.useState)(`Aaj`), [u, d] = (0, b.useState)(``), [f, p] = (0, b.useState)(``); let m = e.cash.find(e => !e.closed); return (0, x.jsxs)("div", { className: `page-content`, children: urdu([(0, x.jsxs)("div", { className: `summary-welcome`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsxs)("span", { className: `eyebrow`, children: urdu("منتخب مدت کا مالی حساب") }), (0, x.jsx)("h2", { children: urdu("منافع اور نقصان") }), (0, x.jsx)("p", { children: urdu("آج، اس ہفتے، اس مہینے یا اپنی منتخب تاریخوں کا حساب دیکھیں۔") })]) }), (0, x.jsxs)("div", { className: `row-actions`, children: urdu([(0, x.jsx)("button", { onClick: () => p(`expense`), children: urdu(`+ Kharcha add karein`) }), (0, x.jsx)("button", { onClick: () => p(m ? `close` : `open`), children: urdu(m ? `Cash ka hisaab band karein` : `Cash ka hisaab shuru karein`) })]) })]) }), (0, x.jsx)(ProfitReport, { api: j, data: e, navigate }), (0, x.jsxs)("div", { className: `cash-banner`, children: urdu([(0, x.jsxs)("div", { children: urdu([(0, x.jsx)(S, { name: `cash` }), (0, x.jsxs)("span", { children: urdu([(0, x.jsx)("strong", { children: urdu(m ? `Cash session open` : `No open cash session`) }), (0, x.jsx)("small", { children: urdu(m ? `Opening ` + E(m.opening) + ` · Expected ` + E(m.expected) : `Open a session before taking cash for a shift.`) })]) })]) }), (0, x.jsx)("button", { onClick: () => p(m ? `close` : `open`), children: urdu(m ? `Review cash closing` : `Open cash`) })]) }), (0, x.jsxs)("div", { className: `cash-simple-help`, children: urdu([
 (0, x.jsx)("h3", { children: urdu(`دراز کے پیسوں کا حساب کیسے بنتا ہے؟`) }),
 (0, x.jsx)("p", { children: urdu(`شروع میں دراز میں جتنے پیسے تھے، ان میں گاہکوں سے ملنے والے نقد پیسے جمع ہوتے ہیں۔`) }),
 (0, x.jsx)("p", { children: urdu(`گاہک کو واپس دیے گئے پیسے، نقد خرچ اور سامان والے کو نقد دیے گئے پیسے کم ہوتے ہیں۔`) }),
 (0, x.jsx)("p", { children: urdu(`پرانا ادھار آج نقد ملے تو وہ بھی آج کی دراز کے حساب میں شامل ہوگا۔ کارڈ یا بینک سے ملنے والے پیسے دراز میں شامل نہیں ہوتے۔`) })
]) }), (0, x.jsxs)("div", { className: `dashboard-grid`, children: urdu([(0, x.jsxs)("section", { className: `data-card`, children: urdu([(0, x.jsx)("h3", { children: urdu("تمام درج شدہ اخراجات") }), e.expenses.map(e => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([e.category, (0, x.jsxs)("small", { children: urdu([D(e.created), ` · `, e.method, ` · `, e.note]) })]) }), (0, x.jsx)("b", { children: urdu(E(e.amount)) })]) }, e.id))]) }), (0, x.jsxs)("section", { className: `data-card`, children: urdu([(0, x.jsx)("h3", { children: urdu(`Cash closing history`) }), e.cash.filter(e => e.closed).map(e => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([D(e.closed), (0, x.jsxs)("small", { children: urdu([`Expected `, E(e.expected), ` · Counted `, E(e.counted)]) })]) }), (0, x.jsxs)("b", { children: urdu([`Difference `, E(e.difference)]) })]) }, e.id))]) })]) }), f && (0, x.jsx)(se, { title: urdu(f === `expense` ? `Record expense` : f === `open` ? `Open cash session` : `Close cash session`), onClose: () => p(``), children: urdu((0, x.jsx)(ce, { fields: f === `expense` ? [{ name: `businessDate`, label: `Expense business date`, type: `date` }, { name: `category`, label: `Category` }, { name: `amount`, label: `Amount PKR`, type: `number` }, { name: `method`, label: `Method`, options: [`Cash`, `Card`, `Bank/Wallet`].map(e => ({ value: e, label: e })) }, { name: `note`, label: `Note / reason`, type: `textarea` }] : [{ name: f === `open` ? `opening` : `counted`, label: f === `open` ? `Opening cash PKR` : `Counted cash PKR`, type: `number` }], initial: { method: `Cash`, businessDate: re() }, submit: async (e) => { f === `expense` ? await t("expenses", { ...e, amount: O(e.amount) }) : f === `open` ? await t("cash/open", { opening: O(e.opening) }) : await t("cash/close", { id: m.id, counted: O(e.counted) }), p(``); }, children: urdu(f === `close` ? (0, x.jsxs)("p", { className: `cash-dialog-help`, children: urdu([`حساب کے مطابق دراز میں `, E(m.expected), ` ہونے چاہییں۔ دراز کے پیسے گن کر اوپر لکھیں۔ محفوظ کرنے کے بعد یہ حساب بند ہو جائے گا۔`]) }) : f === `open` ? (0, x.jsx)("p", { className: `cash-dialog-help`, children: urdu(`کام شروع کرنے سے پہلے دراز میں موجود پیسے گن کر اوپر لکھیں۔ پھر محفوظ کریں۔`) }) : null) })) })]) }); }
function Ce() { let { data: e, mutate: t, notice: n } = ne(), [r, i] = (0, b.useState)(`Restaurant`), [a, o] = (0, b.useState)(null), [s, c] = (0, b.useState)(e.settings.logo); return (0, x.jsxs)("div", { className: `page-content`, children: urdu([(0, x.jsx)("div", { className: `subnav`, children: urdu([`Restaurant`, `Tables`, `Staff`, `Audit`, `Backup`].map(e => (0, x.jsx)("button", { className: r === e ? `active` : ``, onClick: () => i(e), children: urdu(e === `Backup` ? `بیک اپ اور ٹیسٹ ڈیٹا` : e === `Audit` ? `کس نے کیا کام کیا` : e) }, e))) }), (0, x.jsx)("h2", { children: urdu(`Settings`) }), r === `Restaurant` && (0, x.jsx)("section", { className: `data-card settings-form`, children: urdu((0, x.jsxs)(ce, { initial: { ...e.settings, tax: String(e.settings.taxBps / 100), charge: String(e.settings.serviceBps / 100) }, fields: [{ name: `name`, label: `Restaurant name` }, { name: `tagline`, label: `Tagline` }, { name: `address`, label: `Address` }, { name: `phone`, label: `Contact phone`, required: !1 }, { name: `taxId`, label: `Business / tax identifier (optional)`, required: !1 }, { name: `tax`, label: `Tax %`, type: `number` }, { name: `charge`, label: `Service charge %`, type: `number` }, { name: `footer`, label: `Receipt thank-you footer` }, { name: `receipt`, label: `Default receipt`, options: [{ value: `A4`, label: `A4 invoice` }, { value: `80mm`, label: `80 mm thermal` }] }], submit: async (e) => { await t("settings", { ...e, logo: s, taxBps: O(e.tax), serviceBps: O(e.charge) }), n(`Restaurant settings saved`); }, children: urdu([(0, x.jsx)(M, { onUpload: c, kind: "logo", current: s }), s && (0, x.jsx)("img", { src: s, className: `logo-preview`, alt: `Restaurant logo` }), (0, x.jsx)("p", { children: urdu(`Calculation order: round each line to paise, subtract discount, calculate tax and service independently on the discounted subtotal, then sum. Half-paise rounds up.`) })]) }, e.settings.version)) }), r === `Tables` && (0, x.jsxs)("section", { className: `data-card`, children: urdu([(0, x.jsx)("button", { className: `primary compact`, onClick: () => o({ kind: `table`, value: { active: 1 } }), children: urdu(`+ Add table`) }), (e.allTables || e.tables).map(e => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([e.name, (0, x.jsx)("small", { children: urdu(e.orderId ? `Occupied #` + e.orderId : `Available`) })]) }), (0, x.jsx)("button", { onClick: () => o({ kind: `table`, value: e }), children: urdu(`Edit / deactivate`) })]) }, e.id))]) }), r === `Staff` && (0, x.jsxs)("section", { className: `data-card`, children: urdu([(0, x.jsx)("button", { className: `primary compact`, onClick: () => o({ kind: `staff`, value: { role: `Cashier`, active: 1 } }), children: urdu(`+ Add staff`) }), e.staff.map(e => (0, x.jsxs)("div", { className: `history-row`, children: urdu([(0, x.jsxs)("span", { children: urdu([e.name, (0, x.jsxs)("small", { children: urdu([e.username, ` · `, e.role, ` · `, e.active ? `Active` : `Disabled`]) })]) }), (0, x.jsx)("button", { onClick: () => o({ kind: `staff`, value: e }), children: urdu(`Edit access`) })]) }, e.id))]) }), r === `Audit` && (0, x.jsx)(AuditLog, { rows: e.audit }), r === `Backup` && (0, x.jsx)(DataControls, { mutate: t, notice: n }), a && (0, x.jsx)(se, { title: urdu(a.kind === `staff` ? `Staff access` : `Dining table`), onClose: () => o(null), children: urdu((0, x.jsx)(ce, { initial: a.value, fields: a.kind === `staff` ? [{ name: `name`, label: `Staff name` }, { name: `username`, label: `Username` }, { name: `role`, label: `Role`, options: [`Owner`, `Cashier`, `Kitchen`].map(e => ({ value: e, label: e })) }, { name: `active`, label: `Account state`, options: [{ value: 1, label: `Active` }, { value: 0, label: `Disabled` }] }, { name: `password`, label: a.value.id ? `New password (optional, min 4 characters)` : `Initial password (min 4 characters)`, type: `password`, required: !a.value.id }] : [{ name: `name`, label: `Table name` }, { name: `active`, label: `Table state`, options: [{ value: 1, label: `Active` }, { value: 0, label: `Disabled` }] }], submit: async (e) => { await t(a.kind === `staff` ? `staff` : `tables/save`, { ...e, active: Number(e.active) }), o(null), n(`Access/settings updated`); } })) })]) }); }
function MobileMenuDrawer({ isOpen, onClose, activeTab, onSelectTab, user, settings, permittedTabs, onLogout }: any) {
    if (!isOpen) return null;
    return (0, x.jsx)("div", {
        className: "mobile-drawer-overlay",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true",
        children: (0, x.jsxs)("div", {
            className: "mobile-drawer-sheet",
            onClick: (e: any) => e.stopPropagation(),
            children: [
                (0, x.jsxs)("div", {
                    className: "mobile-drawer-header",
                    children: [
                        (0, x.jsxs)("div", {
                            className: "mobile-drawer-brand",
                            children: [
                                (0, x.jsx)("div", { className: "brand-mark", children: urdu(settings?.name?.[0] || "D") }),
                                (0, x.jsxs)("div", {
                                    className: "mobile-drawer-brand-text",
                                    children: [
                                        (0, x.jsx)("strong", { children: urdu(settings?.name || "Dastarkhwan") }),
                                        (0, x.jsxs)("small", { children: [user?.name, " · ", urdu(user?.role)] })
                                    ]
                                })
                            ]
                        }),
                        (0, x.jsx)("button", {
                            type: "button",
                            className: "mobile-drawer-close-btn",
                            onClick: onClose,
                            "aria-label": "Close",
                            children: (0, x.jsx)(S, { name: "close", size: 22 })
                        })
                    ]
                }),
                (0, x.jsx)("nav", {
                    className: "mobile-drawer-nav",
                    children: w.map(([tabKey, iconName]) => {
                        if (!permittedTabs.includes(tabKey)) return null;
                        const isActive = activeTab === tabKey;
                        return (0, x.jsxs)("button", {
                            key: tabKey,
                            type: "button",
                            className: "mobile-drawer-nav-item " + (isActive ? "active" : ""),
                            onClick: () => { onSelectTab(tabKey); onClose(); },
                            children: [
                                (0, x.jsx)("span", { className: "drawer-item-icon", children: (0, x.jsx)(S, { name: iconName, size: 22 }) }),
                                (0, x.jsx)("span", { className: "drawer-item-label", children: urdu(T[tabKey] || tabKey) }),
                                isActive && (0, x.jsx)("span", { className: "drawer-item-badge", children: "●" })
                            ]
                        });
                    }).filter(Boolean)
                }),
                (0, x.jsxs)("div", {
                    className: "mobile-drawer-footer",
                    children: [
                        (0, x.jsxs)("div", {
                            className: "mobile-drawer-lang-row",
                            children: [
                                (0, x.jsx)("span", { children: urdu("زبان:") }),
                                (0, x.jsx)(LanguageSwitch, {})
                            ]
                        }),
                        (0, x.jsxs)("button", {
                            type: "button",
                            className: "mobile-drawer-logout-btn",
                            onClick: onLogout,
                            children: ["🚪 ", urdu("لاگ آؤٹ (Sign Out)")]
                        })
                    ]
                })
            ]
        })
    });
}
function we() {
    useLanguage();
    let [e, t] = (0, b.useState)(null), [n, r] = (0, b.useState)(!0), [i, a] = (0, b.useState)(`Dashboard`), [o, s] = (0, b.useState)(null), [c, l] = (0, b.useState)(null), [u, d] = (0, b.useState)(null), [f, p] = (0, b.useState)(``), [m, h] = (0, b.useState)(!1), [g, _] = (0, b.useState)(``), [drawerOpen, setDrawerOpen] = (0, b.useState)(!1), v = async () => {
        try {
            let e = await j(`bootstrap`);
            const epoch=e.dataEpoch || 'initial';
            const previous=localStorage.getItem('erp-data-epoch');
            if(previous!==epoch && (previous!==null || epoch!=='initial')) {
              for(const key of Object.keys(localStorage))if(key.startsWith('erp-draft-')||key.startsWith('erp-pending-'))localStorage.removeItem(key);
              l(null);d(null);s(null);
            }
            localStorage.setItem('erp-data-epoch',epoch);
            t(e), h(!1), _(``), e.user.role === `Kitchen` && a(`Orders & Kitchen`), e.user.role === `Cashier` && a(current => current === "Dashboard" ? "New Order" : current);
        }
        catch (n) {
            n.status === 401 ? (t(null), s(null)) : (h(!0), e || _(n.message));
        }
        finally {
            r(!1);
        }
    };
    (0, b.useEffect)(() => { v(); let e = setInterval(v, 5e3); return () => clearInterval(e); }, []);
    let y = async (e, n, r) => {
        try {
            let i = await j(e, n, r);
            return i.orderId && t(e => e && { ...e, orders: [i, ...e.orders.filter(e => e.id !== i.id)] }), await v(), i._recovered && p(`Previous pending action recovered safely.`), i;
        }
        catch (e) {
            throw e.status === 409 && await v(), e;
        }
    }, C = e => { l(e), d(null), a(`New Order`), s(null); }, notify = (e: any) => { p(e); };
    if ((0, b.useEffect)(() => {
        if (!f)
            return;
        let e = setTimeout(() => p(``), 7e3);
        return () => clearTimeout(e);
    }, [f]), n)
        return (0, x.jsxs)("div", { className: `loading-screen`, children: urdu([(0, x.jsx)(ee, {}), (0, x.jsx)("p", { children: urdu(`Connecting to restaurant workspace…`) })]) });
    if (!e)
        return g ? (0, x.jsx)(ConnectionSettings, { onRetry: v, currentError: g }) : (0, x.jsx)(N, { onLogin: v });
    let E = e.user, re = E.role === `Owner` ? w.map(e => e[0]) : E.role === `Cashier` ? [`New Order`, `Orders & Kitchen`, `Tables`, `Customers`] : [`Orders & Kitchen`];
    return (0, x.jsxs)(te.Provider, { value: { data: e, refresh: v, mutate: y, openInvoice: s, editOrder: C, notice: notify, navigate: a }, children: urdu([(0, x.jsxs)("div", { className: `app-shell`, children: urdu([(0, x.jsxs)("aside", { className: `sidebar`, children: urdu([(0, x.jsx)(ee, { name: e.settings.name, tagline: e.settings.tagline }), (0, x.jsx)("nav", { children: urdu([...w.map(([e, t]) => (0, x.jsxs)("button", { "aria-label": e, title: urdu(e), "aria-current": i === e ? "page" : void 0, disabled: !re.includes(e), className: i === e ? `active` : ``, onClick: () => a(e), children: urdu([(0, x.jsx)(S, { name: t }), (0, x.jsx)("span", { children: urdu(T[e] || e) }), i === e && (0, x.jsx)("i", {})]) }, e)), (0, x.jsxs)("button", { type: "button", className: "mobile-bottom-more-btn " + (["Dashboard", "Menu", "Stock & Purchases", "Daily Summary", "Settings"].includes(i) ? "active" : ""), onClick: () => setDrawerOpen(!0), "aria-label": "More", children: [(0, x.jsx)(S, { name: "menu", size: 18 }), (0, x.jsx)("span", { children: urdu("مزید") })] })]) }), (0, x.jsxs)("div", { className: `side-footer`, children: urdu([(0,x.jsx)(SidebarMore,{}),(0, x.jsxs)("div", { className: `location`, children: urdu([(0, x.jsx)("span", { className: `live-dot` }), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(`Rawalpindi`) }), (0, x.jsx)("small", { children: urdu(m ? `Connection interrupted` : `Connected · Shared database`) })]) })]) }), (0, x.jsxs)("div", { className: `profile`, children: urdu([(0, x.jsx)("span", { children: urdu(E.name.split(` `).map(e => e[0]).join(``).slice(0, 2)) }), (0, x.jsxs)("div", { children: urdu([(0, x.jsx)("strong", { children: urdu(E.name) }), (0, x.jsx)("small", { children: urdu(E.role) })]) })]) }), (0, x.jsx)("button", { className: `logout`, onClick: async () => { await j("auth/logout", {}), t(null), s(null); }, children: urdu("Sign out") })]) })]) }), (0, x.jsxs)("div", { className: `main-shell`, children: urdu([(0, x.jsxs)("header", { className: `topbar`, children: urdu([(0, x.jsxs)("div", { className: "topbar-brand-left", children: [(0, x.jsx)("button", { type: "button", className: "mobile-hamburger-btn", onClick: () => setDrawerOpen(!0), "aria-label": "Menu", children: (0, x.jsx)(S, { name: "menu", size: 24 }) }), (0, x.jsxs)("div", { children: [(0, x.jsx)("p", { children: urdu(new Date().toLocaleDateString(getLanguage() === "en" ? "en-PK" : "ur-PK", { timeZone: `Asia/Karachi`, weekday: `long`, day: `numeric`, month: `long`, year: `numeric` })) }), (0, x.jsx)("h1", { children: urdu(T[i] || i) })] })] }), (0, x.jsxs)("div", { className: `top-actions`, children: urdu([(0, x.jsx)(AppZoom, {}),(0, x.jsx)(LanguageSwitch, {}),(0, x.jsx)("span", { className: `connection`, children: urdu(m ? `Offline · Draft retained` : `Online`) }), (0, x.jsxs)("span", { className: `role-pill`, children: urdu([E.role, ` view`]) }), (0, x.jsx)("button", { className: `avatar`, title: urdu("\u0628\u0627\u06C1\u0631 \u0646\u06A9\u0644\u06CC\u06BA"), "aria-label": `Sign out`, onClick: async () => { await j("auth/logout", {}), t(null), s(null); }, children: urdu("Sign out") })]) })]) }), m && (0, x.jsx)("div", { className: `connection-banner`, role: `status`, children: urdu(`Connection interrupted. Saved records may be stale; unsaved drafts are retained. Reconnecting…`) }), re.includes(i) ? i === `Dashboard` ? (0, x.jsx)(Dashboard, { data: e, api: j, navigate: a, openInvoice: s }) : i === `Tables` ? (0, x.jsx)(TablesPage, { data: e, mutate: y, notice: notify }) : i === `New Order` ? (0, x.jsx)(fe, { key: e.dataEpoch || "initial", editing: c, resume: u, onSaved: () => { l(null), d(null); } }) : i === `Orders & Kitchen` ? (0, x.jsx)(me, { onResume: e => { d(e), l(null), a(`New Order`); } }) : i === `Menu` ? (0, x.jsx)(_e, {}) : i === `Customers` ? (0, x.jsx)(ye, {}) : i === `Stock & Purchases` ? (0, x.jsx)(be, {}) : i === `Daily Summary` ? (0, x.jsx)(Se, {}) : (0, x.jsx)(Ce, {}) : (0, x.jsxs)("div", { className: `page-content`, children: urdu([(0, x.jsx)("h2", { children: urdu(`Access restricted`) }), (0, x.jsx)("p", { children: urdu(`Choose a permitted section from the navigation.`) })]) })]) }), o && (0, x.jsx)(ge, { id: o, onClose: () => s(null) }), (0, x.jsx)(MobileMenuDrawer, { isOpen: drawerOpen, onClose: () => setDrawerOpen(!1), activeTab: i, onSelectTab: a, user: E, settings: e.settings, permittedTabs: re, onLogout: async () => { await j("auth/logout", {}); t(null); s(null); setDrawerOpen(!1); } })]), dir: languageDirection(), lang: getLanguage() }), f && (0, x.jsxs)("div", { className: `toast`, role: `status`, children: urdu([f, (0, x.jsx)("button", { onClick: () => p(``), children: urdu((0, x.jsx)(S, { name: "close", size: 22 })) })]) })]) });
}
export default we;




