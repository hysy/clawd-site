export type ClawdState = 'idle' | 'thinking' | 'tool' | 'waiting' | 'done' | 'error' | 'ended'

export type SessionStatus = {
  id: string
  name: string
  state: ClawdState
  detail: string
  since: number
  heartbeat: number
  costume?: string
  started?: number
}
