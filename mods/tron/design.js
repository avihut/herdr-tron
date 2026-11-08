// Original geometry informed by Legacy's architectural light seams and glass
// consoles. All coordinates are logical pixels; no independent-axis scaling.
export function gridPalette(dark=true,classic=false){return dark?{
 bg:'#04090d',panel:'#0a151c',raised:'#142a35',line:'#264550',text:'#e6f5f7',muted:'#93adb8',
 accent:classic?'#c5a9ff':'#65ddf5',core:'#e1fcff',orange:'#ffad57',green:'#a1e4c2',glass:'#0e202b',edge:'#193b48',
}:{bg:'#dce8eb',panel:'#f3f7f7',raised:'#ccdde2',line:'#91aab4',text:'#122c38',muted:'#47616d',
 accent:classic?'#643ca5':'#006a80',core:'#005267',orange:'#974600',green:'#236647',glass:'#e7f0f2',edge:'#91b4c0'};}

export function consoleGeometry(width,height=54){
 const w=Math.max(0,Math.floor(Number(width)||0)),h=Math.max(0,Math.floor(Number(height)||0));
 if(w<40||h<32)return {plate:[],outline:[],seams:[],cores:[],contacts:[]};
 const b=8,y=h-6,shoulder=Math.min(96,Math.floor(w*.3));
 const plate=[[0,0],[w,0],[w,h-14],[w-12,h-2],[shoulder+12,h-2],[shoulder,h-14],[12,h-14],[0,h-26]];
 const outline=[[[0,1],[w,1]],[[0,h-26],[12,h-14],[shoulder,h-14],[shoulder+12,h-2],[w-12,h-2],[w,h-14]]];
 // A feed entering from each native pane border. The left feed turns into the
 // address housing; the right one is an uninterrupted architectural light seam.
 const seams=[[[1,h],[1,y-b],[b+1,y],[shoulder-8,y],[shoulder,y-b]],[[shoulder+20,y],[w-14,y],[w-2,y-12],[w-2,8]]];
 const cores=[[[14,y],[Math.max(14,shoulder-12),y]],[[Math.max(shoulder+22,w-132),y],[w-20,y]]];
 const contacts=w>=340?[[[shoulder+28,h-13],[shoulder+64,h-13]],[[w-90,7],[w-25,7]]]:[];
 return {plate,outline,seams,cores,contacts};
}

export function arc(cx,cy,r,start,end,steps=32){return Array.from({length:steps+1},(_,i)=>{const a=start+(end-start)*i/steps;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r];});}

// Monospace advance per em for the invisible sizer digits (JetBrains Mono ships with Herdr).
export const ADVANCE=.6;
// One-direction energy along a path of logical width `width`. A window `win` px wide sweeps
// left to right from fully off the left edge to fully off the right edge, one `step` per
// native frame, then holds off-screen for `pauseMs` before re-entering on the left.
// `counts[i]` is how many sizer digits the left cover holds on frame i; its width is
// counts[i] * step. Native frames share one clock, so `phase` (0..1) rotates the list to
// stagger panes deterministically. Native loops can only swing there and back, so frames
// are the only native primitive that moves strictly forward.
export function energyFlow(width,{speed=170,maxSteps=320,window=44,pauseMs=1600,phase=0}={}){
 const w=Math.floor(Number(width)||0);
 if(!(w>=48)||!Number.isFinite(w))return null;
 const win=Math.min(window,Math.max(16,Math.floor(w/4))),pad=win;
 // 8% overshoot absorbs font advance rounding, so the window always clears the right edge.
 const travel=(w+pad)*1.08;
 const step=Math.max(3,travel/maxSteps),size=step/ADVANCE;
 const ms=Math.max(16,Math.round(step/speed*1000));
 const steps=Math.ceil(travel/step),hold=Math.max(0,Math.round(pauseMs/ms));
 const counts=[...Array(steps+1).keys(),...Array(hold).fill(steps)];
 const p=Number.isFinite(phase)?((phase%1)+1)%1:0,shift=Math.floor(p*counts.length);
 return {win,pad,step,size,ms,steps,counts:counts.slice(shift).concat(counts.slice(0,shift)),cycle:counts.length*ms};
}

export function discCradle(size=184){
 const s=Math.max(40,Math.floor(size)),c=s/2,r=s*.43;
 return {rings:[arc(c,c,r,-2.9,-.25),arc(c,c,r,.25,2.9)],
  light:[arc(c,c,r,-2.5,-1.8,12),arc(c,c,r,.65,1.35,12)],
  supports:[[[0,c+19],[Math.max(0,c-r-12),c+19],[c-r,c+7]],[[s,c-19],[Math.min(s,c+r+12),c-19],[c+r,c-7]]],
  ticks:Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return [[c+Math.cos(a)*(r+4),c+Math.sin(a)*(r+4)],[c+Math.cos(a)*(r+7),c+Math.sin(a)*(r+7)]];})};
}

// A single vanishing point, reserved for room floors rather than terminal text.
export function roomFloor(width,height){
 const w=Math.max(0,width),h=Math.max(0,height),cx=w/2,horizon=h*.3;
 return [...Array.from({length:9},(_,i)=>[[cx+(i-4)*12,horizon],[cx+(i-4)*w/6,h]]),
 ...[.42,.5,.62,.8,1].map(t=>[[0,h*t],[w,h*t]])];
}
