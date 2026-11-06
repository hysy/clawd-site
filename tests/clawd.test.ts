import { describe, expect, test } from 'vitest'

import type { SessionStatus } from '../src/types'
import {
  COSTUMES,
  COSTUME_NAMES,
  STALE_MS,
  TOOL_KINDS,
  costumeFor,
  dressed,
  elapsed,
  frame,
  hatRow,
  live,
  offset,
  pickCostume,
  portrait,
  toolKind,
} from '../src/clawd'

const base: SessionStatus = { id: 'a', name: 'ehdk', state: 'thinking', detail: '', since: 0, heartbeat: 0 }

describe('clawd', () => {
  const STATES = ['idle', 'thinking', 'tool', 'waiting', 'done', 'error'] as const
  const TOOLS = ['Bash', 'Read', 'Edit', 'WebFetch', 'Agent', 'mcp__datadog__x', 'Skill', 'Other']
  const SEEDS = Array.from({ length: 16 }, (_, i) => i)
  const TICKS = Array.from({ length: 48 }, (_, i) => i)

  test('every frame of every animation is four 9-column rows within the sway range', async () => {
    for (const state of STATES)
      for (const seed of SEEDS)
        for (const tool of TOOLS)
          for (const t of TICKS) {
            const rows = frame(state, t, tool, seed)
            expect(rows.length).toBe(4)
            for (const r of rows) expect([...r].length).toBe(9)
            const o = offset(state, t, tool, seed)
            expect(o >= 0 && o <= 9).toBe(true)
          }
  })

  test('every animation moves between ticks', async () => {
    for (const state of STATES)
      for (const seed of SEEDS)
        for (const tool of TOOLS) {
          const looks = new Set(TICKS.map(t => frame(state, t, tool, seed).join('\n') + offset(state, t, tool, seed)))
          expect(looks.size).toBeGreaterThan(1)
        }
  })

  test('each state plays more than one animation and each tool kind its own', async () => {
    for (const state of ['thinking', 'waiting', 'done', 'error'] as const) {
      const looks = new Set(SEEDS.map(seed => TICKS.map(t => frame(state, t, '', seed).join('')).join('|')))
      expect(looks.size).toBeGreaterThan(2)
    }
    const tools = new Set(TOOLS.map(tool => TICKS.map(t => frame('tool', t, tool).join('')).join('|')))
    expect(tools.size).toBe(TOOL_KINDS.length)
    const idle = new Set(SEEDS.map(seed => TICKS.map(t => frame('idle', t, '', seed).join('')).join('|')))
    expect(idle.size).toBeGreaterThan(2)
  })

  test('tools map to their kind', async () => {
    expect(toolKind('Bash')).toBe('shell')
    expect(toolKind('Grep')).toBe('search')
    expect(toolKind('mcp__serena__find_symbol')).toBe('search')
    expect(toolKind('Write')).toBe('write')
    expect(toolKind('WebSearch')).toBe('web')
    expect(toolKind('Agent')).toBe('team')
    expect(toolKind('mcp__slack__send')).toBe('mcp')
    expect(toolKind('Whatever')).toBe('gear')
  })

  test('live drops ended and stale sessions and orders by start', async () => {
    const now = 100_000
    const list = live(
      [
        { ...base, id: 'late', since: 50, heartbeat: now },
        { ...base, id: 'early', since: 10, heartbeat: now },
        { ...base, id: 'gone', state: 'ended', heartbeat: now },
        { ...base, id: 'stale', heartbeat: now - STALE_MS - 1 },
      ],
      now,
    )
    expect(list.map(s => s.id)).toEqual(['early', 'late'])
  })

  test('every costume dresses every state as five 9-column rows with the hat above the body', async () => {
    for (const name of COSTUME_NAMES) {
      for (const state of STATES) {
        for (const seed of [0, 1, 2, 3]) {
          for (const t of [0, 1, 2, 3, 4, 5, 34, 35]) {
            const rows = dressed(state, t, name, 'Bash', seed)
            expect(rows.length).toBe(5)
            for (const r of rows) expect([...r].length).toBe(9)
            const c = COSTUMES[name]
            const h = hatRow(state, t, 'Bash', seed)
            const hat = t % 2 === 1 && c.alt !== undefined ? c.alt : c.hat
            // the hat row may be cut at the left edge as Clawd walks off
            if (h >= 0) expect(hat.includes(rows[h].trim())).toBe(true)
            if (c.alt !== undefined) expect([...c.alt].length).toBe(9)
          }
        }
      }
    }
  })

  test('a session keeps the same costume and sessions vary', async () => {
    expect(costumeFor('abc')).toBe(costumeFor('abc'))
    const seen = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(costumeFor))
    expect(seen.size).toBeGreaterThan(1)
    expect(seen.has('none')).toBe(false)
  })

  test('no two costumes look the same', async () => {
    const looks = COSTUME_NAMES.map(n => `${COSTUMES[n].hat}|${COSTUMES[n].face ?? ''}`)
    expect(new Set(looks).size).toBe(COSTUME_NAMES.length)
    expect(COSTUME_NAMES.length).toBeGreaterThan(60)
  })

  test('pickCostume avoids costumes other sessions wear until none is left', async () => {
    const taken: string[] = []
    for (let i = 0; i < COSTUME_NAMES.length - 1; i++) {
      const c = pickCostume(`s${i}`, taken)
      expect(taken.includes(c)).toBe(false)
      expect(c).not.toBe('none')
      taken.push(c)
    }
    expect(pickCostume('extra', taken)).not.toBe('none')
    expect(pickCostume('x', [], () => 0.999)).not.toBe('none')
    expect(pickCostume('x', ['crown'], () => 0)).not.toBe('crown')
  })

  test('every costume has a two-row 9-column portrait', async () => {
    for (const name of COSTUME_NAMES) {
      for (const t of [0, 1]) {
        const rows = portrait(name, t)
        expect(rows.length).toBe(2)
        for (const r of rows) expect([...r].length).toBe(9)
      }
    }
  })

  test('some animations spin round to the back and flip upside down with the hat below', async () => {
    const seeds = Array.from({ length: 12 }, (_, i) => i)
    const states = ['thinking', 'waiting', 'done', 'idle'] as const
    let back = false
    let flipped = false
    for (const state of states)
      for (const seed of seeds)
        for (const t of TICKS) {
          const rows = dressed(state, t, 'shades', '', seed)
          if (rows.includes(' ▐█████▌ ') && !rows.includes(COSTUMES.shades.face ?? '')) back = true
          if (hatRow(state, t, '', seed) === 4) {
            flipped = true
            expect(rows[4]).toBe(COSTUMES.shades.hat)
            expect(/[▘▝]/.test(rows[1])).toBe(false)
          }
        }
    expect(back).toBe(true)
    expect(flipped).toBe(true)
  })

  test('spins go both ways and a headspin turns while upside down', async () => {
    const turns = new Set<string>()
    let headspin = false
    for (const state of ['thinking', 'done'] as const)
      for (let seed = 0; seed < 12; seed++)
        for (let t = 0; t < 40; t++) {
          const rows = frame(state, t, '', seed)
          if (rows[1] === '  ▐██▛▜▌ ') turns.add('right')
          if (rows[1] === ' ▐▛▜██▌  ') turns.add('left')
          if (hatRow(state, t, '', seed) === 4 && rows[3] === '   ▐█▟▌  ') headspin = true
        }
    expect([...turns].sort()).toEqual(['left', 'right'])
    expect(headspin).toBe(true)
  })

  test('Clawd falls in, rises up, swoops in diagonally and cartwheels both ways', async () => {
    let fell = false, rose = false, diagonal = false, cw = false, ccw = false
    for (const state of ['waiting', 'done', 'idle', 'error', 'thinking'] as const)
      for (let seed = 0; seed < 16; seed++)
        for (let t = 0; t < 88; t++) {
          const rows = frame(state, t, '', seed)
          const o = offset(state, t, '', seed)
          // only the bottom of Clawd showing at the top: falling in
          if (rows[0].trim() !== '' && rows.slice(1).every(r => r.trim() === '')) fell = true
          // only the face showing at the bottom: rising up
          if (rows[3] === ' ▐▛███▜▌ ' && rows.slice(0, 3).every(r => r.trim() === '' || r.includes('?'))) rose = true
          if (o >= 4 && hatRow(state, t, '', seed) === -1) diagonal = true
          if (rows.includes('  ▀██▙█  ')) cw = true
          if (rows.includes('  █▟██▀  ')) ccw = true
        }
    expect([fell, rose, diagonal, cw, ccw]).toEqual([true, true, true, true, true])
  })

  test('Clawd runs off the right edge, walks in from the distance, vanishes, goes flat and gets dizzy', async () => {
    let offRight = false, far = false, sparkle = false, flat = false, dizzy = false, sneeze = false
    for (const state of ['waiting', 'done', 'idle', 'error', 'thinking'] as const)
      for (let seed = 0; seed < 32; seed++)
        for (let t = 0; t < 92; t++) {
          const rows = frame(state, t, '', seed)
          const o = offset(state, t, '', seed)
          // cut off by the right edge: the figure ends past column 18
          if (o === 9 && rows.some(r => r.startsWith('   ') && r.trim() !== '' && !r.endsWith(' '))) offRight = true
          if (rows.includes('   ▟█▙   ') && hatRow(state, t, '', seed) === -1) far = true
          if (rows.includes(' ✦     ✧ ')) sparkle = true
          if (rows[3] === '▟▙▄███▄▟▙') flat = true
          if (rows.includes(' ▐▚███▞▌ ')) dizzy = true
          if (rows[0].includes('CHOO!')) sneeze = true
        }
    expect([offRight, far, sparkle, flat, dizzy, sneeze]).toEqual([true, true, true, true, true, true])
  })

  test('elapsed reads as seconds then minutes', async () => {
    expect(elapsed(42_000)).toBe('42s')
    expect(elapsed(125_000)).toBe('2m05')
  })
})
