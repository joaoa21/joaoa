import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
async function send(res,name,status=200){const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root)throw Error('Invalid path');let stat=await fs.stat(file);const target=stat.isDirectory()?path.join(file,'index.html'):file;const body=await fs.readFile(target);res.writeHead(status,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');const name=decodeURIComponent(url.pathname);
  if(name.split('/').some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
  const rules=(await fs.readFile(path.join(root,'_redirects'),'utf8')).split(/\r?\n/).map(line=>line.trim().split(/\s+/));
  for(const [source,target,status] of rules){
   if(!source||source==='/*')continue;
   const match=source.endsWith('*')?name.startsWith(source.slice(0,-1)):source===name;
   if(!match)continue;
   const destination=target.replace(':splat',name.slice(source.length-1));
   if(Number(status)>=300&&Number(status)<400){res.writeHead(Number(status),{Location:destination+url.search});res.end();return;}
   await send(res,destination,Number(status));return;
  }
  try{await send(res,name);}catch{await send(res,'/404.html',404);}
 }catch{res.writeHead(400).end('Invalid request');}
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:'+(process.env.PORT||4173)));
