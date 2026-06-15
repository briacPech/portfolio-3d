(Get-Content api\career-adapt-cv.ts) -replace 'const data = await response.json\(\);', 'const data: any = await response.json();' | Set-Content api\career-adapt-cv.ts
(Get-Content api\career-evaluate.ts) -replace 'const data = await response.json\(\);', 'const data: any = await response.json();' | Set-Content api\career-evaluate.ts
(Get-Content api\career-lm.ts) -replace 'const data = await response.json\(\);', 'const data: any = await response.json();' | Set-Content api\career-lm.ts
(Get-Content api\jobs\score.ts) -replace 'const data = await response.json\(\);', 'const data: any = await response.json();' | Set-Content api\jobs\score.ts

(Get-Content api\jobs\cron.ts) -replace 'const scrapeData = await scrapeRes.json\(\);', 'const scrapeData: any = await scrapeRes.json();' | Set-Content api\jobs\cron.ts
(Get-Content api\jobs\cron.ts) -replace 'const scoreData = await scoreRes.json\(\);', 'const scoreData: any = await scoreRes.json();' | Set-Content api\jobs\cron.ts

(Get-Content api\contact.ts) -replace 'const \{ name, email, message \} = req.body;', 'const { name, email, message } = req.body as any;' | Set-Content api\contact.ts
