const fs = require('fs');
const path = require('path');

const viewsDir = 'c:/Users/Derek goswami/Downloads/indra/frontend/views';
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

const oldLight = '<svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.708.708a1 1 0 01-1.414 1.414l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM14.93 15.637a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.22-4.22a1 1 0 01-1.415 0l-.708-.708a1 1 0 011.414-1.414l.708.708a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm3.07-5.637a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>';
const oldDark = '<svg id="theme-toggle-dark-icon" class="hidden w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>';

const newLight = '<svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>';
const newDark = '<svg id="theme-toggle-dark-icon" class="hidden w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';

for (const file of files) {
    const fullPath = path.join(viewsDir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // First try replacing them exactly
    let newContent = content.replace(oldLight, newLight).replace(oldDark, newDark);
    
    // If it didn't match (because of newlines/spacing), let's use regex
    if (newContent === content) {
        // Find theme-toggle block and replace
        const regexLight = /<svg id="theme-toggle-light-icon"[^>]*>.*?<\/svg>/s;
        const regexDark = /<svg id="theme-toggle-dark-icon"[^>]*>.*?<\/svg>/s;
        
        newContent = newContent.replace(regexLight, newLight);
        newContent = newContent.replace(regexDark, newDark);
    }
    
    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed button in ' + file);
    }
}
