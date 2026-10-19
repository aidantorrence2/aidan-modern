# Charlotte DM ads — launch package (21 Oct 2026)

Implements `../CPC-PLAN.md`. Everything here is upload-ready but **nothing is published**: publishing needs a Meta token, the ad account id, the Page id and a payment method (see "To publish" at the bottom), and every spend/post goes through an approval card.

## What's in this folder

| round | ads | files |
|---|---|---|
| **R1** (days 1–4, baseline + 3 bets) | r1a control · r1b proof sheet · r1c receipt · r1d viewfinder (no shutter) | `r1/<id>/*.jpg` |
| **R2** (days 5–8, intent) | r2a just say hi · r2b ask list · r2c swipe-bait · r2d–g four neighbourhoods | `r2/<id>/*.jpg` |
| **R3** (days 9–12, cheap placements) | r3a develop · r3b eyes first · r3c flash loop (5s Reels) · r3d nothing · r3e upside down · r3f zero-design story | `r3/<id>/*.mp4|jpg` |

`ads.csv` = id, round, name, source render, lever, hypothesis. JPGs are 1080×1920 (carousel cards, in file-name order); Reels are 1080×1920 mp4, 5 s, −14 LUFS. Images and mp4s are gitignored; they regenerate from the renderers (`render-v6/v9/v11.mjs`, `charlotte-video-ads` variants j/k/l).

Left out on purpose (Meta's non-existent-functionality rule: fake buttons, notifications, checkboxes, choice options): App Store, search page, CAPTCHA, retro dialog, and the message/profile/FaceTime mockups with drawn buttons. The viewfinder is shipped *without* the shutter ring for the same reason.

## Campaign (create PAUSED)

- Objective `OUTCOME_ENGAGEMENT`, destination Instagram Direct, optimisation `CONVERSATIONS`, API v26.0, `special_ad_categories=[]`, `is_adset_budget_sharing_enabled=false`.
- **Ad set R1:** Charlotte + 25 mi, ages 20–40, **women only** (`genders:[2]`, `advantage_audience:0`), placements Instagram **Stories + Reels + Feed** (no Explore — removed in v26). Daily budget: **$12 for 4 ads** (3–4 days) — at $5/day only 2 ads get a read. Lowest cost, no cap.
- R2 and R3 are new ad sets (same targeting) so the winners from the previous round aren't edited (3 location edits killed Athens). Don't touch an ad set for 72 h after it goes live.
- Names: `CLT | R1 | r1a control`, etc.
- Kill rule: pause anything above 1.5× the control's cost per click after 1,000 impressions. Judge on cost per click first; cost per chat once an ad has 5+ chats.

## Copy (everything from your decks; no job/casting words, no film, no dates until real)

**Headline (all ads):** `Charlotte Free Photo Shoot`
**CTA button:** Send message

**Primary text — test as three separate ad sets only after R1; R1 uses A:**
- **A (deck lines):** `i'm aidan, a portrait photographer. i'm in charlotte for a few weeks. free photo shoot, about an hour. i direct every frame.`
- **B (short):** `Free photo shoot in Charlotte. Message me.`
- **C (question):** `Want photos like these? Free photo shoot in Charlotte.`

**Welcome message (first thing they see in the DM):**
`hi! i'm aidan 👋 free photo shoot in charlotte. what's your name?`
*(The earlier draft said "this month" and "no fees, no packages" — removed; those weren't your words. Add back only what's true.)*

**Four ice breakers + the auto-reply for each** (plain questions; the answers are your own lines or marked CONFIRM):
1. `is it really free?` → `yes. free photo shoot.`
2. `when are you in charlotte?` → `[CONFIRM: your dates]`
3. `what should I wear?` → `[CONFIRM: your answer]`
4. `how long does it take?` → `about an hour. i direct every frame.`
Reply inside an hour while ads run.

## Needs from you (blocks the ads marked)
- Charlotte dates (ice breaker 2; I4 "dates" ad not built).
- What they get: number of edited photos + turnaround (I3 "what you get" not built).
- Whether duo sessions are offered.
- The 10-second selfie clip for the on-camera ad (C1; shot list in `../../charlotte-video-ads/HI-AIDAN-SHOTLIST.md`).
- Real poll sticker (C3) is added in Instagram's own Stories composer, not in these files.

## To publish (needs: system-user token with `ads_management` + `pages_manage_ads`, `act_<ad account>`, the Page id linked to the IG account, `instagram_user_id`, a payment method)

Order, all `status=PAUSED`: upload media (`/advideos`, `/adimages`) → campaign → ad set → creative per ad (`object_story_spec` with `page_id` + `instagram_user_id`; carousels as `link_data.child_attachments`; CTA `INSTAGRAM_MESSAGE`, `app_destination:INSTAGRAM_DIRECT`; welcome message + ice breakers as `page_welcome_message`) → ads. Exact payloads are in `../research-meta-dm.md` sections 1–4. Then preview in Ads Manager and **queue one approval card per activation** (campaign → ad set → ads). Nothing here has called the Meta API.
