import type { ClawdState, SessionStatus } from './types'

export const STALE_MS = 60_000

const BODY = ' ▐▛███▜▌ '
const BODY_BLINK = ' ▐█████▌ '
const LOOK_L = ' ▐▛██▜█▌ '
const LOOK_R = ' ▐█▛██▜▌ '
const HAPPY = ' ▐▀███▀▌ '
const SAD = ' ▐▄███▄▌ '
const ARMS = '▝▜█████▛▘'
const ARMS_UP = '▗▟█████▙▖'
const WAVE_L = '▗▟█████▛▘'
const WAVE_R = '▝▜█████▙▖'
const LEGS = '  ▘▘ ▝▝  '
const LEGS_STEP = '  ▝▘ ▘▝  '
const LEGS_TAP = '  ▘▘ ▝▖  '
const BLANK = '         '
const DIZZY = ' ▐▚███▞▌ '

// Turning views for the spin: front, three-quarter, profile, back and round the other side.
// The figure narrows as it turns away so the turn reads as depth.
const TURN: { body: string; arms: string; legs: string }[] = [
  { body: BODY, arms: ARMS, legs: LEGS },
  { body: '  ▐██▛▜▌ ', arms: ' ▝▜████▛▘', legs: '   ▘▘▝▝  ' },
  { body: '   ▐█▜▌  ', arms: '   ▜██▛▘ ', legs: '    ▘▝   ' },
  { body: '  ▐████▌ ', arms: ' ▝▜████▛ ', legs: '   ▘▘▝▝  ' },
  { body: BODY_BLINK, arms: ARMS, legs: LEGS },
  { body: ' ▐████▌  ', arms: ' ▜████▛▘ ', legs: '  ▘▘▝▝   ' },
  { body: '  ▐▛█▌   ', arms: ' ▝▜██▛   ', legs: '   ▘▝    ' },
  { body: ' ▐▛▜██▌  ', arms: '▝▜████▛▘ ', legs: '  ▘▘▝▝   ' },
]
// A row turned upside down, for when Clawd is on its head.
const FLIP: Record<string, string> = { '▛': '▙', '▙': '▛', '▜': '▟', '▟': '▜', '▘': '▖', '▖': '▘', '▝': '▗', '▗': '▝', '▀': '▄', '▄': '▀' }
export const vflip = (row: string) => [...row].map(ch => FLIP[ch] ?? ch).join('')

// Clawd turned in the plane of the screen, a quarter at a time, for cartwheels.
// Each is four rows drawn where the mark and the body usually go; the hat floats above.
const ROLL = {
  cw: ['   ▄█▄▄  ', '  ▀██▙█  ', '  ▄██▛█  ', '   ▀█▀▀  '],
  down: [vflip(LEGS), vflip(ARMS), vflip(BODY), BLANK],
  ccw: ['  ▄▄█▄   ', '  █▟██▀  ', '  █▜██▄  ', '  ▀▀█▀   '],
}

// Clawd further off, for walking in from the back of the screen and away again.
const FAR = [BLANK, BLANK, '   ▟█▙   ', '   ▘ ▝   ']
const NEAR = [BLANK, '  ▐▛█▜▌  ', '  ▜███▛  ', '   ▘ ▝   ']
const NEAR_BACK = [BLANK, '  ▐███▌  ', '  ▜███▛  ', '   ▘ ▝   ']
// Flattened on the floor.
const SPLAT = [BLANK, BLANK, ' ▗▄▄▄▄▄▖ ', '▟▙▄███▄▟▙']
// The glitter left where Clawd vanishes or appears.
const SPARKLE = [' ✦     ✧ ', '   ✧ ✦   ', ' ✧   ✦   ', '   ✦  ✧  ']

export const COLORS: Record<ClawdState, string> = {
  idle: 'gray',
  thinking: '#D97757',
  tool: '#D97757',
  waiting: 'yellow',
  done: 'green',
  error: 'red',
  ended: 'gray',
}

export const LABELS: Record<ClawdState, string> = {
  idle: 'idle',
  thinking: 'thinking',
  tool: 'running',
  waiting: 'needs you',
  done: 'done',
  error: 'stopped',
  ended: 'ended',
}

// alt is drawn instead of hat on odd ticks, so the costume moves.
export type Costume = { hat: string; color: string; face?: string; alt?: string }

// Each hat is one 9-column row worn directly above the body row; a face replaces the body row.
export const COSTUMES: Record<string, Costume> = {
  none: { hat: BLANK, color: 'gray' },
  party: { hat: '    ▲    ', color: 'magenta' },
  crown: { hat: '  ▙▟▙▟▙  ', color: 'yellow' },
  tiara: { hat: '   ▗▲▖   ', color: '#FF69B4' },
  tophat: { hat: '  ▗███▖  ', color: 'gray' },
  wizard: { hat: '   ▗█▖ * ', color: '#8A63D2' },
  witch: { hat: ' ▁▁▟█▙▁▁ ', color: '#9B59B6' },
  cap: { hat: '  ▄██▄▄▄ ', color: 'blue' },
  beret: { hat: '  ▄██▄▖  ', color: 'red' },
  chef: { hat: '  ▟███▙  ', color: 'white' },
  santa: { hat: '  ▗▆█▆▄○ ', color: 'red' },
  beanie: { hat: '  ▄▄●▄▄  ', color: 'cyan' },
  viking: { hat: ' ◥▄███▄◤ ', color: '#C0A060' },
  cowboy: { hat: '▄▄▟███▙▄▄', color: '#A0522D' },
  sombrero: { hat: '▂▃▄▟█▙▄▃▂', color: 'yellow' },
  straw: { hat: '▁▂▄███▄▂▁', color: '#E5C07B' },
  hardhat: { hat: '▁▟█████▙▁', color: 'yellow' },
  pirate: { hat: ' ▁▄█X█▄▁ ', color: 'white' },
  grad: { hat: ' ▀▀▀█▀▀▀╲', color: 'blue' },
  police: { hat: '  ▄█*█▄  ', color: 'blue' },
  nurse: { hat: '  ▄█+█▄  ', color: 'white' },
  fez: { hat: '   ▐█▌▖  ', color: 'red' },
  jester: { hat: ' ▜▖ ▄ ▗▛ ', color: 'red' },
  bandana: { hat: ' ▄▄▄▄▄▄▄▗', color: 'blue' },
  mohawk: { hat: '    █    ', color: 'green' },
  topknot: { hat: '    ▄▀   ', color: 'gray' },
  propeller: { hat: '  ━━┿━━  ', color: 'cyan', alt: '  ─━╋━─  ' },
  headphones: { hat: ' ╭─────╮ ', color: 'cyan' },
  laurel: { hat: ' ╲╲   ╱╱ ', color: 'green' },
  halo: { hat: '  ▬▬▬▬▬  ', color: 'yellow' },
  horns: { hat: ' ▝▖   ▗▘ ', color: 'red' },
  unicorn: { hat: '    ╱    ', color: 'magenta' },
  antenna: { hat: '   ╲ ╱   ', color: 'green' },
  alien: { hat: ' o╲   ╱o ', color: 'green' },
  sprout: { hat: '   ▗▄▘   ', color: 'green' },
  flower: { hat: '  *@*    ', color: 'magenta' },
  bow: { hat: '   ▚▄▞   ', color: '#FF69B4' },
  idea: { hat: '   (*)   ', color: 'yellow' },
  birthday: { hat: '   ╻ ╻   ', color: 'magenta' },
  music: { hat: '   ♪ ♫   ', color: 'cyan', alt: '  ♫   ♪  ' },
  catears: { hat: ' ▲     ▲ ', color: '#D97757' },
  bunny: { hat: ' ▐▌   ▐▌ ', color: 'white' },
  bear: { hat: ' ●     ● ', color: '#A0522D' },
  mouse: { hat: ' ██   ██ ', color: 'gray' },
  frog: { hat: ' ▄▄   ▄▄ ', color: 'green' },
  shades: { hat: BLANK, color: 'gray', face: ' ▐▀▀█▀▀▌ ' },
  nerd: { hat: BLANK, color: 'gray', face: ' ▐o▀█▀o▌ ' },
  monocle: { hat: '  ▗███▖  ', color: 'gray', face: ' ▐▛███O▌ ' },
  astronaut: { hat: '  ▄▄▄▄▄  ', color: 'white', face: ' ▐▓▓▓▓▓▌ ' },
  ninja: { hat: '▬▬▬▬▬▬▬▬~', color: 'red', face: ' ▐▄▀█▀▄▌ ' },
  // the silly ones
  arrow: { hat: '━━━━━━━━▶', color: 'white' },
  fish: { hat: ' ><(((°> ', color: 'cyan', alt: ' <°)))>< ' },
  toast: { hat: '  ▟▀▀▀▙  ', color: '#D2A060' },
  cake: { hat: '  ▄█▀█▄  ', color: '#FFB6C1' },
  duck: { hat: '   ▗▟▶   ', color: 'yellow' },
  pasta: { hat: '  ∫∫∫∫∫  ', color: '#F0D080', alt: '  ∫ʃ∫ʃ∫  ' },
  tinfoil: { hat: '  ◢▓▓◣   ', color: 'gray' },
  lampshade: { hat: '  ◢███◣  ', color: '#F5DEB3' },
  bucket: { hat: '  ▐███▌  ', color: 'blue' },
  cat: { hat: '  ▲▲▄▄▄~ ', color: '#D97757', alt: '  ▲▲▄▄▄∽ ' },
  bug: { hat: '  ╲(▓)╱  ', color: 'red', alt: '  ╱(▓)╲  ' },
  coffee: { hat: '  ~▐█▌▸  ', color: '#A0522D', alt: '  ≈▐█▌▸  ' },
  onfire: { hat: '  ▲▴▲▴▲  ', color: 'red', alt: '  ▴▲▴▲▴  ' },
  loading: { hat: '  ▰▰▰▱▱  ', color: 'cyan', alt: '  ▱▱▰▰▰  ' },
  confused: { hat: '   ? ?   ', color: 'yellow', alt: '    ?    ' },
  rich: { hat: '  $ $ $  ', color: 'green', alt: '   $ $   ' },
  bigbrain: { hat: '  ▟▓▓▓▙  ', color: 'magenta' },
  clown: { hat: ' ●▄▄▄▄▄● ', color: 'red', face: ' ▐▛█●█▜▌ ' },
  mustache: { hat: BLANK, color: 'gray', face: '~▐▛▀▀▀▜▌~' },
  googly: { hat: BLANK, color: 'gray', face: ' ▐O███O▌ ' },
  dizzy: { hat: '   @ @   ', color: 'yellow', face: ' ▐x███x▌ ' },
  // the new batch
  helmet: { hat: '  ▄███▄  ', color: '#9AA0A6' },
  antlers: { hat: ' ╲╱   ╲╱ ', color: '#A0522D' },
  snow: { hat: ' * . * . ', color: 'white', alt: '. * . * .' },
  rain: { hat: '  ╱ ╱ ╱  ', color: 'cyan', alt: ' ╱ ╱ ╱   ' },
  cloud: { hat: '  ▄▀▀▀▄  ', color: 'white' },
  balloon: { hat: '    ○    ', color: 'red', alt: '   ○     ' },
  turban: { hat: '  ▟█▓█▙  ', color: '#D2A060' },
  detective: { hat: ' ▄▟███▙▄ ', color: '#6B4F2A' },
  pumpkin: { hat: '  ▗▟█▙▖  ', color: '#FF8C00' },
  shark: { hat: '    ◢    ', color: 'gray', alt: '   ◢     ' },
  rocket: { hat: '   ▟▲▙   ', color: 'red', alt: '   ▟▲▙ ✦ ' },
  ribbon: { hat: '  ──▲──  ', color: 'magenta' },
  leaf: { hat: '    ❧    ', color: 'green' },
  gem: { hat: '    ◆    ', color: 'cyan', alt: '    ◇    ' },
  sushi: { hat: '  ▐▀▀▀▌  ', color: 'white' },
  robot: { hat: '    ╿    ', color: 'cyan', face: ' ▐■███■▌ ' },
  wink: { hat: BLANK, color: 'gray', face: ' ▐▬███▜▌ ' },
  sleepy: { hat: BLANK, color: 'gray', face: ' ▐▬███▬▌ ' },
  angry: { hat: BLANK, color: 'gray', face: ' ▐▟███▙▌ ' },
  eyepatch: { hat: BLANK, color: 'gray', face: ' ▐▛███■▌ ' },
  ghost: { hat: '  ▂▂▂▂▂  ', color: 'white', face: ' ▐○███○▌ ' },
}

export const COSTUME_NAMES = Object.keys(COSTUMES)

function hash(id: string): number {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h
}

// The same session always draws the same costume until it picks another.
export function costumeFor(id: string): string {
  const pool = COSTUME_NAMES.filter(n => n !== 'none')
  return pool[hash(id) % pool.length]
}

// The costume a session shows; sessions written before costumes existed fall back to their hash.
export function wearing(s: SessionStatus): string {
  return s.costume ?? costumeFor(s.id)
}

// A costume no other session wears: random when asked, otherwise the first free one from the session's hash.
// Once every costume is taken the pool opens up again.
export function pickCostume(id: string, taken: Iterable<string>, random?: () => number): string {
  const all = COSTUME_NAMES.filter(n => n !== 'none')
  const used = new Set(taken)
  const free = all.filter(n => !used.has(n))
  const pool = free.length > 0 ? free : all
  if (random !== undefined) return pool[Math.floor(random() * pool.length)]
  const start = hash(id) % all.length
  for (let i = 0; i < all.length; i++) {
    const n = all[(start + i) % all.length]
    if (pool.includes(n)) return n
  }
  return pool[0]
}

// One animation frame. stand: mark, body, arms, legs. air: legs left behind. crouch: body drops a row.
// flip: upside down, legs on top and the hat hanging below.
// dx moves the figure sideways (-1..1 sways; further walks it across, or off the left edge).
// dy moves it down (positive) or up (negative), cut off at the edges, for falling in and rising up.
// bare: the costume's face is not drawn (the back or side is showing).
// sprite: four rows drawn as they are in place of the mark and the body, with the hat floating above.
export type Pose = {
  mark?: string
  body?: string
  arms?: string
  legs?: string
  pos?: 'stand' | 'air' | 'crouch' | 'flip'
  dx?: number
  dy?: number
  bare?: boolean
  sprite?: string[]
  noHat?: boolean
}

// Furthest right the figure goes: 18-column column less its 9 columns.
const MAX_PAD = 9

// Moves the rows by dy, and cuts columns off the left or the right when dx pushes the figure past an edge.
function place(rows: string[], p: Pose): string[] {
  const dy = p.dy ?? 0
  const shift = 1 + (p.dx ?? 0)
  const cut = Math.max(0, -shift)
  const push = Math.max(0, shift - MAX_PAD)
  const moved = rows.map((_, i) => rows[i - dy] ?? BLANK)
  if (cut > 0) return moved.map(r => [...r].slice(cut).join('').padEnd(9))
  if (push > 0) return moved.map(r => [...(' '.repeat(push) + r)].slice(0, 9).join(''))
  return moved
}

// The n-th item, wrapping around; every list here is non-empty.
function nth<T>(list: T[], n: number): T {
  return list[n % list.length] as T
}

const at = (col: number, s: string) => (' '.repeat(col) + s).padEnd(9).slice(0, 9)
const mid = (s: string) => at(Math.floor((9 - [...s].length) / 2), s)

function layout(p: Pose): { rows: string[]; at: number } {
  const mark = p.mark ?? BLANK
  const body = p.body ?? BODY
  const arms = p.arms ?? ARMS
  if (p.pos === 'crouch') return { rows: [mark, BLANK, body, arms], at: 2 }
  if (p.pos === 'flip') return { rows: [mark, vflip(p.legs ?? LEGS), vflip(arms), vflip(body)], at: 4 }
  return { rows: [mark, body, arms, p.pos === 'air' ? BLANK : (p.legs ?? LEGS)], at: 1 }
}

// The turning views in order: 'right' brings the face round to the viewer's right first, 'left' the other way.
export type Turn = 'right' | 'left'
const views = (dir: Turn) => (dir === 'right' ? TURN : [TURN[0], ...TURN.slice(1).reverse()]) as typeof TURN

// In from the top, a bump on landing, a look around and away up again.
function dropIn(mark: string): Pose[] {
  return [
    { dy: -5, mark: BLANK },
    ...[-4, -3, -2, -1].map(dy => ({ dy, pos: 'air' as const, arms: ARMS_UP, mark: mid('|') })),
    { pos: 'crouch', mark: mid(mark) },
    { mark: mid(mark), arms: ARMS_UP },
    { mark: mid(mark), body: LOOK_L },
    { mark: mid(mark), body: LOOK_R },
    { pos: 'crouch', mark: BLANK },
    ...[-2, -4, -5].map(dy => ({ dy, pos: 'air' as const, arms: ARMS_UP, mark: BLANK })),
  ]
}

// Up from below, as far as `peak` rows short of standing, a look round, and back down.
function riseUp(mark: string, peak = 0): Pose[] {
  const up = [5, 4, 3, 2, 1, 0].filter(dy => dy >= peak)
  return [
    ...up.map(dy => ({ dy, mark: mid(mark) })),
    { dy: peak, mark: mid(mark), body: LOOK_L },
    { dy: peak, mark: mid(mark), body: LOOK_R },
    { dy: peak, mark: mid(mark), arms: peak === 0 ? ARMS_UP : ARMS },
    ...up.slice().reverse().map(dy => ({ dy, mark: mid(mark), body: BODY_BLINK })),
  ]
}

// Swoops in from the top right, lands, and slides out at the bottom left.
function swoop(mark: string): Pose[] {
  return [
    { dx: 9, dy: -5, mark: BLANK },
    ...[8, 6, 4, 2].map((dx, i) => ({ dx, dy: i - 4, pos: 'air' as const, arms: ARMS_UP, mark: at(7, '↙') })),
    { pos: 'crouch', mark: mid(mark) },
    { mark: mid(mark), body: HAPPY, arms: ARMS_UP },
    { mark: mid(mark), body: HAPPY },
    ...[-2, -4, -6, -8, -10].map((dx, i) => ({ dx, dy: i + 1, legs: i % 2 ? LEGS_STEP : LEGS, mark: BLANK })),
  ]
}

// Cartwheels across: clockwise to the right, then anticlockwise back to the left.
function cartwheel(mark: string): Pose[] {
  const stand = (dx: number): Pose => ({ dx, mark: mid(mark), arms: ARMS_UP })
  return [
    stand(0),
    { dx: 2, sprite: ROLL.cw },
    { dx: 4, sprite: ROLL.down },
    { dx: 6, sprite: ROLL.ccw },
    stand(8),
    stand(8),
    { dx: 6, sprite: ROLL.ccw },
    { dx: 4, sprite: ROLL.down },
    { dx: 2, sprite: ROLL.cw },
    stand(0),
  ]
}

// Runs off the right edge and comes back round from the left.
function lap(mark: string): Pose[] {
  const run = (dx: number, i: number): Pose => ({ dx, body: LOOK_R, legs: i % 2 ? LEGS_STEP : LEGS, mark: at(0, '≡') })
  return [
    { pos: 'crouch', body: LOOK_R, mark: BLANK },
    ...[2, 5, 8, 11, 14, 17].map(run),
    { dx: 17, mark: BLANK },
    ...[-9, -6, -3].map(run),
    { pos: 'crouch', mark: mid(mark) },
    { body: HAPPY, arms: ARMS_UP, mark: mid(mark) },
  ]
}

// Walks in from the back of the screen and stops up close.
function approach(mark: string): Pose[] {
  return [
    { sprite: FAR, noHat: true, dx: 3 },
    { sprite: FAR, noHat: true, dx: 2 },
    { sprite: NEAR, noHat: true, dx: 1 },
    { sprite: NEAR, noHat: true, dx: 0 },
    { legs: LEGS_STEP, mark: BLANK },
    { mark: mid(mark), arms: ARMS_UP },
    { mark: mid(mark), arms: WAVE_R },
    { mark: mid(mark), arms: ARMS_UP },
  ]
}

// Turns its back and walks off into the distance, then comes back.
function wander(): Pose[] {
  return [
    { ...TURN[4], bare: true },
    { sprite: NEAR_BACK, noHat: true, dx: 1 },
    { sprite: FAR, noHat: true, dx: 2 },
    { sprite: FAR, noHat: true, dx: 3, dy: 1 },
    { sprite: [BLANK, BLANK, BLANK, '    ▖    '], noHat: true, dx: 3 },
    { sprite: FAR, noHat: true, dx: 3 },
    { sprite: NEAR, noHat: true, dx: 2 },
    { dx: 1, legs: LEGS_STEP },
    { mark: mid('♪') },
  ]
}

// Vanishes in a sparkle and pops up further along, then back.
function teleport(mark: string): Pose[] {
  const gone = (dx: number): Pose => ({ dx, sprite: [BLANK, BLANK, BLANK, BLANK], noHat: true })
  const flash = (dx: number): Pose => ({ dx, sprite: SPARKLE, noHat: true })
  return [
    { mark: mid(mark), body: BODY_BLINK },
    flash(0),
    gone(0),
    flash(7),
    { dx: 7, mark: mid('!'), arms: WAVE_L },
    { dx: 7, mark: mid('!'), arms: ARMS_UP },
    flash(7),
    gone(7),
    flash(0),
    { mark: mid(mark), body: HAPPY },
  ]
}

// Bounces higher and higher off a trampoline, flipping on the last one.
function trampoline(mark: string): Pose[] {
  const up = (dy: number): Pose => ({ dy, pos: 'air', arms: ARMS_UP, mark: BLANK })
  return [
    { pos: 'crouch', mark: BLANK },
    up(-1),
    { pos: 'crouch', mark: BLANK },
    up(-2),
    up(-3),
    up(-2),
    { pos: 'crouch', mark: BLANK },
    up(-3),
    up(-5),
    { dy: -3, pos: 'flip', bare: true, mark: BLANK },
    { dy: -1, pos: 'air', arms: ARMS_UP, mark: BLANK },
    { pos: 'crouch', mark: mid(mark) },
    { body: HAPPY, arms: ARMS_UP, mark: mid(mark) },
  ]
}

// Faces right but glides left, then spins out and strikes a pose.
function moonwalk(): Pose[] {
  const side = TURN[2] as Pose
  return [
    { ...side, bare: true, mark: mid('♪'), dx: 3 },
    ...[2, 1, 0, -1, -2].map((dx, i): Pose => ({
      ...side,
      bare: true,
      dx,
      legs: i % 2 ? '   ▝ ▘   ' : side.legs,
      mark: at(6, i % 2 ? '♫' : '♪'),
    })),
    ...spin([BLANK], () => ({ dx: -2 })).slice(1),
    { dx: -2, arms: WAVE_R, body: HAPPY, mark: at(7, '✦') },
  ]
}

// Spins too fast and wobbles about seeing stars.
function dizzy(): Pose[] {
  const fast = views('right').filter((_, i) => i % 2 === 0)
  const spun = [...fast, ...fast].map((v): Pose => ({ ...v, bare: true, mark: mid('↻') }))
  return [
    ...spun,
    { body: DIZZY, mark: at(2, '✦  ✧'), dx: -1 },
    { body: DIZZY, mark: at(3, '✧  ✦'), dx: 1 },
    { body: DIZZY, mark: at(2, '✦  ✧'), dx: -1, legs: LEGS_STEP },
    { body: DIZZY, mark: at(3, '✧  ✦'), dx: 1 },
    { pos: 'crouch', body: DIZZY, mark: at(3, '✦ ✧') },
    { body: BODY_BLINK, mark: BLANK },
    { body: HAPPY, arms: ARMS_UP, mark: mid('✓') },
  ]
}

// Keeps three balls in the air.
function juggle(balls: string): Pose[] {
  const b = [...balls]
  return [
    { mark: at(2, `${b[0]}   ${b[1]}`), arms: WAVE_L },
    { mark: at(3, `${b[2]} ${b[0]}`), arms: ARMS_UP },
    { mark: at(2, `${b[1]}   ${b[2]}`), arms: WAVE_R },
    { mark: at(3, `${b[0]} ${b[1]}`), arms: ARMS_UP },
    { mark: at(2, `${b[2]}   ${b[0]}`), arms: WAVE_L },
    { mark: at(3, `${b[1]} ${b[2]}`), arms: ARMS_UP },
  ]
}

// A sneeze big enough to knock Clawd back.
function sneeze(): Pose[] {
  return [
    { mark: at(5, 'a'), body: LOOK_R },
    { mark: at(5, 'aa'), body: BODY_BLINK },
    { mark: at(4, 'AA..'), body: BODY_BLINK, pos: 'crouch' },
    { mark: at(2, 'CHOO!'), body: BODY_BLINK, arms: ARMS_UP, dx: -2 },
    { mark: at(1, '* *'), body: BODY_BLINK, dx: -2, pos: 'crouch' },
    { dx: -1, legs: LEGS_STEP },
    { mark: mid('...') },
  ]
}

// Trips, lands flat, peels itself up.
function splat(): Pose[] {
  return [
    { mark: mid('✗'), body: SAD },
    { pos: 'air', arms: ARMS_UP, body: BODY_BLINK, mark: mid('!'), dy: -1 },
    { pos: 'air', arms: ARMS_UP, body: BODY_BLINK, mark: BLANK },
    { sprite: SPLAT },
    { sprite: SPLAT },
    { sprite: [mid('✗'), ...SPLAT.slice(1)] },
    { pos: 'crouch', body: SAD, mark: mid('...') },
    { body: SAD, mark: mid('✗') },
  ]
}

// A full turn on the spot; marks are drawn over each view in order.
function spin(marks: string[], extra: (i: number) => Pose = () => ({}), dir: Turn = 'right'): Pose[] {
  return views(dir).map((v, i) => ({ ...v, bare: i !== 0, mark: nth(marks, i), ...extra(i) }))
}

// Down onto the head, spin round `turns` times, and back up.
function headspin(marks: string[], turns: number, dir: Turn = 'right'): Pose[] {
  const spun: Pose[] = []
  for (let n = 0; n < turns; n++)
    views(dir).forEach((v, i) => spun.push({ ...v, pos: 'flip', bare: true, mark: nth(marks, n * 8 + i) }))
  return [
    { pos: 'crouch', mark: BLANK },
    { pos: 'air', arms: ARMS_UP, mark: mid('↓') },
    ...spun,
    { pos: 'air', body: BODY_BLINK, bare: true, arms: ARMS, mark: mid('↑') },
    { arms: ARMS_UP, body: HAPPY, mark: mid('★') },
  ]
}

// Crouch, leap, go over backwards and land.
function backflip(mark: string, landing: string): Pose[] {
  return [
    { pos: 'crouch', mark: BLANK },
    { pos: 'air', arms: ARMS_UP, mark: mid('↑') },
    { pos: 'air', body: BODY_BLINK, bare: true, arms: ARMS, mark: mid('↺') },
    { pos: 'flip', bare: true, mark: mid(mark) },
    { pos: 'flip', bare: true, mark: mid(mark) },
    { pos: 'air', body: BODY_BLINK, bare: true, arms: ARMS, mark: mid('↻') },
    { pos: 'crouch', mark: mid(landing) },
    { arms: ARMS_UP, body: HAPPY, mark: mid(landing) },
  ]
}

const THINKING: Pose[][] = [
  // walking with dots
  [1, 2, 3, 1, 2, 3].map((n, i) => ({ mark: '.'.repeat(n).padEnd(9), legs: i % 2 ? LEGS_STEP : LEGS })),
  // pondering, hand on chin
  [
    { mark: at(5, '?'), body: LOOK_L, arms: WAVE_R },
    { mark: at(5, '?'), body: LOOK_L, arms: WAVE_R },
    { mark: at(6, '?'), body: LOOK_R, arms: WAVE_R },
    { mark: at(6, '?'), body: LOOK_R, arms: WAVE_R },
  ],
  // pacing
  [
    { mark: at(1, '...'), dx: -1, legs: LEGS_STEP },
    { mark: at(1, '...'), dx: -1 },
    { mark: at(3, '...'), legs: LEGS_STEP },
    { mark: at(5, '...'), dx: 1 },
    { mark: at(5, '...'), dx: 1, legs: LEGS_STEP },
    { mark: at(3, '...') },
  ],
  // an idea grows
  [
    { mark: mid('·') },
    { mark: mid('∘') },
    { mark: mid('○') },
    { mark: mid('◎') },
    { mark: mid('!'), arms: ARMS_UP, body: HAPPY },
    { mark: mid('!'), arms: ARMS_UP, body: HAPPY, pos: 'air' },
  ],
  // turning it over, round and round
  spin([mid('.'), mid('..'), mid('...'), mid(' ..'), mid('  .'), mid('...'), mid('..'), mid('.')]),
  // and back the other way
  spin([mid('.'), mid('..'), mid('...'), mid('.. '), mid('.  '), mid('...'), mid('..'), mid('.')], undefined, 'left'),
  // cartwheeling it over
  cartwheel('...'),
  // juggling ideas
  juggle('○●◎'),
  // reading, page by page
  [
    { mark: at(1, '▬▬'), arms: WAVE_L, body: LOOK_L },
    { mark: at(1, '▬▬'), arms: WAVE_L, body: LOOK_L },
    { mark: at(1, '▬▬'), arms: WAVE_L, body: BODY },
    { mark: at(2, '▬▬'), arms: WAVE_L, body: LOOK_L },
    { mark: at(2, '▬▬'), arms: WAVE_L, body: BODY_BLINK },
    { mark: at(1, '▬▬'), arms: WAVE_L, body: LOOK_L },
  ],
  // scratching its head
  [
    { mark: at(6, '?'), arms: WAVE_R, body: LOOK_R },
    { mark: at(6, '?'), arms: ARMS_UP, body: LOOK_R },
    { mark: at(6, '?'), arms: WAVE_R, body: LOOK_R },
    { mark: at(6, '??'), arms: ARMS_UP, body: BODY },
    { mark: at(6, '??'), arms: WAVE_R, body: LOOK_L },
    { mark: mid('...'), arms: ARMS, body: BODY_BLINK },
  ],
  // counting on fingers
  [
    { mark: at(1, '1'), arms: WAVE_L },
    { mark: at(1, '1 2'), arms: WAVE_R },
    { mark: at(1, '1 2 3'), arms: WAVE_L },
    { mark: at(1, '1 2 3 4'), arms: WAVE_R },
    { mark: at(1, '1 2 3 4?'), arms: ARMS_UP, body: LOOK_L },
    { mark: mid('...'), body: BODY_BLINK },
  ],
  // a thought bubble that will not settle
  [
    { mark: at(5, 'o'), body: LOOK_R },
    { mark: at(5, 'O'), body: LOOK_R },
    { mark: at(4, '(  )'), body: LOOK_R },
    { mark: at(4, '( ?)'), body: LOOK_R },
    { mark: at(4, '(! )'), body: HAPPY },
    { mark: at(4, '(  )'), body: BODY_BLINK },
  ],
  // sitting down to think it through
  [
    { pos: 'crouch', mark: mid('...'), body: LOOK_L },
    { pos: 'crouch', mark: mid('...'), body: LOOK_L },
    { pos: 'crouch', mark: mid(' ..'), body: BODY },
    { pos: 'crouch', mark: mid('  .'), body: LOOK_R },
    { pos: 'crouch', mark: mid('...'), body: LOOK_R },
    { mark: mid('!'), arms: ARMS_UP, body: HAPPY },
  ],
]

const TOOLS: Record<string, Pose[]> = {
  // typing at a prompt
  shell: [
    { mark: at(2, '>_'), arms: WAVE_L },
    { mark: at(2, '> '), arms: WAVE_R },
    { mark: at(2, '>_'), arms: WAVE_L },
    { mark: at(2, '> '), arms: WAVE_R },
  ],
  // a magnifier sweeps and the eyes follow
  search: [
    { mark: at(1, 'o-'), body: LOOK_L },
    { mark: at(3, 'o-'), body: BODY },
    { mark: at(5, 'o-'), body: LOOK_R },
    { mark: at(3, 'o-'), body: BODY },
  ],
  // a pencil scribbles a line
  write: [0, 1, 2, 3, 4, 5].map(n => ({ mark: at(1, '~'.repeat(n) + '✎'), arms: n % 2 ? WAVE_R : ARMS })),
  // a spinning globe
  web: ['◐', '◓', '◑', '◒'].map((g, i) => ({ mark: mid(g), arms: ARMS_UP, legs: i % 2 ? LEGS_STEP : LEGS })),
  // running to hand work off
  team: [
    { mark: at(1, '»'), dx: -1, legs: LEGS_STEP },
    { mark: at(1, '»»'), dx: 0 },
    { mark: at(1, '»»»'), dx: 1, legs: LEGS_STEP },
    { mark: at(1, '»»»»'), dx: 0 },
  ],
  // passing messages to a server
  mcp: [
    { mark: mid('·⇄ '), arms: WAVE_L },
    { mark: mid(' ⇄·'), arms: WAVE_R },
  ],
  // casting a skill
  skill: [
    { mark: mid('✧'), arms: ARMS_UP },
    { mark: mid('✦ ✧'), arms: ARMS_UP, pos: 'air' },
    { mark: mid('✧ ✦ ✧'), arms: ARMS_UP },
    { mark: mid('✦'), arms: ARMS },
  ],
  gear: [
    { mark: at(4, '⚙') },
    { mark: at(3, '⚙'), legs: LEGS_STEP },
  ],
}

export function toolKind(tool: string): string {
  if (/^(Bash|Monitor|PowerShell)$/.test(tool)) return 'shell'
  if (/^(Read|Grep|Glob|LSP)$/.test(tool) || /^mcp__serena__(find|get|search|list|read)/.test(tool)) return 'search'
  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(tool) || /^mcp__serena__(replace|insert|rename|edit|write)/.test(tool)) return 'write'
  if (/^Web(Fetch|Search)$/.test(tool)) return 'web'
  if (/^(Agent|Task|Workflow|SendMessage)$/.test(tool)) return 'team'
  if (tool === 'Skill') return 'skill'
  if (tool.startsWith('mcp__')) return 'mcp'
  return 'gear'
}

const WAITING: Pose[][] = [
  // arms up and down
  [{ mark: mid('!'), arms: ARMS_UP }, { arms: ARMS }],
  // waving at you
  [
    { mark: at(6, '!'), arms: WAVE_R },
    { mark: at(6, '!'), arms: ARMS },
  ],
  // tapping a foot, looking around
  [
    { mark: mid('?'), body: LOOK_L, legs: LEGS_TAP },
    { mark: mid('?'), body: LOOK_L },
    { mark: mid('?'), body: LOOK_L, legs: LEGS_TAP },
    { mark: mid('?'), body: LOOK_R },
    { mark: mid('?'), body: LOOK_R, legs: LEGS_TAP },
    { mark: mid('?'), body: LOOK_R },
  ],
  // jumping for attention
  [
    { mark: mid('!!'), arms: ARMS_UP, pos: 'air' },
    { mark: mid('!'), pos: 'crouch' },
  ],
  // twirling round to look for you
  spin([mid('!'), at(2, '?'), at(2, '?'), mid('?'), mid('?'), at(6, '?'), at(6, '?'), mid('!')], undefined, 'left'),
  // dropping in from above
  dropIn('!'),
  // popping up from below
  riseUp('?'),
  // walking up to you from the back of the screen
  approach('!'),
  // blinking in and out to catch your eye
  teleport('?'),
  // knocking
  [
    { mark: at(4, 'knock'), arms: WAVE_R },
    { mark: at(4, 'knock'), arms: ARMS },
    { mark: at(4, 'knock'), arms: WAVE_R },
    { mark: BLANK, arms: ARMS, body: LOOK_R },
    { mark: BLANK, arms: ARMS, body: LOOK_R },
    { mark: mid('?'), arms: ARMS, body: BODY },
  ],
  // holding up a sign
  [
    { mark: at(2, '[ ? ]'), arms: ARMS_UP },
    { mark: at(2, '[ ? ]'), arms: ARMS_UP },
    { mark: at(2, '[ ! ]'), arms: ARMS_UP, pos: 'air' },
    { mark: at(2, '[ ! ]'), arms: ARMS_UP },
  ],
  // checking the time
  [
    { mark: at(1, '◷'), arms: WAVE_L, body: LOOK_L },
    { mark: at(1, '◶'), arms: WAVE_L, body: LOOK_L },
    { mark: at(1, '◵'), arms: WAVE_L, body: LOOK_L },
    { mark: at(1, '◴'), arms: WAVE_L, body: LOOK_L },
    { mark: mid('...'), arms: ARMS, body: BODY_BLINK, legs: LEGS_TAP },
    { mark: mid('?'), arms: ARMS, body: BODY, legs: LEGS },
  ],
  // peeking round the edge
  [
    { dx: -4, body: LOOK_R, mark: BLANK },
    { dx: -3, body: LOOK_R, mark: at(5, '?') },
    { dx: -3, body: LOOK_R, mark: at(5, '?') },
    { dx: -4, body: LOOK_R, mark: BLANK },
    { dx: -5, mark: BLANK },
    { dx: -5, mark: BLANK },
  ],
  // tugging at your sleeve
  [
    { dx: 1, mark: at(7, '!'), arms: WAVE_R },
    { dx: 2, mark: at(7, '!'), arms: WAVE_R, legs: LEGS_STEP },
    { dx: 2, mark: at(7, '!'), arms: ARMS_UP },
    { dx: 1, mark: at(6, '!!'), arms: WAVE_R, legs: LEGS_STEP },
  ],
]

const DONE: Pose[][] = [
  // jumping
  [
    { mark: mid('✓'), arms: ARMS_UP, pos: 'air' },
    { mark: mid('✓'), pos: 'crouch' },
  ],
  // dancing
  [
    { mark: at(1, '♪'), body: HAPPY, arms: WAVE_L, dx: -1 },
    { mark: mid('✓'), body: HAPPY, arms: ARMS_UP, legs: LEGS_STEP },
    { mark: at(6, '♫'), body: HAPPY, arms: WAVE_R, dx: 1 },
    { mark: mid('✓'), body: HAPPY, arms: ARMS_UP, legs: LEGS_STEP },
  ],
  // fireworks
  [
    { mark: mid('·'), body: HAPPY, arms: ARMS_UP },
    { mark: mid('*'), body: HAPPY, arms: ARMS_UP },
    { mark: mid('* *'), body: HAPPY, arms: ARMS_UP, pos: 'air' },
    { mark: mid('✦ * ✦'), body: HAPPY, arms: ARMS_UP },
    { mark: mid('·   ·'), body: HAPPY, arms: ARMS },
    { mark: mid('✓'), body: HAPPY, arms: ARMS },
  ],
  // a spinning jump
  spin(['   ✦     ', '    ✧ ✦  ', '      ✧  ', '   ✦  ✧  ', '  ✧   ✦  ', '  ✦ ✧    ', ' ✧       ', mid('✓')], i =>
    i > 0 && i < 7 ? { pos: 'air', arms: i % 2 ? ARMS : ARMS_UP } : {},
  ),
  // a backflip
  backflip('✦', '✓'),
  // a headspin, twice round
  headspin([' ~  ✦  ~ ', '~   ✧   ~', ' ~  ✦  ~ ', '~   ✧   ~'], 2),
  // right round, then left round
  [
    ...spin([at(6, '↻')], i => (i % 2 ? { pos: 'air' } : {})),
    ...spin([at(2, '↺')], i => (i % 2 ? { pos: 'air' } : {}), 'left'),
    { mark: mid('✓'), body: HAPPY, arms: ARMS_UP },
  ],
  // cartwheels there and back
  cartwheel('✓'),
  // swooping in diagonally
  swoop('✓'),
  // trampolining, a flip on the last bounce
  trampoline('✓'),
  // a lap of honour off one edge and in from the other
  lap('✓'),
  // spinning till dizzy
  dizzy(),
  // moonwalking
  moonwalk(),
  // a bow
  [
    { mark: mid('✓'), arms: ARMS_UP, body: HAPPY },
    { mark: mid('✓'), arms: ARMS, body: HAPPY },
    { pos: 'crouch', mark: mid('✓'), body: HAPPY },
    { pos: 'crouch', mark: mid('✓'), body: BODY_BLINK },
    { pos: 'crouch', mark: mid('✓'), body: HAPPY },
    { mark: mid('✓'), arms: WAVE_R, body: HAPPY },
  ],
  // confetti
  [
    { mark: at(1, '* . * .'), arms: ARMS_UP, body: HAPPY },
    { mark: at(2, '. * . *'), arms: ARMS_UP, body: HAPPY, pos: 'air' },
    { mark: at(1, '. * . *'), arms: ARMS_UP, body: HAPPY },
    { mark: at(2, '* . * .'), arms: WAVE_L, body: HAPPY },
    { mark: at(1, '* . * .'), arms: WAVE_R, body: HAPPY },
    { mark: mid('✓'), arms: ARMS_UP, body: HAPPY, pos: 'air' },
  ],
  // a high five
  [
    { mark: at(7, '✓'), arms: WAVE_R, body: HAPPY, dx: 1 },
    { mark: at(7, '✓'), arms: WAVE_R, body: HAPPY, dx: 2 },
    { mark: at(6, '*✓'), arms: WAVE_R, body: HAPPY, dx: 3, pos: 'air' },
    { mark: at(7, '✓'), arms: WAVE_R, body: HAPPY, dx: 2 },
    { mark: mid('✓'), arms: ARMS_UP, body: HAPPY, dx: 1 },
    { mark: mid('✓'), arms: ARMS, body: HAPPY },
  ],
  // a victory sprint on the spot
  [
    { mark: at(2, '✓ »'), body: HAPPY, legs: LEGS_STEP, arms: WAVE_L },
    { mark: at(2, '✓ »»'), body: HAPPY, legs: LEGS, arms: WAVE_R },
    { mark: at(2, '✓ »»»'), body: HAPPY, legs: LEGS_STEP, arms: WAVE_L },
    { mark: at(2, '✓'), body: HAPPY, legs: LEGS, arms: ARMS_UP, pos: 'air' },
  ],
  // a quick nap, job done
  [
    { mark: mid('✓'), body: HAPPY, arms: ARMS_UP },
    { mark: mid('✓'), body: HAPPY },
    { mark: at(5, 'z'), body: BODY_BLINK, pos: 'crouch' },
    { mark: at(6, 'Z'), body: BODY_BLINK, pos: 'crouch' },
    { mark: at(5, 'z'), body: BODY_BLINK, pos: 'crouch' },
    { mark: at(6, 'Z'), body: BODY_BLINK, pos: 'crouch' },
    { mark: mid('!'), body: HAPPY, arms: ARMS_UP },
    { mark: mid('✓'), body: HAPPY },
  ],
]

const ERROR: Pose[][] = [
  // shaking
  [
    { mark: mid('✗'), body: BODY_BLINK, dx: -1 },
    { mark: mid('✗'), body: BODY_BLINK, dx: 1 },
    { mark: mid('✗'), body: BODY_BLINK, dx: -1 },
    { mark: mid('✗'), body: BODY_BLINK, dx: 1 },
    { mark: mid('✗'), body: BODY_BLINK },
    { mark: mid('✗'), body: BODY_BLINK },
  ],
  // slumped
  [
    { mark: mid('...'), body: SAD, pos: 'crouch' },
    { mark: mid('...'), body: SAD, pos: 'crouch' },
    { mark: mid('✗'), body: SAD, pos: 'crouch' },
    { mark: mid('✗'), body: SAD, pos: 'crouch' },
  ],
  // sinking through the floor and climbing back out
  [
    { mark: mid('✗'), body: SAD },
    ...[1, 2, 3, 4, 5].map(dy => ({ dy, mark: mid('✗'), body: SAD })),
    { dy: 5, mark: BLANK },
    ...[4, 3, 2, 1].map(dy => ({ dy, mark: mid('...'), body: SAD, arms: ARMS_UP })),
  ],
  // smoking
  [
    { mark: at(4, '~'), body: BODY_BLINK },
    { mark: at(5, '≈'), body: BODY_BLINK },
    { mark: at(3, '~'), body: BODY_BLINK },
    { mark: mid('✗'), body: SAD },
  ],
  // tripping flat on its face
  splat(),
  // a rain cloud overhead
  [
    { mark: at(2, '▄▀▀▀▄'), body: SAD },
    { mark: at(2, '╷ ╷ ╷'), body: SAD },
    { mark: at(2, '▄▀▀▀▄'), body: SAD, legs: LEGS_STEP },
    { mark: at(2, ' ╷ ╷ '), body: SAD },
    { mark: mid('✗'), body: SAD, pos: 'crouch' },
    { mark: mid('✗'), body: SAD, pos: 'crouch' },
  ],
  // head in hands
  [
    { mark: mid('✗'), body: SAD, arms: ARMS_UP },
    { mark: mid('✗'), body: BODY_BLINK, arms: ARMS_UP },
    { mark: mid('...'), body: BODY_BLINK, arms: ARMS_UP, pos: 'crouch' },
    { mark: mid('...'), body: BODY_BLINK, arms: ARMS_UP, pos: 'crouch' },
    { mark: mid('✗'), body: SAD, arms: ARMS, pos: 'crouch' },
    { mark: mid('✗'), body: SAD, arms: ARMS },
  ],
  // keeling over backwards
  [
    { mark: mid('✗'), body: BODY_BLINK },
    { mark: mid('!'), body: BODY_BLINK, arms: ARMS_UP, dx: -1 },
    { mark: mid('!'), body: BODY_BLINK, arms: ARMS_UP, pos: 'air', dx: -2 },
    { pos: 'flip', bare: true, mark: BLANK, dx: -2, dy: 1 },
    { pos: 'flip', bare: true, mark: mid('✗'), dx: -2, dy: 1 },
    { pos: 'flip', bare: true, mark: mid('✗'), dx: -2, dy: 1 },
    { pos: 'crouch', body: SAD, mark: mid('...'), dx: -1 },
    { body: SAD, mark: mid('✗') },
  ],
  // a bug crawls past
  [
    { mark: at(0, '•'), body: LOOK_L },
    { mark: at(2, '•'), body: LOOK_L },
    { mark: at(4, '•'), body: BODY_BLINK, pos: 'air', arms: ARMS_UP },
    { mark: at(6, '•'), body: LOOK_R, arms: ARMS_UP },
    { mark: at(8, '•'), body: LOOK_R },
    { mark: mid('✗'), body: SAD },
  ],
]

// Short moves an idle Clawd makes between naps.
const FIDGETS: Pose[][] = [
  // looking around
  [{ body: LOOK_L }, { body: LOOK_L }, { body: LOOK_R }, { body: LOOK_R }, {}, { mark: mid('?') }],
  // stretching
  [{ arms: ARMS_UP }, { arms: ARMS_UP, pos: 'air' }, { arms: ARMS_UP }, { pos: 'crouch' }],
  // yawning
  [
    { mark: mid('o'), body: BODY_BLINK },
    { mark: mid('O'), body: BODY_BLINK, arms: WAVE_R },
    { mark: mid('O'), body: BODY_BLINK, arms: WAVE_R },
    { mark: mid('o'), body: BODY_BLINK },
  ],
  // wandering
  [{ dx: -1, legs: LEGS_STEP }, { dx: -1 }, { legs: LEGS_STEP }, { dx: 1 }, { dx: 1, legs: LEGS_STEP }, {}],
  // scratching
  [{ arms: WAVE_R }, { arms: ARMS }, { arms: WAVE_R }, { arms: ARMS }],
  // hopping
  [{ pos: 'crouch' }, { arms: ARMS_UP, pos: 'air' }, { pos: 'crouch' }, {}],
  // a slow pirouette
  spin([BLANK, BLANK, mid('~'), BLANK, BLANK, BLANK, mid('~'), mid('♪')]),
  // a lazy backflip
  backflip('~', '♪'),
  // a pirouette the other way
  spin([BLANK, BLANK, mid('~'), BLANK, BLANK, BLANK, mid('~'), mid('♪')], undefined, 'left'),
  // a headspin
  headspin([' ~     ~ ', '  ~   ~  '], 1, 'left'),
  // peeking up from below
  riseUp('?', 2),
  // drifting down from the top right and out the bottom left
  swoop('~'),
  // a sneeze
  sneeze(),
  // a little moonwalk
  moonwalk(),
  // popping from place to place
  teleport('~'),
  // wandering off into the distance and back
  wander(),
  // juggling
  juggle('·o·'),
  // push-ups
  [
    { pos: 'crouch', arms: ARMS_UP },
    { pos: 'crouch', arms: ARMS },
    { pos: 'crouch', arms: ARMS_UP },
    { pos: 'crouch', arms: ARMS },
    { arms: ARMS_UP, mark: mid('~') },
    { mark: BLANK },
  ],
  // whistling
  [
    { mark: at(5, '♪'), body: LOOK_R },
    { mark: at(6, '♫'), body: LOOK_R },
    { mark: at(5, '♪ ♫'), body: BODY },
    { mark: at(2, '♫'), body: LOOK_L },
    { mark: at(1, '♪'), body: LOOK_L },
    { mark: BLANK, body: BODY_BLINK },
  ],
  // a little dance
  [
    { arms: WAVE_L, dx: -1, legs: LEGS_STEP },
    { arms: ARMS_UP, body: HAPPY },
    { arms: WAVE_R, dx: 1, legs: LEGS_STEP },
    { arms: ARMS_UP, body: HAPPY },
    { arms: WAVE_L, dx: -1, legs: LEGS_STEP },
    { arms: ARMS_UP, body: HAPPY, mark: mid('♪') },
  ],
  // squinting at something far off
  [
    { body: LOOK_R, arms: WAVE_R, mark: at(7, '.') },
    { body: LOOK_R, arms: WAVE_R, mark: at(7, '.') },
    { body: LOOK_R, arms: WAVE_R, mark: at(6, '..') },
    { body: BODY, arms: ARMS, mark: mid('?') },
    { body: BODY_BLINK, arms: ARMS, mark: BLANK },
    { body: LOOK_L, arms: ARMS, mark: BLANK },
  ],
  // a big stretch and a sit-down
  [
    { arms: ARMS_UP, mark: mid('~') },
    { arms: ARMS_UP, mark: mid('~~'), pos: 'air' },
    { arms: ARMS_UP, mark: mid('~') },
    { pos: 'crouch', mark: BLANK },
    { pos: 'crouch', mark: BLANK, body: BODY_BLINK },
    { pos: 'crouch', mark: mid('.') },
  ],
]

// Idle sleeps 16s then fidgets for 7s, each cycle picking another fidget.
const NAP = 32
const CYCLE = 46

// Picks which animation a state plays. It changes each time the session enters a state.
export function seedOf(s: { id: string; since: number }): number {
  return hash(`${s.id}:${s.since}`)
}


export function pose(state: ClawdState, tick: number, detail = '', seed = 0): Pose {
  const play = (seq: Pose[]) => nth(seq, tick)
  switch (state) {
    case 'thinking':
      return play(nth(THINKING, seed))
    case 'tool':
      return play(TOOLS[toolKind(detail)] ?? TOOLS.gear ?? [])
    case 'waiting':
      return play(nth(WAITING, seed))
    case 'done':
      return play(nth(DONE, seed))
    case 'error':
      return play(nth(ERROR, seed))
    case 'idle':
    case 'ended': {
      const p = tick % CYCLE
      if (p < NAP) return { mark: tick % 2 ? at(6, 'z') : at(5, 'Z'), body: tick % 6 === 0 ? BODY : BODY_BLINK }
      return nth(nth(FIDGETS, seed + Math.floor(tick / CYCLE)), p - NAP)
    }
  }
}

// Leading columns to draw the figure at: 1 is centred, 0 and 2 sway.
export function offset(state: ClawdState, tick: number, detail = '', seed = 0): number {
  return Math.min(MAX_PAD, Math.max(0, 1 + (pose(state, tick, detail, seed).dx ?? 0)))
}

// Five rows: a mark, then Clawd's body with the costume's hat above it.
// Rewrites the arms and legs rows before the figure is placed, so items in the hands and shoes on the feet move with it.
export type Trim = { arms?: (row: string) => string; legs?: (row: string) => string }

export function dressed(state: ClawdState, tick: number, costume: string, detail = '', seed = 0, trim?: Trim): string[] {
  const c = COSTUMES[costume] ?? COSTUMES.none
  const p = pose(state, tick, detail, seed)
  const hat = p.noHat ? BLANK : c.alt !== undefined && tick % 2 === 1 ? c.alt : c.hat
  if (p.sprite !== undefined) return place([hat, ...p.sprite], p)
  const { rows, at: i } = layout(p)
  if (p.pos === 'flip') return place([...rows, hat], p)
  const body = c.face !== undefined && !p.bare && rows[i] !== BODY_BLINK ? c.face : rows[i]
  const out = [...rows.slice(0, i), hat, body, ...rows.slice(i + 1)]
  if (trim !== undefined && !p.bare) {
    if (trim.arms !== undefined) out[i + 2] = trim.arms(out[i + 2] ?? BLANK)
    if (trim.legs !== undefined && p.pos === undefined) out[i + 3] = trim.legs(out[i + 3] ?? BLANK)
  }
  return place(out, p)
}

// Where the arms and legs rows land in dressed(): -1 when that row is not drawn or is off the edge.
// Items and shoes are only worn facing front, standing, crouching or in the air.
export function gearRows(state: ClawdState, tick: number, detail = '', seed = 0): { arms: number; legs: number } {
  const p = pose(state, tick, detail, seed)
  if (p.sprite !== undefined || p.bare || p.pos === 'flip') return { arms: -1, legs: -1 }
  const at = p.pos === 'crouch' ? 2 : 1
  const dy = p.dy ?? 0
  const row = (n: number) => (n >= 0 && n < 5 ? n : -1)
  return { arms: row(at + 2 + dy), legs: p.pos === undefined ? row(at + 3 + dy) : -1 }
}

// The row of dressed() that holds the hat, drawn in the costume's color.
// -1 when the hat is moved out of sight.
export function hatRow(state: ClawdState, tick: number, detail = '', seed = 0): number {
  const p = pose(state, tick, detail, seed)
  if (p.noHat) return -1
  const row = (p.sprite !== undefined ? 0 : layout(p).at) + (p.dy ?? 0)
  return row >= 0 && row < 5 ? row : -1
}

// Two rows for the gallery: the hat and the face it wears.
export function portrait(costume: string, tick: number): string[] {
  const c = COSTUMES[costume] ?? COSTUMES.none
  return [c.alt !== undefined && tick % 2 === 1 ? c.alt : c.hat, c.face ?? BODY]
}

// Four rows: a mark above, then Clawd's three-row body.
export function frame(state: ClawdState, tick: number, detail = '', seed = 0): string[] {
  const p = pose(state, tick, detail, seed)
  return place(p.sprite ?? layout(p).rows, p)
}

// Every animation the state can play, for tests and previews.
export function variants(state: ClawdState): number {
  if (state === 'thinking') return THINKING.length
  if (state === 'waiting') return WAITING.length
  if (state === 'done') return DONE.length
  if (state === 'error') return ERROR.length
  if (state === 'tool') return Object.keys(TOOLS).length
  return FIDGETS.length
}

export const TOOL_KINDS = Object.keys(TOOLS)

export function live(list: SessionStatus[], now: number): SessionStatus[] {
  return list
    .filter(s => s.state !== 'ended' && now - s.heartbeat < STALE_MS)
    .sort((a, b) => a.since - b.since)
}

export function elapsed(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}`
}
