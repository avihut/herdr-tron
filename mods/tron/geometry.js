// Original low-poly annular solid, transformed and Lambert-lit in 3D.
// Projection is rendered as GPUI paths; no WebGL, image frames or redraw timer.
export function discMesh(segments=24){
 const faces=[],r=[1,.66],z=[-.08,.08];
 const v=(i,j,k)=>[r[j]*Math.cos(i*2*Math.PI/segments),r[j]*Math.sin(i*2*Math.PI/segments),z[k]];
 const top=(i,r)=>[r*Math.cos(i*2*Math.PI/segments),r*Math.sin(i*2*Math.PI/segments),.08];
 const bands=[1,.95,.91,.73,.69,.66];
 for(let i=0;i<segments;i++){
  const n=i+1;
  faces.push({kind:'bottom',v:[v(i,1,0),v(n,1,0),v(n,0,0),v(i,0,0)]},{kind:'rim',v:[v(i,0,0),v(n,0,0),v(n,0,1),v(i,0,1)]},{kind:'inner',v:[v(i,1,1),v(n,1,1),v(n,1,0),v(i,1,0)]});
  for(let j=0;j<5;j++)faces.push({kind:j===1||j===3?'glow':'top',v:[top(i,bands[j]),top(n,bands[j]),top(n,bands[j+1]),top(i,bands[j+1])]});
 }
 return faces;
}
export function projectDisc(yaw=.3,pitch=.85,size=260){
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
 const rot=([x,y,z])=>{const xx=x*cy+z*sy,zz=-x*sy+z*cy;return [xx,y*cx-zz*sx,y*sx+zz*cx];};
 return discMesh().map(face=>{const v=face.v.map(rot),a=v[0],b=v[1],c=v[2],u=b.map((n,i)=>n-a[i]),w=c.map((n,i)=>n-a[i]);let normal=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...normal)||1;normal=normal.map(n=>n/len);const light=.28+.72*Math.max(0,normal[0]*-.3+normal[1]*-.4+normal[2]*.866);return {kind:face.kind,depth:v.reduce((s,p)=>s+p[2],0)/4,light,points:v.map(([x,y,z])=>{const k=3.8/(3.8-z);return [size/2+x*k*size*.34,size/2+y*k*size*.34];})};}).sort((a,b)=>a.depth-b.depth);
}
export function shade(hex,light){return '#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*light).toString(16).padStart(2,'0')).join('');}

export function faceColor(face,accent){return face.kind==='glow'?accent:shade(face.kind==='rim'?accent:face.kind==='top'?'#1b2e3b':'#15232f',face.kind==='rim'?face.light*.55:face.light);}
