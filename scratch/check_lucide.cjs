const lucide = require('lucide-react');
const required = ['Briefcase', 'FileText', 'Mail', 'Save', 'Loader2', 'Zap', 'X'];

const missing = required.filter(icon => !lucide[icon]);

if (missing.length > 0) {
  console.log('MISSING ICONS:', missing.join(', '));
} else {
  console.log('All icons exist.');
}
