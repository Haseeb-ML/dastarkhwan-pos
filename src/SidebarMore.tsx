import React,{useEffect,useRef,useState} from "react";
import {useLanguage} from "./LanguageSwitch";
export default function SidebarMore(){
 const language=useLanguage(),anchor=useRef<HTMLDivElement>(null),[more,setMore]=useState(false);
 useEffect(()=>{const nav=anchor.current?.closest('.sidebar')?.querySelector('nav');if(!nav)return;const update=()=>setMore(nav.scrollHeight-nav.clientHeight-nav.scrollTop>4);const observer=new ResizeObserver(update);observer.observe(nav);nav.addEventListener('scroll',update);update();return()=>{observer.disconnect();nav.removeEventListener('scroll',update)}},[language]);
 return <div ref={anchor} className="sidebar-more">{more&&<button type="button" onClick={()=>{const nav=anchor.current?.closest('.sidebar')?.querySelector('nav');nav?.scrollBy({top:Math.max(160,nav.clientHeight*.65),behavior:'smooth'})}}>{language==='ur'?'مزید صفحے دیکھیں ↓':'More sections below ↓'}</button>}</div>
}
