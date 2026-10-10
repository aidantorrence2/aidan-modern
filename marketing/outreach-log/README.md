# Outreach log

## Codex migration — 10 October 2026

Execution now runs entirely in Codex/ChatGPT using native Gmail, Slack, GitHub and web tools. The original Claude session and both Claude stylist/magazine routines are paused; do not send execution back to Claude or create another routine. Other campaigns remain separate.

Every hourly run performs fresh research and sends every qualifying new introduction found, targeting up to five contacts per segment. The old six-hour research cadence is superseded. Approval backlog never blocks new introductions. Read `RESEARCH.md` for dates and qualification rules.

Native Gmail: create a draft, read its saved message and inspect all MIME text (including quotes) for URLs, anchors and placeholders, then send the draft only within the authorization below. Confirm the returned SENT message and log IDs; a tool attempt is not a send. Follow-ups and replies require Aidan's explicit approval. Previously blocked Tank/Sohrab and Galore drafts require specific approval and must not be retried under initial-outreach authorization. Live sent mail overrides stale CSV status without implying an approval.

Native Slack: use Aidan's verified self DM, user `U09KLN151B2`, channel `D09JB0X1DDM`. Check every historical approval thread in `slack-pings.csv`, including older replies. Post a reminder every run while approvals remain and post complete new/changed draft text in the thread. Generated summaries are not approvals. If a draft disappears without a sent message, record user removal and stop reminding; never delete or trash drafts.

Only New York 21–28 October 2026 is confirmed. Miami remains later this autumn, exact dates unconfirmed. Concepts, stylist/team bookings, agency models, brands, locations and shoot days remain prospective. One accepting publication per exclusive story; flag conflicts before promising a story. The draft proposal PDF remains held until its missing inputs are supplied.

`2026-10-10-codex-intros-sent.csv` records five introductions sent by this Codex run, with source, draft, message and thread IDs. It separately records newly observed sends from another process for deduplication. The older sent logs remain intact. Shandi's reply was already sent on 9 October and has no outstanding draft; Galore was found sent in live Gmail on 10 October, so neither is a pending reminder.

## 2026-10-06: New York + Miami stylists and magazines

`2026-10-10-intros-sent.csv`: 43 intros sent on 10 Oct (30 stylists, 13 magazines incl. OVERDUE); Galore and Tank (Sohrab) are still drafts, pending approval in `approvals.csv`.

`2026-10-06-ny-miami-sent.csv`: the 89 intro emails sent from aidan.torrence@gmail.com on 6 Oct 2026 (41 stylists, 48 magazines), with Gmail thread and message IDs and delivery status.

- Dates were left open at Aidan's request: New York "later this month", Miami "later this autumn", combined pitches "this autumn".
- No links in any email. The cloud Gmail connector rewrites every URL into a `google.com/url?q=...` redirect, so the site is written as plain text (`aidantorrence<span>.com</span>` in the HTML body) and Instagram as `@madebyaidan`. Never send Google redirect links.
- Instagram DMs (`stylist-outreach/dms.md` on the Mac) were not sent; they still contain `[DATES]`.

### Send and approval rules (from 10 Oct, Aidan's instruction; Routine runs hourly until 20 Nov)

- **Outreach is sent automatically.** A first email to a new contact (stylist intro, magazine intro, or a re-pitch to a new contact named in an auto-reply) is drafted, checked by reading the stored Gmail message for URLs/placeholders, then sent with the native send_draft tool, logged in a dated `*-intros-sent.csv`, and its `leads.csv` row set to `sent`. Exceptions stay as drafts: anything with an `[AIDAN: ...]` placeholder, and pull-letter pitches that need the proposal PDF (see `PULL-LETTERS.md`).
- **Follow-ups and replies need approval.** They are drafted in-thread and listed in `approvals.csv` (status `pending`). Every run pings Aidan in his own Slack DM (user U09KLN151B2, verified as Aidan Torrence, aidan.torrence@gmail.com; DM channel D09JB0X1DDM) with the pending list and the full draft text in a thread reply, until each one is approved, sent or denied. Ping timestamps are logged in `slack-pings.csv`; Aidan replies in the ping thread.
- Dates: New York 21–28 October 2026 (confirmed 10 Oct). Miami dates are not confirmed; never fill them in.
  - Approved: Aidan sends it himself, or explicitly approves the exact reviewed draft in this chat or an approval Slack thread; the run then sends it and sets `approved`.
  - Denied: Aidan says "deny …"/"skip …"; set `denied` and stop pinging for it. Never delete the draft.
  - A draft that disappears without being sent is recorded as `removed-by-user` and no longer reminded.
- New replies get a reply draft in-thread; bounces and auto-replies are reported once (Gmail label `Outreach NY-Miami/Handled`).
- From 12 Oct, threads with no reply and no bounce get one short follow-up draft (label `Outreach NY-Miami/Follow-up drafted`) and an `approvals.csv` row.
- Magazines: the follow-up asks for a pull letter. On 8 Oct, 40 magazine threads got a pull-letter follow-up draft early (`2026-10-08-pull-letter-followups.csv`).
- `PULL-LETTERS.md` lists each magazine's pull-letter process, the pitches waiting on the proposal PDF, and the proposal checklist.
- A magazine that offers a pull letter, or asks for the concept or proposal to issue one, is IMPORTANT: notify Aidan straight away.
- Every draft is inspected for http/https/www URLs, redirect URLs and link anchors, including quoted text. Remove them before reporting or sending.

Follow-up templates (in-thread reply to the original, htmlBody only, greeting copied from the original):

- Stylist, New York: `Hi {name},<br><br>Just following up on my note below. I'll be in New York 21–28 October putting together an editorial for magazine submission, and I'd still love to have you style it.<br><br>Would you be open to it?<br><br>Best,<br>Aidan`
- Stylist, Miami: same, with "I'll be in Miami later this autumn".
- Magazine (pull letter), New York and Miami: `Hi {name},<br><br>Following up on my note below. I now have a stylist interested in both New York and Miami, and the New York shoot is planned for 21–28 October. If one of the stories suits {magazine}, could you provide a pull letter so the stylist can request samples from PR? I'll send the concept, moodboard and team details for you to review first.<br><br>Best,<br>Aidan`
  For a single city, use "a New York stylist … the shoot for 21–28 October" or "a Miami stylist … the shoot for later this autumn", and "If the story suits {magazine}".
