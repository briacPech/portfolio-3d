(Get-Content api\chat.ts) -replace 'const \{ messages \}: \{ messages: UIMessage\[\] \} = await req.json\(\);', 'const { messages } = await req.json() as any;' | Set-Content api\chat.ts
(Get-Content api\contact.ts) -replace 'const \{ name, email, message \} = await req.json\(\);', 'const { name, email, message } = await req.json() as any;' | Set-Content api\contact.ts
