# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portfolio.spec.ts >> vérifie que les îles sont dynamiques
- Location: tests\portfolio.spec.ts:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Profil' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button', { name: 'Profil' })

```

```yaml
- text: Mon Profil Mes Compétences
- button "Briac Pécheur"
- button "Mes Compétences"
- button "Mes Expéditions"
- button "Mon Sillage"
- button "Contact"
- button "Ouvrir l'assistant IA": Le Capitaine
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('vérifie que les îles sont dynamiques', async ({ page }) => {
  4  |   // On va sur le site local
  5  |   await page.goto('http://localhost:3000/');
  6  | 
  7  |   // On attend que la scène 3D se charge et que le menu de navigation apparaisse
  8  |   // Le menu de navigation devrait contenir des boutons avec du texte venant de Supabase.
  9  |   // Par défaut, Supabase renvoie "Profil", "Compétences", "Projets", "Expérience".
  10 |   const profilBtn = page.getByRole('button', { name: 'Profil' });
> 11 |   await expect(profilBtn).toBeVisible({ timeout: 15000 });
     |                           ^ Error: expect(locator).toBeVisible() failed
  12 | 
  13 |   // On clique sur Profil
  14 |   await profilBtn.click();
  15 | 
  16 |   // On vérifie que la modale s'ouvre bien avec les données
  17 |   // Le titre devrait contenir les données de la base.
  18 |   const title = page.locator('h1.premium-title');
  19 |   await expect(title).toBeVisible({ timeout: 10000 });
  20 |   
  21 |   // Si Supabase est bien connecté, on doit avoir un texte, pas une erreur.
  22 |   const titleText = await title.textContent();
  23 |   expect(titleText?.length).toBeGreaterThan(0);
  24 | });
  25 | 
```