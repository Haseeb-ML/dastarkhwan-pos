import fs from 'node:fs';import ts from '../node_modules/typescript/lib/typescript.js';
const bundle=fs.readFileSync('build/assets/index-Dqq14hAv.js','utf8');const source=ts.createSourceFile('bundle.js',bundle,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const start=source.statements.find(n=>ts.isFunctionDeclaration(n)&&n.getText(source).includes('size:')&&n.getText(source).includes('grid:'));
if(!start)throw Error('Application boundary missing');
const end=bundle.lastIndexOf('y.createRoot(document');if(end<start.pos)throw Error('Mount boundary missing');
const app='// @ts-nocheck\nimport * as b from "react";\nimport * as x from "react/jsx-runtime";\n'+bundle.slice(start.getStart(source),end)+'\nexport default we;\n';
fs.writeFileSync('Workspace.recovered.tsx',ts.createPrinter().printFile(ts.createSourceFile('Workspace.tsx',app,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)));
fs.copyFileSync('Workspace.recovered.tsx','Workspace.tsx');console.log('Restored complete application component from saved build.');
