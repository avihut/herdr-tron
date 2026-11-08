// Original real-time light-cycle duel against a computer Program. Pure and deterministic:
// the view owns the clock (one native timer callback per tick, only during a live round)
// and calls duelTick; everything here is testable without Herdr.
export const DUEL = { w: 36, h: 22, tickMs: 120 };
export const LEVELS = [
  { name: 'Sentry', tickMs: 140, look: 0, wander: .3 },
  { name: 'Enforcer', tickMs: 120, look: 1, wander: .1 },
  { name: 'Recognizer', tickMs: 100, look: 2, wander: 0 },
];
const DIRS = { up: [0, -1], right: [1, 0], down: [0, 1], left: [-1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const TURNS = { up: ['up', 'left', 'right'], down: ['down', 'right', 'left'], left: ['left', 'down', 'up'], right: ['right', 'up', 'down'] };
const k = (x, y) => x + ',' + y;

// Small seeded generator (mulberry32) so opponent choices replay exactly in tests.
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function newDuel(level = 0, seed = 1) {
  const L = LEVELS[((level % LEVELS.length) + LEVELS.length) % LEVELS.length], y = Math.floor(DUEL.h / 2);
  const you = { x: 4, y, dir: 'right' }, cpu = { x: DUEL.w - 5, y, dir: 'left' };
  return { level: LEVELS.indexOf(L), seed, rand: seed >>> 0, phase: 'ready', ticks: 0, queue: [],
    you, cpu, walls: { [k(you.x, you.y)]: 'you', [k(cpu.x, cpu.y)]: 'cpu' },
    trails: { you: [[you.x, you.y]], cpu: [[cpu.x, cpu.y]] }, message: 'Press Space or Start. Arrows / WASD steer. P pauses.' };
}
const blocked = (s, x, y) => x < 0 || y < 0 || x >= DUEL.w || y >= DUEL.h || s.walls[k(x, y)] !== undefined;

// Queue at most two turns so a quick double-tap between ticks is kept; a reversal into
// your own trail, or a repeat of the current heading, is ignored.
export function steer(s, dir) {
  if (!DIRS[dir] || (s.phase !== 'playing' && s.phase !== 'ready')) return s;
  const last = s.queue.length ? s.queue[s.queue.length - 1] : s.you.dir;
  if (dir === last || dir === OPPOSITE[last] || s.queue.length >= 2) return s;
  return { ...s, queue: [...s.queue, dir] };
}

// Cells reachable from (x,y) through open space, bounded so a tick stays cheap.
function room(s, x, y, extra, limit = 220) {
  if (blocked(s, x, y) || extra.has(k(x, y))) return 0;
  const seen = new Set([k(x, y), ...extra]), stack = [[x, y]]; let n = 0;
  while (stack.length && n < limit) { const [cx, cy] = stack.pop(); n++;
    for (const [dx, dy] of Object.values(DIRS)) { const nx = cx + dx, ny = cy + dy, id = k(nx, ny); if (!seen.has(id) && !blocked(s, nx, ny)) { seen.add(id); stack.push([nx, ny]); } } }
  return n;
}

// The computer Program picks among straight / left / right. A move that is fatal next tick is
// only taken when nothing else is open. Higher levels prefer the most open space and avoid the
// cell your cycle could also enter; lower levels wander. Returns [dir, nextRand].
export function cpuChoice(s, rand = s.rand) {
  const L = LEVELS[s.level], r = rng(rand), c = s.cpu, y = s.you;
  const yourNext = new Set(TURNS[y.dir].map(d => k(y.x + DIRS[d][0], y.y + DIRS[d][1])));
  const options = TURNS[c.dir].map((d, i) => { const nx = c.x + DIRS[d][0], ny = c.y + DIRS[d][1];
    const safe = !blocked(s, nx, ny), contested = yourNext.has(k(nx, ny));
    return { d, i, safe, contested, open: safe ? room(s, nx, ny, new Set([k(c.x, c.y)])) : 0 }; });
  const safe = options.filter(o => o.safe);
  if (!safe.length) return [c.dir, Math.floor(r() * 4294967296)];
  let pick;
  if (r() < L.wander) pick = safe[Math.floor(r() * safe.length)];
  else {
    const score = o => o.open - (L.look >= 1 && o.contested ? 50 : 0) - o.i * .5;
    pick = safe.reduce((a, b) => score(b) > score(a) ? b : a);
  }
  return [pick.d, Math.floor(r() * 4294967296)];
}

export function startDuel(s) { return s.phase === 'ready' || s.phase === 'paused' ? { ...s, phase: 'playing', message: 'Live round. Outlast the orange Program.' } : s; }
export function pauseDuel(s, why = 'Paused. Press Space or Resume.') { return s.phase === 'playing' ? { ...s, phase: 'paused', message: why } : s; }

// One simultaneous step for both cycles. Hitting a wall, the arena edge or any trail derezzes.
// Entering the same cell, or both crashing on the same tick, is a draw.
export function duelTick(s) {
  if (s.phase !== 'playing') return s;
  const [cpuDir, rand] = cpuChoice(s);
  const youDir = s.queue[0] ?? s.you.dir, queue = s.queue.slice(1);
  const you = { x: s.you.x + DIRS[youDir][0], y: s.you.y + DIRS[youDir][1], dir: youDir };
  const cpu = { x: s.cpu.x + DIRS[cpuDir][0], y: s.cpu.y + DIRS[cpuDir][1], dir: cpuDir };
  const youDead = blocked(s, you.x, you.y), cpuDead = blocked(s, cpu.x, cpu.y), headOn = you.x === cpu.x && you.y === cpu.y;
  const walls = { ...s.walls }, trails = { you: [...s.trails.you], cpu: [...s.trails.cpu] };
  if (!youDead) { walls[k(you.x, you.y)] = 'you'; trails.you.push([you.x, you.y]); }
  if (!cpuDead) { walls[k(cpu.x, cpu.y)] = 'cpu'; trails.cpu.push([cpu.x, cpu.y]); }
  const n = { ...s, rand, queue, you, cpu, walls, trails, ticks: s.ticks + 1 };
  if (headOn || (youDead && cpuDead)) return { ...n, phase: 'draw', message: 'Both cycles derezzed. Draw.' };
  if (youDead) return { ...n, phase: 'lost', message: 'Derezzed. The orange Program holds the Grid.' };
  if (cpuDead) return { ...n, phase: 'won', message: 'The orange Program derezzed. You hold the Grid.' };
  return n;
}

// Persistent local record; only finished rounds count, and each round is recorded once.
export function recordDuel(rec = {}, s) {
  if (!['won', 'lost', 'draw'].includes(s.phase)) return rec;
  const r = { wins: 0, losses: 0, draws: 0, streak: 0, best: 0, ...rec };
  if (s.phase === 'won') { r.wins++; r.streak++; r.best = Math.max(r.best, r.streak); }
  else { r.streak = 0; s.phase === 'lost' ? r.losses++ : r.draws++; }
  return r;
}
