import { chromium } from '@playwright/test';
import { exec } from 'child_process';

const run = async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to http://localhost:5173/admin...');
  try {
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  } catch (e) {
    console.log('Error navigating to dev server.');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Clicking "Profil" tab in admin...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const profilBtn = buttons.find(b => b.textContent && b.textContent.includes('Profil'));
    if (profilBtn) profilBtn.click();
    else console.log('Profil button not found in admin');
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Done.');
  await browser.close();
  process.exit(0);
};

run().catch(console.error);
