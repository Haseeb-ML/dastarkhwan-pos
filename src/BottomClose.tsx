import {ui, languageDirection} from "./LanguageCore";
﻿import React from "react"
export default function BottomClose({onClose,disabled=false}:{onClose:()=>void;disabled?:boolean}) {
 return <footer className="dialog-bottom-close"><button type="button" className="dialog-close-button" disabled={disabled} onClick={onClose}>{ui("بند کریں")}</button></footer>
}
