const fs = require('fs');
const path = require('path');

const viewsDir = 'c:/Users/Derek goswami/Downloads/indra/frontend/views';
const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

for (const file of files) {
    const filePath = path.join(viewsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fallbacks
    content = content.replace(/\/?asset\/image\/commercial\/card_commercial\.jpg/g, '/asset/card_commercial_1783442002069.jpg');
    content = content.replace(/\/?asset\/image\/residential\/idea_bathroom\.jpg/g, '/asset/card_residential_1783441988273.jpg');
    content = content.replace(/\/?asset\/image\/commercial\/idea_bedroom\.jpg/g, '/asset/idea_bedroom_1783442834138.jpg');

    // 2. Relative to Absolute
    content = content.replace(/src="asset\//g, 'src="/asset/');
    content = content.replace(/href="css\//g, 'href="/css/');
    content = content.replace(/src="js\//g, 'src="/js/');

    // 3. Logo styling
    content = content.replace(/class="h-10 md:h-14 object-contain transition-all bg-brandTeal\/95 dark:bg-transparent rounded-xl px-3 py-1\.5 shadow-lg dark:shadow-none dark:drop-shadow-\[0_0_10px_rgba\(255,255,255,0\.2\)\]"/g, 'class="h-10 md:h-14 object-contain transition-all"');

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Done");
