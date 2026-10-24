# MotionStudio by MagicBolt.ai

A local web app for making Remotion videos with Claude Code. You give the brief in the browser, Claude
designs concepts as real sample frames, you approve one, and Claude builds the full video with timing
synced to your voiceover. Then you preview and render the MP4.

Any of these starts the app and opens http://localhost:4321 in your browser (Remotion Studio live preview runs on :3100):

- **Open the folder in VS Code.** `.vscode/tasks.json` auto-runs the "MotionStudio" task. VS Code asks once to allow automatic tasks.
- `npm run dev` (or `npm start`) in the repo root. The plain Remotion Studio for the root project is now `npm run dev:remotion`.
- `npm run studio` in `magicbolt-reel/`.
- Double-click `MotionStudio.cmd`.

If the app is already running, starting it again just opens the browser tab. First time only: `cd studio && npm install`.

The app uses your existing Claude Code login, so it needs no API key. Usage counts against your Claude plan.
It only ever uses that local login: `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN` and other provider variables are
stripped before Claude starts, and the studio keeps no AI credentials. Not signed in? Run `claude` and `/login`.

### Starting it as a program (MotionStudio.exe)

`MotionStudio.exe` in the repo root is a small launcher. Double-click it and it starts the studio in the background, opens
it in a full-screen Chrome or Edge window and, when you close that window, stops the studio again (if a render or an AI
task is still running it waits until that is done). It needs Node.js on the PC. The first start installs the packages.
Press F11 to leave full screen, or use the power icon at the top right to quit.

Rebuild it after changing `launcher/MotionStudio.cs`: run `launcher/build-exe.cmd` (uses the C# compiler that ships with Windows).
The exe must stay next to the `studio` folder.

### Signing in

MotionStudio asks for an admin login before it shows anything. There is no sign-up page: admins are kept in
`studio/admins.json` and added from the command line, each with an expiry date. After the expiry date that admin can no
longer sign in, and removing or disabling an admin signs them out straight away. Passwords are saved as salted
hashes, never as text.

```
node studio/bin/admin.mjs add priya --name "Priya Shah" --days 180        (password is generated and shown once)
node studio/bin/admin.mjs add rahul "My-Password-1" --expires 2027-03-31
node studio/bin/admin.mjs list
node studio/bin/admin.mjs expire priya --expires 2027-12-31               (or --days 90 from today)
node studio/bin/admin.mjs passwd priya                                     (new password; or give one)
node studio/bin/admin.mjs disable priya        enable priya        remove priya
```

The server listens on this PC only (`127.0.0.1`). Five wrong passwords lock that username for a minute.

### AI

MotionStudio always uses the Claude Code login on this PC: there is no provider to choose and nothing to connect.
The model for building videos can be picked under **AI** on the home page.

## Flow

1. **Pick a preset** on the home page, or start blank. Presets are looks you've already approved:
   - Tutorial: animated screens, or screen recording
   - Reels: explainer, promo, problem-vs-solution, dark neon, 3D webinar
   - Glossy square loops

   Each preset holds the structure, components and timing method, so you never have to explain the style again.
2. **Brief.** Fill in:
   - idea, audience, CTA, script, language
   - size, fps, length
   - brand kit and colours
   - captions, links, notes

   Drop in voiceover, music, logo, images, footage or reference videos. Voiceovers are transcribed
   automatically (whisper.cpp, word-level timings). Reference videos are turned into frames that Claude can look at.
3. **Concepts.** Claude reads the brief, the preset's reference code, your media and your links. It designs
   2–3 concepts and renders real frames of each one from Remotion. These are the actual look of the final
   video, not mockups.
4. **Approve.** Pick a concept and add notes if you like. Claude builds the full video and writes the
   storyboard with exact scene timing, then renders check frames and reviews them itself.
5. **Preview and render.** The live Remotion Studio preview is embedded. You can render a draft
   (half resolution) or the final MP4 and download it.
6. **Save as preset.** Turns the approved approach into a new preset for next time.

### Look & feel (chosen before the concepts)

The step after Brief. Every option has a small looping sample and an Off / Light / Full level, and there are one-click bundles
(Nothing extra, Clean tutorial, Premium glossy, High-energy reel). The choices are saved on the project, passed to Claude with
the brief (so concept stills and the build include them) and can be changed after the build.
- **Instant** options (motion blur, colour grade, vignette, film grain, light leaks, sound effects) are applied by the app as a
  finishing layer (`StudioLook.tsx`, settings in `src/studio/<project>/look.json`, wired in `registry.tsx`). No Claude run, live in
  the preview. Motion blur and sound effects appear only in real renders (not the preview, concept stills or draft renders).
  Sound effects are original built-in sounds in `magicbolt-reel/public/sfx/` (`node studio/bin/make-sfx.mjs` regenerates them),
  placed at the scene starts from the storyboard.
- **Built by Claude** options (spring physics, camera moves, transitions, 3D objects, illustrations, particles, cursor choreography,
  UI animations, guided focus, kinetic captions) are designed into the video. After the build, changing them shows
  "Apply N changes with Claude", which sends only the difference.
- The option list lives in `studio/server/look.mjs`.
- **Effects kit** (`magicbolt-reel/src/studio/kit/`): the Claude-built options as ready, deterministic components (`SceneSeq` transitions,
  `CameraRig`, `SpringIn`, `Obj3D` coin/bubble/phone/QR card, `Particles`, `CursorPath`, `Toggle`/`CountUp`/`ProgressBar`/`Notification`,
  `Spotlight`, `KineticCaptions`). Claude reads the short `KIT.md` and assembles videos from it instead of writing these each time,
  which saves tokens and keeps quality consistent. Composition `Studio-kit-demo` in Remotion Studio shows every piece.

### Text and Audio tabs (edit without a Claude run)

- **Text** edits `src/studio/<project>/text.json` (every on-screen string).
- **Style** edits the brand palette in `src/studio/<project>/style.json` (colour pickers, saved as you pick, with Reset). `config.ts`
  reads the colours from it. Logo, fonts and captions go through a "Ask Claude" box because they change the video's design.
- **Audio** edits `src/studio/<project>/audio.json`: swap the voiceover or music (upload or pick from `magicbolt-reel/public/`),
  volume, mute, start time, trim (play from / until), music fade in/out, loop, and "lower under the voiceover" with its level.
  `registry.tsx` plays this file through `src/studio/StudioAudio.tsx` for the project's main composition, so videos must not
  render their own `<Audio>`. "Make audio editable" creates the file for a video that has none (if the video plays its own sound,
  Claude moves it over first). Replacing the voiceover does not move the scenes; the tab offers "Re-sync timing with Claude".

- **Background** is a request form for a video whose background is flat or still: pick floating objects (glossy icons, sparkles,
  blobs, shapes, grid) or describe your own, plus placement, intensity, colours and scenes. Claude adds them as a separate
  `Background.tsx` layer (constants at the top to tweak), leaves scenes that already move alone, and renders check frames.

The chat panel on the right is always open. Use it for questions or changes, for example
"make scene 3 longer" or "use the gold for the CTA".

## Where things live

| What | Where |
|---|---|
| Video code | `magicbolt-reel/src/studio/<project>/` (compositions `Studio-<project>` and `Studio-<project>-concepts`) |
| Uploaded media | `magicbolt-reel/public/studio/<project>/` |
| Brief, concepts, storyboard, stills, renders, chat log | `studio/data/<project>/` |
| Presets | `studio/presets/*.json`. Edit them or add your own. |
| Brand kits | `studio/brands/*.json` |
| Tools Claude runs | `studio/bin/` (samples, still, transcribe, reference, registry) |

The studio's videos also appear in the normal Remotion Studio (`magicbolt-reel`, `npm run dev`) in
`studio-<project>` folders. You can keep editing any project in VS Code with Claude Code as usual.

## Settings (environment variables)

- `PORT`: app port (default 4321). The launcher exe expects 4321.
- `HOST`: address to listen on (default `127.0.0.1`, this PC only; `0.0.0.0` shares it on the network, the sign-in still applies)
- `REMOTION_STUDIO_PORT`: live preview port (default 3100)
- `STUDIO_MODEL`: Claude model for the agent (default is your Claude Code default)
- `NO_REMOTION_STUDIO=1`: don't start the live preview
- `OPENAI_API_KEY`: lets Claude generate illustration art with `scripts/generate-image.mjs`

The agent runs with edit and command permissions, but writes are limited to `magicbolt-reel/` and
`studio/data` and `studio/presets`. Destructive commands are blocked.
