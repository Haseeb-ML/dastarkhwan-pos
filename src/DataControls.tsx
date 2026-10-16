import { ui, languageDirection } from "./LanguageCore";
import { apiUrl } from "./apiConfig";
// @ts-ignore shared server/browser report formatter
import auditDisplay from "./AuditDisplay";
import React, { useEffect, useState } from "react";
import BottomClose from "./BottomClose";
export function AuditLog({ rows }: { rows: any[] }) {
  return (
    <section className="data-card readable-audit">
      <div className="audit-heading">
        <h3>{ui("کس نے کیا کام کیا؟")}</h3>
        <a className="dialog-close-button audit-download" href={apiUrl("/api/audit/export")} download>
          {ui("Excel کی فائل لیں")}
        </a>
      </div>
      <div className="audit-explanation">
        <p>{ui("یہاں آپ دیکھ سکتے ہیں کہ ہوٹل میں کس نے، کب، کیا کام کیا۔")}</p>
        <p>{ui("مثلاً: کس نے بل بنایا، پیسے لیے، سامان بدلا یا گاہک کی معلومات درست کیں۔")}</p>
        <small>{ui("نیچے آخری ")}{ui(rows.length)}{ui(" کام دکھائے گئے ہیں۔ فائل میں سارے کام ہوں گے۔ یہ Excel فائل صاف رومن اردو میں کھلے گی۔")}</small>
      </div>
      {ui(!rows.length && <p>{ui("ابھی کوئی کام درج نہیں ہوا۔")}</p>)}
      {ui(rows.map(row => {
        const x = auditDisplay(row);
        return (
          <article key={row.id}>
            <div>
              <strong>{ui(x.action)}</strong>
              <small>{ui(x.actor)}{ui(" · ")}<time dir="ltr">{ui(x.date)}</time></small>
            </div>
            {ui(x.details && <p>{ui(x.details)}</p>)}
            <span className="audit-reference">{ui("حوالہ: ")}{ui(x.reference)}</span>
          </article>
        );
      }))}
    </section>
  );
}
export default function DataControls({ mutate, notice }: { mutate: any; notice: any }) {
  const [status, setStatus] = useState<any>(null), [confirm, setConfirm] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const refresh = async () => {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch(apiUrl("/api/maintenance/status"), {
      method: 'POST',
      credentials: 'include',
      headers,
      body: '{}'
    });
    const s = await r.json();
    if (!r.ok) throw Error(s.error || 'معلومات نہیں مل سکیں');
    setStatus(s);
  };
 useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);
 const run=async(action:string,body:any={})=>{setBusy(true);setError('');try{await mutate('maintenance/'+action,body);await refresh();setConfirm('');notice(action==='clear'?'ٹیسٹ ڈیٹا صاف ہو گیا۔':action==='fill'?'ٹیسٹ ڈیٹا واپس آ گیا۔':'بیک اپ کی ترتیب محفوظ ہو گئی۔')}catch(e:any){setError(e.message)}finally{setBusy(false)}};
 return <section className="data-card data-controls"><h3>{ui("بیک اپ اور ٹیسٹ ڈیٹا")}</h3><p>{ui("بیک اپ میں ڈیٹا اور اپ لوڈ کی گئی تصاویر محفوظ ہوتی ہیں۔")}</p><label className="backup-toggle"><input type="checkbox" checked={!!status?.enabled} disabled={busy||!status} onChange={e=>run('schedule',{enabled:e.target.checked})}/><span>{ui("روزانہ خودکار بیک اپ")}</span></label><p className="muted">{ui("ایپ چل رہی ہو تو روزانہ ایک بیک اپ؛ بند ہو تو اگلی بار کھولنے پر۔")}</p>{ui(status?.lastBackup&&<p>{ui("آخری بیک اپ: ")}<span dir="ltr" className="backup-path">{ui(status.lastBackup)}</span></p>)}{ui(status?.error&&<p className="error">{ui("بیک اپ نہیں بن سکا: ")}{ui(status.error)}</p>)}<button type="button" className="primary compact" disabled={busy} onClick={()=>run('backup')}>{ui("ابھی بیک اپ بنائیں")}</button>{ui(status?.demoAvailable&&<div className="dummy-controls"><h3>{ui("نمونے کا ڈیٹا")}</h3><p>{ui("یہ ٹیسٹ موڈ ہے۔ صاف کرنے سے تمام ٹیسٹ بل، گاہک، کھانے، میزیں، اسٹاک، اخراجات اور کاروباری ترتیبات صاف ہوں گی۔ لاگ اِن اکاؤنٹس باقی رہیں گے۔")}</p><div className="data-control-buttons"><button type="button" disabled={busy} onClick={()=>setConfirm('clear')}>{ui("ٹیسٹ ڈیٹا صاف کریں")}</button><button type="button" disabled={busy||!status.dummyCleared} onClick={()=>setConfirm('fill')}>{ui("ٹیسٹ ڈیٹا واپس بھریں")}</button></div><p className="muted">{ui("واپس بھرنے سے صاف کرنے سے پہلے والا مکمل ٹیسٹ ڈیٹا واپس آئے گا۔")}</p></div>)}{ui(error&&<p role="alert" className="error">{ui(error)}</p>)}{ui(confirm&&<div className="modal-backdrop"><section className="work-modal" role="dialog" aria-modal="true" aria-label="ٹیسٹ ڈیٹا کی تصدیق"><header><h2>{ui(confirm==='clear'?'ٹیسٹ ڈیٹا صاف کریں؟':'ٹیسٹ ڈیٹا واپس بھریں؟')}</h2><button type="button" aria-label="Close" disabled={busy} onClick={()=>setConfirm('')}>{ui("×")}</button></header><p>{ui(confirm==='clear'?'تمام موجودہ ٹیسٹ کاروباری ریکارڈ صاف ہوں گے۔ پہلے خودکار بیک اپ بنایا جائے گا۔':'صاف کرنے سے پہلے محفوظ کیے گئے ٹیسٹ ریکارڈ واپس آ جائیں گے۔')}</p><button type="button" className="primary wide" disabled={busy} onClick={()=>run(confirm,{confirm})}>{ui(busy?'کام ہو رہا ہے…':confirm==='clear'?'ہاں، ٹیسٹ ڈیٹا صاف کریں':'ہاں، ٹیسٹ ڈیٹا واپس بھریں')}</button><BottomClose disabled={busy} onClose={()=>setConfirm('')}/></section></div>)}</section>
}
