# Demand log

Every offer starts here. A candidate moves to `data/offers.json` only once it passes the gate in
`flywheel/RUNBOOK.md` step 0b:

- 3 or more distinct public posts by different people, at least 2 opened, each with a short verbatim quote.
- A willingness-to-pay signal: they pay for a workaround, hire it out, or say they would pay.
- Software that one builder can ship in 1 to 3 days.
- No free tool that already solves it well.

The threads listed for each candidate are also its first leads. Replies are drafted for Aidan's
approval and never posted without it.

## Passed the gate

### Shelf Date: expiry-date tracking for Square sellers (live 18 Oct 2026)
Page: https://aidantorrence2.github.io/aidan-modern/shelf-date/ · evidence block in `data/offers.json`.
- Square Community feature request, JTPets, 16 Sep 2025, 9 kudos: "Add expiration date fields to Square's product catalog with filtering, alerts, and reporting." A Square product manager replied that "the feature totally makes sense." wfmarket, 6 Oct 2025, in the same thread.
  https://community.squareup.com/t5/Feature-Requests/Square-Feature-Request-Expiration-Date-Tracking/idi-p/810906
- Square Community thread where a seller built a paid tracker. AMFF, 13 Nov 2025: "Its much cheaper compared to Thrive." The moderator says it "has been a common request from sellers."
  https://community.squareup.com/t5/Orders-Menu-Items-Catalog/Expiration-Date-Tracking/m-p/818810
- Square Community thread with CCIptyltd (2022, 2024), ehbs (2022) and TheSAPlace (Jun 2025) asking for the same thing.
  https://community.squareup.com/t5/General-Discussion/Best-Before-Date-or-Expiry-date/td-p/344448
- Willingness to pay: a seller charges for their own tracker, and Thrive is called "both expensive and overkill."
- First leads: the sellers in these threads, and the Feature Requests and Inventory boards where they post.

### Feed Match: Merchant Center feed vs live-page audit (live 18 Oct 2026)
Page: https://aidantorrence2.github.io/aidan-modern/feed-match/ · evidence block in `data/offers.json`.
- Freelancer project 40239886, buyer paying in AUD, completed, AUD 30-250, 34 bids: "Audit every product page on the site, comparing live data."
  https://www.freelancer.in/projects/google-ads/resolve-google-merchant-data-mismatch
- Freelancer project 40200456, buyer in New Delhi, INR 12,500-37,500, 16 bids: suspended for "Misrepresentation of self or product."
  https://www.freelancer.de/projects/compliance/google-merchant-suspension-fix
- Codeur.com, France, 3 May 2022 and 28 Aug 2021, both under EUR 500: suspended for "déclaration trompeuse." The buyer is hidden, so these two may be one person.
  https://www.codeur.com/projects/338796 · https://www.codeur.com/projects/309733
- Gap: AdNabu, GMCSuspension.com and GMC Scout check store-wide policy pages. None of the pages read describe comparing each product's feed data with its live page.
- First leads: Shopify Community threads about misrepresentation suspensions, and freelancers who take these jobs.

## Candidates still short of evidence

| Candidate | Evidence found | What is missing |
|---|---|---|
| Fixed-price Shopify pick lists and packing slips | BR Pick List Pro reviews, Aug 2025: "Price doubled overnight from $10 to $20." Shopify Order Printer is rated 3.6 from 381 reviews with "No search facility" (Mar 2026). All opened. | A $1.99/month alternative already exists, so there is little room on price. Needs a sharper angle, such as a no-code template editor plus order search. |
| Shopify digital file delivery without bandwidth overage | Shopify Digital Products 1-star reviews from 2025 and 2026, plus one Sky Pilot reviewer quoting $700-1,000 bills. Opened. | Shopify's free app is rated 4.8 from 1,378 reviews, so a free tool solves it for most sellers. The overage complaint comes from one reviewer. |
| Supplier spreadsheet to Shopify import CSV | Freelancer projects at EUR 30-300 with 40-89 bids. Opened. | Two of the three posts are very likely one buyer. ColdPress, Csvio and others already exist. |
| Class and workshop rosters for Square sellers | Five Square Community threads, 2020-2025, e.g. "I am still handwriting all my class rosters." From the research pass, not yet re-opened. | Willingness to pay is weak. Re-open the threads. |
| "Items that didn't sell" report for Square | Three threads, 2022-2026. From the research pass, not yet re-opened. | A willingness-to-pay signal. Could be bundled into Shelf Date. |
| Scheduled customer statements for QuickBooks Online below the Advanced plan | Intuit Community threads, 2022-2024. Paidnice charges from $69/month. | Recent posts from 2025-2026. Intuit app review. |
| Real-time Etsy order export | Seller quotes after Etsy's 14-day CSV delay in July 2025. | Etsy API access for new apps may be closed. Check before anything else. |
| Amazon parent/child variation file builder | Freelancer posts, and Fiverr sellers with 80-280 reviews (snippet only). | Buyers pay very little, and Amazon's templates change often. |
| Notion web clipper that saves full pages | Chrome Web Store reviews of Notion's clipper, 2025-2026. | A clear willingness-to-pay signal. |
| Replacement for Gmail POP fetch | TidBITS thread, Jan 2026. | Paid entrants exist, and Google's security review makes a 1-3 day build unlikely. |

## Retired on 18 Oct 2026

All 60 offers launched on 16 to 18 Oct were retired because they came from guesses, not demand.
They stay in `data/offers.json` with `status: killed` for the record.
