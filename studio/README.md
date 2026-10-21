# MagicBolt Video Studio

A local web app for making Remotion videos with Claude Code. You give the brief in the browser, Claude
designs concepts as real sample frames, you approve one, and Claude builds the full video with timing
synced to your voiceover. Then you preview and render the MP4.

Any of these starts the app and opens http://localhost:4321 in your browser (Remotion Studio live preview runs on :3100):

- **Open the folder in VS Code.** `.vscode/tasks.json` auto-runs the "Video Studio" task. VS Code asks once to allow automatic tasks.
- `npm run dev` (or `npm start`) in the repo root. The plain Remotion Studio for the root project is now `npm run dev:remotion`.
- `npm run studio` in `magicbolt-reel/`.
- Double-click `Video Studio.cmd`.

If the app is already running, starting it again just opens the browser tab. First time only: `cd studio && npm install`.

The app uses your existing Claude Code login, so it needs no API key. Usage counts against your Claude plan.
It only ever uses that local login: `ANTHROPIC_API_KEY`, `CLAUDE_CODE_OAUTH_TOKEN` and other provider variables are
stripped before Claude starts, and the studio stores no credentials of its own. Not signed in? Run `claude` and `/login`.

### Other AI models

Open **AI model** at the top of the home page to pick who does the work: Claude Code (default), OpenAI, Google Gemini,
OpenRouter, Ollama (local) or any other OpenAI-compatible API. Set the model id and paste an API key (or use
`OPENAI_API_KEY` / `GEMINI_API_KEY` / `OPENROUTER_API_KEY`), then **Test connection**. The key stays on this PC in
`studio/data/settings.json`.

Other models get the same prompts and tools (read and look at images, write, edit, shell, find, search) and the
same safety rules as Claude. The model must support tool calling, and vision to check rendered frames. Weaker or small
local models will struggle with full builds. Each project keeps its own conversation in `data/<project>/agent-session.json`.

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

- `PORT`: app port (default 4321)
- `REMOTION_STUDIO_PORT`: live preview port (default 3100)
- `STUDIO_MODEL`: Claude model for the agent (default is your Claude Code default)
- `NO_REMOTION_STUDIO=1`: don't start the live preview
- `OPENAI_API_KEY`: lets Claude generate illustration art with `scripts/generate-image.mjs`

The agent runs with edit and command permissions, but writes are limited to `magicbolt-reel/` and
`studio/data` and `studio/presets`. Destructive commands are blocked.
