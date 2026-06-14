import { chromium } from 'playwright';

(async () => {
  console.log('Lancement du navigateur...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.type().toUpperCase()} - ${msg.text()}`));
  
  // Capture page errors (uncaught exceptions)
  page.on('pageerror', error => console.log(`BROWSER ERROR: ${error.message}`));

  console.log('Navigation vers http://localhost:3000/ ...');
  try {
    const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`Navigation 3000/ terminée avec le status: ${response ? response.status() : 'inconnu'}`);
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
  } catch (err) {
    console.error('Erreur lors de la navigation 3000/:', err);
  }

  console.log('Navigation vers http://localhost:3000/admin ...');
  try {
    const response2 = await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`Navigation 3000/admin terminée avec le status: ${response2 ? response2.status() : 'inconnu'}`);
    
    // Wait a bit for React to render
    await page.waitForTimeout(2000);
  } catch (err) {
    console.error('Erreur lors de la navigation 3000/admin:', err);
  }

  await browser.close();
})();
