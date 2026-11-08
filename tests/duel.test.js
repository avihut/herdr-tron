import test from 'node:test';
import assert from 'node:assert/strict';
import { DUEL, LEVELS, rng, newDuel, steer, startDuel, pauseDuel, duelTick, cpuChoice, recordDuel } from '../mods/tron/duel.js';

const k = (x, y) => x + ',' + y;
// A playing state with chosen positions and no trails except the heads.
function arena(you, cpu, extraWalls = [], level = 1) {
  const s = startDuel(newDuel(level, 7));
  const walls = { [k(you.x, you.y)]: 'you', [k(cpu.x, cpu.y)]: 'cpu' };
  for (const [x, y] of extraWalls) walls[k(x, y)] = 'x';
  return { ...s, you, cpu, walls, trails: { you: [[you.x, you.y]], cpu: [[cpu.x, cpu.y]] } };
}

test('steering queues at most two turns and ignores reversals and repeats', () => {
  let s = newDuel();
  assert.equal(steer(s, 'left'), s, 'reversal into own trail ignored');
  assert.equal(steer(s, 'right'), s, 'repeat of current heading ignored');
  s = steer(s, 'up'); assert.deepEqual(s.queue, ['up']);
  assert.equal(steer(s, 'down'), s, 'reversal of the queued turn ignored');
  s = steer(steer(s, 'left'), 'down'); assert.deepEqual(s.queue, ['up', 'left'], 'capped at two');
  assert.equal(steer(s, 'sideways'), s);
});

test('ticks only advance a live round; pause and resume', () => {
  const s = newDuel();
  assert.equal(duelTick(s), s, 'ready rounds do not move');
  const live = startDuel(s), paused = pauseDuel(live);
  assert.equal(paused.phase, 'paused'); assert.equal(duelTick(paused), paused);
  assert.equal(startDuel(paused).phase, 'playing');
});

test('both cycles move on the same tick and leave solid trails', () => {
  const s = startDuel(newDuel(1, 3)), n = duelTick(s);
  assert.equal(n.ticks, 1);
  assert.deepEqual([n.you.x, n.you.y], [s.you.x + 1, s.you.y]);
  assert.equal(Math.abs(n.cpu.x - s.cpu.x) + Math.abs(n.cpu.y - s.cpu.y), 1);
  assert.equal(n.walls[k(s.you.x, s.you.y)], 'you'); assert.equal(n.trails.you.length, 2);
});

test('head-on into the same cell, or both crashing together, is a draw', () => {
  // Facing each other with one empty cell between: both must enter it.
  const s = arena({ x: 10, y: 5, dir: 'right' }, { x: 12, y: 5, dir: 'left' }, [[11, 4], [11, 6], [12, 4], [12, 6]]);
  assert.equal(duelTick(s).phase, 'draw');
  // Adjacent and facing: they swap through each other's heads; both derez.
  const t = arena({ x: 10, y: 5, dir: 'right' }, { x: 11, y: 5, dir: 'left' }, [[11, 4], [11, 6]]);
  assert.equal(duelTick(t).phase, 'draw');
});

test('the arena edge and trails derez, and the survivor wins', () => {
  const lose = arena({ x: DUEL.w - 1, y: 3, dir: 'right' }, { x: 2, y: 15, dir: 'right' });
  assert.equal(duelTick(lose).phase, 'lost');
  const win = arena({ x: 2, y: 3, dir: 'right' }, { x: DUEL.w - 1, y: 15, dir: 'right' }, [[DUEL.w - 1, 14], [DUEL.w - 1, 16]]);
  assert.equal(duelTick(win).phase, 'won');
});

test('the computer never takes a fatal move while a safe one exists', () => {
  for (let seed = 1; seed <= 400; seed++) {
    const r = rng(seed), level = seed % LEVELS.length;
    const walls = []; for (let i = 0; i < 120; i++) walls.push([Math.floor(r() * DUEL.w), Math.floor(r() * DUEL.h)]);
    const cpu = { x: 1 + Math.floor(r() * (DUEL.w - 2)), y: 1 + Math.floor(r() * (DUEL.h - 2)), dir: ['up', 'down', 'left', 'right'][seed % 4] };
    const you = { x: (cpu.x + 9) % DUEL.w, y: (cpu.y + 5) % DUEL.h, dir: 'up' };
    const s = arena(you, cpu, walls.filter(([x, y]) => !(x === cpu.x && y === cpu.y) && !(x === you.x && y === you.y)), level);
    const D = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] }, open = d => { const x = cpu.x + D[d][0], y = cpu.y + D[d][1]; return x >= 0 && y >= 0 && x < DUEL.w && y < DUEL.h && s.walls[k(x, y)] === undefined; };
    const [d] = cpuChoice(s, seed), anySafe = ['up', 'down', 'left', 'right'].filter(x => x !== { up: 'down', down: 'up', left: 'right', right: 'left' }[cpu.dir]).some(open);
    if (anySafe) assert.ok(open(d), `seed ${seed}: chose fatal ${d}`);
  }
});

test('every round ends within the arena size and replays exactly from its seed', () => {
  for (const level of [0, 1, 2]) for (let seed = 1; seed <= 25; seed++) {
    const play = () => { let s = startDuel(newDuel(level, seed)); const turns = ['up', 'right', 'down', 'right'];
      for (let i = 0; i < DUEL.w * DUEL.h && s.phase === 'playing'; i++) { if (i % 7 === 0) s = steer(s, turns[(i / 7) % 4]); s = duelTick(s); } return s; };
    const a = play(), b = play();
    assert.ok(['won', 'lost', 'draw'].includes(a.phase), `level ${level} seed ${seed} never ended`);
    assert.equal(a.ticks, b.ticks); assert.equal(a.phase, b.phase);
  }
});

test('the local record counts each finished round and tracks the best streak', () => {
  const won = { phase: 'won' }, lost = { phase: 'lost' }, draw = { phase: 'draw' };
  assert.deepEqual(recordDuel({}, { phase: 'playing' }), {});
  let r = recordDuel(recordDuel(recordDuel({}, won), won), lost);
  assert.deepEqual(r, { wins: 2, losses: 1, draws: 0, streak: 0, best: 2 });
  r = recordDuel(recordDuel(r, draw), won);
  assert.deepEqual(r, { wins: 3, losses: 1, draws: 1, streak: 1, best: 2 });
});
