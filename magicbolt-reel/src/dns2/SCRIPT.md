# White Label Setup: Branding, Domain Connect, DNS Setup (voiceover script)

Composition: `DnsSetupAnimated`. Record each numbered line with a short breath, about half a second, between lines.
The video follows where each line starts. After recording, those start times go into `VO_MEASURED` in `config.ts`.
The lines below are the same as `LINES` in `config.ts`.

1. Welcome! In this video we'll set up your white label in three parts: branding, domain connect, and DNS setup.
2. In your MagicBolt dashboard, your setup checklist is complete, so open Whitelabel from the menu.
3. First, fill in your branding details: brand name, website, mail ID, and your support contacts.
4. Your clients see these details everywhere, so click Save changes.
5. Next, scroll down to Custom domain. It starts empty, so you can choose any subdomain for each application.
6. Every supporting application connects to its own branded address: customer for client login, qr for your QR suite and website, business for business software, and crm for CRM and WhatsApp.
7. As you enter each subdomain, MagicBolt shows the DNS record to add. Click Save domains.
8. Now let's set up DNS. Open your domain provider; we're using Cloudflare.
9. Go to DNS, then Records, click Add record, and set the type to CNAME.
10. Back in MagicBolt, copy the name from the Customer Login card, that's customer, and paste it into the Name field.
11. Then copy the target value and paste it into Target.
12. Here's the important part: switch the proxy off, so the cloud turns grey and says DNS only.
13. Click Save, and your customer record is done.
14. Now repeat the same steps for qr, business, and crm.
15. qr: add a CNAME, paste the name and target, proxy off, and save.
16. business: same steps. CNAME, name, target, proxy off, save.
17. And crm: copy, paste, proxy off, and save.
18. All four records are added. DNS changes can take two to eight hours to reflect.
19. After that, start sharing your subdomains, and your clients can log in with their client ID and password.
20. Your brand, your domain. Need help? Write to contact at magicbolt dot ai.

## One line

Welcome! In this video we'll set up your white label in three parts: branding, domain connect, and DNS setup. In your MagicBolt dashboard, your setup checklist is complete, so open Whitelabel from the menu. First, fill in your branding details: brand name, website, mail ID, and your support contacts. Your clients see these details everywhere, so click Save changes. Next, scroll down to Custom domain. It starts empty, so you can choose any subdomain for each application. Every supporting application connects to its own branded address: customer for client login, qr for your QR suite and website, business for business software, and crm for CRM and WhatsApp. As you enter each subdomain, MagicBolt shows the DNS record to add. Click Save domains. Now let's set up DNS. Open your domain provider; we're using Cloudflare. Go to DNS, then Records, click Add record, and set the type to CNAME. Back in MagicBolt, copy the name from the Customer Login card, that's customer, and paste it into the Name field. Then copy the target value and paste it into Target. Here's the important part: switch the proxy off, so the cloud turns grey and says DNS only. Click Save, and your customer record is done. Now repeat the same steps for qr, business, and crm. qr: add a CNAME, paste the name and target, proxy off, and save. business: same steps. CNAME, name, target, proxy off, save. And crm: copy, paste, proxy off, and save. All four records are added. DNS changes can take two to eight hours to reflect. After that, start sharing your subdomains, and your clients can log in with their client ID and password. Your brand, your domain. Need help? Write to contact at magicbolt dot ai.
