import test from 'node:test';import assert from 'node:assert/strict';
import {parseNetwork,parseBattery,layoutChoices,panelShown,panelCommands} from '../mods/tron/system.js';
import {projectDisc,discMesh} from '../mods/tron/geometry.js';
const r=stdout=>({code:0,stdout});
test('network reports interface availability with unknown failures',()=>{assert.deepEqual(parseNetwork(r('Network interfaces: en0 utun4\n')),{state:'available',interfaces:['en0','utun4']});assert.equal(parseNetwork(r('No network information')) .state,'offline');assert.equal(parseNetwork(r('Network interfaces: \n')).state,'offline');assert.equal(parseNetwork({code:1,stdout:'Network interfaces: en0'}).state,'unknown');assert.equal(parseNetwork(r('unexpected')).state,'unknown');});
test('hardware-aware battery states and failures never retain stale percentage',()=>{for(const [text,state]of [['discharging','discharging'],['charging','charging'],['charged','ac'],['AC attached; not charging','unknown'],['not charging','ac']])assert.equal(parseBattery(r(`-InternalBattery-0 74%; ${text}; 3:00 remaining`)).state,state);assert.equal(parseBattery(r("Now drawing from 'AC Power'\n")).present,false);assert.equal(parseBattery(null,true).present,true);assert.equal(parseBattery(null,true).percent,null);assert.equal(parseBattery(null,null).present,null);assert.equal(parseBattery(r('garbage')).present,null);assert.equal(parseBattery(r('999%; charged')).percent,null);});
test('picker deduplicates and titles replacements, retaining current marker',()=>{const x=layoutChoices(['main','my-herdr','win98','win98-dark','tron','tron'],'tron');assert.equal(x.length,3);assert.equal(x[1].title,'Windows 98');assert.equal(x[2].current,true);});
test('bounded lit 3D geometry reacts to both rotations and sorts depth',()=>{assert.equal(discMesh().length,192);const a=projectDisc(0,.5),b=projectDisc(1,.5),c=projectDisc(0,1);assert.notDeepEqual(a,b);assert.notDeepEqual(a,c);for(let i=0;i<a.length;i++){assert.ok(a[i].light>=.28&&a[i].light<=1.001);assert.ok(a[i].points.flat().every(Number.isFinite));if(i)assert.ok(a[i].depth>=a[i-1].depth);}});

test('Files/Changes panel toggles: show, switch, hide, and no-op without a panel', () => {
  const tree = (hidden, active) => ({ id: 'root', type: 'column', children: [{ id: 'tron-body', type: 'row', children: [{ id: 'tron-work', type: 'column', children: [] },
    { id: 'panel', type: 'column', hidden, children: [{ id: 'panel-head', type: 'block' }, { id: 'panel-body', type: 'stack', active, children: [{ id: 'files' }, { id: 'changes' }] }] }] }] });
  assert.equal(panelShown(tree(true, 'files')), null);
  assert.equal(panelShown(tree(false, 'changes')), 'changes');
  assert.deepEqual(panelCommands(tree(true, 'files'), 'files'), [['layout.select', { stack: 'panel-body', child: 'files' }], ['layout.show', { id: 'panel' }]]);
  assert.deepEqual(panelCommands(tree(false, 'files'), 'changes'), [['layout.select', { stack: 'panel-body', child: 'changes' }], ['layout.show', { id: 'panel' }]]);
  assert.deepEqual(panelCommands(tree(false, 'changes'), 'changes'), [['layout.hide', { id: 'panel' }]]);
  assert.deepEqual(panelCommands({ id: 'root', children: [] }, 'files'), []);
  assert.deepEqual(panelCommands(tree(true, 'files'), 'terminal'), []);
  assert.equal(panelShown(null), null);
});
