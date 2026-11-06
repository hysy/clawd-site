import { COLORS, COSTUMES, COSTUME_NAMES, dressed, gearRows, hatRow } from './clawd'
import type { Trim } from './clawd'
import type { ClawdState } from './types'

// Something held: one glyph in the left hand, the right, or both. alt swaps in on odd ticks so it moves.
export type Item = { left?: string; right?: string; alt?: { left?: string; right?: string }; color: string }

export const ITEMS: Record<string, Item> = {
  none: { color: 'gray' },
  sword: { right: '†', color: 'white' },
  shield: { left: '▐', color: '#C0A060' },
  staff: { left: '|', color: '#A0522D' },
  wand: { right: '✧', alt: { right: '✦' }, color: 'magenta' },
  torch: { right: '▲', alt: { right: '▴' }, color: 'red' },
  flag: { right: '▶', color: 'red' },
  book: { left: '▮', color: 'blue' },
  coffee: { right: 'U', color: '#A0522D' },
  phone: { right: '▯', color: 'cyan' },
  dumbbells: { left: '●', right: '●', color: 'gray' },
  guitar: { left: '♪', alt: { left: '♫' }, color: '#D2A060' },
  lantern: { right: '◉', alt: { right: '◎' }, color: 'yellow' },
  mic: { right: '♦', color: 'white' },
  pencil: { right: '✎', color: 'yellow' },
  bomb: { left: '●', alt: { left: '✸' }, color: 'red' },
  balloon: { right: '○', color: '#FF69B4' },
  heart: { left: '♥', color: 'red' },
  star: { right: '★', color: 'yellow' },
  saber: { right: '┃', alt: { right: '┇' }, color: 'cyan' },
  rod: { right: '╱', color: '#A0522D' },
  axe: { left: '┣', color: 'gray' },
  trophy: { right: '♛', color: 'yellow' },
  bubbles: { right: 'o', alt: { right: 'O' }, color: 'cyan' },
  fan: { left: '◖', alt: { left: '◗' }, color: '#FF69B4' },
}

// Footwear: each foot glyph is swapped for another.
export type Shoes = { map: Record<string, string>; color: string }

export const SHOES: Record<string, Shoes> = {
  none: { map: {}, color: 'gray' },
  boots: { map: { '▘': '▙', '▝': '▟', '▖': '▙' }, color: '#A0522D' },
  sneakers: { map: { '▘': '▚', '▝': '▞', '▖': '▚' }, color: 'white' },
  skates: { map: { '▘': '▁', '▝': '▁', '▖': '▁' }, color: 'cyan' },
  flippers: { map: { '▘': '◣', '▝': '◢', '▖': '◣' }, color: 'green' },
  heels: { map: { '▘': '▜', '▝': '▛', '▖': '▜' }, color: 'red' },
  socks: { map: { '▘': '▌', '▝': '▐', '▖': '▌' }, color: 'magenta' },
  clogs: { map: { '▘': '▆', '▝': '▆', '▖': '▆' }, color: '#D2A060' },
  springs: { map: { '▘': 'ξ', '▝': 'ξ', '▖': 'ξ' }, color: 'gray' },
  wheels: { map: { '▘': 'o', '▝': 'o', '▖': 'o' }, color: 'gray' },
}

export const ITEM_NAMES = Object.keys(ITEMS)
export const SHOE_NAMES = Object.keys(SHOES)
export const WEARABLE = COSTUME_NAMES.filter(n => n !== 'none')

export type Outfit = { costume: string; item: string; shoes: string }

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)] as T

export function randomOutfit(): Outfit {
  return { costume: pick(WEARABLE), item: pick(ITEM_NAMES), shoes: pick(SHOE_NAMES) }
}

export function isOutfit(o: unknown): o is Outfit {
  if (typeof o !== 'object' || o === null) return false
  const { costume, item, shoes } = o as Record<string, unknown>
  return typeof costume === 'string' && costume in COSTUMES && typeof item === 'string' && item in ITEMS && typeof shoes === 'string' && shoes in SHOES
}

function hands(item: Item, tick: number): { left?: string; right?: string } {
  const alt = tick % 2 === 1 ? item.alt : undefined
  return { left: alt?.left ?? item.left, right: alt?.right ?? item.right }
}

// The rewrites dressed() applies for this outfit: items go where the hands are, shoes where the feet are.
export function trimFor(outfit: Outfit, tick: number): Trim {
  const item = ITEMS[outfit.item] ?? ITEMS.none
  const shoes = SHOES[outfit.shoes] ?? SHOES.none
  const { left, right } = hands(item, tick)
  return {
    arms: row => {
      const c = [...row]
      if (left !== undefined && c[0] !== ' ') c[0] = left
      if (right !== undefined && c[8] !== ' ') c[8] = right
      return c.join('')
    },
    legs: row => [...row].map(ch => shoes.map[ch] ?? ch).join(''),
  }
}

export type Segment = { text: string; color: string }

function split(row: string, glyphs: Set<string>, special: string, base: string): Segment[] {
  const out: Segment[] = []
  for (const ch of row) {
    const color = glyphs.has(ch) ? special : base
    const last = out[out.length - 1]
    if (last !== undefined && last.color === color) last.text += ch
    else out.push({ text: ch, color })
  }
  return out
}

// Five rows of colored segments: the hat in the costume's color, items and shoes in theirs, the rest in the state's.
export function render(state: ClawdState, tick: number, outfit: Outfit, detail = '', seed = 0): Segment[][] {
  const rows = dressed(state, tick, outfit.costume, detail, seed, trimFor(outfit, tick))
  const hat = hatRow(state, tick, detail, seed)
  const gear = gearRows(state, tick, detail, seed)
  const base = COLORS[state]
  const item = ITEMS[outfit.item] ?? ITEMS.none
  const shoes = SHOES[outfit.shoes] ?? SHOES.none
  const { left, right } = hands(item, tick)
  const held = new Set([left, right].filter((g): g is string => g !== undefined))
  const worn = new Set(Object.values(shoes.map))
  return rows.map((row, i) => {
    if (i === hat) return [{ text: row, color: (COSTUMES[outfit.costume] ?? COSTUMES.none).color }]
    if (i === gear.arms && held.size > 0) return split(row, held, item.color, base)
    if (i === gear.legs && worn.size > 0) return split(row, worn, shoes.color, base)
    return [{ text: row, color: base }]
  })
}
