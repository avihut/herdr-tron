import test from 'node:test';
import assert from 'node:assert/strict';
import {consoleGeometry,energyFlow,discCradle} from '../mods/tron/design.js';

test('console outlines preserve bounds and 45-degree corners at pane widths and UI-scale equivalents',()=>{
 for(const physical of [180,280,480,960,1800,3840])for(const zoom of [.75,1,1.25,1.5,2]){
  const w=Math.floor(physical/zoom),h=68,g=consoleGeometry(w,h);
  for(const points of [g.plate,...g.outline,...g.seams,...g.cores,...g.contacts]){
   for(const [x,y]of points)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=w&&y>=0&&y<=h,`${w}: ${x},${y}`);
   for(let i=1;i<points.length;i++){const dx=Math.abs(points[i][0]-points[i-1][0]),dy=Math.abs(points[i][1]-points[i-1][1]);assert.ok(!dx||!dy||dx===dy,`distorted corner ${dx},${dy}`);}
  }
 }
 assert.deepEqual(consoleGeometry(NaN).plate,[]);
 assert.deepEqual(consoleGeometry(20).plate,[]);
});

test('energy flows one way only: forward steps, an off-screen hold and one wrap per cycle',()=>{
 for(const input of [20,-1,Infinity,NaN,undefined])assert.equal(energyFlow(input),null);
 for(const physical of [180,280,480,960,1800,3840])for(const zoom of [.75,1,1.25,1.5,2,3])for(const phase of [0,.37,.999]){
  const w=Math.floor(physical/zoom),f=energyFlow(w,{phase});if(!f)continue;
  assert.ok(f.ms>=16&&f.step>=3&&f.counts.length<=320+1+Math.round(1600/16),`bounded ${w}`);
  // Window in path coordinates on a frame with n sizer digits: [n*step-pad, n*step-pad+win].
  assert.ok(0*f.step-f.pad+f.win<=0,'starts fully off the left edge');
  assert.ok(f.steps*f.step-f.pad>=w,'ends fully off the right edge');
  let wraps=0;for(let i=0;i<f.counts.length;i++){const a=f.counts[i],b=f.counts[(i+1)%f.counts.length],d=b-a;
   if(d===-f.steps)wraps++;else assert.ok(d===0||d===1,`frame ${i}: ${a}->${b} moves backwards`);}
  assert.equal(wraps,1);
 }
 const bus=energyFlow(3840,{speed:340,maxSteps:640,window:64});assert.ok(bus.counts.length<=641+Math.round(1600/16)&&bus.ms>=16);
 for(const size of [120,184,360]){const d=discCradle(size);for(const points of [...d.rings,...d.light,...d.supports,...d.ticks])for(const [x,y]of points)assert.ok(x>=0&&x<=size&&y>=0&&y<=size);}
});
