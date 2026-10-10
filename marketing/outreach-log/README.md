# Outreach log

## 2026-10-06: New York + Miami stylists and magazines

`2026-10-10-intros-sent.csv`: 41 intros sent on 10 Oct (30 stylists, 11 magazines); Galore, Tank (Sohrab) and GMARO are still drafts.

`2026-10-06-ny-miami-sent.csv`: the 89 intro emails sent from aidan.torrence@gmail.com on 6 Oct 2026 (41 stylists, 48 magazines), with Gmail thread and message IDs and delivery status.

- Dates were left open at Aidan's request: New York "later this month", Miami "later this autumn", combined pitches "this autumn".
- No links in any email. The cloud Gmail connector rewrites every URL into a `google.com/url?q=...` redirect, so the site is written as plain text (`aidantorrence<span>.com</span>` in the HTML body) and Instagram as `@madebyaidan`. Never send Google redirect links.
- Instagram DMs (`stylist-outreach/dms.md` on the Mac) were not sent; they still contain `[DATES]`.

### Send and approval rules (from 10 Oct, Aidan's instruction; Routine runs hourly until 20 Nov)

- **Outreach is sent automatically.** A first email to a new contact (stylist intro, magazine intro, or a re-pitch to a new contact named in an auto-reply) is drafted, checked with get_draft for `google.com/url`/`http`, then sent with send_message(draftId), logged in a dated `*-intros-sent.csv`, and its `leads.csv` row set to `sent`. Exceptions stay as drafts: anything with an `[AIDAN: ...]` placeholder, and pull-letter pitches that need the proposal PDF (see `PULL-LETTERS.md`).
- **Follow-ups and replies need approval.** They are drafted in-thread and listed in `approvals.csv` (status `pending`). Every run pings Aidan with the pending list (Slack DM when the Slack connector is connected, otherwise a push notification) until each one is approved or denied.
  - Approved: Aidan sends it himself, or says "approve …" in this session; the run then sends it and sets `approved`.
  - Denied: Aidan says "deny …"/"skip …"; set `denied` and stop pinging for it. Never delete the draft.
  - A draft that disappears without being sent (Aidan deleted it) is set `denied`.
- New replies get a reply draft in-thread; bounces and auto-replies are reported once (Gmail label `Outreach NY-Miami/Handled`).
- From 12 Oct, threads with no reply and no bounce get one short follow-up draft (label `Outreach NY-Miami/Follow-up drafted`) and an `approvals.csv` row.
- Magazines: the follow-up asks for a pull letter. On 8 Oct, 40 magazine threads got a pull-letter follow-up draft early (`2026-10-08-pull-letter-followups.csv`).
- `PULL-LETTERS.md` lists each magazine's pull-letter process, the pitches waiting on the proposal PDF, and the proposal checklist.
- A magazine that offers a pull letter, or asks for the concept or proposal to issue one, is IMPORTANT: notify Aidan straight away.
- Every draft is checked for `google.com/url` before it is sent or reported. Never send Google redirect links.

Follow-up templates (in-thread reply to the original, htmlBody only, greeting copied from the original):

- Stylist, New York: `Hi {name},<br><br>Just following up on my note below. I'll be in New York later this month putting together an editorial for magazine submission, and I'd still love to have you style it.<br><br>Would you be open to it?<br><br>Best,<br>Aidan`
- Stylist, Miami: same, with "I'll be in Miami later this autumn".
- Magazine (pull letter), New York and Miami: `Hi {name},<br><br>Following up on my note below. I now have a stylist interested in both New York and Miami, and the New York shoot is planned for later this month. If one of the stories suits {magazine}, could you provide a pull letter so the stylist can request samples from PR? I'll send the concept, moodboard and team details for you to review first.<br><br>Best,<br>Aidan`
  For a single city, use "a New York stylist … the shoot for later this month" or "a Miami stylist … the shoot for later this autumn", and "If the story suits {magazine}".
