import fs from 'node:fs';import ts from '../node_modules/typescript/lib/typescript.js';
const words=JSON.parse(fs.readFileSync('urdu.json','utf8'));
const input=fs.readFileSync('Workspace.tsx','utf8');
const source=ts.createSourceFile('Workspace.tsx',input,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const translated=ts.transform(source,[context=>root=>{
 const visit=node=>{
  if(ts.isJsxText(node)) {const text=node.text.trim().replace(/\s+/g,' ');if(words[text])return ts.factory.createJsxText(node.text.replace(node.text.trim(),words[text]));}
  if(ts.isJsxAttribute(node)&&node.initializer&&ts.isStringLiteral(node.initializer)&&['title','placeholder','aria-label'].includes(node.name.text)&&words[node.initializer.text])return ts.factory.updateJsxAttribute(node,node.name,ts.factory.createStringLiteral(words[node.initializer.text]));
  const next=ts.visitEachChild(node,visit,context);
  if(ts.isJsxExpression(next)&&next.expression&&!next.dotDotDotToken&&node.parent&&(ts.isJsxElement(node.parent)||ts.isJsxFragment(node.parent))) return ts.factory.updateJsxExpression(next,undefined,ts.factory.createCallExpression(ts.factory.createIdentifier('urdu'),undefined,[next.expression]));
  return next;
 };return ts.visitNode(root,visit);
}]).transformed[0];
fs.writeFileSync('Workspace.tsx','import { urdu } from "./Urdu"\n'+ts.createPrinter().printFile(translated));
