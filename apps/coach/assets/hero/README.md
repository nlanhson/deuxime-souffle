# Welcome hero image

Drop a **portrait-orientation photo of a real coach mid-session** here as `welcome.jpg`
(or `.png`), then enable it in [src/screens/WelcomeScreen.tsx](../../src/screens/WelcomeScreen.tsx):

```ts
const HERO_IMAGE: ImageSourcePropType | null = require('../../assets/hero/welcome.jpg');
```

Guidance (brand rule — real humans, never flat fills or initials avatars):

- **Subject:** a coach working with an older adult in a care-home setting — warm, in-motion, authentic.
- **Orientation / size:** portrait, ≥ 1170×2532 px (covers iPhone Pro at @3x), JPG ~80% quality.
- **Composition:** keep the subject in the **upper two-thirds**; the bottom ~62% is overlaid with the
  ink scrim that seats the headline + CTA, so anything important low in the frame gets darkened.
- **Tone:** dark/ink-friendly so white Anton type stays legible against it.

Set `HERO_IMAGE` back to `null` to render the signature ink→rouge gradient + corner ember glow
fallback instead — no other code change needed.

## Current media

### `welcome.mp4` — the looping hero clip
A 12 s muted loop (720×900, ~0.7 MB) cut from **Deuxième Souffle's own seniors-boxing film**
(self-hosted at `deuxieme-souffle.com/wp-content/uploads/2024/04/…mp4`) — their asset, their rights.
Sequence: fighting stance → red-glove guard → punch → a resident celebrating.

Re-cut recipe (source is 1536×864, 16:9), centre-cropped to 4:5 to match the card:
```bash
ffmpeg -y -ss 11.5 -t 12 -i source.mp4 \
  -vf "crop=690:864:422:0,scale=720:900" \
  -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 30 -preset veryfast -movflags +faststart \
  welcome.mp4
```
Plays muted + looping; never autoplays under `prefers-reduced-motion` (shows the still instead).

### `welcome.jpg` — video poster + reduced-motion still
Senior man training with his coach, from
[Pexels photo 6922177](https://www.pexels.com/photo/a-woman-training-an-elderly-man-6922177/)
(**Pexels licence:** free, no attribution required), 1170×2532. Used as the video's first-paint poster
and the full fallback when motion is reduced or `HERO_VIDEO` is `null`.

> Better long-term: replace the poster with a still pulled straight from `welcome.mp4` so the loading
> frame matches the film exactly — e.g. `ffmpeg -ss 3 -i welcome.mp4 -frames:v 1 welcome.jpg`.
