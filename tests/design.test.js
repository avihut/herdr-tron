import test from 'node:test';
import assert from 'node:assert/strict';
import {consoleGeometry,energyMotion,discCradle} from '../mods/tron/design.js';

test('console outlines preserve bounds and 45-degree corners at pane widths and UI-scale equivalents',()=>{
 for(const physical of [180,280,480,960,1800,3840])for(const zoom of [.75,1,1.25,1.5,2]){
  const w=Math.floor(physical/zoom),h=68,g=consoleGeometry(w,h);
  for(const points of [g.plate,...g.outline,...g.seams,...g.cores,...g.contacts]){
   for(const [x,y]of points)assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=w&&y>=0&&y<=h,`${w}: ${x},${y}`);
   for(let i=1;i<points.length;i++){const dx=Math.abs(points[i][0]-points[i-1][0]),dy=Math.abs(points[i][1]-points[i-1][1]);assert.ok(!dx||!dy||dx===dy,`distorted corner ${dx},${dy}`);}
  }
  const motion=energyMotion(Math.min(96,Math.floor(w*.3))+24,w-22);
  if(motion){assert.ok(motion.from>=0&&motion.to+motion.width<=w-22);assert.ok(motion.period>=5000&&motion.period<=14000);}
 }
 assert.deepEqual(consoleGeometry(NaN).plate,[]);
 assert.deepEqual(consoleGeometry(20).plate,[]);
});

test('energy stays bounded and disappears on insufficient or invalid tracks',()=>{
 for(const input of [[0,20],[-1,100],[0,Infinity],[NaN,80]])assert.equal(energyMotion(...input),null);
 for(const size of [120,184,360]){const d=discCradle(size);for(const points of [...d.rings,...d.light,...d.supports,...d.ticks])for(const [x,y]of points)assert.ok(x>=0&&x<=size&&y>=0&&y<=size);}
});
