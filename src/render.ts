import { offset } from './clawd'
import { render } from './outfit'
import type { Outfit } from './outfit'
import type { ClawdState } from './types'

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
export const css = (c: string) => TERM[c] ?? c

// A <pre> holding one Clawd, redrawn each tick.
export class ClawdView {
  readonly el: HTMLPreElement
  private rows: HTMLSpanElement[]

  constructor() {
    this.el = document.createElement('pre')
    this.el.className = 'clawd'
    this.rows = Array.from({ length: 5 }, () => {
      const span = document.createElement('span')
      this.el.append(span, '\n')
      return span
    })
  }

  draw(state: ClawdState, tick: number, outfit: Outfit, detail = '', seed = 0) {
    const pad = ' '.repeat(offset(state, tick, detail, seed))
    render(state, tick, outfit, detail, seed).forEach((segments, i) => {
      const row = this.rows[i]
      row.replaceChildren(pad)
      for (const s of segments) {
        const span = document.createElement('span')
        span.textContent = s.text
        span.style.color = css(s.color)
        row.append(span)
      }
    })
  }
}
