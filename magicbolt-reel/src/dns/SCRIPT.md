# DNS Setup Tutorial — Voiceover Script

Composition: `DnsSetupTutorial` (1920x1080, 2:49). Times are in the edited video.
Pace: calm, about 2.3 words per second. The [pause] marks give the screen time to catch up.
When recorded, save as `public/dns-voiceover.mp3` and set `voiceover` in `src/dns/config.ts`.

| Time | On screen | Voiceover |
|---|---|---|
| 0:00 – 0:05 | Animated MagicBolt logo, "Connect Your Custom Domain" | Let's connect your own domain to MagicBolt, so your clients only ever see your brand. |
| 0:05 – 0:13 | 4 record cards, 5-step flow, "Proxy must be OFF" | You'll add four records: login, qr, app and crm. Each one takes the same five steps. And remember one thing: proxy must be off. |
| 0:13 – 0:25 | Dashboard → Whitelabel → Domain connection | In your MagicBolt dashboard, open Whitelabel, then scroll down to Domain connection. Here you'll see all four records, ready to copy. |
| 0:25 – 0:38 | Record 1/4 · Cloudflare → Add record → CNAME | Now open your domain provider. We're using Cloudflare. Go to DNS, then Records, and click Add record. Set the type to CNAME. |
| 0:38 – 0:53 | Copy the Name "login" | Back in MagicBolt, copy the name from the Customer Login card. That's "login". [pause] Paste it into the Name field. |
| 0:53 – 1:08 | Copy the Target value | Now copy the target value. It's the long address ending in vercel-dns dot com. [pause] Paste it into Target. |
| 1:08 – 1:10 | Proxy widget flips to "DNS only" | Here's the important part. Switch the proxy off, so the cloud turns grey and says "DNS only". |
| 1:10 – 1:15 | "login record added" | Click Save. Your login record is done. |
| 1:15 – 1:19 | "Same steps × 3 more" | Now repeat the same steps for the other three. We'll speed this part up. |
| 1:19 – 1:41 | Record 2/4 · qr (2.5×) | Next is qr, for your QR codes, short links and website. Add a CNAME, copy the name and target, set the proxy to DNS only, and save. |
| 1:41 – 2:09 | Record 3/4 · app (2.5×) | Then app, your branded business software. Same steps: CNAME, name, target. [pause] Proxy off. Save. |
| 2:09 – 2:32 | Record 4/4 · crm (2.5×) | And finally crm, for your CRM and WhatsApp API. Copy, paste, proxy off, and save. That's all four. |
| 2:32 – 2:39 | Summary table + "Save domains" + "few minutes" | All four records are in. Go back to MagicBolt and click Save domains. DNS can take a few minutes to go live, and then everything runs on your domain. |
| 2:39 – 2:49 | Logo-animation.mp4 (plays as it is) | Your brand, your domain. Need help? Write to contact at magicbolt dot ai. |

## On-screen text (already in the video)

- Captions: these come from `REC_CUES` and `ACT_TEXT`. Change their wording in `src/dns/DnsTutorial.tsx`.
- Cut times, speeds and cue times live in `src/dns/config.ts`.
