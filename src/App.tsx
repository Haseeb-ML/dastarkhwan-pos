import React, {useEffect,useLayoutEffect} from "react";
import {useAppZoom} from "./AppZoom";
import Workspace from "./Workspace";
import {useLanguage} from "./LanguageSwitch";
export default function App() {
 const language=useLanguage(),zoom=useAppZoom();
 useLayoutEffect(()=>{
  const root=document.documentElement;
  const applyZoom=()=>{
    const isMobile = window.innerWidth <= 800;
    if (isMobile) {
      root.style.removeProperty("zoom");
      root.style.setProperty("--app-vh", `${window.innerHeight / 100}px`);
      root.style.setProperty("--app-vw", `${window.innerWidth / 100}px`);
    } else {
      const z = zoom / 100;
      root.style.setProperty("zoom", String(z));
      root.style.setProperty("--app-vh", `${window.innerHeight / z / 100}px`);
      root.style.setProperty("--app-vw", `${window.innerWidth / z / 100}px`);
    }
  };
  applyZoom();
  window.addEventListener("resize", applyZoom);
  return ()=>window.removeEventListener("resize", applyZoom);
 },[zoom]);
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==="ur"?"rtl":"ltr";},[language]);
 return <Workspace />;
}
