import { test, expect } from '@playwright/test';

test('vérifie que les îles sont dynamiques', async ({ page }) => {
  // On va sur le site local
  await page.goto('http://localhost:3000/');

  // On attend que la scène 3D se charge et que le menu de navigation apparaisse
  // Le menu de navigation devrait contenir des boutons avec du texte venant de Supabase.
  // Par défaut, Supabase renvoie "Profil", "Compétences", "Projets", "Expérience".
  const profilBtn = page.getByRole('button', { name: 'Profil' });
  await expect(profilBtn).toBeVisible({ timeout: 15000 });

  // On clique sur Profil
  await profilBtn.click();

  // On vérifie que la modale s'ouvre bien avec les données
  // Le titre devrait contenir les données de la base.
  const title = page.locator('h1.premium-title');
  await expect(title).toBeVisible({ timeout: 10000 });
  
  // Si Supabase est bien connecté, on doit avoir un texte, pas une erreur.
  const titleText = await title.textContent();
  expect(titleText?.length).toBeGreaterThan(0);
});
