// Сборка: склеивает src/*.js и шрифты в один index.html
// Запуск: npm install && npm run build
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const fdir = path.join(root, 'node_modules/@fontsource/pixelify-sans/files/');
const b64 = f => fs.readFileSync(fdir + f).toString('base64');
let html = fs.readFileSync(path.join(root, 'tools/template.html'), 'utf8');
const src = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.js')).sort()
  .map(f => `// ---- ${f} ----\n` + fs.readFileSync(path.join(root, 'src', f), 'utf8')).join('\n');
html = html.replace('__FONT_LAT__', b64('pixelify-sans-latin-400-normal.woff2')).replace('__FONT_CYR__', b64('pixelify-sans-cyrillic-400-normal.woff2'))
  .replace('__FONT_LAT7__', b64('pixelify-sans-latin-700-normal.woff2')).replace('__FONT_CYR7__', b64('pixelify-sans-cyrillic-700-normal.woff2'))
  .replace('__CODE__', () => src);
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log('built index.html', (html.length / 1024).toFixed(0) + 'KB');
