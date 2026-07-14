# Ahmedabad Carousel Conversion Plan

Objective: increase completed form submissions from the Ahmedabad carousel ad.

## What Changed On Site

- `/sign-up-collab` is now Ahmedabad-specific instead of Kolkata/Kathmandu-generic.
- The first screen now says the offer plainly: free 35mm film collab in Ahmedabad.
- Location defaults to Ahmedabad and chips are now Ahmedabad-adjacent cities.
- WhatsApp is the only required lead field.
- Photos are optional before submit; the confirmation message asks for a selfie later on WhatsApp if skipped.
- Lead event still fires after a successful API response, now tagged with `campaign: ahmedabad-carousel`.

## Ad Fixes

1. Send every Ahmedabad carousel click to:
   `https://www.aidantorrence.com/sign-up-collab?utm_source=meta&utm_medium=paid_social&utm_campaign=ahmedabad_collab&utm_content=carousel`
2. Make the last carousel card match the landing page CTA:
   `Free Ahmedabad film shoot - save your spot`
3. Pin the highest-intent creative first. Use the card that shows the final outcome, not the explanation card.
4. Use copy that pre-answers anxiety:
   `Free collab shoot in Ahmedabad. No modeling experience needed. I direct posing. Public daytime shoot. Bring a friend if you want.`

## Measurement

Primary KPI: `Lead` events / landing page views.

Secondary KPIs:

- Link click to landing page view rate
- Landing page view to WhatsApp field focus
- WhatsApp field focus to submit
- Submit to actual WhatsApp reply
- Qualified lead rate after reviewing photos/Instagram

## Next Test

Run a 50/50 split for 3-5 days:

- Control: current carousel traffic to the old required-photo experience, if still available.
- Variant: Ahmedabad WhatsApp-first page.

Winning rule: keep the variant if it produces at least 30% more completed leads without dropping qualified replies by more than 20%.

## Follow-Up Iterations

- Add a dedicated `/ahmedabad-free` landing route if the same page needs to keep serving other cities.
- Add a post-submit photo uploader or WhatsApp deep link after the lead is saved.
- Add one local proof section once Ahmedabad sample shots exist.
- Retarget people who opened the form but did not submit with a "no experience needed" proof creative.
