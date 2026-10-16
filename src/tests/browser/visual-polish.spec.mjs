import {test,expect} from '@playwright/test';
test('visual polish stays readable and respects reduced motion',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByLabel('Username',{exact:true}).fill('owner');await page.getByLabel('Password',{exact:true}).fill('Demo@2026!');await page.locator('form button.primary').click();await page.locator('.sidebar').waitFor();
 await page.setViewportSize({width:1440,height:900});await expect(page.locator('.easy-metrics').first()).toBeVisible();
 expect(await page.locator('.page-content').evaluate(el=>getComputedStyle(el).animationName)).toBe('dastarkhwan-reveal');
 await page.screenshot({path:'output/wow-dashboard-urdu.png',animations:'disabled'});await page.locator('.dashboard-panels').scrollIntoViewIfNeeded();await page.screenshot({path:'output/dashboard-lower-urdu.png',animations:'disabled'});await page.locator('.easy-home>.page-heading').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'English',exact:true}).click();await page.screenshot({path:'output/wow-dashboard-english.png',animations:'disabled'});
 await page.locator('.sidebar').getByRole('button',{name:'Customers',exact:true}).click();await page.locator('.page-heading button').first().click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();expect(await dialog.evaluate(el=>getComputedStyle(el).animationName)).toBe('dastarkhwan-dialog');
 await page.emulateMedia({reducedMotion:'reduce'});expect(await dialog.evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await dialog.locator('.dialog-close-button').click();await expect(dialog).not.toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.locator('.sidebar').getByRole('button',{name:'Dashboard',exact:true}).click();await page.screenshot({path:'output/wow-dashboard-mobile.png',animations:'disabled'});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
