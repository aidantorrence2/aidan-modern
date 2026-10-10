# Research component: NY + Miami stylists and magazines

Runs every hour in Codex/ChatGPT, and on demand. Every run researches new contacts and sends all qualifying initial introductions found, independently of the approval backlog. The former six-hour cadence is superseded from 10 October 2026. Native Gmail, Slack, GitHub and web tools execute this work; both former Claude routines are paused. Pitches that require the unfinished proposal PDF stay held.

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
3. Every other dated sent log, plus Gmail sent mail and existing drafts to that email/name (case-insensitive),
4. the held-back list: Kaltblut, PAP, Contributor, French Fries, Sicky, Schön!, Teeth, Polyester, The Laterals, Purplehaze, Flanelle; and the 6 Oct pre-batch stylists Scott Shapiro, Rika Watanabe, Morgan Smith, Andrea Messier Cuomo, Steven Lassalle, Ester Gattuso.

## Drafts (htmlBody only, no URLs, no Google redirects)

Write the site as `aidantorrence<span>.com</span>` and Instagram as `@madebyaidan`. Read every saved draft using native Gmail read_email, checking all MIME bodies and quotes for http/https/www URLs, Google redirects, anchors and placeholders. Only initial introductions are automatically sent with send_draft; confirm the SENT result and record IDs. All replies and follow-ups need explicit approval.

- Stylist, subject `Editorial for submission, New York` (or `Miami`):
  `Hi {first},<br><br>I'm Aidan Torrence, an editorial photographer working on 35mm film and digital. I came across {credit}.<br><br>I'll be in New York 21–28 October and I'm putting together a womenswear editorial for magazine submission, aimed at titles like Schön!, STREETS and Lady Gunn. I'm asking the magazine for a pull letter before the shoot so you can request samples from PR. I'd love to have you style it. Happy to build the concept together and cast an agency model around it.<br><br>Would you be open to it?<br><br>My work: aidantorrence<span>.com</span> · @madebyaidan<br>Aidan Torrence · WhatsApp +49 175 8966210`
  For Miami use "I'll be in Miami later this autumn". The pull-letter line was added on 9 Oct after Shandi Alexander said she would only commit once there is an LOR.
- Magazine, subject `Editorial pitch: New York and Miami`:
  `Hi {first or magazine team},<br><br>I'm Aidan Torrence, an editorial photographer working on 35mm film and digital. I'll be in New York 21–28 October 2026 and Miami later this autumn, developing separate womenswear stories. I'm speaking with stylists and planning agency casting; the concept and team are still to be confirmed.<br><br>Would you consider reviewing a concept and moodboard when ready, and could an approved proposal receive a commissioning or pull letter so a stylist can request PR samples? I'm seeking editorial consideration without a publication fee.<br><br>My work: aidantorrence<span>.com</span> · @madebyaidan<br><br>Best,<br>Aidan<br>WhatsApp +49 175 8966210`
  Tailor to the loaded primary policy. Do not promise publication, an attachment, a confirmed team, or exclusive rights to the same story at multiple accepting publications.
  If the magazine only takes finished stories, swap the question for "Would you consider the finished story once it's shot?". Portal-only magazines get no draft; list them in the report.

## Record and report

- Append every lead to `leads.csv` with its status (`sent`, `drafted`, `no-email`, `portal-only`, `skipped-duplicate`) and the Gmail draft ID, update through native GitHub file APIs on `ccr-4510b981-i478hk`, using current blob SHA and preserving previous rows.
- Report: number of intros sent by segment, with names, and any pitches left as drafts.

## 10 October — first native Codex research pass

- Confirmed and sent five magazine introductions: F Word (Bianca Nicole), VESTAL (editorial desk/Kevin Sinclair), The Real (finished-story inquiry only), Glass (Lily Rimmer), Clast (Harry Peg). Loaded official contact/masthead and policy pages; sources and Gmail IDs are in leads.csv and 2026-10-10-codex-intros-sent.csv.
- Live Gmail also showed recent introductions to Chardonnay Taylor and WRPD from another process, not yet in the original CSV. They were deduped and were not sent again. Galore's previously blocked draft was found SENT during the reconciliation; it was not sent or retried by this run.
- No additional NY or Miami stylist send from this research pass. New candidate searches were expanded through recent Nasty, KALTBLUT, Schön!, LADYGUNN, AVESSA and L'Officiel editorial credits and direct portfolios. Strong Miami matches Dana Yurglich and Sofia Daguano were already sent on 6 October; Karo Delgobbo has a 2025 AVESSA credit but no verified published direct email. Alana Erwin has a Nasty credit but her linked contact route returned 404. Other candidates lacked a verified 2024–2026 publication credit, current city base, direct address, or the requested independent/emerging fit. Candidate statuses prevent recycling exhausted names unless new evidence resolves their blocker.
- Gmail body audit: eight pending drafts had quoted mailto anchors or remote signature images. Those were removed from the existing drafts without changing the reply wording or deleting history. Their exact current draft IDs remain in approvals.csv; revised text is presented in Slack. No follow-up or reply was sent by this run.

## 10 October — second native Codex research pass

- Sent and verified eight new introductions: New York stylists Marina Forbatok and Greta Schacht; Miami stylists Jess Maldonado and Hassni Caina; magazines MOVES, Sacrebleu!, Code B and UNICI. Every stored body was read before sending and contained no http/https/www link, Google redirect or placeholder. Gmail SENT IDs are recorded in the dated sent log and leads.csv.
- MOVES and Sacrebleu! were pitched only for later concept/moodboard/team review and a possible pull letter. No unfinished proposal was attached or promised. Code B and UNICI explicitly say they do not issue commissioning letters unless they initiate contact, so those introductions ask only about considering a finished, exclusive and unpublished story.
- Live Gmail showed Paloma Balvin had already received a Miami introduction at 17:44 UTC from another process. It was deduped, logged as sent-observed and not counted among the eight sends.
- Research exclusions were recorded rather than recycled: LO'AMMI charges $10 for pull-letter requests; VIONNE reveals paid publication options after review; LAMODZI's displayed email remained Cloudflare-obfuscated; RUDE's contribution page showed a 2019 deadline; VOL.UP.2 requires a current theme and a proposal attachment that is not ready.
- No new campaign reply, delivery failure or Slack approval appeared during reconciliation. The live approval queue remains 48: seven replies, one permission-blocked Tank re-pitch, and forty magazine follow-ups. The thirteen complete-proposal pitches remain separately held.

- MOVES returned an automated receipt immediately after sending, stating that it aims to respond within seven working days and that no reply within fourteen days means the submission was unsuccessful. The auto-reply was labeled handled; it did not create a reply draft or approval item.

## 10 October — third native Codex research pass

- Sent and verified seven new introductions: New York stylists Savannah Avant and Noël Martin; magazines tmrw, 5ELEVEN, Desnudo, nEU and Asthetik. All stored sent bodies were re-read in Gmail and contained no http/https/www link, Google redirect, placeholder or unfinished-proposal promise.
- Live Gmail showed Mariangel Robles had already received a Miami introduction at 17:43 UTC from another process. It was deduped, recorded as sent-observed and not counted among the seven sends.
- MOOD and MITH were newly researched with clean exact-email dedupe checks. Gmail's safety layer blocked the send because it matched similar legacy text in the campaign log. Both inspected, link-free drafts were preserved and added to approvals; neither was retried.
- A new reply arrived from Li, a Miami stylist: she is open to advance planning and asked whether there is a budget. A truthful in-thread draft says the editorial is unpaid, there is no stylist-fee budget, a pull letter is being pursued for PR samples, and Miami dates remain unconfirmed. It remains unsent for approval.
- Current policy checks were respected: 5ELEVEN does not issue recommendation letters to first-time contributors; Desnudo and nEU require finished exclusive/unpublished work. Those titles were asked only about finished-story consideration. tmrw and Asthetik were asked whether they would review a concept/moodboard and issue a pull letter if commissioned; no proposal was attached or promised.
- Additional researched leads without a verified direct email were logged instead of recycled: India Reed, Karo Delgobbo and Sophia Lenore. The live approval queue is now 51: eight replies, three permission-blocked intros and forty magazine follow-ups. Thirteen proposal-dependent pitches remain held separately.
