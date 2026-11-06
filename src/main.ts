import './style.css'
import {
  COLORS,
  COSTUMES,
  COSTUME_NAMES,
  LABELS,
  TOOL_KINDS,
  dressed,
  hatRow,
  offset,
  portrait,
  variants,
} from './clawd'
import type { ClawdState } from './types'

const STATES: ClawdState[] = ['idle', 'thinking', 'tool', 'waiting', 'done', 'error']

// One tool name per kind, so the "running" Clawd can show each tool animation.
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

// Terminal color names as the mod uses them, in a palette that reads on this page.
const TERM: Record<string, string> = {
  gray: '#8a8f98',
  yellow: '#e5c07b',
  green: '#98c379',
  red: '#e06c75',
  magenta: '#c678dd',
  blue: '#61afef',
  cyan: '#56b6c2',
  white: '#e6e6e6',
}
const css = (c: string) => TERM[c] ?? c

const WEARABLE = COSTUME_NAMES.filter(n => n !== 'none')
const randomCostume = () => WEARABLE[Math.floor(Math.random() * WEARABLE.length)]

type Card = { state: ClawdState; seed: number; rows: HTMLSpanElement[]; variant: HTMLElement; root: HTMLElement }

let tick = 0
let costume = randomCostume()
let interval = 500
let timer = 0

const stage = document.querySelector<HTMLElement>('#stage')!
const gallery = document.querySelector<HTMLElement>('#gallery')!
const costumeSelect = document.querySelector<HTMLSelectElement>('#costume')!
const randomButton = document.querySelector<HTMLButtonElement>('#random')!
const galleryToggle = document.querySelector<HTMLButtonElement>('#gallery-toggle')!
const speedSelect = document.querySelector<HTMLSelectElement>('#speed')!

function detailOf(c: Card): string {
  return c.state === 'tool' ? TOOL_SAMPLE[TOOL_KINDS[c.seed % TOOL_KINDS.length]] ?? 'Other' : ''
}

function caption(c: Card): string {
  if (c.state === 'tool') return `tool: ${TOOL_KINDS[c.seed % TOOL_KINDS.length]}`
  return `move ${(c.seed % variants(c.state)) + 1}/${variants(c.state)}`
}

function makeCard(state: ClawdState): Card {
  const root = document.createElement('article')
  root.className = `card ${state}`
  root.title = 'click for another move'
  const pre = document.createElement('pre')
  const rows = Array.from({ length: 5 }, () => {
    const span = document.createElement('span')
    pre.append(span, '\n')
    return span
  })
  const label = document.createElement('div')
  label.className = 'label'
  label.style.color = css(COLORS[state])
  label.textContent = LABELS[state]
  const variant = document.createElement('div')
  variant.className = 'variant'
  root.append(pre, label, variant)
  const card: Card = { state, seed: Math.floor(Math.random() * 16), rows, variant, root }
  root.addEventListener('click', () => {
    card.seed += 1
    draw(card)
  })
  stage.append(root)
  return card
}

function draw(c: Card) {
  const detail = detailOf(c)
  const pad = ' '.repeat(offset(c.state, tick, detail, c.seed))
  const hat = hatRow(c.state, tick, detail, c.seed)
  const hatColor = css((COSTUMES[costume] ?? COSTUMES.none).color)
  const color = css(COLORS[c.state])
  dressed(c.state, tick, costume, detail, c.seed).forEach((row, i) => {
    const span = c.rows[i]
    span.textContent = pad + row
    span.style.color = i === hat ? hatColor : color
  })
  c.variant.textContent = caption(c)
}

const cards = STATES.map(makeCard)

// Gallery: every costume's hat and face, click one to wear it.
const portraits = WEARABLE.map(name => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'portrait'
  const pre = document.createElement('pre')
  const hat = document.createElement('span')
  const face = document.createElement('span')
  hat.style.color = css(COSTUMES[name].color)
  face.style.color = css(COLORS.thinking)
  pre.append(hat, '\n', face)
  const label = document.createElement('div')
  label.className = 'name'
  label.textContent = name
  button.append(pre, label)
  button.addEventListener('click', () => setCostume(name))
  gallery.append(button)
  return { name, button, hat, face }
})

function drawGallery() {
  if (gallery.hidden) return
  for (const p of portraits) {
    const [hat, face] = portrait(p.name, tick)
    p.hat.textContent = hat
    p.face.textContent = face
    p.button.setAttribute('aria-pressed', String(p.name === costume))
  }
}

function setCostume(name: string) {
  costume = name
  costumeSelect.value = name
  cards.forEach(draw)
  drawGallery()
}

for (const name of COSTUME_NAMES) {
  const option = document.createElement('option')
  option.value = name
  option.textContent = name
  costumeSelect.append(option)
}
costumeSelect.value = costume
costumeSelect.addEventListener('change', () => setCostume(costumeSelect.value))
randomButton.addEventListener('click', () => {
  let next = randomCostume()
  while (next === costume && WEARABLE.length > 1) next = randomCostume()
  setCostume(next)
})
galleryToggle.addEventListener('click', () => {
  gallery.hidden = !gallery.hidden
  galleryToggle.setAttribute('aria-pressed', String(!gallery.hidden))
  drawGallery()
})

function step() {
  tick += 1
  cards.forEach(draw)
  drawGallery()
}

function start() {
  window.clearInterval(timer)
  timer = window.setInterval(step, interval)
}

speedSelect.addEventListener('change', () => {
  interval = Number(speedSelect.value)
  start()
})

cards.forEach(draw)
start()
