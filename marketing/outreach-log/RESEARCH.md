# Research component: NY + Miami stylists and magazines

## Current confirmed availability and collaboration terms — 10 October 2026

- New York: 21–28 October 2026.
- Miami: later this autumn; exact dates remain unconfirmed for this stylist/magazine campaign. Do not import dates from separate celebrity or portrait campaigns.
- Stylist collaborations are unpaid.
- No magazine pull letter or publication backing has been secured. Do not describe either as confirmed.
- These current facts supersede older availability wording in historical notes and templates. Replies and follow-ups still require approval.

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
  `Hi {first},<br><br>I'm Aidan Torrence, an editorial photographer working on 35mm film and digital. I came across {credit}.<br><br>I'll be in New York 21–28 October and I'm putting together an unpaid womenswear editorial collaboration for magazine submission, aimed at titles like Schön!, STREETS and Lady Gunn. I'm asking the magazine for a pull letter before the shoot so you can request samples from PR. I'd love to have you style it. Happy to build the concept together and cast an agency model around it.<br><br>Would you be open to it?<br><br>My work: aidantorrence<span>.com</span> · @madebyaidan<br>Aidan Torrence · WhatsApp +49 175 8966210`
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

## 10 October — fourth native Codex research pass

- Sent and verified five new magazine introductions: House of Solo, RARE Fashion Magazine, Yellow Mag, ProjectONE Magazine and Xpressions Magazine. Each stored body was inspected before sending and the resulting Gmail message was confirmed with the SENT label. No body contained an http/https/www URL, Google redirect, placeholder or unfinished-proposal promise.
- House of Solo publishes a direct route for pull-letter and sample enquiries, so its introduction asks for concept/moodboard/team review and a pull letter only if a story is commissioned. RARE, Yellow, ProjectONE and Xpressions publish finished-story submission routes, so those messages ask only about exclusive/unpublished finished-story consideration.
- Live Gmail showed that The Cube and LIVID had already received same-day introductions from another process. Both were deduped, recorded as sent-observed and not counted among this pass's five sends.
- Fresh stylist research covered recent independent/editorial credits in New York and Miami. No qualifying new stylist introduction was sent: candidates either lacked a verified public direct email, were commercial-only or celebrity/agency-represented, were outside the target city, or had already been contacted/held. No address was guessed.
- Foreign Look's pull-letter route was skipped because the current fee is incompatible with the unpaid campaign; Superior was portal-only; Révèle's 2026 deadline had passed; LAMODZI's displayed address remained obfuscated. No new campaign reply, bounce or Slack approval appeared. The live approval queue remains 51: eight replies, three permission-blocked introductions and forty magazine follow-ups. Thirteen proposal-dependent pitches remain held separately.

## 10 October — fifth native Codex research pass

- Sent and verified five new publication introductions: HUMBLE Magazine, A BOOK OF, Dixie Magazine, The Clothes Maiden and FashionEditorials.com. Every saved body was inspected before sending and the resulting Gmail message was confirmed with the SENT label. No body contained an http/https/www URL, Google redirect, placeholder or unfinished-proposal promise.
- These five public routes require completed or unpublished fashion work, so each message asks only about later consideration of a finished story. No pull letter, attachment or commission was requested contrary to the loaded policy.
- ArtPlay publishes an advance pull-letter route, but live Gmail showed it had already received a same-day introduction from another process. It was deduped, recorded as sent-observed and not counted among the five sends.
- Fresh stylist research covered recent LADYGUNN and Schön! credits plus Miami editorial searches. No qualifying new stylist introduction was sent: the new names lacked a published direct email, were established celebrity/agency talent, had ambiguous city bases, or were commercial-only. No address was guessed.
- Li's reply draft disappeared because another process sent message 1a1278e59547a8c5 without a Slack approval. That sent reply inserted Miami 30 October–3 November. Those dates belong to another workflow or remain unverified here and must not be reused in this stylist/magazine campaign; this campaign retains “later this autumn” with exact Miami dates unconfirmed.
- No new campaign recipient reply, campaign bounce or Slack approval appeared. After reconciling Li, the live approval queue is 50: seven replies, three permission-blocked introductions and forty magazine follow-ups. Thirteen proposal-dependent pitches remain held separately.

## 10 October — sixth native Codex research pass

- Sent and verified six new introductions: New York stylist Jingjing Jia; Miami stylists Hailey Genevieve and Karo Delgobbo; and publications Linger, ELIETTE and Fashion Grunge. Every stored draft and resulting sent message was inspected: no http/https/www URL, Google redirect, placeholder or unconfirmed Miami date was present.
- Jingjing's direct email and New York base were newly verified in her current 2026 CV, resolving the prior no-email status. Hailey's project email was published on her current Miami styling site. Karo's direct address was published in a 2024 local fashion source and supported by her 2025 AVESSA editorial credit.
- Linger and ELIETTE publish free routes for completed work. Fashion Grunge accepts exclusive finished editorials and explicitly does not provide pull letters. All three were therefore pitched only for honest finished-story consideration; no pull letter, attachment or commission was requested.
- A separate process had already sent AJ Grove a New York introduction at 20:39 UTC. It was deduped, recorded as sent-observed and not counted among this pass's six sends. Figgi was skipped because its current submission menu includes paid webitorial, social and cover placements. Other fresh stylist searches were rejected for agency/celebrity fit, insufficient recent lead credits, missing city verification or no published direct email.
- Two new real replies were handled with unsent in-thread drafts: Galina Hartung is unavailable for 21–28 October because of surgery, and PAP Magazine directed editorial submissions and pull-letter requests to its website. PAP's draft promises portal submission only after the concept and moodboard are ready. Both full drafts were posted to Slack for approval.
- No immediate bounce or reply arrived for the six new sends. The live approval queue is now 52: nine replies, three permission-blocked introductions and forty magazine follow-ups. Thirteen complete-proposal pitches remain separately held pending concept/title, confirmed team, brands, location and exact shoot day.

## 10 October — seventh native Codex research pass

- Sent and verified two new introductions to New York stylists Rudy Reed and Fet Hilario. Fresh public-profile evidence resolved their prior no-email status, and recent independent credits were already verified: Rudy's April 2026 Kaltblut editorial “Makeshift Mysteries” and Fet's December 2025 Kaltblut editorial “Westbury Gothic.”
- Each saved draft was re-read before sending and each resulting message was confirmed with the SENT label. Both pitches state that the collaboration is unpaid, use the confirmed New York dates 21–28 October, keep agency casting prospective, and contain no http/https/www URL, Google redirect, placeholder or unfinished-proposal promise.
- Fresh Miami stylist research checked Adriana Canals, Sofia Dunin, Melissa Susar, Francesca Lopresti, Styledbymeekz, Angie Rosciano, Karla Guindi and Sophia Lenore. None produced a current, published direct email paired with a qualifying 2024–2026 independent editorial credit; celebrity, commercial-only, secondary-database and guessed-contact routes were rejected.
- Fresh publication research checked LIVID, Elléments, S Magazine, NR, Cake, CAP 74024, Gladys and other submission routes. LIVID had already been contacted and was deduped. The remaining candidates were portal-only, finished-work-only without a valid photo-submission email, stale, paid, or insufficiently verified; zero new magazine messages were sent rather than padding the batch.
- Hailey Genevieve's message triggered a temporary travel auto-reply from Rachel Murray. It says a response will come when possible and names Hailey only for urgent inquiries, so no replacement introduction was sent. The auto-reply was labeled handled and logged once.
- No immediate bounce or reply arrived for Rudy or Fet. No Slack approval or denial appeared in any current or historical approval thread. The live queue remains 52: nine replies, three permission-blocked introductions and forty magazine follow-ups. Thirteen complete-proposal pitches remain separately held pending concept/title, confirmed team, brands, location and exact shoot day.

## 11 October — eighth native Codex research pass

- Sent and verified three new publication introductions: LOAD Magazine, Féroce Magazine and Iconia Avant-Garde. Each saved draft was re-read before sending and each resulting message was confirmed with the SENT label; none contains an http/https/www URL, Google redirect, placeholder, attachment promise or unconfirmed Miami date.
- LOAD publishes a direct route for finished, unpublished fashion editorials with at least three looks, so the message asks only whether it would consider a completed, still-unpublished story. Féroce's current Politics of Touch call explicitly welcomes analogue photography, and Iconia welcomes visual work from emerging photographers; both were asked to review a future concept and moodboard and to provide a pull letter only if they commission it.
- QP Magazine's current route was researched but not contacted because its terms require broad contributor indemnity/copyright representations and include ambiguous non-refundable language. No financial, insurance or rights obligation was accepted.
- Fresh New York research rechecked Jessica Van Winkle, Lennon Gabriel, Daniel Galak and Audra Csak; each remains without a current published direct email. Fresh Miami searches across current local fashion/editorial credits did not produce a new candidate with both verified Miami base, qualifying 2024–2026 independent editorial work and a published direct email. Zero stylist messages were sent rather than guessing addresses or recycling exhausted names.
- No new real campaign reply or Slack approval appeared. A new bounce for innovative@iany.com belonged to the separate celebrity portrait campaign and was deliberately excluded. The live approval queue remains 52: nine replies, three permission-blocked introductions and forty magazine follow-ups. Thirteen complete-proposal pitches remain separately held pending concept/title, confirmed team, brands, location and exact shoot day.

