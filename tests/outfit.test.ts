import { describe, expect, test } from 'vitest'

import { COSTUME_NAMES, dressed } from '../src/clawd'
import { ITEMS, ITEM_NAMES, SHOES, SHOE_NAMES, isOutfit, randomOutfit, render, trimFor } from '../src/outfit'

const STATES = ['idle', 'thinking', 'tool', 'waiting', 'done', 'error'] as const

describe('outfit', () => {
  test('every item and pair of shoes keeps every frame at five 9-column rows', () => {
    for (const item of ITEM_NAMES)
      for (const shoes of SHOE_NAMES)
        for (const state of STATES)
          for (const seed of [0, 1, 2, 3, 4, 5])
            for (const t of [0, 1, 2, 3, 4, 5, 6, 7, 34, 35]) {
              const outfit = { costume: 'wizard', item, shoes }
              const rows = render(state, t, outfit, 'Bash', seed)
              expect(rows.length).toBe(5)
              for (const r of rows) expect([...r.map(s => s.text).join('')].length).toBe(9)
              expect(rows.map(r => r.map(s => s.text).join(''))).toEqual(dressed(state, t, 'wizard', 'Bash', seed, trimFor(outfit, t)))
            }
  })

  test('items show in the hands and shoes on the feet when Clawd stands facing front', () => {
    // thinking seed 0 is the walking-with-dots loop: standing, facing front every tick
    for (const item of ITEM_NAMES.filter(n => n !== 'none')) {
      const rows = render('thinking', 0, { costume: 'none', item, shoes: 'none' })
      const arms = rows[3]
      expect(arms.some(s => s.color === ITEMS[item].color)).toBe(true)
    }
    for (const shoes of SHOE_NAMES.filter(n => n !== 'none')) {
      const rows = render('thinking', 0, { costume: 'none', item: 'none', shoes })
      const legs = rows[4]
      expect(legs.some(s => s.color === SHOES[shoes].color)).toBe(true)
      expect(legs.map(s => s.text).join('')).not.toBe('  ▘▘ ▝▝  ')
    }
  })

  test('nothing is held while Clawd is turned away or upside down', () => {
    // the done headspin (seed 5) flips; its flipped frames carry no item color
    const flipped = [3, 4, 5, 6].map(t => render('done', t, { costume: 'none', item: 'sword', shoes: 'boots' }, '', 5))
    for (const rows of flipped) for (const r of rows) for (const s of r) expect(['white', '#A0522D'].includes(s.color)).toBe(false)
  })

  test('no two items or pairs of shoes look the same', () => {
    const items = ITEM_NAMES.map(n => `${ITEMS[n].left ?? ''}|${ITEMS[n].right ?? ''}`)
    expect(new Set(items).size).toBe(ITEM_NAMES.length)
    const shoes = SHOE_NAMES.map(n => Object.values(SHOES[n].map).join(''))
    expect(new Set(shoes).size).toBe(SHOE_NAMES.length)
    for (const n of SHOE_NAMES) for (const g of Object.values(SHOES[n].map)) expect('▘▝▖▗'.includes(g)).toBe(false)
  })

  test('random outfits are valid and never bare-headed', () => {
    for (let i = 0; i < 50; i++) {
      const o = randomOutfit()
      expect(isOutfit(o)).toBe(true)
      expect(o.costume).not.toBe('none')
      expect(COSTUME_NAMES.includes(o.costume)).toBe(true)
    }
    expect(isOutfit({ costume: 'hat-that-does-not-exist', item: 'none', shoes: 'none' })).toBe(false)
    expect(isOutfit(null)).toBe(false)
  })
})
