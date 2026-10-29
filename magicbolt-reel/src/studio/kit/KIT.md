# Effects kit (src/studio/kit)

Ready-made, deterministic Remotion pieces for the Look & feel options. **Use these instead of writing your own**; read only this file, not the sources.
`import {…} from '../kit';` (from `src/studio/<project>/`). `level` is the chosen level: 1 = Light, 2 = Full. Skip the module when the option is Off.
Time is seconds on the nearest `<Sequence>` (scene time); at the top level it is video time. Positions are px in the composition (e.g. 1920x1080).
Gallery of everything: compositions `Studio-kit-demo` and `Studio-kit-demo-2` (text, layouts, extra transitions) (`src/studio/kit-demo/Demo.tsx` shows each call).

| Look option | Use | Light (1) / Full (2) |
|---|---|---|
| Scene transitions | `<SceneSeq start dur xfade? type dir first last name>{scene}</SceneSeq>` replaces your Sequence + fade wrapper. `transitionFor(i, level)` gives `{type, dir}` for scene i: `fade` / rotation of `slide, zoom, wipe, flip, blur`. Also by name: `iris, split, shutter, push, glitch, cube` (pass `type`). Scenes still overlap by `xfade` (0.35). | fades / designed rotation |
| Camera moves | `<CameraRig level dur?>` around a scene's content (push-in; Full adds drift). Glide to parts: `keys={[{t, x, y, scale}, …]}` (focus point px + zoom). `<Parallax depth={0..1}>` for layers that drift at different speeds. | slow push-in / push-in + drift |
| Spring physics | `<SpringIn at level from?={{x,y,scale,rotate,opacity}}>` for entrances; `useSpringK(at, level)` for custom use; `stagger(i, base, gap)` for lists. | gentle settle / bouncy |
| Real 3D objects | `<Obj3D kind="coin\|bubble\|phone\|card" x y size at level />` (centre px, transparent canvas, springs in, floats and rotates). Cost: one WebGL canvas each, so use 1-4 per scene. | 1-2 hero objects / many |
| Particles | `<Particles level colors? shapes? seed? avoid?={{x,y,w,h}} />` as a background layer (shapes: sparkle, dot, ring, pill). `avoid` keeps them off the content. | 8 subtle / 24 rich |
| Cursor choreography | `<CursorPath keys={[{t, x, y, click?}, …]} />` glides and clicks with a ripple. `<Cursor />` is the arrow alone. | few key clicks / full click-through |
| UI animations | `<Toggle at />`, `<CountUp to at dur? prefix? suffix? style />`, `<ProgressBar at dur? to? w? />`, `<Notification at title sub? hold? icon? />`. | few / throughout |
| Guided focus | `<Spotlight level keys={[{t, x, y, w, h}, …]} />` above the content it explains: dims the rest, glowing outline glides between rects. | slight dim / strong dim |
| Kinetic captions | `<KineticCaptions words level y? accent? color? size? />` at the TOP LEVEL of the video. `words` = `import WORDS from '<voiceover>.words.json'` → `WORDS.words` (`{text,start,end}`; transcripts are already in `public/studio/<id>/`). Pick `color` for contrast with the background. | clean pill, 4 words / big kinetic, 3 words |
| Text animation | `<TextReveal text at variant? level? gap? style />` variants: `mask` (lines rise out of a mask), `words`, `letters` (springy), `blur`, `scramble`, `type` (typewriter), `rise`. Font size/weight/colour go in `style`. Time is scene time. | gentle / bouncy |
| Layouts | `<SplitLayout left right ratio? at level />`, `<BentoGrid cells={[{col,row,colSpan?,rowSpan?,node}]} cols rows at step level />` (nodes fill their cell, `height:'100%'`), `<CardStack cards w h x y hold level />`, `<Marquee items itemW y speed />`. | gentle / bouncy |
| Polish | `<LightSweep at dur? repeatEvery? />` above content: a glint across it. | any |

## Rules
- The user's picks and reference tags arrive as a "Motion & layout direction" block (names from studio/catalog/motion-catalog.json). Each catalog id maps to a piece above; use it as written and vary the rest so no two neighbouring scenes repeat.
- Illustrations are not in the kit: reuse art in `public/` and the project's own parts; generate new art only if `OPENAI_API_KEY` is set.
- Instant options (motion blur, grade, vignette, grain, light leaks, sound effects) are applied by the app: never build them.
- Keep one `config.ts` for timings; pass scene times to `SceneSeq`; put every string in `text.json`.
- If something you need is missing from the kit, write it in the project folder (not in the kit), and say so in your reply.
