# Owner to-do (only you can do these)

## 0. Review the 10 rendered videos (rendering is paused until you do)
Videos: `marketing/focus/videos/` — 001–006, 008, 010, 012, 015 (each ~24 s, with a `.txt` caption). Matching post copy: `marketing/focus/queue/`.
Reply with: approved / changes wanted (style, tone, length, topics, which to drop). Then remove the HOLD block at the top of `STATE.md`, or just say so in the conversation.

Nothing here is urgent until videos exist; the pipeline keeps building around these.

## 1. Create the posting accounts and connect them
The automated runs can only post through a credential/connector that exists in the session. Until then, ready-to-post packages pile up in `marketing/focus/queue/`.
- **Facebook Page** — Create at facebook.com/pages/create. Suggested name: "Unplugged Daily" (check availability). Category: "Education". Bio (prefilled):
  > Short, practical ways to spend less time on your phone and get your focus back. New tip every day.
- **TikTok** and **X** — same name/handle if available, same bio.
- Then post from `marketing/focus/queue/`: one ready package per video (caption per platform, first comment, DM reply). `queue/README.md` has a suggested first-week order and a posting checklist. Or connect the platform to Claude so runs can post.

## 2. Affiliate programs (needs your identity, tax and payout details)
Drafts are ready in `marketing/focus/affiliate-drafts/` (start with README.md); you fill in identity/tax/payout and submit. Apply once the accounts have 3–5 posts. Programs: Aura, Qustodio, Freedom, Brick, Amazon Associates (for the lock box). Keep affiliate IDs and links out of this public repo.

## 3. Pick an email tool for the opt-in
Any free tier works (e.g. ConvertKit/Kit, MailerLite, Beehiiv). The landing page will be built to accept a form action URL you paste in.

## 4. Host the opt-in landing page
The page is a single static file: `marketing/focus/landing/index.html`. Any static host works (Netlify Drop, Cloudflare Pages, GitHub Pages from a separate repo, or a path on an existing site).
1. Make a private copy of the file and fill in the two config blocks at the top of the `<script>`:
   - `FORM_ACTION` = your email tool's form POST URL (from step 3).
   - `OFFER_LINKS` = your affiliate links once approved (step 2). Leave any empty to hide that offer card.
2. Upload it. The DM link pattern is `https://<your-host>/?k=NIGHT` (keywords in `marketing/focus/keyword-map.md`).
3. Tell the pipeline the base URL (add it to STATE.md "Blocked on owner" → done) so post packages can use it. The URL itself is fine to commit; affiliate IDs are not.
