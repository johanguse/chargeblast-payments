# Chargeblast Payments specification

Rebuild Transactions → Payments in Next.js and TypeScript. The selected list layout follows the original cramly.ai dashboard screenshot: announcement, six status cards, visible filter pills, and paired Export and Edit columns controls. The pasted brief defines behavior. The supplied screenshot is saved at docs/payments-original.png. The walkthrough was not supplied.

## Acceptance criteria

| Area | Observable result |
| --- | --- |
| Rows | Show a full payment ID, customer, amount with currency, status, method with identifying details, and creation date and time. Copy puts the full ID on the clipboard and confirms success. Hovering or focusing the timestamp reveals relative time. |
| Data | Generate 600 synthetic payments from a repeatable seed with stable IDs, several currencies, recognizable brands, last four digits, and all four required statuses. Anchor demo dates to the current day so presets have results. Format amounts using currency-specific minor units. |
| Sort | Default to newest first. Activating Created, Amount, or Status toggles direction and exposes the direction to assistive technology. Sort the entire filtered result before pagination. Compare nominal major-unit amounts across currencies and use ID to break ties. |
| Date | Today means local midnight through today. Last 7 and 30 days include today. Custom includes both selected calendar dates. Reject an end before the start. |
| Status and method | Support Succeeded, Pending, Failed, and Refunded and Card, ACH, and Wallet. Selections within a group match any selected value. Combine groups with AND. Clearing a group removes its restriction. |
| Amount and search | Minimum and maximum are inclusive and independently optional. Reject reversed bounds. Trim text and match partial payment ID, customer email, or last four digits. |
| Pagination | Offer 25, 50, and 100 rows, initially 25. Reset to page one after filters or page size change. Show the result range, disable unavailable navigation, and offer a clear action for empty results. |

## Implementation order

1. Implement the typed payment model, synthetic data and filter → sort → paginate pipeline. Check date boundaries, mixed-currency decimal scales, combined predicates, and last-page behavior.
2. Build the semantic table and controls, then reproduce the surrounding sidebar and top bar. Confirm keyboard access, visible focus, status text, and clipboard feedback.
3. Add the account menu, details route with timeline and metadata, and shareable filters as requested. Reserve time for visual review and deployment before column customization or CSV.
4. Build from a clean install, deploy, and smoke-test the public URL. Check repository visibility or reviewer access. Submit both links in the original email thread.

## Browser audit

Use the employer screenshot at its native CSS viewport and zoom. Compare the sidebar boundary, heading baseline, toolbar positions, first row, row height, column starts, badges and typography. Record discrepancies in pixels. Fix the largest repeated discrepancy first and recapture. The sample documents a 1440 × 767 sandbox, a 240 px sidebar and 14/20 px base type. Treat these as provisional when comparing against the saved screenshot.

Exercise the full path in a browser: search for a known suffix, combine two statuses with one method, bound the amount, sort, change page size, move to the final page, produce and reset an empty state, copy an ID and inspect the timestamp. Check focus after dismissing popovers with Escape. At narrow widths verify horizontal scrolling stays within the table. Inspect console errors and layout shifts. Compare the detail route and account menu if included.

## Sources

- Hiring screenshot — docs/payments-original.png (1999 × 1531).
- Local samples under ~/dev/_temp/chargeblast — implementation inspiration and provisional measurements.
- [Stripe-inspired DESIGN.md](https://www.shadcn.io/design/stripe/raw) — secondary guidance for typography, tabular figures and color.
- [Chrome browser audit case study](https://developer.chrome.com/blog/policybazaar-agentic-audit) — browser inspection, measured corrections and repeat verification.

