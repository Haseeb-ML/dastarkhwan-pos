import labels from "./ui-english.json";
export type Language = "ur" | "en";
const listeners = new Set<() => void>();
let language: Language = "ur";
try { language = localStorage.getItem("dastarkhwan-language") === "en" ? "en" : "ur"; } catch {}
const english: Record<string,string> = {...labels};
const protectedLabels = new Set<string>();
export function registerUrduLabels(dictionary: Record<string,string>, foodKeys: Set<string>) {
 for (const [key,value] of Object.entries(dictionary)) {
  if (foodKeys.has(key.toLowerCase())) { protectedLabels.add(value); continue; }
  if (value.trim() && !english[value] && !/[\u0600-\u06ff]/.test(key)) english[value] = english[key] ?? key;
 }
}
export const getLanguage = () => language;
export const subscribeLanguage = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function setLanguage(next: Language) {
 if (next !== "en" && next !== "ur") return;
 language = next;
 try { localStorage.setItem("dastarkhwan-language",next); } catch {}
 listeners.forEach(listener => listener());
}
export function ui(value: any): any {
 if (language !== "en") return value;
 if (Array.isArray(value)) return value.map(ui);
 if (typeof value !== "string") return value;
 const trimmed=value.trim();
 if (!trimmed || protectedLabels.has(trimmed)) return value;
 const translated = english[value] ?? english[trimmed];
 if (translated !== undefined) return value.startsWith(" ") || value.endsWith(" ") ? value.replace(trimmed, translated.trim()) : translated;
 if (value.includes(" / ")) { const pieces=value.split(" / "); const changed=pieces.map(ui); if(changed.some((part:any,i:number)=>part!==pieces[i])) return changed.join(" / "); }
 const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(\d+) کھانوں کی لاگت درج نہیں ہے۔ کھانے اور قیمتیں کھول کر ہر سائز کی لاگت لکھیں۔$/,m=>`Costs are missing for ${m[1]} dishes. Open Menu and enter the cost of every size.`],
  [/^(\d+) چیزوں کا اسٹاک کم ہے۔ خریداری دیکھیں۔$/,m=>`${m[1]} items are low in stock. View purchases.`],
  [/^(\d+) بلوں کی رقم وصول کرنا باقی ہے۔$/,m=>`${m[1]} bills still need payment.`],
  [/^ — جاری آرڈر (\d+)$/,m=>` — Open order ${m[1]}`],
 ];
 for (const [pattern, translate] of patterns) { const match=value.match(pattern); if(match) return translate(match); }
 return value;
}
export const languageDirection = () => language === "en" ? "ltr" : "rtl";
