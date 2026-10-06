# Outreach log

## 2026-10-06: New York + Miami stylists and magazines

`2026-10-06-ny-miami-sent.csv`: the 89 intro emails sent from aidan.torrence@gmail.com on 6 Oct 2026 (41 stylists, 48 magazines), with Gmail thread and message IDs and delivery status.

- Dates were left open at Aidan's request: New York "later this month", Miami "later this autumn", combined pitches "this autumn".
- No links in any email. The cloud Gmail connector rewrites every URL into a `google.com/url?q=...` redirect, so the site is written as plain text (`aidantorrence<span>.com</span>` in the HTML body) and Instagram as `@madebyaidan`. Never send Google redirect links.
- Instagram DMs (`stylist-outreach/dms.md` on the Mac) were not sent; they still contain `[DATES]`.

### Follow-up rules (scheduled Routine, every 6 hours)

- Nothing is sent automatically. Replies and follow-ups are created as Gmail drafts and Aidan approves them.
- New replies get a reply draft in-thread; bounces and auto-replies are reported once (Gmail label `Outreach NY-Miami/Handled`).
- From 12 Oct, threads with no reply and no bounce get one short follow-up draft (label `Outreach NY-Miami/Follow-up drafted`).
- Every draft is checked for `google.com/url` before it is reported.
