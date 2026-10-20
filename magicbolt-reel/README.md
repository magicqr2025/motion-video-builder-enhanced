# MagicBolt Reel — Remotion project (1080x1920, 30fps, 33s)

## Run
npm install
npm run dev        # opens Remotion Studio (live preview + timeline)
npm run render     # exports out/MagicBolt_Reel.mp4

## Where to edit
src/config.ts            <- 90% of edits: text, timings (seconds), colors, services, clients, URL, CTA
src/scenes/Scene1-8.tsx  <- layout / animation of each scene
src/components/kit.tsx   <- easing, text pop-in, cards, pills, scene transition
src/components/graphics.tsx <- icons, logo, cursor, background blobs
public/                  <- voiceover.wav, sfx.wav, fonts (replace freely)

## Common edits
- Change any text      -> edit the string in config.ts
- Shift an animation   -> change its time number in config.ts (seconds, synced to VO)
- New voiceover        -> replace public/voiceover.wav, then adjust SCENES + word times
- Add music            -> put music.mp3 in public/, set VIDEO.music = 'music.mp3'
- Real logo            -> put logo.png in public/, swap <Bolt/> in graphics.tsx Logo with
                          <Img src={staticFile('logo.png')} style={{width: tile*0.8}} />
- Remove SFX           -> VIDEO.sfx = ''
