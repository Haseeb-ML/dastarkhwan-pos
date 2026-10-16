import React, {useSyncExternalStore} from "react";
import {getLanguage, setLanguage, subscribeLanguage} from "./LanguageCore";
export function useLanguage() { return useSyncExternalStore(subscribeLanguage,getLanguage,()=>"ur" as const); }
export default function LanguageSwitch() {
 const language=useLanguage();
 return <div className="language-switch" role="group" aria-label="Language / زبان" dir="ltr">
  <button type="button" lang="ur" aria-pressed={language==="ur"} onClick={()=>setLanguage("ur")}>اردو</button>
  <button type="button" lang="en" aria-pressed={language==="en"} onClick={()=>setLanguage("en")}>English</button>
 </div>;
}
