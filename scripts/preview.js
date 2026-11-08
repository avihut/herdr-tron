// Original source-geometry illustrations. No session data or film artwork.
import {writeFileSync,mkdirSync} from 'node:fs';
import {projectDisc,faceColor} from '../mods/tron/geometry.js';
import {gridPalette,consoleGeometry,discCradle,energyFlow} from '../mods/tron/design.js';
mkdirSync('previews',{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const rect=(x,y,w,h,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
const text=(x,y,s,size,color)=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}">${esc(s)}</text>`;
const path=(lines,color,width=1,opacity=1)=>`<path d="${lines.map(ps=>ps.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join('')).join('')}" fill="none" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
const polygon=(points,fill)=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}"/>`;
const mesh=(size,color,pitch=.35)=>projectDisc(.14,pitch,size).map(f=>polygon(f.points,faceColor(f,color))).join('');
// Illustrates the native one-direction flow: a lit copy of the path seen through a window that
// sweeps left to right, holds off-screen, then re-enters. Still previews freeze it mid-run.
let clipN=0;
function flow(lines,x0,len,h,c,color,animated=false,phase=.62,opts={}){const f=energyFlow(len,opts);if(!f)return '';const id=`flow${clipN++}`;
 const sweep=f.steps*f.ms,dur=f.counts.length*f.ms,from=x0-f.pad,to=x0+len,at=Math.round(from+phase*(to-from));
 const r=animated?`<rect x="${from}" y="0" width="${f.win}" height="${h}"><animate attributeName="x" values="${from};${to};${to}" keyTimes="0;${(sweep/dur).toFixed(3)};1" dur="${(dur/1000).toFixed(2)}s" begin="${(-phase*dur/1000).toFixed(2)}s" repeatCount="indefinite"/></rect>`:`<rect x="${at}" y="0" width="${f.win}" height="${h}"/>`;
 return `<clipPath id="${id}">${r}</clipPath><g clip-path="url(#${id})">${path(lines,color,7,.33)}${path(lines,c.core,2.5)}</g>`;}
function header(w,c,color,animated=false,phase=.62){const g=consoleGeometry(w,68);return polygon(g.plate,c.glass)+path(g.outline,c.edge)+path(g.contacts,color,1,.5)+`<g>${animated?'<animate attributeName="opacity" values=".28;.8;.28" dur="4.8s" repeatCount="indefinite"/>':''}${path(g.seams,color,5,.22)}</g>`+path(g.seams,color,1.5,.75)+path(g.cores,c.core,2)+flow(g.seams,0,w,68,c,color,animated,phase);}
function pane(x,y,w,h,i,c,animated=false){const color=i===2?c.orange:c.accent;let out=rect(x,y,w,h,'#0b121b',i===1?c.accent:c.edge)+`<g transform="translate(${x},${y})">`+rect(0,0,w,68,c.bg)+header(w,c,color,animated,(i*.29+.35)%1)+text(15,24,`t${i}`,13,color)+text(w-65,24,'↗   ···',12,c.muted)+text(15,52,i===1?'FOCUSED':i===2?'NEEDS INPUT':'WORKING',8,color);if(w>=360)out+=text(65,24,`Example ${i===2?'review':'build'} session`,11,c.text);out+='</g>';
 const lines=['› Example terminal session','  Native text and keyboard focus stay intact.','','  src / application.ts','  + Implement the next change','  + Run the relevant checks','','  $ pnpm test','  Tests passed.',''];
 for(let j=0;j<Math.min(lines.length,Math.floor((h-100)/20));j++)out+=text(x+16,y+98+j*20,lines[j],12,j===8?'#9cdb9b':j===4||j===5?'#83bfff':'#9ab5c5');return out;}
function workspace(w,h,light,uneven=false,animated=false){const c=gridPalette(!light),side=w<900?0:248,margin=10,bodyX=side+margin,bodyY=120,bodyW=w-bodyX-margin,bodyH=h-bodyY-46,cols=w>2300?4:w>1100?2:1,gap=16,pw=(bodyW-gap*(cols-1))/cols,split=uneven?.43:.5;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">`+rect(0,0,w,h,c.bg)+text(92,31,'TRON ▾',16,c.accent)+text(190,31,'G R I D   C O M M A N D',10,c.muted)+text(w-225,31,'Destinations    ≡    Settings',12,c.text)+path([[[0,50],[w,50]]],c.line)+text(bodyX+12,83,'01 / Example workspace',12,c.accent)+text(w-77,83,'+ Route',12,c.text)+path([[[bodyX,105],[w-10,105]]],c.accent,5,.13)+path([[[bodyX,105],[w-10,105]]],c.accent,1,.7)+flow([[[bodyX,105],[w-10,105]]],bodyX,w-10-bodyX,200,c,c.accent,animated,.4,{speed:340,maxSteps:640,window:64});
 if(side){const d=discCradle(184);svg+=rect(0,50,side,h-86,c.panel)+text(14,78,'IDENTITY / t1',10,c.accent)+`<g transform="translate(32,88)">`+path(d.rings,c.accent,1,.45)+path(d.ticks,c.line)+path(d.supports,c.accent,1,.5)+path(d.light,c.accent,5,.3)+path(d.light,c.core,2)+mesh(184,c.accent)+text(83,98,'t1',18,c.core)+'</g>'+text(14,296,'Example build session',12,c.text)+text(14,314,'WORKING',9,c.accent)+path([[[14,330],[234,330]]],c.line)+text(14,358,'SECTORS',10,c.accent)+text(14,390,'▾ Example parent workspace',12,c.text)+text(34,414,'· Example child workspace',12,c.text)+path([[[14,438],[234,438]]],c.line)+text(14,466,'PROGRAMS',10,c.accent);
 for(let i=0;i<Math.min(6,Math.floor((h-568)/55));i++)svg+=rect(14,480+i*55,220,48,i===0?c.raised:c.panel)+rect(14,480+i*55,i===0?2:1,48,i===0?c.accent:c.line)+text(23,499+i*55,`t${i+1}`,10,i===1?c.orange:c.accent)+text(57,499+i*55,'Example session',12,c.text)+text(57,517+i*55,i===1?'NEEDS INPUT':'WORKING',9,i===1?c.orange:c.muted);
 svg+=text(14,h-78,'Disc archive ↗',12,c.text)+text(14,h-53,'THE GRID / Program directory',9,c.muted);}
 for(let col=0;col<cols;col++){const first=(bodyH-gap)*(uneven&&col%2?1-split:split);svg+=pane(bodyX+col*(pw+gap),bodyY,pw,first,col+1,c,animated)+pane(bodyX+col*(pw+gap),bodyY+first+gap,pw,bodyH-first-gap,col+cols+1,c,animated);}
 svg+=path([[[0,h-36],[w,h-36]]],c.line)+text(14,h-13,side?'Original illustration · example labels · native header geometry / ambient energy':'Original illustration · sidebar manually collapsed · example labels',10,c.muted)+text(w-345,h-13,'LINK UP      Energy flowing',11,c.text)+'</svg>';return svg;}
for(const light of [false,true]){
 const c=gridPalette(!light),mode=light?'light':'dark';const svg=workspace(1600,1040,light,true);writeFileSync(`previews/${mode}.svg`,svg);if(!light)writeFileSync('layouts/tron.svg',svg);
 let arm=`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="600">`+rect(0,0,1100,600,c.bg)+text(42,58,'Identity-disc archive',28,c.text)+text(42,91,'Native projected 3D · original illustration',14,c.muted)+`<g transform="translate(90,140)">`+mesh(360,c.accent,.85)+'</g>';
 arm+=rect(574,147,474,280,c.panel,c.line)+text(600,181,'BOUND PROGRAM',12,c.accent)+text(600,223,'Choose a Program from your live list',20,c.text)+text(600,262,'Actual name · address · status',16,c.muted)+text(600,324,'Focus this Program →',16,c.accent)+text(600,392,'Cosmetic circuit: cyan / orange / white',15,c.muted)+text(160,530,'Rotate     Tilt +     Tilt −     Reset view',17,c.accent)+'</svg>';writeFileSync(`previews/disc-${mode}.svg`,arm);
}
for(const [name,w,h]of [['narrow',760,850],['ultrawide',3840,1500]])writeFileSync(`previews/${name}.svg`,workspace(w,h,false,true));
writeFileSync('previews/energy.svg',workspace(1600,1040,false,true,true));
console.log('Wrote source-geometry illustrations. Moving highlights shown at an illustrative phase; not live captures.');
