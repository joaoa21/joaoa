import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const walk=async dir=>{const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='.git'||e.name==='node_modules')continue;const p=path.join(dir,e.name);out.push(...(e.isDirectory()?await walk(p):[p]));}return out;};
const relative=p=>path.relative(root,p).replaceAll('\\','/');
const files=await walk(root), names=new Set(files.map(relative));
const errors=[];let references=0,scripts=0,pages=0;
// Rotas servidas por proxy no _redirects (ex.: /blog/* → site do blog): existem em outro projeto
const proxied=(await fs.readFile(path.join(root,'_redirects'),'utf8').catch(()=>'')).split(/\r?\n/).map(l=>l.trim().split(/\s+/)).filter(([from,to,status])=>from?.endsWith('/*')&&/^https?:/.test(to||'')&&status==='200').map(([from])=>from.slice(0,-1));
for(const file of files.filter(p=>/\.(html|css|js)$/.test(p))){
 const source=await fs.readFile(file,'utf8');
 if(file.endsWith('.js')){scripts++;try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch(e){errors.push(relative(file)+': '+e.stderr);}}
 if(file.endsWith('.html'))pages++;
 const refs=[...source.matchAll(/(?:src|href|poster|data-full)\s*=\s*["']([^"']+)["']/g),...source.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)];
 for(const match of refs){
  let value=match[1];
  if(/^(data:|[a-z]+:|\/\/|\$|%23)/i.test(value))continue;
  const clean=decodeURIComponent(value.split(/[?#]/)[0]);
  if(proxied.some(prefix=>clean.startsWith(prefix)))continue;
  const target=clean?path.resolve(clean.startsWith('/')?root:path.dirname(file),clean.startsWith('/')?'.'+clean:clean):file;
  let name=relative(target);
  if(!name||!path.extname(name))name=(name?name.replace(/\/$/,'')+'/':'')+'index.html';
  references++;
  if(!names.has(name)){errors.push(`${relative(file)}: ${value} → arquivo inexistente ou nome com capitalização incorreta (${name})`);continue;}
  const fragment=value.split('#')[1];
  if(fragment&&name.endsWith('.html')){
   const html=await fs.readFile(path.join(root,name),'utf8');
   if(!html.includes('id="'+decodeURIComponent(fragment)+'"')&&!html.includes("id='"+decodeURIComponent(fragment)+"'"))errors.push(`${relative(file)}: âncora ausente ${value}`);
  }
 }
}
// O bloco de redes sociais é repetido nas páginas: todas as cópias precisam ser iguais.
const socialBlocks=new Map();
for(const file of files.filter(p=>p.endsWith('.html'))){
 const block=(await fs.readFile(file,'utf8')).match(/<nav aria-label="Redes sociais" class="contact-networks">[\s\S]*?<\/nav>/)?.[0];
 if(block)socialBlocks.set(relative(file),block.replace(/>\s+</g,'><').trim());
}
if(new Set(socialBlocks.values()).size>1){
 const [reference]=socialBlocks.values();
 for(const [name,block] of socialBlocks)if(block!==reference)errors.push(`${name}: bloco de redes sociais diferente das outras páginas`);
}
console.log(JSON.stringify({pages,scripts,references,socialBlocks:socialBlocks.size,errors},null,2));
process.exitCode=errors.length?1:0;
