import {ui, languageDirection} from "./LanguageCore";
import BottomClose from "./BottomClose"
﻿import React, { useEffect, useState } from "react"
import UrduInput from "./UrduKeyboard"
import { urdu } from "./Urdu"
function DashboardIcon({index=0}: {index?: number}) {
 const paths=["M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h4", "M4 10h16v5H4z M6 15v6 M18 15v6 M8 4h8v6", "M4 5h16v14H4z M8 9h8 M8 13h4 M16 16l2 2 3-3", "M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10", "M4 18l5-5 4 2 7-9 M15 6h5v5", "M4 5h16v14H4z M8 12h8 M12 8v8", "M4 5h16v14H4z M8 12h8", "M5 19V9 M12 19V5 M19 19v-8 M3 19h18"];
 return <span className="dashboard-icon" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[index%paths.length]}/></svg></span>
}
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
const cash = (value: number) => <><bdi dir="ltr">{ui(((value || 0)/100).toLocaleString('en-PK',{maximumFractionDigits:2}))}</bdi>{ui(" روپے")}</>

export function computeSummaryFromData(data: any, from: string, to: string) {
  if (!data) return null;
  const orders = (data.orders || []).filter((o: any) => {
    if (!o) return false;
    const bDate = (o.business_date || o.created || "").slice(0, 10);
    return bDate >= from && bDate <= to;
  });
  const activeOrders = orders.filter((o: any) => o && o.state !== "cancelled");
  const cancelledOrders = orders.filter((o: any) => o && o.state === "cancelled");
  const sales = activeOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
  const cancelled = cancelledOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

  let collections = 0;
  let refunds = 0;
  (data.orders || []).forEach((o: any) => {
    if (!o) return;
    (o.payments || []).forEach((p: any) => {
      if (!p) return;
      const pDate = (p.created || "").slice(0, 10);
      if (pDate >= from && pDate <= to) collections += (Number(p.amount) || 0);
    });
    (o.refunds || []).forEach((r: any) => {
      if (!r) return;
      const rDate = (r.created || "").slice(0, 10);
      if (rDate >= from && rDate <= to) refunds += (Number(r.amount) || 0);
    });
  });
  if (collections === 0 && activeOrders.length > 0) {
    collections = activeOrders.reduce((sum: number, o: any) => sum + (Number(o.received) || 0), 0);
  }
  if (refunds === 0 && activeOrders.length > 0) {
    refunds = activeOrders.reduce((sum: number, o: any) => sum + (Number(o.refunded) || 0), 0);
  }

  const expensesInPeriod = (data.expenses || []).filter((e: any) => {
    if (!e) return false;
    const eDate = (e.businessDate || e.created || "").slice(0, 10);
    return eDate >= from && eDate <= to;
  }).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);

  const daily: Record<string, number> = {};
  activeOrders.forEach((o: any) => {
    const d = (o.business_date || o.created || "").slice(0, 10);
    if (d) daily[d] = (daily[d] || 0) + (Number(o.total) || 0);
  });

  const dishSales: Record<string, { name: string; qty: number; amount: number }> = {};
  activeOrders.forEach((o: any) => {
    (o.items || []).forEach((it: any) => {
      if (!it) return;
      const name = it.name || "Dish";
      if (!dishSales[name]) {
        dishSales[name] = { name, qty: 0, amount: 0 };
      }
      dishSales[name].qty += (Number(it.qty) || 1000);
      dishSales[name].amount += (Number(it.amount) || Number(it.price) || 0);
    });
  });
  const popular = Object.values(dishSales).sort((a, b) => b.qty - a.qty).slice(0, 8);

  let foodCost = 0;
  let missingCosts = 0;
  activeOrders.forEach((o: any) => {
    (o.items || []).forEach((it: any) => {
      if (!it) return;
      const qty = Number(it.qty) || 1000;
      if (it.cost !== undefined && it.cost !== null && !isNaN(Number(it.cost))) {
        foodCost += Math.round((Number(it.cost) * qty) / 1000);
      } else {
        const vId = Number(it.variantId || it.variant_id);
        let foundCost: number | null = null;
        for (const m of (data.menu || [])) {
          for (const v of (m?.variants || [])) {
            if (Number(v?.id) === vId && v?.cost !== undefined && v?.cost !== null) {
              foundCost = Number(v.cost);
              break;
            }
          }
          if (foundCost !== null) break;
        }
        if (foundCost !== null && !isNaN(foundCost)) {
          foodCost += Math.round((foundCost * qty) / 1000);
        } else {
          missingCosts++;
          const price = Number(it.price) || Number(it.amount) || 0;
          if (price > 0) {
            foodCost += Math.round((price * 0.50 * qty) / 1000);
          }
        }
      }
    });
  });

  const netSales = Math.max(0, activeOrders.reduce((n: number, o: any) => {
    const food = (Number(o.subtotal) || Number(o.total) || 0) - (Number(o.discount) || 0);
    return n + food;
  }, 0) - refunds);

  const profit = netSales - foodCost - expensesInPeriod;

  return {
    foodCost,
    missingCosts,
    netSales,
    profit,
    from,
    to,
    sales,
    orderCount: activeOrders.length,
    cancelled,
    collections,
    refunds,
    expenses: expensesInPeriod,
    daily,
    popular,
  };
}

export function ProfitReport({ api, data, navigate }: any) {
 const [from,setFrom]=useState(today()),[to,setTo]=useState(today()),[period,setPeriod]=useState('آج')
 const [result,setResult]=useState<any>(()=>computeSummaryFromData(data,today(),today()))
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)

 useEffect(()=> {
   let active=true;
   if(!from||!to||from>to){
     setError('شروع کی تاریخ، آخری تاریخ سے پہلے رکھیں۔');
     return;
   }
   setError('');
   const local = computeSummaryFromData(data, from, to);
   if (local && active) setResult(local);

   if (typeof api === 'function') {
     api('summary',{from,to}).then((value:any)=>{
       if(active && value) {
         if (value.profit === null && value.netSales !== undefined) {
           value.profit = (value.netSales || 0) - (value.foodCost || 0) - (value.expenses || 0);
         }
         value.daily = value.daily || {};
         value.popular = value.popular || [];
         setResult(value);
       }
     }).catch((err: any)=>{
       console.warn("Summary API update error (using calculated data):", err);
       if(!local && active) setError('حساب نہیں کھل سکا۔ دوبارہ کوشش کریں۔');
     }).finally(()=>{
       if(active) setLoading(false);
     });
   }
   return()=>{active=false};
 },[from,to,data])

 const select=(name:string)=>{
   setPeriod(name);
   const end=today(),date=new Date(end+'T12:00:00Z');
   if(name==='اس ہفتے')date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
   if(name==='اس مہینے')date.setUTCDate(1);
   setFrom(date.toISOString().slice(0,10));
   setTo(end);
 }

 return (
   <section className="easy-report">
     <div className="easy-periods">
       {ui(['آج','اس ہفتے','اس مہینے','اپنی تاریخیں'].map(name=>(
         <button type="button" className={period===name?'active':''} key={name} onClick={()=>name==='اپنی تاریخیں'?setPeriod(name):select(name)}>
           {ui(name)}
         </button>
       )))}
     </div>
     <div className="easy-dates">
       <label>
         {ui("شروع کی تاریخ")}
         <input aria-label="Report from" type="date" value={from} max={to||undefined} onChange={e=>{setFrom(e.target.value);setPeriod('اپنی تاریخیں')}} />
       </label>
       <label>
         {ui("آخری تاریخ")}
         <input aria-label="Report to" type="date" value={to} min={from||undefined} onChange={e=>{setTo(e.target.value);setPeriod('اپنی تاریخیں')}} />
       </label>
       <span>{ui("منتخب تاریخوں کا حساب خود بخود دکھایا جاتا ہے۔")}</span>
     </div>
     {ui(loading&&<p role="status">{ui("حساب کھل رہا ہے…")}</p>)}
     {ui(error&&<p role="alert" className="error">{ui(error)}</p>)}
     {ui(result&& (
       <>
         <div className={`easy-profit ${result.profit < 0 ? 'loss' : ''}`}>
           <div>
             <span>{ui(result.profit < 0 ? 'اس مدت کا نقصان' : 'اس مدت کا منافع')}</span>
             <strong>{ui(cash(result.profit < 0 ? -result.profit : result.profit))}</strong>
           </div>
           <p>{ui('منافع = کھانوں کی فروخت − کھانوں کی لاگت − دیگر اخراجات')}</p>
         </div>
         <div className="easy-metrics">
           {ui([
             ['کھانوں کی فروخت', result.netSales],
             ['کھانوں کی لاگت', result.foodCost],
             ['دیگر اخراجات', result.expenses],
             ['وصول شدہ رقم', result.collections],
             ['واپس کی گئی رقم', result.refunds]
           ].map(([label,value],index)=>(
             <article key={String(label)}>
               <DashboardIcon index={index+4}/>
               <span>{ui(label)}</span>
               <strong>{ui(cash(Number(value)))}</strong>
             </article>
           )))}
         </div>
         <p className="easy-note">
           {ui("اس مدت کے آرڈر: ")}<bdi>{ui(result.orderCount)}</bdi>{ui(" · فروخت آرڈر کی تاریخ کے مطابق، وصولی رقم ملنے کی تاریخ کے مطابق ہے۔")}
         </p>
         <div className="easy-breakdown">
           <section>
             <h3>{ui("روزانہ فروخت")}</h3>
             {ui(Object.entries(result.daily || {}).length ? Object.entries(result.daily).map(([date,value])=>(
               <div className="easy-list-row" key={date}>
                 <bdi dir="ltr">{ui(date)}</bdi>
                 <strong>{ui(cash(Number(value)))}</strong>
               </div>
             )) : <p>{ui("ان تاریخوں میں کوئی فروخت نہیں ہوئی۔")}</p>)}
           </section>
           <section>
             <h3>{ui("زیادہ فروخت ہونے والے کھانے")}</h3>
             {ui((result.popular || []).length ? result.popular.map((item:any)=>(
               <div className="easy-list-row" key={item.name}>
                 <span>{ui(urdu(item.name))}<small>{ui(item.qty/1000)}{ui(" عدد")}</small></span>
                 <strong>{ui(cash(item.amount))}</strong>
               </div>
             )) : <p>{ui("ان تاریخوں میں کوئی کھانا فروخت نہیں ہوا۔")}</p>)}
           </section>
         </div>
       </>
     ))}
   </section>
 );
}

export function Dashboard({data,api,navigate,openInvoice}:any){
 const [summary,setSummary]=useState<any>(()=>computeSummaryFromData(data,today(),today()))
 const [error,setError]=useState(false)

 useEffect(()=>{
   let active=true;
   const local = computeSummaryFromData(data, today(), today());
   if(local && active) setSummary(local);

   if(typeof api === 'function') {
     api('summary',{from:today(),to:today()}).then((value:any)=>{
       if(active && value){
         if (value.profit === null && value.netSales !== undefined) {
           value.profit = (value.netSales || 0) - (value.foodCost || 0) - (value.expenses || 0);
         }
         setSummary(value);
         setError(false);
       }
     }).catch((err: any)=>{
       console.warn("Dashboard summary API error (using local data):", err);
       if(!local && active) setError(true);
     });
   }
   return()=>{active=false};
 },[data])

 const active=data.orders.filter((o:any)=>o.state==='open'),unpaid=data.orders.filter((o:any)=>o.state!=='cancelled'&&o.balance>0),free=data.tables.filter((t:any)=>!t.orderId),low=data.ingredients.filter((i:any)=>i.stock<=i.low)
 return <div className="page-content easy-home"><div className="page-heading"><div><h2>{ui("آج ہوٹل میں کیا چل رہا ہے؟")}</h2><p>{ui("آرڈر، میزیں اور آج کا حساب ایک نظر میں۔")}</p></div><button className="primary compact" onClick={()=>navigate('New Order')}>{ui("+ نیا آرڈر بنائیں")}</button></div><div className="easy-shortcuts"><button onClick={()=>navigate('Orders & Kitchen')}>{ui("آرڈر اور باورچی خانہ")}</button><button onClick={()=>navigate('Tables')}>{ui("میزیں دیکھیں")}</button><button onClick={()=>navigate('Daily Summary')}>{ui("منافع اور نقصان")}</button></div><div className="easy-kitchen-status"><strong>{ui("باورچی خانے کی حالت")}</strong>{ui([["New","نئے آرڈر"],["Preparing","کھانا بن رہا ہے"],["Ready","کھانا تیار ہے"]].map(([state,label])=><button key={state} onClick={()=>navigate("Orders & Kitchen")}><span>{ui(label)}</span><bdi>{ui(active.filter((order:any)=>order.tickets?.some((ticket:any)=>ticket.state===state)).length)}</bdi></button>))}</div><div className="easy-metrics operational">{ui([['چل رہے آرڈر',active.length,'Orders & Kitchen'],['خالی میزیں',free.length,'Tables'],['باقی رقم والے بل',unpaid.length,'Orders & Kitchen'],['کم اسٹاک والی چیزیں',low.length,'Stock & Purchases']].map(([label,value,target],index)=><button key={String(label)} onClick={()=>navigate(target)}><DashboardIcon index={index}/><span>{ui(label)}</span><strong>{ui(value)}</strong><small>{ui("تفصیل دیکھیں ←")}</small></button>))}</div>{ui(error?<p className="error">{ui("آج کا حساب نہیں کھل سکا۔")}</p>:summary?<div className="easy-metrics"><article><DashboardIcon index={4}/><span>{ui("آج کی فروخت")}</span><strong>{ui(cash(summary.netSales))}</strong></article><article><DashboardIcon index={5}/><span>{ui("آج وصول شدہ رقم")}</span><strong>{ui(cash(summary.collections))}</strong></article><article><DashboardIcon index={6}/><span>{ui("آج کے اخراجات")}</span><strong>{ui(cash(summary.expenses))}</strong></article><article className={summary.profit<0?'loss':''}><DashboardIcon index={7}/><span>{ui(summary.profit<0?'آج کا نقصان':'آج کا منافع')}</span><strong>{ui(cash(Math.abs(summary.profit || 0)))}</strong></article></div>:<p role="status">{ui("آج کا حساب کھل رہا ہے…")}</p>)}<div className="easy-breakdown dashboard-panels"><section className="dashboard-orders"><h3><DashboardIcon index={0}/><span>{ui("چل رہے آرڈر")}</span><bdi className="dashboard-count">{active.length}</bdi></h3>{ui(active.length?active.slice(0,6).map((order:any)=><button className="easy-list-row easy-order" key={order.id} onClick={()=>openInvoice(order.id)}><span>{ui(urdu(order.place))}<small><bdi>{ui(order.number)}</bdi>{ui(" · ")}{ui(order.items.length)}{ui(" کھانے")}</small></span><strong>{ui(cash(order.total))}</strong></button>):<p>{ui("فی الحال کوئی آرڈر نہیں چل رہا۔")}</p>)}</section><section className="dashboard-attention"><h3><DashboardIcon index={3}/><span>{ui("جن کاموں پر توجہ چاہیے")}</span></h3><button className={`easy-alert ${low.length?"attention-needed":"attention-ok"}`} onClick={()=>navigate('Stock & Purchases')}>{ui(low.length?`${low.length} چیزوں کا اسٹاک کم ہے۔ خریداری دیکھیں۔`:'سامان کا اسٹاک کافی ہے۔')}</button><button className={`easy-alert ${unpaid.length?"attention-needed":"attention-ok"}`} onClick={()=>navigate('Orders & Kitchen')}>{ui(unpaid.length?`${unpaid.length} بلوں کی رقم وصول کرنا باقی ہے۔`:'تمام بلوں کی رقم وصول ہو چکی ہے۔')}</button>{ui(summary?.missingCosts>0&&<button className="easy-alert attention-needed" onClick={()=>navigate('Menu')}>{ui(summary.missingCosts)}{ui(" کھانوں کی لاگت لکھیں، تاکہ منافع معلوم ہو۔")}</button>)}</section></div></div>
}
export function TablesPage({data,mutate,notice}:any){
 const [adding,setAdding]=useState(false),[name,setName]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false)
 const add=()=>{setName('');setError('');setAdding(true)}
 return <div className="page-content easy-tables"><div className="page-heading"><div><h2>{ui("میزیں")}</h2><p>{ui("خالی اور مصروف میزیں دیکھیں۔ ضرورت ہو تو نئی میز شامل کریں۔")}</p></div>{ui(data.user.role==='Owner'&&<button className="primary compact" onClick={add}>{ui("+ نئی میز شامل کریں")}</button>)}</div><div className="easy-table-summary" aria-label={ui("میزیں")}><article><DashboardIcon index={1}/><div><span>{ui("کل میزیں: ")}</span><strong><bdi>{data.tables.length}</bdi></strong></div></article><article className="available"><DashboardIcon index={2}/><div><span>{ui("خالی: ")}</span><strong><bdi>{data.tables.filter((t:any)=>!t.orderId).length}</bdi></strong></div></article><article className="occupied"><DashboardIcon index={0}/><div><span>{ui("مصروف: ")}</span><strong><bdi>{data.tables.filter((t:any)=>t.orderId).length}</bdi></strong></div></article></div><div className="easy-table-grid">{ui(data.tables.map((table:any)=><article className={table.orderId?'occupied':''} key={table.id}><span className="easy-table-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="8" y="8" width="16" height="16" rx="4"/><path d="M12 3h8M12 29h8M3 12v8M29 12v8"/></svg></span><h3>{ui(urdu(table.name))}</h3><strong>{ui(table.orderId?'مصروف':'خالی')}</strong>{ui(table.orderId&&<small>{ui("آرڈر نمبر ")}{ui(table.orderId)}</small>)}</article>))}</div>{ui(!data.tables.length&&<p>{ui("ابھی کوئی میز شامل نہیں ہے۔")}</p>)}{ui(adding&&<div className="modal-backdrop"><section className="work-modal easy-add-table" role="dialog" aria-modal="true" aria-label="نئی میز شامل کریں"><header><h2>{ui("نئی میز شامل کریں")}</h2><button aria-label="Close" onClick={()=>setAdding(false)} disabled={busy}>{ui("×")}</button></header><form onSubmit={async e=>{e.preventDefault();if(data.tables.some((t:any)=>t.name.trim().toLowerCase()===name.trim().toLowerCase())){setError('یہ میز پہلے سے موجود ہے۔ دوسرا نام لکھیں۔');return}setBusy(true);setError('');try{await mutate('tables/save',{name:name.trim(),active:1});setAdding(false);notice('نئی میز شامل ہو گئی ہے۔')}catch(e:any){setError(e.message)}finally{setBusy(false)}}}><label className="field"><span>{ui("میز کا نام یا نمبر")}</span><UrduInput autoFocus required maxLength={50} placeholder={ui("مثلاً میز 09")} value={name} onChange={(e:any)=>setName(e.target.value)} /></label>{ui(error&&<p role="alert" className="error">{ui(error)}</p>)}<button className="primary wide" disabled={busy||!name.trim()}>{ui(busy?'محفوظ ہو رہا ہے…':'میز محفوظ کریں')}</button></form><BottomClose onClose={()=>setAdding(false)} disabled={busy}/></section></div>)}</div>
}
