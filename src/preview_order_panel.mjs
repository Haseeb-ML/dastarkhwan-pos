import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:5173');
 await page.getByLabel('Username',{exact:true}).fill('owner');
 await page.getByLabel('Password',{exact:true}).fill('Demo@2026!');
 await page.locator('form button[type=submit], form button.primary').first().click();
 await page.locator('.catalog').waitFor({state:'visible'});
 for(let i=0;i<8;i++) {
  await page.locator('.catalog .food-card').nth(i).locator('.checkbox').click();
  const variant=page.locator('.variant-list');
  if(await variant.isVisible()) await variant.locator('button').first().click();
 }
 await page.locator('.desktop-order .order-body').evaluate(el=>el.scrollTop=0);
 await page.screenshot({path:'output/evidence/urdu-order.png'});
 await page.locator('.desktop-order .order-body').evaluate(el=>el.scrollTop=el.scrollHeight);
 await page.screenshot({path:'output/evidence/urdu-order-scroll.png'});
 console.log('Screenshots saved; only a temporary browser draft was selected. No invoice or payment was saved.');
} finally {await browser.close()}

