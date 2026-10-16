import {test,expect} from '@playwright/test';
const nav=(page,name)=>page.locator('.sidebar').getByRole('button',{name,exact:true}).click();
async function login(page){await page.goto('/');await page.getByLabel('Username',{exact:true}).fill('owner');await page.getByLabel('Password',{exact:true}).fill('Demo@2026!');await page.locator('form button.primary').click();await page.locator('.sidebar').waitFor();}
async function changeWithDialogOpen(page,name){await page.getByRole('button',{name,exact:true}).evaluate(el=>el.click());}
test('Urdu default, English navigation, food names and remembered selection',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('button',{name:'اردو',exact:true})).toHaveAttribute('aria-pressed','true');await login(page);
 await expect(page.locator('.topbar h1')).toHaveText('ڈیش بورڈ');await page.getByRole('button',{name:'English',exact:true}).click();await expect(page.locator('.topbar h1')).toHaveText('Dashboard');await expect(page.locator('html')).toHaveAttribute('dir','ltr');
 for(const name of ['Menu','Customers','Stock & Purchases','Daily Summary','Settings','Tables','Orders & Kitchen','New Order']){await nav(page,name);await expect(page.locator('.uk-trigger')).toHaveCount(0);}
 await expect(page.locator('.food-info')).toContainText(['چکن کڑاہی','مٹن کڑاہی']);await expect(page.locator('.main-shell')).toContainText('Which dish would you like?');await expect(page.locator('.main-shell')).not.toContainText('Kya order lena');
 await page.reload();await expect(page.getByRole('button',{name:'English',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'اردو',exact:true}).click();await expect(page.locator('.topbar h1')).toHaveText('ڈیش بورڈ');expect(errors).toEqual([]);
});
test('switching language retains open customer form and unchanged save payload',async({page})=>{
 await login(page);await nav(page,'Customers');await page.locator('.page-heading button').first().click();const dialog=page.getByRole('dialog');await dialog.getByLabel('Customer name',{exact:true}).fill('محمد علی');await dialog.getByLabel('Pakistani mobile',{exact:true}).fill('03123456789');await dialog.getByLabel('Customer address').fill('Street 5');await expect(dialog.locator('.uk-trigger').first()).toBeVisible();
 await changeWithDialogOpen(page,'English');await expect(dialog.getByLabel('Customer name',{exact:true})).toHaveValue('محمد علی');await expect(dialog.getByLabel('Customer address')).toHaveValue('Street 5');await expect(dialog.locator('.uk-trigger')).toHaveCount(0);await expect(dialog.getByRole('button',{name:'Save customer',exact:true})).toBeVisible();
 await changeWithDialogOpen(page,'اردو');await expect(dialog.getByLabel('Customer name',{exact:true})).toHaveValue('محمد علی');await expect(dialog.locator('.uk-trigger').first()).toBeVisible();await changeWithDialogOpen(page,'English');
 let body;await page.route('**/api/customers/save',async route=>{body=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:'{"id":999}'})});await dialog.getByRole('button',{name:'Save customer',exact:true}).click();await expect.poll(()=>body?.name).toBe('محمد علی');expect(body.phone).toBe('03123456789');expect(body.address).toBe('Street 5');
});
test('order draft quantities and totals, report dates and mobile controls survive language switch',async({page})=>{
 await login(page);await nav(page,'New Order');await page.getByRole('button',{name:'Select Roghni Naan',exact:true}).click();const panel=page.locator('.desktop-order');await panel.getByLabel('Quantity Roghni Naan Piece').fill('4');const total=await panel.locator('.grand').innerText();const amount=total.match(/[\d,]+/g).join('');
 await page.getByRole('button',{name:'English',exact:true}).click();await expect(panel.getByLabel('Quantity Roghni Naan Piece')).toHaveValue('4');expect((await panel.locator('.grand').innerText()).match(/[\d,]+/g).join('')).toBe(amount);await expect(panel.locator('.order-copy')).toContainText(['روغنی نان']);
 await nav(page,'Daily Summary');await page.getByLabel('Report from').fill('2026-10-01');await page.getByRole('button',{name:'اردو',exact:true}).click();await expect(page.getByLabel('Report from')).toHaveValue('2026-10-01');await nav(page,'New Order');await expect(panel.getByLabel('Quantity Roghni Naan Piece')).toHaveValue('4');
 await page.getByRole('button',{name:'English',exact:true}).click();await nav(page,'Menu');await page.getByRole('button',{name:'Choose a dish from ready list',exact:true}).click();await expect(page.locator('.catalog-dialog')).toContainText('Pakistani food directory');await expect(page.locator('.catalog-dialog .uk-trigger')).toHaveCount(0);await page.setViewportSize({width:390,height:844});const close=page.locator('.catalog-dialog footer button');await expect(close).toBeVisible();const box=await close.boundingBox();expect(box.y+box.height).toBeLessThanOrEqual(844);await page.screenshot({path:'output/language-mobile-en.png'});await close.click();await expect(page.getByRole('button',{name:'English',exact:true})).toBeVisible();await page.screenshot({path:'output/language-menu-mobile-en.png'});
});
test('all nine sidebar modules remain reachable in both languages on short screens',async({page})=>{
 await page.setViewportSize({width:1280,height:559});await login(page);
 const names=['Dashboard','New Order','Orders & Kitchen','Tables','Menu','Customers','Stock & Purchases','Daily Summary','Settings'];
 for(const language of ['English','اردو']){
  await page.getByRole('button',{name:language,exact:true}).click();await expect(page.locator('.sidebar nav button')).toHaveCount(names.length);await page.locator('.sidebar nav').evaluate(el=>el.scrollTop=0);await expect(page.locator('.sidebar-more button')).toBeVisible();await page.locator('.sidebar-more button').click();
  for(const name of names){await nav(page,name);await expect(page.locator('.sidebar').getByRole('button',{name,exact:true})).toHaveAttribute('aria-current','page');}
 }
});
