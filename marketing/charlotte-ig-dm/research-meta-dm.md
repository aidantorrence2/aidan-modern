# Click-to-Instagram-Direct ads through the Marketing API (researched 19 Oct 2026)

Use case: $5/day, Charlotte NC +25 mi, ages 20–40, Instagram placements only, free photo shoot offer.
The "Send message" button opens Instagram DM with a greeting and 4 ice breakers.
Creatives: Reels 1080x1920 and carousels 1080x1350.

**API version:** use **v26.0**. It was released 29 Jul 2026 and is the version in the current docs examples.
v24.0 was available until 6 Oct 2026, so call v25.0 or later.

```sh
G=https://graph.facebook.com/v26.0; ACT=act_<AD_ACCOUNT_ID>; TOKEN=<SYSTEM_USER_TOKEN>
```

## 1. Campaign

- **Objective:** `OUTCOME_ENGAGEMENT`. This is the standard choice for "maximize conversations".
  - The click-to-Instagram docs also allow `OUTCOME_SALES` and `OUTCOME_TRAFFIC`.
  - `OUTCOME_LEADS` is not listed for this destination. It is used for instant forms or Messenger lead templates.
- **special_ad_categories:** required. Use `[]`. Messaging destinations require `[]` or `NONE`.
  - See section 5 for why the copy must not read as a job or casting call, which could push it into `EMPLOYMENT`.
- **buying_type:** `AUCTION`. This is the default and can be omitted.
- **Budget location:** set the budget on the ad set, since there is only one ad set.
  - **Since v24.0** the campaign must then send `is_adset_budget_sharing_enabled`.
  - Leaving it out gives error **4834011**: "Must specify True or False in is_adset_budget_sharing_enabled field".
  - With CBO (Advantage+ campaign budget), put `daily_budget` and `bid_strategy` on the campaign and leave them off the ad set. With a single ad set the two are equivalent.

```sh
curl -X POST "$G/$ACT/campaigns" \
  -F 'name=CLT free shoot – IG DM' \
  -F 'objective=OUTCOME_ENGAGEMENT' \
  -F 'special_ad_categories=[]' \
  -F 'buying_type=AUCTION' \
  -F 'is_adset_budget_sharing_enabled=false' \
  -F 'status=PAUSED' \
  -F "access_token=$TOKEN"
# -> {"id":"<CAMPAIGN_ID>"}
```

## 2. Ad set

| Field | Value |
|---|---|
| `destination_type` | `INSTAGRAM_DIRECT`. Instagram only. The multi-destination values are `MESSAGING_INSTAGRAM_DIRECT_MESSENGER`, `MESSAGING_INSTAGRAM_DIRECT_WHATSAPP`, `MESSAGING_MESSENGER_WHATSAPP` and `MESSAGING_INSTAGRAM_DIRECT_MESSENGER_WHATSAPP`, and they need `asset_feed_spec.optimization_type=DOF_MESSAGING_DESTINATION`. |
| `optimization_goal` | `CONVERSATIONS` |
| `billing_event` | `IMPRESSIONS` (required) |
| `bid_strategy` | `LOWEST_COST_WITHOUT_CAP`, which takes no `bid_amount` |
| `daily_budget` | Minor units of the account currency, so `500` is $5.00. Only allowed when the ad set runs longer than 24 h. Omit `end_time` or set it to 0 for an ongoing ad set. |
| `promoted_object` | `{"page_id":"<PAGE_ID>"}`. Use the Page that is linked to the IG account. |

**Targeting:**
- City radius for a `cities` entry is **10–50 mi** (17–80 km), and `distance_unit` is `mile` or `kilometer`.
- Look up Charlotte's city key first. This is a read-only call:
  `GET $G/search?type=adgeolocation&q=Charlotte&location_types=["city"]&region_id=<NC>`. Pick the result with `region":"North Carolina"`.
- Alternative: `custom_locations` with lat/long. Charlotte is 35.2271, -80.8431, radius 0.63–50 mi.
- Ages: `age_min` must be ≥ 13 and `age_max` ≤ 65.
- **Advantage+ audience (since v23.0):** new ad sets need `targeting_automation.advantage_audience` set explicitly to 0 or 1 when you narrow age or gender. Leaving it out triggers a creation error.
  - Use `0` to keep 20–40 as a hard limit.
  - With `1`, the ages become a suggestion and Meta may deliver outside them.
- **Placements:**
  - `publisher_platforms:["instagram"]` plus `instagram_positions`. Valid values are `stream`, `story`, `reels`, `explore_home`, `profile_feed`, `ig_search` and `profile_reels`.
  - **The Explore feed placement (`explore`) was removed in v26.0.** Explicitly requesting it now returns an error. Before v26 it required `stream` as well.
  - Leave out `explore`. Use `explore_home` only if you want the Explore grid home.
  - `story` requires `device_platforms:["mobile"]`.
  - If you omit `instagram_positions`, the ad set gets all Instagram positions. If you omit `publisher_platforms`, it gets Advantage+ placements across FB, IG, Audience Network and Messenger.

```sh
curl -X POST "$G/$ACT/adsets" \
  -F 'name=CLT 25mi 20-40 IG' \
  -F 'campaign_id=<CAMPAIGN_ID>' \
  -F 'destination_type=INSTAGRAM_DIRECT' \
  -F 'optimization_goal=CONVERSATIONS' \
  -F 'billing_event=IMPRESSIONS' \
  -F 'bid_strategy=LOWEST_COST_WITHOUT_CAP' \
  -F 'daily_budget=500' \
  -F 'promoted_object={"page_id":"<PAGE_ID>"}' \
  -F 'targeting={
      "geo_locations":{"cities":[{"key":"<CHARLOTTE_KEY>","radius":25,"distance_unit":"mile"}],
                       "location_types":["home","recent"]},
      "age_min":20,"age_max":40,
      "publisher_platforms":["instagram"],
      "instagram_positions":["stream","story","reels","explore_home"],
      "device_platforms":["mobile"],
      "targeting_automation":{"advantage_audience":0}}' \
  -F 'status=PAUSED' \
  -F "access_token=$TOKEN"
```

## 3. Media upload and ad creative

**Images** go to `adimages` as multipart. The response contains `images.<filename>.hash`.

```sh
curl -X POST "$G/$ACT/adimages" -F 'filename=@card1.jpg' -F "access_token=$TOKEN"
# {"images":{"card1.jpg":{"hash":"<IMAGE_HASH>","url":"..."}}}
```

You can also send `bytes=<base64>`, or use `copy_from={"source_account_id":..,"hash":..}`.

**Videos** go to `advideos`, either with `source=@file` or `file_url=<public url>`. Files over about 1 GB use the chunked upload (`upload_phase=start|transfer|finish`).
After uploading, poll `GET $G/<VIDEO_ID>?fields=status` until `status.video_status=ready` before you build the creative.

```sh
curl -X POST "$G/$ACT/advideos" -F 'source=@reel1.mp4' -F 'name=reel1' -F "access_token=$TOKEN"
# {"id":"<VIDEO_ID>"}
```

**Identity:**
- `object_story_spec.page_id` plus **`instagram_user_id`**.
- `instagram_actor_id` was replaced from v22.0. Since 9 Sep 2025 no API version accepts the legacy field on `POST /adcreatives`, `/ads` or `/generatepreviews`.
- The click-to-Instagram doc page still shows `instagram_actor_id` in some samples. Ignore those and use `instagram_user_id`.
- To get the IG user id, call `GET /<PAGE_ID>?fields=instagram_business_account`. You can also use `GET /act_<id>/instagram_accounts` or `/<PAGE_ID>/page_backed_instagram_accounts`. Business Manager-owned IG accounts are also supported.

**CTA:** `{"type":"INSTAGRAM_MESSAGE","value":{"app_destination":"INSTAGRAM_DIRECT"}}`. Ads Manager labels this button "Send message".
- Some samples use `MESSAGE_PAGE` with `app_destination: INSTAGRAM_DIRECT`, which also works.
- Never use `app_destination: MESSENGER` with an `INSTAGRAM_DIRECT` ad set.

**Greeting and ice breakers:** set `object_story_spec.page_welcome_message` to a JSON string.
- Use the `VISUAL_EDITOR` v2 format below.
- Limits: ice breaker title ≤ 80 characters, response and message text ≤ 300 characters.
- Placeholders: `{{user_first_name}}`, `{{user_last_name}}`, `{{user_full_name}}` and `{{page_name}}`.
- The doc sample has 3 ice breakers, and Meta does not state a maximum for ads. The Instagram Messaging Ice Breaker API caps at 4, so 4 is the safe number.
- Without a custom greeting, the default prefilled message is "Hello! Can I get more info on this?".
- Alternative: attach a partner-app **welcome message flow** with `asset_feed_spec.additional_data.partner_app_welcome_message_flow_id`. Flows support images, quick replies and buttons.

```json
{"type":"VISUAL_EDITOR","version":2,"landing_screen_type":"welcome_message","media_type":"text",
 "text_format":{"customer_action_type":"ice_breakers",
  "message":{"text":"Hi {{user_first_name}}! Thanks for reaching out about the free shoot 📸",
   "ice_breakers":[
    {"title":"How does the free shoot work?","response":"<answer>"},
    {"title":"When are you shooting in Charlotte?","response":"<answer>"},
    {"title":"What should I wear / bring?","response":"<answer>"},
    {"title":"Can I see your work?","response":"<answer>"}]}}}
```

**Reel creative (video_data).** A thumbnail is required: pass `image_hash` or `image_url`. Video creatives take `title`, not `name`.

```sh
curl -X POST "$G/$ACT/adcreatives" -F 'name=reel1' \
  -F 'object_story_spec={"page_id":"<PAGE_ID>","instagram_user_id":"<IG_USER_ID>",
    "video_data":{"video_id":"<VIDEO_ID>","image_hash":"<THUMB_HASH>",
      "message":"Free photo shoot in Charlotte this month — tap Send message.",
      "call_to_action":{"type":"INSTAGRAM_MESSAGE","value":{"app_destination":"INSTAGRAM_DIRECT"}}},
    "page_welcome_message":"<JSON ABOVE, stringified>"}' \
  -F 'degrees_of_freedom_spec={"creative_features_spec":{"standard_enhancements":{"enroll_status":"OPT_OUT"}}}' \
  -F "access_token=$TOKEN"
```

Note on `degrees_of_freedom_spec`: `standard_enhancements` is being split into individual features. If v26 rejects it, opt out per feature instead, for example `image_touchups` or `text_optimizations`, or drop the field.

**Carousel creative:** `link_data.child_attachments`, 2–10 cards.
- Each card takes `image_hash`, or `video_id` plus `picture`/`image_hash` as its thumbnail.
- Each card also takes `name` (the headline) and its own CTA.
- A `link` is generally required on `link_data` and each card. For IG Direct the docs use `https://www.instagram.com`.

```sh
-F 'object_story_spec={"page_id":"<PAGE_ID>","instagram_user_id":"<IG_USER_ID>",
  "link_data":{"message":"Free photo shoot in Charlotte 📸","link":"https://www.instagram.com",
    "multi_share_end_card":false,
    "call_to_action":{"type":"INSTAGRAM_MESSAGE","value":{"app_destination":"INSTAGRAM_DIRECT"}},
    "child_attachments":[
      {"image_hash":"<H1>","name":"Free shoot","link":"https://www.instagram.com",
       "call_to_action":{"type":"INSTAGRAM_MESSAGE","value":{"app_destination":"INSTAGRAM_DIRECT"}}},
      {"image_hash":"<H2>","name":"Charlotte","link":"https://www.instagram.com",
       "call_to_action":{"type":"INSTAGRAM_MESSAGE","value":{"app_destination":"INSTAGRAM_DIRECT"}}}]},
  "page_welcome_message":"<JSON>"}'
```

**Ad:**

```sh
curl -X POST "$G/$ACT/ads" -F 'name=reel1' -F 'adset_id=<ADSET_ID>' \
  -F 'creative={"creative_id":"<CREATIVE_ID>"}' -F 'status=PAUSED' -F "access_token=$TOKEN"
```

Preview without spending: `GET $G/<CREATIVE_ID>/previews?ad_format=INSTAGRAM_REELS`, or `INSTAGRAM_STANDARD` / `INSTAGRAM_STORY`.

## 4. Permissions, tokens and prerequisites

- **Permissions for the click-to-IG flow:** `ads_management`, `pages_manage_ads`, `pages_read_engagement` and `pages_show_list`.
  - Add `ads_read` for insights.
  - Add `business_management` if the token manages Business Manager assets or system users.
  - Add `instagram_basic` to read the IG account id.
  - `instagram_manage_messages` is **not** needed to create the ad. It is only needed if your own app will read or reply to the DMs, or set account-level ice breakers via `messenger_profile`.
- The token's user must be able to do the **ADVERTISE** task on the Page.
- **Token type:** use a **Business Manager system-user token** for automation. It does not expire, or it is long-lived.
  - Assign the system user the ad account (Manage campaigns), the Page and the IG account in Business Settings.
  - An app in Development mode can only manage ad accounts its admins own. Standard Access requires a business-verified app with Advanced Access to `ads_management`.
  - A user token expires in about 60 days.
- **Account prerequisites:**
  - The IG account is Professional (Business or Creator) and **linked to the Facebook Page**, or Business Manager-owned.
  - In the Instagram app: Settings → Messages and story replies → Message controls → Connected tools → **"Allow access to messages"** must be ON. Without this, messaging ads and ice breakers fail or don't route.
  - The ad account has a valid payment method and the same currency the budget assumes (USD → cents). The account is not restricted.
  - The Page and IG account are not restricted for messaging.

## 5. Status, review and activation

1. Create the campaign, ad set and ads with `status=PAUSED`. The ad set defaults to ACTIVE if you omit it.
   - Review is triggered when an ad is set ACTIVE, and some ads go into review on creation.
2. Check `GET /<AD_ID>?fields=effective_status,ad_review_feedback,issues_info` and the creative preview.
3. Activate from the top down: campaign `POST /<CAMPAIGN_ID> status=ACTIVE`, then the ad set, then the ad. Each returns `{"success":true}`.
   - The ad then sits in `effective_status=PENDING_REVIEW` and moves to `ACTIVE`, or to `DISAPPROVED` with feedback in `ad_review_feedback`.
   - Under your rules, activation is a money-spending step that needs approval.
4. **Review risks for "free photo shoot":**
   - **Employment / casting framing.** "Models wanted", "casting" or "paid/TFP gig" can be read as a job opportunity. That pushes the ad into special category `EMPLOYMENT`, which forbids age targeting and requires a 15-mile minimum radius, or gets it rejected for running without the category. Frame it as a free creative portrait session or collaboration.
   - **Personal attributes.** Don't say "Are you 20–30?" or "You're beautiful". Ad copy can't assert or imply a viewer's age, appearance or other personal traits.
   - **"Free" must be true.** No hidden costs, no bait. Unclear terms trigger the "misleading/unrealistic offers" policy. Say what the person gets, for example "edited photos, no cost".
   - **Before/after or body-focused imagery.** Avoid it in shoot samples, especially swimwear or lingerie. Sexual or suggestive content gets restricted.
   - The Page and IG name, and a landing profile showing real past work, help avoid "scam" flags. New ad accounts often get extra-strict first reviews, so expect up to 24 h.

## 6. Pitfalls and errors

- **Wrong destination for the objective.** `INSTAGRAM_DIRECT` with an `OUTCOME_LEADS` or `OUTCOME_AWARENESS` campaign is rejected.
  - Use ENGAGEMENT, SALES or TRAFFIC with `CONVERSATIONS`.
  - With ENGAGEMENT, `LINK_CLICKS` is the only other valid goal.
- The CTA's `app_destination` must match the ad set's `destination_type`. A multi-destination ad set needs `asset_feed_spec.call_to_actions` covering each destination plus `optimization_type: DOF_MESSAGING_DESTINATION`.
- Using `instagram_actor_id` fails on every live version. Use `instagram_user_id`.
  - Related renames: `instagram_story_id` became `source_instagram_media_id`, and `effective_instagram_story_id` became `effective_instagram_media_id`.
- An explicit `explore` placement errors on v26+. If `messenger_positions:["story"]` appears, it is silently stripped.
- On v23+, missing `targeting_automation.advantage_audience` with custom age or gender gives an explicit-flag error. In v26 the HEC-F variant is `ADS_TARGETING__REQUIRE_EXPLICIT_ADVANTAGE_AUDIENCE_FLAG`.
- On v24+, a campaign without its own budget that omits `is_adset_budget_sharing_enabled` gets error **4834011**.
- Radius with multiple locations gives error **100 / subcode 1815946**. Use a single city plus radius, as here.
- `cities` radius below 10 mi is rejected. Use `custom_locations` for a tighter radius.
- `daily_budget` in dollars (`5`) means $0.05 and fails the minimum. Budgets are in cents. The minimum for IMPRESSIONS billing is about $1/day.
- Advantage+ shopping and app campaigns (ASC/AAC) cannot be created since v24 and v25. This doesn't affect a manual engagement campaign, but don't copy old ASC code.
- Omitting placements or publisher_platforms gives Advantage+ placements, which includes FB and Audience Network. Set them explicitly for IG-only delivery.
- Creating a creative before the video finishes processing gives an error. Poll `status.video_status`.
- Rate limit error 80004, too many calls to one ad account. Back off and retry.
- If "Allow access to messages" is off or the IG account isn't linked, the creative is rejected for the IG identity or ice breakers don't render. Fix it in IG settings, not in the API.

## Sources

- Click to Instagram (main guide, v26 samples): https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads/click-to-instagram
- Click to multidestination (destination_type list, ice breaker character limits): https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-creative/messaging-ads/click-to-multidestination
- Messaging ads overview: https://developers.facebook.com/docs/marketing-api/ad-creative/messaging-ads
- instagram_actor_id to instagram_user_id migration (Aug 2025 blog): https://developers.facebook.com/blog/post/2025/08/11/instagram-marketing-api-update/
- v22.0 changelog: https://developers.facebook.com/docs/marketing-api/marketing-api-changelog/version22.0
- v26.0 changelog (Explore removed, Messenger Stories): https://developers.facebook.com/docs/graph-api/changelog/version26.0
- v26 announcement (29 Jul 2026): https://developers.facebook.com/blog/post/2026/07/29/introducing-graph-api-v26-and-marketing-api-v26/
- v24 and v25 changelogs (ASC/AAC block): https://developers.facebook.com/documentation/ads-commerce/marketing-api/marketing-api-changelog/version24.0 , https://developers.facebook.com/documentation/ads-commerce/marketing-api/marketing-api-changelog/version25.0
- Ad set budget sharing (`is_adset_budget_sharing_enabled`, 4834011): https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/guides/adset-budget-sharing
- Basic targeting (cities radius, custom_locations, ages, 1815946): https://developers.facebook.com/docs/marketing-api/audiences/reference/basic-targeting
- Placement targeting: https://developers.facebook.com/docs/marketing-api/audiences/reference/placement-targeting
- Advantage+ audience (v23 explicit flag): https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-expansion/advantage-audience/ and https://developers.facebook.com/blog/post/2025/06/13/marketing-api-changes-to-advantage-plus-audience-behaviors/
- Ad images: https://developers.facebook.com/docs/marketing-api/reference/ad-image
- Ad videos: https://developers.facebook.com/docs/marketing-api/advideo
- IG welcome message flows: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/welcome-message-ads
- IG Ice Breakers API (max 4): https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/ice-breakers/
- Error reference: https://developers.facebook.com/docs/marketing-api/error-reference/

Not verified from Meta docs. These come from experience or third parties, so test on a PAUSED object:
- the ad-level ice breaker maximum
- the `standard_enhancements` v26 behaviour
- the minimum daily budget
- whether `link` is required on IG Direct carousel cards
