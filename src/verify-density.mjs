import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1536,height:600}});
await page.addInitScript(()=>localStorage.setItem('dastarkhwan-language','en'));
await page.goto('http://127.0.0.1:5173');
await page.getByLabel('Username',{exact:true}).fill('owner');
await page.getByLabel('Password',{exact:true}).fill('Demo@2026!');
await page.locator('.login-page button').last().click();
await page.locator('.sidebar nav button').nth(1).click();
await page.locator('.pos-layout').waitFor();
await page.getByRole('button',{name:'اردو',exact:true}).click();
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:'output/compact-desktop.png'});
for(const size of [{width:1536,height:600},{width:1366,height:768},{width:1024,height:768}]){
 await page.setViewportSize(size);
 await page.waitForTimeout(200);
 console.log(JSON.stringify(await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,zoom:document.documentElement.style.zoom,footer:document.querySelector('.order-footer').getBoundingClientRect().toJSON(),actions:document.querySelector('.order-actions').getBoundingClientRect().toJSON()}))));
}
await browser.close();




