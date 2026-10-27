const fs = require('fs');
const files = [
  'src/components/Footer.tsx',
  'src/components/Header.tsx',
  'src/app/thanh-toan/page.tsx',
  'src/app/don-hang/[code]/page.tsx'
];
for (const p of files) {
  try {
    const buf = fs.readFileSync(p);
    const s = buf.toString('utf8');
    if (s.includes('\ufffd')) {
      console.log('REPL_CHAR:', p);
    }
    // check for patterns with replacement char
    if (/Vi.*Nam/.test(s) && s.includes('\ufffd')) {
      console.log('VIET_MOJIBAKE:', p);
    }
    if (/ang t.*i/.test(s) && s.includes('\ufffd')) {
      console.log('LOADING_MOJIBAKE:', p);
    }
  } catch(e) {
    console.log('ERR', p, e.message);
  }
}
