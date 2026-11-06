# Clawd

Clawd, the little block-character companion from the `clawd-status` Claude Code mod, on a web page.

This is an unofficial fan project and is not affiliated with or endorsed by Anthropic. Clawd and Claude are Anthropic's.

- `/` shows Clawd in every state it has (idle, thinking, running a tool, needs you, done, stopped). Click one to see another move. Dress it with a hat, something to hold, and shoes; the outfit is remembered in the browser.
- `/random` shows one big random Clawd that rerolls its mood, move and outfit every few seconds, with a row of small ones underneath.

The animation logic in `src/clawd.ts` is a straight port of the mod's `hooks/clawd.ts` plus extra moves and costumes. `src/outfit.ts` adds hand-held items and footwear on top.

## Develop

```sh
npm install
npm run dev      # local server
npm test         # vitest
npm run build    # static output in dist/
```

## Deploy

The site is static. On Vercel the Vite preset builds it as is; `vercel.json` only turns on clean URLs so `/random` works without `.html`.

## License

MIT. See `LICENSE`.
