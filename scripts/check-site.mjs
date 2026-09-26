import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const walk=async dir=>{const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){if(e.name==='.git'||e.name==='node_modules')continue;const p=path.join(dir,e.name);out.push(...(e.isDirectory()?await walk(p):[p]));}return out;};
const relative=p=>path.relative(root,p).replaceAll('\\','/');
const files=await walk(root), names=new Set(files.map(relative));
const errors=[];let references=0,scripts=0,pages=0;
for(const file of files.filter(p=>/\.(html|css|js)$/.test(p))){
 const source=await fs.readFile(file,'utf8');
 if(file.endsWith('.js')){scripts++;try{execFileSync(process.execPath,['--check',file],{stdio:'pipe'});}catch(e){errors.push(relative(file)+': '+e.stderr);}}
 if(file.endsWith('.html'))pages++;
 const refs=[...source.matchAll(/(?:src|href|poster|data-full)\s*=\s*["']([^"']+)["']/g),...source.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)];
 for(const match of refs){
  let value=match[1];
  if(/^(data:|[a-z]+:|\/\/|\$|%23)/i.test(value))continue;
  const clean=decodeURIComponent(value.split(/[?#]/)[0]);
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
console.log(JSON.stringify({pages,scripts,references,errors},null,2));
process.exitCode=errors.length?1:0;
