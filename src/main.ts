import './style.css'
import { COLORS, COSTUMES, COSTUME_NAMES, LABELS, TOOL_KINDS, portrait, variants } from './clawd'
import { ITEM_NAMES, SHOE_NAMES, WEARABLE, isOutfit, randomOutfit } from './outfit'
import type { Outfit } from './outfit'
import { ClawdView, css } from './render'
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

const STORAGE = 'clawd-outfit'

function loadOutfit(): Outfit {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null')
    if (isOutfit(saved)) return saved
  } catch {
    // nothing saved, or not ours
  }
  return randomOutfit()
}

function saveOutfit(o: Outfit) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(o))
  } catch {
    // private window or storage off; the outfit still shows
  }
}

type Card = { state: ClawdState; seed: number; view: ClawdView; variant: HTMLElement }

let tick = 0
let outfit = loadOutfit()
let interval = 500
let timer = 0

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!
const stage = $<HTMLElement>('#stage')
const gallery = $<HTMLElement>('#gallery')
const costumeSelect = $<HTMLSelectElement>('#costume')
const itemSelect = $<HTMLSelectElement>('#item')
const shoesSelect = $<HTMLSelectElement>('#shoes')
const randomButton = $<HTMLButtonElement>('#random')
const galleryToggle = $<HTMLButtonElement>('#gallery-toggle')
const speedSelect = $<HTMLSelectElement>('#speed')
const counts = $<HTMLElement>('#counts')

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
  const view = new ClawdView()
  const label = document.createElement('div')
  label.className = 'label'
  label.style.color = css(COLORS[state])
  label.textContent = LABELS[state]
  const variant = document.createElement('div')
  variant.className = 'variant'
  root.append(view.el, label, variant)
  const card: Card = { state, seed: Math.floor(Math.random() * 16), view, variant }
  root.addEventListener('click', () => {
    card.seed += 1
    draw(card)
  })
  stage.append(root)
  return card
}

function draw(c: Card) {
  c.view.draw(c.state, tick, outfit, detailOf(c), c.seed)
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
  button.addEventListener('click', () => setOutfit({ ...outfit, costume: name }))
  gallery.append(button)
  return { name, button, hat, face }
})

function drawGallery() {
  if (gallery.hidden) return
  for (const p of portraits) {
    const [hat, face] = portrait(p.name, tick)
    p.hat.textContent = hat
    p.face.textContent = face
    p.button.setAttribute('aria-pressed', String(p.name === outfit.costume))
  }
}

function fill(select: HTMLSelectElement, names: string[]) {
  for (const name of names) {
    const option = document.createElement('option')
    option.value = name
    option.textContent = name
    select.append(option)
  }
}

function setOutfit(next: Outfit) {
  outfit = next
  saveOutfit(outfit)
  costumeSelect.value = outfit.costume
  itemSelect.value = outfit.item
  shoesSelect.value = outfit.shoes
  cards.forEach(draw)
  drawGallery()
}

fill(costumeSelect, COSTUME_NAMES)
fill(itemSelect, ITEM_NAMES)
fill(shoesSelect, SHOE_NAMES)
costumeSelect.addEventListener('change', () => setOutfit({ ...outfit, costume: costumeSelect.value }))
itemSelect.addEventListener('change', () => setOutfit({ ...outfit, item: itemSelect.value }))
shoesSelect.addEventListener('change', () => setOutfit({ ...outfit, shoes: shoesSelect.value }))
randomButton.addEventListener('click', () => setOutfit(randomOutfit()))
galleryToggle.addEventListener('click', () => {
  gallery.hidden = !gallery.hidden
  galleryToggle.setAttribute('aria-pressed', String(!gallery.hidden))
  drawGallery()
})

const moves = STATES.reduce((n, s) => n + variants(s), 0)
counts.textContent = `${moves} moves · ${WEARABLE.length} hats · ${ITEM_NAMES.length - 1} items · ${SHOE_NAMES.length - 1} shoes`

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

setOutfit(outfit)
start()
