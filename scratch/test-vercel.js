fetch('https://briac-pecheur.vercel.app/api/career-evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jobTextOrUrl: "Test d'offre" })
})
.then(res => res.text())
.then(data => console.log('RESPONSE:', data))
.catch(err => console.error('ERROR:', err));
