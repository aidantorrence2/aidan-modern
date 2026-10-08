# Outreach log

## 2026-10-06: New York + Miami stylists and magazines

`2026-10-06-ny-miami-sent.csv`: the 89 intro emails sent from aidan.torrence@gmail.com on 6 Oct 2026 (41 stylists, 48 magazines), with Gmail thread and message IDs and delivery status.

- Dates were left open at Aidan's request: New York "later this month", Miami "later this autumn", combined pitches "this autumn".
- No links in any email. The cloud Gmail connector rewrites every URL into a `google.com/url?q=...` redirect, so the site is written as plain text (`aidantorrence<span>.com</span>` in the HTML body) and Instagram as `@madebyaidan`. Never send Google redirect links.
- Instagram DMs (`stylist-outreach/dms.md` on the Mac) were not sent; they still contain `[DATES]`.

### Follow-up rules (scheduled Routine "Outreach replies + follow-ups (NY/Miami)", every 6 hours, until 20 Nov)

- Nothing is sent automatically. Replies and follow-ups are created as Gmail drafts and Aidan approves them.
- New replies get a reply draft in-thread; bounces and auto-replies are reported once (Gmail label `Outreach NY-Miami/Handled`).
- From 12 Oct, threads with no reply and no bounce get one short follow-up draft (label `Outreach NY-Miami/Follow-up drafted`).
- Magazines: the follow-up asks for a pull letter. On 8 Oct, 40 magazine threads got a pull-letter follow-up draft early (`2026-10-08-pull-letter-followups.csv`, all labelled Follow-up drafted), so the 12 Oct step only covers stylists and any magazine added later.
- A magazine that offers a pull letter, or asks for the concept or proposal to issue one, is IMPORTANT: notify Aidan straight away. Pull letters need a concept, moodboard, team list and shoot dates (see `RESEARCH.md`).
- Every draft is checked for `google.com/url` before it is reported.

Follow-up templates (in-thread reply to the original, htmlBody only, greeting copied from the original):

- Stylist, New York: `Hi {name},<br><br>Just following up on my note below. I'll be in New York later this month putting together an editorial for magazine submission, and I'd still love to have you style it.<br><br>Would you be open to it?<br><br>Best,<br>Aidan`
- Stylist, Miami: same, with "I'll be in Miami later this autumn".
- Magazine (pull letter), New York and Miami: `Hi {name},<br><br>Following up on my note below. I now have a stylist interested in both New York and Miami, and the New York shoot is planned for later this month. If one of the stories suits {magazine}, could you provide a pull letter so the stylist can request samples from PR? I'll send the concept, moodboard and team details for you to review first.<br><br>Best,<br>Aidan`
  For a single city, use "a New York stylist … the shoot for later this month" or "a Miami stylist … the shoot for later this autumn", and "If the story suits {magazine}".
