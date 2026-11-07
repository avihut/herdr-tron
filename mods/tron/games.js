// Original deterministic turn-based games. No runtime or host dependencies.
export const DIRS = { up:[0,-1], right:[1,0], down:[0,1], left:[-1,0] };
export const CYCLE_LEVELS = [
  {name:'Circuit 01',w:9,h:7,start:[0,3],gates:[[2,1],[6,1],[6,5]],exit:[8,5],walls:[[3,3],[4,3],[5,3],[3,4]],budget:28},
  {name:'Circuit 02',w:9,h:7,start:[0,0],gates:[[1,5],[5,5],[7,1]],exit:[8,0],walls:[[3,0],[3,1],[3,2],[3,3],[6,3]],budget:30},
  {name:'Circuit 03',w:9,h:7,start:[4,6],gates:[[1,5],[1,1],[7,1]],exit:[8,6],walls:[[3,3],[4,3],[5,3],[5,4],[5,5]],budget:30},
];
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
export const key=p=>p.join(',');
export function newCycle(level=0){const l=CYCLE_LEVELS[level%CYCLE_LEVELS.length];return {level:level%CYCLE_LEVELS.length,pos:[...l.start],trail:[key(l.start)],gate:0,moves:0,phase:'playing',message:'Pass gates 1 → 2 → 3, then E. Your trail is solid.'};}
export function cycleMove(s,direction){
  if(s.phase!=='playing'||!DIRS[direction])return s;
  const l=CYCLE_LEVELS[s.level],d=DIRS[direction],p=[s.pos[0]+d[0],s.pos[1]+d[1]];
  const n={...s,moves:s.moves+1};
  if(p[0]<0||p[1]<0||p[0]>=l.w||p[1]>=l.h||l.walls.some(w=>eq(w,p))||s.trail.includes(key(p)))return {...n,phase:'lost',message:'Derezzed: wall or light trail. Restart to try a new route.'};
  n.pos=p;n.trail=[...s.trail,key(p)];
  if(l.gates[s.gate]&&eq(l.gates[s.gate],p))n.gate++;
  if(eq(l.exit,p))return {...n,phase:n.gate===l.gates.length?'won':'lost',message:n.gate===l.gates.length?'Route complete. Circuit badge earned.':'Portal locked: visit all three gates in order.'};
  if(n.moves>=l.budget)return {...n,phase:'lost',message:'Turn budget exhausted. Restart to try again.'};
  return {...n,message:`Gate ${n.gate}/3 · ${l.budget-n.moves} turns remaining`};
}
export const DISC_LEVELS=[
  {name:'Reflection 01',w:7,h:7,start:[0,3],direction:'right',target:[6,1],mirrors:[[2,3],[2,1]],walls:[[5,3]],initial:['\\','/']},
  {name:'Reflection 02',w:7,h:7,start:[0,5],direction:'right',target:[6,1],mirrors:[[2,5],[2,2],[4,2],[4,1]],walls:[[5,5]],initial:['\\','/','/','\\']},
  {name:'Reflection 03',w:7,h:7,start:[0,1],direction:'right',target:[6,5],mirrors:[[1,1],[1,4],[4,4],[4,5]],walls:[[5,1]],initial:['/','\\','\\','/']},
];
export function newDisc(level=0){const i=level%DISC_LEVELS.length;return {level:i,mirrors:[...DISC_LEVELS[i].initial],attempts:0,rotations:0,path:[],phase:'playing',message:'Click mirrors to rotate. Hit the target in at most six launches.'};}
export function rotateMirror(s,i){if(s.phase!=='playing'||!Number.isInteger(i)||i<0||i>=s.mirrors.length)return s;return {...s,mirrors:s.mirrors.map((m,j)=>j===i?(m==='/'?'\\':'/'):m),rotations:s.rotations+1,path:[],message:'Mirror rotated. Launch when ready.'};}
export function traceDisc(level,mirrors){
 const l=DISC_LEVELS[level];let p=[...l.start],d=[...DIRS[l.direction]],path=[p],seen=new Set();
 for(let step=0;step<l.w*l.h*4;step++){
  p=[p[0]+d[0],p[1]+d[1]];
  if(p[0]<0||p[1]<0||p[0]>=l.w||p[1]>=l.h)return {won:false,path,reason:'Disc left the arena.'};
  path.push(p);if(l.walls.some(w=>eq(w,p)))return {won:false,path,reason:'Disc struck a barrier.'};
  if(eq(p,l.target))return {won:true,path,reason:'Target hit. Reflection badge earned.'};
  const i=l.mirrors.findIndex(m=>eq(m,p));if(i>=0)d=mirrors[i]==='/'?[-d[1],-d[0]]:[d[1],d[0]];
  const k=key(p)+':'+key(d);if(seen.has(k))return {won:false,path,reason:'Closed reflection loop.'};seen.add(k);
 }
 return {won:false,path,reason:'Reflection limit reached.'};
}
export function launchDisc(s){if(s.phase!=='playing')return s;const t=traceDisc(s.level,s.mirrors),attempts=s.attempts+1;return {...s,attempts,path:t.path,phase:t.won?'won':attempts>=6?'lost':'playing',message:t.reason+(t.won?'':attempts>=6?' Six launches used: restart.':` ${6-attempts} launches left.`)};}
export function recordBest(records,game,state){if(state.phase!=='won')return records;const id=`${game}:${state.level}`,score=game==='cycle'?state.moves:state.attempts,old=records[id];return {...records,[id]:old===undefined?score:Math.min(old,score)};}
