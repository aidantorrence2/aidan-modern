# Charlotte DM ads — launch package (21 Oct 2026)

Implements `../CPC-PLAN.md`. Everything here is upload-ready but **nothing is published**: publishing needs a Meta token, the ad account id, the Page id and a payment method (see "To publish" at the bottom), and every spend/post goes through an approval card.

## What's in this folder

The rounds are the creative formats. Round 1 is the four strongest; every round after it is the next batch of "looks like something else" concepts. The plain hooks (neighbourhoods, just-say-hi, quiet, upside-down) are **Round 6 copy/structure tests**, not the main event.

| round | ads |
|---|---|
| **R1** | control · proof sheet "you?" · receipt $0.00 · viewfinder (no shutter) |
| **R2** (phone formats, controls removed) | FaceTime "Charlotte is calling" · lock screen · iMessage thread · now playing · weather FREE · memories |
| **R3** (objects) | ticket · tarot · trading card · newspaper · marquee · neon · highway sign · postcard |
| **R4** (visual) | text portrait · stickers · eye lineup · double exposure · glitch · $0 / 1 hr · chalkboard · facts label |
| **R5** (Reels) | develop · eyes first · flash loop · wall+flashes · hi i'm aidan · notes |
| **R6** (copy/structure) | just say hi · ask list · four neighbourhoods · zero-design story · quiet · upside down · story (add Meta's real poll sticker) · the remaining UI formats with controls removed |

`ads.csv` = id, round, name, source render, hypothesis, files. JPGs are 1080×1920 carousel cards in file-name order; Reels are 1080×1920 mp4 at −14 LUFS. Images and mp4s are gitignored; they regenerate from `render-v6/v9/v9-safe/v10/v10-safe/v11.mjs` and the `charlotte-video-ads` variants.

**What was removed, and only that:** drawn buttons, notifications, checkboxes and choice options (Meta's non-existent-functionality rule). FaceTime lost Decline/Accept and became "Charlotte is calling"; the lock screen lost its notification cards; now-playing lost the transport bar; the message request lost Accept; the profile lost Follow/Message; the post lost its icon row; the video call lost its control bar; the story lost the drawn poll (use Meta's real poll sticker). Out entirely because the format *is* the control: App Store (GET), search page, retro dialog, CAPTCHA.

Rounds run 3–4 days each, **$3/ad/day** (R1 = $12/day, R2 = $18/day, R3–R4 = $24/day or split into two 4-ad sets); keep the winner of each round in the next set. Don't edit a live ad set for 72 h.

## Campaign (create PAUSED)

- Objective `OUTCOME_ENGAGEMENT`, destination Instagram Direct, optimisation `CONVERSATIONS`, API v26.0, `special_ad_categories=[]`, `is_adset_budget_sharing_enabled=false`.
- **Ad set R1:** Charlotte + 25 mi, ages 20–40, **women only** (`genders:[2]`, `advantage_audience:0`), placements Instagram **Stories + Reels + Feed** (no Explore — removed in v26). Daily budget: **$3 per ad** (R1 = $12/day). At $5/day only 2 ads get a read. Lowest cost, no cap.
- R2–R6 are new ad sets (same targeting) so the winners from the previous round aren't edited (3 location edits killed Athens). Don't touch an ad set for 72 h after it goes live.
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
