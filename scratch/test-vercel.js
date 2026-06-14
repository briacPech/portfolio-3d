fetch('https://floating-chat-component-p4poi0m08-vab-s-projects.vercel.app/api/career-evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jobTextOrUrl: "Test offre d'emploi no-code" })
})
.then(res => res.text())
.then(data => console.log('RESPONSE:', data))
.catch(err => console.error('ERROR:', err));
