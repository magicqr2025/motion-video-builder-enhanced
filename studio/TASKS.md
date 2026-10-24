# MotionStudio: task list for later development

Goal: one dashboard where everything is decided before and right after the concept, so a video comes out very good in one go, fast and cheap
(few tokens). Update this file as items are done: tick the box and add the date and commit.

## State of the work (as of 2026-10-22)

Built and committed (`d2708a9`): Text, Style, Audio and Background tabs; `audio.json` / `style.json` for the three existing videos.

Built, **not committed yet** (Phase 1 and 2): Look & feel step, finishing layer, built-in sound effects, effects kit, kit demo.

| Piece | Where |
|---|---|
| Look & feel options, bundles, prompt text | `studio/server/look.mjs` |
| Look & feel endpoints (`PUT /look`, `POST /look/apply`), `syncLook` | `studio/server/index.mjs` |
| Look & feel board (CSS demos) | `studio/web/app.js` (`renderLook`), `studio/web/look.css` |
| Finishing layer (grade, vignette, grain, leaks, motion blur, sfx) | `magicbolt-reel/src/studio/StudioLook.tsx`, wired by `studio/server/remotion.mjs` `writeRegistry` |
| Built-in sound effects | `studio/bin/make-sfx.mjs` (`*.wav` is git-ignored, the server regenerates them at start) |
| Effects kit and its guide for Claude | `magicbolt-reel/src/studio/kit/` (`KIT.md`) |
| Kit gallery composition | `magicbolt-reel/src/studio/kit-demo/` (`Studio-kit-demo`) |
| Prompts (SYSTEM, concepts, build, audio, style, background, look) | `studio/server/prompts.mjs` |

## Do first (verification of what is already built)

- [x] **Commit Phase 1 and 2.** (2026-10-22, `c1f3018`) Left `MotionStudio.cmd` and `tutorial-animated-screens-2/concepts.json` out as noted. `@remotion/motion-blur` confirmed installed.
- [x] **Automated check of the server and build** (2026-10-22): `node --check` on every changed/new server file; `tsc --noEmit` on `magicbolt-reel` (clean); `remotion compositions` resolves everything including `Studio-kit-demo`; live server hit for `GET /api/state`, `GET/PUT /api/projects/:id/look` (bundle+mood change, `look.json` written correctly, reverted after), `PUT /api/projects/:id/style`, and the expected 400s from `/style` and `/background-settings` on projects without those files yet. No bugs found at this level.
- [x] **Click through every new tab in the browser** (2026-10-22, via Claude in Chrome against the live `localhost:4321` server). Checked: Look & feel board on a fresh project (bundles pre-select correctly, level buttons flip Off/Light/Full live, mood dropdown, all 16 option cards from Motion to Sound render with correct labels); Style tab on a rendered project (colour swatches open the picker, live preview panel updates, Reset colours present); Audio tab's "make audio editable" gate; Background tab's checkboxes (Glossy 3D icons / Sparkles / Gradient blobs / Floating shapes / Moving grid toggle instantly) and the "Add background objects" form. No console errors on load or across tab switches. **Not done**: actually pressing "Generate concepts", "Make audio editable" or "Add background objects" — those start a real Claude run (cost), left for a deliberate test run.
- [ ] **A real end-to-end run with a new project:** Brief, Look & feel (e.g. Premium glossy), Concepts, Approve, Build. Check that Claude reads `kit/KIT.md`, uses kit components with the right levels, and that concept stills show the chosen look. Record token/cost compared with a run without the kit.
- [ ] **Time a full-length render with motion blur** (Light and Full) and note the multiplier. Decide whether Full should be limited (fewer samples) or shown with a time warning on the card.
- [ ] **Background request, first real run.** Confirm Claude creates `Background.tsx` + `background.json` and that the on/off, amount and speed controls actually change the objects in the preview. If not, adjust the prompt in `backgroundPrompt`. Consider telling it to use the kit's `Particles` for the sparkle/shape cases.
- [ ] **Try the Look layer on all existing videos** (open each, pick a bundle, render a draft and a final). Confirm sound effects land on scene changes and nothing breaks in `lead-center-loop` and the tutorial video.

## Next phase: cut tokens, cost and waiting

1. [ ] **Model per step.** Setting for concepts / full build / small edits (e.g. cheaper model for concepts and edits, strongest for the build). Today it is one `STUDIO_MODEL` / Claude Code default. Touches `studio/server/agent.mjs`, `settings.mjs`, the AI card on the home page.
2. [ ] **Brief completeness check** before "Generate concepts": list what is missing (voiceover, logo, CTA, script, language) and a readiness score, so there are no "please add X" rounds.
3. [ ] **Cost estimate before each run and a running total.** `p.cost` already tracks usage. Show an estimate per step (concepts, build, apply-changes) and warn on large ones.
4. [ ] **Script-first storyboard.** Claude writes the scene list and timing as plain text; user approves or edits it before any visuals are built. Cheaper than rebuilding visuals.
5. [ ] **Smaller check images.** Render check frames at half size and look at fewer of them (images cost tokens). Keep full size only for final review.
6. [ ] **Draft mode.** One switch: low resolution, no motion blur or heavy effects while iterating; full quality only on final render. Part of it exists (draft render = half size and skips blur and sfx via `lookDraft`); extend it to the preview and the check frames.
7. [ ] **Template-driven builds** for repeated formats (tutorial): scenes come from data (JSON list), Claude only writes new scene types.
8. [ ] **Scene library:** save any approved scene and reuse it in the next video.
9. [ ] **Presets carry the look.** "Save as preset" should store the Look & feel levels and the kit usage, so a new project starts with the same look.

## Look & feel improvements

- [ ] Real cached preview frames/clips for options instead of CSS demos (render once from Remotion, reuse; zero tokens afterwards).
- [ ] Stop the live-preview iframe from reloading on every click on the Look tab (only re-render the changed card).
- [ ] **Bloom / glow** (not built: needs a blurred duplicate of the video, which doubles render cost). Find a cheap approach or do it only on a few layers.
- [ ] Depth of field, glass and glow effects as options.
- [ ] Per-scene overrides (e.g. no leak on the CTA scene, more blur on the hook).
- [ ] Output options on the board: 60 fps, 4K.
- [ ] Light leaks and sound effects are placed at scene starts from the storyboard only. Add cue-level sound (cursor click, notification pop) using cue times from `config.ts`.
- [ ] Sound: audio-reactive visuals (`@remotion/media-utils`), word-level music ducking, crossfade when music loops, a bigger built-in effects pack.
- [ ] Optional Lottie / Rive support (needs a library of files the user is allowed to use).
- [ ] Illustrations: UI for the image key, cost shown before generating, a matching icon set per video.

## Effects kit improvements (`magicbolt-reel/src/studio/kit/`)

- [ ] More 3D objects: rupee coin, shield, lock, bell, calendar, rocket. Keep to 1 to 4 WebGL canvases per scene (each is its own canvas).
- [ ] Use `@remotion/transitions` presets or add more transition types; make transitions work on opaque scene backgrounds without the double-text overlap seen mid-transition.
- [ ] Kit still gallery inside the app (so the user sees the real pieces, not just CSS demos).
- [ ] Camera glide helper that takes screenshot crop names, not raw pixels.
- [ ] Spring presets named in the Look board (gentle / bouncy / snappy).
- [ ] `KineticCaptions`: more styles, language support for Hindi/Hinglish fonts, safe-area presets for 9:16.

## Other tabs

- [ ] **Style:** direct logo swap, font choice and caption position/size; derive soft tints and shadows from the palette so a big colour change stays consistent.
- [ ] **Background:** save the first generated layer as a reusable kit piece; scene filter in the controls.
- [ ] **Audio:** waveform display, set the start of the music by clicking a scene, one-click "replace voiceover and re-time" that waits for the transcript.
- [ ] **Text:** warn when a new string is much longer than the old one.

## Housekeeping

- [ ] Automated smoke test for the server endpoints (look, audio, style, background-settings, make-*-editable). So far these were checked by hand with `curl` against a test server on another port.
- [ ] Decide whether `public/sfx/*.wav` should be committed (currently ignored by `*.wav` and regenerated by the server at start).
- [ ] `magicbolt-reel/src/studio/kit-demo` shows up as a folder in Remotion Studio but is not a MotionStudio project; keep it or hide it.
- [ ] Known quirk: an MP3 decoded for analysis shows a click in its first 10 ms; this is the analysis path, not the renders (old renders show the same).
- [ ] README: keep `studio/README.md` in step as features land.

## Known limits (be honest about these in the UI)

- The AI cannot hear sound or watch motion; it checks still frames and measures levels. The user must watch the preview for motion quality.
- Motion blur and 60 fps make renders much slower; they apply only to real final renders, not the live preview, concept stills or draft renders.
- Claude-built options (camera, transitions, objects, actions) cost tokens and depend on Claude's work per video; only the kit makes them cheaper and more consistent.
- Sound effects are original built-in sounds; any other sound files must be ones the user is allowed to use.
