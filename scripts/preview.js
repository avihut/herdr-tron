// Original illustrative SVGs, deliberately never reading a live session.
import {writeFileSync,mkdirSync} from 'node:fs';
import {projectDisc,faceColor} from '../mods/tron/geometry.js';
import {BUS,NODES,GRID} from '../mods/tron/circuitry.js';
mkdirSync('previews',{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const light of [false,true]){
const c=light?{bg:'#e7f0f4',panel:'#f5f9fb',line:'#a3bdca',muted:'#466171',fg:'#102b3a',accent:'#006b80',orange:'#995000'}:{bg:'#080f16',panel:'#101c27',line:'#2b4352',muted:'#9ab5c5',fg:'#e7f6fc',accent:'#7de7fa',orange:'#ffb66d'};
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><rect width="1440" height="900" rx="20" fill="${c.bg}"/>`;
const text=(x,y,s,size=16,color=c.fg)=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}">${esc(s)}</text>`;
const rect=(x,y,w,h,fill=c.panel,r=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const circuitry=(x,y,w,h,grid=false)=>{const lines=grid?GRID:BUS;const d=lines.map(ps=>ps.map(([a,b],i)=>`${i?'L':'M'}${x+a*w/100} ${y+b*h/100}`).join('')).join('');return [[9,.06],[4,.19],[1.3,grid?.4:.75]].map(([sw,o])=>`<path d="${d}" fill="none" stroke="${c.accent}" stroke-width="${sw}" opacity="${o}"/>`).join('')+(grid?'':NODES.map(([a,b])=>`<rect x="${x+a*w/100}" y="${y+b*h/100}" width="4" height="4" fill="${c.accent}"/>`).join(''));};
const disc=(x,y,col=c.accent)=>`<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="${col}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="11" fill="none" stroke="${col}"/>`;
svg+=text(42,57,'TRON',28,c.accent)+text(164,55,'THE GRID',13,c.muted)+text(1060,55,'Command    Destinations ↗',15,c.muted);
svg+=circuitry(0,70,1440,24)+circuitry(32,261,250,24)+circuitry(32,665,250,58,true)+circuitry(0,820,1440,20)+`<path d="M295 104V310L304 330V540L295 560V806" fill="none" stroke="${c.accent}" stroke-width="2"/>`;
svg+=text(42,130,'01 / SECTORS',12,c.muted)+rect(32,150,250,48)+text(48,181,'Interface research',16,c.accent)+text(48,230,'Tools & experiments',16,c.muted)+text(42,307,'02 / PROGRAMS',12,c.muted);
svg+=disc(61,359)+text(98,354,'Design program',16)+text(98,377,'t1 · WORKING',11,c.muted)+disc(61,435,c.orange)+text(98,430,'Review program',16)+text(98,453,'t2 · NEEDS INPUT',11,c.orange)+disc(61,511)+text(98,506,'Build program',16)+text(98,529,'t3 · IDLE',11,c.muted);
svg+=rect(32,743,250,48)+text(48,774,'Identity-disc archive ↗',16,c.accent);
svg+=rect(322,104,300,46)+text(340,134,'01 / Geometry studies',16,c.accent)+text(649,134,'02 / Tests',16,c.muted)+rect(322,169,1086,640,'#0b121b');
svg+=rect(322,169,1086,54,c.panel,0)+rect(32,150,3,48,c.accent,0)+rect(322,147,300,3,c.accent,0);
svg+=`<path d="M322 169H1408V809H322Z" fill="none" stroke="${c.accent}" stroke-width="2"/>`+circuitry(1130,180,250,26);
svg+=text(344,205,'t1 / Design program',12,c.muted)+`<path d="M324 223H1406" stroke="${c.accent}" stroke-width="2"/>`;
svg+=text(362,282,'Your terminal. Your work.',28,'#e0edf4')+text(362,321,'Neon circuits frame the work.',17,'#9ab5c5')+text(362,383,'› Example terminal area',16,'#7de7fa')+text(362,417,'  Luminous traces • native motion • real agent status',16,'#9ab5c5');
svg+=text(42,865,'Original illustrated preview · example labels · no session data',12,c.muted)+text(1110,865,'LINK ?    Motion on',12,c.muted)+`</svg>`;
writeFileSync(`previews/${light?'light':'dark'}.svg`,svg);
if(!light)writeFileSync('layouts/tron.svg',svg);
let arm=`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="600"><rect width="1100" height="600" rx="16" fill="${c.bg}"/>`+text(42,58,'Identity-disc archive',28)+text(42,91,'Interactive perspective projection · native GPUI paths',14,c.muted);
arm+=circuitry(0,105,1100,24)+circuitry(90,120,380,380,true)+circuitry(574,445,474,30);
arm+=`<g transform="translate(90,120)">`+projectDisc(.3,.85,380).map(f=>`<polygon points="${f.points.map(p=>p.join(',')).join(' ')}" fill="${faceColor(f,light?'#006b80':'#7de7fa')}"/>`).join('')+'</g>';
arm+=rect(574,147,474,280)+text(600,181,'BOUND PROGRAM',12,c.muted)+text(600,223,'Choose a Program from your live list',20)+text(600,262,'Actual name · address · status',16,c.muted)+text(600,324,'Focus this Program →',16,c.accent)+text(600,392,'Cosmetic circuit: cyan / orange / white',15,c.muted)+text(160,530,'↶    ↷     Tilt +     Tilt −     Reset view',17,c.accent)+text(42,578,'Original illustration generated from the same 3D mesh as the mod.',12,c.muted)+'</svg>';
writeFileSync(`previews/disc-${light?'light':'dark'}.svg`,arm);
}
console.log('Wrote original dark/light workspace and disc-archive illustrations.');
