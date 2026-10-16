import {test,expect} from '@playwright/test';
test('app zoom preserves draft, browser scale, dialogs and remembered percentage',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.getByLabel('Username',{exact:true}).fill('owner');await page.getByLabel('Password',{exact:true}).fill('Demo@2026!');await page.locator('form button.primary').click();await page.locator('.sidebar').waitFor();
 const initial=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scale:visualViewport.scale}));const size=page.getByLabel('Application size percentage');await expect(size).toHaveValue('100');
 await page.locator('.sidebar').getByRole('button',{name:'New Order',exact:true}).click();await page.screenshot({path:'output/new-order-design-100.png',animations:'disabled'});await page.getByRole('button',{name:'Select Roghni Naan',exact:true}).click();const quantity=page.locator('.desktop-order').getByLabel('Quantity Roghni Naan Piece');await quantity.fill('4');
 for(const value of ['80','125','150','60','100']){
  await size.fill(value);await size.press('Enter');await expect(size).toHaveValue(value);await expect(quantity).toHaveValue('4');expect(await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scale:visualViewport.scale}))).toEqual(initial);
  const sidebar=await page.locator('.sidebar').boundingBox();expect(Math.abs(sidebar.y+sidebar.height-900)).toBeLessThan(3);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await size.fill('80');await size.press('Enter');await page.screenshot({path:'output/app-zoom-80.png',animations:'disabled'});
 await page.locator('.sidebar').getByRole('button',{name:'Customers',exact:true}).click();await page.locator('.page-heading button').first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();const box=await dialog.boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(901);await dialog.locator('.dialog-close-button').click();
 await page.reload();await expect(size).toHaveValue('80');await page.getByRole('button',{name:'Reset application size',exact:true}).click();await expect(size).toHaveValue('100');await page.setViewportSize({width:390,height:844});await expect(size).toBeVisible();await page.screenshot({path:'output/app-zoom-mobile.png',animations:'disabled'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
