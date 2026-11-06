import './style.css'
import { COLORS, LABELS, TOOL_KINDS, variants } from './clawd'
import { randomOutfit } from './outfit'
import type { Outfit } from './outfit'
import { ClawdView, css } from './render'
import type { ClawdState } from './types'

const STATES: ClawdState[] = ['idle', 'thinking', 'tool', 'waiting', 'done', 'error']
const TOOL_SAMPLE: Record<string, string> = {
  shell: 'Bash',
  search: 'Read',
  write: 'Edit',
  web: 'WebFetch',
  team: 'Agent',
  mcp: 'mcp__server__tool',
  skill: 'Skill',
  gear: 'Other',
}

type Roll = { state: ClawdState; seed: number; outfit: Outfit }

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T

function roll(): Roll {
  const state = pick(STATES)
  const n = state === 'tool' ? TOOL_KINDS.length : variants(state)
  return { state, seed: Math.floor(Math.random() * n), outfit: randomOutfit() }
}

const detailOf = (r: Roll) => (r.state === 'tool' ? TOOL_SAMPLE[TOOL_KINDS[r.seed % TOOL_KINDS.length]] ?? 'Other' : '')

function describe(r: Roll): string {
  const move = r.state === 'tool' ? `tool: ${TOOL_KINDS[r.seed % TOOL_KINDS.length]}` : `move ${r.seed + 1}/${variants(r.state)}`
  const wear = [r.outfit.costume, r.outfit.item, r.outfit.shoes].filter(n => n !== 'none')
  return `${move} · wearing ${wear.length > 0 ? wear.join(', ') : 'nothing'}`
}

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!
const solo = $<HTMLElement>('#solo')
const crowd = $<HTMLElement>('#crowd')
const rerollButton = $<HTMLButtonElement>('#reroll')
const auto = $<HTMLInputElement>('#auto')
const every = $<HTMLSelectElement>('#every')

// The one big Clawd.
let tick = 0
let current = roll()
// Idle Clawds nap for the first 16 seconds of a cycle; start them part way in so a fidget shows sooner.
let base = 0
const view = new ClawdView()
view.el.classList.add('big')
const label = document.createElement('div')
label.className = 'label big-label'
const detail = document.createElement('div')
detail.className = 'variant'
solo.append(view.el, label, detail)

function reroll() {
  current = roll()
  base = current.state === 'idle' ? tick - 28 : tick
  label.textContent = LABELS[current.state]
  label.style.color = css(COLORS[current.state])
  detail.textContent = describe(current)
  drawSolo()
  restartAuto()
}

function drawSolo() {
  view.draw(current.state, tick - base, current.outfit, detailOf(current), current.seed)
}

// A row of small ones underneath, each rerolling on its own schedule.
const SMALL = 8
const small = Array.from({ length: SMALL }, () => {
  const v = new ClawdView()
  const wrap = document.createElement('div')
  wrap.className = 'mini'
  wrap.append(v.el)
  crowd.append(wrap)
  const r = roll()
  const s = { view: v, roll: r, base: 0, until: 0 }
  wrap.addEventListener('click', () => {
    s.roll = roll()
    s.base = tick
  })
  return s
})

let auto_timer = 0
function restartAuto() {
  window.clearTimeout(auto_timer)
  if (auto.checked) auto_timer = window.setTimeout(reroll, Number(every.value))
}

window.setInterval(() => {
  tick += 1
  drawSolo()
  for (const s of small) {
    if (tick >= s.until) {
      s.roll = roll()
      s.base = s.roll.state === 'idle' ? tick - 28 : tick
      s.until = tick + 12 + Math.floor(Math.random() * 30)
    }
    s.view.draw(s.roll.state, tick - s.base, s.roll.outfit, detailOf(s.roll), s.roll.seed)
  }
}, 500)

solo.addEventListener('click', reroll)
rerollButton.addEventListener('click', reroll)
auto.addEventListener('change', restartAuto)
every.addEventListener('change', restartAuto)
document.addEventListener('keydown', e => {
  if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
    e.preventDefault()
    reroll()
  }
})

reroll()
