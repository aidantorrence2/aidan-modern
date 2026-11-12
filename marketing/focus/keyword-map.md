# Keyword → freebie → offer map

Source of truth for the comment-keyword funnel. The landing page (`landing/index.html`) embeds the same data in its `K` object — change both together.

Flow: viewer comments KEYWORD → auto/manual DM with the link `<landing-url>?k=KEYWORD` → opt-in page shows the checklist instantly (and emails it once `FORM_ACTION` is set) → matched offer card appears only once its affiliate link is configured.

| Keyword | Video | Freebie on page | Offer card (key) | Offer terms |
|---|---|---|---|---|
| NIGHT | 001 | 7-day bedtime phone reset | Timed lock box (`lockbox`, Amazon) | unverified |
| KIDS | 002 | Kid's phone setup, step by step | Cross-device parental controls (`aura`; alt `qustodio`) | unverified |
| FOCUS | 003 | Ready-made blocklist | Site & app blocker (`freedom`) | unverified |
| TAPS | 004 | Friction checklist | Physical app-blocking device (`brick`) | rate unverified |
| FREE | 005 | Screen Time lock (iPhone & Android) | Blocker for computer (`freedom`) | unverified |
| STUDY | 006 | 50/10 study session planner | Blocker (`freedom`) | unverified |
| MORNING | 007 | 7-day morning plan | Scheduled morning block (`freedom`) | unverified |
| FIRST | 008 | First-phone checklist + agreement template | Parental controls (`aura`) | unverified |
| QUIET | 009 | Notification cleanup checklist | none (trust builder) | n/a |
| AUTOPLAY | 010 | Autoplay-off setup guide | Per-app limits across devices (`qustodio`; alt `aura`) | unverified |
| GAMES | 012 | Game-time limits: console + phone | Cross-device limits (`qustodio`; alt `aura`) | unverified |
| TABLE | 013 | Phone-free dinner plan + dinner questions | Timed lock box (`lockbox`) | unverified |
| WEEKEND | 014 | Weekend-only social: 2-week plan | Weekday social block (`freedom`) | unverified |
| WIFI | 015 | Wi-Fi bedtime step by step | Device schedules incl. mobile data (`qustodio`; alt `aura`) | unverified |
| INBOX | 011 | Email check-in setup + auto-reply template | Scheduled email block (`freedom`) | unverified |

## DM reply template (send when someone comments the keyword)
> Here you go 👉 {landing-url}?k={KEYWORD}
> It opens straight to the checklist. (Some links on the page are affiliate links.)

Shorter variant for platforms that trim DMs:
> Your {freebie} 👉 {landing-url}?k={KEYWORD}

## Configuration (owner, at deploy time — not in this public repo)
- `FORM_ACTION`: the email tool's form POST URL. Empty = page still shows the checklist, just doesn't collect the email.
- `OFFER_LINKS.{aura,qustodio,freedom,brick,lockbox}`: affiliate links. Empty = offer card hidden (no dead links).
