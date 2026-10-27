const fs=require('fs');
const path=require('path');
function walk(d){
  const out=[];
  for(const f of fs.readdirSync(d)){
    const p=path.join(d,f);
    const st=fs.statSync(p);
    if(st.isDirectory()){
      if(p.includes('node_modules')||p.includes('.next')) continue;
      out.push(...walk(p));
    }else{
      if(p.match(/\.(tsx|ts|js|jsx)$/)) out.push(p);
    }
  }
  return out;
}
const files=walk('src');
for(const f of files){
  try{
    const s=fs.readFileSync(f,'utf8');
    if(s.includes('\ufffd')) console.log(f);
  }catch(e){}
}
