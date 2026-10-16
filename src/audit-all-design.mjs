import {chromium} from '@playwright/test';import {writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('output/design-audit',{recursive:true});const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1536,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5173');await page.locator('input').first().fill('owner');await page.locator('input[type=password]').fill('Demo@2026!');await page.locator('.login-page button').last().click();await page.locator('.app-shell').waitFor();const results=[];
async function shot(name){await page.waitForTimeout(200);await page.screenshot({path:`output/design-audit/${name}.png`});const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,heading:document.querySelector('.topbar h1')?.textContent,font:getComputedStyle(document.querySelector('.topbar h1')).fontFamily}));results.push({name,...info});}
async function close(){const d=page.getByRole('dialog');if(await d.count()){const btn=d.getByRole('button',{name:/^Close$|^Close invoice$/});if(await btn.count())await btn.first().click();}}
for(const lang of ['ur','en']){
 await page.locator(`.language-switch button[lang=${lang}]`).click();
 for(let nav=0;nav<9;nav++){
  await page.locator('.sidebar nav button').nth(nav).click();await shot(`${lang}-screen-${nav}`);
  if([2,6,8].includes(nav)){
   const count=await page.locator('.page-content>.subnav button').count();
   for(let tab=0;tab<count;tab++){await page.locator('.page-content>.subnav button').nth(tab).click();await shot(`${lang}-screen-${nav}-tab-${tab}`);}
  }
  if(nav===3||nav===4||nav===5){await page.locator('.page-content>.page-heading button').first().click();await page.getByRole('dialog').waitFor();await shot(`${lang}-dialog-${nav}`);await close();}
  if(nav===6){const actions=page.locator('.stock-workspace>.page-heading .row-actions button');for(let index=0;index<4;index++){await actions.nth(index).click();await page.getByRole('dialog').waitFor();await shot(`${lang}-stock-dialog-${index}`);await close();}}
  if(nav===7){const actions=page.locator('.page-content>.page-heading .row-actions button');for(let index=0;index<await actions.count();index++){await actions.nth(index).click();if(await page.getByRole('dialog').count()){await shot(`${lang}-cash-dialog-${index}`);await close();}}}
  if(nav===8){for(const tab of [1,2]){await page.locator('.page-content>.subnav button').nth(tab).click();await page.locator('.data-card>button').first().click();await page.getByRole('dialog').waitFor();await shot(`${lang}-settings-dialog-${tab}`);await close();}}
 }
}
for(const lang of ['ur','en']){await page.locator(`.language-switch button[lang=${lang}]`).click();await page.setViewportSize({width:390,height:844});for(let nav=0;nav<9;nav++){await page.locator('.sidebar nav button').nth(nav).click();await shot(`${lang}-mobile-${nav}`);}await page.setViewportSize({width:1536,height:850});}
writeFileSync('output/design-audit/results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({screens:results.length,overflow:results.filter(r=>r.overflow),errors}));await browser.close();
