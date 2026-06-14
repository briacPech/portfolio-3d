import { chromium } from '@playwright/test';
import { exec } from 'child_process';

const run = async () => {
  console.log('Starting dev server...');
  const server = exec('npm run serve'); // serve uses vite preview which is the built version
  
  // wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to http://localhost:4173...');
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  } catch (e) {
    console.log('Could not connect to preview, trying dev server...');
    const devServer = exec('npm run start');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  }

  console.log('Waiting for islands to be interactive...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // The 3D canvas is tricky to click, but we can bypass it by calling the global state directly
  // or by clicking the dock menu! The dock menu has buttons!
  console.log('Clicking "Profil" button in dock menu...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const profilBtn = buttons.find(b => b.textContent && b.textContent.includes('Profil'));
    if (profilBtn) profilBtn.click();
    else console.log('Profil button not found');
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Clicking "Parcours" (Experience) button in dock menu...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const expBtn = buttons.find(b => b.textContent && b.textContent.includes('Parcours'));
    if (expBtn) expBtn.click();
    else console.log('Parcours button not found');
  });

  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Done.');
  await browser.close();
  process.exit(0);
};

run().catch(console.error);
