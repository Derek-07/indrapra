const fs = require('fs');
const path = 'c:/Users/Derek goswami/Downloads/indra/frontend/views/logo-upgrade.ejs';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/ðŸŽ¯/g, '🎯');
content = content.replace(/ðŸ“±/g, '📱');
content = content.replace(/ðŸ’°/g, '💰');
content = content.replace(/ðŸ —ï¸ /g, '🏗️');
content = content.replace(/ðŸŒŽ/g, '🌎');
content = content.replace(/âš¡/g, '⚡');
content = content.replace(/â€”/g, '—');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed');
