import React,{useEffect,useState,useSyncExternalStore} from "react";
import {useLanguage} from "./LanguageSwitch";
const key="dastarkhwan-app-zoom";
const clamp=(value:number)=>Math.min(150,Math.max(60,Math.round(value)));
let zoom=100;
try{const saved=Number(localStorage.getItem(key));if(Number.isFinite(saved)&&saved>=60&&saved<=150)zoom=clamp(saved)}catch{}
const listeners=new Set<()=>void>();
export function useAppZoom(){return useSyncExternalStore(callback=>{listeners.add(callback);return()=>{listeners.delete(callback)}},()=>zoom,()=>100)}
function setZoom(value:number){zoom=clamp(value);try{localStorage.setItem(key,String(zoom))}catch{}listeners.forEach(callback=>callback())}
export default function AppZoom(){
 const language=useLanguage(),value=useAppZoom(),[draft,setDraft]=useState(String(value));
 useEffect(()=>setDraft(String(value)),[value]);
 const commit=()=>{const number=Number(draft);if(draft.trim()&&Number.isFinite(number))setZoom(number);setDraft(String(zoom))};
 return <div className="app-zoom" role="group" aria-label={language==="ur"?"سافٹ ویئر کا سائز":"Application size"}>
  <span className="app-zoom-label">{language==="ur"?"سائز":"Size"}</span>
  <div className="app-zoom-controls" dir="ltr">
   <button type="button" aria-label="Decrease application size" title={language==="ur"?"چھوٹا کریں":"Make smaller"} disabled={value<=60} onClick={()=>setZoom(value-10)}>−</button>
   <label><input aria-label="Application size percentage" type="number" min="60" max="150" step="1" inputMode="numeric" value={draft} onChange={event=>setDraft(event.target.value)} onBlur={commit} onKeyDown={event=>{if(event.key==="Enter"){event.preventDefault();commit();event.currentTarget.blur()}}}/><span>%</span></label>
   <button type="button" aria-label="Increase application size" title={language==="ur"?"بڑا کریں":"Make larger"} disabled={value>=150} onClick={()=>setZoom(value+10)}>+</button>
   <button type="button" className="app-zoom-reset" aria-label="Reset application size" title={language==="ur"?"اصل سائز 100٪":"Original size 100%"} onClick={()=>setZoom(100)}>↺</button>
  </div>
 </div>;
}
