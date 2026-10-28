const fs = require('fs');
const path = require('path');
function walk(dir) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) out = out.concat(walk(p));
    else if (/\.(tsx|ts)$/.test(p)) out.push(p);
  }
  return out;
}
const skip = new Set([
  'src/components/Header.tsx',
  'src/components/Footer.tsx',
  'src/components/ProductCard.tsx',
  'src/components/admin/AdminHeader.tsx',
  'src/components/admin/AdminSidebar.tsx',
  'src/components/admin/menu.ts',
  'src/app/page.tsx',
]);
for (const file of walk('src')) {
  if (skip.has(file.replace(/\\/g, '/'))) continue;
  const s = fs.readFileSync(file, 'utf8');
  const slate = (s.match(/slate-\d+/g) || []).length;
  const red = (s.match(/\bred-\d+/g) || []).length;
  const black = (s.match(/font-black/g) || []).length;
  const xl = (s.match(/rounded-(xl|2xl)/g) || []).length;
  if (slate + red + black + xl > 0) {
    console.log(`${file}  slate=${slate} red=${red} black=${black} radius=${xl}`);
  }
}
