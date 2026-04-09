const fs = require('fs');
const path = require('path');
// Remove conflicting [word] route - [id] handles both ID and word lookups
const target = path.join(__dirname, '..', 'src', 'app', 'api', 'vocabulary', '[word]');
fs.rmSync(target, { recursive: true });
console.log('Deleted:', target);
