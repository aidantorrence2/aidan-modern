# Research component: NY + Miami stylists and magazines

Runs every 6 hours as part of the hourly outreach check (the first run after 00:00, 06:00, 12:00 and 18:00 UTC), and on demand. It finds new people to pitch and sends their intros automatically (see the send rules in `README.md`); pitches that need the proposal PDF stay as drafts.

## Segments and end dates

| Segment | Per run | Research until |
|---|---|---|
| New York stylists | up to 5 new leads | 18 Oct 2026 (too late to arrange after that) |
| Miami stylists | up to 5 new leads | 20 Nov 2026 |
| Magazines (US + international independents) | up to 5 new leads | 20 Nov 2026 |

## What counts as a lead

- Stylists: emerging-to-mid-level womenswear editorial stylists or fashion editors, currently based in the city (site or bio says so), with a 2024–2026 credit in an independent or print fashion title. Skip celebrity stylists at top agencies.
- Magazines: priority goes to titles that issue pull letters (commission letters) for approved pitches before the shoot, since the stylists need them to borrow samples from PR. They must publish fashion editorials from independent photographers, not be pay-to-publish, and have a named contact or submissions address. Record their rules: whether they issue pull letters, what the proposal needs, pitch before the shoot or finished only, exclusivity, themes, deadlines and portal. Finished-only titles (BASIC says no pull letters) are a secondary submission track.
- Every lead needs an email seen on a page that was actually loaded (own site, agency roster, masthead, contact or submissions page, published interview). Never guess an email. Leads without one go in `leads.csv` with status `no-email` and their Instagram handle.

## Dedupe before drafting

A lead is skipped if its email, or the person or magazine name, already appears in:
1. `2026-10-06-ny-miami-sent.csv` (the 89 sent on 6 Oct),
2. `leads.csv` (every lead from earlier research rounds),
3. Gmail: `in:sent to:<email>` or any existing draft to that address,
4. the held-back list: Kaltblut, PAP, Contributor, French Fries, Sicky, Schön!, Teeth, Polyester, The Laterals, Purplehaze, Flanelle; and the 6 Oct pre-batch stylists Scott Shapiro, Rika Watanabe, Morgan Smith, Andrea Messier Cuomo, Steven Lassalle, Ester Gattuso.

## Drafts (htmlBody only, no URLs, no Google redirects)

Write the site as `aidantorrence<span>.com</span>` and Instagram as `@madebyaidan`. Check every draft with get_draft for `google.com/url` or `http` before reporting it.

- Stylist, subject `Editorial for submission, New York` (or `Miami`):
  `Hi {first},<br><br>I'm Aidan Torrence, an editorial photographer working on 35mm film and digital. I came across {credit}.<br><br>I'll be in New York later this month and I'm putting together a womenswear editorial for magazine submission, aimed at titles like Schön!, STREETS and Lady Gunn. I'm asking the magazine for a pull letter before the shoot so you can request samples from PR. I'd love to have you style it. Happy to build the concept together and cast an agency model around it.<br><br>Would you be open to it?<br><br>My work: aidantorrence<span>.com</span> · @madebyaidan<br>Aidan Torrence · WhatsApp +49 175 8966210`
  For Miami use "I'll be in Miami later this autumn". The pull-letter line was added on 9 Oct after Shandi Alexander said she would only commit once there is an LOR.
- Magazine, subject `Editorial pitch: New York and Miami`:
  `Hi {first or "{magazine} team"},<br><br>I'm Aidan Torrence, an editorial photographer working on 35mm film and digital: aidantorrence<span>.com</span><br><br>I'm shooting two fashion stories this autumn, one in New York and one in Miami, each with a local stylist and an agency model. I'd like to shoot one of them for {magazine}, exclusive and unpublished.<br><br>I have a stylist interested in each city. If the concept suits you, could you provide a pull letter so the stylist can request samples from PR? I'll send the concept and moodboard first, and if you're working to a theme I'd shoot to it.<br><br>Best,<br>Aidan Torrence<br>Instagram: @madebyaidan<br>WhatsApp: +49 175 8966210`
  If the magazine only takes finished stories, swap the question for "Would you consider the finished story once it's shot?". Portal-only magazines get no draft; list them in the report.

## Record and report

- Append every lead to `leads.csv` with its status (`sent`, `drafted`, `no-email`, `portal-only`, `skipped-duplicate`) and the Gmail draft ID, then commit and push to `ccr-4510b981-i478hk`.
- Report: number of intros sent by segment, with names, and any pitches left as drafts.
