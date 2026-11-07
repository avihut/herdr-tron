import {cpSync,existsSync,lstatSync,mkdirSync,readdirSync,readFileSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {homedir} from 'node:os';import {dirname,join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import {randomUUID} from 'node:crypto';import {spawnSync} from 'node:child_process';
const source=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const targets=['mods/tron','themes/tron-dark.json','themes/tron-light.json','layouts/tron.svg','layouts/tron.json'];
function stat(path){try{return lstatSync(path);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
function safe(path){const s=stat(path);if(s?.isSymbolicLink())throw Error(`Symlink refused: ${path}`);if(s?.isDirectory())for(const n of readdirSync(path))safe(join(path,n));}
function ancestors(path){let p=resolve(path);for(;;){if(stat(p)?.isSymbolicLink())throw Error(`Symlink ancestor refused: ${p}`);const next=dirname(p);if(next===p)break;p=next;}}
function files(dir,prefix=''){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);}
export function validatePackage(root){
 for(const name of targets){safe(join(root,name));if(!existsSync(join(root,name)))throw Error(`Missing source: ${name}`);}
 for(const name of targets.filter(n=>n.endsWith('.json')))JSON.parse(readFileSync(join(root,name),'utf8'));
 if(JSON.parse(readFileSync(join(root,'mods/tron/mod.json'),'utf8')).place!=='none')throw Error('Manifest must use place:none');
 const mod=join(root,'mods/tron');for(const file of files(mod).filter(n=>n.endsWith('.js'))){const text=readFileSync(join(mod,file),'utf8');for(const m of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){const dep=resolve(dirname(join(mod,file)),m[1]);if(!dep.startsWith(mod+'/')||!existsSync(dep))throw Error(`Missing or external local import in ${file}: ${m[1]}`);}}
}
export function validateNative(root){validatePackage(root);const r=spawnSync(process.execPath,[join(source,'scripts/check.js'),'--source',root],{encoding:'utf8',maxBuffer:8*1024*1024});if(r.error||r.status!==0)throw Error(`Native validation failed: ${r.error?.message??r.stderr??r.stdout}`);}
export function install({configDir=join(homedir(),'.config/herdr-app'),sourceDir=source,update=false,validate=validateNative,fault=()=>{}}={}){
 validatePackage(sourceDir);ancestors(configDir);mkdirSync(configDir,{recursive:true});
 for(const name of targets){ancestors(join(configDir,name));safe(join(configDir,name));}
 const existing=targets.filter(n=>existsSync(join(configDir,n)));
 if(existing.length&&!update)throw Error('TRON targets already exist. Use --update for an explicit backed-up replacement.');
 const id=randomUUID(),stage=join(configDir,`.tron-stage-${id}`),backup=join(configDir,'backups','tron',id);ancestors(backup);mkdirSync(stage,{recursive:true});
 const moved=[],published=[];let rollbackFailed=false;
 try{
  // Complete merged folder outside watched mods. Preserve files this package did not own.
  const mod=join(stage,'mods/tron');mkdirSync(mod,{recursive:true});
  if(existing.includes('mods/tron')){cpSync(join(configDir,'mods/tron'),mod,{recursive:true});const previous=join(mod,'.tron-owned.json');if(existsSync(previous)){for(const file of JSON.parse(readFileSync(previous,'utf8'))){if(typeof file!=='string'||file.startsWith('/')||file.split('/').includes('..'))throw Error('Invalid ownership manifest');rmSync(join(mod,file),{force:true});}}}
  const input=join(sourceDir,'mods/tron'),owned=files(input).filter(f=>f!=='.tron-owned.json');
  cpSync(join(input,'mod.json'),join(mod,'mod.json'));
  for(const f of owned.filter(f=>f!=='mod.json'&&f!=='main.js')){mkdirSync(dirname(join(mod,f)),{recursive:true});cpSync(join(input,f),join(mod,f));}
  cpSync(join(input,'main.js'),join(mod,'main.js'));writeFileSync(join(mod,'.tron-owned.json'),JSON.stringify(owned));
  for(const n of targets.slice(1)){mkdirSync(dirname(join(stage,n)),{recursive:true});cpSync(join(sourceDir,n),join(stage,n));}
  validate(stage);fault('validated');
  for(const n of targets){const dst=join(configDir,n);mkdirSync(dirname(dst),{recursive:true});if(existing.includes(n)){mkdirSync(dirname(join(backup,n)),{recursive:true});renameSync(dst,join(backup,n));moved.push(n);}fault('before:'+n);renameSync(join(stage,n),dst);published.push(n);fault('after:'+n);}
 }catch(error){
  try{for(const n of [...targets].reverse()){if(published.includes(n))rmSync(join(configDir,n),{recursive:true,force:true});if(moved.includes(n)){fault('rollback:'+n);renameSync(join(backup,n),join(configDir,n));}}}catch(rollback){rollbackFailed=true;throw Error(`${error.message}; ROLLBACK FAILED: ${rollback.message}. Recovery retained at ${backup} and ${stage}`);}
  throw error;
 }finally{if(!rollbackFailed)rmSync(stage,{recursive:true,force:true});}
 return {configDir:resolve(configDir),backup:existing.length?backup:null};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i++){if(args[i]==='--update')options.update=true;else if(args[i]==='--config-dir'&&args[i+1])options.configDir=resolve(args[++i]);else throw Error(`Unknown argument: ${args[i]}`);}const r=install(options);console.log(`TRON installed. Active layout and settings unchanged. Backup: ${r.backup??'new install'}`);}catch(e){console.error(e.message);process.exitCode=1;}
}
