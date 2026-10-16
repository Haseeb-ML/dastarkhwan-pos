import fs from 'node:fs';import ts from '../node_modules/typescript/lib/typescript.js';
const words=JSON.parse(fs.readFileSync('urdu.json','utf8'));
const input=fs.readFileSync('Workspace.recovered.tsx','utf8');const source=ts.createSourceFile('Workspace.tsx',input,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const f=ts.factory;
const translate=n=>f.createCallExpression(f.createIdentifier('urdu'),undefined,[n]);
const jsx=(tag,children,cl)=>f.createCallExpression(f.createParenthesizedExpression(f.createBinaryExpression(f.createNumericLiteral(0),f.createToken(ts.SyntaxKind.CommaToken),f.createPropertyAccessExpression(f.createIdentifier('x'),'jsx'))),undefined,[f.createStringLiteral(tag),f.createObjectLiteralExpression([f.createPropertyAssignment('className',f.createStringLiteral(cl)),f.createPropertyAssignment('children',f.createArrayLiteralExpression(children))])]);
const transformed=ts.transform(source,[ctx=>root=>{
 const visit=node=>{
  let next=ts.visitEachChild(node,visit,ctx);
  if(ts.isCallExpression(next)&&next.arguments.length>=2&&ts.isStringLiteralLike(next.arguments[0])&&ts.isObjectLiteralExpression(next.arguments[1])){
   let tag=next.arguments[0].text,props=[...next.arguments[1].properties];const classProp=props.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(source)==='className');const cls=classProp&&ts.isStringLiteralLike(classProp.initializer)?classProp.initializer.text:'';
   if(['optional-customer','optional-discount','kitchen-note'].includes(cls))tag='div';
   if(tag==='summary')tag='span';
   if(tag==='details')tag='div';
   if(cls==='app-shell'||cls==='login-page'){props.push(f.createPropertyAssignment('dir',f.createStringLiteral('rtl')),f.createPropertyAssignment('lang',f.createStringLiteral('ur')));}
   if(cls==='order-panel'){
    props=props.map(p=>{if(ts.isPropertyAssignment(p)&&p.name.getText(source)==='children'){const v=ts.isCallExpression(p.initializer)&&p.initializer.expression.getText(source)==='urdu'?p.initializer.arguments[0]:p.initializer;if(ts.isArrayLiteralExpression(v)){let a=[...v.elements];if(a.length===6)return f.updatePropertyAssignment(p,p.name,f.createArrayLiteralExpression([a[0],jsx('div',a.slice(1,4),'order-body'),jsx('footer',a.slice(4),'order-footer')]));}}return p;});
   }
   next=f.updateCallExpression(next,next.expression,next.typeArguments,[f.createStringLiteral(tag),f.updateObjectLiteralExpression(next.arguments[1],props),...next.arguments.slice(2)]);
  }
  if(ts.isPropertyAssignment(next)){
   const key=next.name.getText(source);
   if(key==='children')return f.updatePropertyAssignment(next,next.name,translate(next.initializer));
   if(['placeholder','title','aria-label'].includes(key)&&ts.isStringLiteralLike(next.initializer)&&words[next.initializer.text])return f.updatePropertyAssignment(next,next.name,f.createStringLiteral(words[next.initializer.text]));
   if(key==='value'&&ts.isPropertyAccessExpression(next.initializer)&&['name','category'].includes(next.initializer.name.text))return f.updatePropertyAssignment(next,next.name,translate(next.initializer));
  }
  return next;
 };return ts.visitNode(root,visit);
}]).transformed[0];
fs.writeFileSync('Workspace.tsx','// @ts-nocheck\nimport { urdu } from "./Urdu";\n'+ts.createPrinter().printFile(transformed));
