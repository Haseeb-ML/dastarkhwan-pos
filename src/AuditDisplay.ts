import {getLanguage} from "./LanguageCore";
// @ts-ignore shared report formatter
import {auditRecord} from "./audit_text.mjs";
const actions: Record<string,string> = {
 "demo.customers.filled":"Sample customers and bills added", "demo.costs.filled":"Sample dish costs added", "demo.cleared":"Test data cleared", "demo.restored":"Test data restored", "backup.schedule":"Daily backup settings changed", "backup.created":"Backup saved", "order.created":"Bill created", "order.appended":"Food added to bill", "payment":"Payment received", "refund":"Refund issued", "menu.saved":"Dish saved", "menu.archived":"Dish removed from menu", "customer.updated":"Customer details updated", "settings.saved":"Settings saved", "order.cancelled":"Order cancelled", "order.closed":"Order finished", "expense":"Expense recorded", "cash.opened":"Drawer cash account started", "cash.closed":"Drawer cash account closed", "purchase.received":"Purchase received", "staff.updated":"Staff details updated", "staff.created":"Staff added", "supplier.payment":"Supplier paid"
};
export default function auditDisplay(row:any) {
 if (getLanguage()==="ur") return auditRecord(row);
 let data:any={};try{data=JSON.parse(row.data||"{}")}catch{}
 const parts:string[]=[];
 if(Array.isArray(data.result)) parts.push(`Costs entered for ${new Set(data.result.map((item:any)=>item.name)).size} dishes`);
 if(data.name)parts.push(String(data.name));
 if(typeof data.count==="number")parts.push(`${data.count} sample customers added`);
 const cash=(n:number)=>`Rs ${(n/100).toLocaleString("en-PK")}`;
 const amount=data.applied??data.amount;
 if(typeof amount==="number")parts.push(`Amount: ${cash(amount)}`);
 if(typeof data.change==="number"&&data.change>0)parts.push(`Change: ${cash(data.change)}`);
 if(typeof data.enabled==="boolean")parts.push(`Daily backup: ${data.enabled?"On":"Off"}`);
 if(typeof data.balance==="number")parts.push(`Balance: ${cash(data.balance)}`);
 if(data.reason)parts.push(String(data.reason));
 return {date:new Date(row.created).toLocaleString("en-GB",{timeZone:"Asia/Karachi"}), actor:row.actor_name||"System",action:actions[row.action]||(row.action.startsWith("kitchen.")?"Kitchen order status changed":row.action.startsWith("stock.")?"Stock updated":"Record updated"),details:parts.join(" · "),reference:/^\d+$/.test(String(row.entity))?`No. ${row.entity}`:row.action.startsWith("demo.")?"Sample data":row.action.startsWith("backup.")?"Backup":"Saved record"};
}
